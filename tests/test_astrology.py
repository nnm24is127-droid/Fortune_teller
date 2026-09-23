"""
tests/test_astrology.py

Tests reading creation, validation, pagination, filtering, sorting,
and user history isolation.
"""

READING_PAYLOAD = {
    "year": 1995,
    "month": 8,
    "date": 15,
    "hours": 14,
    "minutes": 30,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "timezone": 5.5
}


def test_create_reading_success(client, user_headers, mock_navamsha_kundali):
    response = client.post("/astrology/reading", json=READING_PAYLOAD, headers=user_headers)
    # Creating a new resource → 201 Created
    assert response.status_code == 201
    data = response.json()
    assert "reading_id" in data
    assert data["profile"]["sun_sign"] == "Leo"
    assert data["profile"]["moon_sign"] == "Aries"
    assert data["profile"]["nakshatra"] == "Ashwini"
    assert data["profile"]["ascendant"] == "Scorpio"
    assert "summary" in data["reading"]
    assert "disclaimer" in data["reading"]


def test_create_reading_unauthenticated(client):
    response = client.post("/astrology/reading", json=READING_PAYLOAD)
    assert response.status_code == 401


def test_create_reading_invalid_date_feb_31(client, user_headers):
    payload = {**READING_PAYLOAD, "month": 2, "date": 31}
    response = client.post("/astrology/reading", json=payload, headers=user_headers)
    assert response.status_code == 422
    assert response.json()["error"] == "VALIDATION_ERROR"


def test_create_reading_invalid_coordinates(client, user_headers):
    payload = {**READING_PAYLOAD, "latitude": 95.0}
    response = client.post("/astrology/reading", json=payload, headers=user_headers)
    assert response.status_code == 422


# ---------------------------------------------------------------------------
# History — basic isolation
# ---------------------------------------------------------------------------

def test_reading_history_user_isolation(client, user_headers, admin_headers, mock_navamsha_kundali):
    """User A's readings must never be visible to User B."""
    # Create reading as User A (test_user)
    resp = client.post("/astrology/reading", json=READING_PAYLOAD, headers=user_headers)
    assert resp.status_code == 201

    # User A sees at least 1 reading
    history_a = client.get("/astrology/history", headers=user_headers).json()
    assert history_a["total"] >= 1

    # User B (test_admin) must see 0 readings
    history_b = client.get("/astrology/history", headers=admin_headers).json()
    assert history_b["total"] == 0


# ---------------------------------------------------------------------------
# History — pagination
# ---------------------------------------------------------------------------

def test_reading_history_pagination_structure(client, user_headers, mock_navamsha_kundali):
    """Response must contain pagination envelope fields."""
    # Create one reading so we have something to paginate
    client.post("/astrology/reading", json=READING_PAYLOAD, headers=user_headers)

    response = client.get("/astrology/history?page=1&limit=5", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "limit" in data
    assert "total" in data
    assert "pages" in data
    assert data["page"] == 1
    assert data["limit"] == 5


def test_reading_history_pagination_invalid_page(client, user_headers):
    """page=0 should fail validation."""
    response = client.get("/astrology/history?page=0", headers=user_headers)
    assert response.status_code == 422


def test_reading_history_pagination_limit_too_large(client, user_headers):
    """limit=101 exceeds maximum of 100."""
    response = client.get("/astrology/history?limit=101", headers=user_headers)
    assert response.status_code == 422


def test_reading_history_empty_page(client, user_headers, mock_navamsha_kundali):
    """Requesting page 9999 with real data should return empty items, not error."""
    # Create one reading
    client.post("/astrology/reading", json=READING_PAYLOAD, headers=user_headers)

    response = client.get("/astrology/history?page=9999&limit=10", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] >= 1


# ---------------------------------------------------------------------------
# History — filtering
# ---------------------------------------------------------------------------

def test_reading_history_filter_moon_sign(client, user_headers, mock_navamsha_kundali):
    """Filter by moon_sign=Aries should return only Aries moon readings."""
    client.post("/astrology/reading", json=READING_PAYLOAD, headers=user_headers)

    # Filter for moon_sign that exists in mock data
    response = client.get("/astrology/history?moon_sign=Aries", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["moon_sign"].lower() == "aries"


def test_reading_history_filter_moon_sign_no_match(client, user_headers, mock_navamsha_kundali):
    """Filter for a moon sign that doesn't exist returns empty, not error."""
    client.post("/astrology/reading", json=READING_PAYLOAD, headers=user_headers)

    response = client.get("/astrology/history?moon_sign=Capricorn", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


# ---------------------------------------------------------------------------
# History — sorting
# ---------------------------------------------------------------------------

def test_reading_history_sort_valid(client, user_headers):
    """Valid sort parameters should not cause an error."""
    response = client.get(
        "/astrology/history?sort=created_at&order=asc",
        headers=user_headers
    )
    assert response.status_code == 200


def test_reading_history_sort_invalid_field(client, user_headers):
    """Invalid sort field must be rejected with 422."""
    response = client.get(
        "/astrology/history?sort=reading_text",
        headers=user_headers
    )
    assert response.status_code == 422


def test_reading_history_sort_invalid_order(client, user_headers):
    """Invalid order direction must be rejected with 422."""
    response = client.get(
        "/astrology/history?order=random",
        headers=user_headers
    )
    assert response.status_code == 422
