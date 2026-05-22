"""Fine-tune DistilBERT for academic intent classification.

This script fine-tunes distilbert-base-uncased. It does not train a model from
scratch. Model artifacts are written to ai-engine/models/distilbert by default
and are intentionally gitignored.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import torch
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.config.settings import AI_ENGINE_ROOT, settings
from app.nlp.intent_labels import ID_TO_LABEL, INTENT_LABELS, LABEL_TO_ID
from app.nlp.preprocessing import normalize_query


class IntentDataset(Dataset):
    def __init__(self, records: list[dict[str, str]], tokenizer, max_length: int) -> None:
        self.records = records
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, index: int) -> dict[str, torch.Tensor]:
        record = self.records[index]
        encoded = self.tokenizer(
            normalize_query(record["text"]),
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            return_tensors="pt",
        )
        item = {key: value.squeeze(0) for key, value in encoded.items()}
        item["labels"] = torch.tensor(LABEL_TO_ID[record["intent"]], dtype=torch.long)
        return item


def resolve_path(path_value: str) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else AI_ENGINE_ROOT / path


def load_records(path: Path) -> list[dict[str, str]]:
    records = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            if not line.strip():
                continue
            record = json.loads(line)
            if record["intent"] not in LABEL_TO_ID:
                raise ValueError(f"Line {line_number}: unsupported intent {record['intent']}")
            records.append({"text": record["text"], "intent": record["intent"]})
    return records


def split_records(records: list[dict[str, str]], seed: int) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    grouped = {intent: [] for intent in INTENT_LABELS}
    for record in records:
        grouped[record["intent"]].append(record)

    train_records = []
    eval_records = []
    rng = random.Random(seed)

    for intent_records in grouped.values():
        rng.shuffle(intent_records)
        eval_count = max(1, round(len(intent_records) * 0.2))
        eval_records.extend(intent_records[:eval_count])
        train_records.extend(intent_records[eval_count:])

    rng.shuffle(train_records)
    rng.shuffle(eval_records)
    return train_records, eval_records


def evaluate(model, dataloader: DataLoader, device: str) -> float:
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for batch in dataloader:
            batch = {key: value.to(device) for key, value in batch.items()}
            labels = batch.pop("labels")
            outputs = model(**batch)
            predictions = torch.argmax(outputs.logits, dim=-1)
            correct += int((predictions == labels).sum().item())
            total += labels.size(0)

    model.train()
    return correct / total if total else 0.0


def train(args: argparse.Namespace) -> None:
    data_path = resolve_path(args.data)
    output_dir = resolve_path(args.output_dir)
    records = load_records(data_path)
    train_records, eval_records = split_records(records, args.seed)

    tokenizer = AutoTokenizer.from_pretrained(
        args.base_model,
        local_files_only=args.local_files_only,
    )
    model = AutoModelForSequenceClassification.from_pretrained(
        args.base_model,
        num_labels=len(INTENT_LABELS),
        id2label=ID_TO_LABEL,
        label2id=LABEL_TO_ID,
        local_files_only=args.local_files_only,
    )

    device = "cuda" if torch.cuda.is_available() and not args.cpu else "cpu"
    model.to(device)

    train_loader = DataLoader(
        IntentDataset(train_records, tokenizer, args.max_length),
        batch_size=args.batch_size,
        shuffle=True,
    )
    eval_loader = DataLoader(
        IntentDataset(eval_records, tokenizer, args.max_length),
        batch_size=args.batch_size,
    )
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.learning_rate)

    model.train()
    completed_steps = 0
    for epoch in range(args.epochs):
        for batch in train_loader:
            batch = {key: value.to(device) for key, value in batch.items()}
            outputs = model(**batch)
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()
            completed_steps += 1

            if completed_steps % args.log_every == 0:
                print(f"epoch={epoch + 1} step={completed_steps} loss={loss.item():.4f}")

            if args.max_steps and completed_steps >= args.max_steps:
                break

        accuracy = evaluate(model, eval_loader, device)
        print(f"epoch={epoch + 1} eval_accuracy={accuracy:.4f}")

        if args.max_steps and completed_steps >= args.max_steps:
            break

    output_dir.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    (output_dir / "intent_labels.json").write_text(
        json.dumps({"labels": INTENT_LABELS, "label_to_id": LABEL_TO_ID}, indent=2),
        encoding="utf-8",
    )
    print(f"Saved fine-tuned DistilBERT intent model to {output_dir}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tune DistilBERT for intent classification")
    parser.add_argument("--base-model", default="distilbert-base-uncased")
    parser.add_argument("--data", default="data/intent_training.jsonl")
    parser.add_argument("--output-dir", default=settings.distilbert_model_path)
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--learning-rate", type=float, default=2e-5)
    parser.add_argument("--max-length", type=int, default=128)
    parser.add_argument("--max-steps", type=int, default=0)
    parser.add_argument("--log-every", type=int, default=5)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--cpu", action="store_true")
    parser.add_argument("--local-files-only", action="store_true")
    return parser.parse_args()


if __name__ == "__main__":
    train(parse_args())

