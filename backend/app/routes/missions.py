from fastapi import APIRouter, Request, status

from app.database.session import get_database
from app.models.mission import MissionCreate, MissionRead, MissionStartResponse
from app.services.mission_service import MissionService
from app.services.ai_service import get_ai_service


router = APIRouter(tags=["Missions"])


@router.post("/missions", response_model=MissionRead, status_code=status.HTTP_201_CREATED)
async def create_mission(payload: MissionCreate, request: Request) -> MissionRead:
    service = MissionService(get_database(request), ai_service=get_ai_service(request))
    return await service.create_mission(payload)


@router.post("/missions/{mission_id}/start", response_model=MissionStartResponse)
async def start_mission(mission_id: str, request: Request) -> MissionStartResponse:
    service = MissionService(get_database(request), ai_service=get_ai_service(request))
    mission, logs = await service.start_mission(mission_id)
    return MissionStartResponse(mission=mission, logs=logs)
