"""
Structured logging middleware using structlog.

Logs every HTTP request/response with:
- Method, path, status code
- Elapsed time in milliseconds
- Client IP address
- User ID (if authenticated)

All output is JSON-formatted for machine parsing.
"""

from __future__ import annotations

import time

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

logger = structlog.get_logger("vaultiq.access")


class StructuredLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs every request/response as structured JSON.

    Captures timing, status, client IP, and (where available) the
    authenticated user's ID from the request state.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Process each request, logging structured access information.

        Args:
            request: The incoming HTTP request.
            call_next: The next middleware or route handler.

        Returns:
            The HTTP response from the downstream handler.
        """
        start_time = time.perf_counter()

        # Extract client IP
        client_ip = request.client.host if request.client else "unknown"

        response: Response = await call_next(request)

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        # Try to get user_id from request state (set by auth dependency)
        user_id = getattr(request.state, "user_id", None)

        logger.info(
            "http_request",
            method=request.method,
            path=str(request.url.path),
            status_code=response.status_code,
            elapsed_ms=round(elapsed_ms, 2),
            client_ip=client_ip,
            user_id=user_id,
        )

        return response
