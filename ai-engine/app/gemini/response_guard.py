"""Guardrails for Gemini output."""

from __future__ import annotations

import re
from typing import Any


PROTECTED_PATTERNS = [
    r"\b\d{1,2}:\d{2}\s?(?:am|pm|AM|PM)?\b",
    r"\b\d{1,2}\s?(?:am|pm|AM|PM)\b",
    r"\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b",
    r"\b\d{4}-\d{2}-\d{2}\b",
    r"\b[A-Z]{1,5}-?\d{2,4}\b",
    r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b",
]


def flatten_text(value: Any) -> str:
    """Collect string values from nested prompt context."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, (int, float, bool)):
        return str(value)
    if isinstance(value, list):
        return " ".join(flatten_text(item) for item in value)
    if isinstance(value, dict):
        return " ".join(flatten_text(item) for item in value.values())
    return str(value)


def protected_tokens(text: str) -> set[str]:
    tokens: set[str] = set()
    for pattern in PROTECTED_PATTERNS:
        tokens.update(match.group(0).strip().lower() for match in re.finditer(pattern, text))
    return tokens


def validate_enhanced_response(
    *,
    draft_response: str,
    context: dict[str, Any] | None,
    enhanced_response: str,
) -> tuple[bool, str | None]:
    """Reject outputs that introduce guarded facts absent from verified inputs."""
    if not enhanced_response.strip():
        return False, "Gemini returned an empty response."

    source_text = f"{draft_response} {flatten_text(context)}"
    allowed = protected_tokens(source_text)
    produced = protected_tokens(enhanced_response)
    unsupported = sorted(token for token in produced if token not in allowed)

    if unsupported:
        return False, f"Gemini introduced unsupported factual tokens: {', '.join(unsupported)}"

    if len(enhanced_response) > max(700, len(draft_response) * 3):
        return False, "Gemini response exceeded grounded length limits."

    return True, None

