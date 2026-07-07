import httpx
import logging
import time
import asyncio
from app.core.config import settings
from app.services.ai.base import AIProvider, AIProviderException

logger = logging.getLogger(__name__)

limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)

TIMEOUT = 120.0

_sync_client = httpx.Client(timeout=TIMEOUT, limits=limits)
_async_client = httpx.AsyncClient(timeout=TIMEOUT, limits=limits)


class OpenRouterProvider(AIProvider):
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = (
            settings.OPENROUTER_BASE_URL.rstrip("/")
            if settings.OPENROUTER_BASE_URL
            else "https://openrouter.ai/api/v1"
        )
        self.model = settings.OPENROUTER_MODEL or "google/gemma-3-4b-it:free"

    def _get_headers(self) -> dict:
        headers = {
            "Content-Type": "application/json",
            "HTTP-Referer": "https://resupilot.ai",
            "X-Title": "ResuPilot AI",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _handle_response_error(self, response: httpx.Response):
        status = response.status_code
        try:
            err_data = response.json()
            err_msg = err_data.get("error", {}).get("message", response.text)
        except Exception:
            err_msg = response.text

        logger.error(f"[AI_ERROR] OpenRouter returned error status {status}: {err_msg}")

        if status == 401:
            raise AIProviderException(
                "Invalid OpenRouter API Key. Please verify your settings.",
                status_code=401,
            )
        elif status == 429:
            raise AIProviderException(
                "OpenRouter rate limit exceeded. Please try again later.",
                status_code=429,
            )
        elif status in (502, 503, 504):
            raise AIProviderException(
                "OpenRouter service is temporarily unavailable. Please try again.",
                status_code=status,
            )
        else:
            raise AIProviderException(
                f"OpenRouter returned error: {err_msg}", status_code=status
            )

    def _handle_exception(self, e: Exception) -> Exception:
        if isinstance(e, httpx.TimeoutException):
            logger.error("[AI_ERROR] OpenRouter request timed out.")
            return AIProviderException(
                "OpenRouter request timed out. The model took too long to respond.",
                status_code=504,
            )
        elif isinstance(e, (httpx.ConnectError, httpx.ConnectTimeout)):
            logger.error(
                f"[AI_ERROR] OpenRouter network connection refused/timed out: {e}"
            )
            return AIProviderException(
                "Could not connect to OpenRouter server. Please check your network connection.",
                status_code=503,
            )
        elif isinstance(e, AIProviderException):
            return e
        else:
            logger.error(
                f"[AI_ERROR] Unexpected error in OpenRouter provider: {str(e)}",
                exc_info=True,
            )
            return AIProviderException(
                f"Unexpected AI service error: {str(e)}", status_code=500
            )

    def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        timeout: float = None,
    ) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = self._get_headers()

        # Build list of models to try in order
        primary_model = self.model
        fallbacks = [
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free",
            "liquid/lfm-2.5-1.2b-instruct:free",
            "cohere/north-mini-code:free",
        ]
        model_list = [primary_model]
        for fb in fallbacks:
            if fb not in model_list:
                model_list.append(fb)

        prompt_size = len(system_prompt) + len(user_prompt)
        start_time = time.time()
        last_exception = None
        max_attempts = len(model_list)

        for attempt, current_model in enumerate(model_list, 1):
            payload = {
                "model": current_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": temperature,
            }
            try:
                actual_timeout = timeout if timeout is not None else TIMEOUT
                response = _sync_client.post(
                    url, json=payload, headers=headers, timeout=actual_timeout
                )

                if response.status_code != 200:
                    self._handle_response_error(response)

                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise AIProviderException(
                        "Empty response choices received from OpenRouter.",
                        status_code=500,
                    )

                content = choices[0].get("message", {}).get("content", "")
                if not content:
                    raise AIProviderException(
                        "Received empty text content from OpenRouter.", status_code=500
                    )

                duration = time.time() - start_time
                logger.info(
                    f"[AI_METRICS] Sync Chat | Model: {current_model} | "
                    f"Prompt Size: {prompt_size} chars | Response Size: {len(content)} chars | "
                    f"Time taken: {duration:.3f}s | Attempt: {attempt}"
                )
                return content

            except Exception as e:
                last_exception = self._handle_exception(e)
                logger.warning(
                    f"Model {current_model} failed on attempt {attempt} in OpenRouter sync chat: {e}"
                )
                
                status_code = None
                if isinstance(e, AIProviderException):
                    status_code = e.status_code
                elif isinstance(e, httpx.HTTPStatusError):
                    status_code = e.response.status_code

                if attempt < max_attempts and status_code in (429, 502, 503, 504):
                    delay = 1.5 * attempt if status_code == 429 else 0.5 * attempt
                    time.sleep(delay)
                    continue
                break

        if last_exception:
            raise last_exception
        raise AIProviderException("OpenRouter chat request failed.")

    async def chat_async(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.1,
        timeout: float = None,
    ) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = self._get_headers()

        # Build list of models to try in order
        primary_model = self.model
        fallbacks = [
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free",
            "liquid/lfm-2.5-1.2b-instruct:free",
            "cohere/north-mini-code:free",
        ]
        model_list = [primary_model]
        for fb in fallbacks:
            if fb not in model_list:
                model_list.append(fb)

        prompt_size = len(system_prompt) + len(user_prompt)
        start_time = time.time()
        last_exception = None
        max_attempts = len(model_list)

        for attempt, current_model in enumerate(model_list, 1):
            payload = {
                "model": current_model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": temperature,
            }
            try:
                actual_timeout = timeout if timeout is not None else TIMEOUT
                response = await _async_client.post(
                    url, json=payload, headers=headers, timeout=actual_timeout
                )

                if response.status_code != 200:
                    self._handle_response_error(response)

                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise AIProviderException(
                        "Empty response choices received from OpenRouter.",
                        status_code=500,
                    )

                content = choices[0].get("message", {}).get("content", "")
                if not content:
                    raise AIProviderException(
                        "Received empty text content from OpenRouter.", status_code=500
                    )

                duration = time.time() - start_time
                logger.info(
                    f"[AI_METRICS] Async Chat | Model: {current_model} | "
                    f"Prompt Size: {prompt_size} chars | Response Size: {len(content)} chars | "
                    f"Time taken: {duration:.3f}s | Attempt: {attempt}"
                )
                return content

            except Exception as e:
                last_exception = self._handle_exception(e)
                logger.warning(
                    f"Model {current_model} failed on attempt {attempt} in OpenRouter async chat: {e}"
                )
                
                status_code = None
                if isinstance(e, AIProviderException):
                    status_code = e.status_code
                elif isinstance(e, httpx.HTTPStatusError):
                    status_code = e.response.status_code

                if attempt < max_attempts and status_code in (429, 502, 503, 504):
                    delay = 1.5 * attempt if status_code == 429 else 0.5 * attempt
                    await asyncio.sleep(delay)
                    continue
                break

        if last_exception:
            raise last_exception
        raise AIProviderException("OpenRouter chat request failed.")

    def validate_startup(self) -> None:
        """
        Verify OpenRouter API key exists. If not, log a warning but don't exit since this is a SaaS/cloud service.
        """
        logger.info("Validating OpenRouter provider settings...")
        if not self.api_key:
            logger.warning(
                "OPENROUTER_API_KEY environment variable is not set. Requests will fail if key-based access is required."
            )
        else:
            logger.info(f"OpenRouter provider configured. Model: {self.model}")
