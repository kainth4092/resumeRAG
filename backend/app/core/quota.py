import time
from collections import defaultdict
from datetime import date
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.llm_usage import LLMUsage

# In-memory sliding window for pipeline run endpoint: max 5 requests per minute per user
_user_pipeline_rate_limit: dict[int, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_RUNS_PER_WINDOW = 5
MAX_DAILY_LLM_CALLS = 100


def check_pipeline_rate_limit(user_id: int):
    """Enforce sliding window rate limit for starting pipeline runs."""
    now = time.time()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS
    _user_pipeline_rate_limit[user_id] = [
        t for t in _user_pipeline_rate_limit[user_id] if t > cutoff
    ]
    if len(_user_pipeline_rate_limit[user_id]) >= MAX_RUNS_PER_WINDOW:
        raise HTTPException(
            status_code=429,
            detail="Too many pipeline requests. Please wait a minute before starting another run.",
        )
    _user_pipeline_rate_limit[user_id].append(now)


def check_and_increment_daily_quota(
    db: Session,
    user_id: int,
    feature: str = "pipeline",
    tokens_estimate: int = 1000,
    max_daily_calls: int = MAX_DAILY_LLM_CALLS,
):
    """
    Check if the user has exceeded their daily LLM quota.
    Increments call_count and tokens_used on the llm_usage table.
    """
    today = date.today()

    usage = (
        db.query(LLMUsage)
        .filter(
            LLMUsage.user_id == user_id,
            LLMUsage.date == today,
            LLMUsage.feature == feature,
        )
        .first()
    )

    if usage and usage.call_count >= max_daily_calls:
        raise HTTPException(
            status_code=429,
            detail=f"Daily AI generation quota exceeded ({max_daily_calls} calls/day). Please try again tomorrow.",
        )

    if not usage:
        usage = LLMUsage(
            user_id=user_id,
            date=today,
            feature=feature,
            call_count=1,
            tokens_used=tokens_estimate,
        )
        db.add(usage)
    else:
        usage.call_count += 1
        usage.tokens_used += tokens_estimate

    db.commit()
    return usage
