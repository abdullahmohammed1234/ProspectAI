from __future__ import annotations

from dataclasses import dataclass

from app.models.ai import LeadQualificationRequest, LeadQualificationResponse
from app.services.ai_service import GeminiAIService


@dataclass(slots=True)
class QualificationFactors:
    fit_adjustment: int = 0
    confidence_adjustment: int = 0
    reasoning_points: list[str] | None = None
    risk_points: list[str] | None = None


class QualificationAgent:
    def __init__(self, ai_service: GeminiAIService | None = None) -> None:
        self.ai_service = ai_service

    async def qualify_lead(self, payload: LeadQualificationRequest) -> LeadQualificationResponse:
        if self.ai_service is not None and self.ai_service.is_configured():
            return await self.ai_service.lead_qualification(payload)

        return self._qualify_locally(payload)

    def _qualify_locally(self, payload: LeadQualificationRequest) -> LeadQualificationResponse:
        factors = self._derive_factors(payload)
        fit_score = self._clamp(round((payload.score * 0.7) + 20 + (factors.fit_adjustment * 0.55)))
        confidence_score = self._clamp(58 + factors.confidence_adjustment)
        reasoning = self._build_reasoning(payload, fit_score, factors)
        risks = self._build_risks(payload, fit_score, factors)

        return LeadQualificationResponse(
            lead_id=payload.lead_id,
            fit_score=fit_score,
            qualification_reasoning=reasoning,
            risk_assessment=risks,
            confidence_score=confidence_score,
        )

    def _derive_factors(self, payload: LeadQualificationRequest) -> QualificationFactors:
        title = payload.job_title.lower()
        objective = payload.mission_objective.lower()
        signals = [signal.lower() for signal in payload.signals]

        fit_adjustment = 0
        confidence_adjustment = 0
        reasoning_points: list[str] = []
        risk_points: list[str] = []

        seniority_keywords = {
            "chief": 12,
            "cmo": 12,
            "ceo": 12,
            "founder": 10,
            "vp": 10,
            "head": 8,
            "director": 7,
            "manager": 4,
            "lead": 4,
        }
        role_bonus = next((bonus for keyword, bonus in seniority_keywords.items() if keyword in title), 0)
        if role_bonus:
            fit_adjustment += role_bonus
            confidence_adjustment += 8 if role_bonus >= 10 else 5
            reasoning_points.append(f"The contact holds a {payload.job_title} role, which gives the account real buying influence.")
        else:
            fit_adjustment -= 4
            risk_points.append("The role title does not strongly suggest ownership of the buying decision.")

        strong_signal_keywords = {
            "hiring": 6,
            "expansion": 6,
            "raised": 7,
            "funding": 7,
            "crm": 5,
            "migration": 5,
            "migrating": 5,
            "pipeline": 5,
            "automation": 5,
            "ai": 5,
            "outbound": 4,
            "new market": 6,
            "launch": 5,
            "revenue": 4,
            "growth": 5,
            "revops": 5,
            "sales": 4,
            "replacement": 6,
            "process": 3,
        }
        signal_points = 0
        matched_signal_descriptions: list[str] = []
        for signal in signals:
            matched_bonus = 0
            for keyword, bonus in strong_signal_keywords.items():
                if keyword in signal:
                    matched_bonus = max(matched_bonus, bonus)
            if matched_bonus:
                signal_points += matched_bonus
                matched_signal_descriptions.append(signal)

        signal_adjustment = min(20, signal_points)
        fit_adjustment += signal_adjustment
        confidence_adjustment += min(18, 4 + len(matched_signal_descriptions) * 4)

        if matched_signal_descriptions:
            reasoning_points.append(
                f"Observed signals such as {self._format_signal_list(matched_signal_descriptions)} point to an active business change rather than a static account."
            )
        else:
            fit_adjustment -= 6
            risk_points.append("No strong timing or urgency signals were provided, so the score leans on the base lead score.")

        target_market_terms = [term for term in self._tokenize(payload.target_market or payload.mission_objective) if len(term) > 3]
        objective_overlap = sum(1 for term in target_market_terms if term in title or any(term in signal for signal in signals))
        if objective_overlap:
            market_adjustment = min(10, objective_overlap * 3)
            fit_adjustment += market_adjustment
            confidence_adjustment += min(10, objective_overlap * 2)
            reasoning_points.append(
                "The mission objective overlaps with the role context, which improves relevance for this account."
            )
        else:
            fit_adjustment -= 3
            risk_points.append("The mission objective and current account context do not show a strong keyword match.")

        if payload.score >= 85:
            confidence_adjustment += 8
        elif payload.score >= 70:
            confidence_adjustment += 4
        else:
            confidence_adjustment -= 4

        if fit_adjustment >= 18:
            reasoning_points.append("Overall fit is strong because the base score, role seniority, and business signals reinforce one another.")
        elif fit_adjustment >= 8:
            reasoning_points.append("Overall fit is promising, but the account still depends on timing and the strength of the current problem signal.")
        else:
            reasoning_points.append("Overall fit is selective rather than immediate, so the account should stay in a watchlist until better evidence appears.")

        if not risk_points:
            risk_points.append("Primary risk is that the signal set may be incomplete, so the score should be revisited after enrichment.")

        return QualificationFactors(
            fit_adjustment=fit_adjustment,
            confidence_adjustment=confidence_adjustment,
            reasoning_points=reasoning_points,
            risk_points=risk_points,
        )

    def _build_reasoning(self, payload: LeadQualificationRequest, fit_score: int, factors: QualificationFactors) -> str:
        role_phrase = f"{payload.job_title} at {payload.company_name}"
        leading_sentence = f"{role_phrase} is scored at {fit_score}/100 for the current mission because the base lead score, role seniority, and provided signals were evaluated together."
        detail_sentences = factors.reasoning_points or []
        if detail_sentences:
            return " ".join([leading_sentence, *detail_sentences])
        return leading_sentence

    def _build_risks(self, payload: LeadQualificationRequest, fit_score: int, factors: QualificationFactors) -> list[str]:
        risks = list(factors.risk_points or [])
        if fit_score < 70:
            risks.append("Fit is below the preferred threshold for immediate prioritization.")
        elif fit_score < 85:
            risks.append("Fit is workable, but it would benefit from more proof of urgency before heavy outreach.")
        if payload.location:
            risks.append(f"Geographic context is {payload.location}, so timing may depend on regional coverage and account ownership.")
        return self._dedupe(risks)

    @staticmethod
    def _dedupe(values: list[str]) -> list[str]:
        seen: set[str] = set()
        result: list[str] = []
        for value in values:
            if value in seen:
                continue
            seen.add(value)
            result.append(value)
        return result

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        return [token.strip().lower() for token in text.replace("/", " ").replace("-", " ").split() if token.strip()]

    @staticmethod
    def _format_signal_list(signals: list[str]) -> str:
        if len(signals) == 1:
            return signals[0]
        if len(signals) == 2:
            return f"{signals[0]} and {signals[1]}"
        return f"{', '.join(signals[:2])}, and {signals[2]}"

    @staticmethod
    def _clamp(value: int) -> int:
        return max(0, min(100, value))