"""
app/services/reading_service.py

Assembles structured, archetypal astrology interpretations.
"""

from app.data.interpretations import (
    SUN_SIGN_INTERPRETATIONS,
    MOON_SIGN_INTERPRETATIONS,
    ASCENDANT_INTERPRETATIONS,
    DEFAULT_NAKSHATRA_INTERPRETATION,
    DISCLAIMER_TEXT
)
from app.schemas import AstrologyProfile, StructuredReading


def generate_structured_reading(profile: AstrologyProfile) -> StructuredReading:
    """
    Builds a clean, structured reading object with individual components.
    """
    sun_text = SUN_SIGN_INTERPRETATIONS.get(
        profile.sun_sign,
        f"Your Sun is in {profile.sun_sign}, highlighting your central vitality and conscious identity."
    )

    moon_text = MOON_SIGN_INTERPRETATIONS.get(
        profile.moon_sign,
        f"Your Moon is in {profile.moon_sign}, shaping emotional instincts, habits, and inner security."
    )

    asc_text = ASCENDANT_INTERPRETATIONS.get(
        profile.ascendant,
        f"Your Ascendant in {profile.ascendant} governs your social demeanor and approach to life."
    )

    nakshatra_text = (
        f"Your Moon resides in {profile.nakshatra} Nakshatra. "
        f"{DEFAULT_NAKSHATRA_INTERPRETATION}"
    )

    summary = (
        f"Astrological Profile: Sun in {profile.sun_sign}, Moon in {profile.moon_sign}, "
        f"Ascendant in {profile.ascendant}, with Western solar sign of {profile.zodiac_sign}."
    )

    overall = (
        f"The harmony between your {profile.sun_sign} vitality, {profile.moon_sign} emotional core, "
        f"and {profile.ascendant} outer approach forms a unique pattern of motivation, creativity, "
        f"and life reflection."
    )

    return StructuredReading(
        summary=summary,
        sun_interpretation=sun_text,
        moon_interpretation=moon_text,
        nakshatra_interpretation=nakshatra_text,
        ascendant_interpretation=asc_text,
        overall_interpretation=overall,
        disclaimer=DISCLAIMER_TEXT
    )
