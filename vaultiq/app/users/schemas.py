"""
Pydantic schemas for the users module.

Defines request/response shapes for user CRUD operations performed
by administrators.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserRoleEnum(str, Enum):
    """Allowed roles for user creation and update."""

    admin = "admin"
    analyst = "analyst"
    auditor = "auditor"
    viewer = "viewer"


class UserCreate(BaseModel):
    """Payload for creating a new user (admin only).

    Attributes:
        username: Unique login name (3–64 chars).
        email: Valid email address.
        password: Plaintext password (min 12 chars per security policy).
        role: RBAC role assignment.
    """

    username: str = Field(..., min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(..., min_length=12, max_length=128)
    role: UserRoleEnum = UserRoleEnum.viewer


class UserUpdate(BaseModel):
    """Payload for updating an existing user (admin only).

    All fields are optional — supply only what needs to change.

    Attributes:
        email: New email address.
        password: New password (min 12 chars).
        role: New RBAC role.
        is_active: Enable or disable the account.
    """

    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=12, max_length=128)
    role: Optional[UserRoleEnum] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    """Public-facing user representation (no password hash).

    Attributes:
        id: User primary key.
        username: Login name.
        email: Email address.
        role: Current RBAC role.
        is_active: Account status.
        created_at: Account creation timestamp.
        updated_at: Last modification timestamp.
    """

    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserList(BaseModel):
    """Paginated list of users.

    Attributes:
        users: List of user records.
        total: Total number of users matching the query.
        page: Current page number.
        per_page: Number of users per page.
    """

    users: List[UserOut]
    total: int
    page: int
    per_page: int
