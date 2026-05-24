from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CompanyHuntRequest(BaseModel):
    service_offering: str = Field(min_length=1, max_length=500)
    target_industry: str = Field(min_length=1, max_length=180)
    geography: str = Field(min_length=1, max_length=180)
    company_size: str = Field(min_length=1, max_length=180)
    max_results: int = Field(default=3, ge=1, le=5)

    model_config = ConfigDict(extra="ignore")


class CompanyHuntResult(BaseModel):
    company_name: str
    website: str
    industry: str
    summary: str
    potential_signals: list[str] = Field(default_factory=list)
    rationale: list[str] = Field(default_factory=list)
    fit_score: int = Field(ge=0, le=100)

    model_config = ConfigDict(extra="ignore")

    @field_validator("rationale", mode="before")
    @classmethod
    def _normalize_rationale(cls, value: object) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return [value]
        return list(value)

    @field_validator("fit_score", mode="before")
    @classmethod
    def _normalize_fit_score(cls, value: object) -> int:
        if value is None:
            return 0
        if isinstance(value, bool):
            return int(value)
        if isinstance(value, (int, float)):
            score = value * 100 if 0 <= value <= 1 else value
            return int(round(score))
        return int(value)


class CompanyHuntResponse(BaseModel):
    service_offering: str
    target_industry: str
    geography: str
    company_size: str
    search_summary: str
    companies: list[CompanyHuntResult] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class CompanyResearchRequest(BaseModel):
    company_name: str = Field(min_length=1, max_length=180)
    company_domain: str | None = Field(default=None, max_length=180)
    target_market: str | None = Field(default=None, max_length=180)
    signals: list[str] = Field(default_factory=list)
    context: str | None = Field(default=None, max_length=2000)

    model_config = ConfigDict(extra="ignore")


class CompanyResearchResponse(BaseModel):
    company_name: str
    company_domain: str | None = None
    summary: str
    key_signals: list[str] = Field(default_factory=list)
    buyer_pain_points: list[str] = Field(default_factory=list)
    suggested_angles: list[str] = Field(default_factory=list)
    confidence: int = Field(ge=0, le=100)

    model_config = ConfigDict(extra="ignore")

    @field_validator("confidence", mode="before")
    @classmethod
    def _normalize_confidence(cls, value: object) -> int:
        if value is None:
            return 0
        # If already an int/float/bool
        if isinstance(value, bool):
            return int(value) * 100
        if isinstance(value, (int, float)):
            # If float between 0 and 1, scale to 0-100
            if isinstance(value, float) and 0 <= value <= 1:
                return int(round(value * 100))
            return int(round(value))
        # If string, try to parse numeric or map common labels
        if isinstance(value, str):
            s = value.strip()
            # handle percentages like '85%'
            if s.endswith("%"):
                try:
                    return int(round(float(s.rstrip("%"))))
                except Exception:
                    pass
            # numeric string
            try:
                return int(round(float(s)))
            except Exception:
                pass
            # common label mapping
            label_map = {
                "very high": 90,
                "high": 80,
                "moderate": 60,
                "medium": 50,
                "low": 20,
                "very low": 10,
                "unknown": 0,
            }
            lowered = s.lower()
            for k, v in label_map.items():
                if lowered == k:
                    return v
        # fallback
        return 0


class CompanyResearchAgentRequest(BaseModel):
    company_name: str = Field(min_length=1, max_length=180)
    company_domain: str | None = Field(default=None, max_length=180)
    industry: str | None = Field(default=None, max_length=180)
    geography: str | None = Field(default=None, max_length=180)
    company_size: str | None = Field(default=None, max_length=180)
    business_model: str | None = Field(default=None, max_length=200)
    target_market: str | None = Field(default=None, max_length=300)
    current_initiatives: list[str] = Field(default_factory=list)
    signals: list[str] = Field(default_factory=list)
    context: str | None = Field(default=None, max_length=3000)

    model_config = ConfigDict(extra="ignore")


