from __future__ import annotations

from textwrap import dedent


SYSTEM_PROMPT = dedent(
    """
    You are ProspectAI's sales intelligence engine.
    Return only valid JSON that matches the requested schema.
    Do not wrap responses in markdown or add commentary outside the JSON payload.
    Keep conclusions concise, useful, and grounded in the provided context.
    """
).strip()


HUNT_COMPANIES_PROMPT = dedent(
    """
    Identify the best-fit companies for outbound prospecting.

    Service offering: {service_offering}
    Target industry: {target_industry}
    Geography: {geography}
    Company size: {company_size}
    Maximum results: {max_results}

    Prioritize quality over quantity.
    Select only companies that are strong matches for the criteria.
    Prefer fewer, higher-confidence recommendations over a long list.
    Use structured reasoning and keep each rationale concise and evidence-based.

    Return JSON with:
    - service_offering
    - target_industry
    - geography
    - company_size
    - search_summary
    - companies

    For each company in companies, return:
    - company_name
    - website
    - industry
    - summary
    - potential_signals
    - rationale
    - fit_score
    """
).strip()


COMPANY_RESEARCH_PROMPT = dedent(
    """
    Research the company for outbound prospecting.

    Company name: {company_name}
    Company domain: {company_domain}
    Target market context: {target_market}
    Signals: {signals}
    Additional context: {context}

    Return JSON with:
    - company_name
    - company_domain
    - summary
    - key_signals
    - buyer_pain_points
    - suggested_angles
    - confidence

    Note: `confidence` MUST be an integer between 0 and 100 (higher means more confident). If you describe confidence with words (e.g., "High"), convert it to an approximate integer (for example: High=80, Medium=50, Low=20).
    """
).strip()


LEAD_QUALIFICATION_PROMPT = dedent(
    """
    Qualify this lead for outbound prioritization.

    Lead name: {full_name}
    Job title: {job_title}
    Company: {company_name}
    Domain: {company_domain}
    Location: {location}
    Score signal: {score}
    Signals: {signals}
    Mission objective: {mission_objective}
    Target market context: {target_market}

    Return JSON with:
    - lead_id
    - qualification
    - score
    - rationale
    - strengths
    - risks
    - recommended_next_action
    """
).strip()


DECISION_MAKER_REASONING_PROMPT = dedent(
    """
    Reason about the decision maker's role and likely buying motivations.

    Lead name: {full_name}
    Job title: {job_title}
    Company: {company_name}
    Signals: {signals}
    Mission objective: {mission_objective}

    Return JSON with:
    - lead_id
    - role_summary
    - likely_priorities
    - likely_objections
    - buying_influence
    - recommended_talking_points
    - confidence
    """
).strip()


OUTREACH_DRAFT_PROMPT = dedent(
    """
    Draft a concise personalized outreach message.

    Mission name: {mission_name}
    Mission objective: {mission_objective}
    Outreach style: {outreach_style}
    Lead name: {full_name}
    Job title: {job_title}
    Company: {company_name}
    Domain: {company_domain}
    Signals: {signals}
    Decision maker reasoning: {decision_maker_reasoning}
    Company research: {company_research}

    Return JSON with:
    - subject
    - body
    - tone
    - personalization_points
    - call_to_action
    """
).strip()


RESEARCH_AGENT_PROMPT = dedent(
    """
    You are ProspectAI's Research Agent.
    Analyze the company deeply and produce practical, sales-usable insight.

    Company name: {company_name}
    Company domain: {company_domain}
    Industry: {industry}
    Geography: {geography}
    Company size: {company_size}
    Business model: {business_model}
    Target market: {target_market}
    Current initiatives: {current_initiatives}
    Signals: {signals}
    Additional context: {context}

    Responsibilities:
    - Analyze company information
    - Detect business signals
    - Infer operational pain points
    - Summarize growth indicators

    Guidance:
    - Make the reasoning feel intelligent and actionable.
    - Prioritize specific observations over generic statements.
    - Highlight implications for GTM, operations, and AI-readiness.
    - If information is uncertain, still provide best-effort hypotheses based on available signals.

    Return JSON with:
    - research_summary (string)
    - fit_indicators (array of concise strings)
    - pain_points (array of concise strings)
    - ai_adoption_signals (array of concise strings)
    - business_context (array of concise strings)
    """
).strip()
