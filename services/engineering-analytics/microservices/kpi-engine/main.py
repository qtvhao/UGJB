"""
Associated Frontend Files:
  - web/app/src/lib/api.ts (analyticsApi.kpi - lines 98-100)
  - web/app/src/pages/analytics/EngineeringMetricsPage.tsx
"""
import grpc
from concurrent import futures
from datetime import datetime
import logging

from app.config import get_settings
from app.database import engine, Base, SessionLocal
from app.services.dora_service import DORAService
from app.services.quality_service import QualityService
from app.services.reliability_service import ReliabilityService
from app.services.employee_kpi_service import EmployeeKPIService

# Import generated protobuf classes (would be generated from proto file)
# For now, we'll implement a simplified gRPC server structure

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)


class KPIServicer:
    def CalculateDORAMetrics(self, request, context):
        db = SessionLocal()
        try:
            service = DORAService(db)
            metrics = service.calculate_dora_metrics(
                repository_id=request.repository_id,
                period_start=datetime.fromisoformat(request.period_start),
                period_end=datetime.fromisoformat(request.period_end),
            )
            service.save_dora_metrics(metrics)
            return {
                "repository_id": metrics.repository_id,
                "deployment_frequency": metrics.deployment_frequency,
                "lead_time_for_changes": metrics.lead_time_for_changes,
                "change_failure_rate": metrics.change_failure_rate,
                "mean_time_to_recovery": metrics.mean_time_to_recovery,
                "period_start": metrics.period_start.isoformat(),
                "period_end": metrics.period_end.isoformat(),
                "calculated_at": metrics.calculated_at.isoformat(),
            }
        finally:
            db.close()

    def CalculateQualityScore(self, request, context):
        db = SessionLocal()
        try:
            service = QualityService(db)
            metrics = service.calculate_quality_score(
                repository_id=request.repository_id,
            )
            return {
                "repository_id": metrics.repository_id,
                "overall_score": metrics.overall_score,
                "code_coverage": metrics.code_coverage,
                "technical_debt_ratio": metrics.technical_debt_ratio,
                "bug_density": metrics.bug_density,
                "code_complexity": metrics.code_complexity,
                "calculated_at": metrics.calculated_at.isoformat(),
            }
        finally:
            db.close()

    def CalculateReliabilityScore(self, request, context):
        db = SessionLocal()
        try:
            service = ReliabilityService(db)
            metrics = service.calculate_reliability_score(
                service_id=request.service_id,
            )
            return {
                "service_id": metrics.service_id,
                "overall_score": metrics.overall_score,
                "uptime_percentage": metrics.uptime_percentage,
                "incident_frequency": metrics.incident_frequency,
                "error_rate": metrics.error_rate,
                "latency_p99": metrics.latency_p99,
                "calculated_at": metrics.calculated_at.isoformat(),
            }
        finally:
            db.close()

    def GetEmployeeKPIs(self, request, context):
        db = SessionLocal()
        try:
            service = EmployeeKPIService(db)
            kpis = service.calculate_employee_kpis(
                employee_id=request.employee_id,
                period=request.period,
            )
            return {
                "employee_id": kpis.employee_id,
                "period": kpis.period,
                "period_start": kpis.period_start.isoformat(),
                "period_end": kpis.period_end.isoformat(),
                "commits": kpis.commits,
                "pull_requests_opened": kpis.pull_requests_opened,
                "pull_requests_closed": kpis.pull_requests_closed,
                "code_reviews": kpis.code_reviews,
                "issues_completed": kpis.issues_completed,
                "average_lead_time": kpis.average_lead_time,
                "average_cycle_time": kpis.average_cycle_time,
                "quality_score": kpis.quality_score,
                "productivity_score": kpis.productivity_score,
            }
        finally:
            db.close()


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    # In production, would add the generated servicer here:
    # kpi_pb2_grpc.add_KPIServiceServicer_to_server(KPIServicer(), server)

    server.add_insecure_port(f"[::]:{settings.grpc_port}")
    logger.info(f"KPI Engine gRPC server starting on port {settings.grpc_port}")
    server.start()
    server.wait_for_termination()


if __name__ == "__main__":
    serve()
