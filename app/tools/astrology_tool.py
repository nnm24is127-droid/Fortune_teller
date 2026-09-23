"""
app/tools/astrology_tool.py

Low-level HTTP client for the Navamsha Astrology API.
"""

import logging
import requests

from app.config import ASTROLOGY_API_KEY, ASTROLOGY_API_TIMEOUT
from app.core.exceptions import ExternalAPIError


logger = logging.getLogger("astro_teller.astrology_tool")

BASE_URL = "https://api.navamsha.in"
KUNDALI_ENDPOINT = "/api/v1/kundali/basic"


def fetch_kundali(
    year: int,
    month: int,
    date: int,
    hours: int,
    minutes: int,
    latitude: float,
    longitude: float,
    timezone: float
) -> dict:
    if not ASTROLOGY_API_KEY or ASTROLOGY_API_KEY == "your_navamsha_api_key_here":
        raise ExternalAPIError("ASTROLOGY_API_KEY is not configured in .env. Please add a valid Navamsha API key.")

    url = BASE_URL + KUNDALI_ENDPOINT

    headers = {
        "X-API-Key": ASTROLOGY_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "year": year,
        "month": month,
        "date": date,
        "hours": hours,
        "minutes": minutes,
        "seconds": 0,
        "latitude": latitude,
        "longitude": longitude,
        "timezone": timezone,
        "settings": {
            "observation_point": "topocentric",
            "ayanamsha": "lahiri",
            "language": "en"
        }
    }

    logger.info(
        f"Calling Navamsha API ({KUNDALI_ENDPOINT}) for date={year}-{month:02d}-{date:02d} "
        f"(timeout={ASTROLOGY_API_TIMEOUT}s)"
    )

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=ASTROLOGY_API_TIMEOUT
        )
    except requests.exceptions.Timeout:
        logger.warning(
            f"Navamsha API timed out after {ASTROLOGY_API_TIMEOUT}s "
            f"for date={year}-{month}-{date}"
        )
        raise ExternalAPIError(
            message="The astrology service timed out. Please try again shortly.",
            error_code="ASTROLOGY_SERVICE_TIMEOUT",
            status_code=502
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Navamsha API request failed: {type(e).__name__}")
        raise ExternalAPIError(
            message="The astrology service is temporarily unavailable.",
            error_code="ASTROLOGY_SERVICE_ERROR",
            status_code=502
        )

    if response.status_code in (401, 403):
        logger.error(
            f"Navamsha API authentication rejected with status={response.status_code}"
        )
        raise ExternalAPIError(
            message="Astrology service authorization failed. Please contact the administrator.",
            error_code="ASTROLOGY_SERVICE_AUTH_ERROR",
            status_code=502
        )

    if response.status_code == 429:
        logger.warning("Navamsha API rate limit exceeded (HTTP 429)")
        raise ExternalAPIError(
            message="The astrology service rate limit has been reached. Please try again later.",
            error_code="ASTROLOGY_SERVICE_RATE_LIMIT",
            status_code=502
        )

    if response.status_code >= 400:
        logger.warning(f"Navamsha API returned error status={response.status_code}")
        raise ExternalAPIError(
            message="The astrology service could not process the provided birth coordinates.",
            error_code="ASTROLOGY_SERVICE_ERROR",
            status_code=502
        )

    try:
        data = response.json()
        logger.info(
            f"Navamsha API request completed successfully (status={response.status_code})"
        )
    except Exception:
        logger.error("Failed to parse JSON response from Navamsha API")
        raise ExternalAPIError(
            message="Malformed response received from astrology service.",
            error_code="ASTROLOGY_SERVICE_MALFORMED",
            status_code=502
        )

    return data
