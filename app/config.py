import os
import logging
from dotenv import load_dotenv

# Load environment variables, overriding existing os.environ with latest .env values
load_dotenv(override=True)

logger = logging.getLogger("astro_teller.config")

ASTROLOGY_API_KEY = os.getenv("ASTROLOGY_API_KEY", "").strip()
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey1234567890astroteller").strip()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./astro_teller.db"
).strip()

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper().strip()

# Timeout (in seconds) for calls to the external Navamsha Astrology API.
ASTROLOGY_API_TIMEOUT = int(os.getenv("ASTROLOGY_API_TIMEOUT", "15"))

# LLM (Gemini AI) Configuration
LLM_API_KEY = os.getenv("LLM_API_KEY", "").strip()
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.6-flash").strip()
LLM_TIMEOUT = int(os.getenv("LLM_TIMEOUT", "30"))
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://generativelanguage.googleapis.com/v1beta").strip()

# Comma-separated list of origins allowed for CORS (for frontend integration).
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]

if not ASTROLOGY_API_KEY or ASTROLOGY_API_KEY == "your_navamsha_api_key_here":
    logger.warning("ASTROLOGY_API_KEY is not set or using placeholder in .env. External astrology API calls will fail.")

if not SECRET_KEY:
    logger.warning("SECRET_KEY is empty. Using default fallback key.")