from datetime import datetime, timedelta
from typing import Optional, List
from dataclasses import dataclass
from sqlalchemy.orm import Session

from app.models.kpi_result import KPIResult, KPIType


@dataclass
class EmployeeKPIs:
    employee_id: str
    period: str
    period_start: datetime
    period_end: datetime
    commits: int
    pull_requests_opened: int
    pull_requests_closed: int
    code_reviews: int
    issues_completed: int
    average_lead_time: float
    average_cycle_time: float
    quality_score: float
    productivity_score: float


class EmployeeKPIService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_employee_kpis(
        self,
        employee_id: str,
        period: str,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        commits: int = 0,
        prs_opened: int = 0,
        prs_closed: int = 0,
        code_reviews: int = 0,
        issues_completed: int = 0,
        lead_times: Optional[List[float]] = None,
        cycle_times: Optional[List[float]] = None,
    ) -> EmployeeKPIs:
        now = datetime.utcnow()

        # Calculate period dates if not provided
        if not period_start or not period_end:
            if period == "week":
                period_start = now - timedelta(days=7)
            elif period == "sprint":
                period_start = now - timedelta(days=14)
            else:  # month
                period_start = now - timedelta(days=30)
            period_end = now

        # Calculate average lead and cycle times
        avg_lead_time = sum(lead_times) / len(lead_times) if lead_times else 0.0
        avg_cycle_time = sum(cycle_times) / len(cycle_times) if cycle_times else 0.0

        # Calculate productivity score (normalized 0-100)
        days_in_period = (period_end - period_start).days or 1
        commits_per_day = commits / days_in_period
        prs_per_day = (prs_opened + prs_closed) / 2 / days_in_period
        reviews_per_day = code_reviews / days_in_period
        issues_per_day = issues_completed / days_in_period

        # Productivity based on typical benchmarks
        productivity_score = min(100, (
            (commits_per_day / 2) * 25 +  # expect ~2 commits/day
            (prs_per_day / 0.5) * 25 +  # expect ~0.5 PRs/day
            (reviews_per_day / 1) * 25 +  # expect ~1 review/day
            (issues_per_day / 0.5) * 25  # expect ~0.5 issues/day
        ))

        # Quality score (simplified - would normally come from code analysis)
        quality_score = 75.0  # Default baseline

        return EmployeeKPIs(
            employee_id=employee_id,
            period=period,
            period_start=period_start,
            period_end=period_end,
            commits=commits,
            pull_requests_opened=prs_opened,
            pull_requests_closed=prs_closed,
            code_reviews=code_reviews,
            issues_completed=issues_completed,
            average_lead_time=round(avg_lead_time, 2),
            average_cycle_time=round(avg_cycle_time, 2),
            quality_score=round(quality_score, 2),
            productivity_score=round(productivity_score, 2),
        )

    def save_employee_kpis(self, kpis: EmployeeKPIs) -> None:
        kpi_records = [
            KPIResult(
                entity_type="employee",
                entity_id=kpis.employee_id,
                kpi_type=KPIType.PRODUCTIVITY_SCORE,
                value=kpis.productivity_score,
                unit="score",
                period_start=kpis.period_start,
                period_end=kpis.period_end,
                period_type=kpis.period,
                metadata={
                    "commits": kpis.commits,
                    "pull_requests_opened": kpis.pull_requests_opened,
                    "pull_requests_closed": kpis.pull_requests_closed,
                    "code_reviews": kpis.code_reviews,
                    "issues_completed": kpis.issues_completed,
                },
            ),
            KPIResult(
                entity_type="employee",
                entity_id=kpis.employee_id,
                kpi_type=KPIType.QUALITY_SCORE,
                value=kpis.quality_score,
                unit="score",
                period_start=kpis.period_start,
                period_end=kpis.period_end,
                period_type=kpis.period,
            ),
        ]
        self.db.add_all(kpi_records)
        self.db.commit()

    def get_historical_kpis(
        self,
        employee_id: str,
        kpi_type: KPIType,
        limit: int = 10,
    ) -> List[KPIResult]:
        return (
            self.db.query(KPIResult)
            .filter(
                KPIResult.entity_type == "employee",
                KPIResult.entity_id == employee_id,
                KPIResult.kpi_type == kpi_type,
            )
            .order_by(KPIResult.period_end.desc())
            .limit(limit)
            .all()
        )
