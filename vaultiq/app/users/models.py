"""
SQLAlchemy model for the ``users`` table.

Stores user credentials, role assignments, and account status.
Roles are restricted to the four-tier RBAC enum:
admin, analyst, auditor, viewer.
"""

from __future__ import annotations

import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UserRole(str, enum.Enum):
    """Allowed user roles in the VaultIQ RBAC system."""

    admin = "admin"
    analyst = "analyst"
    auditor = "auditor"
    viewer = "viewer"


class User(Base):
    """Represents a VaultIQ platform user.

    Attributes:
        id: Primary key.
        username: Unique login name.
        email: Unique email address.
        hashed_password: bcrypt-hashed password (never store plaintext).
        role: One of admin / analyst / auditor / viewer.
        is_active: Soft-delete flag — inactive users cannot log in.
        created_at: Account creation timestamp (UTC).
        updated_at: Last modification timestamp (UTC).
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole), default=UserRole.viewer, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}', role='{self.role.value}')>"
