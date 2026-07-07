from typing import Set

COMMON_SKILLS = [
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
    "AI",
    "Machine Learning",
    "GenAI",
    "RAG",
    "Linux",
    "Kubernetes",
    "AWS",
    "GCP",
    "Azure",
    "Java",
    "C++",
    "Go",
]


class SkillMatchingService:
    @staticmethod
    def extract_skills_from_text(text: str) -> Set[str]:
        if not text:
            return set()
        found = set()
        text_lower = text.lower()
        for skill in COMMON_SKILLS:
            # Word boundary matching or basic inclusion
            if f" {skill.lower()} " in f" {text_lower} " or skill.lower() in text_lower:
                found.add(skill)
        return found

    @classmethod
    def match_candidate_skills(cls, resume_text: str, jd_text: str) -> Set[str]:
        resume_skills = cls.extract_skills_from_text(resume_text)
        jd_skills = cls.extract_skills_from_text(jd_text)
        # Prioritize matching skills first, fallback to all resume skills if none match
        matching = resume_skills.intersection(jd_skills)
        if not matching:
            return resume_skills
        return matching
