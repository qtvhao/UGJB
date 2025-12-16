"""
Associated Frontend Files:
  - web/app/src/lib/api.ts (analyticsApi - lines 92-101)
  - web/app/src/pages/analytics/EngineeringMetricsPage.tsx
"""
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity import ActivitySource, ActivityType
from app.schemas.metrics import (
    EngineeringActivityCreate,
    EngineeringActivityResponse,
    EmployeeActivitySummary,
    PageResponse,
)
from app.services.activity_service import ActivityService

router = APIRouter(prefix="/activities", tags=["Activities"])


@router.post(
    "/", response_model=EngineeringActivityResponse, status_code=status.HTTP_201_CREATED
)
async def create_activity(
    data: EngineeringActivityCreate, db: Session = Depends(get_db)
):
    service = ActivityService(db)
    activity = service.create_activity(data)
    return activity


@router.post(
    "/batch",
    response_model=List[EngineeringActivityResponse],
    status_code=status.HTTP_201_CREATED,
)
async def create_activities_batch(
    data: List[EngineeringActivityCreate], db: Session = Depends(get_db)
):
    service = ActivityService(db)
    activities = service.create_activities_batch(data)
    return activities


@router.get("/{activity_id}", response_model=EngineeringActivityResponse)
async def get_activity(activity_id: UUID, db: Session = Depends(get_db)):
    service = ActivityService(db)
    activity = service.get_activity(activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity not found: {activity_id}",
        )
    return activity


@router.get("/", response_model=PageResponse)
async def list_activities(
    page: int = Query(default=0, ge=0),
    size: int = Query(default=50, ge=1, le=100),
    employee_id: Optional[UUID] = None,
    source: Optional[ActivitySource] = None,
    db: Session = Depends(get_db),
):
    service = ActivityService(db)
    activities, total = service.list_activities(page, size, employee_id, source)
    return PageResponse(
        content=[EngineeringActivityResponse.model_validate(a) for a in activities],
        total=total,
        page=page,
        size=size,
    )


@router.get("/employee/{employee_id}", response_model=List[EngineeringActivityResponse])
async def get_employee_activities(
    employee_id: UUID,
    source: Optional[ActivitySource] = None,
    activity_type: Optional[ActivityType] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
):
    service = ActivityService(db)
    activities = service.get_employee_activities(
        employee_id, source, activity_type, start_date, end_date
    )
    return activities


@router.get("/employee/{employee_id}/summary", response_model=EmployeeActivitySummary)
async def get_employee_activity_summary(
    employee_id: UUID,
    period: str = Query(..., pattern="^(week|sprint|month)$"),
    db: Session = Depends(get_db),
):
    service = ActivityService(db)

    now = datetime.utcnow()
    if period == "week":
        period_start = now - timedelta(days=7)
    elif period == "sprint":
        period_start = now - timedelta(days=14)
    else:  # month
        period_start = now - timedelta(days=30)

    summary = service.get_employee_activity_summary(
        employee_id, period, period_start, now
    )
    return summary
