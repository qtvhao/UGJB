import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, JSON, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ActivitySource(str, Enum):
    GITLAB = "gitlab"
    JIRA = "jira"
    FIREBASE_CRASHLYTICS = "firebase_crashlytics"
    PROMETHEUS = "prometheus"
    GITHUB = "github"


class ActivityType(str, Enum):
    COMMIT = "commit"
    PULL_REQUEST = "pull_request"
    CODE_REVIEW = "code_review"
    ISSUE_COMPLETED = "issue_completed"
    INCIDENT = "incident"
    DEPLOYMENT = "deployment"


class EngineeringActivity(Base):
    __tablename__ = "ea_activities"

    activity_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    source = Column(SQLEnum(ActivitySource), nullable=False)
    activity_type = Column(SQLEnum(ActivityType), nullable=False)
    external_id = Column(String(256), nullable=True)
    title = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    repository_id = Column(String(128), nullable=True)
    project_id = Column(UUID(as_uuid=True), nullable=True)
    occurred_at = Column(DateTime, nullable=False)
    raw_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
