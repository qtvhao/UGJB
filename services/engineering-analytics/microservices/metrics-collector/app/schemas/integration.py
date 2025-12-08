from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.integration import IntegrationType, IntegrationStatus, SyncFrequency


class IntegrationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    integration_type: IntegrationType
    api_endpoint: str = Field(..., min_length=1, max_length=500)
    auth_method: str = Field(..., min_length=1, max_length=50)
    sync_frequency: SyncFrequency = SyncFrequency.DAILY


class IntegrationCreate(IntegrationBase):
    credentials: Optional[str] = None


class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    api_endpoint: Optional[str] = None
    auth_method: Optional[str] = None
    sync_frequency: Optional[SyncFrequency] = None
    status: Optional[IntegrationStatus] = None
    credentials: Optional[str] = None


class IntegrationResponse(IntegrationBase):
    integration_id: UUID
    status: IntegrationStatus
    last_sync_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
