"""
app/routes/astrologer_routes.py

Endpoints for astrologer and admin: review reading queue, inspect readings,
and add professional interpretation notes.
"""

import json
import logging
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.auth import require_roles
from app.database import get_db
from app.models import Reading, User
from app.schemas import (
    AstrologerNoteRequest,
    AstrologerReadingDetailResponse,
    AstrologerReadingItemResponse,
    ErrorResponse,
    PaginatedAstrologerReadingResponse,
    make_pages
)
from app.services.astrologer_service import (
    add_astrologer_note,
    get_reading_detail
)


logger = logging.getLogger("astro_teller.astrologer")

router = APIRouter(
    prefix="/astrologer",
    tags=["Astrologer"]
)

_SORT_FIELD_MAP = {
    "created_at": Reading.created_at,
    "id": Reading.id,
}


@router.get(
    "/readings",
    response_model=PaginatedAstrologerReadingResponse,
    status_code=status.HTTP_200_OK,
    summary="List readings available for review",
    description=(
        "Returns a **paginated** list of all user readings available for professional review. "
        "Accessible by **astrologer** and **admin** roles only. "
        "Use the `is_reviewed` filter to focus on pending or completed reviews."
    ),
    responses={
        200: {"description": "Paginated reading queue", "model": PaginatedAstrologerReadingResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
        403: {"description": "Insufficient permissions (requires astrologer or admin role)", "model": ErrorResponse},
    }
)
def get_readings_queue(
    current_user: User = Depends(require_roles("astrologer", "admin")),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page (1–100)"),
    is_reviewed: Optional[bool] = Query(
        default=None,
        description=(
            "Filter by review status. "
            "`true` = only reviewed readings, `false` = only unreviewed, "
            "`omit` = all readings."
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
    query = db.query(Reading)

    # --- Filter by review status ---
    if is_reviewed is True:
        query = query.filter(Reading.astrologer_note.isnot(None))
    elif is_reviewed is False:
        query = query.filter(Reading.astrologer_note.is_(None))

    # --- Sorting (whitelist-validated) ---
    sort_column = _SORT_FIELD_MAP[sort]
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # --- Pagination ---
    total = query.count()
    offset = (page - 1) * limit
    readings = query.offset(offset).limit(limit).all()

    items = [
        AstrologerReadingItemResponse(
            id=r.id,
            user_id=r.user_id,
            username=r.user.username if r.user else "Unknown",
            zodiac_sign=r.zodiac_sign,
            moon_sign=r.moon_sign,
            nakshatra=r.nakshatra,
            ascendant=r.ascendant,
            created_at=r.created_at,
            is_reviewed=bool(r.astrologer_note)
        )
        for r in readings
    ]

    return PaginatedAstrologerReadingResponse(
        items=items,
        page=page,
        limit=limit,
        total=total,
        pages=make_pages(total, limit)
    )


@router.get(
    "/readings/{reading_id}",
    response_model=AstrologerReadingDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get full reading detail for review",
    description=(
        "Returns all details of a specific reading including birth data, astrology profile, "
        "and any existing astrologer note. Accessible by **astrologer** and **admin** roles only."
    ),
    responses={
        200: {"description": "Reading detail", "model": AstrologerReadingDetailResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
        403: {"description": "Insufficient permissions", "model": ErrorResponse},
        404: {"description": "Reading not found", "model": ErrorResponse},
    }
)
def get_reading_by_id(
    reading_id: int,
    current_user: User = Depends(require_roles("astrologer", "admin")),
    db: Session = Depends(get_db)
):
    return get_reading_detail(reading_id, db)


@router.patch(
    "/readings/{reading_id}/note",
    response_model=AstrologerReadingDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Add or update astrologer interpretation note",
    description=(
        "Adds or replaces the professional interpretation note on a reading. "
        "Records the reviewing astrologer's identity and timestamp. "
        "Accessible by **astrologer** and **admin** roles only."
    ),
    responses={
        200: {"description": "Note saved, updated reading returned", "model": AstrologerReadingDetailResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
        403: {"description": "Insufficient permissions", "model": ErrorResponse},
        404: {"description": "Reading not found", "model": ErrorResponse},
        422: {"description": "Note is too short or too long", "model": ErrorResponse},
    }
)
def update_reading_note(
    reading_id: int,
    data: AstrologerNoteRequest,
    current_user: User = Depends(require_roles("astrologer", "admin")),
    db: Session = Depends(get_db)
):
    return add_astrologer_note(
        reading_id=reading_id,
        note=data.note,
        reviewer_user=current_user,
        db=db
    )
