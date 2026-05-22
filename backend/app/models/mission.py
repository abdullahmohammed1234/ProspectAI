from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.models.execution import ExecutionLogEntry


class MissionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class MissionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    objective: str = Field(min_length=1, max_length=500)
    target_market: str | None = Field(default=None, max_length=120)
    lead_count: int = Field(default=10, ge=1, le=100)
    outreach_style: str = Field(default="consultative", min_length=1, max_length=50)

    model_config = ConfigDict(extra="ignore")


class MissionRead(BaseModel):
    id: str
    name: str
    objective: str
    target_market: str | None = None
    lead_count: int
    outreach_style: str
    status: MissionStatus = MissionStatus.PENDING
    assigned_lead_ids: list[str] = Field(default_factory=list)
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    updated_at: datetime

    model_config = ConfigDict(extra="ignore")


class MissionStartResponse(BaseModel):
    mission: MissionRead
    logs: list[ExecutionLogEntry]

    model_config = ConfigDict(extra="ignore")
