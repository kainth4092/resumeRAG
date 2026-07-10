import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user_roadmap import UserRoadmap
from app.schemas.roadmap import RoadmapTargetUpdate, RoadmapTaskToggle
from app.services.roadmap.roadmap_service import generate_personalized_roadmap
from app.services.notification_service import create_notification

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/roadmap",
    tags=["Career Roadmap"],
)


def _get_or_create_user_roadmap(
    db: Session,
    current_user,
) -> UserRoadmap:
    """
    Return the authenticated user's roadmap settings.

    If no roadmap exists yet, create one using safe defaults.
    """

    roadmap = (
        db.query(UserRoadmap).filter(UserRoadmap.user_id == current_user.id).first()
    )

    if roadmap:
        return roadmap

    roadmap = UserRoadmap(
        user_id=current_user.id,
        target_role="Software Engineer",
        target_level="Junior",
        completed_tasks=[],
    )

    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    return roadmap


def _get_completed_task_ids(roadmap: UserRoadmap) -> set[str]:
    """
    Safely return persisted completed task IDs.
    """

    completed_tasks = roadmap.completed_tasks or []

    if not isinstance(completed_tasks, list):
        return set()

    return {str(task_id) for task_id in completed_tasks if task_id}


def _apply_completed_tasks(
    roadmap_data: dict[str, Any],
    completed_task_ids: set[str],
) -> dict[str, Any]:
    """
    Apply persisted completion state to generated roadmap tasks.

    Only task IDs that still exist in the current generated roadmap
    are marked completed.
    """

    valid_task_ids = set()

    for phase in roadmap_data.get("roadmap", []):
        for task in phase.get("tasks", []):
            task_id = str(task.get("id", ""))

            if not task_id:
                continue

            valid_task_ids.add(task_id)

            task["completed"] = task_id in completed_task_ids

    roadmap_data["completed_tasks"] = sorted(
        completed_task_ids.intersection(valid_task_ids)
    )

    return roadmap_data


def _generate_user_roadmap_response(
    current_user,
    user_roadmap: UserRoadmap,
) -> dict[str, Any]:
    """
    Generate the complete personalized roadmap response and restore
    valid persisted task completion state.
    """

    roadmap_data = generate_personalized_roadmap(
        current_user=current_user,
        target_role=user_roadmap.target_role,
        target_level=user_roadmap.target_level,
    )

    completed_task_ids = _get_completed_task_ids(user_roadmap)

    return _apply_completed_tasks(
        roadmap_data=roadmap_data,
        completed_task_ids=completed_task_ids,
    )


@router.get("")
def get_career_roadmap(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Return the authenticated user's personalized career roadmap.
    """

    try:
        user_roadmap = _get_or_create_user_roadmap(
            db=db,
            current_user=current_user,
        )

        return _generate_user_roadmap_response(
            current_user=current_user,
            user_roadmap=user_roadmap,
        )

    except ValueError as exc:
        logger.warning(
            "Roadmap configuration error for user_id=%s: %s",
            current_user.id,
            exc,
        )

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        logger.exception(
            "Failed to generate roadmap for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "We couldn't generate your career roadmap right now. "
                "Please try again."
            ),
        ) from exc


@router.put("/target")
def update_roadmap_target(
    payload: RoadmapTargetUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Update target role and/or target level, then immediately return
    a newly generated personalized roadmap.

    Completion state is preserved only for task IDs that still exist
    in the newly generated roadmap.
    """

    try:
        user_roadmap = _get_or_create_user_roadmap(
            db=db,
            current_user=current_user,
        )

        if payload.target_role is not None:
            target_role = payload.target_role.strip()

            if not target_role:
                raise HTTPException(
                    status_code=422,
                    detail="Target role cannot be empty.",
                )

            user_roadmap.target_role = target_role

        if payload.target_level is not None:
            target_level = payload.target_level.strip()

            if not target_level:
                raise HTTPException(
                    status_code=422,
                    detail="Target level cannot be empty.",
                )

            user_roadmap.target_level = target_level

        # Validate the new role/level before committing.
        generated_data = generate_personalized_roadmap(
            current_user=current_user,
            target_role=user_roadmap.target_role,
            target_level=user_roadmap.target_level,
        )

        completed_task_ids = _get_completed_task_ids(user_roadmap)

        generated_data = _apply_completed_tasks(
            roadmap_data=generated_data,
            completed_task_ids=completed_task_ids,
        )

        # Remove task completion IDs that no longer exist in the new roadmap.
        user_roadmap.completed_tasks = generated_data.get(
            "completed_tasks",
            [],
        )

        db.add(user_roadmap)
        db.commit()
        db.refresh(user_roadmap)

        create_notification(
            db=db,
            user_id=current_user.id,
            title="Career roadmap updated",
            message=(
                f"Your career roadmap for {user_roadmap.target_level} "
                f"{user_roadmap.target_role} has been updated successfully."
            ),
            notification_type="roadmap",
            action_url="/roadmap",
        )

        return generated_data

    except HTTPException:
        db.rollback()
        raise

    except ValueError as exc:
        db.rollback()

        logger.warning(
            "Invalid roadmap target for user_id=%s: %s",
            current_user.id,
            exc,
        )

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Failed to update roadmap target for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "We couldn't update your career target right now. " "Please try again."
            ),
        ) from exc


@router.post("/toggle-task")
def toggle_roadmap_task(
    payload: RoadmapTaskToggle,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        user_roadmap = _get_or_create_user_roadmap(
            db=db,
            current_user=current_user,
        )

        task_id = payload.task_id.strip()

        if not task_id:
            raise HTTPException(
                status_code=422,
                detail="Task ID is required.",
            )

        roadmap_data = generate_personalized_roadmap(
            current_user=current_user,
            target_role=user_roadmap.target_role,
            target_level=user_roadmap.target_level,
        )

        valid_task_ids = {
            str(task["id"])
            for phase in roadmap_data.get("roadmap", [])
            for task in phase.get("tasks", [])
            if task.get("id")
        }

        if task_id not in valid_task_ids:
            raise HTTPException(
                status_code=404,
                detail="This task does not exist in your current roadmap.",
            )

        completed_tasks = set(user_roadmap.completed_tasks or [])

        if task_id in completed_tasks:
            completed_tasks.remove(task_id)
            completed = False
        else:
            completed_tasks.add(task_id)
            completed = True

        user_roadmap.completed_tasks = sorted(completed_tasks)

        db.add(user_roadmap)
        db.commit()
        db.refresh(user_roadmap)

        return {
            "task_id": task_id,
            "completed": completed,
            "completed_tasks": user_roadmap.completed_tasks,
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as exc:
        db.rollback()

        logger.exception(
            "Failed to toggle task for user_id=%s",
            current_user.id,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to update roadmap task.",
        ) from exc
