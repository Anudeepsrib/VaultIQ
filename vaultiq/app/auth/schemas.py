"""
Pydantic schemas for the authentication module.

Defines request/response shapes for login, token refresh,
and the authenticated user profile endpoint.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """Credentials submitted to ``POST /auth/login``.

    Attributes:
        username: The user's login name.
        password: The plaintext password (validated server-side, never stored).
    """

    username: str = Field(..., min_length=1, max_length=64)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """JWT pair returned after successful login or token refresh.

    Attributes:
        access_token: Short-lived JWT for API authorization.
        refresh_token: Long-lived JWT for obtaining new access tokens.
        token_type: Always ``bearer``.
    """

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefreshRequest(BaseModel):
    """Payload for ``POST /auth/refresh``.

    Attributes:
        refresh_token: A valid, unexpired refresh token.
    """

    refresh_token: str


class UserOut(BaseModel):
    """Public-facing user profile (no sensitive fields).

    Attributes:
        id: User primary key.
        username: Login name.
        email: Email address.
        role: RBAC role.
        is_active: Whether the account is active.
        created_at: Account creation timestamp.
    """

    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
