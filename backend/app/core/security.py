from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
import bcrypt
from app.core.config import settings


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password"""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8"),
    )


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
    token_type: str = "access",
):
    """Create a JWT access or refresh token."""
    to_encode = data.copy()
    to_encode["type"] = token_type  # Explicitly tag type: "access" or "refresh"

    # Pick correct expiry automatically if not provided
    if expires_delta is None:
        if token_type == "refresh":
            expires_delta = getattr(settings, "REFRESH_TOKEN_EXPIRE", timedelta(days=7))
        else:
            expires_delta = getattr(settings, "ACCESS_TOKEN_EXPIRE", timedelta(minutes=30))

    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_token(token: str) -> dict | None:
    """Decode and validate a JWT. Returns payload or None."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None