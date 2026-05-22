"""DistilBERT intent classifier with offline-safe fallback handling."""

from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path
from threading import Lock
from typing import Any

import numpy as np
from loguru import logger

from app.config.settings import AI_ENGINE_ROOT, settings
from app.nlp.intent_labels import ID_TO_LABEL, INTENT_LABELS, LABEL_TO_ID
from app.nlp.preprocessing import validate_query


KEYWORD_RULES = {
    "schedule_update": ["update", "changed", "cancelled", "rescheduled", "notification"],
    "timetable_query": [
        "timetable",
        "lecture",
        "class",
        "period",
        "today",
        "tomorrow",
    ],
    "notice_query": ["notice", "announcement", "circular", "deadline", "exam schedule"],
    "event_query": ["event", "workshop", "seminar", "meet", "symposium", "registration"],
    "faq_query": ["how", "where", "what", "when", "why", "help", "faq"],
    "faculty_query": ["faculty", "teacher", "professor", "mentor", "contact", "office"],
}


@dataclass
class IntentPrediction:
    """Structured classifier result."""

    query: str
    predicted_intent: str
    confidence: float
    all_intents: list[dict[str, float | str]]
    model: str
    model_status: str
    processing_time_ms: int
    fallback_reason: str | None = None

    def to_dict(self) -> dict[str, Any]:
        payload = {
            "query": self.query,
            "predicted_intent": self.predicted_intent,
            "intent": self.predicted_intent,
            "confidence": self.confidence,
            "all_intents": self.all_intents,
            "model": self.model,
            "model_status": self.model_status,
            "processing_time_ms": self.processing_time_ms,
        }
        if self.fallback_reason:
            payload["fallback_reason"] = self.fallback_reason
        return payload


class IntentClassifier:
    """Lazy-loading DistilBERT classifier.

    The class loads a fine-tuned DistilBERT model from settings.distilbert_model_path.
    If the model is not present, it returns deterministic keyword fallback results so
    the backend can continue to answer from Firestore without hallucinating.
    """

    def __init__(self) -> None:
        self.model = None
        self.tokenizer = None
        self.device = "cpu"
        self.model_status = "not_loaded"
        self.fallback_reason: str | None = None
        self._load_lock = Lock()

    @property
    def model_path(self) -> Path:
        configured = Path(settings.distilbert_model_path)
        return configured if configured.is_absolute() else AI_ENGINE_ROOT / configured

    def load(self) -> None:
        if self.model_status in {"loaded", "fallback"}:
            return

        with self._load_lock:
            if self.model_status in {"loaded", "fallback"}:
                return

            model_path = self.model_path
            if not (model_path / "config.json").exists():
                self.model_status = "fallback"
                self.fallback_reason = f"Fine-tuned model not found at {model_path}"
                logger.warning(f"[Intent] {self.fallback_reason}")
                return

            try:
                import torch
                from transformers import AutoModelForSequenceClassification, AutoTokenizer

                self.device = "cuda" if torch.cuda.is_available() else "cpu"
                self.tokenizer = AutoTokenizer.from_pretrained(str(model_path), local_files_only=True)
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    str(model_path),
                    local_files_only=True,
                )
                self.model.to(self.device)
                self.model.eval()
                self.model_status = "loaded"
                self.fallback_reason = None
                logger.info(f"[Intent] Loaded DistilBERT intent model from {model_path}")
            except Exception as exc:
                self.model = None
                self.tokenizer = None
                self.model_status = "fallback"
                self.fallback_reason = str(exc)
                logger.warning(f"[Intent] Falling back to keyword classifier: {exc}")

    def _keyword_scores(self, query: str) -> dict[str, float]:
        normalized = query.lower()
        scores = {intent: 0.03 for intent in INTENT_LABELS}

        for intent, keywords in KEYWORD_RULES.items():
            matches = sum(1 for keyword in keywords if keyword in normalized)
            if matches:
                scores[intent] = min(0.55 + matches * 0.14, 0.93)

        if all(score == 0.03 for score in scores.values()):
            scores["faq_query"] = 0.52

        total = sum(scores.values())
        return {intent: score / total for intent, score in scores.items()}

    def _predict_keyword(self, query: str, started_at: float) -> IntentPrediction:
        scores = self._keyword_scores(query)
        predicted_intent = max(scores, key=scores.get)
        confidence = float(scores[predicted_intent])
        all_intents = [
            {"intent": intent, "confidence": round(float(score), 4)}
            for intent, score in sorted(scores.items(), key=lambda item: item[1], reverse=True)
        ]

        return IntentPrediction(
            query=query,
            predicted_intent=predicted_intent,
            confidence=round(confidence, 4),
            all_intents=all_intents,
            model="keyword_fallback",
            model_status=self.model_status,
            processing_time_ms=int((time.perf_counter() - started_at) * 1000),
            fallback_reason=self.fallback_reason,
        )

    def predict(self, query: str) -> IntentPrediction:
        started_at = time.perf_counter()
        normalized_query = validate_query(query)
        self.load()

        if self.model is None or self.tokenizer is None:
            return self._predict_keyword(normalized_query, started_at)

        try:
            import torch

            inputs = self.tokenizer(
                normalized_query,
                truncation=True,
                padding=True,
                max_length=settings.max_sequence_length,
                return_tensors="pt",
            )
            inputs = {key: value.to(self.device) for key, value in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)
                probabilities = torch.softmax(outputs.logits, dim=-1).cpu().numpy()[0]

            predicted_id = int(np.argmax(probabilities))
            predicted_intent = ID_TO_LABEL[predicted_id]
            confidence = float(probabilities[predicted_id])
            all_intents = [
                {"intent": ID_TO_LABEL[index], "confidence": round(float(score), 4)}
                for index, score in sorted(enumerate(probabilities), key=lambda item: item[1], reverse=True)
            ]

            if confidence < settings.intent_confidence_threshold:
                fallback = self._predict_keyword(normalized_query, started_at)
                fallback.model_status = "loaded_low_confidence"
                fallback.fallback_reason = (
                    f"DistilBERT confidence {confidence:.4f} below threshold "
                    f"{settings.intent_confidence_threshold:.2f}"
                )
                return fallback

            return IntentPrediction(
                query=normalized_query,
                predicted_intent=predicted_intent,
                confidence=round(confidence, 4),
                all_intents=all_intents,
                model="distilbert-base-uncased",
                model_status="loaded",
                processing_time_ms=int((time.perf_counter() - started_at) * 1000),
            )
        except Exception as exc:
            self.model_status = "fallback"
            self.fallback_reason = str(exc)
            logger.warning(f"[Intent] Inference failed; using fallback: {exc}")
            return self._predict_keyword(normalized_query, started_at)

    def health(self) -> dict[str, str]:
        self.load()
        return {
            "status": self.model_status,
            "model_path": str(self.model_path),
            "fallback_reason": self.fallback_reason or "",
        }


_classifier = IntentClassifier()


def get_intent_classifier() -> IntentClassifier:
    return _classifier


def predict_intent(query: str) -> IntentPrediction:
    return _classifier.predict(query)
