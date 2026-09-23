"""
tests/test_error_handling.py

Tests external API mock failures and sanitized error responses.
"""

from app.core.exceptions import ExternalAPIError


def test_navamsha_timeout_error(client, user_headers, monkeypatch):
    def fake_timeout(*args, **kwargs):
        raise ExternalAPIError(
            message="The astrology service timed out. Please try again shortly.",
            error_code="ASTROLOGY_SERVICE_TIMEOUT",
            status_code=502
        )

    monkeypatch.setattr("app.services.astrology_service.fetch_kundali", fake_timeout)

    payload = {
        "year": 1995, "month": 8, "date": 15,
        "hours": 14, "minutes": 30,
        "latitude": 19.0760, "longitude": 72.8777, "timezone": 5.5
    }
    response = client.post("/astrology/reading", json=payload, headers=user_headers)
    assert response.status_code == 502
    data = response.json()
    assert data["error"] == "ASTROLOGY_SERVICE_TIMEOUT"
    assert "timed out" in data["message"]
    # Ensure no secrets or tracebacks are leaked
    assert "ASTROLOGY_API_KEY" not in str(data)
    assert "Traceback" not in str(data)


def test_navamsha_rate_limit_error(client, user_headers, monkeypatch):
    def fake_rate_limit(*args, **kwargs):
        raise ExternalAPIError(
            message="The astrology service rate limit has been reached. Please try again later.",
            error_code="ASTROLOGY_SERVICE_RATE_LIMIT",
            status_code=502
        )

    monkeypatch.setattr("app.services.astrology_service.fetch_kundali", fake_rate_limit)

    payload = {
        "year": 1995, "month": 8, "date": 15,
        "hours": 14, "minutes": 30,
        "latitude": 19.0760, "longitude": 72.8777, "timezone": 5.5
    }
    response = client.post("/astrology/reading", json=payload, headers=user_headers)
    assert response.status_code == 502
    data = response.json()
    assert data["error"] == "ASTROLOGY_SERVICE_RATE_LIMIT"


def test_error_response_never_contains_secret_key(client, user_headers, monkeypatch):
    """SECRET_KEY must never appear in any error response."""
    def fake_error(*args, **kwargs):
        raise ExternalAPIError(
            message="Generic error.",
            error_code="ASTROLOGY_SERVICE_ERROR",
            status_code=502
        )

    monkeypatch.setattr("app.services.astrology_service.fetch_kundali", fake_error)

    payload = {
        "year": 1995, "month": 8, "date": 15,
        "hours": 14, "minutes": 30,
        "latitude": 19.0760, "longitude": 72.8777, "timezone": 5.5
    }
    response = client.post("/astrology/reading", json=payload, headers=user_headers)
    body = response.text
    assert "SECRET_KEY" not in body
    assert "password_hash" not in body
    assert "ASTROLOGY_API_KEY" not in body
