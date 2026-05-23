"""
Application Settings
Centralizes all environment variable access using Pydantic Settings.
Import `settings` instead of accessing os.environ directly.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os
from pathlib import Path

# Resolve the ai-engine root directory
AI_ENGINE_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(AI_ENGINE_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "development"
    log_level: str = "debug"

    # Backend API
    backend_api_url: str = "http://localhost:5000"
    backend_api_timeout: int = 30

    # Model paths
    distilbert_model_path: str = "models/distilbert"
    sentence_transformer_model: str = "all-MiniLM-L6-v2"
    faiss_index_path: str = "vectorstore/index/campus.index"
    embedding_batch_size: int = 32
    semantic_similarity_threshold: float = 0.32
    allow_model_download: bool = False

    # Google Vertex AI / Gemini
    google_cloud_project: str = ""
    google_cloud_location: str = "us-central1"
    gemini_model: str = "gemini-2.5-flash"
    gemini_temperature: float = 0.2
    gemini_max_output_tokens: int = 300

    # Inference
    max_sequence_length: int = 512
    intent_confidence_threshold: float = 0.75
    top_k_results: int = 5

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache()
def get_settings() -> Settings:
    """Returns a cached Settings instance."""
    return Settings()


settings = get_settings()
