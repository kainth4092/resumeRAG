from pydantic import BaseModel


class RoadmapTask(BaseModel):
    id: str
    title: str
    skill: str
    completed: bool = False


class RoadmapPhase(BaseModel):
    id: str
    phase: int
    title: str
    duration: str
    goal: str
    skills: list[str]
    tasks: list[RoadmapTask]


class RoadmapSkill(BaseModel):
    name: str
    priority: str | None = None
    weight: int | None = None
    status: str | None = None


class RecommendationItem(BaseModel):
    title: str
    provider: str
    skill: str
    topic: str
    difficulty: str
    duration: str
    priority: str
    url: str | None = None


class ProjectItem(BaseModel):
    name: str
    description: str
    skills: list[str]
    difficulty: str
    why: str
    url: str | None = None


class RoadmapResponse(BaseModel):
    target_role: str
    target_level: str
    readiness: int
    profile_skills: list[str]
    current_skills: list[RoadmapSkill]
    required_skills: list[RoadmapSkill]
    missing_skills: list[RoadmapSkill]
    roadmap: list[RoadmapPhase]
    learning_recommendations: list[RecommendationItem]
    projects_to_build: list[ProjectItem]
    completed_tasks: list[str] = []


class RoadmapTargetUpdate(BaseModel):
    target_role: str | None = None
    target_level: str | None = None


class RoadmapTaskToggle(BaseModel):
    task_id: str

