from __future__ import annotations

from typing import Iterable, List
import asyncio

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING

from app.core.config import get_settings
from app.models.lead import LeadRead, LeadStatus, OutreachDraft, OutreachDraftCreate
from app.models.mission import MissionCreate, MissionRead, MissionStatus
from app.models.execution import ExecutionLogEntry
from app.utils.ids import generate_id
from app.utils.time import utc_now


class MongoDatabase:
    def __init__(self, settings=None) -> None:
        settings = settings or get_settings()
        self._client = AsyncIOMotorClient(settings.mongodb_uri, maxPoolSize=settings.mongodb_max_pool_size)
        self._db = self._client[settings.mongodb_name]
        self.lock = asyncio.Lock()

    async def ensure_indexes(self) -> None:
        await self._db.missions.create_index([("id", ASCENDING)], unique=True)
        await self._db.missions.create_index([("created_at", DESCENDING)])
        await self._db.missions.create_index([("status", ASCENDING)])

        await self._db.leads.create_index([("id", ASCENDING)], unique=True)
        await self._db.leads.create_index([("email", ASCENDING)], unique=True)
        await self._db.leads.create_index([("score", DESCENDING)])
        await self._db.leads.create_index([("company_domain", ASCENDING)])

        await self._db.execution_logs.create_index([("mission_id", ASCENDING)])
        await self._db.execution_logs.create_index([("timestamp", ASCENDING)])

        await self._db.outreach_drafts.create_index([("mission_id", ASCENDING)])

        await self._db.users.create_index([("email", ASCENDING)], unique=True)

    # Mission
    async def create_mission(self, payload: MissionCreate) -> MissionRead:
        now = utc_now()
        mission_id = generate_id("mission")
        mission_doc = {
            "id": mission_id,
            "name": payload.name,
            "objective": payload.objective,
            "target_market": payload.target_market,
            "lead_count": payload.lead_count,
            "outreach_style": payload.outreach_style,
            "status": MissionStatus.PENDING.value,
            "assigned_lead_ids": [],
            "created_at": now,
            "updated_at": now,
        }
        await self._db.missions.insert_one(mission_doc)
        # select leads and assign
        selected = await self._select_leads(payload.lead_count, payload.target_market)
        if selected:
            ids = [lead["id"] for lead in selected]
            await self._db.leads.update_many({"id": {"$in": ids}}, {"$set": {"mission_id": mission_id, "status": LeadStatus.ASSIGNED.value, "updated_at": now}})
            await self._db.missions.update_one({"id": mission_id}, {"$set": {"assigned_lead_ids": ids}})

        doc = await self._db.missions.find_one({"id": mission_id})
        return MissionRead.model_validate(doc)

    async def get_mission(self, mission_id: str) -> MissionRead | None:
        doc = await self._db.missions.find_one({"id": mission_id})
        return MissionRead.model_validate(doc) if doc else None

    async def update_mission(self, mission: MissionRead) -> None:
        mission.updated_at = utc_now()
        await self._db.missions.update_one({"id": mission.id}, {"$set": mission.model_dump()})

    # Leads
    async def _select_leads(self, lead_count: int, target_market: str | None) -> list[dict]:
        query = {"mission_id": None}
        if target_market:
            target = target_market.lower()
            query["$or"] = [
                {"company_name": {"$regex": target, "$options": "i"}},
                {"location": {"$regex": target, "$options": "i"}},
                {"job_title": {"$regex": target, "$options": "i"}},
            ]
        cursor = self._db.leads.find(query).sort("score", -1).limit(lead_count)
        return await cursor.to_list(length=lead_count)

    async def get_leads_by_ids(self, ids: Iterable[str]) -> list[LeadRead]:
        cursor = self._db.leads.find({"id": {"$in": list(ids)}})
        docs = await cursor.to_list(length=1000)
        return [LeadRead.model_validate(doc) for doc in docs]

    async def list_leads(self, mission_id: str | None = None, skip: int = 0, limit: int = 100) -> list[LeadRead]:
        query = {}
        if mission_id is not None:
            query["mission_id"] = mission_id
        cursor = self._db.leads.find(query).sort("score", -1).skip(skip).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [LeadRead.model_validate(doc) for doc in docs]

    async def get_lead(self, lead_id: str) -> LeadRead | None:
        doc = await self._db.leads.find_one({"id": lead_id})
        return LeadRead.model_validate(doc) if doc else None

    async def save_outreach_draft(self, lead_id: str, payload: OutreachDraftCreate) -> LeadRead:
        now = utc_now()
        draft = {
            "subject": payload.subject,
            "body": payload.body,
            "tone": payload.tone,
            "generated_at": now,
        }
        await self._db.leads.update_one({"id": lead_id}, {"$set": {"outreach_draft": draft, "status": LeadStatus.DRAFT_SAVED.value, "updated_at": now}})
        doc = await self._db.leads.find_one({"id": lead_id})
        return LeadRead.model_validate(doc)

    # Execution logs
    async def append_execution_logs(self, mission_id: str, logs: list[ExecutionLogEntry]) -> None:
        if not logs:
            return
        docs = [log.model_dump() for log in logs]
        await self._db.execution_logs.insert_many(docs)

    async def get_logs(self, mission_id: str) -> list[ExecutionLogEntry]:
        cursor = self._db.execution_logs.find({"mission_id": mission_id}).sort("timestamp", 1)
        docs = await cursor.to_list(length=10000)
        return [ExecutionLogEntry.model_validate(doc) for doc in docs]

    async def update_leads(self, leads: Iterable[LeadRead]) -> None:
        ops = []
        for lead in leads:
            ops.append({"filter": {"id": lead.id}, "update": {"$set": lead.model_dump()}})
        # perform updates sequentially to keep it simple
        for op in ops:
            await self._db.leads.update_one(op["filter"], op["update"])
