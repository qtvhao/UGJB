"""
Main entry point for Burnout Predictor service
Runs both FastAPI (REST) and gRPC servers
"""
import asyncio
import logging
import signal
import sys

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import predictions, health
from app.services.predictor_service import predictor_service
from app.grpc_server import serve_grpc

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Burnout Predictor API",
    description="ML-based burnout risk prediction service",
    version=settings.service_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(predictions.router)


@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.service_name} v{settings.service_version}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down...")
    predictor_service.close()


@app.get("/")
async def root():
    return {
        "service": settings.service_name,
        "version": settings.service_version,
        "status": "running"
    }


def serve_rest():
    uvicorn.run(app, host=settings.rest_host, port=settings.rest_port)


async def main():
    grpc_task = asyncio.create_task(serve_grpc())
    try:
        serve_rest()
    except KeyboardInterrupt:
        grpc_task.cancel()


if __name__ == "__main__":
    signal.signal(signal.SIGINT, lambda s, f: sys.exit(0))
    signal.signal(signal.SIGTERM, lambda s, f: sys.exit(0))
    asyncio.run(main())
