from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.core.security import oauth2_scheme
from app.models.auth import RefreshTokenRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthRouter:
    def __init__(self):
        self.auth_service = AuthService()

    async def login(
        self,
        form_data: OAuth2PasswordRequestForm = Depends(),
    ):
        return await self.auth_service.login_user(form_data.username, form_data.password)

    async def logout(
        self,
        token: str = Depends(oauth2_scheme),
    ):
        return await self.auth_service.logout_user(token)

    async def logout_all(
        self,
        token: str = Depends(oauth2_scheme),
    ):
        return await self.auth_service.logout_all_sessions(token)

    async def refresh(
        self,
        data: RefreshTokenRequest,
    ):
        return await self.auth_service.refresh_access_token(data.refresh_token)


auth_router = AuthRouter()

router.add_api_route("/login", auth_router.login, methods=["POST"])
router.add_api_route("/logout", auth_router.logout, methods=["POST"])
router.add_api_route("/logout-all", auth_router.logout_all, methods=["POST"])
router.add_api_route("/refresh", auth_router.refresh, methods=["POST"])