class CompanyResearchAgentResponse(BaseModel):
    research_summary: str
    fit_indicators: list[str] = Field(default_factory=list)
    pain_points: list[str] = Field(default_factory=list)
    ai_adoption_signals: list[str] = Field(default_factory=list)
    business_context: list[str] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class ContactCandidate(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    role: str = Field(min_length=1, max_length=180)
    linkedin_url: str | None = Field(default=None, max_length=300)

    model_config = ConfigDict(extra="ignore")


class ContactIdentificationRequest(BaseModel):
    company_name: str = Field(min_length=1, max_length=180)
    company_domain: str | None = Field(default=None, max_length=180)
    service_offering: str = Field(min_length=1, max_length=500)
    target_industry: str | None = Field(default=None, max_length=180)
    target_market: str | None = Field(default=None, max_length=300)
    mission_objective: str | None = Field(default=None, max_length=500)
    signals: list[str] = Field(default_factory=list)
    company_research: str | None = Field(default=None, max_length=4000)
    candidate_contacts: list[ContactCandidate] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class ContactIdentificationResponse(BaseModel):
    name: str
    role: str
    linkedin_url_placeholder: str
    contact_reasoning: str

    model_config = ConfigDict(extra="ignore")


class LeadQualificationRequest(BaseModel):
    lead_id: str = Field(min_length=1, max_length=80)
    full_name: str = Field(min_length=1, max_length=180)
    job_title: str = Field(min_length=1, max_length=180)
    company_name: str = Field(min_length=1, max_length=180)
    company_domain: str | None = Field(default=None, max_length=180)
    location: str | None = Field(default=None, max_length=180)
    score: int = Field(default=0, ge=0, le=100)
    signals: list[str] = Field(default_factory=list)
    mission_objective: str = Field(min_length=1, max_length=500)
    target_market: str | None = Field(default=None, max_length=180)

    model_config = ConfigDict(extra="ignore")


class LeadQualificationResponse(BaseModel):
    lead_id: str
    fit_score: int = Field(ge=0, le=100)
    qualification_reasoning: str
    risk_assessment: list[str] = Field(default_factory=list)
    confidence_score: int = Field(ge=0, le=100)

    model_config = ConfigDict(extra="ignore")

    @field_validator("fit_score", "confidence_score", mode="before")
    @classmethod
    def _normalize_percentage(cls, value: object) -> int:
        if value is None:
            return 0
        if isinstance(value, bool):
            return int(value) * 100
        if isinstance(value, (int, float)):
            if isinstance(value, float) and 0 <= value <= 1:
                return int(round(value * 100))
            return int(round(value))
        if isinstance(value, str):
            text = value.strip()
            if text.endswith("%"):
                try:
                    return int(round(float(text.rstrip("%"))))
                except Exception:
                    pass
            try:
                return int(round(float(text)))
            except Exception:
                pass
            label_map = {
                "very high": 90,
                "high": 80,
                "moderate": 60,
                "medium": 50,
                "low": 20,
                "very low": 10,
                "unknown": 0,
            }
            lowered = text.lower()
            for label, score in label_map.items():
                if lowered == label:
                    return score
        return 0

    @field_validator("risk_assessment", mode="before")
    @classmethod
    def _normalize_risk_assessment(cls, value: object) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return [value]
        return [str(item) for item in value]


class DecisionMakerReasoningRequest(BaseModel):
    lead_id: str = Field(min_length=1, max_length=80)
    full_name: str = Field(min_length=1, max_length=180)
    job_title: str = Field(min_length=1, max_length=180)
    company_name: str = Field(min_length=1, max_length=180)
    signals: list[str] = Field(default_factory=list)
    mission_objective: str = Field(min_length=1, max_length=500)

    model_config = ConfigDict(extra="ignore")


class DecisionMakerReasoningResponse(BaseModel):
    lead_id: str
    role_summary: str
    likely_priorities: list[str] = Field(default_factory=list)
    likely_objections: list[str] = Field(default_factory=list)
    buying_influence: str
    recommended_talking_points: list[str] = Field(default_factory=list)
    confidence: int = Field(ge=0, le=100)

    model_config = ConfigDict(extra="ignore")


class OutreachDraftRequest(BaseModel):
    mission_name: str = Field(min_length=1, max_length=120)
    mission_objective: str = Field(min_length=1, max_length=500)
    outreach_style: str = Field(default="consultative", min_length=1, max_length=50)
    lead_id: str = Field(min_length=1, max_length=80)
    full_name: str = Field(min_length=1, max_length=180)
    job_title: str = Field(min_length=1, max_length=180)
    company_name: str = Field(min_length=1, max_length=180)
    company_domain: str | None = Field(default=None, max_length=180)
    signals: list[str] = Field(default_factory=list)
    company_research: str | None = Field(default=None, max_length=4000)
    decision_maker_reasoning: str | None = Field(default=None, max_length=4000)

    model_config = ConfigDict(extra="ignore")


class OutreachDraftResponse(BaseModel):
    subject: str
    body: str
    tone: str = Field(default="consultative")
    personalization_points: list[str] = Field(default_factory=list)
    call_to_action: str

    model_config = ConfigDict(extra="ignore")
