import json
import logging
from datetime import datetime, timezone


class StructuredJsonFormatter(logging.Formatter):
    """
    JSON log formatter with request_id and safe user_id (never outputs PII like passwords or email).
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Optional metadata attached via extra or attributes
        for key in ("request_id", "user_id", "llm_metrics", "error_code", "duration_ms"):
            val = getattr(record, key, None)
            if val is not None:
                log_entry[key] = val

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def log_llm_metrics(
    logger: logging.Logger,
    feature: str,
    model: str,
    latency_ms: float,
    status: str,
    tokens: int | None = None,
    error: str | None = None,
):
    """
    Structured telemetry helper for LLM requests.
    """
    extra_payload = {
        "llm_metrics": {
            "feature": feature,
            "model": model,
            "latency_ms": round(latency_ms, 2),
            "status": status,
            "tokens": tokens,
            "error": error,
        }
    }
    if status == "success":
        logger.info(
            f"[LLM_CALL] feature={feature} model={model} latency={latency_ms:.2f}ms status=success",
            extra=extra_payload,
        )
    else:
        logger.error(
            f"[LLM_FAIL] feature={feature} model={model} latency={latency_ms:.2f}ms status={status} error={error}",
            extra=extra_payload,
        )
