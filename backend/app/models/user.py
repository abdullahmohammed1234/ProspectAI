from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    email: str
    name: str | None = None


class UserRead(BaseModel):
    id: str
    email: str
    name: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(extra="ignore")
