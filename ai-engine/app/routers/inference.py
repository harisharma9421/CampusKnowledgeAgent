"""Inference router for intent classification and query analysis."""

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.nlp.intent_classifier import predict_intent
from app.utils.response import success_response

router = APIRouter(prefix="/infer", tags=["Inference"])


class QueryRequest(BaseModel):
    """Incoming query payload."""

    query: str = Field(..., min_length=1, max_length=1000, description="User's natural language query")
    user_id: Optional[str] = Field(None, description="Optional user ID for personalization")
    context: Optional[dict] = Field(None, description="Optional conversation context")


@router.post("/query", summary="Process a natural language query")
async def process_query(request: QueryRequest):
    """Analyze a query and return intent metadata for backend orchestration."""
    try:
        prediction = predict_intent(request.query).to_dict()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return success_response(
        data={
            **prediction,
            "response": None,
            "sources": [],
            "pipeline_status": "intent_classified",
        },
        message="Query intent classified",
    )


@router.post("/classify", summary="Classify intent of a query")
async def classify_intent(request: QueryRequest):
    """Classify query intent using fine-tuned DistilBERT when available."""
    try:
        prediction = predict_intent(request.query).to_dict()
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return success_response(
        data=prediction,
        message="Intent classified successfully",
    )

