"""Gemini response enhancement endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.gemini.gemini_client import gemini_enhancer
from app.gemini.prompt_builder import build_grounded_enhancement_prompt
from app.utils.response import success_response

router = APIRouter(prefix="/gemini", tags=["Gemini"])


class GeminiEnhanceRequest(BaseModel):
    """Gemini enhancement request from the backend orchestrator."""

    query: str = Field(..., min_length=1, max_length=1000)
    intent: str = Field(..., min_length=1, max_length=120)
    draft_response: str = Field(..., min_length=1, max_length=5000)
    context: dict[str, Any] | None = None
    instruction: str | None = Field(None, max_length=1000)


@router.post("/enhance", summary="Enhance a grounded backend response")
async def enhance_response(request: GeminiEnhanceRequest):
    """Improve response fluency without adding unsupported academic facts."""
    result = gemini_enhancer.enhance(
        query=request.query,
        intent=request.intent,
        draft_response=request.draft_response,
        context=request.context,
        instruction=request.instruction,
    )
    return success_response(data=result.to_dict(), message="Gemini enhancement completed")


@router.post("/prompt", summary="Build Gemini prompt without calling Vertex AI")
async def build_prompt(request: GeminiEnhanceRequest):
    """Expose the structured prompt for diagnostics."""
    prompt = build_grounded_enhancement_prompt(
        query=request.query,
        intent=request.intent,
        draft_response=request.draft_response,
        context=request.context,
        instruction=request.instruction,
    )
    return success_response(data={"prompt": prompt}, message="Gemini prompt generated")


@router.get("/health", summary="Gemini health")
async def gemini_health():
    """Return Vertex AI / Gemini configuration status."""
    return success_response(data=gemini_enhancer.health(), message="Gemini health checked")

