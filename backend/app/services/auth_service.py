from fastapi import HTTPException, status
from jose import jwt, JWTError
from datetime import datetime, timezone
from app.db import prisma
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.core.redis import redis_client
from app.core.config import settings


async def register_user(name: str, email: str, password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
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

    access_token = create_access_token(
        {"sub": user.id}, 
        token_type="access"
    )
    refresh_token = create_access_token(
        {"sub": user.id}, 
        expires_delta=settings.REFRESH_TOKEN_EXPIRE,
        token_type="refresh"
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


async def logout_user(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        exp = payload.get("exp")
        ttl = exp - int(datetime.now(timezone.utc).timestamp())
        if ttl > 0:
            await redis_client.setex(f"blacklist:{token}", ttl, "1")
        return {"detail": "Logged out successfully"}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid token")


async def logout_all_sessions(token: str):
    user = await get_current_user(token)
    
    # Blacklist current token too
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        exp = payload.get("exp")
        ttl = exp - int(datetime.now(timezone.utc).timestamp())
        if ttl > 0:
            await redis_client.setex(f"blacklist:{token}", ttl, "1")
    except JWTError:
        pass
    
    # Mark all tokens from this user invalid for 24h
    await redis_client.setex(f"revoke_all:{user.id}", 3600 * 24, "1")
    return {"detail": "All sessions revoked"}


async def refresh_access_token(refresh_token: str):
    # Check if refresh token is blacklisted
    if await redis_client.exists(f"blacklist:{refresh_token}"):
        raise HTTPException(status_code=401, detail="Refresh token invalidated")
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        # Check if all sessions revoked
        if await redis_client.exists(f"revoke_all:{user_id}"):
            raise HTTPException(status_code=401, detail="All sessions revoked. Please log in again.")

        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        new_access = create_access_token({"sub": user_id}, token_type="access")
        return {"access_token": new_access, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")


async def change_user_password(token: str, old_password: str, new_password: str):
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    
    user = await get_current_user(token)
    if not verify_password(old_password, user.password):
        raise HTTPException(status_code=400, detail="Old password incorrect")

    hashed_new = hash_password(new_password)
    await prisma.user.update(where={"id": user.id}, data={"password": hashed_new})
    return {"detail": "Password changed successfully"}


async def get_current_user(token: str):
    if await redis_client.exists(f"blacklist:{token}"):
        raise HTTPException(status_code=401, detail="Token invalidated. Please log in again.")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Check global user revocation
        if await redis_client.exists(f"revoke_all:{user_id}"):
            raise HTTPException(status_code=401, detail="Session revoked. Please log in again.")

        user = await prisma.user.find_unique(where={"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")