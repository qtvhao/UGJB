import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Integer, Float, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class MetricType(str, Enum):
    COMMITS = "commits"
    PULL_REQUESTS_OPENED = "pull_requests_opened"
    PULL_REQUESTS_CLOSED = "pull_requests_closed"
    CODE_REVIEWS = "code_reviews"
    JIRA_ISSUES_COMPLETED = "jira_issues_completed"
    LEAD_TIME = "lead_time"
    CYCLE_TIME = "cycle_time"
    INCIDENT_FREQUENCY = "incident_frequency"
    SYSTEM_UPTIME = "system_uptime"
    DEPLOYMENT_FREQUENCY = "deployment_frequency"
    CHANGE_FAILURE_RATE = "change_failure_rate"
    MTTR = "mttr"


class EngineeringMetric(Base):
    __tablename__ = "ea_metrics"

    metric_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    repository_id = Column(String(128), nullable=True)
    metric_type = Column(SQLEnum(MetricType), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    period_type = Column(String(20), nullable=False)  # week, sprint, month
    source = Column(String(50), nullable=False)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
