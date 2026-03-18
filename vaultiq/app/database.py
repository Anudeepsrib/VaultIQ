"""
SQLAlchemy database engine, session factory, and declarative base.

Provides ``get_db`` — a FastAPI dependency that yields a scoped session
and guarantees cleanup. Configured for SQLite in development; swap
``DATABASE_URL`` for PostgreSQL in production.
"""

from __future__ import annotations

from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()

# For SQLite we need check_same_thread=False so FastAPI's thread-pool
# workers can share the connection.
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=settings.debug,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Declarative base for all SQLAlchemy models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session.

    Yields a ``Session`` and ensures it is closed after the request
    completes, regardless of success or failure.

    Yields:
        Session: An active SQLAlchemy session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def enable_sqlite_wal(dbapi_conn, connection_record):
    """Enable WAL mode for SQLite for better concurrent read performance.

    Args:
        dbapi_conn: The raw DBAPI connection.
        connection_record: The SQLAlchemy connection record (unused).
    """
    if settings.database_url.startswith("sqlite"):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()


# Register WAL mode listener for SQLite connections
if settings.database_url.startswith("sqlite"):
    event.listen(engine, "connect", enable_sqlite_wal)
