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
    Constructs a plain-English, friendly structured interpretation.
    Ensures system resilience if LLM is unconfigured or in offline fallback mode.
    """
    logger.info("Using deterministic fallback interpretation engine")
    base_reading = generate_structured_reading(profile)

    sun = profile.sun_sign
    moon = profile.moon_sign
    asc = profile.ascendant
    nak = profile.nakshatra
    zodiac = profile.zodiac_sign

    return AstrologyInterpretation(
        summary=(
            f"You were born with your Sun in {sun}, your Moon in {moon}, and {asc} as your Rising sign — "
            f"a combination that makes you someone who is driven, deeply feeling, and genuinely one-of-a-kind. "
            f"Your chart tells the story of a person with real inner strength and a lot to offer the world."
        ),
        personality=(
            f"At your core, you carry the energy of {sun} — which means you naturally bring boldness, "
            f"enthusiasm, and a strong sense of who you are into everything you do. "
            f"On the inside, your Moon in {moon} means your emotional world is rich and complex — "
            f"you feel things more deeply than most people realise. "
            f"When people first meet you, they see your {asc} Rising side — the face you show the world — "
            f"which gives you a distinctive first impression that often sticks with people."
        ),
        strengths=[
            f"You have a natural boldness and confidence from your Sun in {sun} — when you set your mind on something, you go for it wholeheartedly.",
            f"Your Moon in {moon} gives you powerful emotional intelligence — you sense what others are feeling, often before they say a word.",
            f"People around you notice your {asc} energy — there's something about the way you carry yourself that draws others in and makes them feel at ease."
        ],
        areas_for_reflection=[
            f"You might sometimes find that the intensity of your Moon in {moon} pulls you inward — it's worth pausing to share what you're feeling instead of carrying it alone.",
            f"One thing worth exploring is finding the balance between your inner emotional world ({moon}) and the confident, outward-facing version of you that others see ({asc}) — both sides are real and valuable."
        ],
        relationships=(
            f"In relationships, your Moon in {moon} means you care deeply and feel things strongly — "
            f"loyalty and emotional honesty matter a lot to you. "
            f"Your {asc} Rising shapes how you come across to others at first — "
            f"and once people get to know the real you, they find someone with far more depth than they expected. "
            f"You connect best with people who appreciate sincerity and aren't afraid of real conversations."
        ),
        career=(
            f"Your Sun in {sun} gives you a drive and energy that makes you well-suited to roles where you can take initiative and make things happen. "
            f"You're not someone who thrives sitting on the sidelines — you want to be involved, to lead, to create. "
            f"Your {nak} Nakshatra adds a layer of focus and dedication to your work style, "
            f"meaning when you care about something, you pour yourself into it completely."
        ),
        explanation=(
            f"Think of your birth chart like a snapshot of the sky the moment you were born. "
            f"Your Sun sign ({sun}) shows your core drive — it's your 'engine'. "
            f"Your Moon sign ({moon}) reveals your emotional inner world — how you feel and react privately. "
            f"Your Rising sign ({asc}) is how you appear to others — your 'first impression'. "
            f"Your Nakshatra ({nak}) adds finer detail to your Moon, like a zoom-in on your emotional personality."
        ),
        disclaimer="This reading is for fun, self-reflection, and personal inspiration — not a prediction of your future. You always have the power to shape your own path."
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
