from datetime import datetime
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.metrics import MetricType
from app.schemas.metrics import MetricCreate, MetricResponse, PageResponse
from app.services.metrics_service import MetricsService

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.post("/", response_model=MetricResponse, status_code=status.HTTP_201_CREATED)
async def create_metric(data: MetricCreate, db: Session = Depends(get_db)):
    service = MetricsService(db)
    metric = service.create_metric(data)
    return metric


@router.post("/batch", response_model=List[MetricResponse], status_code=status.HTTP_201_CREATED)
async def create_metrics_batch(
    data: List[MetricCreate], db: Session = Depends(get_db)
):
    service = MetricsService(db)
    metrics = service.create_metrics_batch(data)
    return metrics


@router.get("/{metric_id}", response_model=MetricResponse)
async def get_metric(metric_id: UUID, db: Session = Depends(get_db)):
    service = MetricsService(db)
    metric = service.get_metric(metric_id)
    if not metric:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Metric not found: {metric_id}",
        )
    return metric


@router.get("/", response_model=PageResponse)
async def list_metrics(
    page: int = Query(default=0, ge=0),
    size: int = Query(default=50, ge=1, le=100),
    employee_id: Optional[UUID] = None,
    metric_type: Optional[MetricType] = None,
    db: Session = Depends(get_db),
):
    service = MetricsService(db)
    metrics, total = service.list_metrics(page, size, employee_id, metric_type)
    return PageResponse(
        content=[MetricResponse.model_validate(m) for m in metrics],
        total=total,
        page=page,
        size=size,
    )


@router.get("/employee/{employee_id}", response_model=List[MetricResponse])
async def get_employee_metrics(
    employee_id: UUID,
    period_type: Optional[str] = None,
    period_start: Optional[datetime] = None,
    period_end: Optional[datetime] = None,
    metric_type: Optional[MetricType] = None,
    db: Session = Depends(get_db),
):
    service = MetricsService(db)
    metrics = service.get_employee_metrics(
        employee_id, period_type, period_start, period_end, metric_type
    )
    return metrics


@router.get("/employee/{employee_id}/summary")
async def get_employee_metrics_summary(
    employee_id: UUID,
    period_start: datetime,
    period_end: datetime,
    db: Session = Depends(get_db),
):
    service = MetricsService(db)
    summary = service.get_employee_metrics_summary(employee_id, period_start, period_end)
    return summary
