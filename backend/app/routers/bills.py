from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.models.bills import BillCreate, BillResponse, BillShareResponse
from app.models.users import UserOut
from app.services.auth_service import get_current_user
from app.services.bill_service import BillService

router = APIRouter(prefix="/bills", tags=["Bills"])


bill_service = BillService()


@router.post("/", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(
    data: BillCreate,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Create a new bill in a group.
    The user must be a member of the group.
    """
    return await bill_service.create_bill(current_user.id, data)



@router.get("/group/{group_id}", response_model=list[BillResponse])
async def get_group_bills(
    group_id: UUID,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Get all bills for a specific group.
    """
    return await bill_service.get_group_bills(current_user.id, str(group_id))


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(
    bill_id: UUID,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Get details of a specific bill.
    """
    return await bill_service.get_bill_details(current_user.id, str(bill_id))


@router.patch("/shares/{share_id}/mark-paid", response_model=BillShareResponse)
async def mark_share_as_paid(
    share_id: UUID,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Mark a bill share as paid.
    Only the user who owes the share can mark it as paid.
    """
    return await bill_service.mark_share_as_paid(current_user.id, str(share_id))


@router.patch("/shares/{share_id}/mark-unpaid", response_model=BillShareResponse)
async def mark_share_as_unpaid(
    share_id: UUID,
    current_user: UserOut = Depends(get_current_user),
):
    """
    Mark a bill share as unpaid (undo payment).
    Only the user who owes the share can mark it as unpaid.
    """
    return await bill_service.mark_share_as_unpaid(current_user.id, str(share_id))


