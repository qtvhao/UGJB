"""
Webhook Models for Cluster_0002
Supports: Story 5.2 - Enable Real-Time Events
"""
from datetime import datetime
from typing import Optional
from uuid import uuid4
import enum

from sqlalchemy import Column, String, Boolean, DateTime, JSON, Enum, Text, Integer
from sqlalchemy.dialects.postgresql import UUID as PGUUID

from app.database import Base


class WebhookSource(str, enum.Enum):
    GITLAB = "gitlab"
    GITHUB = "github"
    JIRA = "jira"
    FIREBASE = "firebase"
    PROMETHEUS = "prometheus"
    CICD = "cicd"


class WebhookEventType(str, enum.Enum):
    # Git events
    PUSH = "push"
    MERGE_REQUEST = "merge_request"
    PULL_REQUEST = "pull_request"
    TAG_PUSH = "tag_push"
    COMMENT = "comment"

    # CI/CD events
    PIPELINE_SUCCESS = "pipeline_success"
    PIPELINE_FAILURE = "pipeline_failure"
    DEPLOYMENT = "deployment"

    # Issue tracking
    ISSUE_CREATED = "issue_created"
    ISSUE_UPDATED = "issue_updated"
    ISSUE_CLOSED = "issue_closed"
    SPRINT_UPDATED = "sprint_updated"

    # Monitoring events
    INCIDENT = "incident"
    ALERT = "alert"
    CRASH = "crash"


class WebhookStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSED = "processed"
    FAILED = "failed"
    IGNORED = "ignored"


class WebhookConfig(Base):
    """Configuration for webhook endpoints"""
    __tablename__ = "webhook_configs"

    config_id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    integration_id = Column(PGUUID(as_uuid=True), nullable=False)
    source = Column(Enum(WebhookSource), nullable=False)

    # Endpoint configuration
    webhook_url = Column(String(500), nullable=False)
    secret_token = Column(String(255), nullable=True)

    # Event filtering
    enabled_events = Column(JSON, default=list)  # List of WebhookEventType

    # Status
    is_active = Column(Boolean, default=True)
    last_received_at = Column(DateTime, nullable=True)
    total_received = Column(Integer, default=0)
    total_processed = Column(Integer, default=0)
    total_failed = Column(Integer, default=0)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WebhookEvent(Base):
    """Individual webhook event received"""
    __tablename__ = "webhook_events"

    event_id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    config_id = Column(PGUUID(as_uuid=True), nullable=False)
    source = Column(Enum(WebhookSource), nullable=False)
    event_type = Column(Enum(WebhookEventType), nullable=False)

    # Event data
    payload = Column(JSON, nullable=False)
    headers = Column(JSON, default=dict)

    # Processing status
    status = Column(Enum(WebhookStatus), default=WebhookStatus.PENDING)
    processed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)

    # Attribution
    employee_id = Column(String(255), nullable=True)
    repository_id = Column(String(255), nullable=True)
    project_id = Column(String(255), nullable=True)

    # Metadata
    received_at = Column(DateTime, default=datetime.utcnow)


class WebhookDelivery(Base):
    """Track webhook delivery attempts for outbound webhooks"""
    __tablename__ = "webhook_deliveries"

    delivery_id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    event_id = Column(PGUUID(as_uuid=True), nullable=False)
    target_url = Column(String(500), nullable=False)

    # Delivery status
    attempt_number = Column(Integer, default=1)
    status_code = Column(Integer, nullable=True)
    response_body = Column(Text, nullable=True)
    success = Column(Boolean, default=False)

    # Timing
    attempted_at = Column(DateTime, default=datetime.utcnow)
    response_time_ms = Column(Integer, nullable=True)
