"""
Authentication router — login, token refresh, and user profile.

Endpoints:
    POST /auth/login    — Authenticate with username/password, receive tokens.
    POST /auth/refresh  — Exchange a valid refresh token for a new access token.
    GET  /auth/me       — Return the current user's profile.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.schemas import LoginRequest, TokenRefreshRequest, TokenResponse, UserOut
from app.auth.service import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from app.database import get_db
from app.users.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user",
    description="Validate username and password, returning a JWT access token "
    "and a refresh token. Access tokens expire in 60 minutes.",
    response_description="JWT token pair.",
)
async def login(
    body: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Authenticate a user and issue JWT tokens.

    Args:
        body: Login credentials (username + password).
        request: The incoming HTTP request (for audit logging).
        db: Database session.

    Returns:
        TokenResponse containing access and refresh tokens.

    Raises:
        HTTPException: 401 if credentials are invalid.
    """
    user = db.query(User).filter(User.username == body.username).first()

    if user is None or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid_credentials", "message": "Invalid username or password"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "account_disabled", "message": "Account is disabled"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {"sub": user.username, "role": user.role.value, "user_id": user.id}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    # Audit log for login is handled by the audit middleware / service
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
    description="Submit a valid refresh token to receive a new access token "
    "without re-authenticating. The refresh token is single-use.",
    response_description="New JWT token pair.",
)
async def refresh_token(
    body: TokenRefreshRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Exchange a refresh token for a new access token.

    Args:
        body: Contains the refresh token string.
        db: Database session.

    Returns:
        A new TokenResponse with fresh access and refresh tokens.

    Raises:
        HTTPException: 401 if the refresh token is invalid or expired.
    """
    payload = decode_token(body.refresh_token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid_token", "message": "Refresh token is invalid or expired"},
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid_token_type", "message": "Expected refresh token"},
        )

    username = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid_token", "message": "Token missing subject claim"},
        )

    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "user_not_found", "message": "User not found or inactive"},
        )

    token_data = {"sub": user.username, "role": user.role.value, "user_id": user.id}
    new_access = create_access_token(token_data)
    new_refresh = create_refresh_token(token_data)

    return TokenResponse(access_token=new_access, refresh_token=new_refresh)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Get current user profile",
    description="Returns the profile of the currently authenticated user.",
    response_description="The authenticated user's profile.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserOut:
    """Return the profile of the currently authenticated user.

    Args:
        current_user: The user resolved from the JWT (injected).

    Returns:
        UserOut schema with the user's public profile data.
    """
    return UserOut.model_validate(current_user)
