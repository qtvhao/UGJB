from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.metrics import EngineeringMetric, MetricType
from app.schemas.metrics import MetricCreate


class MetricsService:
    def __init__(self, db: Session):
        self.db = db

    def create_metric(self, data: MetricCreate) -> EngineeringMetric:
        metric = EngineeringMetric(
            employee_id=data.employee_id,
            repository_id=data.repository_id,
            metric_type=data.metric_type,
            value=data.value,
            unit=data.unit,
            period_start=data.period_start,
            period_end=data.period_end,
            period_type=data.period_type,
            source=data.source,
            metadata=data.metadata,
        )
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)
        return metric

    def create_metrics_batch(
        self, metrics: List[MetricCreate]
    ) -> List[EngineeringMetric]:
        db_metrics = []
        for data in metrics:
            metric = EngineeringMetric(
                employee_id=data.employee_id,
                repository_id=data.repository_id,
                metric_type=data.metric_type,
                value=data.value,
                unit=data.unit,
                period_start=data.period_start,
                period_end=data.period_end,
                period_type=data.period_type,
                source=data.source,
                metadata=data.metadata,
            )
            db_metrics.append(metric)
        self.db.add_all(db_metrics)
        self.db.commit()
        return db_metrics

    def get_metric(self, metric_id: UUID) -> Optional[EngineeringMetric]:
        return self.db.query(EngineeringMetric).filter(
            EngineeringMetric.metric_id == metric_id
        ).first()

    def get_employee_metrics(
        self,
        employee_id: UUID,
        period_type: Optional[str] = None,
        period_start: Optional[datetime] = None,
        period_end: Optional[datetime] = None,
        metric_type: Optional[MetricType] = None,
    ) -> List[EngineeringMetric]:
        query = self.db.query(EngineeringMetric).filter(
            EngineeringMetric.employee_id == employee_id
        )

        if period_type:
            query = query.filter(EngineeringMetric.period_type == period_type)
        if period_start:
            query = query.filter(EngineeringMetric.period_start >= period_start)
        if period_end:
            query = query.filter(EngineeringMetric.period_end <= period_end)
        if metric_type:
            query = query.filter(EngineeringMetric.metric_type == metric_type)

        return query.order_by(EngineeringMetric.period_start.desc()).all()

    def get_employee_metrics_summary(
        self,
        employee_id: UUID,
        period_start: datetime,
        period_end: datetime,
    ) -> dict:
        metrics = self.db.query(
            EngineeringMetric.metric_type,
            func.sum(EngineeringMetric.value).label("total"),
            func.avg(EngineeringMetric.value).label("average"),
        ).filter(
            EngineeringMetric.employee_id == employee_id,
            EngineeringMetric.period_start >= period_start,
            EngineeringMetric.period_end <= period_end,
        ).group_by(EngineeringMetric.metric_type).all()

        return {m.metric_type.value: {"total": m.total, "average": m.average} for m in metrics}

    def list_metrics(
        self,
        page: int = 0,
        size: int = 50,
        employee_id: Optional[UUID] = None,
        metric_type: Optional[MetricType] = None,
    ) -> tuple[List[EngineeringMetric], int]:
        query = self.db.query(EngineeringMetric)

        if employee_id:
            query = query.filter(EngineeringMetric.employee_id == employee_id)
        if metric_type:
            query = query.filter(EngineeringMetric.metric_type == metric_type)

        total = query.count()
        metrics = query.offset(page * size).limit(size).all()
        return metrics, total
