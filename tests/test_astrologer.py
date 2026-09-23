"""
tests/test_astrologer.py

Tests astrologer reading list, reading inspection, pagination,
filtering, and adding review notes.
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


def test_astrologer_queue_forbidden_for_user(client, user_headers):
    response = client.get("/astrologer/readings", headers=user_headers)
    assert response.status_code == 403
    assert response.json()["error"] == "FORBIDDEN"


def test_astrologer_queue_success(client, astrologer_headers):
    response = client.get("/astrologer/readings", headers=astrologer_headers)
    assert response.status_code == 200
    data = response.json()
    # Now paginated — response is an envelope
    assert "items" in data
    assert "page" in data
    assert "total" in data
    assert isinstance(data["items"], list)


def test_astrologer_queue_pagination(client, astrologer_headers):
    """Pagination parameters should be reflected in the response."""
    response = client.get(
        "/astrologer/readings?page=1&limit=5",
        headers=astrologer_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["limit"] == 5


def test_astrologer_queue_invalid_page(client, astrologer_headers):
    """page=0 must be rejected."""
    response = client.get("/astrologer/readings?page=0", headers=astrologer_headers)
    assert response.status_code == 422


def test_astrologer_queue_filter_is_reviewed(client, astrologer_headers, user_headers, mock_navamsha_kundali):
    """is_reviewed=false should return only readings without an astrologer note."""
    # Create a reading (no note yet)
    resp = client.post("/astrology/reading", json=READING_PAYLOAD, headers=user_headers)
    assert resp.status_code == 201

    # Filter unreviewed
    response = client.get(
        "/astrologer/readings?is_reviewed=false",
        headers=astrologer_headers
    )
    assert response.status_code == 200
    data = response.json()
    for item in data["items"]:
        assert item["is_reviewed"] is False


def test_astrologer_add_note_flow(client, user_headers, astrologer_headers, mock_navamsha_kundali):
    # 1. User generates reading (now 201)
    create_resp = client.post(
        "/astrology/reading",
        json=READING_PAYLOAD,
        headers=user_headers
    )
    assert create_resp.status_code == 201
    reading_id = create_resp.json()["reading_id"]

    # 2. Astrologer adds review note
    note_resp = client.patch(
        f"/astrologer/readings/{reading_id}/note",
        json={"note": "Prominent solar vitality with strong intuitive guidance."},
        headers=astrologer_headers
    )
    assert note_resp.status_code == 200
    data = note_resp.json()
    assert data["astrologer_note"] == "Prominent solar vitality with strong intuitive guidance."
    assert data["reviewed_by"] is not None
    assert data["reviewed_at"] is not None


def test_astrologer_note_forbidden_for_normal_user(client, user_headers):
    response = client.patch(
        "/astrologer/readings/1/note",
        json={"note": "Attempt by normal user."},
        headers=user_headers
    )
    assert response.status_code == 403


def test_astrologer_sort_invalid_field(client, astrologer_headers):
    """Invalid sort field must be rejected."""
    response = client.get(
        "/astrologer/readings?sort=astrologer_note",
        headers=astrologer_headers
    )
    assert response.status_code == 422


def test_astrologer_sort_invalid_order(client, astrologer_headers):
    """Invalid order direction must be rejected."""
    response = client.get(
        "/astrologer/readings?order=sideways",
        headers=astrologer_headers
    )
    assert response.status_code == 422
