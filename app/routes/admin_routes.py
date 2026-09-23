"""
app/routes/admin_routes.py

Admin-only endpoints for user management. Requires the 'admin' role.
"""

import logging
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.auth import require_roles
from app.core.exceptions import BadRequestError, DatabaseError, ResourceNotFoundError
from app.database import get_db
from app.models import User
from app.schemas import (
    ErrorResponse,
    PaginatedUserListResponse,
    RoleUpdateRequest,
    UserResponse,
    make_pages
)


logger = logging.getLogger("astro_teller.admin")

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

_SORT_FIELD_MAP = {
    "created_at": User.created_at,
    "id": User.id,
    "username": User.username,
}


@router.get(
    "/users",
    response_model=PaginatedUserListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all users",
    description=(
        "Returns a **paginated** list of all registered users. "
        "Supports search by `username` or `email`. "
        "Accessible by **admin** role only."
    ),
    responses={
        200: {"description": "Paginated user list", "model": PaginatedUserListResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
        403: {"description": "Admin role required", "model": ErrorResponse},
    }
)
def get_users(
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db),
    page: int = Query(default=1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page (1–100)"),
    search: Optional[str] = Query(
        default=None,
        max_length=100,
        description="Search by username or email (case-insensitive partial match)"
    ),
    sort: Literal["id", "username", "created_at"] = Query(
        default="id",
        description="Field to sort by. Allowed: id, username, created_at"
    ),
    order: Literal["asc", "desc"] = Query(
        default="asc",
        description="Sort direction. Allowed: asc, desc"
    )
):
    logger.info(
        f"Admin user_id={current_user.id} requested user list "
        f"[page={page}, limit={limit}, search={search!r}, sort={sort}, order={order}]"
    )

    query = db.query(User)

    # --- Safe search using SQLAlchemy ilike (parameterised, not raw SQL) ---
    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.username.ilike(pattern),
                User.email.ilike(pattern)
            )
        )

    # --- Sorting (whitelist-validated via Literal type) ---
    sort_column = _SORT_FIELD_MAP[sort]
    if order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # --- Pagination (database-level LIMIT/OFFSET) ---
    total = query.count()
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()

    items = [UserResponse.model_validate(u) for u in users]

    return PaginatedUserListResponse(
        items=items,
        page=page,
        limit=limit,
        total=total,
        pages=make_pages(total, limit)
    )


@router.get(
    "/users/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user by ID",
    description=(
        "Returns the full profile of a specific user by their numeric ID. "
        "Accessible by **admin** role only."
    ),
    responses={
        200: {"description": "User profile", "model": UserResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
        403: {"description": "Admin role required", "model": ErrorResponse},
        404: {"description": "User not found", "model": ErrorResponse},
    }
)
def get_user_by_id(
    user_id: int,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError(resource="User", identifier=user_id)
    return user


@router.patch(
    "/users/{user_id}/role",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a user's role",
    description=(
        "Changes the role of a user to `user`, `astrologer`, or `admin`. "
        "Cannot demote the **sole remaining admin** to protect system integrity. "
        "Accessible by **admin** role only."
    ),
    responses={
        200: {"description": "Updated user profile", "model": UserResponse},
        400: {"description": "Cannot demote the only admin", "model": ErrorResponse},
        401: {"description": "Not authenticated", "model": ErrorResponse},
        403: {"description": "Admin role required", "model": ErrorResponse},
        404: {"description": "User not found", "model": ErrorResponse},
        422: {"description": "Invalid role value", "model": ErrorResponse},
    }
)
def update_user_role(
    user_id: int,
    data: RoleUpdateRequest,
    current_user: User = Depends(require_roles("admin")),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ResourceNotFoundError(resource="User", identifier=user_id)

    if user.id == current_user.id and data.role != "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            logger.warning(
                f"Admin user_id={current_user.id} attempted to demote the sole admin"
            )
            raise BadRequestError(
                message="Cannot demote the only remaining admin in the system.",
                error_code="ADMIN_DEMOTION_RESTRICTED"
            )

    old_role = user.role
    user.role = data.role
    try:
        db.commit()
        db.refresh(user)
        logger.info(
            f"Admin user_id={current_user.id} changed user_id={user.id} "
            f"role from '{old_role}' to '{user.role}'"
        )
    except SQLAlchemyError:
        db.rollback()
        logger.exception(f"Database error updating role for user_id={user.id}")
        raise DatabaseError("Failed to update user role in database.")

    return user
