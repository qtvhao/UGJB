"""
REST endpoints for wellbeing data management.

Associated Frontend Files:
  - web/app/src/lib/api.ts (wellbeingApi.wellbeing - lines 148-151)
  - web/app/src/pages/wellbeing/WellbeingPage.tsx
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.wellbeing import (
    ActivityLogCreate,
    ActivityLogResponse,
    ActivityLogUpdate,
    BatchActivityLogCreate,
    BatchWellbeingIndicatorCreate,
    SurveyCreate,
    SurveyResponse,
    SurveyUpdate,
    WellbeingIndicatorCreate,
    WellbeingIndicatorResponse,
)
from app.services.wellbeing_service import WellbeingService

router = APIRouter(prefix="/api/v1", tags=["Wellbeing"])


# WellbeingIndicator endpoints
@router.post(
    "/indicators",
    status_code=status.HTTP_201_CREATED,
    response_model=WellbeingIndicatorResponse,
    summary="Create wellbeing indicator",
    description="Create a new wellbeing indicator for an employee",
)
async def create_indicator(
    indicator_data: WellbeingIndicatorCreate,
    db: AsyncSession = Depends(get_db),
) -> WellbeingIndicatorResponse:
    """
    Create a new wellbeing indicator.

    Args:
        indicator_data: Indicator creation data
        db: Database session

    Returns:
        Created wellbeing indicator
    """
    service = WellbeingService(db)
    indicator = await service.create_indicator(indicator_data)
    return WellbeingIndicatorResponse.model_validate(indicator)


@router.post(
    "/indicators/batch",
    status_code=status.HTTP_201_CREATED,
    response_model=List[WellbeingIndicatorResponse],
    summary="Create wellbeing indicators in batch",
    description="Create multiple wellbeing indicators at once",
)
async def create_indicators_batch(
    batch_data: BatchWellbeingIndicatorCreate,
    db: AsyncSession = Depends(get_db),
) -> List[WellbeingIndicatorResponse]:
    """
    Create multiple wellbeing indicators in batch.

    Args:
        batch_data: Batch indicator creation data
        db: Database session

    Returns:
        List of created wellbeing indicators
    """
    service = WellbeingService(db)
    indicators = await service.create_indicators_batch(batch_data.indicators)
    return [WellbeingIndicatorResponse.model_validate(ind) for ind in indicators]


@router.get(
    "/indicators/{indicator_id}",
    status_code=status.HTTP_200_OK,
    response_model=WellbeingIndicatorResponse,
    summary="Get wellbeing indicator",
    description="Retrieve a specific wellbeing indicator by ID",
)
async def get_indicator(
    indicator_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> WellbeingIndicatorResponse:
    """
    Get wellbeing indicator by ID.

    Args:
        indicator_id: Indicator UUID
        db: Database session

    Returns:
        Wellbeing indicator

    Raises:
        HTTPException: If indicator not found
    """
    service = WellbeingService(db)
    indicator = await service.get_indicator(indicator_id)

    if not indicator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Indicator {indicator_id} not found",
        )

    return WellbeingIndicatorResponse.model_validate(indicator)


@router.get(
    "/employees/{employee_id}/indicators",
    status_code=status.HTTP_200_OK,
    response_model=List[WellbeingIndicatorResponse],
    summary="Get employee wellbeing indicators",
    description="Retrieve wellbeing indicators for a specific employee",
)
async def get_employee_indicators(
    employee_id: UUID,
    indicator_type: Optional[str] = Query(None, description="Filter by indicator type"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
) -> List[WellbeingIndicatorResponse]:
    """
    Get wellbeing indicators for an employee.

    Args:
        employee_id: Employee UUID
        indicator_type: Optional indicator type filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        limit: Maximum number of results
        offset: Number of results to skip
        db: Database session

    Returns:
        List of wellbeing indicators
    """
    service = WellbeingService(db)
    indicators = await service.get_indicators_by_employee(
        employee_id=employee_id,
        indicator_type=indicator_type,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )
    return [WellbeingIndicatorResponse.model_validate(ind) for ind in indicators]


@router.get(
    "/employees/{employee_id}/indicators/aggregates",
    status_code=status.HTTP_200_OK,
    response_model=dict,
    summary="Get indicator aggregates",
    description="Get aggregated statistics for employee wellbeing indicators",
)
async def get_indicator_aggregates(
    employee_id: UUID,
    indicator_type: str = Query(..., description="Indicator type"),
    start_date: datetime = Query(..., description="Start date for aggregation"),
    end_date: datetime = Query(..., description="End date for aggregation"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Get aggregated statistics for wellbeing indicators.

    Args:
        employee_id: Employee UUID
        indicator_type: Indicator type
        start_date: Start date
        end_date: End date
        db: Database session

    Returns:
        Dictionary with aggregated statistics
    """
    service = WellbeingService(db)
    return await service.get_indicator_aggregates(
        employee_id=employee_id,
        indicator_type=indicator_type,
        start_date=start_date,
        end_date=end_date,
    )


