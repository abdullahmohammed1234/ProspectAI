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
