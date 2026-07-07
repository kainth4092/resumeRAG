import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.dashboard.services.dashboard_service import DashboardService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
logger = logging.getLogger(__name__)


@router.get("")
def get_dashboard_data(
    local_hour: int = Query(
        None, description="Client local hour (0-23) for dynamic greeting"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return DashboardService.get_dashboard_data(db, current_user, local_hour)
    except Exception:
        logger.exception("Failed to load dashboard data")
        raise HTTPException(status_code=500, detail="Failed to load dashboard data.")
