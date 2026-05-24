from __future__ import annotations

import asyncio
import json
import logging
import random
from collections.abc import AsyncIterator
from typing import Any, TypeVar

import httpx
from fastapi import Request

from app.ai.prompts import (
    COMPANY_RESEARCH_PROMPT,
    DECISION_MAKER_REASONING_PROMPT,
    HUNT_COMPANIES_PROMPT,
    LEAD_QUALIFICATION_PROMPT,
    OUTREACH_DRAFT_PROMPT,
    RESEARCH_AGENT_PROMPT,
    SYSTEM_PROMPT,
)
from app.core.config import Settings, get_settings
from app.models.ai import (
    CompanyHuntRequest,
    CompanyHuntResponse,
    CompanyResearchAgentRequest,
    CompanyResearchAgentResponse,
    CompanyResearchRequest,
    CompanyResearchResponse,
    DecisionMakerReasoningRequest,
    DecisionMakerReasoningResponse,
    LeadQualificationRequest,
    LeadQualificationResponse,
    OutreachDraftRequest,
    OutreachDraftResponse,
)
from app.utils.errors import AppError


logger = logging.getLogger("prospectai.ai")
TResponse = TypeVar("TResponse")


class GeminiAIService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()
        self.api_key = self.settings.gemini_api_key
        self.model = self.settings.gemini_model
        self.base_url = self.settings.gemini_base_url.rstrip("/")
        self.timeout = httpx.Timeout(self.settings.gemini_request_timeout_seconds)
        self.max_retries = max(0, self.settings.gemini_max_retries)
        self.temperature = self.settings.gemini_temperature
        self.max_output_tokens = self.settings.gemini_max_output_tokens

    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def hunt_companies(self, payload: CompanyHuntRequest) -> CompanyHuntResponse:
        prompt = HUNT_COMPANIES_PROMPT.format(
            service_offering=payload.service_offering,
            target_industry=payload.target_industry,
            geography=payload.geography,
            company_size=payload.company_size,
            max_results=payload.max_results,
        )
        return await self._generate_structured_json(prompt, CompanyHuntResponse)

    async def company_research(self, payload: CompanyResearchRequest) -> CompanyResearchResponse:
        prompt = COMPANY_RESEARCH_PROMPT.format(
            company_name=payload.company_name,
            company_domain=payload.company_domain or "unknown",
            target_market=payload.target_market or "unspecified",
            signals=", ".join(payload.signals) if payload.signals else "none provided",
            context=payload.context or "none provided",
        )
        return await self._generate_structured_json(prompt, CompanyResearchResponse)

    async def research_agent(self, payload: CompanyResearchAgentRequest) -> CompanyResearchAgentResponse:
        prompt = RESEARCH_AGENT_PROMPT.format(
            company_name=payload.company_name,
            company_domain=payload.company_domain or "unknown",
            industry=payload.industry or "unknown",
            geography=payload.geography or "unknown",
            company_size=payload.company_size or "unknown",
            business_model=payload.business_model or "unknown",
            target_market=payload.target_market or "unspecified",
            current_initiatives=", ".join(payload.current_initiatives) if payload.current_initiatives else "none provided",
            signals=", ".join(payload.signals) if payload.signals else "none provided",
            context=payload.context or "none provided",
        )
        return await self._generate_structured_json(prompt, CompanyResearchAgentResponse)

    async def lead_qualification(self, payload: LeadQualificationRequest) -> LeadQualificationResponse:
        prompt = LEAD_QUALIFICATION_PROMPT.format(
            lead_id=payload.lead_id,
            full_name=payload.full_name,
            job_title=payload.job_title,
            company_name=payload.company_name,
            company_domain=payload.company_domain or "unknown",
            location=payload.location or "unknown",
            score=payload.score,
            signals=", ".join(payload.signals) if payload.signals else "none provided",
            mission_objective=payload.mission_objective,
            target_market=payload.target_market or "unspecified",
        )
        return await self._generate_structured_json(prompt, LeadQualificationResponse)

    async def decision_maker_reasoning(
        self,
        payload: DecisionMakerReasoningRequest,
    ) -> DecisionMakerReasoningResponse:
        prompt = DECISION_MAKER_REASONING_PROMPT.format(
            lead_id=payload.lead_id,
            full_name=payload.full_name,
            job_title=payload.job_title,
            company_name=payload.company_name,
            signals=", ".join(payload.signals) if payload.signals else "none provided",
            mission_objective=payload.mission_objective,
        )
        return await self._generate_structured_json(prompt, DecisionMakerReasoningResponse)

    async def outreach_draft(self, payload: OutreachDraftRequest) -> OutreachDraftResponse:
        prompt = OUTREACH_DRAFT_PROMPT.format(
            mission_name=payload.mission_name,
            mission_objective=payload.mission_objective,
            outreach_style=payload.outreach_style,
            lead_id=payload.lead_id,
            full_name=payload.full_name,
            job_title=payload.job_title,
            company_name=payload.company_name,
            company_domain=payload.company_domain or "unknown",
            signals=", ".join(payload.signals) if payload.signals else "none provided",
            company_research=payload.company_research or "none provided",
            decision_maker_reasoning=payload.decision_maker_reasoning or "none provided",
        )
        return await self._generate_structured_json(prompt, OutreachDraftResponse)

    async def stream_outreach_draft(self, payload: OutreachDraftRequest) -> AsyncIterator[dict[str, Any]]:
        prompt = OUTREACH_DRAFT_PROMPT.format(
            mission_name=payload.mission_name,
            mission_objective=payload.mission_objective,
            outreach_style=payload.outreach_style,
            lead_id=payload.lead_id,
            full_name=payload.full_name,
            job_title=payload.job_title,
            company_name=payload.company_name,
            company_domain=payload.company_domain or "unknown",
            signals=", ".join(payload.signals) if payload.signals else "none provided",
            company_research=payload.company_research or "none provided",
            decision_maker_reasoning=payload.decision_maker_reasoning or "none provided",
        )

        streamed_text = []
        async for chunk in self._generate_stream(prompt):
            streamed_text.append(chunk)
            yield {"event": "chunk", "content": chunk}

        payload_data = self._parse_json_payload("".join(streamed_text))
        try:
            response = OutreachDraftResponse.model_validate(payload_data)
        except Exception as exc:
            raise AppError(
                message="Gemini streamed content did not match the expected schema",
                status_code=502,
                code="ai_stream_validation_failed",
                details={"error": str(exc), "payload": payload_data},
            ) from exc

        yield {"event": "result", "data": response.model_dump()}

    async def _generate_structured_json(self, prompt: str, response_model: type[TResponse]) -> TResponse:
        raw_text = await self._request_content(prompt)
        payload = self._parse_json_payload(raw_text)
        try:
            return response_model.model_validate(payload)
        except Exception as exc:
            raise AppError(
                message="Gemini returned structured content that did not match the expected schema",
                status_code=502,
                code="ai_response_validation_failed",
                details={"error": str(exc), "payload": payload},
            ) from exc

    async def _generate_stream(self, prompt: str) -> AsyncIterator[str]:
        if not self.is_configured():
            raise AppError(
                message="Gemini API key is not configured",
                status_code=503,
                code="gemini_api_key_missing",
            )

        url = self._build_stream_url()
        request_body = self._build_request_body(prompt)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream("POST", url, json=request_body) as response:
                await self._raise_for_status(response)
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    data = line.removeprefix("data:").strip()
                    if data == "[DONE]":
                        break
                    chunk = self._extract_stream_text(data)
                    if chunk:
                        yield chunk

    async def _request_content(self, prompt: str) -> str:
        last_error: Exception | None = None
        for attempt in range(self.max_retries + 1):
            try:
                return await self._request_content_once(prompt)
            except (httpx.HTTPError, AppError, ValueError) as exc:
                last_error = exc
                if attempt >= self.max_retries:
                    break
                await asyncio.sleep(self._retry_delay(attempt))

        raise AppError(
            message="Gemini request failed after retries",
            status_code=502,
            code="gemini_request_failed",
            details={"error": str(last_error) if last_error else "unknown error"},
        ) from last_error

    async def _request_content_once(self, prompt: str) -> str:
        if not self.is_configured():
            raise AppError(
                message="Gemini API key is not configured",
                status_code=503,
                code="gemini_api_key_missing",
            )

        url = self._build_generate_url()
        request_body = self._build_request_body(prompt)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, json=request_body)
            await self._raise_for_status(response)
            data = response.json()

        return self._extract_response_text(data)

    def _build_request_body(self, prompt: str) -> dict[str, Any]:
        return {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": self.temperature,
                "maxOutputTokens": self.max_output_tokens,
                "responseMimeType": "application/json",
            },
        }

    def _build_generate_url(self) -> str:
        return f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"

    def _build_stream_url(self) -> str:
        return f"{self.base_url}/models/{self.model}:streamGenerateContent?alt=sse&key={self.api_key}"

    async def _raise_for_status(self, response: httpx.Response) -> None:
        if response.status_code < 400:
            return

        retryable = response.status_code in {408, 429, 500, 502, 503, 504}
        details: dict[str, Any]
        try:
            details = response.json()
        except ValueError:
            details = {"body": response.text}

        raise AppError(
            message="Gemini request failed",
            status_code=502 if retryable else response.status_code,
            code="gemini_http_error",
            details={"status_code": response.status_code, "response": details},
        )

    def _extract_response_text(self, data: dict[str, Any]) -> str:
        candidates = data.get("candidates") or []
        if not candidates:
            raise ValueError("Gemini response did not contain candidates")

        content = candidates[0].get("content") or {}
        parts = content.get("parts") or []
        chunks = [part.get("text", "") for part in parts if isinstance(part, dict)]
        text = "".join(chunks).strip()
        if not text:
            raise ValueError("Gemini response did not contain text content")
        return text

    def _extract_stream_text(self, data: str) -> str:
        try:
            payload = json.loads(data)
        except json.JSONDecodeError:
            return ""

        candidates = payload.get("candidates") or []
        if not candidates:
            return ""

        content = candidates[0].get("content") or {}
        parts = content.get("parts") or []
        chunks = [part.get("text", "") for part in parts if isinstance(part, dict)]
        return "".join(chunks).strip()

    def _parse_json_payload(self, raw_text: str) -> dict[str, Any]:
        try:
            parsed = json.loads(raw_text)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass

        start = raw_text.find("{")
        end = raw_text.rfind("}")
        if start >= 0 and end > start:
            parsed = json.loads(raw_text[start : end + 1])
            if isinstance(parsed, dict):
                return parsed

        raise ValueError("Gemini response was not valid JSON")

    def _retry_delay(self, attempt: int) -> float:
        base_delay = 0.5 * (2**attempt)
        return base_delay + random.uniform(0, 0.25)


def get_ai_service(request: Request) -> GeminiAIService:
    service = getattr(request.app.state, "ai_service", None)
    if service is None:
        raise AppError(message="AI service is unavailable", status_code=503, code="ai_service_unavailable")
    return service
