from fastapi import APIRouter
from app.core.skills_taxonomy import get_all_taxonomy_skills

router = APIRouter(prefix="/api/meta", tags=["Metadata"])


@router.get("/skills")
def get_skills_metadata():
    """Return canonical skills taxonomy with categories and aliases."""
    return get_all_taxonomy_skills()
