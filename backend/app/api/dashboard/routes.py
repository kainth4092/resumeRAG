from fastapi import APIRouter, Depends, Query, HTTPException, Path
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.dashboard.services.dashboard_service import DashboardService
from app.models.user import User
from app.models.dashboard_task import DashboardTask
from app.schemas.dashboard import DashboardResponse, DashboardTaskSchema, DashboardTaskCreate


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("", response_model=DashboardResponse)
@router.get("/", response_model=DashboardResponse)
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


@router.get("/tasks", response_model=list[DashboardTaskSchema])
def get_dashboard_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tasks = (
        db.query(DashboardTask)
        .filter(DashboardTask.user_id == current_user.id)
        .order_by(DashboardTask.created_at.asc())
        .all()
    )
    return [
        DashboardTaskSchema(
            id=t.id,
            text=t.text,
            done=bool(t.done),
            created_at=t.created_at.isoformat() if t.created_at else None,
        )
        for t in tasks
    ]


@router.post("/tasks", response_model=DashboardTaskSchema)
def create_dashboard_task(
    payload: DashboardTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    clean_text = payload.text.strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Task text cannot be empty.")
    task = DashboardTask(
        user_id=current_user.id,
        text=clean_text[:255],
        done=False,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return DashboardTaskSchema(
        id=task.id,
        text=task.text,
        done=bool(task.done),
        created_at=task.created_at.isoformat() if task.created_at else None,
    )


@router.patch("/tasks/{task_id}", response_model=DashboardTaskSchema)
def toggle_dashboard_task(
    task_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(DashboardTask)
        .filter(DashboardTask.id == task_id, DashboardTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    task.done = not task.done
    db.commit()
    db.refresh(task)
    return DashboardTaskSchema(
        id=task.id,
        text=task.text,
        done=bool(task.done),
        created_at=task.created_at.isoformat() if task.created_at else None,
    )


@router.delete("/tasks/{task_id}")
def delete_dashboard_task(
    task_id: int = Path(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(DashboardTask)
        .filter(DashboardTask.id == task_id, DashboardTask.user_id == current_user.id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

