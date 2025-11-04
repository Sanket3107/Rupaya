# app/models/groups.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.users import UserOut

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class GroupOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    created_by: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class GroupMemberOut(BaseModel):
    id: str
    user: UserOut
    role: str
    created_at: datetime

class GroupDetailOut(GroupOut):
    members: List[GroupMemberOut]

class AddMemberRequest(BaseModel):
    email: str  # Add members by email
    role: str = "MEMBER"