# Survey endpoints
@router.post(
    "/surveys",
    status_code=status.HTTP_201_CREATED,
    response_model=SurveyResponse,
    summary="Create survey",
    description="Create a new wellbeing survey response",
)
async def create_survey(
    survey_data: SurveyCreate,
    db: AsyncSession = Depends(get_db),
) -> SurveyResponse:
    """
    Create a new survey.

    Args:
        survey_data: Survey creation data
        db: Database session

    Returns:
        Created survey
    """
    service = WellbeingService(db)
    survey = await service.create_survey(survey_data)
    return SurveyResponse.model_validate(survey)


@router.get(
    "/surveys/{survey_id}",
    status_code=status.HTTP_200_OK,
    response_model=SurveyResponse,
    summary="Get survey",
    description="Retrieve a specific survey by ID",
)
async def get_survey(
    survey_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> SurveyResponse:
    """
    Get survey by ID.

    Args:
        survey_id: Survey UUID
        db: Database session

    Returns:
        Survey

    Raises:
        HTTPException: If survey not found
    """
    service = WellbeingService(db)
    survey = await service.get_survey(survey_id)

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey {survey_id} not found",
        )

    return SurveyResponse.model_validate(survey)


@router.get(
    "/employees/{employee_id}/surveys",
    status_code=status.HTTP_200_OK,
    response_model=List[SurveyResponse],
    summary="Get employee surveys",
    description="Retrieve surveys for a specific employee",
)
async def get_employee_surveys(
    employee_id: UUID,
    survey_type: Optional[str] = Query(None, description="Filter by survey type"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
) -> List[SurveyResponse]:
    """
    Get surveys for an employee.

    Args:
        employee_id: Employee UUID
        survey_type: Optional survey type filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        limit: Maximum number of results
        offset: Number of results to skip
        db: Database session

    Returns:
        List of surveys
    """
    service = WellbeingService(db)
    surveys = await service.get_surveys_by_employee(
        employee_id=employee_id,
        survey_type=survey_type,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )
    return [SurveyResponse.model_validate(survey) for survey in surveys]


@router.patch(
    "/surveys/{survey_id}",
    status_code=status.HTTP_200_OK,
    response_model=SurveyResponse,
    summary="Update survey",
    description="Update an existing survey",
)
async def update_survey(
    survey_id: UUID,
    update_data: SurveyUpdate,
    db: AsyncSession = Depends(get_db),
) -> SurveyResponse:
    """
    Update a survey.

    Args:
        survey_id: Survey UUID
        update_data: Survey update data
        db: Database session

    Returns:
        Updated survey

    Raises:
        HTTPException: If survey not found
    """
    service = WellbeingService(db)
    survey = await service.update_survey(survey_id, update_data)

    if not survey:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Survey {survey_id} not found",
        )

    return SurveyResponse.model_validate(survey)


# ActivityLog endpoints
@router.post(
    "/activity-logs",
    status_code=status.HTTP_201_CREATED,
    response_model=ActivityLogResponse,
    summary="Create activity log",
    description="Create a new activity log entry",
)
async def create_activity_log(
    log_data: ActivityLogCreate,
    db: AsyncSession = Depends(get_db),
) -> ActivityLogResponse:
    """
    Create a new activity log.

    Args:
        log_data: Activity log creation data
        db: Database session

    Returns:
        Created activity log
    """
    service = WellbeingService(db)
    log = await service.create_activity_log(log_data)
    return ActivityLogResponse.model_validate(log)


