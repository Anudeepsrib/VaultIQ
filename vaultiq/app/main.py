"""
VaultIQ — FastAPI application factory.

Creates and configures the FastAPI app with:
- Global structured JSON exception handler (never leaks stack traces)
- CORS middleware configured from environment
- Structured logging middleware
- Rate limiting via SlowAPI
- Router registration for all modules
- Seed admin user creation on first startup
- Public ``/health`` endpoint
"""

from __future__ import annotations

import traceback
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.auth import router as auth_router
from app.audit import router as audit_router
from app.config import get_settings
from app.database import Base, SessionLocal, engine
from app.middleware.logging import StructuredLoggingMiddleware
from app.middleware.rate_limit import limiter
from app.users import router as users_router
from app.users.models import User, UserRole
from app.auth.service import hash_password

logger = structlog.get_logger("vaultiq.app")
settings = get_settings()


def _seed_admin(db_session) -> None:
    """Create the seed admin user if it does not already exist.

    Uses credentials from environment variables. This runs once
    during application startup.

    Args:
        db_session: An active SQLAlchemy session.
    """
    existing = (
        db_session.query(User)
        .filter(User.username == settings.seed_admin_username)
        .first()
    )

    if existing is None:
        admin = User(
            username=settings.seed_admin_username,
            email=settings.seed_admin_email,
            hashed_password=hash_password(settings.seed_admin_password),
            role=UserRole.admin,
            is_active=True,
        )
        db_session.add(admin)
        db_session.commit()
        logger.info("seed_admin_created", username=settings.seed_admin_username)
    else:
        logger.info("seed_admin_exists", username=settings.seed_admin_username)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: runs startup and shutdown logic.

    Startup:
        - Creates all database tables.
        - Seeds the admin user.

    Shutdown:
        - Disposes of the database engine.

    Args:
        app: The FastAPI application instance.
    """
    # Startup
    Base.metadata.create_all(bind=engine)
    logger.info("database_tables_created")

    db = SessionLocal()
    try:
        _seed_admin(db)
    finally:
        db.close()

    yield

    # Shutdown
    engine.dispose()
    logger.info("application_shutdown")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application.

    Returns:
        A fully configured FastAPI instance ready to serve requests.
    """
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=(
            "VaultIQ — Privacy-first financial document intelligence platform. "
            "RBAC-enforced, local LLM-powered structured data extraction."
        ),
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # ── Global Exception Handlers ────────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """Catch all unhandled exceptions and return structured JSON.

        Never exposes stack traces or internal details to the client.
        Logs the full traceback server-side for debugging.

        Args:
            request: The incoming HTTP request.
            exc: The unhandled exception.

        Returns:
            A 500 JSON response with a generic error message.
        """
        logger.error(
            "unhandled_exception",
            path=str(request.url.path),
            method=request.method,
            error_type=type(exc).__name__,
            error_detail=str(exc),
            traceback=traceback.format_exc(),
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "internal_server_error",
                "message": "An unexpected error occurred. Please try again later.",
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Return structured JSON for request validation failures.

        Args:
            request: The incoming HTTP request.
            exc: The validation error.

        Returns:
            A 422 JSON response with structured validation details.
        """
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "validation_error",
                "message": "Request validation failed",
                "details": exc.errors(),
            },
        )

    # ── Rate Limiting ────────────────────────────────────────────
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

    # ── CORS ─────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Structured Logging Middleware ────────────────────────────
    app.add_middleware(StructuredLoggingMiddleware)

    # ── Routers ──────────────────────────────────────────────────
    app.include_router(auth_router.router)
    app.include_router(users_router.router)
    app.include_router(audit_router.router)

    # ── Health Check ─────────────────────────────────────────────
    @app.get(
        "/health",
        tags=["System"],
        summary="Health check",
        description="Public endpoint returning application health status.",
        response_description="Health status object.",
    )
    async def health_check() -> dict:
        """Return the application health status.

        Returns:
            Dict with status and version information.
        """
        return {
            "status": "healthy",
            "version": settings.app_version,
            "app": settings.app_name,
        }

    return app


# Module-level app instance for ``uvicorn app.main:app``
app = create_app()
