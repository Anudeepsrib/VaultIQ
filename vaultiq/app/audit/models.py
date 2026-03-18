"""
SQLAlchemy model for the ``audit_logs`` table.

This table is **append-only**: SQLAlchemy event listeners block any
UPDATE or DELETE operations at the ORM level, ensuring an immutable
audit trail suitable for compliance review.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, event
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AuditLog(Base):
    """Immutable audit log entry.

    Every write action in VaultIQ (upload, delete, extraction,
    user creation, role change) produces an audit record.

    Attributes:
        id: Auto-incrementing primary key.
        timestamp: When the action occurred (UTC).
        user_id: The acting user's ID (nullable for system actions).
        user_role: The acting user's role at the time of the action.
        action: Action verb — e.g. ``user_created``, ``document_uploaded``.
        resource_type: Type of resource acted upon — e.g. ``user``, ``document``.
        resource_id: Primary key of the affected resource (as string).
        ip_address: Client IP address.
        status: Outcome — ``success`` or ``failure``.
        details: Optional JSON-encoded extra information.
    """

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    user_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    user_role: Mapped[str | None] = mapped_column(String(32), nullable=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(64), nullable=False)
    resource_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    status: Mapped[str] = mapped_column(String(16), default="success", nullable=False)
    details: Mapped[str | None] = mapped_column(String(1024), nullable=True)


# ── Append-only enforcement ──────────────────────────────────────────


def _block_audit_update(mapper, connection, target):
    """Raise an error when attempting to UPDATE an audit log record.

    This enforces the append-only contract at the ORM layer.

    Args:
        mapper: The SQLAlchemy mapper (unused).
        connection: The database connection (unused).
        target: The AuditLog instance being modified.

    Raises:
        PermissionError: Always — audit logs are immutable.
    """
    raise PermissionError("Audit log records are immutable — UPDATE is forbidden.")


def _block_audit_delete(mapper, connection, target):
    """Raise an error when attempting to DELETE an audit log record.

    This enforces the append-only contract at the ORM layer.

    Args:
        mapper: The SQLAlchemy mapper (unused).
        connection: The database connection (unused).
        target: The AuditLog instance being deleted.

    Raises:
        PermissionError: Always — audit logs are immutable.
    """
    raise PermissionError("Audit log records are immutable — DELETE is forbidden.")


event.listen(AuditLog, "before_update", _block_audit_update)
event.listen(AuditLog, "before_delete", _block_audit_delete)
