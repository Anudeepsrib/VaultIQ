"""
Pydantic schemas for the audit module.

Response shapes for audit log queries.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class AuditLogOut(BaseModel):
    """Public representation of a single audit log entry.

    Attributes:
        id: Log entry primary key.
        timestamp: When the action occurred (UTC).
        user_id: Acting user's ID.
        user_role: Acting user's role at the time.
        action: Action verb.
        resource_type: Type of resource acted upon.
        resource_id: ID of the affected resource.
        ip_address: Client IP address.
        status: Outcome (success/failure).
        details: Optional additional context.
    """

    id: int
    timestamp: datetime
    user_id: Optional[int] = None
    user_role: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    status: str
    details: Optional[str] = None

    model_config = {"from_attributes": True}


class AuditLogList(BaseModel):
    """Paginated list of audit log entries.

    Attributes:
        logs: List of audit log records.
        total: Total number of matching records.
        page: Current page number.
        per_page: Records per page.
    """

    logs: List[AuditLogOut]
    total: int
    page: int
    per_page: int
