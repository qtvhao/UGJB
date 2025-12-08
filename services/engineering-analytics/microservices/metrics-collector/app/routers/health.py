from datetime import datetime
from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health():
    return {
        "status": "UP",
        "service": "metrics-collector",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/health/ready")
async def ready():
    return {
        "status": "READY",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/health/live")
async def live():
    return {
        "status": "ALIVE",
        "timestamp": datetime.utcnow().isoformat(),
    }
