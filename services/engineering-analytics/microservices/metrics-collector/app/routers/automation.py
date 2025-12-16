"""
Automation Rules Router for Cluster_0002
Implements: No-Code Automation Rules (Story 8.1), Performance-Based Workflow Triggers (Story 8.2)

Associated Frontend Files:
  - web/app/src/lib/api.ts (automationApi - lines 185-200)
  - web/app/src/pages/automation/AutomationRulesPage.tsx
"""
from datetime import datetime
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.automation import RuleStatus
from app.schemas.automation import (
    AutomationRuleCreate,
    AutomationRuleUpdate,
    AutomationRuleResponse,
    RuleExecutionResponse,
    RuleTestRequest,
    RuleTestResponse,
    ThresholdConfigCreate,
    ThresholdConfigResponse,
    WorkflowEffectivenessReport,
    PageResponse,
)
from app.services.automation_service import AutomationService

router = APIRouter(prefix="/automation", tags=["Automation"])


def get_current_user(x_user_id: str = Header(default="system")) -> str:
    return x_user_id


@router.post("/rules", response_model=AutomationRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_automation_rule(
    data: AutomationRuleCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Create a new automation rule using visual interface.
    Supports: Story 8.1 - Create automation rule using visual interface
    """
    service = AutomationService(db)
    rule = service.create_rule(data, current_user)
    return rule


@router.get("/rules/{rule_id}", response_model=AutomationRuleResponse)
async def get_automation_rule(
    rule_id: UUID,
    db: Session = Depends(get_db),
):
    """Get automation rule by ID"""
    service = AutomationService(db)
    rule = service.get_rule(rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Automation rule not found: {rule_id}",
        )
    return rule


@router.put("/rules/{rule_id}", response_model=AutomationRuleResponse)
async def update_automation_rule(
    rule_id: UUID,
    data: AutomationRuleUpdate,
    db: Session = Depends(get_db),
):
    """Update an existing automation rule"""
    service = AutomationService(db)
    rule = service.update_rule(rule_id, data)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Automation rule not found: {rule_id}",
        )
    return rule


@router.delete("/rules/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_automation_rule(
    rule_id: UUID,
    db: Session = Depends(get_db),
):
    """Delete an automation rule"""
    service = AutomationService(db)
    if not service.delete_rule(rule_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Automation rule not found: {rule_id}",
        )


@router.get("/rules", response_model=PageResponse)
async def list_automation_rules(
    page: int = Query(default=0, ge=0),
    size: int = Query(default=50, ge=1, le=100),
    status: Optional[RuleStatus] = None,
    scope_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List automation rules with filtering"""
    service = AutomationService(db)
    rules, total = service.list_rules(page, size, status, scope_type)
    return PageResponse(
        content=[AutomationRuleResponse.model_validate(r) for r in rules],
        total=total,
        page=page,
        size=size,
    )


@router.post("/rules/{rule_id}/test", response_model=RuleTestResponse)
async def test_automation_rule(
    rule_id: UUID,
    request: RuleTestRequest,
    db: Session = Depends(get_db),
):
    """
    Test an automation rule before activation.
    Supports: Story 8.1 - Test automation rule before activation
    """
    service = AutomationService(db)
    try:
        return service.test_rule(rule_id, request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/rules/{rule_id}/activate", response_model=AutomationRuleResponse)
async def activate_automation_rule(
    rule_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Activate an automation rule after testing.
    Supports: Story 8.1 - Activate automation rule after testing
    """
    service = AutomationService(db)
    rule = service.activate_rule(rule_id)
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Automation rule not found: {rule_id}",
        )
    return rule


@router.post("/rules/{rule_id}/pause", response_model=AutomationRuleResponse)
async def pause_automation_rule(
    rule_id: UUID,
    db: Session = Depends(get_db),
):
    """Pause an active automation rule"""
    service = AutomationService(db)
    from app.schemas.automation import AutomationRuleUpdate
    rule = service.update_rule(rule_id, AutomationRuleUpdate(status=RuleStatus.PAUSED))
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Automation rule not found: {rule_id}",
        )
    return rule


@router.post("/evaluate", response_model=List[RuleExecutionResponse])
async def evaluate_and_trigger_rules(
    entity_type: str = Query(..., description="employee, team, repository, or service"),
    entity_id: str = Query(...),
    metric_type: str = Query(..., description="deployment_frequency, incident_frequency, etc."),
    current_value: float = Query(...),
    db: Session = Depends(get_db),
):
    """
    Evaluate all applicable rules and trigger matching ones.
    Supports: Story 8.2 - Performance-based workflow triggers
    """
    service = AutomationService(db)
    executions = service.evaluate_and_trigger(entity_type, entity_id, metric_type, current_value)
    return executions


@router.get("/executions", response_model=PageResponse)
async def list_rule_executions(
    page: int = Query(default=0, ge=0),
    size: int = Query(default=50, ge=1, le=100),
    rule_id: Optional[UUID] = None,
    entity_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """
    Track workflow execution history.
    Supports: Story 8.2 - Track workflow execution history
    """
    service = AutomationService(db)
    executions, total = service.get_execution_history(rule_id, entity_id, page, size)
    return PageResponse(
        content=[RuleExecutionResponse.model_validate(e) for e in executions],
        total=total,
        page=page,
        size=size,
    )


@router.post("/thresholds", response_model=ThresholdConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_threshold_config(
    data: ThresholdConfigCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    Configure custom thresholds for team/individual.
    Supports: Story 8.2 - Customize workflow triggers based on team/individual needs
    """
    service = AutomationService(db)
    config = service.create_threshold_config(data, current_user)
    return config


@router.get("/thresholds", response_model=List[ThresholdConfigResponse])
async def list_threshold_configs(
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get threshold configurations for team/individual"""
    service = AutomationService(db)
    configs = service.get_threshold_configs(entity_type, entity_id)
    return configs


@router.get("/report/effectiveness", response_model=WorkflowEffectivenessReport)
async def generate_effectiveness_report(
    period_start: datetime = Query(...),
    period_end: datetime = Query(...),
    db: Session = Depends(get_db),
):
    """
    Generate report on workflow trigger effectiveness.
    Supports: Story 8.2 - Generate report on workflow trigger effectiveness
    """
    service = AutomationService(db)
    return service.generate_effectiveness_report(period_start, period_end)
