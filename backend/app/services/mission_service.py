from __future__ import annotations

from app.agents.prospect_agent import ProspectAgent
from app.models.lead import LeadStatus
from app.models.mission import MissionCreate, MissionRead, MissionStatus
from app.services.ai_service import GeminiAIService
from app.utils.errors import AppError
from app.utils.time import utc_now


class MissionService:
    def __init__(
        self,
        database,
        agent: ProspectAgent | None = None,
        ai_service: GeminiAIService | None = None,
    ) -> None:
        self.database = database
        self.agent = agent or ProspectAgent(ai_service=ai_service)

    async def create_mission(self, payload: MissionCreate) -> MissionRead:
        return await self.database.create_mission(payload)

    async def start_mission(self, mission_id: str) -> tuple[MissionRead, list]:
        mission = await self.database.get_mission(mission_id)
        if mission is None:
            raise AppError(message=f"Mission '{mission_id}' was not found", status_code=404, code="mission_not_found")

        if mission.status == MissionStatus.RUNNING:
            raise AppError(message=f"Mission '{mission_id}' is already running", status_code=409, code="mission_already_running")

        mission.status = MissionStatus.RUNNING
        mission.started_at = utc_now()
        mission.updated_at = mission.started_at
        await self.database.update_mission(mission)

        leads = await self.database.get_leads_by_ids(mission.assigned_lead_ids)

        logs = await self.agent.run_mission(mission, leads)

        # persist lead updates and logs
        await self.database.update_leads(leads)

        mission.status = MissionStatus.COMPLETED
        mission.completed_at = utc_now()
        mission.updated_at = mission.completed_at
        await self.database.update_mission(mission)
        await self.database.append_execution_logs(mission.id, logs)

        return mission, logs

    # selection is handled by the database implementation
    def _select_leads(self, lead_count: int, target_market: str | None) -> list:
        raise NotImplementedError("Use database.create_mission which handles lead selection")
