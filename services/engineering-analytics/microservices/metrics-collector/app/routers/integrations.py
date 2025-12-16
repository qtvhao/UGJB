"""
Associated Frontend Files:
  - web/app/src/lib/api.ts (integrationApi.connections - lines 132-139)
  - web/app/src/pages/integrations/IntegrationsPage.tsx
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.integration import IntegrationStatus
from app.schemas.integration import (
    IntegrationCreate,
    IntegrationUpdate,
    IntegrationResponse,
)
from app.services.integration_service import IntegrationService

router = APIRouter(prefix="/integrations", tags=["Integrations"])


@router.post("/", response_model=IntegrationResponse, status_code=status.HTTP_201_CREATED)
async def create_integration(
    data: IntegrationCreate, db: Session = Depends(get_db)
):
    service = IntegrationService(db)
    integration = service.create_integration(data)
    return integration


@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(integration_id: UUID, db: Session = Depends(get_db)):
    service = IntegrationService(db)
    integration = service.get_integration(integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration not found: {integration_id}",
        )
    return integration


@router.put("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    integration_id: UUID, data: IntegrationUpdate, db: Session = Depends(get_db)
):
    service = IntegrationService(db)
    integration = service.update_integration(integration_id, data)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration not found: {integration_id}",
        )
    return integration


@router.get("/", response_model=List[IntegrationResponse])
async def list_integrations(
    status: Optional[IntegrationStatus] = None, db: Session = Depends(get_db)
):
    service = IntegrationService(db)
    integrations = service.list_integrations(status)
    return integrations


@router.delete("/{integration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_integration(integration_id: UUID, db: Session = Depends(get_db)):
    service = IntegrationService(db)
    deleted = service.delete_integration(integration_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration not found: {integration_id}",
        )


@router.post("/{integration_id}/sync", response_model=IntegrationResponse)
async def trigger_sync(integration_id: UUID, db: Session = Depends(get_db)):
    service = IntegrationService(db)
    integration = service.get_integration(integration_id)
    if not integration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration not found: {integration_id}",
        )

    # In production, this would trigger an async sync job
    # For now, just update the status
    updated = service.update_sync_status(
        integration_id, IntegrationStatus.ACTIVE, None
    )
    return updated
