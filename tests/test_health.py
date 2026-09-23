"""
tests/test_health.py

Tests the liveness and readiness health check endpoints.

Liveness  (GET /health):       Is the process alive?
Readiness (GET /health/ready): Can the app serve traffic? (DB check)
"""


def test_health_liveness(client):
    """GET /health must always return 200 OK with status=healthy."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_health_liveness_no_auth_required(client):
    """Health endpoint must be accessible without any authentication."""
    # No headers provided at all — should still succeed
    response = client.get("/health")
    assert response.status_code == 200


def test_health_readiness(client):
    """GET /health/ready must return 200 OK with database=ok when DB is reachable."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] == "ok"


def test_health_readiness_no_auth_required(client):
    """Readiness endpoint must be accessible without any authentication."""
    response = client.get("/health/ready")
    assert response.status_code == 200


def test_health_readiness_response_shape(client):
    """Readiness response must include both status and database fields."""
    response = client.get("/health/ready")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "database" in data
