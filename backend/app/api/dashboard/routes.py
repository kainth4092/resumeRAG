from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.dashboard.services.dashboard_service import DashboardService
from app.models.user import User


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("")
@router.get("/")
def get_dashboard(
    local_hour: int | None = Query(
        default=None,
        ge=0,
        le=23,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return DashboardService.get_dashboard_data(
        db=db,
        current_user=current_user,
        local_hour=local_hour,
    )
