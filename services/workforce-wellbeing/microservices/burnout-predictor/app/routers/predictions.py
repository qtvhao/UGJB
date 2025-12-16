"""
REST API endpoints for burnout predictions

Associated Frontend Files:
  - web/app/src/lib/api.ts (wellbeingApi.burnoutRisk - lines 143-147)
  - web/app/src/pages/wellbeing/BurnoutRiskPage.tsx
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status
import logging

from app.services.predictor_service import predictor_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])


# Request/Response Models
class EmployeeMetrics(BaseModel):
    """Employee metrics for burnout prediction"""
    hours_worked_per_week: float = Field(..., ge=0, le=168)
    overtime_hours: float = Field(..., ge=0)
    days_since_last_vacation: int = Field(..., ge=0)
    consecutive_work_days: int = Field(..., ge=0)
    average_daily_meetings: float = Field(..., ge=0)
    task_completion_rate: float = Field(..., ge=0, le=1)
    open_tasks_count: int = Field(..., ge=0)
    overdue_tasks_count: int = Field(..., ge=0)
    stress_level: float = Field(..., ge=0, le=10)
    sleep_hours_average: float = Field(..., ge=0, le=24)
    exercise_frequency: float = Field(..., ge=0)
    work_life_balance_score: float = Field(..., ge=0, le=10)
    productivity_score: float = Field(..., ge=0, le=100)
    team_collaboration_score: float = Field(..., ge=0, le=100)
    days_since_last_feedback: int = Field(..., ge=0)
    job_satisfaction_score: float = Field(..., ge=0, le=10)
    sick_days_last_month: int = Field(..., ge=0)
    late_logins_count: int = Field(..., ge=0)
    average_response_time_hours: float = Field(..., ge=0)
    recent_performance_decline: bool = Field(...)


class PredictionRequest(BaseModel):
    """Request for burnout risk prediction"""
    employee_id: str = Field(..., min_length=1)
    metrics: EmployeeMetrics


class RiskFactor(BaseModel):
    """Risk factor contribution"""
    factor_name: str
    contribution_score: float
    description: str


class PredictionResponse(BaseModel):
    """Response with burnout risk prediction"""
    employee_id: str
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: str
    top_risk_factors: List[RiskFactor]
    recommendation: str
    prediction_timestamp: str
    model_version: str


class BatchPredictionRequest(BaseModel):
    """Request for batch burnout predictions"""
    requests: List[PredictionRequest]


class BatchPredictionResponse(BaseModel):
    """Response with batch predictions"""
    predictions: List[PredictionResponse]
    total_processed: int
    high_risk_count: int


class TrainingSample(BaseModel):
    """Training sample for model retraining"""
    employee_id: str
    metrics: EmployeeMetrics
    actual_burnout_occurred: bool


class RetrainRequest(BaseModel):
    """Request to retrain the model"""
    training_data: List[TrainingSample]
    validate_before_deployment: bool = True


class ModelPerformance(BaseModel):
    """Model performance metrics"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: Optional[float] = None


class RetrainResponse(BaseModel):
    """Response from model retraining"""
    success: bool
    new_model_version: str
    performance: ModelPerformance
    message: str


class ModelInfoResponse(BaseModel):
    """Model information and metadata"""
    model_version: str
    model_type: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    last_trained_timestamp: Optional[str]
    training_samples_count: int
    feature_names: List[str]


# API Endpoints
@router.post(
    "/predict",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict burnout risk for an employee"
)
async def predict_burnout_risk(request: PredictionRequest):
    """
    Predict burnout risk for a single employee based on their metrics.

    Returns risk score (0-1), risk level, contributing factors, and recommendations.
    """
    try:
        metrics_dict = request.metrics.model_dump()

        # Convert boolean to float for model
        metrics_dict['recent_performance_decline'] = float(
            metrics_dict['recent_performance_decline']
        )

        prediction = predictor_service.predict_burnout_risk(
            employee_id=request.employee_id,
            metrics=metrics_dict
        )

        return PredictionResponse(**prediction)

    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post(
    "/predict/batch",
    response_model=BatchPredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Batch predict burnout risk for multiple employees"
)
async def batch_predict_burnout_risk(request: BatchPredictionRequest):
    """
    Predict burnout risk for multiple employees in a single request.

    Useful for bulk analysis and reporting.
    """
    try:
        requests_data = []
        for req in request.requests:
            metrics_dict = req.metrics.model_dump()
            metrics_dict['recent_performance_decline'] = float(
                metrics_dict['recent_performance_decline']
            )
            requests_data.append((req.employee_id, metrics_dict))

        result = predictor_service.batch_predict_burnout_risk(requests_data)

        return BatchPredictionResponse(**result)

    except Exception as e:
        logger.error(f"Error in batch predict endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction failed: {str(e)}"
        )


@router.get(
    "/model/info",
    response_model=ModelInfoResponse,
    status_code=status.HTTP_200_OK,
    summary="Get model information and performance metrics"
)
async def get_model_info():
    """
    Retrieve current model version, type, and performance metrics.

    Useful for monitoring model performance and tracking versions.
    """
    try:
        model_info = predictor_service.get_model_info()
        return ModelInfoResponse(**model_info)

    except Exception as e:
        logger.error(f"Error in model info endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model info: {str(e)}"
        )


@router.post(
    "/model/retrain",
    response_model=RetrainResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrain the prediction model with new data"
)
async def retrain_model(request: RetrainRequest):
    """
    Retrain the burnout prediction model with new training data.

    The model will be validated before deployment if validate_before_deployment is True.
    Requires at least 100 training samples.
    """
    try:
        training_data = []
        for sample in request.training_data:
            metrics_dict = sample.metrics.model_dump()
            metrics_dict['recent_performance_decline'] = float(
                metrics_dict['recent_performance_decline']
            )
            training_data.append((metrics_dict, sample.actual_burnout_occurred))

        result = predictor_service.retrain_model(
            training_data=training_data,
            validate=request.validate_before_deployment
        )

        # Build response
        performance = ModelPerformance(
            accuracy=result['performance'].get('accuracy', 0.0),
            precision=result['performance'].get('precision', 0.0),
            recall=result['performance'].get('recall', 0.0),
            f1_score=result['performance'].get('f1_score', 0.0),
            roc_auc=result['performance'].get('roc_auc')
        )

        return RetrainResponse(
            success=result['success'],
            new_model_version=result['new_model_version'],
            performance=performance,
            message=result['message']
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in retrain endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model retraining failed: {str(e)}"
        )
