"""Text preprocessing helpers for intent classification."""

import re


def normalize_query(query: str) -> str:
    """Normalize user text without removing domain-specific words."""
    text = (query or "").strip().lower()
    text = re.sub(r"\s+", " ", text)
    return text


def validate_query(query: str, max_length: int = 1000) -> str:
    """Validate and normalize an incoming query."""
    normalized = normalize_query(query)
    if not normalized:
        raise ValueError("Query cannot be empty.")
    if len(normalized) > max_length:
        raise ValueError(f"Query must not exceed {max_length} characters.")
    return normalized

