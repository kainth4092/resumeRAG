import logging

from app.core.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.openrouter_service import OpenRouterProvider
from app.services.ai.ollama_service import OllamaProvider

logger = logging.getLogger(__name__)

_provider_instance: AIProvider | None = None


def get_ai_provider() -> AIProvider:
    """
    Return one shared AI provider instance.

    Supported providers:
    - openrouter
    - ollama

    The application must fail explicitly for an invalid provider instead
    of silently falling back and accidentally spending OpenRouter tokens.
    """
    global _provider_instance

    if _provider_instance is not None:
        return _provider_instance

    provider_name = (settings.AI_PROVIDER or "openrouter").strip().lower()

    logger.info(
        "[AI_CONFIG] Initializing configured provider: %s",
        provider_name,
    )

    if provider_name == "openrouter":
        _provider_instance = OpenRouterProvider()

    elif provider_name == "ollama":
        _provider_instance = OllamaProvider()

    else:
        raise RuntimeError(
            f"Unsupported AI_PROVIDER='{provider_name}'. "
            "Allowed values are: openrouter, ollama."
        )

    return _provider_instance
