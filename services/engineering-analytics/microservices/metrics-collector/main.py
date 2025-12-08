from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import make_asgi_app

from app.config import get_settings
from app.database import engine, Base
from app.routers import (
    health_router,
    integrations_router,
    metrics_router,
    activities_router,
)
from app.routers.automation import router as automation_router
from app.routers.webhooks import router as webhooks_router

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MetricsCollector",
    description="Engineering Analytics - Metrics Collection Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics endpoint
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include routers
app.include_router(health_router)
app.include_router(integrations_router)
app.include_router(metrics_router)
app.include_router(activities_router)
app.include_router(automation_router)
app.include_router(webhooks_router)


@app.get("/")
async def root():
    return {
        "service": "metrics-collector",
        "version": "1.0.0",
        "status": "running",
    }
