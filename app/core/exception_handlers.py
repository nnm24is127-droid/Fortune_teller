"""
app/core/exception_handlers.py

Centralized exception handlers to enforce uniform JSON error payloads across AstroTeller.
"""

import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import AppException


logger = logging.getLogger("astro_teller.exceptions")


def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        request_id = getattr(request.state, "request_id", "unknown")
        
        if exc.status_code >= 500:
            logger.error(f"[{request_id}] {exc.error_code}: {exc.message}")
        else:
            logger.warning(f"[{request_id}] {exc.error_code} ({exc.status_code}): {exc.message}")

        headers = {}
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            headers["WWW-Authenticate"] = "Bearer"
            
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.error_code,
                "message": exc.message,
                "details": exc.details
            },
            headers=headers
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        request_id = getattr(request.state, "request_id", "unknown")
        details = {}
        for err in exc.errors():
            loc = err.get("loc", [])
            field = " -> ".join(str(item) for item in loc if item not in ("body", "query", "path"))
            msg = err.get("msg", "Invalid value")
            if msg.startswith("Value error, "):
                msg = msg.replace("Value error, ", "")
            details[field or "request"] = msg

        logger.warning(f"[{request_id}] VALIDATION_ERROR: {details}")

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "VALIDATION_ERROR",
                "message": "Invalid request data.",
                "details": details
            }
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        request_id = getattr(request.state, "request_id", "unknown")
        error_code = "HTTP_ERROR"
        if exc.status_code == 401:
            error_code = "UNAUTHORIZED"
        elif exc.status_code == 403:
            error_code = "FORBIDDEN"
        elif exc.status_code == 404:
            error_code = "RESOURCE_NOT_FOUND"

        logger.warning(f"[{request_id}] HTTP {exc.status_code}: {exc.detail}")

        headers = getattr(exc, "headers", None) or {}
        if exc.status_code == 401 and "WWW-Authenticate" not in headers:
            headers["WWW-Authenticate"] = "Bearer"

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": error_code,
                "message": exc.detail,
                "details": None
            },
            headers=headers
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        request_id = getattr(request.state, "request_id", "unknown")
        logger.exception(f"[{request_id}] Database failure occurred: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "DATABASE_ERROR",
                "message": "A database error occurred.",
                "details": None
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", "unknown")
        logger.exception(f"[{request_id}] Unhandled server exception: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred.",
                "details": None
            }
        )
