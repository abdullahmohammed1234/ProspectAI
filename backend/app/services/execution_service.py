from __future__ import annotations

from app.models.execution import ExecutionLogsResponse
from app.utils.errors import AppError


class ExecutionService:
    def __init__(self, database) -> None:
        self.database = database

    async def get_logs(self, mission_id: str) -> ExecutionLogsResponse:
        try:
            logs = await self.database.get_logs(mission_id)
        except KeyError:
            raise AppError(message=f"Mission '{mission_id}' was not found", status_code=404, code="mission_not_found")

        sorted_logs = sorted(logs, key=lambda item: item.timestamp)
        return ExecutionLogsResponse(mission_id=mission_id, logs=sorted_logs)
