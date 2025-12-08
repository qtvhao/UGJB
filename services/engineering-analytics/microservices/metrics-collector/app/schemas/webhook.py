"""
Pydantic Schemas for Webhooks
Supports: Story 5.2 - Enable Real-Time Events
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl

from app.models.webhook import WebhookSource, WebhookEventType, WebhookStatus


class WebhookConfigCreate(BaseModel):
    integration_id: UUID
    source: WebhookSource
    webhook_url: str = Field(..., max_length=500)
    secret_token: Optional[str] = None
    enabled_events: List[WebhookEventType] = Field(default_factory=list)


class WebhookConfigUpdate(BaseModel):
    webhook_url: Optional[str] = None
    secret_token: Optional[str] = None
    enabled_events: Optional[List[WebhookEventType]] = None
    is_active: Optional[bool] = None


class WebhookConfigResponse(BaseModel):
    config_id: UUID
    integration_id: UUID
    source: WebhookSource
    webhook_url: str
    enabled_events: List[str]
    is_active: bool
    last_received_at: Optional[datetime]
    total_received: int
    total_processed: int
    total_failed: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WebhookEventResponse(BaseModel):
    event_id: UUID
    config_id: UUID
    source: WebhookSource
    event_type: WebhookEventType
    status: WebhookStatus
    employee_id: Optional[str]
    repository_id: Optional[str]
    project_id: Optional[str]
    received_at: datetime
    processed_at: Optional[datetime]
    error_message: Optional[str]

    class Config:
        from_attributes = True


# Incoming webhook payloads
class GitLabPushEvent(BaseModel):
    object_kind: str = "push"
    ref: str
    checkout_sha: Optional[str] = None
    user_id: int
    user_name: str
    user_email: str
    project_id: int
    commits: List[Dict[str, Any]] = Field(default_factory=list)
    total_commits_count: int = 0


class GitLabMergeRequestEvent(BaseModel):
    object_kind: str = "merge_request"
    user: Dict[str, Any]
    project: Dict[str, Any]
    object_attributes: Dict[str, Any]


class GitHubPushEvent(BaseModel):
    ref: str
    before: str
    after: str
    repository: Dict[str, Any]
    pusher: Dict[str, Any]
    commits: List[Dict[str, Any]] = Field(default_factory=list)


class GitHubPullRequestEvent(BaseModel):
    action: str
    number: int
    pull_request: Dict[str, Any]
    repository: Dict[str, Any]
    sender: Dict[str, Any]


class JiraIssueEvent(BaseModel):
    webhookEvent: str
    issue: Dict[str, Any]
    user: Dict[str, Any]
    changelog: Optional[Dict[str, Any]] = None


class PrometheusAlertEvent(BaseModel):
    status: str
    labels: Dict[str, str]
    annotations: Dict[str, str]
    startsAt: str
    endsAt: Optional[str] = None
    generatorURL: Optional[str] = None


class CICDDeploymentEvent(BaseModel):
    event_type: str
    status: str
    environment: str
    service: str
    version: str
    deployed_at: datetime
    deployed_by: Optional[str] = None
    commit_sha: Optional[str] = None


class WebhookProcessResult(BaseModel):
    event_id: UUID
    status: WebhookStatus
    processed_at: datetime
    attributed_to: Optional[str] = None
    metrics_created: int = 0
    message: str


class WebhookStats(BaseModel):
    config_id: UUID
    source: WebhookSource
    total_received: int
    total_processed: int
    total_failed: int
    processing_rate: float
    last_received_at: Optional[datetime]
    events_by_type: Dict[str, int]


class PageResponse(BaseModel):
    content: List[Any]
    total: int
    page: int
    size: int
