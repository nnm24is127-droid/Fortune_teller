"""
app/schemas.py

All Pydantic request/response models for AstroTeller.
Uses Pydantic v2 style (model_config = ConfigDict) throughout.
"""

import math
from calendar import monthrange
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=30,
        description="Unique username (3–30 characters)"
    )
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(
        ...,
        min_length=6,
        max_length=128,
        description="Password (6–128 characters)"
    )


class LoginRequest(BaseModel):
    username: str = Field(..., description="Registered username")
    password: str = Field(..., description="Account password")


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT Bearer access token")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class UserResponse(BaseModel):
    """
    Public representation of a user. Safe to return from any authenticated
    endpoint — does NOT include password_hash or any secret material.
    """
    id: int
    username: str
    email: str
    role: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Role management
# ---------------------------------------------------------------------------

class RoleUpdateRequest(BaseModel):
    role: Literal["user", "astrologer", "admin"] = Field(
        ...,
        description="Target role. Allowed values: user, astrologer, admin"
    )


# ---------------------------------------------------------------------------
# Astrology — request
# ---------------------------------------------------------------------------

class KundaliRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100, description="Birth year (1900–2100)")
    month: int = Field(..., ge=1, le=12, description="Birth month (1–12)")
    date: int = Field(..., ge=1, le=31, description="Birth day (1–31)")
    hours: int = Field(..., ge=0, le=23, description="Birth hour in 24h format (0–23)")
    minutes: int = Field(..., ge=0, le=59, description="Birth minute (0–59)")
    latitude: float = Field(
        ..., ge=-90.0, le=90.0,
        description="Birth place latitude (−90 to +90)"
    )
    longitude: float = Field(
        ..., ge=-180.0, le=180.0,
        description="Birth place longitude (−180 to +180)"
    )
    timezone: float = Field(
        ..., ge=-12.0, le=14.0,
        description="UTC offset in hours (e.g. 5.5 for IST)"
    )

    @model_validator(mode="after")
    def validate_calendar_date(self):
        """
        Validates that year/month/date form a real calendar day.
        Catches impossible dates such as February 31 or April 31.
        """
        try:
            max_days = monthrange(self.year, self.month)[1]
            if self.date > max_days:
                raise ValueError(
                    f"Invalid date: Month {self.month} in year {self.year} "
                    f"has at most {max_days} days."
                )
        except Exception as e:
            raise ValueError(str(e))
        return self


# ---------------------------------------------------------------------------
# Astrology — reading content
# ---------------------------------------------------------------------------

class AstrologyProfile(BaseModel):
    zodiac_sign: str
    sun_sign: str
    moon_sign: str
    nakshatra: str
    ascendant: str


class StructuredReading(BaseModel):
    summary: str
    sun_interpretation: str
    moon_interpretation: str
    nakshatra_interpretation: str
    ascendant_interpretation: str
    overall_interpretation: str
    disclaimer: str


class AstrologyInterpretation(BaseModel):
    """
    Human-friendly structured interpretation produced by Gemini AI.
    Translates raw Vedic planetary degrees into actionable, reflective archetypes.
    """
    summary: str = Field(..., description="High-level celestial summary")
    personality: str = Field(..., description="Core personality and emotional temperament")
    strengths: list[str] = Field(default_factory=list, description="Key astrological strengths and gifts")
    areas_for_reflection: list[str] = Field(default_factory=list, description="Growth areas and personal reflection points")
    relationships: str = Field(..., description="Relationship and partnership tendencies")
    career: str = Field(..., description="Work ethic, vocation, and creative drive")
    explanation: str = Field(..., description="Educational explanation of the technical chart placements")
    disclaimer: str = Field(
        default=(
            "AstroTeller interpretations are provided for entertainment, educational, "
            "and self-reflection purposes only. They do not constitute professional advice."
        ),
        description="Legal and entertainment disclaimer"
    )


class ReadingResponse(BaseModel):
    """Full response returned when a new reading is generated."""
    message: str
    reading_id: int
    profile: AstrologyProfile
    reading: Optional[AstrologyInterpretation | StructuredReading | str] = None
    interpretation: Optional[AstrologyInterpretation] = None


# Keep backward-compatible alias used inside the route
ReadingGenerationResponse = ReadingResponse


# ---------------------------------------------------------------------------
# Reading history (user-facing) — paginated
# ---------------------------------------------------------------------------

class ReadingHistoryItemResponse(BaseModel):
    id: int
    zodiac_sign: Optional[str] = None
    moon_sign: Optional[str] = None
    nakshatra: Optional[str] = None
    ascendant: Optional[str] = None
    reading: Optional[AstrologyInterpretation | StructuredReading | str] = None
    interpretation: Optional[AstrologyInterpretation] = None
    astrologer_note: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedReadingHistoryResponse(BaseModel):
    """Paginated list of a user's past readings."""
    items: list[ReadingHistoryItemResponse]
    page: int
    limit: int
    total: int
    pages: int


# Backward-compatible alias (kept so any internal code still works)
class ReadingHistoryResponse(BaseModel):
    count: int
    readings: list[ReadingHistoryItemResponse]


# ---------------------------------------------------------------------------
# Astrologer — review queue (paginated)
# ---------------------------------------------------------------------------

class AstrologerNoteRequest(BaseModel):
    note: str = Field(
        ...,
        min_length=5,
        max_length=2000,
        description="Professional interpretation or observation note (5–2000 characters)"
    )


class AstrologerReadingItemResponse(BaseModel):
    id: int
    user_id: int
    username: str
    zodiac_sign: Optional[str] = None
    moon_sign: Optional[str] = None
    nakshatra: Optional[str] = None
    ascendant: Optional[str] = None
    created_at: datetime
    is_reviewed: bool

    model_config = ConfigDict(from_attributes=True)


class PaginatedAstrologerReadingResponse(BaseModel):
    """Paginated list of readings available for astrologer review."""
    items: list[AstrologerReadingItemResponse]
    page: int
    limit: int
    total: int
    pages: int


class AstrologerReadingDetailResponse(BaseModel):
    id: int
    user_id: int
    username: str
    user_email: str
    birth_year: Optional[int] = None
    birth_month: Optional[int] = None
    birth_date: Optional[int] = None
    birth_hours: Optional[int] = None
    birth_minutes: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[float] = None
    zodiac_sign: Optional[str] = None
    moon_sign: Optional[str] = None
    nakshatra: Optional[str] = None
    ascendant: Optional[str] = None
    reading: Optional[AstrologyInterpretation | StructuredReading | str] = None
    interpretation: Optional[AstrologyInterpretation] = None
    astrologer_note: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewer_username: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Admin — user list (paginated)
# ---------------------------------------------------------------------------

class PaginatedUserListResponse(BaseModel):
    """Paginated list of all users, available to admin role only."""
    items: list[UserResponse]
    page: int
    limit: int
    total: int
    pages: int


# ---------------------------------------------------------------------------
# Error (for OpenAPI documentation)
# ---------------------------------------------------------------------------

class ErrorResponse(BaseModel):
    """Standard error envelope returned by all error handlers."""
    error: str = Field(..., description="Machine-readable error code")
    message: str = Field(..., description="Human-readable error description")
    details: Optional[dict] = Field(
        default=None,
        description="Optional field-level validation details"
    )


# ---------------------------------------------------------------------------
# Shared pagination helper
# ---------------------------------------------------------------------------

def make_pages(total: int, limit: int) -> int:
    """Return total number of pages given a total count and page size."""
    if limit <= 0:
        return 0
    return math.ceil(total / limit)
