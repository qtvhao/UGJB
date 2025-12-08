"""
Health check endpoints for burnout predictor service
"""
from datetime import datetime
from typing import Dict
from fastapi import APIRouter, status
from pydantic import BaseModel

from app.config import settings
from app.services.predictor_service import predictor_service

router = APIRouter(prefix="/health", tags=["health"])


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    timestamp: str
    model_loaded: bool
    kafka_enabled: bool


class ReadinessResponse(BaseModel):
    """Readiness check response"""
    ready: bool
    checks: Dict[str, bool]
    timestamp: str


@router.get(
    "",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint"
)
async def health_check():
    """
    Basic health check endpoint.

    Returns service status and basic information.
    """
    model_loaded = predictor_service.model is not None

    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        service=settings.service_name,
        version=settings.service_version,
        timestamp=datetime.utcnow().isoformat(),
        model_loaded=model_loaded,
        kafka_enabled=settings.kafka_enabled
    )


@router.get(
    "/liveness",
    status_code=status.HTTP_200_OK,
    summary="Liveness probe"
)
async def liveness():
    """
    Kubernetes liveness probe endpoint.

    Returns 200 if the service is alive.
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}


@router.get(
    "/readiness",
    response_model=ReadinessResponse,
    status_code=status.HTTP_200_OK,
    summary="Readiness probe"
)
async def readiness():
    """
    Kubernetes readiness probe endpoint.

    Returns 200 if the service is ready to accept traffic.
    Checks model availability and critical dependencies.
    """
    checks = {
        "model_loaded": predictor_service.model is not None,
        "kafka_producer": (
            predictor_service.kafka_producer is not None
            if settings.kafka_enabled
            else True
        )
    }

    ready = all(checks.values())

    return ReadinessResponse(
        ready=ready,
        checks=checks,
        timestamp=datetime.utcnow().isoformat()
    )


@router.get(
    "/startup",
    status_code=status.HTTP_200_OK,
    summary="Startup probe"
)
async def startup():
    """
    Kubernetes startup probe endpoint.

    Returns 200 when the service has completed startup.
    """
    model_loaded = predictor_service.model is not None

    if not model_loaded:
        return {
            "status": "starting",
            "message": "Model still loading",
            "timestamp": datetime.utcnow().isoformat()
        }

    return {
        "status": "ready",
        "message": "Service started successfully",
        "timestamp": datetime.utcnow().isoformat()
    }
