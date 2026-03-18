"""
User management router — admin-only CRUD.

All endpoints in this router are guarded by ``require_roles(["admin"])``.
Non-admin users receive a ``403 Forbidden`` response.

Endpoints:
    POST   /users/            — Create a new user.
    GET    /users/            — List all users (paginated).
    GET    /users/{user_id}   — Get a single user by ID.
    PUT    /users/{user_id}   — Update a user's attributes.
    DELETE /users/{user_id}   — Soft-delete (deactivate) a user.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import require_roles
from app.database import get_db
from app.users.models import User
from app.users.schemas import UserCreate, UserList, UserOut, UserUpdate
from app.users import service as user_service

router = APIRouter(prefix="/users", tags=["User Management"])


@router.post(
    "/",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Create a new user account. Restricted to administrators.",
    response_description="The newly created user.",
)
async def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
) -> UserOut:
    """Create a new user account.

    Args:
        payload: User creation data (username, email, password, role).
        db: Database session.
        current_user: The authenticated admin user (injected by RBAC).

    Returns:
        The created user's public profile.

    Raises:
        HTTPException: 409 if the username or email already exists.
    """
    try:
        user = user_service.create_user(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "conflict", "message": str(exc)},
        )
    return UserOut.model_validate(user)


@router.get(
    "/",
    response_model=UserList,
    summary="List all users",
    description="Retrieve a paginated list of all users. Admin only.",
    response_description="Paginated list of users.",
)
async def list_users(
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
) -> UserList:
    """Retrieve a paginated list of all users.

    Args:
        page: Page number (1-based).
        per_page: Number of records per page.
        db: Database session.
        current_user: The authenticated admin user (injected).

    Returns:
        UserList containing the users and pagination metadata.
    """
    users, total = user_service.list_users(db, page=page, per_page=per_page)
    return UserList(
        users=[UserOut.model_validate(u) for u in users],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get(
    "/{user_id}",
    response_model=UserOut,
    summary="Get a user by ID",
    description="Retrieve a single user's profile by their ID. Admin only.",
    response_description="The requested user's profile.",
)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
) -> UserOut:
    """Retrieve a single user by primary key.

    Args:
        user_id: The user's ID.
        db: Database session.
        current_user: The authenticated admin user (injected).

    Returns:
        The user's public profile.

    Raises:
        HTTPException: 404 if the user is not found.
    """
    user = user_service.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"User {user_id} not found"},
        )
    return UserOut.model_validate(user)


@router.put(
    "/{user_id}",
    response_model=UserOut,
    summary="Update a user",
    description="Update a user's email, password, role, or active status. Admin only.",
    response_description="The updated user's profile.",
)
async def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
) -> UserOut:
    """Update an existing user's attributes.

    Args:
        user_id: The user's ID.
        payload: Fields to update (only set fields are applied).
        db: Database session.
        current_user: The authenticated admin user (injected).

    Returns:
        The updated user's profile.

    Raises:
        HTTPException: 404 if the user is not found.
        HTTPException: 409 if the new email conflicts.
    """
    try:
        user = user_service.update_user(db, user_id, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "conflict", "message": str(exc)},
        )
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"User {user_id} not found"},
        )
    return UserOut.model_validate(user)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Deactivate a user",
    description="Soft-delete a user by setting them inactive. Admin only.",
    response_description="Confirmation of deactivation.",
)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
) -> dict:
    """Soft-delete a user (deactivate account).

    Args:
        user_id: The user's ID.
        db: Database session.
        current_user: The authenticated admin user (injected).

    Returns:
        Confirmation message.

    Raises:
        HTTPException: 404 if the user is not found.
    """
    success = user_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"error": "not_found", "message": f"User {user_id} not found"},
        )
    return {"message": f"User {user_id} has been deactivated"}
