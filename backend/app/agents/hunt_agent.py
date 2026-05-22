from __future__ import annotations

from app.models.ai import CompanyHuntRequest, CompanyHuntResponse
from app.services.ai_service import GeminiAIService
from app.utils.errors import AppError


class HuntAgent:
    def __init__(self, ai_service: GeminiAIService | None = None) -> None:
        self.ai_service = ai_service

    async def hunt_companies(self, payload: CompanyHuntRequest) -> CompanyHuntResponse:
        if self.ai_service is None or not self.ai_service.is_configured():
            raise AppError(
                message="Gemini API key is not configured",
                status_code=503,
                code="gemini_api_key_missing",
            )

        return await self.ai_service.hunt_companies(payload)