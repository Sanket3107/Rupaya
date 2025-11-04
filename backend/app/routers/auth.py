from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.users import UserCreate, UserOut
from app.models.auth import RefreshTokenRequest, PasswordChangeRequest
from app.services.auth_service import (
    register_user,
    login_user,
    logout_user,
    logout_all_sessions,
    refresh_access_token,
    change_user_password,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Auth"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post("/register", response_model=UserOut)
async def register(data: UserCreate):
    return await register_user(data.name, data.email, data.password)


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


@router.post("/change-password")
async def change_password(
    data: PasswordChangeRequest,
    token: str = Depends(oauth2_scheme)
):
    return await change_user_password(token, data.old_password, data.new_password)


@router.get("/me", response_model=UserOut)
async def get_me(token: str = Depends(oauth2_scheme)):
    return await get_current_user(token)