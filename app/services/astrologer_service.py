from datetime import datetime, timezone
import json
import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.exceptions import DatabaseError, ResourceNotFoundError
from app.models import Reading, User
from app.schemas import (
    AstrologerReadingDetailResponse,
    AstrologerReadingItemResponse,
    AstrologyInterpretation,
    StructuredReading
)


logger = logging.getLogger("astro_teller.services.astrologer")


def parse_saved_reading(raw_reading: str | None) -> AstrologyInterpretation | StructuredReading | str | None:
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


def list_readings_for_review(db: Session) -> list[AstrologerReadingItemResponse]:
    readings = db.query(Reading).order_by(Reading.created_at.desc()).all()
    
    result = []
    for r in readings:
        result.append(
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
        )
    return result


def get_reading_detail(reading_id: int, db: Session) -> AstrologerReadingDetailResponse:
    reading = db.query(Reading).filter(Reading.id == reading_id).first()
    if not reading:
        raise ResourceNotFoundError(resource="Reading", identifier=reading_id)

    return AstrologerReadingDetailResponse(
        id=reading.id,
        user_id=reading.user_id,
        username=reading.user.username if reading.user else "Unknown",
        user_email=reading.user.email if reading.user else "Unknown",
        birth_year=reading.birth_year,
        birth_month=reading.birth_month,
        birth_date=reading.birth_date,
        birth_hours=reading.birth_hours,
        birth_minutes=reading.birth_minutes,
        latitude=reading.latitude,
        longitude=reading.longitude,
        timezone=reading.timezone,
        zodiac_sign=reading.zodiac_sign,
        moon_sign=reading.moon_sign,
        nakshatra=reading.nakshatra,
        ascendant=reading.ascendant,
        reading=parse_saved_reading(reading.reading_text),
        astrologer_note=reading.astrologer_note,
        reviewed_by=reading.reviewed_by,
        reviewer_username=reading.reviewer.username if reading.reviewer else None,
        reviewed_at=reading.reviewed_at,
        created_at=reading.created_at
    )


def add_astrologer_note(
    reading_id: int,
    note: str,
    reviewer_user: User,
    db: Session
) -> AstrologerReadingDetailResponse:
    reading = db.query(Reading).filter(Reading.id == reading_id).first()
    if not reading:
        raise ResourceNotFoundError(resource="Reading", identifier=reading_id)

    reading.astrologer_note = note
    reading.reviewed_by = reviewer_user.id
    reading.reviewed_at = datetime.now(timezone.utc)

    try:
        db.commit()
        db.refresh(reading)
        logger.info(f"Astrologer user_id={reviewer_user.id} added review note to reading_id={reading.id}")
    except SQLAlchemyError:
        db.rollback()
        logger.exception(f"Database error saving astrologer note for reading_id={reading.id}")
        raise DatabaseError("Failed to save astrologer note to database.")

    return get_reading_detail(reading_id, db)
