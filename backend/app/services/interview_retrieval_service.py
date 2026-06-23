import re
from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank

SKILLS = [
    "React",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Python",
    "FastAPI",
    "Flask",
    "Django",
    "PostgreSQL",
    "SQL",
    "Docker",
    "Git",
    "GitHub",
    "JWT",
    "REST API",
    "Redis",
    "Qdrant",
    "LangChain",
    "LangGraph",
]


def extract_resume_skills(resume_text: str):
    if not resume_text:
        return []
    found = []
    resume = resume_text.lower()
    for skill in SKILLS:
        if skill.lower() in resume:
            found.append(skill)

    return found


def extract_jd_skills(job_description: str):
    if not job_description:
        return []
    found = []
    jd = job_description.lower()
    for skill in SKILLS:
        if skill.lower() in jd:
            found.append(skill)

    return found


def find_common_skills(
    resume_skills,
    jd_skills,
):
    return list(set(resume_skills).intersection(set(jd_skills)))


def retrieve_questions(
    db: Session,
    skills: list[str],
):
    questions = []
    for skill in skills:
        rows = (
            db.query(InterviewQuestionBank)
            .filter(
                InterviewQuestionBank.skill.ilike(skill),
            )
            .limit(10)
            .all()
        )
        questions.extend(rows)
    return questions
