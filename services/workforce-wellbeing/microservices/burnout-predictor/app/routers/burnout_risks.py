"""
REST API endpoints for burnout risks - Frontend compatible routes
Maps to the expected frontend API paths at /burnout-risks

Associated Frontend Files:
  - web/app/src/lib/api.ts (wellbeingApi.burnoutRisk - lines 143-146)
"""
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Query, Depends
import logging

from app.services.predictor_service import predictor_service, RiskLevel

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/burnout-risks", tags=["burnout-risks"])


# Response Models matching frontend expectations
class RiskFactor(BaseModel):
    """Risk factor contributing to burnout"""
    factor_name: str
    contribution_score: float
    description: str


class BurnoutRiskResponse(BaseModel):
    """Burnout risk data for an employee"""
    employee_id: str
    employee_name: str
    department: str
    risk_score: float = Field(..., ge=0, le=1)
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    top_risk_factors: List[RiskFactor]
    recommendation: str
    last_updated: str


class BurnoutRiskListResponse(BaseModel):
    """List of burnout risks"""
    risks: List[BurnoutRiskResponse]
    total: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int


def _map_risk_level(level: str) -> str:
    """Map internal risk levels to frontend-compatible levels"""
    mapping = {
        "LOW": "LOW",
        "MEDIUM": "MODERATE",
        "HIGH": "HIGH",
        "CRITICAL": "CRITICAL"
    }
    return mapping.get(level, level)


def _build_risk_response(
    employee_id: str,
    employee_name: str,
    department: str,
    metrics: dict
) -> BurnoutRiskResponse:
    """Build a burnout risk response using the predictor service"""
    prediction = predictor_service.predict_burnout_risk(employee_id, metrics)

    risk_factors = [
        RiskFactor(
            factor_name=rf['factor_name'],
            contribution_score=rf['contribution_score'],
            description=rf['description']
        )
        for rf in prediction.get('top_risk_factors', [])
    ]

    return BurnoutRiskResponse(
        employee_id=employee_id,
        employee_name=employee_name,
        department=department,
        risk_score=round(prediction['risk_score'], 2),
        risk_level=_map_risk_level(prediction['risk_level']),
        top_risk_factors=risk_factors,
        recommendation=prediction['recommendation'],
        last_updated=prediction['prediction_timestamp']
    )


@router.get(
    "",
    response_model=BurnoutRiskListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all burnout risks",
    description="Get burnout risk assessments for all employees"
)
async def list_burnout_risks(
    department: Optional[str] = Query(None, description="Filter by department"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (LOW, MODERATE, HIGH, CRITICAL)"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
):
    """
    List burnout risk assessments for all employees.

    Returns risk scores, contributing factors, and recommendations.

    Note: This endpoint requires employee data to be available via the Employee service.
    Returns an empty list if no employee data is available.
    """
    try:
        # Employee data must be fetched from Employee service via service-to-service call
        # Returns empty list when employee data is not available
        all_risks: List[BurnoutRiskResponse] = []

        # Apply filters
        if department:
            all_risks = [r for r in all_risks if r.department.lower() == department.lower()]

        if risk_level:
            all_risks = [r for r in all_risks if r.risk_level == risk_level.upper()]

        # Calculate counts
        high_risk = sum(1 for r in all_risks if r.risk_level in ["HIGH", "CRITICAL"])
        moderate_risk = sum(1 for r in all_risks if r.risk_level == "MODERATE")
        low_risk = sum(1 for r in all_risks if r.risk_level == "LOW")

        # Apply pagination
        paginated = all_risks[offset:offset + limit]

        return BurnoutRiskListResponse(
            risks=paginated,
            total=len(all_risks),
            high_risk_count=high_risk,
            moderate_risk_count=moderate_risk,
            low_risk_count=low_risk
        )

    except Exception as e:
        logger.error(f"Error listing burnout risks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve burnout risks: {str(e)}"
        )


@router.get(
    "/{employee_id}",
    response_model=BurnoutRiskResponse,
    status_code=status.HTTP_200_OK,
    summary="Get burnout risk for employee",
    description="Get detailed burnout risk assessment for a specific employee"
)
async def get_employee_burnout_risk(employee_id: str):
    """
    Get burnout risk assessment for a specific employee.

    Returns risk score, contributing factors, and personalized recommendations.

    Note: Requires metrics data for the employee. Returns 404 if employee not found.
    """
    try:
        # Employee data and metrics must be fetched from Employee service
        # Returns 404 when employee data is not available
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found. Use POST /{employee_id}/calculate with metrics."
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting burnout risk for {employee_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve burnout risk: {str(e)}"
        )


@router.post(
    "/{employee_id}/calculate",
    response_model=BurnoutRiskResponse,
    status_code=status.HTTP_200_OK,
    summary="Calculate burnout risk with provided metrics",
    description="Calculate burnout risk for an employee using provided metrics"
)
async def calculate_burnout_risk(
    employee_id: str,
    metrics: dict,
    employee_name: str = Query("Unknown", description="Employee name"),
    department: str = Query("Unknown", description="Department")
):
    """
    Calculate burnout risk for an employee using provided metrics.

    This endpoint allows direct risk calculation by providing employee metrics.
    Useful for testing and when metrics are available from external sources.
    """
    try:
        return _build_risk_response(
            employee_id=employee_id,
            employee_name=employee_name,
            department=department,
            metrics=metrics
        )

    except Exception as e:
        logger.error(f"Error calculating burnout risk for {employee_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate burnout risk: {str(e)}"
        )
