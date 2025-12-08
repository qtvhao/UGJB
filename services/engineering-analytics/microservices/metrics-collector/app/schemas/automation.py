"""
Pydantic Schemas for Automation Rules
Supports: No-Code Automation Rules (Story 8.1), Performance-Based Workflow Triggers (Story 8.2)
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.automation import ConditionOperator, ActionType, RuleStatus


class AutomationRuleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

    # Scope
    scope_type: str = Field(..., description="employee, team, repository, or service")
    scope_id: Optional[str] = None

    # Condition
    metric_type: str = Field(..., description="deployment_frequency, incident_frequency, blocked_tickets, etc.")
    operator: ConditionOperator
    threshold_value: float
    duration_days: int = Field(default=0, ge=0)

    # Custom formula (optional)
    custom_formula: Optional[str] = None

    # Action
    action_type: ActionType
    action_config: Dict[str, Any] = Field(default_factory=dict)
    notification_recipients: List[str] = Field(default_factory=list)


class AutomationRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    scope_type: Optional[str] = None
    scope_id: Optional[str] = None
    metric_type: Optional[str] = None
    operator: Optional[ConditionOperator] = None
    threshold_value: Optional[float] = None
    duration_days: Optional[int] = None
    custom_formula: Optional[str] = None
    action_type: Optional[ActionType] = None
    action_config: Optional[Dict[str, Any]] = None
    notification_recipients: Optional[List[str]] = None
    status: Optional[RuleStatus] = None


class AutomationRuleResponse(BaseModel):
    rule_id: UUID
    name: str
    description: Optional[str]
    scope_type: str
    scope_id: Optional[str]
    metric_type: str
    operator: ConditionOperator
    threshold_value: float
    duration_days: int
    custom_formula: Optional[str]
    action_type: ActionType
    action_config: Dict[str, Any]
    notification_recipients: List[str]
    status: RuleStatus
    created_by: str
    created_at: datetime
    updated_at: datetime
    last_triggered_at: Optional[datetime]
    trigger_count: int

    class Config:
        from_attributes = True


class RuleExecutionResponse(BaseModel):
    execution_id: UUID
    rule_id: UUID
    entity_type: str
    entity_id: str
    triggered_at: datetime
    metric_value: float
    threshold_value: float
    action_executed: str
    execution_success: bool
    execution_result: Dict[str, Any]
    error_message: Optional[str]
    is_test_run: bool

    class Config:
        from_attributes = True


class RuleTestRequest(BaseModel):
    """Request to test a rule without executing actual actions"""
    entity_type: str
    entity_id: str
    simulated_metric_value: float


class RuleTestResponse(BaseModel):
    """Response from rule test"""
    rule_id: UUID
    would_trigger: bool
    metric_value: float
    threshold_value: float
    action_that_would_execute: str
    simulated_result: Dict[str, Any]


class ThresholdConfigCreate(BaseModel):
    entity_type: str
    entity_id: str
    metric_type: str
    custom_threshold: float
    custom_action: Optional[ActionType] = None


class ThresholdConfigResponse(BaseModel):
    config_id: UUID
    entity_type: str
    entity_id: str
    metric_type: str
    custom_threshold: float
    custom_action: Optional[ActionType]
    created_by: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowEffectivenessReport(BaseModel):
    """Report on automation workflow effectiveness"""
    period_start: datetime
    period_end: datetime
    total_triggers: int
    successful_executions: int
    failed_executions: int
    rules_summary: List[Dict[str, Any]]
    improvements_detected: List[Dict[str, Any]]
    recommendations: List[str]


class PageResponse(BaseModel):
    content: List[Any]
    total: int
    page: int
    size: int
