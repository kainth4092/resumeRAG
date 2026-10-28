import re
from dataclasses import dataclass, field
from typing import List, Dict


@dataclass
class SkillEntry:
    canonical_name: str
    aliases: List[str] = field(default_factory=list)
    category: str = "Technical"
    ambiguous: bool = False
    case_sensitive: bool = False
    context_keywords: List[str] = field(default_factory=list)


# Comprehensive taxonomy definition
TAXONOMY_ENTRIES: List[SkillEntry] = [
    # Languages
    SkillEntry("Python", ["python", "python3", "py"], "Languages"),
    SkillEntry("JavaScript", ["javascript", "js", "ecmascript"], "Languages"),
    SkillEntry("TypeScript", ["typescript", "ts"], "Languages"),
    SkillEntry("Go", ["golang", "go language"], "Languages", ambiguous=True, context_keywords=["backend", "concurrency", "goroutine", "docker", "kubernetes", "microservices"]),
    SkillEntry("C", ["c language", "c-lang", "ansi c"], "Languages", ambiguous=True, case_sensitive=True),
    SkillEntry("C++", ["c++", "cpp", "cplusplus"], "Languages"),
    SkillEntry("C#", ["c#", "csharp", "c-sharp", ".net c#"], "Languages"),
    SkillEntry("Java", ["java", "core java", "java 8", "java 11", "java 17"], "Languages"),
    SkillEntry("Rust", ["rust", "rust-lang"], "Languages", ambiguous=True, context_keywords=["cargo", "systems", "memory", "concurrency"]),
    SkillEntry("Ruby", ["ruby", "ruby-lang"], "Languages"),
    SkillEntry("PHP", ["php"], "Languages"),
    SkillEntry("Swift", ["swift", "swiftlang"], "Languages"),
    SkillEntry("Kotlin", ["kotlin"], "Languages"),
    SkillEntry("Dart", ["dart", "dartlang"], "Languages"),
    SkillEntry("R", ["r language", "r-lang", "r statistics"], "Languages", ambiguous=True, case_sensitive=True),
    SkillEntry("Scala", ["scala"], "Languages"),
    SkillEntry("SQL", ["sql", "structured query language"], "Languages"),
    SkillEntry("HTML", ["html", "html5"], "Frontend"),
    SkillEntry("CSS", ["css", "css3"], "Frontend"),

    # Frontend Frameworks & Tools
    SkillEntry("React", ["react", "react.js", "reactjs"], "Frontend"),
    SkillEntry("Angular", ["angular", "angular.js", "angularjs", "angular 2+"], "Frontend"),
    SkillEntry("Vue.js", ["vue", "vue.js", "vuejs", "vue 3"], "Frontend"),
    SkillEntry("Next.js", ["next.js", "nextjs", "next"], "Frontend"),
    SkillEntry("Nuxt.js", ["nuxt", "nuxt.js", "nuxtjs"], "Frontend"),
    SkillEntry("Svelte", ["svelte", "sveltekit"], "Frontend"),
    SkillEntry("Tailwind CSS", ["tailwind", "tailwindcss", "tailwind-css"], "Frontend"),
    SkillEntry("Redux", ["redux", "redux toolkit", "rtk"], "Frontend"),
    SkillEntry("GraphQL", ["graphql", "gql"], "Frontend"),
    SkillEntry("Webpack", ["webpack"], "Frontend"),
    SkillEntry("Vite", ["vite", "vitejs"], "Frontend"),
    SkillEntry("Responsive Design", ["responsive design", "mobile responsive", "media queries"], "Frontend"),

    # Backend Frameworks & Runtimes
    SkillEntry("Node.js", ["node", "node.js", "nodejs"], "Backend"),
    SkillEntry("Express.js", ["express", "express.js", "expressjs"], "Backend"),
    SkillEntry("FastAPI", ["fastapi", "fast-api"], "Backend"),
    SkillEntry("Django", ["django", "django rest framework", "drf"], "Backend"),
    SkillEntry("Flask", ["flask"], "Backend"),
    SkillEntry("Spring Boot", ["spring boot", "springboot", "spring framework", "spring"], "Backend"),
    SkillEntry("ASP.NET", ["asp.net", "asp.net core", ".net core", "dotnet"], "Backend"),
    SkillEntry("Ruby on Rails", ["rails", "ruby on rails", "ror"], "Backend"),
    SkillEntry("NestJS", ["nestjs", "nest.js"], "Backend"),
    SkillEntry("REST APIs", ["rest api", "rest apis", "restful", "restful api", "restful apis"], "Backend", ambiguous=True, context_keywords=["endpoint", "http", "api", "json", "crud"]),

    # Databases & Caches
    SkillEntry("PostgreSQL", ["postgres", "postgresql", "psql"], "Databases"),
    SkillEntry("MySQL", ["mysql"], "Databases"),
    SkillEntry("MongoDB", ["mongodb", "mongo"], "Databases"),
    SkillEntry("Redis", ["redis"], "Databases"),
    SkillEntry("SQLite", ["sqlite", "sqlite3"], "Databases"),
    SkillEntry("Cassandra", ["cassandra", "apache cassandra"], "Databases"),
    SkillEntry("Elasticsearch", ["elasticsearch", "elastic search", "elk"], "Databases"),
    SkillEntry("Qdrant", ["qdrant"], "Databases"),
    SkillEntry("DynamoDB", ["dynamodb", "aws dynamodb"], "Databases"),
    SkillEntry("Oracle", ["oracle db", "oracle database"], "Databases", ambiguous=True, context_keywords=["sql", "database", "pl/sql", "table"]),

    # DevOps, Cloud & Tools
    SkillEntry("Docker", ["docker", "containerization", "containers"], "DevOps"),
    SkillEntry("Kubernetes", ["kubernetes", "k8s"], "DevOps"),
    SkillEntry("AWS", ["aws", "amazon web services", "ec2", "s3", "lambda"], "Cloud"),
    SkillEntry("Azure", ["azure", "microsoft azure"], "Cloud"),
    SkillEntry("Google Cloud", ["gcp", "google cloud platform", "google cloud"], "Cloud"),
    SkillEntry("Terraform", ["terraform"], "DevOps"),
    SkillEntry("Ansible", ["ansible"], "DevOps"),
    SkillEntry("CI/CD", ["ci/cd", "continuous integration", "continuous deployment", "github actions", "gitlab ci", "jenkins"], "DevOps", ambiguous=True, context_keywords=["pipeline", "build", "deployment", "github", "gitlab", "test"]),
    SkillEntry("Linux", ["linux", "ubuntu", "debian", "centos", "bash", "shell scripting"], "DevOps"),
    SkillEntry("Nginx", ["nginx"], "DevOps"),
    SkillEntry("Git", ["git", "github", "gitlab", "version control"], "DevOps"),
    SkillEntry("Prometheus", ["prometheus"], "DevOps"),
    SkillEntry("Grafana", ["grafana"], "DevOps"),

    # AI, ML & Data
    SkillEntry("Machine Learning", ["machine learning", "ml"], "AI/ML", ambiguous=True, context_keywords=["model", "training", "algorithm", "data", "classification", "regression"]),
    SkillEntry("Deep Learning", ["deep learning", "neural networks", "cnn", "rnn"], "AI/ML"),
    SkillEntry("PyTorch", ["pytorch"], "AI/ML"),
    SkillEntry("TensorFlow", ["tensorflow", "tf", "keras"], "AI/ML"),
    SkillEntry("Pandas", ["pandas"], "AI/ML"),
    SkillEntry("NumPy", ["numpy"], "AI/ML"),
    SkillEntry("Scikit-learn", ["scikit-learn", "sklearn"], "AI/ML"),
    SkillEntry("Apache Spark", ["spark", "apache spark", "pyspark"], "AI/ML"),
    SkillEntry("NLP", ["nlp", "natural language processing"], "AI/ML"),
    SkillEntry("Computer Vision", ["computer vision", "opencv"], "AI/ML"),
    SkillEntry("LLMs", ["llm", "llms", "large language models"], "AI/ML"),
    SkillEntry("LangChain", ["langchain"], "AI/ML"),
    SkillEntry("RAG", ["rag", "retrieval augmented generation"], "AI/ML"),

    # Concepts & Architecture
    SkillEntry("Microservices", ["microservices", "microservice architecture"], "Architecture"),
    SkillEntry("System Design", ["system design", "distributed systems", "high availability"], "Architecture"),
    SkillEntry("OOP", ["oop", "object oriented programming", "object-oriented"], "Architecture"),
    SkillEntry("Agile", ["agile", "scrum", "kanban"], "Methodologies"),
]

