import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, Float, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class KPIType(str, Enum):
    DORA_DEPLOYMENT_FREQUENCY = "dora_deployment_frequency"
    DORA_LEAD_TIME = "dora_lead_time"
    DORA_CHANGE_FAILURE_RATE = "dora_change_failure_rate"
    DORA_MTTR = "dora_mttr"
    QUALITY_SCORE = "quality_score"
    RELIABILITY_SCORE = "reliability_score"
    PRODUCTIVITY_SCORE = "productivity_score"
    VELOCITY = "velocity"


class KPIResult(Base):
    __tablename__ = "ea_kpi_results"

    result_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entity_type = Column(String(50), nullable=False)  # employee, team, repository, service
    entity_id = Column(String(128), nullable=False, index=True)
    kpi_type = Column(SQLEnum(KPIType), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    period_type = Column(String(20), nullable=False)
    metadata = Column(JSON, nullable=True)
    calculated_at = Column(DateTime, default=datetime.utcnow)
