"""
Automation Service for Cluster_0002
Implements: No-Code Automation Rules (Story 8.1), Performance-Based Workflow Triggers (Story 8.2)

Associated Frontend Files:
  - web/app/src/lib/api.ts (automationApi - lines 184-200)
  - web/app/src/pages/automation/AutomationRulesPage.tsx
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
import logging
import re

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.automation import (
    AutomationRule,
    RuleExecution,
    ThresholdConfig,
    ConditionOperator,
    ActionType,
    RuleStatus,
)
from app.schemas.automation import (
    AutomationRuleCreate,
    AutomationRuleUpdate,
    RuleTestRequest,
    RuleTestResponse,
    ThresholdConfigCreate,
    WorkflowEffectivenessReport,
)

logger = logging.getLogger(__name__)


class AutomationService:
    def __init__(self, db: Session):
        self.db = db

    def create_rule(self, data: AutomationRuleCreate, created_by: str) -> AutomationRule:
        """Create a new automation rule using visual interface"""
        rule = AutomationRule(
            name=data.name,
            description=data.description,
            scope_type=data.scope_type,
            scope_id=data.scope_id,
            metric_type=data.metric_type,
            operator=data.operator,
            threshold_value=data.threshold_value,
            duration_days=data.duration_days,
            custom_formula=data.custom_formula,
            action_type=data.action_type,
            action_config=data.action_config,
            notification_recipients=data.notification_recipients,
            status=RuleStatus.DRAFT,
            created_by=created_by,
        )
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        logger.info(f"Created automation rule: {rule.rule_id}")
        return rule

    def get_rule(self, rule_id: UUID) -> Optional[AutomationRule]:
        return self.db.query(AutomationRule).filter(AutomationRule.rule_id == rule_id).first()

    def update_rule(self, rule_id: UUID, data: AutomationRuleUpdate) -> Optional[AutomationRule]:
        rule = self.get_rule(rule_id)
        if not rule:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(rule, field, value)

        self.db.commit()
        self.db.refresh(rule)
        return rule

    def delete_rule(self, rule_id: UUID) -> bool:
        rule = self.get_rule(rule_id)
        if not rule:
            return False

        self.db.delete(rule)
        self.db.commit()
        return True

    def list_rules(
        self,
        page: int = 0,
        size: int = 50,
        status: Optional[RuleStatus] = None,
        scope_type: Optional[str] = None,
    ) -> Tuple[List[AutomationRule], int]:
        query = self.db.query(AutomationRule)

        if status:
            query = query.filter(AutomationRule.status == status)
        if scope_type:
            query = query.filter(AutomationRule.scope_type == scope_type)

        total = query.count()
        rules = query.order_by(AutomationRule.created_at.desc()).offset(page * size).limit(size).all()
        return rules, total

    def activate_rule(self, rule_id: UUID) -> Optional[AutomationRule]:
        """Activate a rule after testing"""
        rule = self.get_rule(rule_id)
        if not rule:
            return None

        rule.status = RuleStatus.ACTIVE
        self.db.commit()
        self.db.refresh(rule)
        logger.info(f"Activated automation rule: {rule_id}")
        return rule

    def test_rule(self, rule_id: UUID, request: RuleTestRequest) -> RuleTestResponse:
        """Test a rule without executing actual actions"""
        rule = self.get_rule(rule_id)
        if not rule:
            raise ValueError(f"Rule not found: {rule_id}")

        would_trigger = self._evaluate_condition(
            request.simulated_metric_value,
            rule.operator,
            rule.threshold_value,
        )

        action_preview = {
            "action_type": rule.action_type.value,
            "recipients": rule.notification_recipients,
            "config": rule.action_config,
        }

        # Log rule validation execution
        execution = RuleExecution(
            rule_id=rule_id,
            entity_type=request.entity_type,
            entity_id=request.entity_id,
            metric_value=request.simulated_metric_value,
            threshold_value=rule.threshold_value,
            action_executed=rule.action_type.value,
            execution_success=True,
            execution_result=action_preview,
            is_test_run=True,
        )
        self.db.add(execution)
        self.db.commit()

        return RuleTestResponse(
            rule_id=rule_id,
            would_trigger=would_trigger,
            metric_value=request.simulated_metric_value,
            threshold_value=rule.threshold_value,
            action_that_would_execute=rule.action_type.value,
            simulated_result=action_preview,
        )

    def evaluate_and_trigger(
        self,
        entity_type: str,
        entity_id: str,
        metric_type: str,
        current_value: float,
    ) -> List[RuleExecution]:
        """Evaluate all applicable rules and trigger matching ones"""
        executions = []

        # Get custom threshold if exists
        custom_config = self.db.query(ThresholdConfig).filter(
            and_(
                ThresholdConfig.entity_type == entity_type,
                ThresholdConfig.entity_id == entity_id,
                ThresholdConfig.metric_type == metric_type,
            )
        ).first()

        # Get active rules for this metric
        rules = self.db.query(AutomationRule).filter(
            and_(
                AutomationRule.status == RuleStatus.ACTIVE,
                AutomationRule.metric_type == metric_type,
                or_(
                    AutomationRule.scope_id.is_(None),
                    AutomationRule.scope_id == entity_id,
                ),
                AutomationRule.scope_type == entity_type,
            )
        ).all()

        for rule in rules:
            # Use custom threshold if configured
            threshold = custom_config.custom_threshold if custom_config else rule.threshold_value
            action_type = custom_config.custom_action if custom_config and custom_config.custom_action else rule.action_type

            if self._evaluate_condition(current_value, rule.operator, threshold):
                # Check duration requirement
                if rule.duration_days > 0:
                    if not self._check_duration_requirement(rule, entity_type, entity_id, current_value):
                        continue

                # Execute action
                execution = self._execute_action(rule, entity_type, entity_id, current_value, threshold, action_type)
                executions.append(execution)

                # Update rule stats
                rule.last_triggered_at = datetime.utcnow()
                rule.trigger_count += 1
                self.db.commit()

        return executions

    def _evaluate_condition(self, value: float, operator: ConditionOperator, threshold: float) -> bool:
        """Evaluate a condition"""
        if operator == ConditionOperator.LESS_THAN:
            return value < threshold
        elif operator == ConditionOperator.LESS_THAN_OR_EQUAL:
            return value <= threshold
        elif operator == ConditionOperator.GREATER_THAN:
            return value > threshold
        elif operator == ConditionOperator.GREATER_THAN_OR_EQUAL:
            return value >= threshold
        elif operator == ConditionOperator.EQUAL:
            return value == threshold
        elif operator == ConditionOperator.NOT_EQUAL:
            return value != threshold
        return False

    def _evaluate_custom_formula(self, formula: str, metrics: Dict[str, float]) -> bool:
        """Evaluate a custom formula condition"""
        try:
            # Replace metric names with values
            expr = formula
            for metric, value in metrics.items():
                expr = expr.replace(metric, str(value))

            # Safe evaluation (only allow comparison and logical operators)
            allowed_pattern = r'^[\d\.\s\(\)\<\>\=\!\&\|]+$'
            if not re.match(allowed_pattern, expr):
                logger.warning(f"Invalid formula pattern: {formula}")
                return False

            return eval(expr)
        except Exception as e:
            logger.error(f"Error evaluating formula: {e}")
            return False

    def _check_duration_requirement(
        self,
        rule: AutomationRule,
        entity_type: str,
        entity_id: str,
        current_value: float,
    ) -> bool:
        """Check if condition has persisted for required duration"""
        # This would query historical metric data to verify persistence
        # Simplified for MVP
        return True

    def _execute_action(
        self,
        rule: AutomationRule,
        entity_type: str,
        entity_id: str,
        metric_value: float,
        threshold_value: float,
        action_type: ActionType,
    ) -> RuleExecution:
        """Execute the configured action"""
        execution_result = {}
        execution_success = True
        error_message = None

        try:
            if action_type == ActionType.SEND_NOTIFICATION:
                execution_result = self._send_notification(rule, entity_type, entity_id, metric_value)
            elif action_type == ActionType.TRIGGER_SKILL_GAP_ANALYSIS:
                execution_result = self._trigger_skill_gap_analysis(entity_id, metric_value)
            elif action_type == ActionType.TRIGGER_ROOT_CAUSE_ANALYSIS:
                execution_result = self._trigger_root_cause_analysis(entity_id, metric_value)
            elif action_type == ActionType.CREATE_WORKFLOW_ASSIGNMENT:
                execution_result = self._create_workflow_assignment(rule, entity_id)
            elif action_type == ActionType.RESOURCE_REALLOCATION:
                execution_result = self._trigger_resource_reallocation(entity_id, metric_value)

        except Exception as e:
            execution_success = False
            error_message = str(e)
            logger.error(f"Action execution failed: {e}")

        execution = RuleExecution(
            rule_id=rule.rule_id,
            entity_type=entity_type,
            entity_id=entity_id,
            metric_value=metric_value,
            threshold_value=threshold_value,
            action_executed=action_type.value,
            execution_success=execution_success,
            execution_result=execution_result,
            error_message=error_message,
            is_test_run=False,
        )
        self.db.add(execution)
        self.db.commit()
        self.db.refresh(execution)

        return execution

    def _send_notification(
        self,
        rule: AutomationRule,
        entity_type: str,
        entity_id: str,
        metric_value: float,
    ) -> Dict[str, Any]:
        """Send notifications to configured recipients"""
        notification = {
            "type": "performance_alert",
            "rule_name": rule.name,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "metric": rule.metric_type,
            "value": metric_value,
            "threshold": rule.threshold_value,
            "recipients": rule.notification_recipients,
            "sent_at": datetime.utcnow().isoformat(),
        }
        logger.info(f"Notification sent: {notification}")
        return notification

    def _trigger_skill_gap_analysis(self, employee_id: str, deployment_frequency: float) -> Dict[str, Any]:
        """Trigger skill gap analysis workflow"""
        workflow = {
            "workflow_type": "skill_gap_analysis",
            "employee_id": employee_id,
            "trigger_reason": f"Low deployment frequency: {deployment_frequency}",
            "initiated_at": datetime.utcnow().isoformat(),
            "status": "initiated",
        }
        logger.info(f"Skill gap analysis triggered: {workflow}")
        return workflow

    def _trigger_root_cause_analysis(self, entity_id: str, incident_frequency: float) -> Dict[str, Any]:
        """Trigger root cause analysis process"""
        workflow = {
            "workflow_type": "root_cause_analysis",
            "entity_id": entity_id,
            "trigger_reason": f"High incident frequency: {incident_frequency}",
            "initiated_at": datetime.utcnow().isoformat(),
            "status": "initiated",
        }
        logger.info(f"Root cause analysis triggered: {workflow}")
        return workflow

    def _create_workflow_assignment(self, rule: AutomationRule, entity_id: str) -> Dict[str, Any]:
        """Create a workflow assignment based on template"""
        template = rule.action_config.get("workflow_template", "default")
        assignment = {
            "workflow_type": "custom_workflow",
            "template": template,
            "entity_id": entity_id,
            "initiated_at": datetime.utcnow().isoformat(),
            "status": "created",
        }
        logger.info(f"Workflow assignment created: {assignment}")
        return assignment

    def _trigger_resource_reallocation(self, team_id: str, blocked_tickets: float) -> Dict[str, Any]:
        """Trigger resource reallocation workflow"""
        workflow = {
            "workflow_type": "resource_reallocation",
            "team_id": team_id,
            "trigger_reason": f"Blocked tickets accumulated: {blocked_tickets}",
            "initiated_at": datetime.utcnow().isoformat(),
            "status": "initiated",
        }
        logger.info(f"Resource reallocation triggered: {workflow}")
        return workflow

    def get_execution_history(
        self,
        rule_id: Optional[UUID] = None,
        entity_id: Optional[str] = None,
        page: int = 0,
        size: int = 50,
    ) -> Tuple[List[RuleExecution], int]:
        """Get workflow execution history"""
        query = self.db.query(RuleExecution)

        if rule_id:
            query = query.filter(RuleExecution.rule_id == rule_id)
        if entity_id:
            query = query.filter(RuleExecution.entity_id == entity_id)

        total = query.count()
        executions = query.order_by(RuleExecution.triggered_at.desc()).offset(page * size).limit(size).all()
        return executions, total

    def create_threshold_config(
        self,
        data: ThresholdConfigCreate,
        created_by: str,
    ) -> ThresholdConfig:
        """Create custom threshold configuration for team/individual"""
        config = ThresholdConfig(
            entity_type=data.entity_type,
            entity_id=data.entity_id,
            metric_type=data.metric_type,
            custom_threshold=data.custom_threshold,
            custom_action=data.custom_action,
            created_by=created_by,
        )
        self.db.add(config)
        self.db.commit()
        self.db.refresh(config)
        return config

    def get_threshold_configs(
        self,
        entity_type: Optional[str] = None,
        entity_id: Optional[str] = None,
    ) -> List[ThresholdConfig]:
        """Get threshold configurations"""
        query = self.db.query(ThresholdConfig)

        if entity_type:
            query = query.filter(ThresholdConfig.entity_type == entity_type)
        if entity_id:
            query = query.filter(ThresholdConfig.entity_id == entity_id)

        return query.all()

    def generate_effectiveness_report(
        self,
        period_start: datetime,
        period_end: datetime,
    ) -> WorkflowEffectivenessReport:
        """Generate report on workflow trigger effectiveness"""
        executions = self.db.query(RuleExecution).filter(
            and_(
                RuleExecution.triggered_at >= period_start,
                RuleExecution.triggered_at <= period_end,
                RuleExecution.is_test_run == False,
            )
        ).all()

        total_triggers = len(executions)
        successful = sum(1 for e in executions if e.execution_success)
        failed = total_triggers - successful

        # Aggregate by rule
        rules_summary = {}
        for execution in executions:
            rule_id = str(execution.rule_id)
            if rule_id not in rules_summary:
                rule = self.get_rule(execution.rule_id)
                rules_summary[rule_id] = {
                    "rule_id": rule_id,
                    "rule_name": rule.name if rule else "Unknown",
                    "trigger_count": 0,
                    "success_count": 0,
                }
            rules_summary[rule_id]["trigger_count"] += 1
            if execution.execution_success:
                rules_summary[rule_id]["success_count"] += 1

        recommendations = []
        if failed > 0:
            recommendations.append(f"Review {failed} failed executions for potential configuration issues")
        if total_triggers == 0:
            recommendations.append("Consider adjusting thresholds if no rules have triggered")

        return WorkflowEffectivenessReport(
            period_start=period_start,
            period_end=period_end,
            total_triggers=total_triggers,
            successful_executions=successful,
            failed_executions=failed,
            rules_summary=list(rules_summary.values()),
            improvements_detected=[],
            recommendations=recommendations,
        )
