from datetime import datetime, timedelta, timezone
import logging

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.config import SECRET_KEY
from app.core.exceptions import AuthenticationError, AuthorizationError
from app.database import get_db
from app.models import User


logger = logging.getLogger("astro_teller.auth")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        logger.debug("Authentication failed: Missing Bearer token header")
        raise AuthenticationError("Authentication token is missing.")

    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("Authentication failed: JWT missing subject claim")
            raise AuthenticationError("Invalid token: Subject claim is missing.")
    except JWTError as e:
        logger.warning(f"Authentication failed: Invalid/expired JWT ({type(e).__name__})")
        raise AuthenticationError("Invalid or expired authentication token.")

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if user is None:
        logger.warning(f"Authentication failed: User id={user_id} not found in database")
        raise AuthenticationError("User associated with this token no longer exists.")

    logger.debug(f"User authenticated successfully: user_id={user.id}, role={user.role}")
    return user


def require_roles(*allowed_roles: str):
    def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.role not in allowed_roles:
            logger.warning(
                f"Authorization denied for user_id={current_user.id} (role={current_user.role}). "
                f"Required one of: {allowed_roles}"
            )
            raise AuthorizationError("You do not have permission to access this resource.")
        return current_user

    return role_checker