"""
app/main.py

AstroTeller FastAPI application entry point.
Configures logging, middleware, exception handlers, routers, and OpenAPI metadata.
"""

import logging
import time
import uuid

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware

from app.config import ALLOWED_ORIGINS
from app.core.exception_handlers import setup_exception_handlers
from app.core.logging_config import setup_logging
from app.database import Base, engine, get_db

from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.astrology_routes import router as astrology_router
from app.routes.astrologer_routes import router as astrologer_router
from app.routes.admin_routes import router as admin_router


# Initialize logging before FastAPI app creation
setup_logging()
logger = logging.getLogger("astro_teller.http")

Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# OpenAPI tag metadata (controls Swagger tag order and descriptions)
# ---------------------------------------------------------------------------
OPENAPI_TAGS = [
    {
        "name": "Authentication",
        "description": "Register a new account and log in to receive a JWT access token."
    },
    {
        "name": "Users",
        "description": "Retrieve your own user profile."
    },
    {
        "name": "Astrology",
        "description": "Generate astrology readings from birth data and view reading history."
    },
    {
        "name": "Astrologer",
        "description": (
            "Professional review queue for astrologers and admins. "
            "Browse readings and add interpretation notes."
        )
    },
    {
        "name": "Admin",
        "description": "User management tools available to the admin role only."
    },
]

app = FastAPI(
    title="AstroTeller 🔮",
    description=(
        "An astrology-themed entertainment application powered by the "
        "[Navamsha Astrology API](https://navamsha.in).\n\n"
        "**Authentication**: Click the **Authorize** button and enter your JWT token "
        "as `Bearer <your_token>`. Obtain a token from `POST /auth/login`."
    ),
    version="1.0.0",
    openapi_tags=OPENAPI_TAGS,
)

# Register centralized exception handlers
setup_exception_handlers(app)


# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = uuid.uuid4().hex[:8]
        request.state.request_id = request_id
        start_time = time.perf_counter()

        response = await call_next(request)

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = request_id

        # Skip noisy automatic docs assets
        if not request.url.path.startswith(("/docs", "/openapi.json", "/favicon.ico", "/redoc")):
            status_code = response.status_code
            log_msg = (
                f"[{request_id}] {request.method} {request.url.path} "
                f"-> {status_code} ({duration_ms}ms)"
            )
            if status_code >= 500:
                logger.error(log_msg)
            elif status_code >= 400:
                logger.warning(log_msg)
            else:
                logger.info(log_msg)

        return response


app.add_middleware(RequestLoggingMiddleware)

# ---------------------------------------------------------------------------
# CORS middleware (allows frontend on Vite port 5173 / localhost:3000)
# Supports WSL2 dynamic IPs (172.x.x.x), local network (192.168.x.x, 10.x.x.x)
# ---------------------------------------------------------------------------
_explicit_origins = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

# Regex covers: localhost, 127.x, 172.x (WSL2), 192.168.x, 10.x — any port
_LOCAL_ORIGIN_REGEX = (
    r"^https?://(localhost|127\.\d+\.\d+\.\d+"
    r"|172\.\d+\.\d+\.\d+"
    r"|192\.168\.\d+\.\d+"
    r"|10\.\d+\.\d+\.\d+)(:\d+)?$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_explicit_origins or ["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=_LOCAL_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(astrology_router)
app.include_router(astrologer_router)
app.include_router(admin_router)


# ---------------------------------------------------------------------------
# Root and health endpoints
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
def home():
    return {
        "application": "AstroTeller",
        "version": "1.0.0",
        "message": "Welcome to AstroTeller 🔮",
        "docs": "/docs"
    }


@app.get(
    "/health",
    tags=["Health"],
    summary="Liveness check",
    description=(
        "**Liveness probe**: confirms the application process is running. "
        "Always returns `200 OK` with `{\"status\": \"healthy\"}` if the server is alive. "
        "Does **not** check external dependencies — use `/health/ready` for that."
    ),
    status_code=status.HTTP_200_OK,
)
def health():
    return {"status": "healthy"}


@app.get(
    "/health/ready",
    tags=["Health"],
    summary="Readiness check",
    description=(
        "**Readiness probe**: confirms the application is ready to serve traffic. "
        "Performs a lightweight database connectivity check (`SELECT 1`). "
        "Returns `200 OK` when all critical dependencies are reachable, "
        "or `503 Service Unavailable` if the database cannot be reached. "
        "Does **not** call the external Navamsha API."
    ),
    status_code=status.HTTP_200_OK,
)
def health_ready():
    # Lightweight DB check — a single SELECT 1, no table scans
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except SQLAlchemyError:
        logger.error("Readiness check failed: database connection error")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unavailable",
                "database": "error"
            }
        )
    finally:
        try:
            db.close()
        except Exception:
            pass

    return {
        "status": "ready",
        "database": db_status
    }


# ---------------------------------------------------------------------------
# OpenAPI security scheme — makes the Swagger Authorize button work correctly
# ---------------------------------------------------------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        tags=OPENAPI_TAGS,
        routes=app.routes,
    )

    schema.setdefault("components", {})
    schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": (
                "Enter your JWT token. Obtain one from `POST /auth/login` or "
                "`POST /auth/register`."
            )
        }
    }
    schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi