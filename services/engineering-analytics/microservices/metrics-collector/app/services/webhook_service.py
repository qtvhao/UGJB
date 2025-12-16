"""
Webhook Service for Cluster_0002
Implements: Story 5.2 - Enable Real-Time Events

Associated Frontend Files:
  - web/app/src/lib/api.ts (webhooksApi - lines 203-212)
  - web/app/src/pages/webhooks/WebhooksPage.tsx
"""
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from uuid import UUID
import logging
import hashlib
import hmac

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.webhook import (
    WebhookConfig,
    WebhookEvent,
    WebhookSource,
    WebhookEventType,
    WebhookStatus,
)
from app.schemas.webhook import (
    WebhookConfigCreate,
    WebhookConfigUpdate,
    WebhookProcessResult,
    WebhookStats,
)
from app.models.metrics import EngineeringMetric, MetricType
from app.models.activity import CodeActivity, ActivityType

logger = logging.getLogger(__name__)


class WebhookService:
    def __init__(self, db: Session):
        self.db = db

    def create_config(self, data: WebhookConfigCreate) -> WebhookConfig:
        """Create a new webhook configuration"""
        config = WebhookConfig(
            integration_id=data.integration_id,
            source=data.source,
            webhook_url=data.webhook_url,
            secret_token=data.secret_token,
            enabled_events=[e.value for e in data.enabled_events],
        )
        self.db.add(config)
        self.db.commit()
        self.db.refresh(config)
        logger.info(f"Created webhook config: {config.config_id}")
        return config

    def get_config(self, config_id: UUID) -> Optional[WebhookConfig]:
        return self.db.query(WebhookConfig).filter(WebhookConfig.config_id == config_id).first()

    def update_config(self, config_id: UUID, data: WebhookConfigUpdate) -> Optional[WebhookConfig]:
        config = self.get_config(config_id)
        if not config:
            return None

        update_data = data.model_dump(exclude_unset=True)
        if "enabled_events" in update_data and update_data["enabled_events"]:
            update_data["enabled_events"] = [e.value for e in update_data["enabled_events"]]

        for field, value in update_data.items():
            setattr(config, field, value)

        self.db.commit()
        self.db.refresh(config)
        return config

    def list_configs(
        self,
        integration_id: Optional[UUID] = None,
        source: Optional[WebhookSource] = None,
        page: int = 0,
        size: int = 50,
    ) -> Tuple[List[WebhookConfig], int]:
        query = self.db.query(WebhookConfig)

        if integration_id:
            query = query.filter(WebhookConfig.integration_id == integration_id)
        if source:
            query = query.filter(WebhookConfig.source == source)

        total = query.count()
        configs = query.offset(page * size).limit(size).all()
        return configs, total

    def verify_signature(self, config: WebhookConfig, payload: bytes, signature: str) -> bool:
        """Verify webhook signature for security"""
        if not config.secret_token:
            return True

        expected = hmac.new(
            config.secret_token.encode(),
            payload,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected, signature)

    def receive_event(
        self,
        config_id: UUID,
        event_type: WebhookEventType,
        payload: Dict[str, Any],
        headers: Dict[str, str],
    ) -> WebhookEvent:
        """Receive and store a webhook event"""
        config = self.get_config(config_id)
        if not config:
            raise ValueError(f"Webhook config not found: {config_id}")

        event = WebhookEvent(
            config_id=config_id,
            source=config.source,
            event_type=event_type,
            payload=payload,
            headers=headers,
            status=WebhookStatus.PENDING,
        )
        self.db.add(event)

        # Update config stats
        config.total_received += 1
        config.last_received_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(event)

        logger.info(f"Received webhook event: {event.event_id} ({event_type})")
        return event

    def process_event(self, event_id: UUID) -> WebhookProcessResult:
        """Process a webhook event and create metrics/activities"""
        event = self.db.query(WebhookEvent).filter(WebhookEvent.event_id == event_id).first()
        if not event:
            raise ValueError(f"Event not found: {event_id}")

        config = self.get_config(event.config_id)
        metrics_created = 0
        attributed_to = None

        try:
            if event.source == WebhookSource.GITLAB:
                metrics_created, attributed_to = self._process_gitlab_event(event)
            elif event.source == WebhookSource.GITHUB:
                metrics_created, attributed_to = self._process_github_event(event)
            elif event.source == WebhookSource.JIRA:
                metrics_created, attributed_to = self._process_jira_event(event)
            elif event.source == WebhookSource.CICD:
                metrics_created, attributed_to = self._process_cicd_event(event)
            elif event.source == WebhookSource.PROMETHEUS:
                metrics_created, attributed_to = self._process_prometheus_event(event)

            event.status = WebhookStatus.PROCESSED
            event.processed_at = datetime.utcnow()
            event.employee_id = attributed_to

            if config:
                config.total_processed += 1

            self.db.commit()

            return WebhookProcessResult(
                event_id=event_id,
                status=WebhookStatus.PROCESSED,
                processed_at=event.processed_at,
                attributed_to=attributed_to,
                metrics_created=metrics_created,
                message="Event processed successfully",
            )

        except Exception as e:
            event.status = WebhookStatus.FAILED
            event.error_message = str(e)

            if config:
                config.total_failed += 1

            self.db.commit()
            logger.error(f"Failed to process event {event_id}: {e}")

            return WebhookProcessResult(
                event_id=event_id,
                status=WebhookStatus.FAILED,
                processed_at=datetime.utcnow(),
                attributed_to=None,
                metrics_created=0,
                message=str(e),
            )

    def _process_gitlab_event(self, event: WebhookEvent) -> Tuple[int, Optional[str]]:
        """Process GitLab webhook events"""
        payload = event.payload
        metrics_created = 0
        attributed_to = None

        if event.event_type == WebhookEventType.PUSH:
            user_email = payload.get("user_email")
            attributed_to = self._resolve_employee_by_email(user_email)
            commits = payload.get("commits", [])

            for commit in commits:
                activity = CodeActivity(
                    employee_id=attributed_to,
                    repository_id=str(payload.get("project_id")),
                    activity_type=ActivityType.COMMIT,
                    external_id=commit.get("id"),
                    title=commit.get("message", "")[:255],
                    occurred_at=datetime.fromisoformat(commit.get("timestamp", datetime.utcnow().isoformat()).replace("Z", "+00:00")),
                    metadata={"author": commit.get("author", {})},
                )
                self.db.add(activity)
                metrics_created += 1

        elif event.event_type == WebhookEventType.MERGE_REQUEST:
            user = payload.get("user", {})
            attributed_to = self._resolve_employee_by_email(user.get("email"))
            obj = payload.get("object_attributes", {})

            activity = CodeActivity(
                employee_id=attributed_to,
                repository_id=str(payload.get("project", {}).get("id")),
                activity_type=ActivityType.PULL_REQUEST_OPENED if obj.get("action") == "open" else ActivityType.PULL_REQUEST_MERGED,
                external_id=str(obj.get("iid")),
                title=obj.get("title", "")[:255],
                occurred_at=datetime.utcnow(),
                metadata={"state": obj.get("state"), "action": obj.get("action")},
            )
            self.db.add(activity)
            metrics_created = 1

        return metrics_created, attributed_to

    def _process_github_event(self, event: WebhookEvent) -> Tuple[int, Optional[str]]:
        """Process GitHub webhook events"""
        payload = event.payload
        metrics_created = 0
        attributed_to = None

        if event.event_type == WebhookEventType.PUSH:
            pusher = payload.get("pusher", {})
            attributed_to = self._resolve_employee_by_email(pusher.get("email"))
            commits = payload.get("commits", [])

            for commit in commits:
                activity = CodeActivity(
                    employee_id=attributed_to,
                    repository_id=str(payload.get("repository", {}).get("id")),
                    activity_type=ActivityType.COMMIT,
                    external_id=commit.get("id"),
                    title=commit.get("message", "")[:255],
                    occurred_at=datetime.fromisoformat(commit.get("timestamp", datetime.utcnow().isoformat()).replace("Z", "+00:00")),
                    metadata={"author": commit.get("author", {})},
                )
                self.db.add(activity)
                metrics_created += 1

        elif event.event_type == WebhookEventType.PULL_REQUEST:
            sender = payload.get("sender", {})
            attributed_to = sender.get("login")
            pr = payload.get("pull_request", {})
            action = payload.get("action")

            activity_type = ActivityType.PULL_REQUEST_OPENED
            if action == "closed" and pr.get("merged"):
                activity_type = ActivityType.PULL_REQUEST_MERGED
            elif action == "closed":
                activity_type = ActivityType.PULL_REQUEST_CLOSED

            activity = CodeActivity(
                employee_id=attributed_to,
                repository_id=str(payload.get("repository", {}).get("id")),
                activity_type=activity_type,
                external_id=str(pr.get("number")),
                title=pr.get("title", "")[:255],
                occurred_at=datetime.utcnow(),
                metadata={"action": action, "state": pr.get("state")},
            )
            self.db.add(activity)
            metrics_created = 1

        return metrics_created, attributed_to

    def _process_jira_event(self, event: WebhookEvent) -> Tuple[int, Optional[str]]:
        """Process Jira webhook events"""
        payload = event.payload
        metrics_created = 0

        user = payload.get("user", {})
        attributed_to = user.get("emailAddress")
        issue = payload.get("issue", {})

        event.project_id = issue.get("fields", {}).get("project", {}).get("key")

        if "issue_created" in payload.get("webhookEvent", ""):
            # Track issue creation
            metrics_created = 1
        elif "issue_updated" in payload.get("webhookEvent", ""):
            changelog = payload.get("changelog", {})
            items = changelog.get("items", [])

            # Check for status changes
            for item in items:
                if item.get("field") == "status" and item.get("toString") == "Done":
                    # Issue completed - create metric
                    metric = EngineeringMetric(
                        employee_id=attributed_to,
                        metric_type=MetricType.ISSUES_COMPLETED,
                        value=1,
                        unit="count",
                        period_start=datetime.utcnow(),
                        period_end=datetime.utcnow(),
                        source="jira",
                        metadata={"issue_key": issue.get("key")},
                    )
                    self.db.add(metric)
                    metrics_created = 1

        return metrics_created, attributed_to

    def _process_cicd_event(self, event: WebhookEvent) -> Tuple[int, Optional[str]]:
        """Process CI/CD deployment events"""
        payload = event.payload
        metrics_created = 0
        attributed_to = payload.get("deployed_by")

        if payload.get("event_type") == "deployment":
            status = payload.get("status")

            if status == "success":
                # Create deployment frequency metric
                metric = EngineeringMetric(
                    employee_id=attributed_to,
                    repository_id=payload.get("service"),
                    metric_type=MetricType.DEPLOYMENT_FREQUENCY,
                    value=1,
                    unit="count",
                    period_start=datetime.utcnow(),
                    period_end=datetime.utcnow(),
                    source="cicd",
                    metadata={
                        "environment": payload.get("environment"),
                        "version": payload.get("version"),
                        "commit_sha": payload.get("commit_sha"),
                    },
                )
                self.db.add(metric)
                metrics_created = 1

        return metrics_created, attributed_to

    def _process_prometheus_event(self, event: WebhookEvent) -> Tuple[int, Optional[str]]:
        """Process Prometheus alert events"""
        payload = event.payload
        metrics_created = 0
        attributed_to = None

        labels = payload.get("labels", {})
        service = labels.get("service") or labels.get("job")
        severity = labels.get("severity", "warning")

        # Create incident metric
        if payload.get("status") == "firing":
            metric = EngineeringMetric(
                repository_id=service,
                metric_type=MetricType.INCIDENT_FREQUENCY,
                value=1,
                unit="count",
                period_start=datetime.utcnow(),
                period_end=datetime.utcnow(),
                source="prometheus",
                metadata={
                    "alert_name": labels.get("alertname"),
                    "severity": severity,
                    "annotations": payload.get("annotations", {}),
                },
            )
            self.db.add(metric)
            metrics_created = 1

        return metrics_created, attributed_to

    def _resolve_employee_by_email(self, email: Optional[str]) -> Optional[str]:
        """Resolve employee ID from email (simplified for MVP)"""
        # In production, this would query the employee-registry service
        return email

    def get_event_history(
        self,
        config_id: Optional[UUID] = None,
        source: Optional[WebhookSource] = None,
        status: Optional[WebhookStatus] = None,
        page: int = 0,
        size: int = 50,
    ) -> Tuple[List[WebhookEvent], int]:
        """Get webhook event history"""
        query = self.db.query(WebhookEvent)

        if config_id:
            query = query.filter(WebhookEvent.config_id == config_id)
        if source:
            query = query.filter(WebhookEvent.source == source)
        if status:
            query = query.filter(WebhookEvent.status == status)

        total = query.count()
        events = query.order_by(WebhookEvent.received_at.desc()).offset(page * size).limit(size).all()
        return events, total

    def get_stats(self, config_id: UUID) -> WebhookStats:
        """Get webhook configuration statistics"""
        config = self.get_config(config_id)
        if not config:
            raise ValueError(f"Config not found: {config_id}")

        # Get event counts by type
        event_counts = self.db.query(
            WebhookEvent.event_type,
            func.count(WebhookEvent.event_id).label("count")
        ).filter(
            WebhookEvent.config_id == config_id
        ).group_by(WebhookEvent.event_type).all()

        events_by_type = {e.event_type.value: e.count for e in event_counts}

        processing_rate = (config.total_processed / config.total_received * 100) if config.total_received > 0 else 0

        return WebhookStats(
            config_id=config_id,
            source=config.source,
            total_received=config.total_received,
            total_processed=config.total_processed,
            total_failed=config.total_failed,
            processing_rate=round(processing_rate, 2),
            last_received_at=config.last_received_at,
            events_by_type=events_by_type,
        )
