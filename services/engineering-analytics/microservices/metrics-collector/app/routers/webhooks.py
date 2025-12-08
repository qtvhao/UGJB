"""
Webhook Router for Cluster_0002
Implements: Story 5.2 - Enable Real-Time Events
"""
from typing import Optional, Dict, Any
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request, BackgroundTasks, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.webhook import WebhookSource, WebhookEventType, WebhookStatus
from app.schemas.webhook import (
    WebhookConfigCreate,
    WebhookConfigUpdate,
    WebhookConfigResponse,
    WebhookEventResponse,
    WebhookProcessResult,
    WebhookStats,
    PageResponse,
)
from app.services.webhook_service import WebhookService

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/configs", response_model=WebhookConfigResponse, status_code=status.HTTP_201_CREATED)
async def create_webhook_config(
    data: WebhookConfigCreate,
    db: Session = Depends(get_db),
):
    """
    Configure webhook URL and events for an integration.
    Supports: Story 5.2 - Configure webhook URL + events
    """
    service = WebhookService(db)
    config = service.create_config(data)
    return config


@router.get("/configs/{config_id}", response_model=WebhookConfigResponse)
async def get_webhook_config(
    config_id: UUID,
    db: Session = Depends(get_db),
):
    """Get webhook configuration by ID"""
    service = WebhookService(db)
    config = service.get_config(config_id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Webhook config not found: {config_id}",
        )
    return config


@router.put("/configs/{config_id}", response_model=WebhookConfigResponse)
async def update_webhook_config(
    config_id: UUID,
    data: WebhookConfigUpdate,
    db: Session = Depends(get_db),
):
    """Update webhook configuration"""
    service = WebhookService(db)
    config = service.update_config(config_id, data)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Webhook config not found: {config_id}",
        )
    return config


@router.get("/configs", response_model=PageResponse)
async def list_webhook_configs(
    page: int = Query(default=0, ge=0),
    size: int = Query(default=50, ge=1, le=100),
    integration_id: Optional[UUID] = None,
    source: Optional[WebhookSource] = None,
    db: Session = Depends(get_db),
):
    """List webhook configurations"""
    service = WebhookService(db)
    configs, total = service.list_configs(integration_id, source, page, size)
    return PageResponse(
        content=[WebhookConfigResponse.model_validate(c) for c in configs],
        total=total,
        page=page,
        size=size,
    )


@router.post("/receive/{config_id}/gitlab")
async def receive_gitlab_webhook(
    config_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    x_gitlab_event: str = Header(None),
    x_gitlab_token: str = Header(None),
):
    """
    Receive GitLab webhook events.
    Supports: Story 5.2 - Real-time event processing
    """
    service = WebhookService(db)
    config = service.get_config(config_id)

    if not config or not config.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook config not found or inactive",
        )

    # Verify token if configured
    if config.secret_token and x_gitlab_token != config.secret_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook token",
        )

    payload = await request.json()
    headers = dict(request.headers)

    # Map GitLab event to our event type
    event_type = _map_gitlab_event(x_gitlab_event, payload)

    event = service.receive_event(config_id, event_type, payload, headers)

    # Process event in background for immediate response
    background_tasks.add_task(service.process_event, event.event_id)

    return {"status": "received", "event_id": str(event.event_id)}


