from __future__ import annotations

from app.models.ai import CompanyResearchAgentRequest, CompanyResearchAgentResponse
from app.services.ai_service import GeminiAIService
from app.utils.errors import AppError


class ResearchAgent:
    def __init__(self, ai_service: GeminiAIService | None = None) -> None:
        self.ai_service = ai_service

    async def research_company(self, payload: CompanyResearchAgentRequest) -> CompanyResearchAgentResponse:
        if self.ai_service is None or not self.ai_service.is_configured():
            raise AppError(
                message="Gemini API key is not configured",
                status_code=503,
                code="gemini_api_key_missing",
            )

        return await self.ai_service.research_agent(payload)
