"""
User CRUD service layer.

All database operations for managing users are centralised here.
Password hashing is delegated to ``app.auth.service``. This module
does **not** perform RBAC checks — those belong in the dependency
layer (``app.auth.dependencies``).
"""

from __future__ import annotations

from typing import Optional, Tuple, List

from sqlalchemy.orm import Session

from app.auth.service import hash_password
from app.users.models import User, UserRole
from app.users.schemas import UserCreate, UserUpdate


def create_user(db: Session, payload: UserCreate) -> User:
    """Create a new user in the database.

    Args:
        db: Active database session.
        payload: Validated user creation data.

    Returns:
        The newly created ``User`` ORM instance.

    Raises:
        ValueError: If the username or email already exists.
    """
    # Check uniqueness
    if db.query(User).filter(User.username == payload.username).first():
        raise ValueError(f"Username '{payload.username}' already exists")
    if db.query(User).filter(User.email == payload.email).first():
        raise ValueError(f"Email '{payload.email}' already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole(payload.role.value),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Retrieve a user by primary key.

    Args:
        db: Active database session.
        user_id: The user's primary key.

    Returns:
        The ``User`` instance, or ``None`` if not found.
    """
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Retrieve a user by username.

    Args:
        db: Active database session.
        username: The login name to look up.

    Returns:
        The ``User`` instance, or ``None`` if not found.
    """
    return db.query(User).filter(User.username == username).first()


def list_users(
    db: Session, page: int = 1, per_page: int = 20
) -> Tuple[List[User], int]:
    """List users with pagination.

    Args:
        db: Active database session.
        page: 1-based page number.
        per_page: Number of records per page.

    Returns:
        A tuple of (list of Users, total count).
    """
    total = db.query(User).count()
    users = (
        db.query(User)
        .order_by(User.id)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return users, total


def update_user(db: Session, user_id: int, payload: UserUpdate) -> Optional[User]:
    """Update an existing user's attributes.

    Only fields that are explicitly set in ``payload`` are changed.

    Args:
        db: Active database session.
        user_id: The user's primary key.
        payload: Update data — ``None`` fields are skipped.

    Returns:
        The updated ``User``, or ``None`` if not found.

    Raises:
        ValueError: If the new email conflicts with an existing user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        return None

    if payload.email is not None:
        existing = (
            db.query(User)
            .filter(User.email == payload.email, User.id != user_id)
            .first()
        )
        if existing:
            raise ValueError(f"Email '{payload.email}' already exists")
        user.email = payload.email

    if payload.password is not None:
        user.hashed_password = hash_password(payload.password)

    if payload.role is not None:
        user.role = UserRole(payload.role.value)

    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    """Soft-delete a user by deactivating their account.

    Args:
        db: Active database session.
        user_id: The user's primary key.

    Returns:
        True if the user was found and deactivated, False otherwise.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        return False
    user.is_active = False
    db.commit()
    return True
