# app/services/groups_service.py
from fastapi import HTTPException, status
from app.db import prisma
from app.models.groups import GroupCreate, GroupUpdate, AddMemberRequest
from app.services.auth_service import get_current_user

async def create_group(group_data: GroupCreate, creator_id: str):
    # Create the group
    group = await prisma.group.create(
        data={
            "name": group_data.name,
            "description": group_data.description,
            "created_by": creator_id
        }
    )
    
    # Add creator as admin member
    await prisma.groupmember.create(
        data={
            "user_id": creator_id,
            "group_id": group.id,
            "role": "ADMIN",
            "created_by": creator_id
        }
    )
    
    return group

async def get_user_groups(user_id: str):
    # Get all groups where user is a member
    memberships = await prisma.groupmember.find_many(
        where={
            "user_id": user_id,
            "deleted_at": None
        },
        include={
            "group": {
                "include": {
                    "members": {
                        "include": {
                            "user": True
                        },
                        "where": {
                            "deleted_at": None
                        }
                    }
                }
            }
        }
    )
    
    return [membership.group for membership in memberships]

async def get_group_detail(group_id: str, user_id: str):
    # Verify user has access to this group
    membership = await prisma.groupmember.find_first(
        where={
            "group_id": group_id,
            "user_id": user_id,
            "deleted_at": None
        }
    )
    
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this group"
        )
    
    # Get group with members
    group = await prisma.group.find_unique(
        where={"id": group_id},
        include={
            "members": {
                "include": {
                    "user": True
                },
                "where": {
                    "deleted_at": None
                }
            }
        }
    )
    
    return group

async def add_member_to_group(group_id: str, member_data: AddMemberRequest, added_by_id: str):
    # Verify the adder is an admin of the group
    adder_membership = await prisma.groupmember.find_first(
        where={
            "group_id": group_id,
            "user_id": added_by_id,
            "role": "ADMIN",
            "deleted_at": None
        }
    )
    
    if not adder_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group admins can add members"
        )
    
    # Find user by email
    user_to_add = await prisma.user.find_unique(
        where={"email": member_data.email}
    )
    
    if not user_to_add:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already a member
    existing_member = await prisma.groupmember.find_first(
        where={
            "group_id": group_id,
            "user_id": user_to_add.id,
            "deleted_at": None
        }
    )
    
    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this group"
        )
    
    # Add member
    member = await prisma.groupmember.create(
        data={
            "user_id": user_to_add.id,
            "group_id": group_id,
            "role": member_data.role,
            "created_by": added_by_id
        }
    )
    
    return member

async def remove_member_from_group(group_id: str, member_id: str, removed_by_id: str):
    # Verify the remover is an admin
    remover_membership = await prisma.groupmember.find_first(
        where={
            "group_id": group_id,
            "user_id": removed_by_id,
            "role": "ADMIN",
            "deleted_at": None
        }
    )
    
    if not remover_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group admins can remove members"
        )
    
    # Soft delete the membership
    membership = await prisma.groupmember.update(
        where={"id": member_id},
        data={
            "deleted_at": datetime.utcnow(),
            "deleted_by": removed_by_id
        }
    )
    
    return membership