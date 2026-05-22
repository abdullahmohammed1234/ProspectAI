from __future__ import annotations

import asyncio
from typing import Any, Iterable, List

from app.models.lead import LeadRead, LeadStatus, OutreachDraft, OutreachDraftCreate
from app.models.mission import MissionCreate, MissionRead, MissionStatus
from app.models.execution import ExecutionLogEntry
from app.utils.ids import generate_id
from app.utils.time import utc_now


class InMemoryDatabase:
    """A simple in-memory database exposing async methods used by services.

    This maintains the original seeded leads and provides methods for CRUD,
    filtering, pagination, timestamps, and execution logs.
    """

    def __init__(self) -> None:
        self.lock = asyncio.Lock()
        self.missions: dict[str, MissionRead] = {}
        self.leads: dict[str, LeadRead] = {}
        self.execution_logs: dict[str, list[ExecutionLogEntry]] = {}
        self._seed_leads()

    def _seed_leads(self) -> None:
        # seed with a few example leads; keep lightweight and robust
        try:
            now = utc_now()
            seed_data = [
                {
                    "full_name": "Avery Chen",
                    "job_title": "VP of Growth",
                    "company_name": "Northstar Analytics",
                    "company_domain": "northstar.ai",
                    "email": "avery.chen@northstar.ai",
                    "location": "San Francisco, CA",
                    "score": 95,
                    "signals": ["Hired a growth team", "Recently posted outbound roles"],
                },
                {
                    "full_name": "Jordan Patel",
                    "job_title": "Head of RevOps",
                    "company_name": "Signal Harbor",
                    "company_domain": "signalharbor.com",
                    "email": "jordan.patel@signalharbor.com",
                    "location": "New York, NY",
                    "score": 89,
                    "signals": ["Migrating CRM workflows", "High pipeline activity"],
                },
                {
                    "full_name": "Maya Rodriguez",
                    "job_title": "Director of Sales",
                    "company_name": "LaunchGrid",
                    "company_domain": "launchgrid.io",
                    "email": "maya.rodriguez@launchgrid.io",
                    "location": "Austin, TX",
                    "score": 84,
                    "signals": ["Expanded SDR team", "Using multiple outreach tools"],
                },
                {
                    "full_name": "Noah Williams",
                    "job_title": "Founder",
                    "company_name": "PeakLoop",
                    "company_domain": "peakloop.co",
                    "email": "noah.williams@peakloop.co",
                    "location": "Denver, CO",
                    "score": 78,
                    "signals": ["Series A raised", "Hiring first sales lead"],
                },
            ]

            for lead_data in seed_data:
                lead_id = generate_id("lead")
                self.leads[lead_id] = LeadRead(
                    id=lead_id,
                    mission_id=None,
                    status=LeadStatus.NEW,
                    outreach_draft=None,
                    created_at=now,
                    updated_at=now,
                    **lead_data,
                )
        except Exception:
            # no-op if seeding fails
            pass

    # Mission related
    async def create_mission(self, payload: MissionCreate) -> MissionRead:
        now = utc_now()
        mission_id = generate_id("mission")
        async with self.lock:
            mission = MissionRead(
                id=mission_id,
                name=payload.name,
                objective=payload.objective,
                target_market=payload.target_market,
                lead_count=payload.lead_count,
                outreach_style=payload.outreach_style,
                status=MissionStatus.PENDING,
                assigned_lead_ids=[],
                created_at=now,
                updated_at=now,
            )
            selected_leads = await self._select_leads(payload.lead_count, payload.target_market)
            mission.assigned_lead_ids = [lead.id for lead in selected_leads]
            for lead in selected_leads:
                lead.mission_id = mission.id
                lead.status = LeadStatus.ASSIGNED
                lead.updated_at = now

            self.missions[mission.id] = mission
            self.execution_logs[mission.id] = []

        return mission

    async def get_mission(self, mission_id: str) -> MissionRead | None:
        async with self.lock:
            return self.missions.get(mission_id)

    async def update_mission(self, mission: MissionRead) -> None:
        async with self.lock:
            mission.updated_at = utc_now()
            self.missions[mission.id] = mission

    # Lead related
    async def _select_leads(self, lead_count: int, target_market: str | None) -> list[LeadRead]:
        leads = [lead for lead in self.leads.values() if lead.mission_id is None]
        if target_market:
            target = target_market.lower()
            filtered = [
                lead
                for lead in leads
                if target in lead.company_name.lower() or target in lead.location.lower() or target in lead.job_title.lower()
            ]
            if filtered:
                leads = filtered

        return sorted(leads, key=lambda item: item.score, reverse=True)[:lead_count]

    async def get_leads_by_ids(self, ids: Iterable[str]) -> list[LeadRead]:
        async with self.lock:
            return [self.leads[id] for id in ids if id in self.leads]

    async def update_leads(self, leads: Iterable[LeadRead]) -> None:
        async with self.lock:
            for lead in leads:
                lead.updated_at = utc_now()
                self.leads[lead.id] = lead

    async def list_leads(self, mission_id: str | None = None, skip: int = 0, limit: int = 100) -> list[LeadRead]:
        async with self.lock:
            leads = list(self.leads.values())
            if mission_id is not None:
                leads = [lead for lead in leads if lead.mission_id == mission_id]

        sorted_leads = sorted(leads, key=lambda item: item.score, reverse=True)
        return sorted_leads[skip : skip + limit]

    async def get_lead(self, lead_id: str) -> LeadRead | None:
        async with self.lock:
            return self.leads.get(lead_id)

    async def save_outreach_draft(self, lead_id: str, payload: OutreachDraftCreate) -> LeadRead:
        async with self.lock:
            lead = self.leads.get(lead_id)
            if lead is None:
                raise KeyError("lead_not_found")
            now = utc_now()
            lead.outreach_draft = OutreachDraft(
                subject=payload.subject,
                body=payload.body,
                tone=payload.tone,
                generated_at=now,
            )
            lead.status = LeadStatus.DRAFT_SAVED
            lead.updated_at = now
            self.leads[lead_id] = lead

        return lead

    # Execution logs
    async def append_execution_logs(self, mission_id: str, logs: list[ExecutionLogEntry]) -> None:
        async with self.lock:
            self.execution_logs.setdefault(mission_id, []).extend(logs)

    async def get_logs(self, mission_id: str) -> list[ExecutionLogEntry]:
        async with self.lock:
            if mission_id not in self.missions:
                raise KeyError("mission_not_found")
            return list(self.execution_logs.get(mission_id, []))

