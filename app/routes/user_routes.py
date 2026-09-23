"""
app/routes/user_routes.py

User profile endpoints.
"""

from fastapi import APIRouter, Depends, status

from app.auth import get_current_user
from app.models import User
from app.schemas import ErrorResponse, UserResponse


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description=(
        "Returns the profile of the currently authenticated user. "
        "Requires a valid JWT Bearer token. "
        "Available to all roles: **user**, **astrologer**, and **admin**."
    ),
    responses={
        200: {"description": "User profile returned", "model": UserResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
    }
)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user
