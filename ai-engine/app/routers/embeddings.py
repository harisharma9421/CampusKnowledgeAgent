"""Embedding generation and FAISS semantic search endpoints."""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.search.semantic_engine import semantic_engine
from app.utils.response import success_response

router = APIRouter(prefix="/embed", tags=["Embeddings"])


class EmbedRequest(BaseModel):
    """Text embedding request."""

    texts: list[str] = Field(..., min_length=1, max_length=100)


class SemanticDocumentRequest(BaseModel):
    """Academic document supplied by the backend orchestration layer."""

    model_config = ConfigDict(extra="allow")

    id: str | None = None
    collection: str | None = None
    text: str | None = None
    searchText: str | None = None
    search_text: str | None = None
    title: str | None = None
    metadata: dict[str, Any] | None = None
    record: dict[str, Any] | None = None


class IndexRequest(BaseModel):
    """FAISS index build request."""

    namespace: str = Field("default", min_length=1, max_length=140)
    documents: list[SemanticDocumentRequest] = Field(..., min_length=1)


class SearchRequest(BaseModel):
    """Semantic search request."""

    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(5, ge=1, le=20)
    collection: str | None = Field(None, description="Target collection to search")
    namespace: str = Field("default", min_length=1, max_length=140)
    threshold: float | None = Field(None, ge=0.0, le=1.0)
    documents: list[SemanticDocumentRequest] = Field(default_factory=list)


def _dump_documents(documents: list[SemanticDocumentRequest]) -> list[dict[str, Any]]:
    return [document.model_dump(exclude_none=True) for document in documents]


@router.post("/generate", summary="Generate text embeddings")
async def generate_embeddings(request: EmbedRequest):
    """Generate normalized Sentence Transformer embeddings for input text."""
    started_at = time.perf_counter()
    try:
        embeddings = semantic_engine.embed_texts(request.texts)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Embedding model unavailable: {exc}") from exc

    return success_response(
        data={
            "texts_count": len(request.texts),
            "embeddings": embeddings.tolist(),
            "model": semantic_engine.health()["model"],
            "dimensions": int(embeddings.shape[1]),
            "processing_time_ms": int((time.perf_counter() - started_at) * 1000),
        },
        message="Embeddings generated successfully",
    )


@router.post("/index", summary="Build or refresh a FAISS index")
async def index_documents(request: IndexRequest):
    """Create a persistent FAISS index for backend-supplied academic documents."""
    try:
        payload = semantic_engine.ensure_index(request.namespace, _dump_documents(request.documents))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"FAISS index unavailable: {exc}") from exc

    return success_response(
        data={
            "namespace": request.namespace,
            "document_count": len(payload["documents"]),
            "embedding_dimension": payload["dimension"],
            "index_path": payload["index_file"],
            "metadata_path": payload["metadata_file"],
            "model": semantic_engine.health()["model"],
        },
        message="FAISS index is ready",
    )


@router.post("/search", summary="Semantic similarity search")
async def semantic_search(request: SearchRequest):
    """Run nearest-neighbour search over backend-provided academic documents."""
    if not request.documents:
        raise HTTPException(
            status_code=400,
            detail="Backend must provide Firestore-derived documents for semantic search.",
        )

    try:
        result = semantic_engine.search(
            query=request.query,
            documents=_dump_documents(request.documents),
            namespace=request.namespace,
            top_k=request.top_k,
            collection=request.collection,
            threshold=request.threshold,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Semantic search unavailable: {exc}") from exc

    return success_response(data=result, message="Semantic search completed")


@router.get("/faiss-health", summary="FAISS health")
async def faiss_health():
    """Return embedding model and FAISS persistence diagnostics."""
    return success_response(data=semantic_engine.health(), message="FAISS health checked")

