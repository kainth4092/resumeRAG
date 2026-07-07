import httpx
import logging
import time
import sys
from app.core.config import settings
from app.services.ai.base import AIProvider, AIProviderException

logger = logging.getLogger(__name__)

# Connection pooling limits for high performance
limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
# Standard timeout budget for local Ollama requests
TIMEOUT = 120.0

_sync_client = httpx.Client(timeout=TIMEOUT, limits=limits)
_async_client = httpx.AsyncClient(timeout=TIMEOUT, limits=limits)

class OllamaProvider(AIProvider):
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL.rstrip("/") if settings.OLLAMA_BASE_URL else "http://localhost:11434"
        self.model = settings.OLLAMA_MODEL or "gemma2:2b"

    def _handle_response_error(self, response: httpx.Response):
        status = response.status_code
        try:
            err_data = response.json()
            err_msg = err_data.get("error", response.text)
        except Exception:
            err_msg = response.text

        logger.error(f"[AI_ERROR] Ollama returned error status {status}: {err_msg}")
        raise AIProviderException(f"Ollama returned error: {err_msg}", status_code=status)

    def _handle_exception(self, e: Exception) -> Exception:
        if isinstance(e, httpx.TimeoutException):
            logger.error("[AI_ERROR] Ollama request timed out.")
            return AIProviderException("Ollama request timed out. The local model took too long to respond.", status_code=504)
        elif isinstance(e, (httpx.ConnectError, httpx.ConnectTimeout)):
            logger.error(f"[AI_ERROR] Ollama network connection refused/timed out: {e}")
            return AIProviderException("Could not connect to local Ollama server. Please verify it is running.", status_code=503)
        elif isinstance(e, AIProviderException):
            return e
        else:
            logger.error(f"[AI_ERROR] Unexpected error in Ollama provider: {str(e)}", exc_info=True)
            return AIProviderException(f"Unexpected AI service error: {str(e)}", status_code=500)

    def chat(self, system_prompt: str, user_prompt: str, temperature: float = 0.1, timeout: float = None) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": user_prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": 2048,
                "num_ctx": 8192
            }
        }

        prompt_size = len(system_prompt) + len(user_prompt)
        start_time = time.time()

        try:
            actual_timeout = timeout if timeout is not None else TIMEOUT
            response = _sync_client.post(
                url,
                json=payload,
                timeout=actual_timeout
            )
            
            if response.status_code != 200:
                self._handle_response_error(response)

            data = response.json()
            content = data.get("response", "")
            if not content:
                raise AIProviderException("Received empty text content from Ollama.", status_code=500)

            duration = time.time() - start_time
            logger.info(
                f"[AI_METRICS] Ollama Sync Chat | Model: {self.model} | "
                f"Prompt Size: {prompt_size} chars | Response Size: {len(content)} chars | "
                f"Time taken: {duration:.3f}s"
            )
            return content

        except Exception as e:
            raise self._handle_exception(e)

    async def chat_async(self, system_prompt: str, user_prompt: str, temperature: float = 0.1, timeout: float = None) -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": user_prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": 2048,
                "num_ctx": 8192
            }
        }

        prompt_size = len(system_prompt) + len(user_prompt)
        start_time = time.time()

        try:
            actual_timeout = timeout if timeout is not None else TIMEOUT
            response = await _async_client.post(
                url,
                json=payload,
                timeout=actual_timeout
            )

            if response.status_code != 200:
                self._handle_response_error(response)

            data = response.json()
            content = data.get("response", "")
            if not content:
                raise AIProviderException("Received empty text content from Ollama.", status_code=500)

            duration = time.time() - start_time
            logger.info(
                f"[AI_METRICS] Ollama Async Chat | Model: {self.model} | "
                f"Prompt Size: {prompt_size} chars | Response Size: {len(content)} chars | "
                f"Time taken: {duration:.3f}s"
            )
            return content

        except Exception as e:
            raise self._handle_exception(e)

    def validate_startup(self) -> None:
        """
        Verify Ollama is reachable. Exits on failure in local mode.
        """
        logger.info("Validating local Ollama connection...")
        try:
            url = f"{self.base_url}/api/tags"
            response = _sync_client.get(url, timeout=5.0)
            response.raise_for_status()
            logger.info("Local Ollama connection successful.")
        except Exception as e:
            print("\n" + "="*60)
            print("ERROR: Cannot connect to Ollama server.")
            print(f"Ollama server is not reachable at {self.base_url}.")
            print("="*60 + "\n")
            logger.critical("Ollama connection validation failed: %s", str(e))
            sys.exit(1)
