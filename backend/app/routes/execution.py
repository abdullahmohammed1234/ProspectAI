from fastapi import APIRouter, Request

from app.database.session import get_database
from app.models.execution import ExecutionLogsResponse
from app.services.execution_service import ExecutionService


router = APIRouter(tags=["Execution"])


@router.get("/missions/{mission_id}/logs", response_model=ExecutionLogsResponse)
async def get_execution_logs(mission_id: str, request: Request) -> ExecutionLogsResponse:
    service = ExecutionService(get_database(request))
    return await service.get_logs(mission_id)