@router.post(
    "/activity-logs/batch",
    status_code=status.HTTP_201_CREATED,
    response_model=List[ActivityLogResponse],
    summary="Create activity logs in batch",
    description="Create multiple activity logs at once",
)
async def create_activity_logs_batch(
    batch_data: BatchActivityLogCreate,
    db: AsyncSession = Depends(get_db),
) -> List[ActivityLogResponse]:
    """
    Create multiple activity logs in batch.

    Args:
        batch_data: Batch activity log creation data
        db: Database session

    Returns:
        List of created activity logs
    """
    service = WellbeingService(db)
    logs = await service.create_activity_logs_batch(batch_data.logs)
    return [ActivityLogResponse.model_validate(log) for log in logs]


@router.get(
    "/activity-logs/{log_id}",
    status_code=status.HTTP_200_OK,
    response_model=ActivityLogResponse,
    summary="Get activity log",
    description="Retrieve a specific activity log by ID",
)
async def get_activity_log(
    log_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> ActivityLogResponse:
    """
    Get activity log by ID.

    Args:
        log_id: Activity log UUID
        db: Database session

    Returns:
        Activity log

    Raises:
        HTTPException: If log not found
    """
    service = WellbeingService(db)
    log = await service.get_activity_log(log_id)

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity log {log_id} not found",
        )

    return ActivityLogResponse.model_validate(log)


@router.get(
    "/employees/{employee_id}/activity-logs",
    status_code=status.HTTP_200_OK,
    response_model=List[ActivityLogResponse],
    summary="Get employee activity logs",
    description="Retrieve activity logs for a specific employee",
)
async def get_employee_activity_logs(
    employee_id: UUID,
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    activity_category: Optional[str] = Query(None, description="Filter by activity category"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_db),
) -> List[ActivityLogResponse]:
    """
    Get activity logs for an employee.

    Args:
        employee_id: Employee UUID
        activity_type: Optional activity type filter
        activity_category: Optional activity category filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        limit: Maximum number of results
        offset: Number of results to skip
        db: Database session

    Returns:
        List of activity logs
    """
    service = WellbeingService(db)
    logs = await service.get_activity_logs_by_employee(
        employee_id=employee_id,
        activity_type=activity_type,
        activity_category=activity_category,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
        offset=offset,
    )
    return [ActivityLogResponse.model_validate(log) for log in logs]


@router.patch(
    "/activity-logs/{log_id}",
    status_code=status.HTTP_200_OK,
    response_model=ActivityLogResponse,
    summary="Update activity log",
    description="Update an existing activity log",
)
async def update_activity_log(
    log_id: UUID,
    update_data: ActivityLogUpdate,
    db: AsyncSession = Depends(get_db),
) -> ActivityLogResponse:
    """
    Update an activity log.

    Args:
        log_id: Activity log UUID
        update_data: Activity log update data
        db: Database session

    Returns:
        Updated activity log

    Raises:
        HTTPException: If log not found
    """
    service = WellbeingService(db)
    log = await service.update_activity_log(log_id, update_data)

    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity log {log_id} not found",
        )

    return ActivityLogResponse.model_validate(log)


@router.get(
    "/employees/{employee_id}/activity-logs/aggregates",
    status_code=status.HTTP_200_OK,
    response_model=dict,
    summary="Get activity log aggregates",
    description="Get aggregated statistics for employee activity logs",
)
async def get_activity_log_aggregates(
    employee_id: UUID,
    activity_type: Optional[str] = Query(None, description="Filter by activity type"),
    start_date: Optional[datetime] = Query(None, description="Start date for aggregation"),
    end_date: Optional[datetime] = Query(None, description="End date for aggregation"),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Get aggregated statistics for activity logs.

    Args:
        employee_id: Employee UUID
        activity_type: Optional activity type filter
        start_date: Optional start date filter
        end_date: Optional end date filter
        db: Database session

    Returns:
        Dictionary with aggregated statistics
    """
    service = WellbeingService(db)
    return await service.get_activity_log_aggregates(
        employee_id=employee_id,
        activity_type=activity_type,
        start_date=start_date,
        end_date=end_date,
    )
