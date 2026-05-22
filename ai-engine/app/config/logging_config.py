"""
Logging Configuration
Sets up Loguru for structured logging across the AI engine.
"""

import sys
from loguru import logger
from app.config.settings import settings


def configure_logging() -> None:
    """Configure Loguru logger with appropriate handlers and format."""
    logger.remove()  # Remove default handler

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    # Console handler
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.log_level.upper(),
        colorize=True,
        backtrace=settings.is_development,
        diagnose=settings.is_development,
    )

    # File handler in production
    if settings.is_production:
        logger.add(
            "logs/ai_engine.log",
            format=log_format,
            level="INFO",
            rotation="10 MB",
            retention="30 days",
            compression="zip",
        )

    logger.info(
        f"[Logging] Configured — level={settings.log_level.upper()}, "
        f"env={settings.environment}"
    )
