"""
app/services/llm_service.py

High-level LLM interpretation service.
Orchestrates prompt assembly, Gemini tool invocation, response parsing,
and Pydantic validation.
"""

import json
import logging
import time
from typing import Optional

from pydantic import ValidationError

from app import config
from app.core.exceptions import LLMServiceError
from app.schemas import AstrologyInterpretation, AstrologyProfile
from app.services.llm_prompts import build_interpretation_prompt
from app.services.reading_service import generate_structured_reading
from app.tools.llm_tool import call_gemini_api

logger = logging.getLogger("astro_teller.services.llm")


def _clean_json_output(raw_output: str) -> str:
    """Strips markdown code fences (e.g. ```json ... ```) from model response if present."""
    text = raw_output.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        # Remove opening fence (e.g. ```json or ```)
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        # Remove closing fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text


def _generate_fallback_interpretation(profile: AstrologyProfile) -> AstrologyInterpretation:
    """
    Constructs a deterministic structured interpretation using static curated text.
    Ensures system resilience if LLM is unconfigured or in offline fallback mode.
    """
    logger.info("Using deterministic fallback interpretation engine")
    base_reading = generate_structured_reading(profile)

    return AstrologyInterpretation(
        summary=base_reading.summary,
        personality=f"{base_reading.sun_interpretation} {base_reading.ascendant_interpretation}",
        strengths=[
            f"Conscious vitality and expression in {profile.sun_sign}",
            f"Intuitive and emotional instincts in {profile.moon_sign}",
            f"Lunar archetype traits in {profile.nakshatra} Nakshatra"
        ],
        areas_for_reflection=[
            f"Balancing inner emotional needs of {profile.moon_sign} with outer {profile.ascendant} presentation",
            "Cultivating patience and intentional self-reflection"
        ],
        relationships=f"Approaches connections with the emotional instincts of {profile.moon_sign} and social demeanor of {profile.ascendant}.",
        career=f"Driven by the vital spark of {profile.sun_sign} combined with Western {profile.zodiac_sign} archetypes.",
        explanation=(
            f"Vedic Sun ({profile.sun_sign}) represents conscious purpose. "
            f"Moon ({profile.moon_sign}) and Nakshatra ({profile.nakshatra}) govern the subconscious mind. "
            f"Ascendant ({profile.ascendant}) governs the physical life path."
        ),
        disclaimer=base_reading.disclaimer
    )


def generate_llm_interpretation(
    profile: AstrologyProfile,
    birth_data: dict,
    allow_fallback: bool = True
) -> AstrologyInterpretation:
    """
    Generates a structured, human-friendly interpretation of the astrological profile.

    Args:
        profile: The normalized AstrologyProfile (Sun, Moon, Nakshatra, Ascendant, Zodiac).
        birth_data: Dictionary of birth parameters (hours, minutes, coordinates, timezone).
        allow_fallback: If True, gracefully falls back to deterministic interpretation if LLM_API_KEY is not set.

    Returns:
        Validated AstrologyInterpretation Pydantic model.
    """
    # If LLM API key is not configured and fallback is allowed, return curated baseline
    if not config.LLM_API_KEY and allow_fallback:
        logger.warning("LLM_API_KEY is not set — generating baseline structured interpretation")
        return _generate_fallback_interpretation(profile)

    prompt = build_interpretation_prompt(profile, birth_data)
    start_time = time.perf_counter()

    try:
        raw_response = call_gemini_api(prompt)
    except Exception as llm_exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.warning(
            f"Gemini API call failed after {duration_ms}ms ({llm_exc.__class__.__name__}: {llm_exc}). "
            f"Falling back to deterministic interpretation."
        )
        if allow_fallback:
            return _generate_fallback_interpretation(profile)
        raise

    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    logger.info(f"Gemini interpretation received in {duration_ms}ms")

    # Clean code blocks if present
    cleaned_json = _clean_json_output(raw_response)

    try:
        parsed_data = json.loads(cleaned_json)
    except json.JSONDecodeError as exc:
        logger.error(f"Failed to parse LLM response as JSON: {exc}")
        if allow_fallback:
            logger.warning("Falling back to deterministic interpretation after JSON parse failure")
            return _generate_fallback_interpretation(profile)
        raise LLMServiceError("The interpretation service returned non-JSON text.")

    try:
        interpretation = AstrologyInterpretation.model_validate(parsed_data)
        logger.info("Successfully validated Gemini structured interpretation with Pydantic")
        return interpretation
    except ValidationError as val_err:
        logger.error(f"Pydantic validation failed on LLM interpretation: {val_err.errors()}")
        if allow_fallback:
            logger.warning("Falling back to deterministic interpretation after schema validation failure")
            return _generate_fallback_interpretation(profile)
        raise LLMServiceError(
            message="Interpretation response did not match the expected schema.",
            details=val_err.errors()
        )
