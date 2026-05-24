from __future__ import annotations

from app.agents.prospect_agent import ProspectAgent
from app.models.mission import MissionCreate, MissionRead, MissionStartResponse, MissionStatus
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
        self.agent = agent or ProspectAgent(database=database, ai_service=ai_service)

    async def create_mission(self, payload: MissionCreate) -> MissionRead:
        return await self.database.create_mission(payload)

    async def start_mission(self, mission_id: str) -> MissionStartResponse:
        mission = await self.database.get_mission(mission_id)
        if mission is None:
            raise AppError(message=f"Mission '{mission_id}' was not found", status_code=404, code="mission_not_found")

        if mission.status == MissionStatus.RUNNING:
            raise AppError(message=f"Mission '{mission_id}' is already running", status_code=409, code="mission_already_running")

        mission.status = MissionStatus.RUNNING
        mission.started_at = utc_now()
        mission.updated_at = mission.started_at
        await self.database.update_mission(mission)

        result = await self.agent.run_mission(mission)
        return MissionStartResponse(mission=result.mission, result=result, logs=result.logs)

    # selection is handled by the database implementation
    def _select_leads(self, lead_count: int, target_market: str | None) -> list:
        raise NotImplementedError("Use database.create_mission which handles lead selection")
