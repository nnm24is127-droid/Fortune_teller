"""
tests/test_users.py

Tests GET /users/me profile endpoint for authentication and role representation.
"""

def test_get_profile_authenticated_user(client, user_headers, test_user):
    response = client.get("/users/me", headers=user_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["username"] == test_user.username
    assert data["email"] == test_user.email
    assert data["role"] == "user"
    assert "password_hash" not in data


def test_get_profile_authenticated_admin(client, admin_headers, test_admin):
    response = client.get("/users/me", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == test_admin.username
    assert data["role"] == "admin"


def test_get_profile_unauthenticated(client):
    response = client.get("/users/me")
    assert response.status_code == 401
    assert response.json()["error"] == "UNAUTHORIZED"


def test_get_profile_invalid_token(client):
    response = client.get("/users/me", headers={"Authorization": "Bearer fake.tampered.token"})
    assert response.status_code == 401
    assert response.json()["error"] == "UNAUTHORIZED"
