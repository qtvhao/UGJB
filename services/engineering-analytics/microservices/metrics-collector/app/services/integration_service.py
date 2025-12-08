from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.integration import Integration, IntegrationStatus
from app.schemas.integration import IntegrationCreate, IntegrationUpdate


class IntegrationService:
    def __init__(self, db: Session):
        self.db = db

    def create_integration(self, data: IntegrationCreate) -> Integration:
        integration = Integration(
            name=data.name,
            integration_type=data.integration_type,
            api_endpoint=data.api_endpoint,
            auth_method=data.auth_method,
            credentials_encrypted=data.credentials,
            sync_frequency=data.sync_frequency,
            status=IntegrationStatus.ACTIVE,
        )
        self.db.add(integration)
        self.db.commit()
        self.db.refresh(integration)
        return integration

    def get_integration(self, integration_id: UUID) -> Optional[Integration]:
        return self.db.query(Integration).filter(
            Integration.integration_id == integration_id
        ).first()

    def update_integration(
        self, integration_id: UUID, data: IntegrationUpdate
    ) -> Optional[Integration]:
        integration = self.get_integration(integration_id)
        if not integration:
            return None

        if data.name is not None:
            integration.name = data.name
        if data.api_endpoint is not None:
            integration.api_endpoint = data.api_endpoint
        if data.auth_method is not None:
            integration.auth_method = data.auth_method
        if data.sync_frequency is not None:
            integration.sync_frequency = data.sync_frequency
        if data.status is not None:
            integration.status = data.status
        if data.credentials is not None:
            integration.credentials_encrypted = data.credentials

        integration.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(integration)
        return integration

    def list_integrations(
        self, status: Optional[IntegrationStatus] = None
    ) -> List[Integration]:
        query = self.db.query(Integration)
        if status:
            query = query.filter(Integration.status == status)
        return query.all()

    def update_sync_status(
        self,
        integration_id: UUID,
        status: IntegrationStatus,
        error_message: Optional[str] = None,
    ) -> Optional[Integration]:
        integration = self.get_integration(integration_id)
        if not integration:
            return None

        integration.status = status
        integration.last_sync_at = datetime.utcnow()
        integration.error_message = error_message
        integration.updated_at = datetime.utcnow()

        self.db.commit()
        self.db.refresh(integration)
        return integration

    def delete_integration(self, integration_id: UUID) -> bool:
        integration = self.get_integration(integration_id)
        if not integration:
            return False
        self.db.delete(integration)
        self.db.commit()
        return True
