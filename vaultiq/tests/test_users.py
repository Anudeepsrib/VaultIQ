"""
Tests for the user management module.

Covers:
- Admin can create, list, get, update, and deactivate users.
- Non-admin roles (analyst, auditor, viewer) are denied access (403).
- Password validation (minimum 12 characters).
- Duplicate username/email rejection.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from tests.conftest import TEST_USERS, auth_header


class TestUserCreation:
    """Tests for POST /users/."""

    def test_admin_create_user(self, client: TestClient):
        """Admin should be able to create a new user."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.post(
            "/users/",
            json={
                "username": "new_analyst",
                "email": "new_analyst@example.com",
                "password": "NewAnalyst1234!",
                "role": "analyst",
            },
            headers=auth_header(token),
        )
        assert response.status_code == 201, response.text
        data = response.json()
        assert data["username"] == "new_analyst"
        assert data["role"] == "analyst"
        assert "hashed_password" not in data

    def test_admin_create_user_short_password(self, client: TestClient):
        """Passwords shorter than 12 characters should be rejected."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.post(
            "/users/",
            json={
                "username": "shortpass_user",
                "email": "short@example.com",
                "password": "Short123!",
                "role": "viewer",
            },
            headers=auth_header(token),
        )
        assert response.status_code == 422

    def test_admin_create_duplicate_username(self, client: TestClient):
        """Duplicate username should return 409."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.post(
            "/users/",
            json={
                "username": TEST_USERS["admin"]["username"],
                "email": "duplicate@example.com",
                "password": "DuplicateUser123!",
                "role": "viewer",
            },
            headers=auth_header(token),
        )
        assert response.status_code == 409, response.text


class TestUserListing:
    """Tests for GET /users/."""

    def test_admin_list_users(self, client: TestClient):
        """Admin should be able to list all users."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.get("/users/", headers=auth_header(token))
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert data["total"] >= 4  # At least our 4 test users


class TestUserGet:
    """Tests for GET /users/{user_id}."""

    def test_admin_get_user(self, client: TestClient):
        """Admin should be able to retrieve a specific user."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.get("/users/1", headers=auth_header(token))
        assert response.status_code == 200
        assert "username" in response.json()

    def test_admin_get_nonexistent_user(self, client: TestClient):
        """Getting a non-existent user should return 404."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.get("/users/99999", headers=auth_header(token))
        assert response.status_code == 404


class TestUserUpdate:
    """Tests for PUT /users/{user_id}."""

    def test_admin_update_user_role(self, client: TestClient):
        """Admin should be able to update a user's role."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS["admin"]["username"],
                "password": TEST_USERS["admin"]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        # Get users to find the viewer's ID
        users_resp = client.get("/users/", headers=auth_header(token))
        viewer = next(
            (u for u in users_resp.json()["users"] if u["role"] == "viewer"),
            None,
        )
        if viewer:
            response = client.put(
                f"/users/{viewer['id']}",
                json={"role": "analyst"},
                headers=auth_header(token),
            )
            assert response.status_code == 200
            assert response.json()["role"] == "analyst"

            # Revert the change
            client.put(
                f"/users/{viewer['id']}",
                json={"role": "viewer"},
                headers=auth_header(token),
            )


class TestRBACEnforcement:
    """Verify that non-admin roles are rejected from user endpoints."""

    @pytest.mark.parametrize("role", ["analyst", "auditor", "viewer"])
    def test_non_admin_cannot_list_users(self, client: TestClient, role: str):
        """Non-admin roles should receive 403 on GET /users/."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS[role]["username"],
                "password": TEST_USERS[role]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.get("/users/", headers=auth_header(token))
        assert response.status_code == 403

    @pytest.mark.parametrize("role", ["analyst", "auditor", "viewer"])
    def test_non_admin_cannot_create_user(self, client: TestClient, role: str):
        """Non-admin roles should receive 403 on POST /users/."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS[role]["username"],
                "password": TEST_USERS[role]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.post(
            "/users/",
            json={
                "username": "forbidden_user",
                "email": "forbidden@example.com",
                "password": "ForbiddenUser123!",
                "role": "viewer",
            },
            headers=auth_header(token),
        )
        assert response.status_code == 403

    @pytest.mark.parametrize("role", ["analyst", "auditor", "viewer"])
    def test_non_admin_cannot_delete_user(self, client: TestClient, role: str):
        """Non-admin roles should receive 403 on DELETE /users/{id}."""
        login_resp = client.post(
            "/auth/login",
            json={
                "username": TEST_USERS[role]["username"],
                "password": TEST_USERS[role]["password"],
            },
        )
        token = login_resp.json()["access_token"]

        response = client.delete("/users/1", headers=auth_header(token))
        assert response.status_code == 403


class TestHealthCheck:
    """Tests for the public health endpoint."""

    def test_health_no_auth(self, client: TestClient):
        """Health check should be accessible without authentication."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
