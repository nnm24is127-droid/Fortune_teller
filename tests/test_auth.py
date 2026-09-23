"""
tests/test_auth.py

Tests user registration, login, and validation error flows.
"""


def test_register_success(client):
    response = client.post(
        "/auth/register",
        json={
            "username": "newclient",
            "email": "newclient@example.com",
            "password": "validpassword123"
        }
    )
    # Registration creates a new resource → 201 Created
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_username(client, test_user):
    response = client.post(
        "/auth/register",
        json={
            "username": test_user.username,
            "email": "different@example.com",
            "password": "validpassword123"
        }
    )
    assert response.status_code == 400
    assert response.json()["error"] == "USERNAME_EXISTS"


def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/auth/register",
        json={
            "username": "uniqueuser",
            "email": test_user.email,
            "password": "validpassword123"
        }
    )
    assert response.status_code == 400
    assert response.json()["error"] == "EMAIL_EXISTS"


def test_register_invalid_email(client):
    response = client.post(
        "/auth/register",
        json={
            "username": "client_x",
            "email": "not-an-email",
            "password": "validpassword123"
        }
    )
    assert response.status_code == 422
    assert response.json()["error"] == "VALIDATION_ERROR"


def test_register_password_too_short(client):
    response = client.post(
        "/auth/register",
        json={
            "username": "client_x",
            "email": "client_x@example.com",
            "password": "123"
        }
    )
    assert response.status_code == 422
    assert response.json()["error"] == "VALIDATION_ERROR"


def test_register_password_max_length(client):
    """Password exceeding 128 characters should be rejected with 422."""
    response = client.post(
        "/auth/register",
        json={
            "username": "client_y",
            "email": "client_y@example.com",
            "password": "x" * 129
        }
    )
    assert response.status_code == 422
    assert response.json()["error"] == "VALIDATION_ERROR"


def test_login_success(client, test_user):
    response = client.post(
        "/auth/login",
        json={
            "username": test_user.username,
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, test_user):
    response = client.post(
        "/auth/login",
        json={
            "username": test_user.username,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["error"] == "UNAUTHORIZED"
    assert response.json()["message"] == "Invalid username or password."


def test_login_nonexistent_user(client):
    response = client.post(
        "/auth/login",
        json={
            "username": "ghost_user",
            "password": "somepassword123"
        }
    )
    assert response.status_code == 401
    assert response.json()["error"] == "UNAUTHORIZED"
    assert response.json()["message"] == "Invalid username or password."
