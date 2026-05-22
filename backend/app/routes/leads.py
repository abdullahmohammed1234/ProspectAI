from fastapi import APIRouter, Query, Request, status

from app.database.session import get_database
from app.models.lead import LeadRead, OutreachDraftCreate
from app.services.lead_service import LeadService


router = APIRouter(tags=["Leads"])


@router.get("/leads", response_model=list[LeadRead])
async def get_leads(request: Request, mission_id: str | None = Query(default=None)) -> list[LeadRead]:
    service = LeadService(get_database(request))
    return await service.list_leads(mission_id=mission_id)


@router.get("/leads/{lead_id}", response_model=LeadRead)
async def get_lead_details(lead_id: str, request: Request) -> LeadRead:
    service = LeadService(get_database(request))
    return await service.get_lead(lead_id)


@router.post("/leads/{lead_id}/outreach-draft", response_model=LeadRead, status_code=status.HTTP_200_OK)
async def save_outreach_draft(lead_id: str, payload: OutreachDraftCreate, request: Request) -> LeadRead:
    service = LeadService(get_database(request))
    return await service.save_outreach_draft(lead_id, payload)
