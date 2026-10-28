from pydantic import BaseModel
from typing import Any


class ScoreTrendItem(BaseModel):
    month: str
    score: int


class ResumeDnaItem(BaseModel):
    skill: str
    A: int


class WeeklyActivityItem(BaseModel):
    day: str
    applied: int
    interviews: int


class RecentActivityItem(BaseModel):
    type: str
    title: str
    body: str
    timestamp: str


class ResumeInsights(BaseModel):
    ats_score: int
    top_skills: list[str] = []
    missing_skills: list[str] = []
    suggestions: list[str] = []


class StatsSummary(BaseModel):
    resumes_count: int
    ats_score: int
    ats_trend: str
    interviews_count: int
    jobs_count: int


class AISuggestionItem(BaseModel):
    title: str
    desc: str
    priority: str
    action_url: str


class EmptyStates(BaseModel):
    no_resumes: bool
    no_jobs: bool
    no_interviews: bool


class DashboardTaskSchema(BaseModel):
    id: int
    text: str
    done: bool = False
    created_at: str | None = None


class DashboardTaskCreate(BaseModel):
    text: str


class DashboardResponse(BaseModel):
    user_id: int
    greeting: str
    user_name: str
    score_trend: list[ScoreTrendItem] = []
    resume_dna: list[ResumeDnaItem] = []
    weekly_activity: list[WeeklyActivityItem] = []
    recent_activities: list[RecentActivityItem] = []
    resume_insights: ResumeInsights
    stats_summary: StatsSummary
    total_tracked_jobs: int
    total_interviews: int
    ai_suggestions: list[AISuggestionItem] = []
    empty_states: EmptyStates
    resume_history: list[dict[str, Any]] = []
