import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class IntegrationType(str, Enum):
    JIRA = "jira"
    GITLAB = "gitlab"
    FIREBASE_CRASHLYTICS = "firebase_crashlytics"
    PROMETHEUS = "prometheus"
    GITHUB = "github"
    SONARQUBE = "sonarqube"


class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"


class SyncFrequency(str, Enum):
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MANUAL = "manual"


class Integration(Base):
    __tablename__ = "ea_integrations"

    integration_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    integration_type = Column(SQLEnum(IntegrationType), nullable=False)
    api_endpoint = Column(String(500), nullable=False)
    auth_method = Column(String(50), nullable=False)
    credentials_encrypted = Column(Text, nullable=True)
    sync_frequency = Column(SQLEnum(SyncFrequency), default=SyncFrequency.DAILY)
    status = Column(SQLEnum(IntegrationStatus), default=IntegrationStatus.PENDING)
    last_sync_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
