from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import oauth2_scheme
from app.models.auth import RefreshTokenRequest
from app.services.auth_service import (
    login_user,
    logout_all_sessions,
    logout_user,
    refresh_access_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    return await login_user(form_data.username, form_data.password)


@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme)):
    return await logout_user(token)


@router.post("/logout-all")
async def logout_all(token: str = Depends(oauth2_scheme)):
    return await logout_all_sessions(token)


@router.post("/refresh")
async def refresh(data: RefreshTokenRequest):
    return await refresh_access_token(data.refresh_token)
