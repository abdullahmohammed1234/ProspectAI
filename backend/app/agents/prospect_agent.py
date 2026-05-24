from __future__ import annotations

from app.agents.outreach_drafting_agent import OutreachDraftingAgent
from app.models.ai import OutreachDraftRequest
from app.models.execution import ExecutionLevel, ExecutionLogEntry
from app.models.lead import LeadRead, LeadStatus, OutreachDraft
from app.models.mission import MissionRead
from app.services.ai_service import GeminiAIService
from app.utils.ids import generate_id
from app.utils.time import utc_now


class ProspectAgent:
    def __init__(self, ai_service: GeminiAIService | None = None) -> None:
        self.ai_service = ai_service
        self.outreach_agent = OutreachDraftingAgent(ai_service=ai_service)

    async def run_mission(self, mission: MissionRead, leads: list[LeadRead]) -> list[ExecutionLogEntry]:
        logs: list[ExecutionLogEntry] = [
            self._log(
                mission.id,
                step="mission_started",
                message=f"Mission '{mission.name}' started with {len(leads)} lead(s)",
                metadata={"lead_count": len(leads)},
            )
        ]

        if not leads:
            logs.append(
                self._log(
                    mission.id,
                    step="no_leads",
                    message="No leads were available for execution",
                    level=ExecutionLevel.WARNING,
                )
            )
            logs.append(
                self._log(
                    mission.id,
                    step="mission_completed",
                    message="Mission completed without any assigned leads",
                )
            )
            return logs

        for lead in leads:
            lead.outreach_draft = await self._generate_outreach_draft(mission, lead)
            lead.status = LeadStatus.DRAFT_SAVED
            lead.updated_at = utc_now()
            logs.append(
                self._log(
                    mission.id,
                    step="draft_generated",
                    message=f"Draft generated for {lead.full_name} at {lead.company_name}",
                    metadata={"lead_id": lead.id, "company": lead.company_name, "score": lead.score},
                )
            )

        logs.append(
            self._log(
                mission.id,
                step="mission_completed",
                message=f"Mission '{mission.name}' completed successfully",
                metadata={"lead_count": len(leads)},
            )
        )
        return logs

    async def _generate_outreach_draft(self, mission: MissionRead, lead: LeadRead) -> OutreachDraft:
        draft = await self.outreach_agent.draft_outreach(
            OutreachDraftRequest(
                mission_name=mission.name,
                mission_objective=mission.objective,
                outreach_style=mission.outreach_style,
                lead_id=lead.id,
                full_name=lead.full_name,
                job_title=lead.job_title,
                company_name=lead.company_name,
                company_domain=lead.company_domain,
                signals=lead.signals,
                company_research=self._compose_company_context(lead),
                decision_maker_reasoning=self._compose_decision_maker_context(lead, mission),
            )
        )
        return OutreachDraft(subject=draft.subject, body=draft.body, tone=mission.outreach_style, generated_at=utc_now())

    def _compose_company_context(self, lead: LeadRead) -> str:
        signals = ", ".join(lead.signals) if lead.signals else "none provided"
        return f"Company: {lead.company_name}. Domain: {lead.company_domain}. Signals: {signals}."

    def _compose_decision_maker_context(self, lead: LeadRead, mission: MissionRead) -> str:
        signals = ", ".join(lead.signals) if lead.signals else "none provided"
        return (
            f"Decision maker: {lead.full_name}, {lead.job_title} at {lead.company_name}. "
            f"Signals: {signals}. Mission objective: {mission.objective}."
        )

    def _log(
        self,
        mission_id: str,
        step: str,
        message: str,
        level: ExecutionLevel = ExecutionLevel.INFO,
        metadata: dict | None = None,
    ) -> ExecutionLogEntry:
        return ExecutionLogEntry(
            id=generate_id("log"),
            mission_id=mission_id,
            step=step,
            level=level,
            message=message,
            timestamp=utc_now(),
            metadata=metadata or {},
        )
