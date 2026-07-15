from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.resume.services.resume_service import ResumeService

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await ResumeService.upload_resume(file, db, current_user.id, background_tasks)


@router.post("/{resume_id}/active")
def set_active_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.set_active_resume(resume_id, db, current_user.id)


@router.get("")
def list_resumes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.list_resumes(db, current_user.id)


@router.get("/active")
def get_active_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.get_active_resume(db, current_user.id)



@router.get("/{resume_id}")
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.get_resume_by_id(resume_id, db, current_user.id)


from pydantic import (
    BaseModel,
    Field,
    field_validator,
)

class ResumeUpdateSchema(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )
    template: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )
    version: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    ats_score: int | None = Field(
        default=None,
        ge=0,
        le=100,
    )
    resume_json: dict | None = None

    @field_validator(
        "title",
        "template",
        "version",
    )
    @classmethod
    def clean_text(
        cls,
        value: str | None,
    ):
        if value is None:
            return value

        value = value.strip()

        if not value:
            raise ValueError(
                "Value cannot be empty."
            )

        return value


@router.post("/import-profile")
def import_profile_to_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.import_profile_to_resume(db, current_user.id)


@router.put("/{resume_id}")
def update_resume(
    resume_id: int,
    payload: ResumeUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.update_resume(
        resume_id,
        payload.model_dump(
            exclude_unset=True,
        ),
        db,
        current_user.id
    )


@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ResumeService.delete_resume(resume_id, db, current_user.id)
