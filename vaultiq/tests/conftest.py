"""
Shared test fixtures for VaultIQ.

Provides:
- In-memory SQLite database with all tables created.
- FastAPI TestClient wired to the test database.
- Pre-created test users for each RBAC role (admin, analyst, auditor, viewer).
- Helper functions to generate JWT tokens for each role.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker

from app.auth.service import create_access_token, hash_password
from app.database import Base, get_db
from app.main import create_app
from app.users.models import User, UserRole

# ── Test Database ────────────────────────────────────────────

TEST_DATABASE_URL = "sqlite:///./test_vaultiq.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    """Yield a test database session, ensuring cleanup after each request."""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Test Users ───────────────────────────────────────────────

TEST_USERS = {
    "admin": {
        "username": "test_admin",
        "email": "admin@example.com",
        "password": "AdminPass12345!",
        "role": UserRole.admin,
    },
    "analyst": {
        "username": "test_analyst",
        "email": "analyst@example.com",
        "password": "AnalystPass123!",
        "role": UserRole.analyst,
    },
    "auditor": {
        "username": "test_auditor",
        "email": "auditor@example.com",
        "password": "AuditorPass123!",
        "role": UserRole.auditor,
    },
    "viewer": {
        "username": "test_viewer",
        "email": "viewer@example.com",
        "password": "ViewerPass12345!",
        "role": UserRole.viewer,
    },
}


def _create_test_users(db):
    """Seed the test database with one user per RBAC role.

    Args:
        db: Active test database session.
    """
    for role, data in TEST_USERS.items():
        user = db.query(User).filter(User.username == data["username"]).first()
        if user is None:
            user = User(
                username=data["username"],
                email=data["email"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
                is_active=True,
            )
            db.add(user)
    db.commit()


# ── Fixtures ─────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables once per test session and tear down afterward."""
    Base.metadata.create_all(bind=test_engine)
    db = TestSessionLocal()
    _create_test_users(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()
    # Clean up test database file
    import os
    if os.path.exists("./test_vaultiq.db"):
        os.remove("./test_vaultiq.db")


@pytest.fixture()
def db():
    """Provide a fresh database session for each test.

    Yields:
        A test database session.
    """
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client():
    """Provide a FastAPI TestClient with the test database injected.

    Yields:
        A ``TestClient`` instance.
    """
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c


def _make_token(role: str) -> str:
    """Create a JWT access token for a test user by role.

    Args:
        role: One of ``admin``, ``analyst``, ``auditor``, ``viewer``.

    Returns:
        Encoded JWT access token string.
    """
    user_data = TEST_USERS[role]
    return create_access_token({
        "sub": user_data["username"],
        "role": role,
        "user_id": 1,  # Approximation — actual IDs assigned at creation
    })


@pytest.fixture()
def admin_token() -> str:
    """JWT access token for the admin test user."""
    return _make_token("admin")


@pytest.fixture()
def analyst_token() -> str:
    """JWT access token for the analyst test user."""
    return _make_token("analyst")


@pytest.fixture()
def auditor_token() -> str:
    """JWT access token for the auditor test user."""
    return _make_token("auditor")


@pytest.fixture()
def viewer_token() -> str:
    """JWT access token for the viewer test user."""
    return _make_token("viewer")


def auth_header(token: str) -> dict:
    """Build an Authorization header from a token.

    Args:
        token: The JWT access token.

    Returns:
        Dict with the ``Authorization`` header set.
    """
    return {"Authorization": f"Bearer {token}"}
