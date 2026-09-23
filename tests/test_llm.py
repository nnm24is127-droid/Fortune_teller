"""
tests/test_llm.py

Automated tests for Gemini LLM interpretation integration.
Mocks all external calls to ensure fast, deterministic, offline execution.
"""

import json
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
import requests

from app.core.exceptions import LLMServiceError, LLMTimeoutError, LLMConfigurationError
from app.schemas import AstrologyInterpretation, AstrologyProfile
from app.services.llm_service import generate_llm_interpretation
from app.tools.llm_tool import call_gemini_api


SAMPLE_GEMINI_OUTPUT = json.dumps({
    "summary": "A dynamic blend of fiery solar ambition and grounded lunar sensibility.",
    "personality": "You possess natural leadership qualities balanced by thoughtful emotional instincts.",
    "strengths": [
        "Innate creative drive and determination",
        "Clear communicative clarity in partnerships",
        "Steadfast loyalty to core values"
    ],
    "areas_for_reflection": [
        "Patience when outcomes are delayed",
        "Mindful balance between personal ambitions and collective harmony"
    ],
    "relationships": "Seek deep mutual respect and open intellectual conversations.",
    "career": "Thrives in innovative, autonomous environments where initiative is rewarded.",
    "explanation": "Your Sun in Leo fuels vitality while Moon in Taurus provides emotional stability.",
    "disclaimer": "For self-reflection and entertainment only."
})


@pytest.fixture
def mock_profile():
    return AstrologyProfile(
        zodiac_sign="Leo",
        sun_sign="Leo",
        moon_sign="Taurus",
        nakshatra="Rohini",
        ascendant="Aries"
    )


@pytest.fixture
def sample_birth_data():
    return {
        "year": 1995,
        "month": 8,
        "date": 15,
        "hours": 10,
        "minutes": 30,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "timezone": 5.5
    }


# ---------------------------------------------------------------------------
# 1. LLM Tool Tests
# ---------------------------------------------------------------------------

def test_gemini_tool_missing_api_key(monkeypatch):
    monkeypatch.setattr("app.tools.llm_tool.LLM_API_KEY", "")
    with pytest.raises(LLMConfigurationError):
        call_gemini_api("test prompt")


def test_gemini_tool_success(monkeypatch):
    monkeypatch.setattr("app.tools.llm_tool.LLM_API_KEY", "fake_key_123")

    mock_resp = MagicMock()
    mock_resp.ok = True
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": SAMPLE_GEMINI_OUTPUT}]
                }
            }
        ]
    }

    with patch("requests.post", return_value=mock_resp) as mock_post:
        result = call_gemini_api("Analyze chart")
        assert result == SAMPLE_GEMINI_OUTPUT
        assert mock_post.called


def test_gemini_tool_timeout(monkeypatch):
    monkeypatch.setattr("app.tools.llm_tool.LLM_API_KEY", "fake_key_123")

    with patch("requests.post", side_effect=requests.exceptions.Timeout):
        with pytest.raises(LLMTimeoutError):
            call_gemini_api("Analyze chart")


def test_gemini_tool_rate_limit(monkeypatch):
    monkeypatch.setattr("app.tools.llm_tool.LLM_API_KEY", "fake_key_123")

    mock_resp = MagicMock()
    mock_resp.ok = False
    mock_resp.status_code = 429

    with patch("requests.post", return_value=mock_resp):
        with pytest.raises(LLMServiceError) as exc_info:
            call_gemini_api("Analyze chart")
        assert "rate limit" in str(exc_info.value).lower()


# ---------------------------------------------------------------------------
# 2. LLM Service Validation Tests
# ---------------------------------------------------------------------------

def test_llm_service_successful_validation(mock_profile, sample_birth_data, monkeypatch):
    monkeypatch.setattr("app.config.LLM_API_KEY", "fake_key_123")

    with patch("app.services.llm_service.call_gemini_api", return_value=SAMPLE_GEMINI_OUTPUT):
        interpretation = generate_llm_interpretation(mock_profile, sample_birth_data)
        assert isinstance(interpretation, AstrologyInterpretation)
        assert len(interpretation.strengths) == 3
        assert len(interpretation.areas_for_reflection) == 2
        assert "Leo" in interpretation.explanation


def test_llm_service_malformed_json_fallback(mock_profile, sample_birth_data, monkeypatch):
    monkeypatch.setattr("app.config.LLM_API_KEY", "fake_key_123")

    with patch("app.services.llm_service.call_gemini_api", return_value="Invalid Non-JSON response"):
        # With fallback enabled (default), should safely return deterministic interpretation
        interpretation = generate_llm_interpretation(mock_profile, sample_birth_data, allow_fallback=True)
        assert isinstance(interpretation, AstrologyInterpretation)
        assert interpretation.summary is not None


def test_llm_service_validation_error_no_fallback(mock_profile, sample_birth_data, monkeypatch):
    monkeypatch.setattr("app.config.LLM_API_KEY", "fake_key_123")

    # Incomplete schema missing required fields
    incomplete_json = json.dumps({"summary": "Only summary provided"})

    with patch("app.services.llm_service.call_gemini_api", return_value=incomplete_json):
        with pytest.raises(LLMServiceError):
            generate_llm_interpretation(mock_profile, sample_birth_data, allow_fallback=False)


# ---------------------------------------------------------------------------
# 3. Full API Endpoint Integration with Mocked LLM
# ---------------------------------------------------------------------------

def test_create_reading_with_mocked_llm(client: TestClient, monkeypatch):
    # 1. Register and login
    client.post("/auth/register", json={
        "username": "llmuser",
        "email": "llmuser@example.com",
        "password": "password123"
    })
    login_resp = client.post("/auth/login", json={
        "username": "llmuser",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # 2. Mock Navamsha API and LLM
    mock_navamsha = {
        "output": {
            "ascendant": {"zodiac_sign_name": "Aries"},
            "planets": {
                "Sun": {"zodiac_sign_name": "Leo"},
                "Moon": {"zodiac_sign_name": "Taurus", "nakshatra_name": "Rohini"}
            }
        }
    }

    with patch("app.services.astrology_service.fetch_kundali", return_value=mock_navamsha):
        with patch("app.services.llm_service.call_gemini_api", return_value=SAMPLE_GEMINI_OUTPUT):
            monkeypatch.setattr("app.config.LLM_API_KEY", "test_gemini_key")

            response = client.post(
                "/astrology/reading",
                json={
                    "year": 1995,
                    "month": 8,
                    "date": 15,
                    "hours": 10,
                    "minutes": 30,
                    "latitude": 28.6139,
                    "longitude": 77.2090,
                    "timezone": 5.5
                },
                headers=auth_headers
            )

            assert response.status_code == 201
            body = response.json()
            assert body["message"] == "Reading generated successfully 🔮"
            assert body["profile"]["sun_sign"] == "Leo"
            assert body["profile"]["moon_sign"] == "Taurus"
            
            # Check interpretation in response
            interp = body.get("interpretation") or body.get("reading")
            assert interp is not None
            assert "summary" in interp
            assert "personality" in interp
            assert "strengths" in interp

            # 3. Verify reading history retrieves from DB without re-calling LLM
            with patch("app.services.llm_service.call_gemini_api") as llm_mock_recheck:
                history_resp = client.get("/astrology/history", headers=auth_headers)
                assert history_resp.status_code == 200
                history_items = history_resp.json()["items"]
                assert len(history_items) == 1
                assert history_items[0]["zodiac_sign"] is not None
                # Verify LLM was NOT called again during history fetch
                assert not llm_mock_recheck.called
