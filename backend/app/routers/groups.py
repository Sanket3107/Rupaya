# app/routers/groups.py
from fastapi import APIRouter, Depends, HTTPException
from app.models.groups import (
    GroupCreate, GroupUpdate, GroupOut, GroupDetailOut, 
    GroupMemberOut, AddMemberRequest
)
from app.services.group_service import (
    create_group,
    get_user_groups,
    get_group_detail,
    add_member_to_group,
    remove_member_from_group
)
from app.services.auth_service import get_current_user
from app.models.users import UserOut

router = APIRouter(prefix="/groups", tags=["Groups"])

@router.post("/", response_model=GroupOut)
async def create_new_group(
    group_data: GroupCreate,
    current_user: UserOut = Depends(get_current_user)
):
    return await create_group(group_data, current_user.id)

@router.get("/", response_model=list[GroupOut])
async def get_my_groups(current_user: UserOut = Depends(get_current_user)):
    return await get_user_groups(current_user.id)

@router.get("/{group_id}", response_model=GroupDetailOut)
async def get_group(
    group_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    return await get_group_detail(group_id, current_user.id)

@router.post("/{group_id}/members", response_model=GroupMemberOut)
async def add_member(
    group_id: str,
    member_data: AddMemberRequest,
    current_user: UserOut = Depends(get_current_user)
):
    return await add_member_to_group(group_id, member_data, current_user.id)

@router.delete("/{group_id}/members/{member_id}")
async def remove_member(
    group_id: str,
    member_id: str,
    current_user: UserOut = Depends(get_current_user)
):
    return await remove_member_from_group(group_id, member_id, current_user.id)