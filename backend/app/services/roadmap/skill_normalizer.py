import re
from typing import Iterable


SKILL_ALIASES = {
    # Frontend
    "js": "JavaScript",
    "javascript": "JavaScript",
    "ts": "TypeScript",
    "typescript": "TypeScript",
    "react": "React",
    "reactjs": "React",
    "react.js": "React",
    "next": "Next.js",
    "nextjs": "Next.js",
    "next.js": "Next.js",
    "html": "HTML",
    "html5": "HTML",
    "css": "CSS",
    "css3": "CSS",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "tailwind css": "Tailwind CSS",
    "responsive design": "Responsive Design",
    "responsive web design": "Responsive Design",
    "a11y": "Web Accessibility",
    "accessibility": "Web Accessibility",
    "web accessibility": "Web Accessibility",
    "web performance": "Web Performance",
    "frontend performance": "Web Performance",
    "frontend testing": "Frontend Testing",
    "react testing library": "Frontend Testing",
    "rtl": "Frontend Testing",
    "jest": "Testing",
    "pytest": "Testing",
    "unit testing": "Testing",
    "testing": "Testing",
    # Backend
    "node": "Node.js",
    "nodejs": "Node.js",
    "node.js": "Node.js",
    "python": "Python",
    "fast api": "FastAPI",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "rest api": "REST APIs",
    "rest apis": "REST APIs",
    "restful api": "REST APIs",
    "restful apis": "REST APIs",
    "graphql": "GraphQL",
    "authentication": "Authentication",
    "auth": "Authentication",
    "jwt": "Authentication",
    "oauth": "Authentication",
    "oauth2": "Authentication",
    "microservice": "Microservices",
    "microservices": "Microservices",
    # Database
    "sql": "SQL",
    "postgres": "PostgreSQL",
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongo": "MongoDB",
    "mongodb": "MongoDB",
    "redis": "Redis",
    # Git
    "git": "Git",
    "github": "Git",
    "git/github": "Git",
    # AI / ML
    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",
    "ml": "Machine Learning",
    "machine learning": "Machine Learning",
    "scikit learn": "Scikit-learn",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "nlp": "Natural Language Processing",
    "natural language processing": "Natural Language Processing",
    "llm": "Large Language Models",
    "llms": "Large Language Models",
    "large language model": "Large Language Models",
    "large language models": "Large Language Models",
    "rag": "RAG",
    "retrieval augmented generation": "RAG",
    "langchain": "LangChain",
    "langgraph": "LangGraph",
    "qdrant": "Qdrant",
    "vector database": "Vector Databases",
    "vector db": "Vector Databases",
    # Data
    "excel": "Excel",
    "powerbi": "Power BI",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "data viz": "Data Visualization",
    "data visualization": "Data Visualization",
    "statistics": "Statistics",
    "stats": "Statistics",
    "etl": "ETL Pipelines",
    "etl pipeline": "ETL Pipelines",
    "etl pipelines": "ETL Pipelines",
    "spark": "Apache Spark",
    "apache spark": "Apache Spark",
    "databricks": "Databricks",
    "data warehouse": "Data Warehousing",
    "data warehousing": "Data Warehousing",
    # DevOps / Cloud
    "docker": "Docker",
    "containers": "Docker",
    "containerization": "Docker",
    "k8s": "Kubernetes",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "amazon web services": "AWS",
    "azure": "Azure",
    "gcp": "Google Cloud",
    "google cloud": "Google Cloud",
    "ci cd": "CI/CD",
    "ci/cd": "CI/CD",
    "cicd": "CI/CD",
    "linux": "Linux",
    "bash": "Bash",
    "shell scripting": "Bash",
    "terraform": "Terraform",
    "prometheus": "Prometheus",
    "grafana": "Grafana",
    "networking": "Networking",
    # General engineering
    "system design": "System Design",
    "dsa": "Data Structures & Algorithms",
    "data structures": "Data Structures & Algorithms",
    "data structures and algorithms": "Data Structures & Algorithms",
    "clean code": "Software Principles",
    "software principles": "Software Principles",
    "security": "Security",
    "cybersecurity": "Security",
}


def clean_skill_key(skill_name: str) -> str:
    """
    Convert a skill name into a stable comparison key.

    Examples:
        React.js -> reactjs
        Tailwind CSS -> tailwind css
        CI/CD -> ci cd
    """

    if not skill_name:
        return ""

    value = str(skill_name).strip().lower()

    value = value.replace("&", " and ")
    value = value.replace("/", " ")
    value = value.replace("\\", " ")

    # Keep useful characters such as +, # and dots temporarily.
    value = re.sub(r"[-_]+", " ", value)
    value = re.sub(r"\s+", " ", value)

    return value.strip()


def normalize_skill(skill_name: str) -> str:
    """
    Return the canonical skill name.

    Unknown skills are preserved instead of being discarded.
    """

    if not skill_name:
        return ""

    original = str(skill_name).strip()

    if not original:
        return ""

    raw_key = original.lower().strip()

    # Exact alias lookup first.
    if raw_key in SKILL_ALIASES:
        return SKILL_ALIASES[raw_key]

    cleaned_key = clean_skill_key(original)

    if cleaned_key in SKILL_ALIASES:
        return SKILL_ALIASES[cleaned_key]

    # Handle dots for aliases such as React.js / Node.js.
    without_dots = cleaned_key.replace(".", "")

    if without_dots in SKILL_ALIASES:
        return SKILL_ALIASES[without_dots]

    # Unknown skills remain available.
    return original


def skill_comparison_key(skill_name: str) -> str:
    """
    Produce the canonical comparison key for a skill.

    This avoids unsafe substring comparisons such as:
        Java matching JavaScript
    """

    normalized = normalize_skill(skill_name)

    return re.sub(
        r"[^a-z0-9+#]+",
        "",
        normalized.lower(),
    )


def normalize_skills(skills: Iterable[str]) -> list[str]:
    """
    Normalize and deduplicate a collection of skill names while
    preserving the original order.
    """

    normalized_skills = []
    seen = set()

    for skill in skills:
        normalized = normalize_skill(skill)

        if not normalized:
            continue

        key = skill_comparison_key(normalized)

        if not key or key in seen:
            continue

        seen.add(key)
        normalized_skills.append(normalized)

    return normalized_skills


def skills_match(user_skill: str, required_skill: str) -> bool:
    """
    Compare two skills safely using their canonical representations.

    No generic substring matching is performed.
    """

    if not user_skill or not required_skill:
        return False

    return skill_comparison_key(user_skill) == skill_comparison_key(required_skill)


def build_user_skill_set(skills: Iterable[str]) -> set[str]:
    """
    Build a set of normalized comparison keys for fast skill lookup.
    """

    return {
        skill_comparison_key(skill)
        for skill in skills
        if skill and skill_comparison_key(skill)
    }


def user_has_skill(
    user_skill_set: set[str],
    required_skill: str,
) -> bool:
    """
    Check whether the normalized user skill set contains
    the required skill.
    """

    required_key = skill_comparison_key(required_skill)

    if not required_key:
        return False

    return required_key in user_skill_set
