from __future__ import annotations

from app.models.ai import OutreachDraftRequest, OutreachDraftResponse
from app.services.ai_service import GeminiAIService


class OutreachDraftingAgent:
    def __init__(self, ai_service: GeminiAIService | None = None) -> None:
        self.ai_service = ai_service

    async def draft_outreach(self, payload: OutreachDraftRequest) -> OutreachDraftResponse:
        if self.ai_service is not None and self.ai_service.is_configured():
            return await self.ai_service.outreach_draft(payload)

        return self._draft_locally(payload)

    def _draft_locally(self, payload: OutreachDraftRequest) -> OutreachDraftResponse:
        first_name = self._first_name(payload.full_name)
        signal_summary = self._format_signals(payload.signals)
        subject = self._build_subject(payload)
        body = self._build_body(first_name, payload, signal_summary)
        reasoning = self._build_reasoning(payload, signal_summary)

        return OutreachDraftResponse(
            subject=subject,
            body=body,
            personalization_reasoning=reasoning,
        )

    def _build_subject(self, payload: OutreachDraftRequest) -> str:
        if payload.company_domain:
            return f"A quick idea for {payload.company_name}"
        return f"{payload.company_name}: a quick outreach idea"

    def _build_body(self, first_name: str, payload: OutreachDraftRequest, signal_summary: str) -> str:
        company_context = payload.company_name
        if payload.company_domain:
            company_context += f" ({payload.company_domain})"

        lines = [
            f"Hi {first_name},",
            "",
            f"I was looking at {company_context} and the context around {signal_summary}.",
            f"Given your role as {payload.job_title}, I thought it might be relevant to the work you are driving around {payload.mission_objective.lower()}.",
            "",
            "If useful, I can share a short, specific idea on where teams usually see the fastest lift.",
            "",
            "Best,",
            "ProspectAI",
        ]
        return "\n".join(lines)

    def _build_reasoning(self, payload: OutreachDraftRequest, signal_summary: str) -> str:
        return (
            f"Referenced {payload.company_name} and tied the note to {signal_summary}. "
            f"The message connects that context to {payload.job_title} and keeps the ask low-friction so it reads like a real business email."
        )

    @staticmethod
    def _format_signals(signals: list[str]) -> str:
        if not signals:
            return "the available account context"
        if len(signals) == 1:
            return signals[0]
        if len(signals) == 2:
            return f"{signals[0]} and {signals[1]}"
        return f"{', '.join(signals[:2])}, and {signals[2]}"

    @staticmethod
    def _first_name(full_name: str) -> str:
        parts = full_name.split()
        return parts[0] if parts else "there"