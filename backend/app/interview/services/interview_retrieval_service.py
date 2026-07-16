import logging
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.interview_bank import InterviewQuestionBank
from app.services.qdrant_service import search_question_ids
from app.interview.services.interview_bank_expansion_service import (
    InterviewBankExpansionService,
)

logger = logging.getLogger(__name__)

SKILLS = [
    # Languages
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Kotlin",
    "Swift",
    # Frontend
    "React",
    "Next.js",
    "Vue.js",
    "Angular",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Bootstrap",
    "Redux",
    "React Router",
    # Backend
    "FastAPI",
    "Flask",
    "Django",
    "Express.js",
    "Node.js",
    "Spring Boot",
    ".NET",
    "REST API",
    "GraphQL",
    "JWT",
    # Databases
    "SQL",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
    "Snowflake",
    # Cloud
    "AWS",
    "Azure",
    "Azure AI Search",
    "Azure DevOps",
    "GCP",
    "Firebase",
    # Data Engineering
    "Apache Spark",
    "PySpark",
    "Databricks",
    "Spark SQL",
    "Airflow",
    "dbt",
    "ETL",
    # AI / ML
    "Machine Learning",
    "Deep Learning",
    "NLP",
    "LLM",
    "Transformers",
    "TensorFlow",
    "PyTorch",
    "RAG",
    "LangChain",
    "LangGraph",
    "Qdrant",
    "FAISS",
    "ChromaDB",
    "Sentence Transformers",
    "Embeddings",
    "Vector Database",
    "Semantic Search",
    "Prompt Engineering",
    # DevOps
    "Docker",
    "Docker Compose",
    "Kubernetes",
    "Git",
    "GitHub",
    "CI/CD",
    "Linux",
    # Testing
    "Pytest",
    "Unit Testing",
    "Integration Testing",
    # Misc
    "Microservices",
    "System Design",
    "Design Patterns",
]


SKILL_ALIASES = {
    "fast api": "FastAPI",
    "rest apis": "REST API",
    "restful api": "REST API",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mongo": "MongoDB",
    "js": "JavaScript",
    "ts": "TypeScript",
    "node": "Node.js",
    "express": "Express.js",
    "pyspark": "PySpark",
    "spark": "Apache Spark",
    "docker compose": "Docker",
    "azure ai search": "Azure AI Search",
    "langchain": "LangChain",
    "langgraph": "LangGraph",
    "rag": "RAG",
    "llms": "LLM",
}


def _extract_skills(text: str) -> list[str]:
    if not text:
        return []

    source = text.lower()
    found = []

    for skill in SKILLS:
        if skill.lower() in source:
            found.append(skill)

    for alias, canonical in SKILL_ALIASES.items():
        if alias in source and canonical not in found:
            found.append(canonical)

    return sorted(set(found))


def extract_resume_skills(resume_text: str):
    return _extract_skills(resume_text)


def extract_jd_skills(job_description: str):
    return _extract_skills(job_description)


def retrieve_questions_rag(
    db: Session,
    user_id: int,
    resume_skills: list[str],
    jd_skills: list[str],
    limit: int = 40,
):
    resume_skills = sorted(
        {s.strip().lower() for s in resume_skills if s and s.strip()}
    )

    jd_skills = sorted({s.strip().lower() for s in jd_skills if s and s.strip()})

    if not resume_skills:
        logger.warning("No resume skills found.")
        return []
    try:
        InterviewBankExpansionService.expand_bank(
            db=db,
            user_id=user_id,
            resume_skills=resume_skills,
        )
    except Exception:
        logger.exception("Interview bank expansion failed.")

    # ----------------------------
    # Priority:
    # Resume + JD
    # Resume Only
    # JD Only
    # ----------------------------

    common = [s for s in resume_skills if s in jd_skills]

    resume_only = [s for s in resume_skills if s not in common]

    jd_only = [s for s in jd_skills if s not in common]

    ordered_skills = common + resume_only + jd_only

    logger.info(
        "Ordered skills: %s",
        ordered_skills,
    )

    # ----------------------------
    # Per-skill quota
    # ----------------------------

    quota = max(
        3,
        limit
        // max(
            1,
            len(ordered_skills),
        ),
    )

    collected = []
    seen_ids = set()

    for skill in ordered_skills:

        query = f"Interview questions " f"for {skill}"

        try:

            ids = search_question_ids(
                query=query,
                limit=quota * 3,
            )

        except Exception:

            logger.warning(
                "Qdrant failed " "for skill %s",
                skill,
                exc_info=True,
            )

            ids = []

        # -------------------------
        # Qdrant Results
        # -------------------------

        if ids:

            rows = (
                db.query(InterviewQuestionBank)
                .filter(
                    InterviewQuestionBank.id.in_(ids),
                    func.lower(InterviewQuestionBank.skill) == skill,
                )
                .all()
            )

            rows = sorted(
                rows,
                key=lambda x: ids.index(x.id),
            )

            for row in rows:

                if row.id in seen_ids:
                    continue

                collected.append(row)
                seen_ids.add(row.id)

                if len(collected) >= limit:
                    break

        if len(collected) >= limit:
            break

        # -------------------------
        # SQL fallback
        # -------------------------

        remaining = quota - sum(1 for q in collected if q.skill.lower() == skill)

        if remaining <= 0:
            continue

        sql_rows = (
            db.query(InterviewQuestionBank)
            .filter(func.lower(InterviewQuestionBank.skill) == skill)
            .order_by(InterviewQuestionBank.id.desc())
            .limit(remaining)
            .all()
        )

        for row in sql_rows:

            if row.id in seen_ids:
                continue

            collected.append(row)
            seen_ids.add(row.id)

            if len(collected) >= limit:
                break

    # ---------------------------------
    # Global fallback
    # ---------------------------------

    if len(collected) < limit:

        remaining = limit - len(collected)

        logger.info(
            "Running global fallback " "for %d questions",
            remaining,
        )

        fallback = (
            db.query(InterviewQuestionBank)
            .order_by(InterviewQuestionBank.id.desc())
            .limit(remaining * 3)
            .all()
        )

        for row in fallback:

            if row.id in seen_ids:
                continue

            collected.append(row)
            seen_ids.add(row.id)

            if len(collected) >= limit:
                break

    logger.info(
        "Returning %d questions " "from %d skills.",
        len(collected),
        len(ordered_skills),
    )

    return collected[:limit]
