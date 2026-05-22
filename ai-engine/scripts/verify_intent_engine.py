"""Verify DistilBERT intent inference endpoints."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient

from app.main import app


CASES = [
    ("What is my timetable today?", "timetable_query"),
    ("Show latest notices", "notice_query"),
    ("What events are coming up?", "event_query"),
    ("Who is my mentor faculty?", "faculty_query"),
    ("Was my lab rescheduled?", "schedule_update"),
    ("How do I reset my ERP password?", "faq_query"),
]


def main() -> None:
    client = TestClient(app)

    for query, expected_intent in CASES:
        response = client.post("/infer/classify", json={"query": query})
        if response.status_code != 200:
            raise SystemExit(f"{query!r} returned {response.status_code}: {response.text}")

        payload = response.json()["data"]
        predicted = payload["predicted_intent"]
        confidence = payload["confidence"]
        if predicted != expected_intent:
            raise SystemExit(
                f"{query!r}: expected {expected_intent}, got {predicted} "
                f"(confidence={confidence}, model_status={payload.get('model_status')})"
            )
        print(
            f"OK {query!r} -> {predicted} "
            f"confidence={confidence} status={payload.get('model_status')}"
        )

    health = client.get("/health")
    if health.status_code != 200:
        raise SystemExit(f"Health returned {health.status_code}: {health.text}")
    models = health.json()["data"]["models"]
    print(f"Intent health: {models['distilbert']}")
    print("Intent engine verification passed.")


if __name__ == "__main__":
    main()

