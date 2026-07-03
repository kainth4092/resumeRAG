class AppException(Exception):
    status_code = 500
    default_message = "An unexpected error occurred"

    def __init__(self, message: str | None = None):
        self.message = message or self.default_message
        super().__init__(self.message)


class DatabaseAppException(AppException):
    status_code = 500
    default_message = "Database error occurred."


class ValidationAppException(AppException):
    status_code = 422
    default_message = "Validation error occurred."


class FileUploadAppException(AppException):
    status_code = 400
    default_message = "File upload failed."


class JWTAppException(AppException):
    status_code = 401
    default_message = "Invalid authentication token."


class QdrantAppException(AppException):
    status_code = 503
    default_message = "Vector database service is unavailable."


class AIProviderAppException(AppException):
    status_code = 503
    default_message = "AI provider request failed."


class EmailAppException(AppException):
    status_code = 502
    default_message = "Email delivery failed."


class JobNotFoundException(AppException):
    """Exception raised when a requested job is not found."""

    status_code = 404
    default_message = "Job not found"
