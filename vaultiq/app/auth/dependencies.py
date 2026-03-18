"""
FastAPI dependency injection for authentication and RBAC.

Provides two key dependencies:

* ``get_current_user`` — extracts and validates the JWT from the
  ``Authorization: Bearer`` header, returning the ``User`` ORM object.
* ``require_roles(roles)`` — factory that returns a dependency enforcing
  that the current user holds one of the specified roles.

RBAC checks happen **here, in the dependency layer** — never in
business-logic service functions.
"""

from __future__ import annotations

from typing import Callable, List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.service import decode_token
from app.database import get_db
from app.users.models import User

# HTTPBearer extracts the token from "Authorization: Bearer <token>"
_bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Resolve the authenticated user from the JWT bearer token.

    This dependency:
    1. Extracts the raw token from the ``Authorization`` header.
    2. Decodes and validates the JWT.
    3. Looks up the user in the database.
    4. Confirms the account is active.

    Args:
        credentials: The bearer credentials extracted by FastAPI.
        db: The database session.

    Returns:
        The authenticated ``User`` ORM instance.

    Raises:
        HTTPException: 401 if the token is missing, invalid, expired,
                       or the user is inactive / not found.
    """
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid_token", "message": "Token is invalid or expired"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Only accept access tokens (not refresh tokens)
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid_token_type", "message": "Expected access token"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    username: str | None = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "invalid_token", "message": "Token missing subject claim"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.username == username).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "user_not_found", "message": "User not found or inactive"},
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_roles(allowed_roles: List[str]) -> Callable:
    """Factory that produces a FastAPI dependency enforcing role membership.

    Usage in a router::

        @router.get("/admin-only", dependencies=[Depends(require_roles(["admin"]))])
        def admin_endpoint(): ...

    Or as a parameter dependency::

        def my_endpoint(user: User = Depends(require_roles(["admin", "analyst"]))):
            ...

    Args:
        allowed_roles: List of role strings that may access the endpoint.

    Returns:
        A FastAPI-compatible dependency function that resolves to the
        current ``User`` if authorised, or raises 403.
    """

    async def _role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        """Check that the current user's role is in the allowed set.

        Args:
            current_user: The authenticated user (injected).

        Returns:
            The ``User`` instance if authorised.

        Raises:
            HTTPException: 403 if the user's role is not allowed.
        """
        if current_user.role.value not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "forbidden", "message": "Insufficient permissions"},
            )
        return current_user

    return _role_checker
