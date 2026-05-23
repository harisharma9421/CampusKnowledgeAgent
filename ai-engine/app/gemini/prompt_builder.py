"""Prompt construction for grounded Gemini response enhancement."""

from __future__ import annotations

import json
from typing import Any


def _compact_record(record: dict[str, Any]) -> dict[str, Any]:
    allowed_fields = [
        "id",
        "title",
        "content",
        "description",
        "question",
        "answer",
        "displayName",
        "designation",
        "department",
        "subjects",
        "office",
        "email",
        "subject",
        "facultyName",
        "room",
        "day",
        "startTime",
        "endTime",
        "venue",
        "eventDate",
        "category",
        "message",
        "type",
    ]
    return {field: record[field] for field in allowed_fields if field in record and record[field]}


def compact_context(context: dict[str, Any] | None, limit: int = 6) -> list[dict[str, Any]]:
    """Reduce backend context to factual snippets suitable for a prompt."""
    if not context:
        return []

    records = context.get("records") if isinstance(context, dict) else []
    if not isinstance(records, list):
        return []

    return [_compact_record(record) for record in records[:limit] if isinstance(record, dict)]


def build_grounded_enhancement_prompt(
    *,
    query: str,
    intent: str,
    draft_response: str,
    context: dict[str, Any] | None,
    instruction: str | None = None,
) -> str:
    """Build a prompt that limits Gemini to language enhancement only."""
    factual_context = compact_context(context)
    policy = instruction or (
        "Improve readability only. Do not add facts, dates, names, rooms, subjects, "
        "notices, events, faculty details, or timetable entries not present in the draft or context."
    )

    payload = {
        "task": "rewrite_academic_chatbot_response",
        "policy": policy,
        "query": query,
        "intent": intent,
        "draft_response": draft_response,
        "verified_context": factual_context,
        "output_contract": {
            "format": "JSON",
            "schema": {"response": "string"},
            "rules": [
                "Return only JSON.",
                "The response must preserve the exact factual meaning of draft_response.",
                "If the draft says no record was found, keep that meaning.",
                "Do not infer or invent academic information.",
                "Do not include unsupported dates, times, rooms, faculty names, notices, or events.",
            ],
        },
    }

    return json.dumps(payload, ensure_ascii=False, indent=2)

