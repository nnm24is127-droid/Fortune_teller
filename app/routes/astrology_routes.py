"""
app/routes/astrology_routes.py

Astrology reading generation and history endpoints.
"""

import json
import logging
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.auth import get_current_user
from app.core.exceptions import DatabaseError
from app.database import get_db
from app.models import Reading, User
from app.schemas import (
    AstrologyInterpretation,
    ErrorResponse,
    KundaliRequest,
    PaginatedReadingHistoryResponse,
    ReadingGenerationResponse,
    ReadingHistoryItemResponse,
    StructuredReading,
    make_pages
)
from app.services.astrology_service import generate_reading_for_birth_data


logger = logging.getLogger("astro_teller.astrology")

router = APIRouter(
    prefix="/astrology",
    tags=["Astrology"]
)

# Whitelisted sort fields — NEVER pass arbitrary user input to SQLAlchemy
_SORT_FIELD_MAP = {
    "created_at": Reading.created_at,
    "id": Reading.id,
}


def parse_saved_reading(raw_reading: Optional[str]) -> Optional[AstrologyInterpretation | StructuredReading | str]:
    """Deserialize a stored JSON reading string into an AstrologyInterpretation or StructuredReading."""
    if not raw_reading:
        return None
    try:
        data = json.loads(raw_reading)
        if isinstance(data, dict):
            if "personality" in data:
                return AstrologyInterpretation(**data)
            elif "sun_interpretation" in data:
                return StructuredReading(**data)
        return raw_reading
    except Exception:
        return raw_reading


@router.post(
    "/reading",
    response_model=ReadingGenerationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate an astrology reading",
    description=(
        "Submits birth details to the Navamsha Astrology API and generates a structured "
        "astrology profile and interpretation. The reading is persisted to the database "
        "and returned in a single response. Requires authentication."
    ),
    responses={
        201: {"description": "Reading generated and saved", "model": ReadingGenerationResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
        422: {"description": "Invalid birth data (e.g. Feb 31, out-of-range coordinates)", "model": ErrorResponse},
        502: {"description": "External astrology service error or timeout", "model": ErrorResponse},
    }
)
def create_reading(
    data: KundaliRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logger.info(f"Reading generation requested by user_id={current_user.id}")

    profile, structured_reading = generate_reading_for_birth_data(
        year=data.year,
        month=data.month,
        date=data.date,
        hours=data.hours,
        minutes=data.minutes,
        latitude=data.latitude,
        longitude=data.longitude,
        timezone=data.timezone
    )

    serialized_reading = json.dumps(structured_reading.model_dump())

    reading = Reading(
        user_id=current_user.id,
        birth_year=data.year,
        birth_month=data.month,
        birth_date=data.date,
        birth_hours=data.hours,
        birth_minutes=data.minutes,
        latitude=data.latitude,
        longitude=data.longitude,
        timezone=data.timezone,
        zodiac_sign=profile.zodiac_sign,
        moon_sign=profile.moon_sign,
        nakshatra=profile.nakshatra,
        ascendant=profile.ascendant,
        reading_text=serialized_reading
    )

    try:
        db.add(reading)
        db.commit()
        db.refresh(reading)
        logger.info(
            f"Reading saved successfully: reading_id={reading.id}, user_id={current_user.id}"
        )
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Database error while persisting reading")
        raise DatabaseError("Failed to store generated reading in database.")

    return ReadingGenerationResponse(
        message="Reading generated successfully 🔮",
        reading_id=reading.id,
        profile=profile,
        reading=structured_reading,
        interpretation=structured_reading if isinstance(structured_reading, AstrologyInterpretation) else None
    )


@router.get(
    "/history",
    response_model=PaginatedReadingHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get your reading history",
    description=(
        "Returns a **paginated** list of your own astrology readings, newest first by default. "
        "You can only see your own readings — never another user's. "
        "Supports optional filtering by `moon_sign` and sorting by `created_at` or `id`."
    ),
    responses={
        200: {"description": "Paginated reading history", "model": PaginatedReadingHistoryResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
    }
)
def get_reading_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(default=10, ge=1, le=100, description="Items per page (1–100)"),
    moon_sign: Optional[str] = Query(
        default=None,
        description=(
            "Filter readings by moon sign (e.g. Aries, Taurus). "
            "Useful for exploring how your emotional landscape has evolved."
        )
    ),
    sort: Literal["created_at", "id"] = Query(
        default="created_at",
        description="Field to sort by. Allowed: created_at, id"
    ),
    order: Literal["asc", "desc"] = Query(
        default="desc",
        description="Sort direction. Allowed: asc, desc"
    )
):
    logger.debug(
        f"User user_id={current_user.id} requested reading history "
        f"[page={page}, limit={limit}, moon_sign={moon_sign}, sort={sort}, order={order}]"
    )

    # Build base query — always scoped to the current user (security enforced here)
    query = db.query(Reading).filter(Reading.user_id == current_user.id)

    # --- Filtering ---
    if moon_sign:
        query = query.filter(Reading.moon_sign.ilike(moon_sign.strip()))

    # --- Sorting (whitelist-validated via Literal type) ---
    sort_column = _SORT_FIELD_MAP[sort]
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # --- Pagination (database-level LIMIT/OFFSET) ---
    total = query.count()
    offset = (page - 1) * limit
    readings = query.offset(offset).limit(limit).all()

    items = []
    for r in readings:
        parsed = parse_saved_reading(r.reading_text)
        interp = parsed if isinstance(parsed, AstrologyInterpretation) else None
        items.append(
            ReadingHistoryItemResponse(
                id=r.id,
                zodiac_sign=r.zodiac_sign,
                moon_sign=r.moon_sign,
                nakshatra=r.nakshatra,
                ascendant=r.ascendant,
                reading=parsed,
                interpretation=interp,
                astrologer_note=r.astrologer_note,
                reviewed_at=r.reviewed_at,
                created_at=r.created_at
            )
        )

    return PaginatedReadingHistoryResponse(
        items=items,
        page=page,
        limit=limit,
        total=total,
        pages=make_pages(total, limit)
    )
