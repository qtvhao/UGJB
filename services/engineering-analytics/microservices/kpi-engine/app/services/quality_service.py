from datetime import datetime
from typing import Optional
from dataclasses import dataclass
from sqlalchemy.orm import Session

from app.models.kpi_result import KPIResult, KPIType


@dataclass
class QualityMetrics:
    repository_id: str
    overall_score: float
    code_coverage: float
    technical_debt_ratio: float
    bug_density: float
    code_complexity: float
    calculated_at: datetime


class QualityService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_quality_score(
        self,
        repository_id: str,
        code_coverage: Optional[float] = None,
        technical_debt_ratio: Optional[float] = None,
        bug_density: Optional[float] = None,
        code_complexity: Optional[float] = None,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
    ) -> QualityMetrics:
        # Default values if not provided
        coverage = code_coverage if code_coverage is not None else 70.0
        debt_ratio = technical_debt_ratio if technical_debt_ratio is not None else 5.0
        bugs = bug_density if bug_density is not None else 0.5
        complexity = code_complexity if code_complexity is not None else 10.0

        # Calculate overall score (0-100)
        # Weights: coverage 30%, debt 25%, bugs 25%, complexity 20%
        coverage_score = min(coverage, 100)  # 0-100
        debt_score = max(0, 100 - (debt_ratio * 5))  # lower is better
        bug_score = max(0, 100 - (bugs * 50))  # lower is better
        complexity_score = max(0, 100 - (complexity * 2))  # lower is better

        overall = (
            coverage_score * 0.30
            + debt_score * 0.25
            + bug_score * 0.25
            + complexity_score * 0.20
        )

        return QualityMetrics(
            repository_id=repository_id,
            overall_score=round(overall, 2),
            code_coverage=round(coverage, 2),
            technical_debt_ratio=round(debt_ratio, 2),
            bug_density=round(bugs, 2),
            code_complexity=round(complexity, 2),
            calculated_at=datetime.utcnow(),
        )

    def save_quality_metrics(
        self,
        metrics: QualityMetrics,
        period_start: datetime,
        period_end: datetime,
    ) -> None:
        kpi_record = KPIResult(
            entity_type="repository",
            entity_id=metrics.repository_id,
            kpi_type=KPIType.QUALITY_SCORE,
            value=metrics.overall_score,
            unit="score",
            period_start=period_start,
            period_end=period_end,
            period_type="custom",
            metadata={
                "code_coverage": metrics.code_coverage,
                "technical_debt_ratio": metrics.technical_debt_ratio,
                "bug_density": metrics.bug_density,
                "code_complexity": metrics.code_complexity,
            },
        )
        self.db.add(kpi_record)
        self.db.commit()

    def get_quality_grade(self, score: float) -> str:
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"
