from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.metrics import MetricType
from app.models.activity import ActivitySource, ActivityType


class MetricCreate(BaseModel):
    employee_id: UUID
    repository_id: Optional[str] = None
    metric_type: MetricType
    value: float
    unit: Optional[str] = None
    period_start: datetime
    period_end: datetime
    period_type: str = Field(..., pattern="^(week|sprint|month|custom)$")
    source: str
    metadata: Optional[Dict[str, Any]] = None


class MetricResponse(BaseModel):
    metric_id: UUID
    employee_id: UUID
    repository_id: Optional[str] = None
    metric_type: MetricType
    value: float
    unit: Optional[str] = None
    period_start: datetime
    period_end: datetime
    period_type: str
    source: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EngineeringActivityCreate(BaseModel):
    employee_id: UUID
    source: ActivitySource
    activity_type: ActivityType
    external_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    repository_id: Optional[str] = None
    project_id: Optional[UUID] = None
    occurred_at: datetime
    raw_data: Optional[Dict[str, Any]] = None


class EngineeringActivityResponse(BaseModel):
    activity_id: UUID
    employee_id: UUID
    source: ActivitySource
    activity_type: ActivityType
    external_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    repository_id: Optional[str] = None
    project_id: Optional[UUID] = None
    occurred_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class EmployeeActivitySummary(BaseModel):
    employee_id: UUID
    period: str
    period_start: datetime
    period_end: datetime
    commits: int = 0
    pull_requests_opened: int = 0
    pull_requests_closed: int = 0
    code_review_participations: int = 0
    jira_issues_completed: int = 0
    lead_time_average: Optional[float] = None
    cycle_time_average: Optional[float] = None
    incident_frequency: Optional[float] = None
    system_uptime: Optional[float] = None


class PageResponse(BaseModel):
    content: List[Any]
    total: int
    page: int
    size: int
