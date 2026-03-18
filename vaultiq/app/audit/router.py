"""
Audit log router — read-only access to the immutable audit trail.

Restricted to ``admin`` and ``auditor`` roles. Supports filtering
by user, action, resource type, and date range.

Endpoints:
    GET /audit/logs — Paginated, filterable audit log query.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.audit.schemas import AuditLogList, AuditLogOut
from app.audit.service import query_audit_logs
from app.auth.dependencies import require_roles
from app.database import get_db
from app.users.models import User

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get(
    "/logs",
    response_model=AuditLogList,
    summary="Query audit logs",
    description="Retrieve paginated audit logs with optional filters. "
    "Accessible to admin and auditor roles only.",
    response_description="Paginated audit log entries.",
)
async def get_audit_logs(
    user_id: Optional[int] = Query(None, description="Filter by acting user ID"),
    action: Optional[str] = Query(None, description="Filter by action verb"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    start_date: Optional[datetime] = Query(
        None, description="Include logs on or after this date"
    ),
    end_date: Optional[datetime] = Query(
        None, description="Include logs on or before this date"
    ),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(50, ge=1, le=100, description="Records per page"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["admin", "auditor"])),
) -> AuditLogList:
    """Query the append-only audit log with filters and pagination.

    Args:
        user_id: Optional filter by the ID of the user who performed the action.
        action: Optional filter by action type (e.g. ``user_created``).
        resource_type: Optional filter by resource type (e.g. ``user``).
        start_date: Optional lower bound on timestamp.
        end_date: Optional upper bound on timestamp.
        page: Page number (1-based).
        per_page: Number of records per page (max 100).
        db: Database session.
        current_user: Authenticated admin or auditor (injected by RBAC).

    Returns:
        AuditLogList with matching records and pagination metadata.
    """
    logs, total = query_audit_logs(
        db,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        start_date=start_date,
        end_date=end_date,
        page=page,
        per_page=per_page,
    )
    return AuditLogList(
        logs=[AuditLogOut.model_validate(log) for log in logs],
        total=total,
        page=page,
        per_page=per_page,
    )
