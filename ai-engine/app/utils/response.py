"""
Response Utilities
Standardized response builders for FastAPI endpoints.
Mirrors the backend response contract for consistency.
"""

from datetime import datetime, timezone
from typing import Any, Optional
from pydantic import BaseModel


class APIResponse(BaseModel):
    """Standard API response envelope."""
    status: str
    message: str
    data: Optional[Any] = None
    timestamp: str


def success_response(
    data: Any = None,
    message: str = "Request successful",
) -> dict:
    """Build a standardized success response."""
    return {
        "status": "success",
        "message": message,
        "data": data,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def error_response(
    message: str = "An error occurred",
    code: Optional[str] = None,
    details: Optional[Any] = None,
) -> dict:
    """Build a standardized error response."""
    payload = {
        "status": "error",
        "message": message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if code:
        payload["code"] = code
    if details:
        payload["details"] = details
    return payload
