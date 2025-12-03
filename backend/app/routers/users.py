from fastapi import APIRouter, Depends
from app.models.users import UserCreate, UserOut
from app.models.auth import PasswordChangeRequest
from app.services.user_service import (
    register_user,
    change_user_password,
    get_user_by_id
)
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", response_model=UserOut)
async def register(data: UserCreate):
    return await register_user(data.name, data.email, data.password)

@router.get("/me", response_model=UserOut)
async def get_me(current_user: UserOut = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
async def change_password(
    data: PasswordChangeRequest,
    current_user: UserOut = Depends(get_current_user)
):
    return await change_user_password(current_user.id, data.old_password, data.new_password)
