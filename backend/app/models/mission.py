from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.ai import (
    CompanyHuntResponse,
    CompanyResearchAgentResponse,
    ContactIdentificationResponse,
    LeadQualificationResponse,
)
from app.models.execution import ExecutionLogEntry
from app.models.lead import LeadRead, OutreachDraft


class MissionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class MissionExecutionStatus(str, Enum):
    COMPLETED = "completed"
    COMPLETED_WITH_RECOVERIES = "completed_with_recoveries"
    FAILED = "failed"


class MissionPipelineStep(str, Enum):
    HUNT = "hunt"
    RESEARCH = "research"
    QUALIFICATION = "qualification"
    CONTACT_IDENTIFICATION = "contact_identification"
    OUTREACH_DRAFTING = "outreach_drafting"
    PERSISTENCE = "persistence"


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


class MissionLeadExecutionResult(BaseModel):
    lead: LeadRead
    research: CompanyResearchAgentResponse | None = None
    qualification: LeadQualificationResponse | None = None
    contact: ContactIdentificationResponse | None = None
    outreach_draft: OutreachDraft | None = None
    recoveries: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class MissionExecutionResult(BaseModel):
    mission: MissionRead
    status: MissionExecutionStatus = MissionExecutionStatus.COMPLETED
    progress: int = Field(default=0, ge=0, le=100)
    shared_context: dict[str, Any] = Field(default_factory=dict)
    hunt_result: CompanyHuntResponse | None = None
    lead_results: list[MissionLeadExecutionResult] = Field(default_factory=list)
    recoveries: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    logs: list[ExecutionLogEntry] = Field(default_factory=list)
    persisted: bool = False
    completed_at: datetime | None = None

    model_config = ConfigDict(extra="ignore")


class MissionStartResponse(BaseModel):
    mission: MissionRead
    result: MissionExecutionResult
    logs: list[ExecutionLogEntry]

    model_config = ConfigDict(extra="ignore")
