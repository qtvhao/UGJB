"""
Configuration management for Wellbeing Monitor microservice.
"""

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""

    # Application settings
    app_name: str = "WellbeingMonitor"
    app_version: str = "1.0.0"
    debug: bool = False

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8071

    # Database settings (TimescaleDB/PostgreSQL)
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/wellbeing_monitor"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    database_pool_timeout: int = 30
    database_pool_recycle: int = 3600

    # Database connection settings for synchronous operations
    database_url_sync: Optional[str] = None

    # CORS settings
    cors_origins: list[str] = ["*"]
    cors_credentials: bool = True
    cors_methods: list[str] = ["*"]
    cors_headers: list[str] = ["*"]

    # Logging settings
    log_level: str = "INFO"
    log_format: str = "json"

    # API settings
    api_prefix: str = "/api/v1"

    # Health check settings
    health_check_timeout: int = 5

    # Data retention settings (in days)
    wellbeing_indicator_retention_days: int = 730  # 2 years
    survey_retention_days: int = 1095  # 3 years
    activity_log_retention_days: int = 365  # 1 year

    # Survey settings
    max_survey_questions: int = 50
    max_survey_responses_per_batch: int = 100

    # Activity log settings
    max_activity_logs_per_batch: int = 1000
    activity_log_batch_size: int = 100

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="allow"
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate sync database URL if not provided
        if not self.database_url_sync and self.database_url:
            self.database_url_sync = self.database_url.replace(
                "postgresql+asyncpg://", "postgresql+psycopg2://"
            )


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
