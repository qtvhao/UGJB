"""
Automation Rule Models for Cluster_0002
Supports: No-Code Automation Rules (Story 8.1), Performance-Based Workflow Triggers (Story 8.2)
"""
from datetime import datetime
from typing import Optional
from uuid import uuid4
import enum

from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, JSON, Enum, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.database import Base


class ConditionOperator(str, enum.Enum):
    LESS_THAN = "<"
    LESS_THAN_OR_EQUAL = "<="
    GREATER_THAN = ">"
    GREATER_THAN_OR_EQUAL = ">="
    EQUAL = "=="
    NOT_EQUAL = "!="


class ActionType(str, enum.Enum):
    SEND_NOTIFICATION = "send_notification"
    TRIGGER_SKILL_GAP_ANALYSIS = "trigger_skill_gap_analysis"
    TRIGGER_ROOT_CAUSE_ANALYSIS = "trigger_root_cause_analysis"
    CREATE_WORKFLOW_ASSIGNMENT = "create_workflow_assignment"
    RESOURCE_REALLOCATION = "resource_reallocation"


class RuleStatus(str, enum.Enum):
    DRAFT = "draft"
    TESTING = "testing"
    ACTIVE = "active"
    PAUSED = "paused"
    DISABLED = "disabled"


class AutomationRule(Base):
    __tablename__ = "automation_rules"

    rule_id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Rule scope
    scope_type = Column(String(50), nullable=False)  # employee, team, repository, service
    scope_id = Column(String(255), nullable=True)  # Optional specific ID, null = all

    # Condition
    metric_type = Column(String(100), nullable=False)  # deployment_frequency, incident_frequency, etc.
    operator = Column(Enum(ConditionOperator), nullable=False)
    threshold_value = Column(Float, nullable=False)
    duration_days = Column(Integer, default=0)  # Condition must persist for this duration

    # Complex condition (optional custom formula)
    custom_formula = Column(Text, nullable=True)

    # Action
    action_type = Column(Enum(ActionType), nullable=False)
    action_config = Column(JSON, default=dict)  # Action-specific configuration
    notification_recipients = Column(JSON, default=list)  # List of user IDs or roles

    # Status
    status = Column(Enum(RuleStatus), default=RuleStatus.DRAFT)

    # Audit
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_triggered_at = Column(DateTime, nullable=True)
    trigger_count = Column(Integer, default=0)


class RuleExecution(Base):
    __tablename__ = "rule_executions"

    execution_id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    rule_id = Column(PGUUID(as_uuid=True), nullable=False)

    # Execution context
    entity_type = Column(String(50), nullable=False)  # employee, team, repository
    entity_id = Column(String(255), nullable=False)

    # Trigger details
    triggered_at = Column(DateTime, default=datetime.utcnow)
    metric_value = Column(Float, nullable=False)
    threshold_value = Column(Float, nullable=False)

    # Execution result
    action_executed = Column(String(100), nullable=False)
    execution_success = Column(Boolean, default=True)
    execution_result = Column(JSON, default=dict)
    error_message = Column(Text, nullable=True)

    # Test mode
    is_test_run = Column(Boolean, default=False)


class ThresholdConfig(Base):
    """Custom threshold configurations per team/employee"""
    __tablename__ = "threshold_configs"

    config_id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    # Scope
    entity_type = Column(String(50), nullable=False)  # team, employee
    entity_id = Column(String(255), nullable=False)

    # Threshold overrides
    metric_type = Column(String(100), nullable=False)
    custom_threshold = Column(Float, nullable=False)
    custom_action = Column(Enum(ActionType), nullable=True)

    # Metadata
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
