from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class LeadStatus(str, Enum):
    NEW = "new"
    ASSIGNED = "assigned"
    DRAFT_SAVED = "draft_saved"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    ARCHIVED = "archived"


class OutreachDraft(BaseModel):
    subject: str
    body: str
    tone: str = "consultative"
    generated_at: datetime

    model_config = ConfigDict(extra="ignore")


class OutreachDraftCreate(BaseModel):
    subject: str = Field(min_length=1, max_length=180)
    body: str = Field(min_length=1)
    tone: str = Field(default="consultative", min_length=1, max_length=50)


class LeadRead(BaseModel):
    id: str
    mission_id: str | None = None
    full_name: str
    job_title: str
    company_name: str
    company_domain: str
    email: str
    location: str
    score: int = Field(ge=0, le=100)
    status: LeadStatus = LeadStatus.NEW
    signals: list[str] = Field(default_factory=list)
    outreach_draft: OutreachDraft | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="ignore")
