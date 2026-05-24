from __future__ import annotations

from app.models.ai import ContactIdentificationRequest, ContactIdentificationResponse
from app.services.ai_service import GeminiAIService


class ContactIdentificationAgent:
    def __init__(self, ai_service: GeminiAIService | None = None) -> None:
        self.ai_service = ai_service

    async def identify_contact(self, payload: ContactIdentificationRequest) -> ContactIdentificationResponse:
        if self.ai_service is not None and self.ai_service.is_configured():
            return await self.ai_service.contact_identification(payload)

        return self._identify_locally(payload)

    def _identify_locally(self, payload: ContactIdentificationRequest) -> ContactIdentificationResponse:
        if payload.candidate_contacts:
            chosen_contact = max(payload.candidate_contacts, key=lambda candidate: self._score_candidate(candidate.role, payload))
            linkedin_url_placeholder = chosen_contact.linkedin_url or self._linkedin_placeholder(chosen_contact.name)
            return ContactIdentificationResponse(
                name=chosen_contact.name,
                role=chosen_contact.role,
                linkedin_url_placeholder=linkedin_url_placeholder,
                contact_reasoning=(
                    f"{chosen_contact.name} is the strongest match because the role ownership aligns with {payload.service_offering.lower()} "
                    f"and the current mission objective."
                ),
            )

        role = self._infer_role(payload)
        return ContactIdentificationResponse(
            name=f"Primary {role}",
            role=role,
            linkedin_url_placeholder=self._linkedin_placeholder(f"Primary {role}"),
            contact_reasoning=self._build_reasoning(payload, role),
        )

    def _build_reasoning(self, payload: ContactIdentificationRequest, role: str) -> str:
        signals = ", ".join(payload.signals) if payload.signals else "the available account context"
        return (
            f"{role} is the best-fit stakeholder because {payload.service_offering.lower()} most directly maps to that owner's priorities. "
            f"The decision is reinforced by {signals} and the stated mission objective."
        )

    def _infer_role(self, payload: ContactIdentificationRequest) -> str:
        text = " ".join(
            [
                payload.service_offering,
                payload.target_industry or "",
                payload.target_market or "",
                payload.mission_objective or "",
                payload.company_research or "",
                " ".join(payload.signals),
            ]
        ).lower()

        role_map: list[tuple[str, tuple[str, ...]]] = [
            ("VP of Sales", ("sales", "outbound", "pipeline", "revenue", "lead generation", "prospecting")),
            ("Head of Revenue Operations", ("revops", "revenue operations", "operations", "workflow", "automation", "process")),
            ("VP of Marketing", ("marketing", "demand gen", "demand generation", "content", "brand", "campaign")),
            ("VP of Customer Success", ("customer success", "retention", "renewal", "churn", "support")),
            ("CFO", ("finance", "budget", "spend", "cfo", "forecast", "procurement")),
            ("CTO", ("engineering", "technical", "it", "data", "platform", "security")),
            ("COO", ("operations", "delivery", "process", "efficiency", "scale")),
            ("CEO", ("founder", "ceo", "leadership", "strategy", "executive")),
        ]

        for role, keywords in role_map:
            if any(keyword in text for keyword in keywords):
                return role

        return "CEO"

    @staticmethod
    def _score_candidate(role: str, payload: ContactIdentificationRequest) -> int:
        text = " ".join(
            [
                role,
                payload.service_offering,
                payload.target_industry or "",
                payload.target_market or "",
                payload.mission_objective or "",
                payload.company_research or "",
                " ".join(payload.signals),
            ]
        ).lower()

        score = 0
        seniority_terms = {
            "ceo": 18,
            "founder": 16,
            "cfo": 15,
            "coo": 15,
            "cto": 14,
            "vp": 12,
            "head": 10,
            "director": 8,
            "manager": 4,
        }
        for term, bonus in seniority_terms.items():
            if term in role.lower():
                score += bonus
                break

        role_keywords = {
            "sales": 10,
            "revenue": 10,
            "revops": 12,
            "operations": 8,
            "marketing": 8,
            "customer success": 8,
            "finance": 8,
            "engineering": 6,
            "it": 6,
            "automation": 6,
            "pipeline": 8,
            "prospecting": 8,
            "procurement": 6,
        }
        for keyword, bonus in role_keywords.items():
            if keyword in text:
                score += bonus

        return score

    @staticmethod
    def _linkedin_placeholder(name: str) -> str:
        slug = "-".join(part for part in name.lower().replace("/", " ").replace("&", " ").split() if part)
        return f"https://www.linkedin.com/in/{slug or 'first-last'}"