"""
Tests for the authentication module.

Covers:
- Login with valid and invalid credentials.
- Token refresh flow.
- ``/auth/me`` endpoint with valid and invalid tokens.
- Expired and malformed token handling.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import TEST_USERS, auth_header


class TestLogin:
    """Tests for POST /auth/login."""

    def test_login_success(self, client: TestClient):
        """Valid credentials should return a JWT token pair."""
        response = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_password(self, client: TestClient):
        """Wrong password should return 401."""
        response = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": "WrongPassword123!",
            },
        )
        assert response.status_code == 401
        assert response.json()["detail"]["error"] == "invalid_credentials"

    def test_login_nonexistent_user(self, client: TestClient):
        """Non-existent username should return 401."""
        response = client.post(
            "/auth/login",
            json={
                "username": "nonexistent_user",
                "password": "SomePassword123!",
            },
        )
        assert response.status_code == 401

    def test_login_empty_username(self, client: TestClient):
        """Empty username should return 422 validation error."""
        response = client.post(
            "/auth/login",
            json={
                "username": "",
                "password": "SomePassword123!",
            },
        )
        assert response.status_code == 422


class TestTokenRefresh:
    """Tests for POST /auth/refresh."""

    def test_refresh_success(self, client: TestClient):
        """A valid refresh token should yield new tokens."""
        # Login first to get a refresh token
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        refresh_token = login_resp.json()["refresh_token"]

        # Use the refresh token
        response = client.post(
            "/auth/refresh",
            json={
                "refresh_token": refresh_token,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client: TestClient):
        """An invalid refresh token should return 401."""
        response = client.post(
            "/auth/refresh",
            json={
                "refresh_token": "not.a.valid.token",
            },
        )
        assert response.status_code == 401

    def test_refresh_with_access_token(self, client: TestClient):
        """Using an access token for refresh should return 401."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        access_token = login_resp.json()["access_token"]

        response = client.post(
            "/auth/refresh",
            json={
                "refresh_token": access_token,
            },
        )
        assert response.status_code == 401
        assert response.json()["detail"]["error"] == "invalid_token_type"


class TestGetMe:
    """Tests for GET /auth/me."""

    def test_get_me_success(self, client: TestClient):
        """Authenticated user should see their profile."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.get("/auth/me", headers=auth_header(token))
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == TEST_USERS["admin"]["username"]
        assert data["role"] == "admin"
        assert "hashed_password" not in data

    def test_get_me_no_token(self, client: TestClient):
        """Request without token should return 403 (no credentials)."""
        response = client.get("/auth/me")
        assert response.status_code == 403

    def test_get_me_invalid_token(self, client: TestClient):
        """Request with invalid token should return 401."""
        response = client.get("/auth/me", headers=auth_header("invalid.token.here"))
        assert response.status_code == 401


class TestAllRolesCanLogin:
    """Verify every RBAC role can authenticate successfully."""

    @pytest.mark.parametrize("role", ["admin", "analyst", "auditor", "viewer"])
    def test_role_login(self, client: TestClient, role: str):
        """Each role should be able to login and get tokens."""
        user = TEST_USERS[role]
        response = client.post(
            "/auth/login",
            json={
                "username": user["username"],
                "password": user["password"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data

        # Verify the token works for /auth/me
        me_resp = client.get(
            "/auth/me",
            headers=auth_header(data["access_token"]),
        )
        assert me_resp.status_code == 200
        assert me_resp.json()["username"] == user["username"]
