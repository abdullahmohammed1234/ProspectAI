from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ExecutionLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class ExecutionLogEntry(BaseModel):
    id: str
    mission_id: str
    step: str
    level: ExecutionLevel = ExecutionLevel.INFO
    message: str
    timestamp: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(extra="ignore")


class ExecutionLogsResponse(BaseModel):
    mission_id: str
    logs: list[ExecutionLogEntry]

    model_config = ConfigDict(extra="ignore")