@router.post("/receive/{config_id}/github")
async def receive_github_webhook(
    config_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    x_github_event: str = Header(None),
    x_hub_signature_256: str = Header(None),
):
    """
    Receive GitHub webhook events.
    Supports: Story 5.2 - Real-time event processing
    """
    service = WebhookService(db)
    config = service.get_config(config_id)

    if not config or not config.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook config not found or inactive",
        )

    payload_bytes = await request.body()
    payload = await request.json()
    headers = dict(request.headers)

    # Verify signature if configured
    if config.secret_token and x_hub_signature_256:
        if not service.verify_signature(config, payload_bytes, x_hub_signature_256.replace("sha256=", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature",
            )

    # Map GitHub event to our event type
    event_type = _map_github_event(x_github_event, payload)

    event = service.receive_event(config_id, event_type, payload, headers)

    # Process event in background
    background_tasks.add_task(service.process_event, event.event_id)

    return {"status": "received", "event_id": str(event.event_id)}


@router.post("/receive/{config_id}/jira")
async def receive_jira_webhook(
    config_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Receive Jira webhook events.
    Supports: Story 5.2 - Real-time event processing
    """
    service = WebhookService(db)
    config = service.get_config(config_id)

    if not config or not config.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook config not found or inactive",
        )

    payload = await request.json()
    headers = dict(request.headers)

    # Map Jira event to our event type
    event_type = _map_jira_event(payload.get("webhookEvent", ""))

    event = service.receive_event(config_id, event_type, payload, headers)

    # Process event in background
    background_tasks.add_task(service.process_event, event.event_id)

    return {"status": "received", "event_id": str(event.event_id)}


@router.post("/receive/{config_id}/cicd")
async def receive_cicd_webhook(
    config_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Receive CI/CD deployment events.
    Supports: Story 5.2 - Real-time deployment tracking
    """
    service = WebhookService(db)
    config = service.get_config(config_id)

    if not config or not config.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook config not found or inactive",
        )

    payload = await request.json()
    headers = dict(request.headers)

    event_type = WebhookEventType.DEPLOYMENT

    event = service.receive_event(config_id, event_type, payload, headers)

    # Process event in background
    background_tasks.add_task(service.process_event, event.event_id)

    return {"status": "received", "event_id": str(event.event_id)}


@router.post("/receive/{config_id}/prometheus")
async def receive_prometheus_webhook(
    config_id: UUID,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    Receive Prometheus alertmanager webhook events.
    Supports: Story 5.2 - Real-time incident tracking
    """
    service = WebhookService(db)
    config = service.get_config(config_id)

    if not config or not config.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Webhook config not found or inactive",
        )

    payload = await request.json()
    headers = dict(request.headers)

    # Process each alert in the payload
    alerts = payload.get("alerts", [payload])
    for alert in alerts:
        event_type = WebhookEventType.ALERT if alert.get("status") == "firing" else WebhookEventType.INCIDENT
        event = service.receive_event(config_id, event_type, alert, headers)
        background_tasks.add_task(service.process_event, event.event_id)

    return {"status": "received", "alerts_count": len(alerts)}


@router.get("/events", response_model=PageResponse)
async def list_webhook_events(
    page: int = Query(default=0, ge=0),
    size: int = Query(default=50, ge=1, le=100),
    config_id: Optional[UUID] = None,
    source: Optional[WebhookSource] = None,
    status: Optional[WebhookStatus] = None,
    db: Session = Depends(get_db),
):
    """List webhook events with filtering"""
    service = WebhookService(db)
    events, total = service.get_event_history(config_id, source, status, page, size)
    return PageResponse(
        content=[WebhookEventResponse.model_validate(e) for e in events],
        total=total,
        page=page,
        size=size,
    )


@router.post("/events/{event_id}/reprocess", response_model=WebhookProcessResult)
async def reprocess_webhook_event(
    event_id: UUID,
    db: Session = Depends(get_db),
):
    """Reprocess a failed webhook event"""
    service = WebhookService(db)
    try:
        return service.process_event(event_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/configs/{config_id}/stats", response_model=WebhookStats)
async def get_webhook_stats(
    config_id: UUID,
    db: Session = Depends(get_db),
):
    """Get webhook configuration statistics"""
    service = WebhookService(db)
    try:
        return service.get_stats(config_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


def _map_gitlab_event(event_header: str, payload: Dict[str, Any]) -> WebhookEventType:
    """Map GitLab event header to internal event type"""
    event_map = {
        "Push Hook": WebhookEventType.PUSH,
        "Tag Push Hook": WebhookEventType.TAG_PUSH,
        "Merge Request Hook": WebhookEventType.MERGE_REQUEST,
        "Note Hook": WebhookEventType.COMMENT,
        "Pipeline Hook": WebhookEventType.PIPELINE_SUCCESS,
    }

    event_type = event_map.get(event_header, WebhookEventType.PUSH)

    # Check pipeline status
    if event_header == "Pipeline Hook":
        status = payload.get("object_attributes", {}).get("status")
        if status == "failed":
            event_type = WebhookEventType.PIPELINE_FAILURE

    return event_type


def _map_github_event(event_header: str, payload: Dict[str, Any]) -> WebhookEventType:
    """Map GitHub event header to internal event type"""
    event_map = {
        "push": WebhookEventType.PUSH,
        "pull_request": WebhookEventType.PULL_REQUEST,
        "issue_comment": WebhookEventType.COMMENT,
        "deployment": WebhookEventType.DEPLOYMENT,
        "deployment_status": WebhookEventType.DEPLOYMENT,
    }
    return event_map.get(event_header, WebhookEventType.PUSH)


def _map_jira_event(webhook_event: str) -> WebhookEventType:
    """Map Jira webhook event to internal event type"""
    if "issue_created" in webhook_event:
        return WebhookEventType.ISSUE_CREATED
    elif "issue_updated" in webhook_event:
        return WebhookEventType.ISSUE_UPDATED
    elif "issue_deleted" in webhook_event or "issue_closed" in webhook_event:
        return WebhookEventType.ISSUE_CLOSED
    elif "sprint" in webhook_event:
        return WebhookEventType.SPRINT_UPDATED
    return WebhookEventType.ISSUE_UPDATED
