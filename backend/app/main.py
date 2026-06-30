from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.auth.routes import router as auth_router
from app.api.profile.routes import router as profile_router
from app.api.resume.routes import router as resume_router
from app.api.generator.routes import router as generator

from app.api.skills.routes import router as skills_router
from app.api.projects.routes import router as projects_router
from app.api.education.routes import router as education_router
from app.api.experience.routes import router as experience_router
from app.api.interview.routes import router as interview_router
from app.api.interview_bank.routes import router as interview_bank_router
from app.api.bookmark.routes import router as bookmark_router
from app.api.jobs.routes import router as jobs_router
from app.api.tracker.routes import router as tracker_router
from app.api.email.routes import router as email_router
from app.api.dashboard.routes import router as dashboard_router

app = FastAPI(title="ResumeRAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(generator)
app.include_router(skills_router)
app.include_router(projects_router)
app.include_router(education_router)
app.include_router(experience_router)

app.include_router(interview_router)
app.include_router(interview_bank_router)
app.include_router(bookmark_router)
app.include_router(jobs_router)
app.include_router(tracker_router)
app.include_router(email_router)
app.include_router(dashboard_router)


@app.get("/")
def home():
    return {"message": "ResumeRAG API Running"}
