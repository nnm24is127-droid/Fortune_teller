"""
tests/conftest.py

Shared pytest fixtures for AstroTeller testing.
Creates an isolated test database and overrides get_db dependency.
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.auth import create_access_token, hash_password
from app.database import Base, get_db
from app.main import app
from app.models import User


TEST_DB_FILE = "test_astro_teller.db"
TEST_DATABASE_URL = f"sqlite:///./{TEST_DB_FILE}"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all tables in test db before session and drop after."""
    from app import config
    config.LLM_API_KEY = ""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        try:
            os.remove(TEST_DB_FILE)
        except PermissionError:
            pass


@pytest.fixture(scope="function")
def db_session():
    """Provides a transactional database session per test function."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session) -> User:
    user = User(
        username="testuser",
        email="testuser@example.com",
        password_hash=hash_password("password123"),
        role="user"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_astrologer(db_session) -> User:
    astro = User(
        username="testastro",
        email="testastro@example.com",
        password_hash=hash_password("password123"),
        role="astrologer"
    )
    db_session.add(astro)
    db_session.commit()
    db_session.refresh(astro)
    return astro


@pytest.fixture
def test_admin(db_session) -> User:
    admin = User(
        username="testadmin",
        email="testadmin@example.com",
        password_hash=hash_password("adminpassword123"),
        role="admin"
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def user_headers(test_user) -> dict:
    token = create_access_token(test_user.id, test_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def astrologer_headers(test_astrologer) -> dict:
    token = create_access_token(test_astrologer.id, test_astrologer.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin) -> dict:
    token = create_access_token(test_admin.id, test_admin.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_navamsha_kundali(monkeypatch):
    """Mocks fetch_kundali so tests never call the real external API."""
    fake_response = {
        "statusCode": 200,
        "output": {
            "ascendant": {
                "zodiac_sign_name": "Scorpio"
            },
            "planets": {
                "Sun": {
                    "zodiac_sign_name": "Leo"
                },
                "Moon": {
                    "zodiac_sign_name": "Aries",
                    "nakshatra_name": "Ashwini"
                }
            }
        }
    }
    
    def fake_fetch(*args, **kwargs):
        return fake_response

    monkeypatch.setattr("app.services.astrology_service.fetch_kundali", fake_fetch)
    return fake_response
