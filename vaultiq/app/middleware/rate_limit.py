"""
Per-user rate limiting middleware.

Uses SlowAPI with an in-memory backend (suitable for single-instance
deployments). Limits are configurable via ``RATE_LIMIT_PER_MINUTE``
in ``.env``.
"""

from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

settings = get_settings()

# Use client IP as the rate-limit key; in production with a reverse
# proxy, consider using X-Forwarded-For.
limiter = Limiter(key_func=get_remote_address)
