"""
VaultIQ application configuration.

Loads all settings from environment variables (or .env file) using
pydantic-settings. Every secret and tuneable is defined here — nothing
is hard-coded in business logic.
"""

from __future__ import annotations

import json
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── App ──────────────────────────────────────────────────
    app_name: str = "VaultIQ"
    app_version: str = "0.1.0"
    debug: bool = False

    # ── Database ─────────────────────────────────────────────
    database_url: str = "sqlite:///./vaultiq.db"

    # ── JWT ──────────────────────────────────────────────────
    jwt_secret_key: str = "CHANGE-ME-TO-A-RANDOM-64-CHAR-STRING"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # ── Ollama ───────────────────────────────────────────────
    ollama_base_url: str = "http://localhost:11434"
    ollama_default_model: str = "phi4"

    # ── ChromaDB ─────────────────────────────────────────────
    chroma_persist_dir: str = "./chroma_data"

    # ── CORS ─────────────────────────────────────────────────
    cors_origins: str = '["http://localhost:3000","http://localhost:8000"]'

    @property
    def cors_origin_list(self) -> List[str]:
        """Parse CORS origins from JSON string to list."""
        return json.loads(self.cors_origins)

    # ── Rate Limiting ────────────────────────────────────────
    rate_limit_per_minute: int = 100

    # ── Seed Admin ───────────────────────────────────────────
    seed_admin_username: str = "admin"
    seed_admin_password: str = "AdminPassword123!"
    seed_admin_email: str = "admin@vaultiq.local"


def get_settings() -> Settings:
    """Return a cached Settings instance.

    Returns:
        Settings: The application settings loaded from the environment.
    """
    return Settings()