# Build fast lookup indexes
_CANONICAL_INDEX: Dict[str, SkillEntry] = {entry.canonical_name.lower(): entry for entry in TAXONOMY_ENTRIES}
_ALIAS_TO_CANONICAL: Dict[str, str] = {}
for entry in TAXONOMY_ENTRIES:
    _ALIAS_TO_CANONICAL[entry.canonical_name.lower()] = entry.canonical_name
    for alias in entry.aliases:
        _ALIAS_TO_CANONICAL[alias.lower()] = entry.canonical_name


def normalize_skill(skill_name: str | None) -> str:
    """Normalize any skill string or alias to its canonical name, or return title-cased fallback."""
    if not skill_name or not isinstance(skill_name, str):
        return ""
    cleaned = " ".join(skill_name.strip().split())
    if not cleaned:
        return ""
    lower = cleaned.lower()
    if lower in _ALIAS_TO_CANONICAL:
        return _ALIAS_TO_CANONICAL[lower]
    return cleaned.title()


def get_skill_category(skill_name: str) -> str:
    """Return category for a skill."""
    canonical = normalize_skill(skill_name)
    entry = _CANONICAL_INDEX.get(canonical.lower())
    return entry.category if entry else "General"


def get_all_taxonomy_skills() -> List[dict]:
    """Expose full taxonomy data for frontend consumption."""
    return [
        {
            "canonical_name": entry.canonical_name,
            "category": entry.category,
            "aliases": entry.aliases,
            "ambiguous": entry.ambiguous,
        }
        for entry in TAXONOMY_ENTRIES
    ]


