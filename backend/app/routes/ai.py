from __future__ import annotations

import json

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from app.agents.outreach_drafting_agent import OutreachDraftingAgent
from app.agents.contact_identification_agent import ContactIdentificationAgent
from app.agents.hunt_agent import HuntAgent
from app.agents.qualification_agent import QualificationAgent
from app.agents.research_agent import ResearchAgent
from app.models.ai import (
    CompanyHuntRequest,
    CompanyHuntResponse,
    CompanyResearchAgentRequest,
    CompanyResearchAgentResponse,
    CompanyResearchRequest,
    CompanyResearchResponse,
    ContactIdentificationRequest,
    ContactIdentificationResponse,
    DecisionMakerReasoningRequest,
    DecisionMakerReasoningResponse,
    LeadQualificationRequest,
    LeadQualificationResponse,
    OutreachDraftRequest,
    OutreachDraftResponse,
)
from app.services.ai_service import get_ai_service


router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/hunt-companies", response_model=CompanyHuntResponse)
async def hunt_companies(payload: CompanyHuntRequest, request: Request) -> CompanyHuntResponse:
    agent = HuntAgent(ai_service=get_ai_service(request))
    return await agent.hunt_companies(payload)


@router.post("/company-research", response_model=CompanyResearchResponse)
async def company_research(payload: CompanyResearchRequest, request: Request) -> CompanyResearchResponse:
    service = get_ai_service(request)
    return await service.company_research(payload)


@router.post("/research", response_model=CompanyResearchAgentResponse)
async def research(payload: CompanyResearchAgentRequest, request: Request) -> CompanyResearchAgentResponse:
    agent = ResearchAgent(ai_service=get_ai_service(request))
    return await agent.research_company(payload)


@router.post("/contact-identification", response_model=ContactIdentificationResponse)
async def contact_identification(
    payload: ContactIdentificationRequest,
    request: Request,
) -> ContactIdentificationResponse:
    agent = ContactIdentificationAgent(ai_service=get_ai_service(request))
    return await agent.identify_contact(payload)


@router.post("/lead-qualification", response_model=LeadQualificationResponse)
async def lead_qualification(payload: LeadQualificationRequest, request: Request) -> LeadQualificationResponse:
    agent = QualificationAgent(ai_service=get_ai_service(request))
    return await agent.qualify_lead(payload)


@router.post("/decision-maker-reasoning", response_model=DecisionMakerReasoningResponse)
async def decision_maker_reasoning(
    payload: DecisionMakerReasoningRequest,
    request: Request,
) -> DecisionMakerReasoningResponse:
    service = get_ai_service(request)
    return await service.decision_maker_reasoning(payload)


@router.post("/outreach-draft", response_model=OutreachDraftResponse)
async def outreach_draft(payload: OutreachDraftRequest, request: Request) -> OutreachDraftResponse:
    agent = OutreachDraftingAgent(ai_service=get_ai_service(request))
    return await agent.draft_outreach(payload)


@router.post("/outreach-draft/stream")
async def stream_outreach_draft(payload: OutreachDraftRequest, request: Request) -> StreamingResponse:
    service = get_ai_service(request)

    async def event_stream():
        async for event in service.stream_outreach_draft(payload):
            yield json.dumps(event) + "\n"

    return StreamingResponse(event_stream(), media_type="application/x-ndjson")
