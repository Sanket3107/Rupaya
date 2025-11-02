from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.models.users import UserCreate, UserLogin, UserOut
from app.services.auth_service import (
    register_user, login_user, logout_user, get_current_user
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


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return current_user
