from typing import Any

from app.services.roadmap.role_catalog import ROLE_CATALOG, ROLE_ALIASES
from app.services.roadmap.skill_normalizer import (
    normalize_skill,
    normalize_skills,
    build_user_skill_set,
    user_has_skill,
)
from app.services.roadmap.learning_resources import LEARNING_RESOURCES

LEVEL_ALIASES = {
    "entry": "Junior",
    "entry level": "Junior",
    "entry-level": "Junior",
    "fresher": "Junior",
    "beginner": "Junior",
    "junior": "Junior",
    "mid": "Mid-Level",
    "mid level": "Mid-Level",
    "mid-level": "Mid-Level",
    "intermediate": "Mid-Level",
    "senior": "Senior",
    "advanced": "Senior",
    "lead": "Senior",
}


def normalize_role(role: str) -> str:
    """
    Convert a role name or alias into a canonical role.

    Example:
        React Developer -> Frontend Developer
        Front End Developer -> Frontend Developer
        ML Engineer -> AI/ML Engineer
    """

    if not role:
        return "Software Engineer"

    cleaned = " ".join(str(role).strip().lower().split())

    if cleaned in ROLE_ALIASES:
        return ROLE_ALIASES[cleaned]

    # Exact canonical role match.
    for canonical_role in ROLE_CATALOG:
        if canonical_role.lower() == cleaned:
            return canonical_role

    return str(role).strip()


def normalize_level(level: str) -> str:
    """
    Normalize target experience level.
    """

    if not level:
        return "Junior"

    cleaned = " ".join(str(level).strip().lower().split())

    return LEVEL_ALIASES.get(cleaned, str(level).strip())


def get_role_config(
    target_role: str,
    target_level: str,
) -> tuple[str, str, dict[str, Any]]:
    """
    Return:
        canonical role
        canonical level
        role/level configuration
    """

    role = normalize_role(target_role)
    level = normalize_level(target_level)

    role_config = ROLE_CATALOG.get(role)

    if not role_config:
        raise ValueError(f"Career roadmap is not configured for target role: {role}")

    level_config = role_config.get(level)

    if not level_config:
        available_levels = ", ".join(role_config.keys())

        raise ValueError(
            f"Career roadmap for {role} is not configured for "
            f"level '{level}'. Available levels: {available_levels}."
        )

    return role, level, level_config


def extract_profile_skill_names(current_user) -> list[str]:
    """
    Extract real skill names from the authenticated user's profile.

    Supports common SQLAlchemy relationship structures where:
        current_user.skills = [Skill(...), Skill(...)]

    No fake skills or fake proficiency percentages are created.
    """

    raw_skills = []

    for skill in getattr(current_user, "skills", []) or []:
        skill_name = (
            getattr(skill, "name", None)
            or getattr(skill, "skill_name", None)
            or getattr(skill, "title", None)
        )

        if skill_name:
            raw_skills.append(str(skill_name).strip())

    return normalize_skills(raw_skills)


def calculate_readiness(
    user_skills: list[str],
    required_skills: list[dict[str, Any]],
) -> int:
    """
    Calculate weighted readiness.

    Formula:
        matched skill weight / total required skill weight * 100

    Example:
        Required:
            JavaScript weight 3
            React weight 3
            Git weight 2

        User has:
            JavaScript
            Git

        Score:
            (3 + 2) / 8 * 100 = 62.5 -> 62
    """

    if not required_skills:
        return 0

    user_skill_set = build_user_skill_set(user_skills)

    total_weight = 0
    matched_weight = 0

    for requirement in required_skills:
        skill_name = requirement.get("name", "")
        weight = max(1, int(requirement.get("weight", 1)))

        total_weight += weight

        if user_has_skill(user_skill_set, skill_name):
            matched_weight += weight

    if total_weight == 0:
        return 0

    return round((matched_weight / total_weight) * 100)


