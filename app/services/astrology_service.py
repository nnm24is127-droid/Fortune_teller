"""
app/services/astrology_service.py

Coordinates the generation of astrology profiles and structured readings.
"""

import logging

from app.schemas import AstrologyInterpretation, AstrologyProfile, StructuredReading
from app.services.llm_service import generate_llm_interpretation
from app.services.reading_service import generate_structured_reading
from app.tools.astrology_tool import fetch_kundali
from app.tools.zodiac_tool import calculate_zodiac


logger = logging.getLogger("astro_teller.services.astrology")


def generate_astrology_profile(
    year: int,
    month: int,
    date: int,
    hours: int,
    minutes: int,
    latitude: float,
    longitude: float,
    timezone: float
) -> tuple[AstrologyProfile, dict]:
    logger.debug(f"Calculating Western zodiac sign for month={month}, date={date}")
    zodiac_sign = calculate_zodiac(month, date)

    raw_data = fetch_kundali(
        year=year,
        month=month,
        date=date,
        hours=hours,
        minutes=minutes,
        latitude=latitude,
        longitude=longitude,
        timezone=timezone
    )

    output = raw_data.get("output", {})
    ascendant_info = output.get("ascendant", {})
    planets = output.get("planets", {})
    moon_info = planets.get("Moon", {})
    sun_info = planets.get("Sun", {})

    profile = AstrologyProfile(
        zodiac_sign=zodiac_sign,
        sun_sign=sun_info.get("zodiac_sign_name", "Unknown"),
        moon_sign=moon_info.get("zodiac_sign_name", "Unknown"),
        nakshatra=moon_info.get("nakshatra_name", "Unknown"),
        ascendant=ascendant_info.get("zodiac_sign_name", "Unknown")
    )

    logger.info(
        f"Astrology profile parsed: Sun={profile.sun_sign}, "
        f"Moon={profile.moon_sign}, Nakshatra={profile.nakshatra}, Asc={profile.ascendant}"
    )

    return profile, raw_data


def generate_reading_for_birth_data(
    year: int,
    month: int,
    date: int,
    hours: int,
    minutes: int,
    latitude: float,
    longitude: float,
    timezone: float
) -> tuple[AstrologyProfile, AstrologyInterpretation]:
    profile, _ = generate_astrology_profile(
        year=year,
        month=month,
        date=date,
        hours=hours,
        minutes=minutes,
        latitude=latitude,
        longitude=longitude,
        timezone=timezone
    )

    birth_data = {
        "year": year,
        "month": month,
        "date": date,
        "hours": hours,
        "minutes": minutes,
        "latitude": latitude,
        "longitude": longitude,
        "timezone": timezone
    }

    interpretation = generate_llm_interpretation(profile, birth_data)
    logger.info(f"AI structured reading generated successfully for Sun in {profile.sun_sign}")
    return profile, interpretation