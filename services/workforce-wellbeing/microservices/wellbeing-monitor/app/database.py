"""
Database connection and session management for TimescaleDB.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy import text, event
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.config import get_settings

settings = get_settings()

# Create async engine for TimescaleDB
engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    pool_timeout=settings.database_pool_timeout,
    pool_recycle=settings.database_pool_recycle,
    pool_pre_ping=True,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create declarative base for models
Base = declarative_base()


async def init_db() -> None:
    """
    Initialize database schema and TimescaleDB extensions.

    This function:
    1. Creates all tables defined in models
    2. Enables TimescaleDB extension
    3. Creates hypertables for time-series data
    """
    async with engine.begin() as conn:
        # Import all models to ensure they are registered
        from app.models import wellbeing  # noqa: F401

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

        # Enable TimescaleDB extension
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;"))

        # Create hypertables for time-series tables
        # WellbeingIndicator hypertable
        try:
            await conn.execute(text("""
                SELECT create_hypertable(
                    'wellbeing_indicators',
                    'recorded_at',
                    if_not_exists => TRUE,
                    chunk_time_interval => INTERVAL '7 days'
                );
            """))
        except Exception as e:
            # Hypertable might already exist
            print(f"WellbeingIndicator hypertable creation: {e}")

        # ActivityLog hypertable
        try:
            await conn.execute(text("""
                SELECT create_hypertable(
                    'activity_logs',
                    'logged_at',
                    if_not_exists => TRUE,
                    chunk_time_interval => INTERVAL '7 days'
                );
            """))
        except Exception as e:
            # Hypertable might already exist
            print(f"ActivityLog hypertable creation: {e}")

        # Create indexes for better query performance
        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_wellbeing_indicators_employee_id
            ON wellbeing_indicators (employee_id, recorded_at DESC);
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_wellbeing_indicators_type
            ON wellbeing_indicators (indicator_type, recorded_at DESC);
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_surveys_employee_id
            ON surveys (employee_id, submitted_at DESC);
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_surveys_type
            ON surveys (survey_type, submitted_at DESC);
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_activity_logs_employee_id
            ON activity_logs (employee_id, logged_at DESC);
        """))

        await conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_activity_logs_type
            ON activity_logs (activity_type, logged_at DESC);
        """))

        # Set up retention policies
        try:
            await conn.execute(text("""
                SELECT add_retention_policy(
                    'wellbeing_indicators',
                    INTERVAL '730 days',
                    if_not_exists => TRUE
                );
            """))
        except Exception as e:
            print(f"WellbeingIndicator retention policy: {e}")

        try:
            await conn.execute(text("""
                SELECT add_retention_policy(
                    'activity_logs',
                    INTERVAL '365 days',
                    if_not_exists => TRUE
                );
            """))
        except Exception as e:
            print(f"ActivityLog retention policy: {e}")


async def close_db() -> None:
    """Close database connections."""
    await engine.dispose()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database sessions.

    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


@asynccontextmanager
async def get_db_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for getting database sessions.

    Yields:
        AsyncSession: Database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def check_db_connection() -> bool:
    """
    Check if database connection is healthy.

    Returns:
        bool: True if connection is healthy, False otherwise
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Database health check failed: {e}")
        return False
