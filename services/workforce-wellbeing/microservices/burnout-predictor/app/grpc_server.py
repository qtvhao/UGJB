"""
gRPC server and servicer for Burnout Predictor

Associated Frontend Files:
  - web/app/src/lib/api.ts (wellbeingApi.burnoutRisk - lines 141-152)
"""
import logging
from datetime import datetime
from concurrent import futures
from typing import Optional

import grpc

from app.config import settings
from app.services.predictor_service import predictor_service

logger = logging.getLogger(__name__)

try:
    from protos import burnout_pb2, burnout_pb2_grpc
except ImportError:
    logger.warning("gRPC proto files not generated yet")
    burnout_pb2 = None
    burnout_pb2_grpc = None


def _extract_metrics_from_request(request) -> dict:
    """Extract metrics dictionary from gRPC request"""
    return {
        'hours_worked_per_week': request.metrics.hours_worked_per_week,
        'overtime_hours': request.metrics.overtime_hours,
        'days_since_last_vacation': request.metrics.days_since_last_vacation,
        'consecutive_work_days': request.metrics.consecutive_work_days,
        'average_daily_meetings': request.metrics.average_daily_meetings,
        'task_completion_rate': request.metrics.task_completion_rate,
        'open_tasks_count': request.metrics.open_tasks_count,
        'overdue_tasks_count': request.metrics.overdue_tasks_count,
        'stress_level': request.metrics.stress_level,
        'sleep_hours_average': request.metrics.sleep_hours_average,
        'exercise_frequency': request.metrics.exercise_frequency,
        'work_life_balance_score': request.metrics.work_life_balance_score,
        'productivity_score': request.metrics.productivity_score,
        'team_collaboration_score': request.metrics.team_collaboration_score,
        'days_since_last_feedback': request.metrics.days_since_last_feedback,
        'job_satisfaction_score': request.metrics.job_satisfaction_score,
        'sick_days_last_month': request.metrics.sick_days_last_month,
        'late_logins_count': request.metrics.late_logins_count,
        'average_response_time_hours': request.metrics.average_response_time_hours,
        'recent_performance_decline': float(request.metrics.recent_performance_decline)
    }


class BurnoutPredictorServicer:
    """gRPC servicer for burnout prediction"""

    def PredictBurnoutRisk(self, request, context):
        """Handle single prediction request"""
        if not burnout_pb2:
            context.set_code(grpc.StatusCode.UNIMPLEMENTED)
            context.set_details("gRPC proto not available")
            return None

        try:
            metrics = _extract_metrics_from_request(request)
            prediction = predictor_service.predict_burnout_risk(
                employee_id=request.employee_id,
                metrics=metrics
            )
            return self._build_prediction_response(prediction)
        except Exception as e:
            logger.error(f"Error in gRPC PredictBurnoutRisk: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return None

    def _build_prediction_response(self, prediction):
        """Build gRPC response from prediction dict"""
        risk_level_map = {
            'LOW': burnout_pb2.LOW,
            'MEDIUM': burnout_pb2.MEDIUM,
            'HIGH': burnout_pb2.HIGH,
            'CRITICAL': burnout_pb2.CRITICAL
        }
        risk_factors = [
            burnout_pb2.RiskFactor(
                factor_name=rf['factor_name'],
                contribution_score=rf['contribution_score'],
                description=rf['description']
            )
            for rf in prediction['top_risk_factors']
        ]
        return burnout_pb2.BurnoutRiskResponse(
            employee_id=prediction['employee_id'],
            risk_score=prediction['risk_score'],
            risk_level=risk_level_map.get(prediction['risk_level'], burnout_pb2.RISK_LEVEL_UNKNOWN),
            top_risk_factors=risk_factors,
            recommendation=prediction['recommendation'],
            prediction_timestamp=int(
                datetime.fromisoformat(prediction['prediction_timestamp']).timestamp()
            ),
            model_version=prediction['model_version']
        )

    def BatchPredictBurnoutRisk(self, request, context):
        """Handle batch prediction request"""
        if not burnout_pb2:
            context.set_code(grpc.StatusCode.UNIMPLEMENTED)
            context.set_details("gRPC proto not available")
            return None

        try:
            predictions = []
            high_risk_count = 0
            for req in request.requests:
                try:
                    response = self.PredictBurnoutRisk(req, context)
                    if response:
                        predictions.append(response)
                        if response.risk_level in [burnout_pb2.HIGH, burnout_pb2.CRITICAL]:
                            high_risk_count += 1
                except Exception as e:
                    logger.error(f"Error in batch prediction item: {e}")
            return burnout_pb2.BatchBurnoutRiskResponse(
                predictions=predictions,
                total_processed=len(predictions),
                high_risk_count=high_risk_count
            )
        except Exception as e:
            logger.error(f"Error in gRPC BatchPredictBurnoutRisk: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return None

    def GetModelInfo(self, request, context):
        """Get model information"""
        if not burnout_pb2:
            context.set_code(grpc.StatusCode.UNIMPLEMENTED)
            context.set_details("gRPC proto not available")
            return None

        try:
            model_info = predictor_service.get_model_info()
            return burnout_pb2.ModelInfoResponse(
                model_version=model_info['model_version'],
                model_type=model_info['model_type'],
                accuracy=model_info['accuracy'],
                precision=model_info['precision'],
                recall=model_info['recall'],
                f1_score=model_info['f1_score'],
                last_trained_timestamp=0 if not model_info['last_trained_timestamp'] else int(
                    datetime.fromisoformat(model_info['last_trained_timestamp']).timestamp()
                ),
                training_samples_count=model_info['training_samples_count'],
                feature_names=model_info['feature_names']
            )
        except Exception as e:
            logger.error(f"Error in gRPC GetModelInfo: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return None

    def RetrainModel(self, request, context):
        """Retrain the model"""
        if not burnout_pb2:
            context.set_code(grpc.StatusCode.UNIMPLEMENTED)
            context.set_details("gRPC proto not available")
            return None

        try:
            records = [
                (_extract_metrics_from_request(item), item.actual_burnout_occurred)
                for item in request.training_data
            ]
            result = predictor_service.retrain_model(
                training_data=records,
                validate=request.validate_before_deployment
            )
            performance = burnout_pb2.ModelPerformance(
                accuracy=result['performance'].get('accuracy', 0.0),
                precision=result['performance'].get('precision', 0.0),
                recall=result['performance'].get('recall', 0.0),
                f1_score=result['performance'].get('f1_score', 0.0),
                roc_auc=result['performance'].get('roc_auc', 0.0)
            )
            return burnout_pb2.RetrainResponse(
                success=result['success'],
                new_model_version=result['new_model_version'],
                performance=performance,
                message=result['message']
            )
        except Exception as e:
            logger.error(f"Error in gRPC RetrainModel: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details(str(e))
            return None


async def serve_grpc():
    """Start gRPC server"""
    if not burnout_pb2_grpc:
        logger.warning("gRPC server not started - proto files not generated")
        return

    server = grpc.aio.server(futures.ThreadPoolExecutor(max_workers=10))
    burnout_pb2_grpc.add_BurnoutPredictorServiceServicer_to_server(
        BurnoutPredictorServicer(),
        server
    )

    listen_addr = f'{settings.grpc_host}:{settings.grpc_port}'
    server.add_insecure_port(listen_addr)

    logger.info(f"Starting gRPC server on {listen_addr}")
    await server.start()

    try:
        await server.wait_for_termination()
    except KeyboardInterrupt:
        logger.info("Stopping gRPC server...")
        await server.stop(grace=5)
