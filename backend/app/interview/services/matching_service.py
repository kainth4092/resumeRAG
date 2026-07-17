import re
from collections import OrderedDict
from typing import List

COMMON_SKILLS = [
    "Python",
    "FastAPI",
    "Flask",
    "Django",
    "React",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Tailwind CSS",
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
    "Machine Learning",
    "AI",
    "GenAI",
    "RAG",
    "NLP",
    "Semantic Search",
    "Embeddings",
    "Linux",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
    "Java",
    "C++",
    "Go",
]


SKILL_ALIASES = {
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "psql": "PostgreSQL",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "py": "Python",
    "python": "Python",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "nlp": "NLP",
    "rag": "RAG",
    "gen ai": "GenAI",
    "generative ai": "GenAI",
    "fast api": "FastAPI",
    "fastapi": "FastAPI",
    "rest": "REST API",
    "rest api": "REST API",
    "docker": "Docker",
    "git": "Git",
    "github": "GitHub",
    "langchain": "LangChain",
    "langgraph": "LangGraph",
    "qdrant": "Qdrant",
    "redis": "Redis",
    "llm": "LLM",
    "large language model": "LLM",
    "large language models": "LLM",
    "retrieval augmented generation": "RAG",
    "huggingface": "Hugging Face",
    "vector db": "Vector Database",
    "vector database": "Vector Database",
    "prompt engineering": "Prompt Engineering",
    "azure databricks": "Databricks",
    "pyspark": "PySpark",
    "delta lake": "Delta Lake",
    "unity catalog": "Unity Catalog",
    "ollama": "Ollama",
}


class SkillMatchingService:

    @staticmethod
    def normalize(skill: str) -> str:
        return SKILL_ALIASES.get(skill.lower().strip(), skill)

    @classmethod
    def extract_skills_from_text(cls, text: str) -> List[str]:
        if not text:
            return []

        text_lower = text.lower()

        found = OrderedDict()

        for skill in COMMON_SKILLS:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                found[cls.normalize(skill)] = None

        for alias, canonical in SKILL_ALIASES.items():
            pattern = r"\b" + re.escape(alias) + r"\b"
            if re.search(pattern, text_lower):
                found[canonical] = None
        return list(found.keys())

    @classmethod
    def match_candidate_skills(
        cls,
        resume_text: str,
        jd_text: str,
    ) -> List[str]:

        resume_skills = cls.extract_skills_from_text(resume_text)
        jd_skills = cls.extract_skills_from_text(jd_text)

        jd_set = set(jd_skills)

        matched = [s for s in resume_skills if s in jd_set]

        remaining = [s for s in resume_skills if s not in jd_set]

        ordered = matched + remaining

        seen = OrderedDict()

        for skill in ordered:
            seen[skill] = None

        return list(seen.keys())
