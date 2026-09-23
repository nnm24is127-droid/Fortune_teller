"""
app/core/exceptions.py

Custom domain exceptions for AstroTeller.
"""

from typing import Any


class AppException(Exception):
    """Base application exception."""
    def __init__(
        self,
        message: str,
        error_code: str = "APPLICATION_ERROR",
        status_code: int = 400,
        details: Any = None
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details


class AuthenticationError(AppException):
    def __init__(self, message: str = "Authentication credentials are required or invalid."):
        super().__init__(
            message=message,
            error_code="UNAUTHORIZED",
            status_code=401
        )


class AuthorizationError(AppException):
    def __init__(self, message: str = "You do not have permission to access this resource."):
        super().__init__(
            message=message,
            error_code="FORBIDDEN",
            status_code=403
        )


class ResourceNotFoundError(AppException):
    def __init__(self, resource: str = "Resource", identifier: Any = ""):
        message = f"{resource} not found." if not identifier else f"{resource} with ID '{identifier}' not found."
        super().__init__(
            message=message,
            error_code="RESOURCE_NOT_FOUND",
            status_code=404
        )


class BadRequestError(AppException):
    def __init__(self, message: str, error_code: str = "BAD_REQUEST", details: Any = None):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=400,
            details=details
        )


class ExternalAPIError(AppException):
    def __init__(
        self,
        message: str = "Astrology service is temporarily unavailable.",
        error_code: str = "ASTROLOGY_SERVICE_ERROR",
        status_code: int = 502
    ):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status_code
        )


class LLMServiceError(ExternalAPIError):
    """Raised when the LLM interpretation provider returns an error or malformed response."""
    def __init__(
        self,
        message: str = "The interpretation service is temporarily unavailable.",
        error_code: str = "LLM_SERVICE_ERROR",
        status_code: int = 502,
        details: Any = None
    ):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status_code
        )
        self.details = details


class LLMTimeoutError(ExternalAPIError):
    """Raised when the LLM service request times out."""
    def __init__(
        self,
        message: str = "The interpretation service timed out. Please try again.",
        error_code: str = "LLM_TIMEOUT",
        status_code: int = 504
    ):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status_code
        )


class LLMConfigurationError(ExternalAPIError):
    """Raised when LLM configuration/credentials are missing or invalid."""
    def __init__(
        self,
        message: str = "Interpretation service is not properly configured.",
        error_code: str = "LLM_CONFIG_ERROR",
        status_code: int = 502
    ):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status_code
        )


class DatabaseError(AppException):
    def __init__(self, message: str = "A database error occurred."):
        super().__init__(
            message=message,
            error_code="DATABASE_ERROR",
            status_code=500
        )
