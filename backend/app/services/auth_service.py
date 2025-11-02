from fastapi import HTTPException, status
from app.db import prisma
from app.core.security import hash_password, verify_password, create_access_token
from app.core.redis import redis_client
from app.core.config import settings
from jose import jwt, JWTError
from datetime import datetime

async def register_user(name: str, email: str, password: str):
    existing = await prisma.user.find_unique(where={"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(password)
    user = await prisma.user.create(
        data={"name": name, "email": email, "password": hashed_pw}
    )
    return user

async def login_user(email: str, password: str):
    user = await prisma.user.find_unique(where={"email": email})
    if not user or not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer"}

async def logout_user(token: str):
    """Blacklist the token in Redis."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        exp = payload.get("exp")
        ttl = exp - int(datetime.utcnow().timestamp())  # seconds till expiry
        if ttl > 0:
            await redis_client.setex(f"blacklist:{token}", ttl, "1")
        return {"detail": "Logged out successfully"}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")

async def get_current_user(token: str):
    """Validate token and ensure it's not blacklisted."""
    # Check if token blacklisted
    if await redis_client.exists(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token invalidated. Please log in again.")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


