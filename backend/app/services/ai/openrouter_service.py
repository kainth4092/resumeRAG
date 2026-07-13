import httpx
import logging
import time
import json

from app.core.config import settings
from app.services.ai.base import AIProvider, AIProviderException


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# HTTP CLIENT CONFIGURATION
# ---------------------------------------------------------------------------

limits = httpx.Limits(
    max_keepalive_connections=5,
    max_connections=10,
)

DEFAULT_TIMEOUT = 120.0

_sync_client = httpx.Client(
    timeout=DEFAULT_TIMEOUT,
    limits=limits,
)

_async_client = httpx.AsyncClient(
    timeout=DEFAULT_TIMEOUT,
    limits=limits,
)


class OpenRouterProvider(AIProvider):

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY

        self.base_url = (
            settings.OPENROUTER_BASE_URL.rstrip("/")
            if settings.OPENROUTER_BASE_URL
            else "https://openrouter.ai/api/v1"
        )

        self.model = settings.OPENROUTER_MODEL or "google/gemma-3-4b-it:free"

    # -----------------------------------------------------------------------
    # HEADERS
    # -----------------------------------------------------------------------

    def _get_headers(self) -> dict:
        headers = {
            "Content-Type": "application/json",
            "HTTP-Referer": "https://resupilot.ai",
            "X-Title": "ResuPilot AI",
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        return headers

    # -----------------------------------------------------------------------
    # RESPONSE ERROR HANDLER
    # -----------------------------------------------------------------------

    def _handle_response_error(self, response: httpx.Response):
        status = response.status_code

        try:
            error_data = response.json()

            error_message = error_data.get("error", {}).get("message", response.text)

        except Exception:
            error_message = response.text

        logger.error(
            "[AI_ERROR] OpenRouter returned status=%s error=%s",
            status,
            error_message,
        )

        if status == 401:
            raise AIProviderException(
                "Invalid OpenRouter API key.",
                status_code=401,
            )

        if status == 429:
            raise AIProviderException(
                "OpenRouter rate limit exceeded. Please try again later.",
                status_code=429,
            )

        if status in (502, 503, 504):
            raise AIProviderException(
                "OpenRouter service is temporarily unavailable.",
                status_code=status,
            )

        raise AIProviderException(
            f"OpenRouter returned error: {error_message}",
            status_code=status,
        )

    # -----------------------------------------------------------------------
    # GENERAL EXCEPTION HANDLER
    # -----------------------------------------------------------------------

    def _handle_exception(self, exception: Exception) -> AIProviderException:

        if isinstance(exception, AIProviderException):
            return exception

        if isinstance(exception, httpx.TimeoutException):

            logger.error("[AI_ERROR] OpenRouter request timed out.")

            return AIProviderException(
                "The AI model took too long to respond.",
                status_code=504,
            )

        if isinstance(
            exception,
            (httpx.ConnectError, httpx.ConnectTimeout),
        ):

            logger.error(
                "[AI_ERROR] Could not connect to OpenRouter: %s",
                exception,
            )

            return AIProviderException(
                "Could not connect to OpenRouter.",
                status_code=503,
            )

        logger.exception(
            "[AI_ERROR] Unexpected OpenRouter error: %s",
            exception,
        )

        return AIProviderException(
            f"Unexpected AI service error: {str(exception)}",
            status_code=500,
        )

    # -----------------------------------------------------------------------
    # SYNC CHAT
    # -----------------------------------------------------------------------

    def _get_models_to_try(self, requested_model: str) -> list[str]:
        models = [requested_model]
        is_free = requested_model == "openrouter/free" or requested_model.endswith(":free")
        if is_free:
            fallback_pool = [
                "meta-llama/llama-3.3-70b-instruct:free",
                "google/gemma-4-31b-it:free",
                "qwen/qwen3-coder:free",
                "meta-llama/llama-3.2-3b-instruct:free",
                "nvidia/nemotron-3-nano-30b-a3b:free",
                "openrouter/free",
            ]
            for fb in fallback_pool:
                if fb not in models:
                    models.append(fb)
        return models

    def _is_invalid_response(self, content: str, system_prompt: str, user_prompt: str) -> bool:
        cleaned = content.strip()
        if not cleaned:
            return True
        if "user safety:" in cleaned.lower():
            logger.warning("[AI_RESPONSE_VALIDATION] Content safety verdict detected in response: %r", content)
            return True
        is_json_expected = "json" in system_prompt.lower() or "json" in user_prompt.lower() or "schema" in user_prompt.lower()
        if is_json_expected:
            if "{" not in cleaned or "}" not in cleaned:
                logger.warning("[AI_RESPONSE_VALIDATION] JSON expected but response lacks curly braces: %r", content)
                return True
            import json
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start == -1 or end == -1 or end <= start:
                logger.warning("[AI_RESPONSE_VALIDATION] JSON expected but braces are misaligned/missing: %r", content)
                return True
            try:
                candidate = cleaned[start:end+1]
                parsed = json.loads(candidate)
                if not isinstance(parsed, dict):
                    logger.warning("[AI_RESPONSE_VALIDATION] Parsed JSON is not a dictionary: %r", content)
                    return True
            except Exception as exc:
                logger.warning("[AI_RESPONSE_VALIDATION] JSON validation failed: %s. Content was: %r", exc, content)
                return True
        return False

    # -----------------------------------------------------------------------
    # SYNC CHAT
    # -----------------------------------------------------------------------

    def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.0,
        timeout: float = None,
        feature: str = "unknown",
    ) -> str:
        models_to_try = self._get_models_to_try(self.model)
        last_exception = None

        for model in models_to_try:
            url = f"{self.base_url}/chat/completions"
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
                "temperature": temperature,
                "max_tokens": 4096,
            }

            prompt_size = len(system_prompt) + len(user_prompt)
            started_at = time.perf_counter()

            logger.info(
                "[LLM_REQUEST_START] feature=%s model=%s prompt_size=%s",
                feature,
                model,
                prompt_size,
            )

            try:
                actual_timeout = timeout if timeout is not None else DEFAULT_TIMEOUT
                response = _sync_client.post(
                    url,
                    json=payload,
                    headers=self._get_headers(),
                    timeout=actual_timeout,
                )

                if response.status_code != 200:
                    self._handle_response_error(response)

                data = response.json()
                choices = data.get("choices", [])

                if not choices:
                    logger.error(
                        "[LLM_EMPTY_CHOICES] feature=%s model=%s response=%s",
                        feature,
                        model,
                        json.dumps(data, default=str)[:2000],
                    )
                    raise AIProviderException(
                        "The AI provider returned an empty response. Please try again.",
                        status_code=503,
                    )

                content = choices[0].get("message", {}).get("content", "")
                if not content:
                    raise AIProviderException(
                        "OpenRouter returned empty content.",
                        status_code=500,
                    )

                if self._is_invalid_response(content, system_prompt, user_prompt):
                    raise AIProviderException(
                        f"Response content from model {model} failed format/safety validation.",
                        status_code=500,
                    )

                duration = time.perf_counter() - started_at
                usage = data.get("usage", {})

                logger.info(
                    "[LLM_REQUEST_SUCCESS] feature=%s model=%s duration=%.2fs prompt_tokens=%s completion_tokens=%s total_tokens=%s",
                    feature,
                    model,
                    duration,
                    usage.get("prompt_tokens"),
                    usage.get("completion_tokens"),
                    usage.get("total_tokens"),
                )
                return content

            except Exception as exception:
                duration = time.perf_counter() - started_at
                logger.warning(
                    "[LLM_REQUEST_FAILED_RETRYING] model=%s failed. Error: %s. Remaining models: %s",
                    model,
                    exception,
                    models_to_try[models_to_try.index(model)+1:],
                )
                last_exception = exception

        logger.error(
            "[LLM_ALL_MODELS_FAILED] feature=%s requested_model=%s",
            feature,
            self.model,
        )
        raise self._handle_exception(last_exception)

    # -----------------------------------------------------------------------
    # ASYNC CHAT
    # -----------------------------------------------------------------------

    async def chat_async(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.0,
        timeout: float = None,
        feature: str = "unknown",
    ) -> str:
        models_to_try = self._get_models_to_try(self.model)
        last_exception = None

        for model in models_to_try:
            url = f"{self.base_url}/chat/completions"
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": user_prompt,
                    },
                ],
                "temperature": temperature,
                "max_tokens": 2500,
            }

            prompt_size = len(system_prompt) + len(user_prompt)
            started_at = time.perf_counter()

            logger.info(
                "[LLM_REQUEST_START] feature=%s model=%s prompt_size=%s",
                feature,
                model,
                prompt_size,
            )

            try:
                actual_timeout = timeout if timeout is not None else DEFAULT_TIMEOUT
                response = await _async_client.post(
                    url,
                    json=payload,
                    headers=self._get_headers(),
                    timeout=actual_timeout,
                )

                if response.status_code != 200:
                    self._handle_response_error(response)

                data = response.json()
                choices = data.get("choices", [])

                if not choices:
                    raise AIProviderException(
                        "OpenRouter returned no response choices.",
                        status_code=500,
                    )

                content = choices[0].get("message", {}).get("content", "")
                if not content:
                    raise AIProviderException(
                        "OpenRouter returned empty content.",
                        status_code=500,
                    )

                if self._is_invalid_response(content, system_prompt, user_prompt):
                    raise AIProviderException(
                        f"Response content from model {model} failed format/safety validation.",
                        status_code=500,
                    )

                duration = time.perf_counter() - started_at
                usage = data.get("usage", {})

                logger.info(
                    "[LLM_REQUEST_SUCCESS] feature=%s model=%s duration=%.2fs prompt_tokens=%s completion_tokens=%s total_tokens=%s",
                    feature,
                    model,
                    duration,
                    usage.get("prompt_tokens"),
                    usage.get("completion_tokens"),
                    usage.get("total_tokens"),
                )
                return content

            except Exception as exception:
                duration = time.perf_counter() - started_at
                logger.warning(
                    "[LLM_REQUEST_FAILED_RETRYING] model=%s failed. Error: %s. Remaining models: %s",
                    model,
                    exception,
                    models_to_try[models_to_try.index(model)+1:],
                )
                last_exception = exception

        logger.error(
            "[LLM_ALL_MODELS_FAILED] feature=%s requested_model=%s",
            feature,
            self.model,
        )
        raise self._handle_exception(last_exception)

    # -----------------------------------------------------------------------
    # STARTUP VALIDATION
    # IMPORTANT: THIS MUST NEVER CALL THE LLM
    # -----------------------------------------------------------------------

    def validate_startup(self) -> None:

        if not self.api_key:
            raise RuntimeError("OPENROUTER_API_KEY is not configured.")

        if not self.model:
            raise RuntimeError("OPENROUTER_MODEL is not configured.")

        logger.info(
            "[AI_CONFIG] OpenRouter validated. model=%s",
            self.model,
        )
