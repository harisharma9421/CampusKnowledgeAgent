"""
Health Check Router
Provides system health status for the AI engine service.
"""

import time
import psutil
from fastapi import APIRouter
from app.utils.response import success_response
from app.config.settings import settings
from app.nlp.intent_classifier import get_intent_classifier
from app.search.semantic_engine import semantic_engine

router = APIRouter()

# Track startup time
_start_time = time.time()


@router.get("/health", tags=["Health"])
async def health_check():
    """
    Returns the health status of the AI engine service.
    Includes uptime, memory usage, and model readiness.
    """
    uptime_seconds = int(time.time() - _start_time)

    try:
        memory = psutil.virtual_memory()
        memory_info = {
            "total_mb": round(memory.total / 1024 / 1024),
            "used_mb": round(memory.used / 1024 / 1024),
            "percent": memory.percent,
        }
    except Exception:
        memory_info = {"error": "psutil not available"}

    intent_health = get_intent_classifier().health()
    semantic_health = semantic_engine.health()

    return success_response(
        data={
            "service": "ai-engine",
            "environment": settings.environment,
            "uptime": f"{uptime_seconds}s",
            "memory": memory_info,
            "models": {
                "distilbert": intent_health,
                "sentence_transformer": {
                    "status": semantic_health["model_status"],
                    "model": semantic_health["model"],
                    "embedding_dimension": semantic_health["embedding_dimension"],
                    "error": semantic_health["model_error"],
                },
                "faiss_index": {
                    "status": semantic_health["status"],
                    "index_dir": semantic_health["faiss_index_dir"],
                    "persisted_indexes": semantic_health["persisted_indexes"],
                },
                "gemini": "not_configured",   # Will be 'ready' in Phase 8
            },
        },
        message="AI Engine is running",
    )
