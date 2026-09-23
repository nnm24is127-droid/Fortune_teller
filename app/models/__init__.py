from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    username = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )
    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )
    password_hash = Column(
        String,
        nullable=False
    )
    role = Column(
        String,
        default="user",
        nullable=False
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    readings = relationship(
        "Reading",
        foreign_keys="Reading.user_id",
        back_populates="user"
    )
    reviewed_readings = relationship(
        "Reading",
        foreign_keys="Reading.reviewed_by",
        back_populates="reviewer"
    )


class Reading(Base):
    __tablename__ = "readings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    birth_year = Column(Integer)
    birth_month = Column(Integer)
    birth_date = Column(Integer)

    birth_hours = Column(Integer)
    birth_minutes = Column(Integer)

    latitude = Column(Float)
    longitude = Column(Float)
    timezone = Column(Float)

    zodiac_sign = Column(String)
    moon_sign = Column(String)
    nakshatra = Column(String)
    ascendant = Column(String)

    reading_text = Column(Text)

    # Astrologer Review Fields
    astrologer_note = Column(Text, nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="readings"
    )
    reviewer = relationship(
        "User",
        foreign_keys=[reviewed_by],
        back_populates="reviewed_readings"
    )


__all__ = ["User", "Reading"]
