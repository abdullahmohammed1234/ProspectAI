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
    qualification: str
    score: int = Field(ge=0, le=100)
    rationale: list[str] = Field(default_factory=list)
    strengths: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    recommended_next_action: str

    model_config = ConfigDict(extra="ignore")


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
