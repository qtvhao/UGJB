"""
Associated Frontend Files:
  - web/app/src/lib/api.ts (analyticsApi.metrics - lines 93-97)
  - web/app/src/pages/analytics/EngineeringMetricsPage.tsx
"""
from datetime import datetime
from typing import Optional
from dataclasses import dataclass
from sqlalchemy.orm import Session

from app.models.kpi_result import KPIResult, KPIType


@dataclass
class ReliabilityMetrics:
    service_id: str
    overall_score: float
    uptime_percentage: float
    incident_frequency: float
    error_rate: float
    latency_p99: float
    calculated_at: datetime


class ReliabilityService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_reliability_score(
        self,
        service_id: str,
        uptime_percentage: Optional[float] = None,
        incident_frequency: Optional[float] = None,
        error_rate: Optional[float] = None,
        latency_p99: Optional[float] = None,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
    ) -> ReliabilityMetrics:
        # Default values if not provided
        uptime = uptime_percentage if uptime_percentage is not None else 99.9
        incidents = incident_frequency if incident_frequency is not None else 0.1
        errors = error_rate if error_rate is not None else 0.1
        latency = latency_p99 if latency_p99 is not None else 200.0

        # Calculate overall score (0-100)
        # Weights: uptime 40%, incidents 25%, errors 20%, latency 15%
        uptime_score = uptime  # already 0-100
        incident_score = max(0, 100 - (incidents * 100))  # lower is better
        error_score = max(0, 100 - (errors * 100))  # lower is better
        latency_score = max(0, 100 - (latency / 10))  # lower is better, assuming 1000ms is 0

        overall = (
            uptime_score * 0.40
            + incident_score * 0.25
            + error_score * 0.20
            + latency_score * 0.15
        )

        return ReliabilityMetrics(
            service_id=service_id,
            overall_score=round(overall, 2),
            uptime_percentage=round(uptime, 2),
            incident_frequency=round(incidents, 2),
            error_rate=round(errors, 2),
            latency_p99=round(latency, 2),
            calculated_at=datetime.utcnow(),
        )

    def save_reliability_metrics(
        self,
        metrics: ReliabilityMetrics,
        period_start: datetime,
        period_end: datetime,
    ) -> None:
        kpi_record = KPIResult(
            entity_type="service",
            entity_id=metrics.service_id,
            kpi_type=KPIType.RELIABILITY_SCORE,
            value=metrics.overall_score,
            unit="score",
            period_start=period_start,
            period_end=period_end,
            period_type="custom",
            metadata={
                "uptime_percentage": metrics.uptime_percentage,
                "incident_frequency": metrics.incident_frequency,
                "error_rate": metrics.error_rate,
                "latency_p99": metrics.latency_p99,
            },
        )
        self.db.add(kpi_record)
        self.db.commit()

    def get_sla_compliance(self, uptime: float, sla_target: float = 99.9) -> bool:
        return uptime >= sla_target
