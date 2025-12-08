from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.activity import EngineeringActivity, ActivitySource, ActivityType
from app.schemas.metrics import EngineeringActivityCreate, EmployeeActivitySummary


class ActivityService:
    def __init__(self, db: Session):
        self.db = db

    def create_activity(self, data: EngineeringActivityCreate) -> EngineeringActivity:
        activity = EngineeringActivity(
            employee_id=data.employee_id,
            source=data.source,
            activity_type=data.activity_type,
            external_id=data.external_id,
            title=data.title,
            description=data.description,
            repository_id=data.repository_id,
            project_id=data.project_id,
            occurred_at=data.occurred_at,
            raw_data=data.raw_data,
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def create_activities_batch(
        self, activities: List[EngineeringActivityCreate]
    ) -> List[EngineeringActivity]:
        db_activities = []
        for data in activities:
            activity = EngineeringActivity(
                employee_id=data.employee_id,
                source=data.source,
                activity_type=data.activity_type,
                external_id=data.external_id,
                title=data.title,
                description=data.description,
                repository_id=data.repository_id,
                project_id=data.project_id,
                occurred_at=data.occurred_at,
                raw_data=data.raw_data,
            )
            db_activities.append(activity)
        self.db.add_all(db_activities)
        self.db.commit()
        return db_activities

    def get_activity(self, activity_id: UUID) -> Optional[EngineeringActivity]:
        return self.db.query(EngineeringActivity).filter(
            EngineeringActivity.activity_id == activity_id
        ).first()

    def get_employee_activities(
        self,
        employee_id: UUID,
        source: Optional[ActivitySource] = None,
        activity_type: Optional[ActivityType] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> List[EngineeringActivity]:
        query = self.db.query(EngineeringActivity).filter(
            EngineeringActivity.employee_id == employee_id
        )

        if source:
            query = query.filter(EngineeringActivity.source == source)
        if activity_type:
            query = query.filter(EngineeringActivity.activity_type == activity_type)
        if start_date:
            query = query.filter(EngineeringActivity.occurred_at >= start_date)
        if end_date:
            query = query.filter(EngineeringActivity.occurred_at <= end_date)

        return query.order_by(EngineeringActivity.occurred_at.desc()).all()

    def get_employee_activity_summary(
        self,
        employee_id: UUID,
        period: str,
        period_start: datetime,
        period_end: datetime,
    ) -> EmployeeActivitySummary:
        # Count activities by type
        activity_counts = self.db.query(
            EngineeringActivity.activity_type,
            func.count(EngineeringActivity.activity_id).label("count"),
        ).filter(
            EngineeringActivity.employee_id == employee_id,
            EngineeringActivity.occurred_at >= period_start,
            EngineeringActivity.occurred_at <= period_end,
        ).group_by(EngineeringActivity.activity_type).all()

        counts = {ac.activity_type: ac.count for ac in activity_counts}

        return EmployeeActivitySummary(
            employee_id=employee_id,
            period=period,
            period_start=period_start,
            period_end=period_end,
            commits=counts.get(ActivityType.COMMIT, 0),
            pull_requests_opened=counts.get(ActivityType.PULL_REQUEST, 0),
            pull_requests_closed=0,  # Would need separate tracking
            code_review_participations=counts.get(ActivityType.CODE_REVIEW, 0),
            jira_issues_completed=counts.get(ActivityType.ISSUE_COMPLETED, 0),
        )

    def list_activities(
        self,
        page: int = 0,
        size: int = 50,
        employee_id: Optional[UUID] = None,
        source: Optional[ActivitySource] = None,
    ) -> tuple[List[EngineeringActivity], int]:
        query = self.db.query(EngineeringActivity)

        if employee_id:
            query = query.filter(EngineeringActivity.employee_id == employee_id)
        if source:
            query = query.filter(EngineeringActivity.source == source)

        total = query.count()
        activities = query.order_by(
            EngineeringActivity.occurred_at.desc()
        ).offset(page * size).limit(size).all()
        return activities, total
