"""
Campus Knowledge Agent — AI Engine
FastAPI application entry point.

Architecture:
  Backend (Node.js) → AI Engine (FastAPI) → Models (DistilBERT, FAISS, Gemini)

This service is INTERNAL — it should only be called by the backend API layer,
never directly by the frontend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from loguru import logger

from app.config.settings import settings
from app.config.logging_config import configure_logging
from app.routers import health, inference, embeddings, gemini
from app.middleware.error_handler import (
    global_exception_handler,
    validation_exception_handler,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # ── Startup ──────────────────────────────────────────────────────────────
    configure_logging()
    logger.info("═══════════════════════════════════════════════════")
    logger.info("  Campus Knowledge Agent — AI Engine")
    logger.info("═══════════════════════════════════════════════════")
    logger.info(f"  Environment : {settings.environment}")
    logger.info(f"  Host        : {settings.host}:{settings.port}")
    logger.info(f"  Docs        : http://{settings.host}:{settings.port}/docs")
    logger.info("  Models      : DistilBERT intent engine enabled with offline fallback")
    logger.info("═══════════════════════════════════════════════════")

    # Models are lazy-loaded on first use to keep local startup responsive.
    # await load_sentence_transformer()
    # await load_faiss_index()

    yield

    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("[AI Engine] Shutting down gracefully...")
    # Future: Cleanup model resources here


# ── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Campus Knowledge Agent — AI Engine",
    description=(
        "Internal AI inference service for the Campus Knowledge Agent system. "
        "Provides intent classification (DistilBERT), semantic search (FAISS), "
        "and reasoning (Gemini) capabilities."
    ),
    version="1.0.0",
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Only allow the backend service to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_api_url, "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# ── Exception Handlers ────────────────────────────────────────────────────────
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(inference.router)
app.include_router(embeddings.router)
app.include_router(gemini.router)


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    """AI Engine root endpoint."""
    return {
        "service": "Campus Knowledge Agent — AI Engine",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "health": "GET /health",
            "inference": "POST /infer/query",
            "classify": "POST /infer/classify",
            "embed": "POST /embed/generate",
            "index": "POST /embed/index",
            "search": "POST /embed/search",
            "faiss_health": "GET /embed/faiss-health",
            "gemini": "POST /gemini/enhance",
            "gemini_health": "GET /gemini/health",
        },
    }
