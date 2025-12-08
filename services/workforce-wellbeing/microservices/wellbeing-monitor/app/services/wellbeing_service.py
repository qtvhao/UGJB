"""
Business logic for wellbeing data management.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, and_, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.wellbeing import ActivityLog, Survey, WellbeingIndicator
from app.schemas.wellbeing import (
    ActivityLogCreate,
    ActivityLogUpdate,
    SurveyCreate,
    SurveyUpdate,
    WellbeingIndicatorCreate,
)


class WellbeingService:
    """Service for managing wellbeing data."""

    def __init__(self, db: AsyncSession):
        """
        Initialize wellbeing service.

        Args:
            db: Database session
        """
        self.db = db

    # WellbeingIndicator operations
    async def create_indicator(
        self, indicator_data: WellbeingIndicatorCreate
    ) -> WellbeingIndicator:
        """
        Create a new wellbeing indicator.

        Args:
            indicator_data: Indicator creation data

        Returns:
            Created wellbeing indicator
        """
        indicator = WellbeingIndicator(
            employee_id=indicator_data.employee_id,
            indicator_type=indicator_data.indicator_type,
            value=indicator_data.value,
            source=indicator_data.source,
            source_id=indicator_data.source_id,
            metadata=indicator_data.metadata,
            recorded_at=indicator_data.recorded_at or datetime.utcnow(),
        )

        self.db.add(indicator)
        await self.db.commit()
        await self.db.refresh(indicator)

        return indicator

    async def create_indicators_batch(
        self, indicators_data: List[WellbeingIndicatorCreate]
    ) -> List[WellbeingIndicator]:
        """
        Create multiple wellbeing indicators in batch.

        Args:
            indicators_data: List of indicator creation data

        Returns:
            List of created wellbeing indicators
        """
        indicators = [
            WellbeingIndicator(
                employee_id=data.employee_id,
                indicator_type=data.indicator_type,
                value=data.value,
                source=data.source,
                source_id=data.source_id,
                metadata=data.metadata,
                recorded_at=data.recorded_at or datetime.utcnow(),
            )
            for data in indicators_data
        ]

        self.db.add_all(indicators)
        await self.db.commit()

        # Refresh all indicators
        for indicator in indicators:
            await self.db.refresh(indicator)

        return indicators

    async def get_indicator(self, indicator_id: UUID) -> Optional[WellbeingIndicator]:
        """
        Get wellbeing indicator by ID.

        Args:
            indicator_id: Indicator UUID

        Returns:
            Wellbeing indicator or None
        """
        result = await self.db.execute(
            select(WellbeingIndicator).where(WellbeingIndicator.id == indicator_id)
        )
        return result.scalar_one_or_none()

    async def get_indicators_by_employee(
        self,
        employee_id: UUID,
        indicator_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[WellbeingIndicator]:
        """
        Get wellbeing indicators for an employee.

        Args:
            employee_id: Employee UUID
            indicator_type: Optional indicator type filter
            start_date: Optional start date filter
            end_date: Optional end date filter
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            List of wellbeing indicators
        """
        query = select(WellbeingIndicator).where(
            WellbeingIndicator.employee_id == employee_id
        )

        if indicator_type:
            query = query.where(WellbeingIndicator.indicator_type == indicator_type)

        if start_date:
            query = query.where(WellbeingIndicator.recorded_at >= start_date)

        if end_date:
            query = query.where(WellbeingIndicator.recorded_at <= end_date)

        query = query.order_by(desc(WellbeingIndicator.recorded_at))
        query = query.limit(limit).offset(offset)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_indicator_aggregates(
        self,
        employee_id: UUID,
        indicator_type: str,
        start_date: datetime,
        end_date: datetime,
    ) -> dict:
        """
        Get aggregated statistics for indicators.

        Args:
            employee_id: Employee UUID
            indicator_type: Indicator type
            start_date: Start date
            end_date: End date

        Returns:
            Dictionary with aggregated statistics
        """
        result = await self.db.execute(
            select(
                func.avg(WellbeingIndicator.value).label("avg_value"),
                func.min(WellbeingIndicator.value).label("min_value"),
                func.max(WellbeingIndicator.value).label("max_value"),
                func.count(WellbeingIndicator.id).label("count"),
            ).where(
                and_(
                    WellbeingIndicator.employee_id == employee_id,
                    WellbeingIndicator.indicator_type == indicator_type,
                    WellbeingIndicator.recorded_at >= start_date,
                    WellbeingIndicator.recorded_at <= end_date,
                )
            )
        )

        row = result.first()
        return {
            "average": float(row.avg_value) if row.avg_value else None,
            "minimum": float(row.min_value) if row.min_value else None,
            "maximum": float(row.max_value) if row.max_value else None,
            "count": int(row.count) if row.count else 0,
        }

    # Survey operations
    async def create_survey(self, survey_data: SurveyCreate) -> Survey:
        """
        Create a new survey.

        Args:
            survey_data: Survey creation data

        Returns:
            Created survey
        """
        survey = Survey(
            employee_id=survey_data.employee_id,
            survey_type=survey_data.survey_type,
            survey_version=survey_data.survey_version,
            questions=survey_data.questions,
            responses=survey_data.responses,
            overall_score=survey_data.overall_score,
            dimension_scores=survey_data.dimension_scores,
            is_completed=survey_data.is_completed,
            completion_percentage=survey_data.completion_percentage,
            notes=survey_data.notes,
            metadata=survey_data.metadata,
            submitted_at=survey_data.submitted_at or datetime.utcnow(),
        )

        self.db.add(survey)
        await self.db.commit()
        await self.db.refresh(survey)

        return survey

    async def get_survey(self, survey_id: UUID) -> Optional[Survey]:
        """
        Get survey by ID.

        Args:
            survey_id: Survey UUID

        Returns:
            Survey or None
        """
        result = await self.db.execute(
            select(Survey).where(Survey.id == survey_id)
        )
        return result.scalar_one_or_none()

    async def get_surveys_by_employee(
        self,
        employee_id: UUID,
        survey_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[Survey]:
        """
        Get surveys for an employee.

        Args:
            employee_id: Employee UUID
            survey_type: Optional survey type filter
            start_date: Optional start date filter
            end_date: Optional end date filter
            limit: Maximum number of results
            offset: Number of results to skip

        Returns:
            List of surveys
        """
        query = select(Survey).where(Survey.employee_id == employee_id)

        if survey_type:
            query = query.where(Survey.survey_type == survey_type)

        if start_date:
            query = query.where(Survey.submitted_at >= start_date)

        if end_date:
            query = query.where(Survey.submitted_at <= end_date)

        query = query.order_by(desc(Survey.submitted_at))
        query = query.limit(limit).offset(offset)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_survey(
        self, survey_id: UUID, update_data: SurveyUpdate
    ) -> Optional[Survey]:
        """
        Update a survey.

        Args:
            survey_id: Survey UUID
            update_data: Survey update data

        Returns:
            Updated survey or None
        """
        survey = await self.get_survey(survey_id)
        if not survey:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(survey, key, value)

        survey.updated_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(survey)

        return survey

    # ActivityLog operations
    async def create_activity_log(self, log_data: ActivityLogCreate) -> ActivityLog:
        """
        Create a new activity log.

        Args:
            log_data: Activity log creation data

        Returns:
            Created activity log
        """
        activity_log = ActivityLog(
            employee_id=log_data.employee_id,
            activity_type=log_data.activity_type,
            activity_category=log_data.activity_category,
            duration_seconds=log_data.duration_seconds,
            description=log_data.description,
            metadata=log_data.metadata,
            source=log_data.source,
            productivity_score=log_data.productivity_score,
            stress_indicator=log_data.stress_indicator,
            logged_at=log_data.logged_at or datetime.utcnow(),
            activity_start_time=log_data.activity_start_time,
            activity_end_time=log_data.activity_end_time,
        )

        self.db.add(activity_log)
        await self.db.commit()
        await self.db.refresh(activity_log)

        return activity_log

    async def create_activity_logs_batch(
        self, logs_data: List[ActivityLogCreate]
    ) -> List[ActivityLog]:
        """
        Create multiple activity logs in batch.

        Args:
            logs_data: List of activity log creation data

        Returns:
            List of created activity logs
        """
        logs = [
            ActivityLog(
                employee_id=data.employee_id,
                activity_type=data.activity_type,
                activity_category=data.activity_category,
                duration_seconds=data.duration_seconds,
                description=data.description,
                metadata=data.metadata,
                source=data.source,
                productivity_score=data.productivity_score,
                stress_indicator=data.stress_indicator,
                logged_at=data.logged_at or datetime.utcnow(),
                activity_start_time=data.activity_start_time,
                activity_end_time=data.activity_end_time,
            )
            for data in logs_data
        ]

        self.db.add_all(logs)
        await self.db.commit()

        # Refresh all logs
        for log in logs:
            await self.db.refresh(log)

        return logs

    async def get_activity_log(self, log_id: UUID) -> Optional[ActivityLog]:
        """
        Get activity log by ID.

        Args:
            log_id: Activity log UUID

        Returns:
            Activity log or None
        """
        result = await self.db.execute(
            select(ActivityLog).where(ActivityLog.id == log_id)
        )
        return result.scalar_one_or_none()

    async def get_activity_logs_by_employee(
        self,
        employee_id: UUID,
        activity_type: Optional[str] = None,
        activity_category: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ActivityLog]:
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

        Returns:
            List of activity logs
        """
        query = select(ActivityLog).where(ActivityLog.employee_id == employee_id)

        if activity_type:
            query = query.where(ActivityLog.activity_type == activity_type)

        if activity_category:
            query = query.where(ActivityLog.activity_category == activity_category)

        if start_date:
            query = query.where(ActivityLog.logged_at >= start_date)

        if end_date:
            query = query.where(ActivityLog.logged_at <= end_date)

        query = query.order_by(desc(ActivityLog.logged_at))
        query = query.limit(limit).offset(offset)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_activity_log(
        self, log_id: UUID, update_data: ActivityLogUpdate
    ) -> Optional[ActivityLog]:
        """
        Update an activity log.

        Args:
            log_id: Activity log UUID
            update_data: Activity log update data

        Returns:
            Updated activity log or None
        """
        log = await self.get_activity_log(log_id)
        if not log:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(log, key, value)

        await self.db.commit()
        await self.db.refresh(log)

        return log

    async def get_activity_log_aggregates(
        self,
        employee_id: UUID,
        activity_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> dict:
        """
        Get aggregated statistics for activity logs.

        Args:
            employee_id: Employee UUID
            activity_type: Optional activity type filter
            start_date: Optional start date filter
            end_date: Optional end date filter

        Returns:
            Dictionary with aggregated statistics
        """
        query = select(
            func.count(ActivityLog.id).label("count"),
            func.sum(ActivityLog.duration_seconds).label("total_duration"),
            func.avg(ActivityLog.productivity_score).label("avg_productivity"),
            func.avg(ActivityLog.stress_indicator).label("avg_stress"),
        ).where(ActivityLog.employee_id == employee_id)

        if activity_type:
            query = query.where(ActivityLog.activity_type == activity_type)

        if start_date:
            query = query.where(ActivityLog.logged_at >= start_date)

        if end_date:
            query = query.where(ActivityLog.logged_at <= end_date)

        result = await self.db.execute(query)
        row = result.first()

        return {
            "count": int(row.count) if row.count else 0,
            "total_duration_seconds": int(row.total_duration) if row.total_duration else 0,
            "average_productivity_score": float(row.avg_productivity) if row.avg_productivity else None,
            "average_stress_indicator": float(row.avg_stress) if row.avg_stress else None,
        }
