from __future__ import annotations

from app.models.lead import LeadRead, LeadStatus, OutreachDraft, OutreachDraftCreate
from app.utils.errors import AppError


class LeadService:
    def __init__(self, database) -> None:
        self.database = database

    async def list_leads(self, mission_id: str | None = None, skip: int = 0, limit: int = 100) -> list[LeadRead]:
        return await self.database.list_leads(mission_id=mission_id, skip=skip, limit=limit)

    async def get_lead(self, lead_id: str) -> LeadRead:
        lead = await self.database.get_lead(lead_id)
        if lead is None:
            raise AppError(message=f"Lead '{lead_id}' was not found", status_code=404, code="lead_not_found")
        return lead

    async def save_outreach_draft(self, lead_id: str, payload: OutreachDraftCreate) -> LeadRead:
        try:
            return await self.database.save_outreach_draft(lead_id, payload)
        except KeyError:
            raise AppError(message=f"Lead '{lead_id}' was not found", status_code=404, code="lead_not_found")
