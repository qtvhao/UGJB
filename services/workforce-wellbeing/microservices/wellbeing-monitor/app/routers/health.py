"""
Health check endpoints for Wellbeing Monitor microservice.

Associated Frontend Files:
  - web/app/src/lib/api.ts (health checks via api-gateway)
  - web/app/src/components/layout/Sidebar.tsx (system status display)
"""

from datetime import datetime
from typing import Dict

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import check_db_connection, get_db

router = APIRouter(tags=["Health"])
settings = get_settings()


@router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, str],
    summary="Basic health check",
    description="Returns basic health status of the service",
)
async def health_check() -> Dict[str, str]:
    """
    Basic health check endpoint.

    Returns:
        Dictionary with health status
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get(
    "/health/ready",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, str | bool],
    summary="Readiness check",
    description="Returns readiness status including database connectivity",
)
async def readiness_check(db: AsyncSession = Depends(get_db)) -> Dict[str, str | bool]:
    """
    Readiness check endpoint including database connectivity.

    Args:
        db: Database session

    Returns:
        Dictionary with readiness status and component health
    """
    db_healthy = await check_db_connection()

    return {
        "status": "ready" if db_healthy else "not_ready",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_healthy,
    }


@router.get(
    "/health/live",
    status_code=status.HTTP_200_OK,
    response_model=Dict[str, str],
    summary="Liveness check",
    description="Returns liveness status of the service",
)
async def liveness_check() -> Dict[str, str]:
    """
    Liveness check endpoint.

    Returns:
        Dictionary with liveness status
    """
    return {
        "status": "alive",
        "service": settings.app_name,
        "version": settings.app_version,
        "timestamp": datetime.utcnow().isoformat(),
    }
