from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.models.bills import BillCreate, BillResponse, BillShareResponse
from app.models.users import UserOut
from app.services.auth_service import get_current_user
from app.services.bill_service import BillService

router = APIRouter(prefix="/bills", tags=["bills"])


class BillRouter:
    def __init__(self):
        self.bill_service = BillService()

    async def create_bill(
        self,
        bill_data: BillCreate,
        current_user: UserOut = Depends(get_current_user),
    ):
        """
        Create a new bill in a group.
        The user must be a member of the group.
        """
        return await self.bill_service.create_bill(current_user.id, bill_data)

    async def get_group_bills(
        self,
        group_id: UUID,
        current_user: UserOut = Depends(get_current_user),
    ):
        """
        Get all bills for a specific group.
        """
        return await self.bill_service.get_group_bills(current_user.id, str(group_id))

    async def get_bill(
        self,
        bill_id: UUID,
        current_user: UserOut = Depends(get_current_user),
    ):
        """
        Get details of a specific bill.
        """
        return await self.bill_service.get_bill_details(current_user.id, str(bill_id))

    async def mark_share_paid(
        self,
        share_id: UUID,
        current_user: UserOut = Depends(get_current_user),
    ):
        """
        Mark a bill share as paid.
        Only the user who owes the share can mark it as paid.
        """
        return await self.bill_service.mark_share_as_paid(current_user.id, str(share_id))

    async def mark_share_unpaid(
        self,
        share_id: UUID,
        current_user: UserOut = Depends(get_current_user),
    ):
        """
        Mark a bill share as unpaid (undo payment).
        Only the user who owes the share can mark it as unpaid.
        """
        return await self.bill_service.mark_share_as_unpaid(
            current_user.id, str(share_id)
        )


bill_router = BillRouter()

router.add_api_route(
    "/",
    bill_router.create_bill,
    methods=["POST"],
    response_model=BillResponse,
    status_code=status.HTTP_201_CREATED,
)
router.add_api_route(
    "/group/{group_id}",
    bill_router.get_group_bills,
    methods=["GET"],
    response_model=list[BillResponse],
)
router.add_api_route(
    "/{bill_id}",
    bill_router.get_bill,
    methods=["GET"],
    response_model=BillResponse,
)
router.add_api_route(
    "/shares/{share_id}/mark-paid",
    bill_router.mark_share_paid,
    methods=["PATCH"],
    response_model=BillShareResponse,
)
router.add_api_route(
    "/shares/{share_id}/mark-unpaid",
    bill_router.mark_share_unpaid,
    methods=["PATCH"],
    response_model=BillShareResponse,
)
