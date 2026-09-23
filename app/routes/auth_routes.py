"""
app/routes/auth_routes.py

Authentication endpoints: registration and login.
"""

import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.auth import (
    create_access_token,
    hash_password,
    verify_password
)
from app.core.exceptions import AuthenticationError, BadRequestError, DatabaseError
from app.database import get_db
from app.models import User
from app.schemas import (
    ErrorResponse,
    LoginRequest,
    RegisterRequest,
    TokenResponse
)


logger = logging.getLogger("astro_teller.auth")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description=(
        "Creates a new user account with the **user** role and immediately returns "
        "a JWT access token. Fails with `400` if the username or email is already taken."
    ),
    responses={
        201: {"description": "User registered successfully", "model": TokenResponse},
        400: {"description": "Username or email already exists", "model": ErrorResponse},
        422: {"description": "Validation error (e.g. invalid email, short password)", "model": ErrorResponse},
    }
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.username == data.username
    ).first()

    if existing_user:
        logger.warning(f"Registration failed: Duplicate username='{data.username}'")
        raise BadRequestError(
            message="Username already exists.",
            error_code="USERNAME_EXISTS"
        )

    existing_email = db.query(User).filter(
        User.email == data.email
    ).first()

    if existing_email:
        logger.warning(f"Registration failed: Duplicate email='{data.email}'")
        raise BadRequestError(
            message="Email already exists.",
            error_code="EMAIL_EXISTS"
        )

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        role="user"
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(
            f"User registration successful: user_id={user.id}, username='{user.username}'"
        )
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Database error during user registration")
        raise DatabaseError("Failed to save new user to database.")

    token = create_access_token(user.id, user.role)

    return TokenResponse(access_token=token, token_type="bearer")


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Log in and receive a JWT token",
    description=(
        "Authenticates with a username and password. "
        "Returns a JWT Bearer token valid for **60 minutes**. "
        "Use the token in the `Authorization: Bearer <token>` header for protected endpoints."
    ),
    responses={
        200: {"description": "Login successful", "model": TokenResponse},
        401: {"description": "Invalid username or password", "model": ErrorResponse},
    }
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user or not verify_password(data.password, user.password_hash):
        logger.warning(f"Failed login attempt for username='{data.username}'")
        raise AuthenticationError("Invalid username or password.")

    logger.info(f"User login successful: user_id={user.id}, role={user.role}")

    token = create_access_token(user.id, user.role)

    return TokenResponse(access_token=token, token_type="bearer")
