"""Vertex AI Gemini client for language-only response enhancement."""

from __future__ import annotations

import json
import time
from dataclasses import dataclass
from threading import Lock
from typing import Any

from loguru import logger

from app.config.settings import settings
from app.gemini.prompt_builder import build_grounded_enhancement_prompt
from app.gemini.response_guard import validate_enhanced_response


@dataclass
class GeminiResult:
    """Structured Gemini enhancement result."""

    response: str
    status: str
    provider: str
    model: str
    processing_time_ms: int
    prompt: str
    fallback_reason: str | None = None
    validation_error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        payload = {
            "response": self.response,
            "enhanced_response": self.response,
            "status": self.status,
            "provider": self.provider,
            "model": self.model,
            "processing_time_ms": self.processing_time_ms,
            "prompt": self.prompt,
        }
        if self.fallback_reason:
            payload["fallback_reason"] = self.fallback_reason
        if self.validation_error:
            payload["validation_error"] = self.validation_error
        return payload


class GeminiEnhancer:
    """Grounded Gemini wrapper using Vertex AI through Google Gen AI SDK."""

    def __init__(self) -> None:
        self.client = None
        self.client_status = "not_loaded"
        self.client_error: str | None = None
        self._lock = Lock()

    def _load_client(self):
        if self.client_status == "ready":
            return self.client

        with self._lock:
            if self.client_status == "ready":
                return self.client

            if not settings.google_cloud_project:
                self.client_status = "not_configured"
                self.client_error = "GOOGLE_CLOUD_PROJECT is not configured."
                return None

            try:
                from google import genai

                self.client = genai.Client(
                    vertexai=True,
                    project=settings.google_cloud_project,
                    location=settings.google_cloud_location,
                )
                self.client_status = "ready"
                self.client_error = None
                return self.client
            except Exception as exc:
                self.client = None
                self.client_status = "unavailable"
                self.client_error = str(exc)
                logger.warning("[Gemini] Vertex AI client unavailable: {}", exc)
                return None

    def _extract_text(self, response: Any) -> str:
        text = getattr(response, "text", None)
        if text:
            return str(text).strip()
        candidates = getattr(response, "candidates", None) or []
        parts = []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            for part in getattr(content, "parts", []) or []:
                value = getattr(part, "text", None)
                if value:
                    parts.append(str(value))
        return "\n".join(parts).strip()

    def _parse_response_text(self, text: str) -> str:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()
        try:
            payload = json.loads(cleaned)
            response = payload.get("response") or payload.get("enhanced_response")
            if response:
                return str(response).strip()
        except json.JSONDecodeError:
            pass
        return cleaned

    def enhance(
        self,
        *,
        query: str,
        intent: str,
        draft_response: str,
        context: dict[str, Any] | None,
        instruction: str | None = None,
    ) -> GeminiResult:
        started_at = time.perf_counter()
        prompt = build_grounded_enhancement_prompt(
            query=query,
            intent=intent,
            draft_response=draft_response,
            context=context,
            instruction=instruction,
        )
        client = self._load_client()

        if client is None:
            return GeminiResult(
                response=draft_response,
                status="fallback",
                provider="backend_formatter",
                model=settings.gemini_model,
                processing_time_ms=int((time.perf_counter() - started_at) * 1000),
                prompt=prompt,
                fallback_reason=self.client_error or "Gemini client is not ready.",
            )

        try:
            from google.genai import types

            generation_config = types.GenerateContentConfig(
                temperature=settings.gemini_temperature,
                max_output_tokens=settings.gemini_max_output_tokens,
                response_mime_type="application/json",
            )
            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=generation_config,
            )
            enhanced = self._parse_response_text(self._extract_text(response))
            is_valid, validation_error = validate_enhanced_response(
                draft_response=draft_response,
                context=context,
                enhanced_response=enhanced,
            )
            if not is_valid:
                return GeminiResult(
                    response=draft_response,
                    status="rejected",
                    provider="backend_formatter",
                    model=settings.gemini_model,
                    processing_time_ms=int((time.perf_counter() - started_at) * 1000),
                    prompt=prompt,
                    validation_error=validation_error,
                )

            return GeminiResult(
                response=enhanced,
                status="ok",
                provider="vertex_ai_gemini",
                model=settings.gemini_model,
                processing_time_ms=int((time.perf_counter() - started_at) * 1000),
                prompt=prompt,
            )
        except Exception as exc:
            logger.warning("[Gemini] Enhancement failed: {}", exc)
            return GeminiResult(
                response=draft_response,
                status="fallback",
                provider="backend_formatter",
                model=settings.gemini_model,
                processing_time_ms=int((time.perf_counter() - started_at) * 1000),
                prompt=prompt,
                fallback_reason=str(exc),
            )

    def health(self) -> dict[str, Any]:
        configured = bool(settings.google_cloud_project)
        status = self.client_status
        if status == "not_loaded" and not configured:
            status = "not_configured"
        return {
            "status": status,
            "configured": configured,
            "project": settings.google_cloud_project,
            "location": settings.google_cloud_location,
            "model": settings.gemini_model,
            "provider": "vertex_ai_gemini",
            "error": self.client_error,
        }


gemini_enhancer = GeminiEnhancer()

