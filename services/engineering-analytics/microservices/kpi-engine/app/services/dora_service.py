from datetime import datetime
from typing import Optional
from dataclasses import dataclass
import numpy as np
from sqlalchemy.orm import Session

from app.models.kpi_result import KPIResult, KPIType


@dataclass
class DORAMetrics:
    repository_id: str
    deployment_frequency: float  # deployments per day
    lead_time_for_changes: float  # hours
    change_failure_rate: float  # percentage
    mean_time_to_recovery: float  # hours
    period_start: datetime
    period_end: datetime
    calculated_at: datetime


class DORAService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_dora_metrics(
        self,
        repository_id: str,
        period_start: datetime,
        period_end: datetime,
        deployments: Optional[list] = None,
        incidents: Optional[list] = None,
        commits: Optional[list] = None,
    ) -> DORAMetrics:
        days_in_period = (period_end - period_start).days or 1

        # Deployment Frequency: deployments per day
        deployment_count = len(deployments) if deployments else 0
        deployment_frequency = deployment_count / days_in_period

        # Lead Time for Changes: time from commit to deploy (in hours)
        lead_times = []
        if commits and deployments:
            for deploy in deployments:
                deploy_time = deploy.get("deployed_at")
                commit_time = deploy.get("commit_time")
                if deploy_time and commit_time:
                    lead_time = (deploy_time - commit_time).total_seconds() / 3600
                    lead_times.append(lead_time)
        lead_time_avg = np.mean(lead_times) if lead_times else 24.0

        # Change Failure Rate: percentage of deployments causing failures
        failure_count = 0
        if deployments:
            failure_count = sum(1 for d in deployments if d.get("caused_incident", False))
        change_failure_rate = (failure_count / deployment_count * 100) if deployment_count > 0 else 0

        # Mean Time to Recovery: average time to resolve incidents (in hours)
        recovery_times = []
        if incidents:
            for incident in incidents:
                resolved_at = incident.get("resolved_at")
                created_at = incident.get("created_at")
                if resolved_at and created_at:
                    recovery_time = (resolved_at - created_at).total_seconds() / 3600
                    recovery_times.append(recovery_time)
        mttr = np.mean(recovery_times) if recovery_times else 1.0

        return DORAMetrics(
            repository_id=repository_id,
            deployment_frequency=round(deployment_frequency, 2),
            lead_time_for_changes=round(lead_time_avg, 2),
            change_failure_rate=round(change_failure_rate, 2),
            mean_time_to_recovery=round(mttr, 2),
            period_start=period_start,
            period_end=period_end,
            calculated_at=datetime.utcnow(),
        )

    def save_dora_metrics(self, metrics: DORAMetrics) -> None:
        kpi_records = [
            KPIResult(
                entity_type="repository",
                entity_id=metrics.repository_id,
                kpi_type=KPIType.DORA_DEPLOYMENT_FREQUENCY,
                value=metrics.deployment_frequency,
                unit="per_day",
                period_start=metrics.period_start,
                period_end=metrics.period_end,
                period_type="custom",
            ),
            KPIResult(
                entity_type="repository",
                entity_id=metrics.repository_id,
                kpi_type=KPIType.DORA_LEAD_TIME,
                value=metrics.lead_time_for_changes,
                unit="hours",
                period_start=metrics.period_start,
                period_end=metrics.period_end,
                period_type="custom",
            ),
            KPIResult(
                entity_type="repository",
                entity_id=metrics.repository_id,
                kpi_type=KPIType.DORA_CHANGE_FAILURE_RATE,
                value=metrics.change_failure_rate,
                unit="percentage",
                period_start=metrics.period_start,
                period_end=metrics.period_end,
                period_type="custom",
            ),
            KPIResult(
                entity_type="repository",
                entity_id=metrics.repository_id,
                kpi_type=KPIType.DORA_MTTR,
                value=metrics.mean_time_to_recovery,
                unit="hours",
                period_start=metrics.period_start,
                period_end=metrics.period_end,
                period_type="custom",
            ),
        ]
        self.db.add_all(kpi_records)
        self.db.commit()

    def get_dora_performance_level(self, metrics: DORAMetrics) -> str:
        score = 0

        # Elite performers: daily deploys, < 1 hour lead time, < 15% CFR, < 1 hour MTTR
        if metrics.deployment_frequency >= 1:
            score += 1
        if metrics.lead_time_for_changes < 24:
            score += 1
        if metrics.change_failure_rate < 15:
            score += 1
        if metrics.mean_time_to_recovery < 1:
            score += 1

        if score >= 4:
            return "elite"
        elif score >= 3:
            return "high"
        elif score >= 2:
            return "medium"
        else:
            return "low"
