from fastapi import APIRouter, Depends
from app.services.auth_service import get_current_user
from app.services.summary_service import SummaryService
from app.models.users import UserOut

router = APIRouter(prefix="/summary", tags=["Summary"])

def get_summary_service():
    return SummaryService()

@router.get("/")
async def get_summary(
    current_user: UserOut = Depends(get_current_user),
    service: SummaryService = Depends(get_summary_service)
):
    return await service.get_user_summary(current_user.id)
