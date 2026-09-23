"""
tests/test_admin.py

Tests admin endpoints, RBAC restrictions, user role updates,
pagination, and search.
"""


def test_admin_get_users(client, admin_headers):
    """Admin can list users — response is now a paginated envelope."""
    response = client.get("/admin/users", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "total" in data
    assert isinstance(data["items"], list)


def test_admin_routes_forbidden_for_normal_user(client, user_headers):
    response = client.get("/admin/users", headers=user_headers)
    assert response.status_code == 403
    assert response.json()["error"] == "FORBIDDEN"


def test_admin_get_user_by_id(client, admin_headers, test_user):
    response = client.get(f"/admin/users/{test_user.id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["username"] == test_user.username


def test_admin_get_user_not_found(client, admin_headers):
    response = client.get("/admin/users/99999", headers=admin_headers)
    assert response.status_code == 404
    assert response.json()["error"] == "RESOURCE_NOT_FOUND"


def test_admin_update_user_role(client, admin_headers, test_user):
    response = client.patch(
        f"/admin/users/{test_user.id}/role",
        json={"role": "astrologer"},
        headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["role"] == "astrologer"

    # Verify persisted in database
    verify_resp = client.get(f"/admin/users/{test_user.id}", headers=admin_headers)
    assert verify_resp.json()["role"] == "astrologer"


def test_admin_update_invalid_role(client, admin_headers, test_user):
    response = client.patch(
        f"/admin/users/{test_user.id}/role",
        json={"role": "superadmin"},
        headers=admin_headers
    )
    assert response.status_code == 422


def test_admin_users_pagination_structure(client, admin_headers):
    """Pagination envelope must contain all required fields."""
    response = client.get("/admin/users?page=1&limit=5", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["limit"] == 5
    assert "total" in data
    assert "pages" in data


def test_admin_users_invalid_page(client, admin_headers):
    """page=0 must be rejected."""
    response = client.get("/admin/users?page=0", headers=admin_headers)
    assert response.status_code == 422


def test_admin_users_limit_too_large(client, admin_headers):
    """limit=101 exceeds the maximum of 100."""
    response = client.get("/admin/users?limit=101", headers=admin_headers)
    assert response.status_code == 422


def test_admin_users_search_by_username(client, admin_headers, test_user):
    """Search by username should return only matching users."""
    response = client.get(
        f"/admin/users?search={test_user.username}",
        headers=admin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    usernames = [u["username"] for u in data["items"]]
    assert test_user.username in usernames


def test_admin_users_search_by_email(client, admin_headers, test_user):
    """Search by email should return only matching users."""
    response = client.get(
        f"/admin/users?search={test_user.email}",
        headers=admin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    emails = [u["email"] for u in data["items"]]
    assert test_user.email in emails


def test_admin_users_search_no_match(client, admin_headers):
    """Search with no match returns empty items, not an error."""
    response = client.get(
        "/admin/users?search=zzzznonexistentuser9999",
        headers=admin_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


def test_admin_users_sort_valid(client, admin_headers):
    """Valid sort and order parameters should succeed."""
    response = client.get(
        "/admin/users?sort=username&order=asc",
        headers=admin_headers
    )
    assert response.status_code == 200


def test_admin_users_sort_invalid_field(client, admin_headers):
    """Invalid sort field must be rejected."""
    response = client.get(
        "/admin/users?sort=password_hash",
        headers=admin_headers
    )
    assert response.status_code == 422


def test_admin_users_sort_invalid_order(client, admin_headers):
    """Invalid order direction must be rejected."""
    response = client.get(
        "/admin/users?order=random",
        headers=admin_headers
    )
    assert response.status_code == 422


def test_admin_response_no_password_hash(client, admin_headers, test_user):
    """Password hash must never appear in any admin user response."""
    response = client.get(f"/admin/users/{test_user.id}", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "password_hash" not in data
    assert "password" not in data
