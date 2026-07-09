from pydantic import BaseModel
from typing import List


class RoadmapTask(BaseModel):
    done: bool
    text: str


class RoadmapPeriod(BaseModel):
    period: str
    color: str
    barColor: str
    items: List[RoadmapTask]


class SkillLevel(BaseModel):
    name: str
    level: int


class RequiredSkillLevel(BaseModel):
    name: str
    level: int
    gap: str


class RecommendationItem(BaseModel):
    title: str
    type: str
    platform: str
    time: str
    priority: str
    url: str = ""


class ProjectItem(BaseModel):
    name: str
    skills: List[str]
    difficulty: str
    url: str = ""


class RoadmapResponse(BaseModel):
    readiness: int
    target_role: str
    target_level: str
    current_skills: List[SkillLevel]
    required_skills: List[RequiredSkillLevel]
    roadmap: List[RoadmapPeriod]
    learning_recommendations: List[RecommendationItem]
    projects_to_build: List[ProjectItem]


class RoadmapTargetUpdate(BaseModel):
    target_role: str | None = None
    target_level: str | None = None


class RoadmapTaskToggle(BaseModel):
    task_id: str
