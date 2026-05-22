from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str


class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Any | None = None
    request_id: str | None = None

    model_config = ConfigDict(extra="ignore")
