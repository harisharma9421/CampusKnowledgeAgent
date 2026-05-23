"""Sentence Transformer + FAISS semantic retrieval engine."""

from __future__ import annotations

import hashlib
import json
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np
from loguru import logger

from app.config.settings import AI_ENGINE_ROOT, settings

os.environ.setdefault("USE_TF", "0")
os.environ.setdefault("TRANSFORMERS_NO_TF", "1")
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")


@dataclass
class SemanticDocument:
    """Document accepted by the vector index."""

    id: str
    collection: str
    text: str
    title: str | None = None
    metadata: dict[str, Any] | None = None
    record: dict[str, Any] | None = None

    def to_metadata(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "collection": self.collection,
            "text": self.text,
            "title": self.title,
            "metadata": self.metadata or {},
            "record": self.record or {},
        }


class SemanticSearchEngine:
    """Lazy-loaded embedding model and persistent FAISS indexes.

    The backend owns Firestore access and sends authorized documents into this
    service. This class embeds those documents, stores a namespace-specific
    FAISS index on disk, and returns cosine-similarity matches.
    """

    def __init__(self) -> None:
        self.model = None
        self.embedding_dimension: int | None = None
        self.model_status = "not_loaded"
        self.model_error: str | None = None
        self._model_lock = Lock()
        self._index_lock = Lock()
        self._indexes: dict[str, dict[str, Any]] = {}

    @property
    def index_path(self) -> Path:
        configured = Path(settings.faiss_index_path)
        return configured if configured.is_absolute() else AI_ENGINE_ROOT / configured

    @property
    def index_dir(self) -> Path:
        return self.index_path.parent

    def load_model(self) -> None:
        if self.model_status == "loaded":
            return

        with self._model_lock:
            if self.model_status == "loaded":
                return

            started_at = time.perf_counter()
            try:
                from sentence_transformers import SentenceTransformer

                self.model = SentenceTransformer(settings.sentence_transformer_model)
                get_dimension = getattr(self.model, "get_embedding_dimension", None)
                if get_dimension is None:
                    get_dimension = getattr(self.model, "get_sentence_embedding_dimension")
                dimension = get_dimension()
                self.embedding_dimension = int(dimension or 0)
                self.model_status = "loaded"
                self.model_error = None
                logger.info(
                    "[Semantic] Loaded {} in {}ms",
                    settings.sentence_transformer_model,
                    int((time.perf_counter() - started_at) * 1000),
                )
            except Exception as exc:
                self.model = None
                self.embedding_dimension = None
                self.model_status = "unavailable"
                self.model_error = str(exc)
                logger.exception("[Semantic] Sentence Transformer unavailable: {}", exc)
                raise

    def _safe_namespace(self, namespace: str) -> str:
        compact = re.sub(r"[^a-zA-Z0-9_.-]+", "-", namespace.strip())[:80]
        digest = hashlib.sha1(namespace.encode("utf-8")).hexdigest()[:10]
        return f"{compact or 'default'}-{digest}"

    def _paths_for_namespace(self, namespace: str) -> tuple[Path, Path]:
        safe = self._safe_namespace(namespace)
        suffix = self.index_path.suffix or ".index"
        index_file = self.index_dir / f"{safe}{suffix}"
        metadata_file = self.index_dir / f"{safe}.metadata.json"
        return index_file, metadata_file

    def _fingerprint(self, documents: list[SemanticDocument]) -> str:
        payload = [
            {
                "id": document.id,
                "collection": document.collection,
                "text": document.text,
            }
            for document in documents
        ]
        encoded = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(encoded.encode("utf-8")).hexdigest()

    def normalize_documents(self, raw_documents: list[dict[str, Any]]) -> list[SemanticDocument]:
        documents: list[SemanticDocument] = []
        for index, raw in enumerate(raw_documents):
            text = (
                raw.get("text")
                or raw.get("searchText")
                or raw.get("search_text")
                or raw.get("content")
                or raw.get("description")
                or raw.get("answer")
                or ""
            )
            text = str(text).strip()
            if not text:
                continue

            collection = str(raw.get("collection") or raw.get("source") or "academic").strip()
            doc_id = str(raw.get("id") or raw.get("document_id") or f"{collection}:{index}").strip()
            documents.append(
                SemanticDocument(
                    id=doc_id,
                    collection=collection,
                    text=text,
                    title=raw.get("title"),
                    metadata=raw.get("metadata") or {},
                    record=raw.get("record") or {},
                )
            )
        return documents

    def embed_texts(self, texts: list[str]) -> np.ndarray:
        cleaned = [str(text).strip() for text in texts if str(text).strip()]
        if not cleaned:
            raise ValueError("At least one non-empty text is required for embedding.")

        self.load_model()
        embeddings = self.model.encode(
            cleaned,
            batch_size=settings.embedding_batch_size,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False,
        )
        return np.asarray(embeddings, dtype="float32")

    def _build_index(self, documents: list[SemanticDocument]):
        import faiss

        embeddings = self.embed_texts([document.text for document in documents])
        index = faiss.IndexFlatIP(embeddings.shape[1])
        index.add(embeddings)
        return index, embeddings.shape[1]

    def _load_persisted(self, namespace: str, fingerprint: str) -> dict[str, Any] | None:
        import faiss

        index_file, metadata_file = self._paths_for_namespace(namespace)
        if not index_file.exists() or not metadata_file.exists():
            return None

        try:
            metadata = json.loads(metadata_file.read_text(encoding="utf-8"))
            if metadata.get("fingerprint") != fingerprint:
                return None

            index = faiss.read_index(str(index_file))
            payload = {
                "index": index,
                "documents": metadata.get("documents", []),
                "fingerprint": fingerprint,
                "dimension": metadata.get("dimension") or index.d,
                "index_file": str(index_file),
                "metadata_file": str(metadata_file),
            }
            self._indexes[namespace] = payload
            return payload
        except Exception as exc:
            logger.warning("[Semantic] Could not load persisted FAISS index {}: {}", index_file, exc)
            return None

    def ensure_index(self, namespace: str, raw_documents: list[dict[str, Any]]) -> dict[str, Any]:
        import faiss

        documents = self.normalize_documents(raw_documents)
        if not documents:
            raise ValueError("At least one semantic document is required to build a FAISS index.")

        fingerprint = self._fingerprint(documents)
        cached = self._indexes.get(namespace)
        if cached and cached.get("fingerprint") == fingerprint:
            return cached

        with self._index_lock:
            cached = self._indexes.get(namespace)
            if cached and cached.get("fingerprint") == fingerprint:
                return cached

            persisted = self._load_persisted(namespace, fingerprint)
            if persisted:
                return persisted

            self.index_dir.mkdir(parents=True, exist_ok=True)
            index, dimension = self._build_index(documents)
            index_file, metadata_file = self._paths_for_namespace(namespace)
            faiss.write_index(index, str(index_file))

            metadata = {
                "namespace": namespace,
                "fingerprint": fingerprint,
                "model": settings.sentence_transformer_model,
                "dimension": dimension,
                "document_count": len(documents),
                "documents": [document.to_metadata() for document in documents],
            }
            metadata_file.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")

            payload = {
                "index": index,
                "documents": metadata["documents"],
                "fingerprint": fingerprint,
                "dimension": dimension,
                "index_file": str(index_file),
                "metadata_file": str(metadata_file),
            }
            self._indexes[namespace] = payload
            return payload

    def search(
        self,
        query: str,
        documents: list[dict[str, Any]],
        namespace: str = "default",
        top_k: int = 5,
        collection: str | None = None,
        threshold: float | None = None,
    ) -> dict[str, Any]:
        started_at = time.perf_counter()
        normalized_query = str(query).strip()
        if not normalized_query:
            raise ValueError("Search query cannot be empty.")

        payload = self.ensure_index(namespace, documents)
        query_embedding = self.embed_texts([normalized_query])
        search_limit = min(max(top_k * 4, top_k), len(payload["documents"]))
        scores, indices = payload["index"].search(query_embedding, search_limit)
        min_score = settings.semantic_similarity_threshold if threshold is None else threshold

        results = []
        for raw_score, raw_index in zip(scores[0], indices[0]):
            if raw_index < 0:
                continue
            document = payload["documents"][int(raw_index)]
            if collection and document["collection"] != collection:
                continue

            score = float(raw_score)
            if score < min_score:
                continue

            results.append(
                {
                    "id": document["id"],
                    "collection": document["collection"],
                    "title": document.get("title"),
                    "text": document["text"],
                    "score": round(score, 4),
                    "similarity": round(score, 4),
                    "metadata": document.get("metadata") or {},
                    "record": document.get("record") or {},
                }
            )
            if len(results) >= top_k:
                break

        return {
            "query": normalized_query,
            "results": results,
            "top_k": top_k,
            "threshold": min_score,
            "accepted": bool(results),
            "model": settings.sentence_transformer_model,
            "embedding_dimension": payload["dimension"],
            "document_count": len(payload["documents"]),
            "index_path": payload["index_file"],
            "metadata_path": payload["metadata_file"],
            "processing_time_ms": int((time.perf_counter() - started_at) * 1000),
        }

    def health(self) -> dict[str, Any]:
        index_files = []
        if self.index_dir.exists():
            index_files = sorted(path.name for path in self.index_dir.glob("*.index"))

        return {
            "status": "ready" if self.model_status in {"loaded", "not_loaded"} else "degraded",
            "model": settings.sentence_transformer_model,
            "model_status": self.model_status,
            "model_error": self.model_error,
            "embedding_dimension": self.embedding_dimension,
            "faiss_index_dir": str(self.index_dir),
            "persisted_indexes": index_files,
            "cached_namespaces": list(self._indexes.keys()),
            "similarity_threshold": settings.semantic_similarity_threshold,
        }


semantic_engine = SemanticSearchEngine()
