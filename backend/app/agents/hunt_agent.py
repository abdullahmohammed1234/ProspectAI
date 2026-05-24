from __future__ import annotations

from app.models.ai import CompanyHuntRequest, CompanyHuntResponse, CompanyHuntResult
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

    def fallback_hunt_companies(self, payload: CompanyHuntRequest) -> CompanyHuntResponse:
        base_name = self._base_name(payload.service_offering, payload.target_industry)
        companies = [
            CompanyHuntResult(
                company_name=f"{base_name} {index + 1}",
                website=f"https://{self._slugify(base_name)}{index + 1}.example",
                industry=payload.target_industry,
                summary=(
                    f"Selected as a likely fit for {payload.service_offering.lower()} opportunities in {payload.geography.lower()}."
                ),
                potential_signals=[
                    f"Targeting {payload.company_size.lower()} organizations",
                    f"Operating in {payload.geography.lower()}",
                ],
                rationale=[
                    f"Matches the target industry: {payload.target_industry}.",
                    f"Fits the requested geography: {payload.geography}.",
                ],
                fit_score=max(55, 88 - (index * 6)),
            )
            for index in range(payload.max_results)
        ]

        return CompanyHuntResponse(
            service_offering=payload.service_offering,
            target_industry=payload.target_industry,
            geography=payload.geography,
            company_size=payload.company_size,
            search_summary=(
                f"Fallback hunt identified {len(companies)} company archetype(s) aligned to {payload.target_industry.lower()} "
                f"and {payload.geography.lower()}."
            ),
            companies=companies,
        )

    @staticmethod
    def _base_name(service_offering: str, target_industry: str) -> str:
        offering_head = service_offering.split()[0] if service_offering.split() else "Prospect"
        industry_head = target_industry.split()[0] if target_industry.split() else "Growth"
        return f"{industry_head} {offering_head}".strip()

    @staticmethod
    def _slugify(text: str) -> str:
        return "-".join(part for part in text.lower().replace("/", " ").replace("&", " ").split() if part)