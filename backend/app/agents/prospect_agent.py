from __future__ import annotations

import asyncio
import logging
from typing import Any

from app.agents.contact_identification_agent import ContactIdentificationAgent
from app.agents.hunt_agent import HuntAgent
from app.agents.outreach_drafting_agent import OutreachDraftingAgent
from app.agents.qualification_agent import QualificationAgent
from app.agents.research_agent import ResearchAgent
from app.models.ai import (
    CompanyHuntRequest,
    CompanyHuntResponse,
    CompanyResearchAgentRequest,
    ContactIdentificationRequest,
    LeadQualificationRequest,
    OutreachDraftRequest,
)
from app.models.execution import ExecutionLevel, ExecutionLogEntry
from app.models.lead import LeadRead, LeadStatus, OutreachDraft, OutreachDraftCreate
from app.models.mission import (
    MissionExecutionResult,
    MissionExecutionStatus,
    MissionLeadExecutionResult,
    MissionPipelineStep,
    MissionRead,
    MissionStatus,
)
from app.services.ai_service import GeminiAIService
from app.utils.ids import generate_id
from app.utils.time import utc_now


logger = logging.getLogger("prospectai.mission")


class ProspectAgent:
    def __init__(self, database, ai_service: GeminiAIService | None = None) -> None:
        self.database = database
        self.ai_service = ai_service
        self.hunt_agent = HuntAgent(ai_service=ai_service)
        self.research_agent = ResearchAgent(ai_service=ai_service)
        self.qualification_agent = QualificationAgent(ai_service=ai_service)
        self.contact_identification_agent = ContactIdentificationAgent(ai_service=ai_service)
        self.outreach_agent = OutreachDraftingAgent(ai_service=ai_service)
        self.max_retries = 2

    async def run_mission(self, mission: MissionRead) -> MissionExecutionResult:
        leads = await self.database.get_leads_by_ids(mission.assigned_lead_ids)
        logs: list[ExecutionLogEntry] = []
        recoveries: list[str] = []
        errors: list[str] = []
        lead_results: list[MissionLeadExecutionResult] = []
        hunt_result: CompanyHuntResponse | None = None
        persisted = False

        shared_context = self._build_shared_context(mission, leads)
        logs.append(
            self._log(
                mission.id,
                step="mission_started",
                message=f"Mission '{mission.name}' started with {len(leads)} assigned lead(s)",
                metadata={"lead_count": len(leads), "progress": 0},
            )
        )

        if not leads:
            no_lead_log = self._log(
                mission.id,
                step=MissionPipelineStep.HUNT.value,
                message="No leads were assigned to the mission, so the pipeline stopped after initialization",
                level=ExecutionLevel.WARNING,
                metadata={"progress": 100},
            )
            logs.append(no_lead_log)
            mission.status = MissionStatus.COMPLETED
            mission.started_at = mission.started_at or utc_now()
            mission.completed_at = utc_now()
            mission.updated_at = mission.completed_at
            await self.database.update_mission(mission)
            await self.database.append_execution_logs(mission.id, logs)
            return MissionExecutionResult(
                mission=mission,
                status=MissionExecutionStatus.COMPLETED,
                progress=100,
                shared_context=shared_context,
                logs=logs,
                persisted=True,
                completed_at=mission.completed_at,
            )

        try:
            hunt_request = CompanyHuntRequest(
                service_offering=mission.objective,
                target_industry=shared_context["target_industry"],
                geography=shared_context["geography"],
                company_size=shared_context["company_size"],
                max_results=min(5, max(1, len(leads))),
            )
            hunt_result, hunt_logs, hunt_recoveries = await self._execute_hunt_stage(mission, hunt_request)
            logs.extend(hunt_logs)
            recoveries.extend(hunt_recoveries)

            lead_tasks = [self._process_lead(mission, lead, hunt_result, shared_context) for lead in leads]
            task_results = await asyncio.gather(*lead_tasks)
            for lead_result, lead_logs, lead_recoveries, lead_errors in task_results:
                lead_results.append(lead_result)
                logs.extend(lead_logs)
                recoveries.extend(lead_recoveries)
                errors.extend(lead_errors)

            persist_log = self._log(
                mission.id,
                step=MissionPipelineStep.PERSISTENCE.value,
                message="Persisting mission outputs to MongoDB",
                metadata={"progress": 95, "lead_count": len(lead_results)},
            )
            logs.append(persist_log)
            persisted, persistence_recoveries = await self._persist_results(mission, lead_results, logs)
            recoveries.extend(persistence_recoveries)

            mission.status = MissionStatus.COMPLETED
            mission.completed_at = utc_now()
            mission.updated_at = mission.completed_at
            await self.database.update_mission(mission)

            completion_log = self._log(
                mission.id,
                step="mission_completed",
                message=f"Mission '{mission.name}' completed with {len(lead_results)} lead result(s)",
                metadata={"progress": 100, "lead_count": len(lead_results), "persisted": persisted},
            )
            logs.append(completion_log)
            await self.database.append_execution_logs(mission.id, [completion_log])
        except Exception as exc:
            error_text = str(exc)
            errors.append(error_text)
            logs.append(
                self._log(
                    mission.id,
                    step="mission_failed",
                    message=f"Mission '{mission.name}' encountered an unrecoverable error",
                    level=ExecutionLevel.ERROR,
                    metadata={"error": error_text},
                )
            )
            mission.status = MissionStatus.FAILED
            mission.completed_at = utc_now()
            mission.updated_at = mission.completed_at
            try:
                await self.database.update_mission(mission)
            except Exception as mission_update_error:
                errors.append(str(mission_update_error))

        status = MissionExecutionStatus.COMPLETED
        if mission.status == MissionStatus.FAILED:
            status = MissionExecutionStatus.FAILED
        elif recoveries or errors:
            status = MissionExecutionStatus.COMPLETED_WITH_RECOVERIES

        if status == MissionExecutionStatus.COMPLETED_WITH_RECOVERIES:
            recovery_log = self._log(
                mission.id,
                step="mission_recovered",
                message=f"Mission '{mission.name}' completed with recovery handling",
                level=ExecutionLevel.WARNING,
                metadata={"progress": 100, "recoveries": len(recoveries), "errors": len(errors)},
            )
            logs.append(recovery_log)
            await self.database.append_execution_logs(mission.id, [recovery_log])
        
        return MissionExecutionResult(
            mission=mission,
            status=status,
            progress=100 if mission.status != MissionStatus.FAILED else 0,
            shared_context=shared_context,
            hunt_result=hunt_result,
            lead_results=lead_results,
            recoveries=recoveries,
            errors=errors,
            logs=logs,
            persisted=persisted,
            completed_at=mission.completed_at,
        )

    async def _execute_hunt_stage(
        self,
        mission: MissionRead,
        payload: CompanyHuntRequest,
    ) -> tuple[CompanyHuntResponse, list[ExecutionLogEntry], list[str]]:
        logs: list[ExecutionLogEntry] = []
        recoveries: list[str] = []

        logs.append(
            self._log(
                mission.id,
                step=MissionPipelineStep.HUNT.value,
                message="Starting company hunt",
                metadata={"progress": 10, "max_results": payload.max_results},
            )
        )
        result = await self._execute_with_retry(
            mission_id=mission.id,
            step=MissionPipelineStep.HUNT.value,
            action=lambda: self.hunt_agent.hunt_companies(payload),
            fallback=lambda: self.hunt_agent.fallback_hunt_companies(payload),
            logs=logs,
            recovery_messages=recoveries,
        )
        logs.append(
            self._log(
                mission.id,
                step=MissionPipelineStep.HUNT.value,
                message="Company hunt completed",
                metadata={"progress": 20, "companies": len(result.companies)},
            )
        )
        return result, logs, recoveries

    async def _process_lead(
        self,
        mission: MissionRead,
        lead: LeadRead,
        hunt_result: CompanyHuntResponse,
        shared_context: dict[str, Any],
    ) -> tuple[MissionLeadExecutionResult, list[ExecutionLogEntry], list[str], list[str]]:
        logs: list[ExecutionLogEntry] = []
        recoveries: list[str] = []
        errors: list[str] = []

        logs.append(
            self._log(
                mission.id,
                step=f"lead_{lead.id}_processing_started",
                message=f"Processing lead '{lead.full_name}' at {lead.company_name}",
                metadata={"lead_id": lead.id, "company": lead.company_name, "progress": 20},
            )
        )

        research_payload = CompanyResearchAgentRequest(
            company_name=lead.company_name,
            company_domain=lead.company_domain,
            industry=shared_context["target_industry"],
            geography=lead.location or shared_context["geography"],
            company_size=shared_context["company_size"],
            business_model=shared_context["business_model"],
            target_market=shared_context["target_market"],
            current_initiatives=list(lead.signals[:3]),
            signals=list(lead.signals),
            context=self._compose_research_context(mission, lead, hunt_result),
        )
        research = await self._execute_with_retry(
            mission_id=mission.id,
            step=f"{MissionPipelineStep.RESEARCH.value}_{lead.id}",
            action=lambda: self.research_agent.research_company(research_payload),
            fallback=lambda: self.research_agent.fallback_research_company(research_payload),
            logs=logs,
            recovery_messages=recoveries,
        )
        logs.append(
            self._log(
                mission.id,
                step=f"{MissionPipelineStep.RESEARCH.value}_{lead.id}",
                message=f"Research completed for {lead.full_name}",
                metadata={"lead_id": lead.id, "progress": 35},
            )
        )

        qualification_payload = LeadQualificationRequest(
            lead_id=lead.id,
            full_name=lead.full_name,
            job_title=lead.job_title,
            company_name=lead.company_name,
            company_domain=lead.company_domain,
            location=lead.location,
            score=lead.score,
            signals=self._merge_signals(lead.signals, research.fit_indicators, hunt_result),
            mission_objective=mission.objective,
            target_market=mission.target_market,
        )
        qualification = await self._execute_with_retry(
            mission_id=mission.id,
            step=f"{MissionPipelineStep.QUALIFICATION.value}_{lead.id}",
            action=lambda: self.qualification_agent.qualify_lead(qualification_payload),
            fallback=lambda: self.qualification_agent._qualify_locally(qualification_payload),
            logs=logs,
            recovery_messages=recoveries,
        )
        logs.append(
            self._log(
                mission.id,
                step=f"{MissionPipelineStep.QUALIFICATION.value}_{lead.id}",
                message=f"Qualification completed for {lead.full_name}",
                metadata={"lead_id": lead.id, "fit_score": qualification.fit_score, "progress": 55},
            )
        )

        contact_payload = ContactIdentificationRequest(
            company_name=lead.company_name,
            company_domain=lead.company_domain,
            service_offering=mission.objective,
            target_industry=mission.target_market,
            target_market=shared_context["target_market"],
            mission_objective=mission.objective,
            signals=self._merge_signals(lead.signals, research.fit_indicators, hunt_result),
            company_research=research.research_summary,
        )
        contact = await self._execute_with_retry(
            mission_id=mission.id,
            step=f"{MissionPipelineStep.CONTACT_IDENTIFICATION.value}_{lead.id}",
            action=lambda: self.contact_identification_agent.identify_contact(contact_payload),
            fallback=lambda: self.contact_identification_agent._identify_locally(contact_payload),
            logs=logs,
            recovery_messages=recoveries,
        )
        logs.append(
            self._log(
                mission.id,
                step=f"{MissionPipelineStep.CONTACT_IDENTIFICATION.value}_{lead.id}",
                message=f"Contact identification completed for {lead.full_name}",
                metadata={"lead_id": lead.id, "progress": 75},
            )
        )

        outreach_payload = OutreachDraftRequest(
            mission_name=mission.name,
            mission_objective=mission.objective,
            outreach_style=mission.outreach_style,
            lead_id=lead.id,
            full_name=contact.name,
            job_title=contact.role,
            company_name=lead.company_name,
            company_domain=lead.company_domain,
            signals=self._merge_signals(lead.signals, research.fit_indicators, hunt_result),
            company_research=research.research_summary,
            decision_maker_reasoning=contact.contact_reasoning,
        )
        draft = await self._execute_with_retry(
            mission_id=mission.id,
            step=f"{MissionPipelineStep.OUTREACH_DRAFTING.value}_{lead.id}",
            action=lambda: self.outreach_agent.draft_outreach(outreach_payload),
            fallback=lambda: self.outreach_agent._draft_locally(outreach_payload),
            logs=logs,
            recovery_messages=recoveries,
        )

        now = utc_now()
        lead.status = LeadStatus.DRAFT_SAVED
        lead.outreach_draft = OutreachDraft(subject=draft.subject, body=draft.body, tone=mission.outreach_style, generated_at=now)
        lead.updated_at = now

        logs.append(
            self._log(
                mission.id,
                step=f"{MissionPipelineStep.OUTREACH_DRAFTING.value}_{lead.id}",
                message=f"Outreach drafted for {lead.full_name}",
                metadata={"lead_id": lead.id, "company": lead.company_name, "progress": 90},
            )
        )
        logs.append(
            self._log(
                mission.id,
                step=f"lead_{lead.id}_complete",
                message=f"Lead pipeline completed for {lead.full_name}",
                metadata={"lead_id": lead.id, "progress": 100},
            )
        )

        lead_result = MissionLeadExecutionResult(
            lead=lead,
            research=research,
            qualification=qualification,
            contact=contact,
            outreach_draft=lead.outreach_draft,
            recoveries=recoveries,
            errors=errors,
        )
        return lead_result, logs, recoveries, errors

    async def _execute_with_retry(
        self,
        mission_id: str,
        step: str,
        action,
        fallback,
        logs: list[ExecutionLogEntry],
        recovery_messages: list[str],
    ):
        last_error: Exception | None = None
        attempts = self.max_retries + 1
        for attempt in range(1, attempts + 1):
            try:
                logger.info("step_started", extra={"mission_id": mission_id, "step": step, "attempt": attempt})
                result = await action()
                if attempt > 1:
                    recovery_messages.append(f"{step} recovered after {attempt - 1} retry attempt(s)")
                return result
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "step_retry_failed",
                    extra={"mission_id": mission_id, "step": step, "attempt": attempt, "error": str(exc)},
                )
                if attempt >= attempts:
                    break
                logs.append(
                    self._log(
                        mission_id,
                        step=step,
                        message=f"Retrying {step} after transient failure",
                        level=ExecutionLevel.WARNING,
                        metadata={"attempt": attempt, "error": str(exc)},
                    )
                )
                await asyncio.sleep(self._retry_delay(attempt - 1))

        if fallback is not None:
            recovery_messages.append(f"{step} used fallback recovery after repeated failures")
            return fallback()

        if last_error is not None:
            raise last_error
        raise RuntimeError(f"{step} failed without an exception")

    async def _persist_results(
        self,
        mission: MissionRead,
        lead_results: list[MissionLeadExecutionResult],
        logs: list[ExecutionLogEntry],
    ) -> tuple[bool, list[str]]:
        leads = [result.lead for result in lead_results]
        try:
            await self.database.update_leads(leads)
        except Exception as exc:
            recovery_messages = [f"persistence recovered from batch lead update failure: {exc}"]
            logs.append(
                self._log(
                    mission.id,
                    step=MissionPipelineStep.PERSISTENCE.value,
                    message="Batch lead persistence failed; retrying lead-by-lead",
                    level=ExecutionLevel.WARNING,
                    metadata={"error": str(exc)},
                )
            )
            persisted_any = False
            for lead_result in lead_results:
                lead = lead_result.lead
                draft = lead.outreach_draft
                if draft is None:
                    continue
                try:
                    await self.database.save_outreach_draft(
                        lead.id,
                        OutreachDraftCreate(subject=draft.subject, body=draft.body, tone=draft.tone),
                    )
                    persisted_any = True
                except Exception:
                    continue
            await self.database.append_execution_logs(mission.id, logs)
            return persisted_any, recovery_messages

        await self.database.append_execution_logs(mission.id, logs)
        return True, []

    def _build_shared_context(self, mission: MissionRead, leads: list[LeadRead]) -> dict[str, Any]:
        return {
            "mission_name": mission.name,
            "mission_objective": mission.objective,
            "target_market": mission.target_market or self._guess_target_market(leads),
            "target_industry": mission.target_market or self._guess_target_market(leads),
            "geography": self._guess_geography(leads),
            "company_size": self._guess_company_size(mission.lead_count),
            "business_model": self._guess_business_model(mission.objective, mission.outreach_style),
            "lead_ids": [lead.id for lead in leads],
            "lead_names": [lead.full_name for lead in leads],
        }

    def _compose_research_context(self, mission: MissionRead, lead: LeadRead, hunt_result: CompanyHuntResponse) -> str:
        hunt_summary = hunt_result.search_summary
        lead_signals = ", ".join(lead.signals) if lead.signals else "none provided"
        return (
            f"Mission objective: {mission.objective}. Target market: {mission.target_market or 'unspecified'}. "
            f"Lead context: {lead.full_name} at {lead.company_name}, signals: {lead_signals}. "
            f"Hunt summary: {hunt_summary}."
        )

    @staticmethod
    def _merge_signals(signals: list[str], research_signals: list[str], hunt_result: CompanyHuntResponse) -> list[str]:
        merged = list(signals)
        merged.extend(research_signals)
        for company in hunt_result.companies:
            merged.extend(company.potential_signals)
        deduped: list[str] = []
        seen: set[str] = set()
        for signal in merged:
            if signal in seen:
                continue
            seen.add(signal)
            deduped.append(signal)
        return deduped

    @staticmethod
    def _guess_target_market(leads: list[LeadRead]) -> str:
        if not leads:
            return "general market"
        top_job_titles = " ".join(lead.job_title for lead in leads[:3]).lower()
        if any(term in top_job_titles for term in ["sales", "revenue", "pipeline"]):
            return "revenue teams"
        if any(term in top_job_titles for term in ["marketing", "demand"]):
            return "marketing teams"
        if any(term in top_job_titles for term in ["operations", "revops"]):
            return "operations teams"
        return leads[0].company_name

    @staticmethod
    def _guess_geography(leads: list[LeadRead]) -> str:
        if not leads:
            return "Global"
        return leads[0].location or "Global"

    @staticmethod
    def _guess_company_size(lead_count: int) -> str:
        if lead_count <= 3:
            return "1-50 employees"
        if lead_count <= 10:
            return "51-200 employees"
        if lead_count <= 25:
            return "201-1000 employees"
        return "1000+ employees"

    @staticmethod
    def _guess_business_model(objective: str, outreach_style: str) -> str:
        text = f"{objective} {outreach_style}".lower()
        if any(term in text for term in ["enterprise", "contract", "consulting"]):
            return "services-led"
        if any(term in text for term in ["saas", "subscription", "platform", "software"]):
            return "software"
        return "hybrid"

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

    def _retry_delay(self, attempt: int) -> float:
        return 0.5 * (2**attempt)