def extract_skills_from_text(text: str) -> List[str]:
    """
    Extract skills from text safely, preventing false positives for short or ambiguous tokens
    (e.g., 'go', 'rest', 'ai', 'ci', 'cd', 'r', 'c').
    """
    if not text:
        return []

    found = set()
    text_lower = text.lower()

    for entry in TAXONOMY_ENTRIES:
        matched = False

        if entry.ambiguous:
            # Check explicit multi-word aliases first (e.g. 'golang', 'rest api', 'c language')
            for alias in entry.aliases:
                if len(alias.split()) > 1 or len(alias) >= 4:
                    pattern = r"\b" + re.escape(alias) + r"\b"
                    if re.search(pattern, text_lower):
                        matched = True
                        break

            # If not matched via specific alias, check context keywords or case sensitivity
            if not matched:
                if entry.case_sensitive:
                    # Require exact case match with word boundaries (e.g. '\bC\b')
                    case_pattern = r"\b" + re.escape(entry.canonical_name) + r"\b"
                    if re.search(case_pattern, text):
                        # Verify context keyword presence
                        if any(kw in text_lower for kw in entry.context_keywords) or "programming" in text_lower or "developer" in text_lower or "software" in text_lower:
                            matched = True
                elif entry.context_keywords:
                    # Require word boundary of canonical or short alias AND at least one context keyword
                    short_tokens = [entry.canonical_name.lower()] + [a for a in entry.aliases if len(a) <= 3]
                    for tok in short_tokens:
                        tok_pattern = r"\b" + re.escape(tok) + r"\b"
                        if re.search(tok_pattern, text_lower):
                            if any(re.search(r"\b" + re.escape(kw) + r"\b", text_lower) for kw in entry.context_keywords):
                                matched = True
                                break
        else:
            # Unambiguous skill: word boundary match on canonical name or any alias
            candidates = [entry.canonical_name] + entry.aliases
            for cand in candidates:
                pattern = r"\b" + re.escape(cand.lower()) + r"\b"
                if re.search(pattern, text_lower):
                    matched = True
                    break

        if matched:
            found.add(entry.canonical_name)

    return sorted(found)
