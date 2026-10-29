import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse
from app.core.config import settings

logger = logging.getLogger("app.security.middleware")

CSP_HEADER_VALUE = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com; "
    "img-src 'self' data: https:; "
    "connect-src 'self' https: ws: wss:; "
    "frame-src https://accounts.google.com; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self';"
)


class SecurityAndObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Request ID Generation / Propagation
        req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = req_id

        # 2. Content-Length Limit (Body size limit)
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length_val = int(content_length)
                if length_val > settings.MAX_REQUEST_BODY_SIZE:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": f"Request body too large. Maximum allowed size is {settings.MAX_REQUEST_BODY_SIZE // (1024 * 1024)}MB.",
                            "error_code": "PAYLOAD_TOO_LARGE",
                        },
                        headers={"X-Request-ID": req_id},
                    )
            except (ValueError, TypeError):
                pass

        # 3. Request timing & execution
        start_time = time.perf_counter()
        try:
            response: Response = await call_next(request)
        except Exception:
            # Let FastAPI exception handlers process it
            raise
        finally:
            duration_ms = (time.perf_counter() - start_time) * 1000
            # 4. Slow Request Logging (> 1500ms)
            if duration_ms > 1500 and not request.url.path.startswith("/api/pipeline"):
                user_id = getattr(request.state, "user_id", None)
                logger.warning(
                    "[SLOW_REQUEST] %s %s took %.2fms (request_id=%s, user_id=%s)",
                    request.method,
                    request.url.path,
                    duration_ms,
                    req_id,
                    user_id or "anonymous",
                )

        # 5. Security Headers
        response.headers["X-Request-ID"] = req_id
        response.headers["Content-Security-Policy"] = CSP_HEADER_VALUE
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["X-XSS-Protection"] = "1; mode=block"

        return response
