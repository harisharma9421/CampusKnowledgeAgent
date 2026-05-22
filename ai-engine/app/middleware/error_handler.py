"""
Global Exception Handler Middleware
Catches unhandled exceptions and returns standardized error responses.
"""

from fastapi import Request
from fastapi.responses import JSONResponse
from loguru import logger
from datetime import datetime, timezone


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handles all unhandled exceptions."""
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: {exc}",
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "An unexpected error occurred in the AI engine",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )


async def validation_exception_handler(request: Request, exc) -> JSONResponse:
    """Handles Pydantic validation errors."""
    logger.warning(f"Validation error on {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": "Request validation failed",
            "code": "VALIDATION_ERROR",
            "details": exc.errors() if hasattr(exc, "errors") else str(exc),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
