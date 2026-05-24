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

    def fallback_research_company(self, payload: CompanyResearchAgentRequest) -> CompanyResearchAgentResponse:
        signals = payload.signals or payload.current_initiatives
        signal_summary = ", ".join(signals) if signals else "the available account context"

        return CompanyResearchAgentResponse(
            research_summary=(
                f"{payload.company_name} appears to be operating with a clear focus on {payload.target_market or 'its core market'}, "
                f"based on the provided context around {signal_summary}."
            ),
            fit_indicators=[
                f"Company domain: {payload.company_domain or 'unknown'}",
                f"Industry: {payload.industry or 'unspecified'}",
                f"Geography: {payload.geography or 'unspecified'}",
            ],
            pain_points=[
                f"Potential need to coordinate around {payload.business_model or 'current growth motions'}.",
                f"Possible execution pressure from {signal_summary}.",
            ],
            ai_adoption_signals=[
                "Signals suggest a willingness to modernize workflows.",
                "Structured outreach and research could resonate with the account.",
            ],
            business_context=[
                f"Target market: {payload.target_market or 'not specified'}",
                f"Current initiatives: {', '.join(payload.current_initiatives) if payload.current_initiatives else 'none provided'}",
            ],
        )
