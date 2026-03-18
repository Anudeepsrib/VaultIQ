"""
Audit log service — append-only write and query operations.

Provides ``write_audit_log`` for recording actions and
``query_audit_logs`` for admin/auditor retrieval with filtering.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from app.audit.models import AuditLog


def write_audit_log(
    db: Session,
    *,
    user_id: Optional[int] = None,
    user_role: Optional[str] = None,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    status: str = "success",
    details: Optional[str] = None,
) -> AuditLog:
    """Append a new entry to the immutable audit log.

    Args:
        db: Active database session.
        user_id: The acting user's ID (None for system actions).
        user_role: The acting user's RBAC role at the time.
        action: Action verb (e.g. ``user_created``, ``document_uploaded``).
        resource_type: Type of resource (e.g. ``user``, ``document``).
        resource_id: Identifier of the affected resource.
        ip_address: Client IP address.
        status: Outcome — ``success`` or ``failure``.
        details: Optional JSON string with additional context.

    Returns:
        The newly created ``AuditLog`` record.
    """
    log_entry = AuditLog(
        user_id=user_id,
        user_role=user_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        status=status,
        details=details,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry


def query_audit_logs(
    db: Session,
    *,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    page: int = 1,
    per_page: int = 50,
) -> Tuple[List[AuditLog], int]:
    """Query audit logs with optional filters and pagination.

    Args:
        db: Active database session.
        user_id: Filter by acting user ID.
        action: Filter by action verb.
        resource_type: Filter by resource type.
        start_date: Include logs on or after this timestamp.
        end_date: Include logs on or before this timestamp.
        page: 1-based page number.
        per_page: Records per page.

    Returns:
        Tuple of (matching AuditLog records, total count).
    """
    query = db.query(AuditLog)

    if user_id is not None:
        query = query.filter(AuditLog.user_id == user_id)
    if action is not None:
        query = query.filter(AuditLog.action == action)
    if resource_type is not None:
        query = query.filter(AuditLog.resource_type == resource_type)
    if start_date is not None:
        query = query.filter(AuditLog.timestamp >= start_date)
    if end_date is not None:
        query = query.filter(AuditLog.timestamp <= end_date)

    total = query.count()
    logs = (
        query.order_by(AuditLog.timestamp.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return logs, total
