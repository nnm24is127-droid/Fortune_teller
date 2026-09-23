"""
app/tools/llm_tool.py

Low-level client for Google Gemini AI REST API.
Handles HTTP communication, timeouts, error translation, and safety boundaries.
"""

import logging
import requests

from app.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_TIMEOUT
from app.core.exceptions import (
    LLMConfigurationError,
    LLMServiceError,
    LLMTimeoutError,
)

logger = logging.getLogger("astro_teller.tools.llm")


def call_gemini_api(prompt: str) -> str:
    """
    Calls the Google Gemini REST API to generate content given a prompt.
    Returns the raw string output (expected to be JSON).

    Raises:
        LLMConfigurationError: If LLM_API_KEY is not configured.
        LLMTimeoutError: If the Gemini API call times out.
        LLMServiceError: If an HTTP or service error occurs.
    """
    if not LLM_API_KEY:
        logger.error("Attempted to invoke LLM but LLM_API_KEY is missing from environment.")
        raise LLMConfigurationError("LLM_API_KEY is not configured on the server.")

    url = f"{LLM_BASE_URL.rstrip('/')}/models/{LLM_MODEL}:generateContent?key={LLM_API_KEY}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    logger.info(f"Sending interpretation prompt to Gemini API [model={LLM_MODEL}]")

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=LLM_TIMEOUT
        )
    except requests.exceptions.Timeout:
        logger.error(f"Gemini API request timed out after {LLM_TIMEOUT}s")
        raise LLMTimeoutError("The interpretation service timed out. Please try again.")
    except requests.exceptions.RequestException as exc:
        logger.error(f"Network error connecting to Gemini API: {exc.__class__.__name__}")
        raise LLMServiceError("Failed to connect to the interpretation service.")

    if response.status_code == 429:
        logger.warning("Gemini API rate limit exceeded")
        raise LLMServiceError("The interpretation service is currently rate limited. Please try again in a moment.")

    if response.status_code in (401, 403):
        logger.error(f"Gemini API authentication failed (status {response.status_code})")
        raise LLMServiceError("Interpretation service authorization failure.")

    if not response.ok:
        logger.error(f"Gemini API returned error status {response.status_code}")
        raise LLMServiceError(f"Interpretation service returned status code {response.status_code}.")

    try:
        data = response.json()
        candidates = data.get("candidates", [])
        if not candidates:
            # Check if promptFeedback indicates a block reason
            feedback = data.get("promptFeedback", {})
            block_reason = feedback.get("blockReason", "UNKNOWN")
            logger.error(f"Gemini response contained zero candidates. Block reason: {block_reason}")
            raise LLMServiceError(f"Interpretation service blocked the request (reason: {block_reason}).")

        candidate = candidates[0]
        finish_reason = candidate.get("finishReason", "")
        if finish_reason in ("SAFETY", "OTHER", "RECITATION", "PROHIBITED_CONTENT"):
            logger.warning(f"Gemini returned finishReason={finish_reason} with no usable output")
            raise LLMServiceError(f"Interpretation service could not generate output (finishReason: {finish_reason}).")

        parts = candidate.get("content", {}).get("parts", [])
        if not parts or "text" not in parts[0]:
            logger.error(f"Gemini candidate parts did not contain text (finishReason={finish_reason})")
            raise LLMServiceError("Interpretation service returned invalid content structure.")

        raw_text = parts[0]["text"]
        logger.debug(f"Received {len(raw_text)} bytes of interpretation from Gemini")
        return raw_text

    except Exception as exc:
        if isinstance(exc, LLMServiceError):
            raise
        logger.exception("Failed to parse Gemini API JSON response")
        raise LLMServiceError("Unable to parse response from interpretation service.")