def build_current_skills(
    user_skills: list[str],
    required_skills: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Return only user skills relevant to the selected target role.

    Important:
    We do not invent proficiency percentages because the current
    database may only store whether a user has a skill.
    """

    user_skill_set = build_user_skill_set(user_skills)
    result = []

    for requirement in required_skills:
        skill_name = requirement.get("name", "")

        if user_has_skill(user_skill_set, skill_name):
            result.append(
                {
                    "name": skill_name,
                    "matched": True,
                    "priority": requirement.get("priority", "Medium"),
                    "weight": requirement.get("weight", 1),
                }
            )

    return result


def build_required_skills(
    user_skills: list[str],
    required_skills: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Build complete target-role skill requirements and indicate
    whether each requirement is already satisfied.
    """

    user_skill_set = build_user_skill_set(user_skills)
    result = []

    for requirement in required_skills:
        skill_name = requirement.get("name", "")

        matched = user_has_skill(
            user_skill_set,
            skill_name,
        )

        result.append(
            {
                "name": skill_name,
                "priority": requirement.get("priority", "Medium"),
                "weight": requirement.get("weight", 1),
                "matched": matched,
                "status": "Completed" if matched else "Missing",
            }
        )

    return result


def build_missing_skills(
    user_skills: list[str],
    required_skills: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Return only missing target-role skills.
    """

    all_requirements = build_required_skills(
        user_skills,
        required_skills,
    )

    return [skill for skill in all_requirements if not skill["matched"]]


def get_skill_learning_tasks(skill_name: str) -> list[str]:
    """
    Return specific actionable learning tasks for a missing skill.
    """

    task_map = {
        "HTML": [
            "Learn semantic HTML structure and document organization.",
            "Practice forms, tables, media elements, and accessibility-friendly markup.",
        ],
        "CSS": [
            "Learn the box model, Flexbox, Grid, positioning, and responsive layouts.",
            "Build responsive interfaces for mobile, tablet, and desktop screens.",
        ],
        "JavaScript": [
            "Learn variables, functions, arrays, objects, scope, and modern ES6+ syntax.",
            "Practice promises, async/await, Fetch API, error handling, and DOM manipulation.",
        ],
        "TypeScript": [
            "Learn primitive types, interfaces, type aliases, unions, and generics.",
            "Use TypeScript in a real application with strict type checking.",
        ],
        "React": [
            "Learn components, props, state, events, conditional rendering, and lists.",
            "Practice hooks, forms, API integration, reusable components, and routing.",
        ],
        "Git": [
            "Practice commits, branches, merges, pull requests, and conflict resolution.",
        ],
        "REST APIs": [
            "Understand HTTP methods, status codes, JSON, authentication, and error handling.",
            "Build or integrate CRUD API endpoints in a practical application.",
        ],
        "Responsive Design": [
            "Practice mobile-first layouts, breakpoints, flexible sizing, and responsive media.",
        ],
        "Web Accessibility": [
            "Learn semantic markup, keyboard navigation, ARIA basics, labels, and color contrast.",
        ],
        "Frontend Testing": [
            "Learn unit and component testing for frontend applications.",
            "Write tests for rendering, user interaction, loading, success, and error states.",
        ],
        "Web Performance": [
            "Learn lazy loading, code splitting, image optimization, caching, and Core Web Vitals.",
        ],
        "Python": [
            "Strengthen Python syntax, functions, collections, exceptions, modules, and OOP.",
            "Build a practical Python application using clean project structure.",
        ],
        "SQL": [
            "Practice SELECT, JOIN, GROUP BY, subqueries, indexes, and database relationships.",
        ],
        "PostgreSQL": [
            "Learn schema design, constraints, indexes, transactions, and query optimization.",
        ],
        "Authentication": [
            "Implement secure password hashing, JWT authentication, authorization, and token expiry.",
        ],
        "Testing": [
            "Write unit and integration tests for success, validation, authorization, and failure cases.",
        ],
        "Machine Learning": [
            "Learn supervised and unsupervised learning fundamentals.",
            "Practice preprocessing, training, evaluation, overfitting prevention, and model selection.",
        ],
        "Pandas": [
            "Practice data cleaning, filtering, grouping, merging, and missing-value handling.",
        ],
        "NumPy": [
            "Learn arrays, vectorized operations, broadcasting, indexing, and numerical transformations.",
        ],
        "Scikit-learn": [
            "Build preprocessing pipelines and train classification and regression models.",
        ],
        "Statistics": [
            "Learn distributions, descriptive statistics, probability, correlation, and hypothesis testing.",
        ],
        "Data Visualization": [
            "Build clear visualizations and choose appropriate charts for different analytical questions.",
        ],
        "Power BI": [
            "Create data models, dashboards, calculated measures, and interactive business reports.",
        ],
        "Linux": [
            "Practice filesystem operations, permissions, processes, services, logs, and networking commands.",
        ],
        "Docker": [
            "Learn images, containers, Dockerfiles, volumes, networks, and Docker Compose.",
        ],
        "CI/CD": [
            "Create an automated pipeline for testing, building, and deploying an application.",
        ],
        "AWS": [
            "Learn core cloud concepts and practical services for compute, storage, networking, and deployment.",
        ],
        "Networking": [
            "Understand DNS, HTTP/HTTPS, TCP/IP, ports, proxies, firewalls, and load balancing.",
        ],
        "Bash": [
            "Write shell scripts for automation, environment setup, and deployment tasks.",
        ],
        "System Design": [
            "Learn scalability, caching, databases, queues, load balancing, and API architecture.",
        ],
    }

    return task_map.get(
        skill_name,
        [
            f"Learn the core fundamentals of {skill_name}.",
            f"Build a practical exercise or mini-project using {skill_name}.",
        ],
    )


def build_roadmap_phases(
    missing_skills: list[dict[str, Any]],
    target_role: str,
    target_level: str,
) -> list[dict[str, Any]]:
    """
    Generate a clear roadmap based on actual missing skills.

    Skills are grouped by priority:
        High -> foundations/core
        Medium -> important role-specific capabilities
        Low -> supporting/job-readiness capabilities
    """

    high_priority = [
        skill for skill in missing_skills if skill.get("priority") == "High"
    ]

    medium_priority = [
        skill for skill in missing_skills if skill.get("priority") == "Medium"
    ]

    low_priority = [skill for skill in missing_skills if skill.get("priority") == "Low"]

    phases = []
    phase_number = 1

    def add_phase(
        title: str,
        skills: list[dict[str, Any]],
        duration: str,
        goal: str,
    ):
        nonlocal phase_number

        if not skills:
            return

        tasks = []

        for skill in skills:
            skill_name = skill["name"]

            for task in get_skill_learning_tasks(skill_name):
                tasks.append(
                    {
                        "id": (
                            f"phase-{phase_number}-"
                            f"{skill_name.lower().replace(' ', '-')}-"
                            f"{len(tasks) + 1}"
                        ),
                        "title": task,
                        "skill": skill_name,
                        "completed": False,
                    }
                )

        phases.append(
            {
                "id": f"phase-{phase_number}",
                "phase": phase_number,
                "title": title,
                "duration": duration,
                "goal": goal,
                "skills": [skill["name"] for skill in skills],
                "tasks": tasks,
            }
        )

        phase_number += 1

    add_phase(
        title="Critical Foundations",
        skills=high_priority,
        duration="4-6 weeks",
        goal=(
            f"Build the core technical foundation required for a "
            f"{target_level} {target_role} role."
        ),
    )

    add_phase(
        title="Role-Specific Capabilities",
        skills=medium_priority,
        duration="3-5 weeks",
        goal=(
            f"Develop the practical capabilities commonly expected "
            f"from a {target_role}."
        ),
    )

    add_phase(
        title="Supporting Skills",
        skills=low_priority,
        duration="2-3 weeks",
        goal=(
            "Strengthen supporting technical skills that improve "
            "production readiness and employability."
        ),
    )

    # Always include portfolio/job-readiness phase.
    phases.append(
        {
            "id": f"phase-{phase_number}",
            "phase": phase_number,
            "title": "Portfolio & Job Readiness",
            "duration": "2-4 weeks",
            "goal": (
                f"Demonstrate practical {target_role} skills and prepare "
                "for interviews and job applications."
            ),
            "skills": [],
            "tasks": [
                {
                    "id": f"phase-{phase_number}-portfolio-1",
                    "title": (
                        f"Build and document at least one production-quality "
                        f"project relevant to {target_role}."
                    ),
                    "skill": "Portfolio",
                    "completed": False,
                },
                {
                    "id": f"phase-{phase_number}-portfolio-2",
                    "title": (
                        "Write a clear README explaining architecture, "
                        "features, setup, and technical decisions."
                    ),
                    "skill": "Documentation",
                    "completed": False,
                },
                {
                    "id": f"phase-{phase_number}-portfolio-3",
                    "title": (
                        f"Practice technical interview questions relevant "
                        f"to {target_level} {target_role} roles."
                    ),
                    "skill": "Interview Preparation",
                    "completed": False,
                },
                {
                    "id": f"phase-{phase_number}-portfolio-4",
                    "title": (
                        f"Update your resume to highlight skills and projects "
                        f"relevant to {target_role}."
                    ),
                    "skill": "Resume",
                    "completed": False,
                },
            ],
        }
    )

    return phases


def build_learning_recommendations(
    missing_skills: list[dict],
) -> list[dict]:
    recommendations = []

    for skill in missing_skills[:8]:
        skill_name = skill.get("name", "").strip()

        if not skill_name:
            continue

        resource = LEARNING_RESOURCES.get(skill_name)

        if resource:
            recommendations.append(
                {
                    "title": resource["title"],
                    "provider": resource["provider"],
                    "skill": skill_name,
                    "topic": skill_name,
                    "difficulty": get_learning_difficulty(
                        skill.get("priority", "Medium")
                    ),
                    "duration": resource["duration"],
                    "priority": skill.get("priority", "Medium"),
                    "url": resource["url"],
                }
            )
        else:
            recommendations.append(
                {
                    "title": f"Learn {skill_name}",
                    "provider": "Recommended Learning Path",
                    "skill": skill_name,
                    "topic": skill_name,
                    "difficulty": get_learning_difficulty(
                        skill.get("priority", "Medium")
                    ),
                    "duration": "2–4 weeks",
                    "priority": skill.get("priority", "Medium"),
                    "url": None,
                }
            )

    return recommendations


def get_learning_difficulty(priority: str) -> str:
    difficulty_map = {
        "High": "Essential",
        "Medium": "Intermediate",
        "Low": "Advanced",
    }

    return difficulty_map.get(priority, "Intermediate")


def build_projects(
    level_config: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Return role-specific projects from the role catalog.
    """

    projects = level_config.get("projects", [])

    return [
        {
            "name": project.get("name", "Untitled Project"),
            "description": project.get("description", ""),
            "skills": project.get("skills", []),
            "difficulty": project.get("difficulty", "Medium"),
            "why": project.get("why", ""),
            "url": project.get("url"),
        }
        for project in projects
    ]


def generate_personalized_roadmap(
    current_user,
    target_role: str,
    target_level: str,
) -> dict[str, Any]:
    """
    Main Career Roadmap generation function.

    Flow:
        Authenticated user's real profile skills
            ↓
        Skill normalization
            ↓
        Target role + target level normalization
            ↓
        Role requirements
            ↓
        Weighted readiness
            ↓
        Current relevant skills
            ↓
        Missing skills
            ↓
        Personalized roadmap
            ↓
        Relevant learning recommendations
            ↓
        Role-specific projects
    """

    role, level, level_config = get_role_config(
        target_role=target_role,
        target_level=target_level,
    )

    user_skills = extract_profile_skill_names(current_user)

    role_requirements = level_config.get("skills", [])

    readiness = calculate_readiness(
        user_skills=user_skills,
        required_skills=role_requirements,
    )

    current_skills = build_current_skills(
        user_skills=user_skills,
        required_skills=role_requirements,
    )

    required_skills = build_required_skills(
        user_skills=user_skills,
        required_skills=role_requirements,
    )

    missing_skills = build_missing_skills(
        user_skills=user_skills,
        required_skills=role_requirements,
    )

    roadmap = build_roadmap_phases(
        missing_skills=missing_skills,
        target_role=role,
        target_level=level,
    )

    learning_recommendations = build_learning_recommendations(
        missing_skills=missing_skills,
    )

    projects_to_build = build_projects(level_config)

    return {
        "target_role": role,
        "target_level": level,
        "readiness": readiness,
        # All real profile skills after normalization.
        "profile_skills": user_skills,
        # Only profile skills relevant to selected role.
        "current_skills": current_skills,
        # All target role requirements with matched/missing status.
        "required_skills": required_skills,
        # Explicit skill gaps.
        "missing_skills": missing_skills,
        "roadmap": roadmap,
        "learning_recommendations": learning_recommendations,
        "projects_to_build": projects_to_build,
    }
