from fastapi import APIRouter, Depends

from app.models.auth import PasswordChangeRequest
from app.models.users import UserCreate, UserOut
from app.services.auth_service import get_current_user
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


class UserRouter:
    def __init__(self):
        self.user_service = UserService()

    async def register(
        self,
        data: UserCreate,
    ):
        return await self.user_service.register_user(data.name, data.email, data.password)

    async def get_me(self, current_user: UserOut = Depends(get_current_user)):
        return current_user

    async def change_password(
        self,
        data: PasswordChangeRequest,
        current_user: UserOut = Depends(get_current_user),
    ):
        return await self.user_service.change_user_password(
            current_user.id, data.old_password, data.new_password
        )


user_router = UserRouter()


router.add_api_route(
    "/register", user_router.register, methods=["POST"], response_model=UserOut
)
router.add_api_route(
    "/me", user_router.get_me, methods=["GET"], response_model=UserOut
)
router.add_api_route(
    "/change-password", user_router.change_password, methods=["POST"]
)
