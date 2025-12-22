from fastapi import APIRouter, Depends

from app.models.groups import (
    AddMemberRequest,
    GroupCreate,
    GroupDetailOut,
    GroupMemberOut,
    GroupOut,
)
from app.models.users import UserOut
from app.services.auth_service import get_current_user
from app.services.group_service import GroupService

router = APIRouter(prefix="/groups", tags=["Groups"])


class GroupRouter:
    def __init__(self):
        self.group_service = GroupService()

    async def create_new_group(
        self,
        group_data: GroupCreate,
        current_user: UserOut = Depends(get_current_user),
    ):
        return await self.group_service.create_group(group_data, current_user.id)

    async def get_my_groups(
        self,
        current_user: UserOut = Depends(get_current_user),
    ):
        return await self.group_service.get_user_groups(current_user.id)

    async def get_group(
        self,
        group_id: str,
        current_user: UserOut = Depends(get_current_user),
    ):
        return await self.group_service.get_group_detail(group_id, current_user.id)

    async def add_member(
        self,
        group_id: str,
        member_data: AddMemberRequest,
        current_user: UserOut = Depends(get_current_user),
    ):
        return await self.group_service.add_member_to_group(
            group_id, member_data, current_user.id
        )

    async def remove_member(
        self,
        group_id: str,
        member_id: str,
        current_user: UserOut = Depends(get_current_user),
    ):
        return await self.group_service.remove_member_from_group(
            group_id, member_id, current_user.id
        )


group_router = GroupRouter()

router.add_api_route(
    "/", group_router.create_new_group, methods=["POST"], response_model=GroupOut
)
router.add_api_route(
    "/", group_router.get_my_groups, methods=["GET"], response_model=list[GroupOut]
)
router.add_api_route(
    "/{group_id}",
    group_router.get_group,
    methods=["GET"],
    response_model=GroupDetailOut,
)
router.add_api_route(
    "/{group_id}/members",
    group_router.add_member,
    methods=["POST"],
    response_model=GroupMemberOut,
)
router.add_api_route(
    "/{group_id}/members/{member_id}",
    group_router.remove_member,
    methods=["DELETE"],
)
