from pydantic import BaseModel, Field


class KundaliRequest(BaseModel):
    year: int = Field(..., ge=1900, le=2100)
    month: int = Field(..., ge=1, le=12)
    date: int = Field(..., ge=1, le=31)

    hours: int = Field(..., ge=0, le=23)
    minutes: int = Field(..., ge=0, le=59)

    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

    timezone: float = Field(..., ge=-12, le=14)