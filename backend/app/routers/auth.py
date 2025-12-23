from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import oauth2_scheme
from app.models.auth import RefreshTokenRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


auth_service = AuthService()


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    return await auth_service.login_user(form_data.username, form_data.password)


@router.post("/logout")
async def logout(
    token: str = Depends(oauth2_scheme),
):
    return await auth_service.logout_user(token)


@router.post("/logout-all")
async def logout_all(
    token: str = Depends(oauth2_scheme),
):
    return await auth_service.logout_all_sessions(token)


@router.post("/refresh")
async def refresh(
    data: RefreshTokenRequest,
):
    return await auth_service.refresh_access_token(data.refresh_token)

