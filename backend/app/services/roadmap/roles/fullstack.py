FULLSTACK_CATALOG = {
    "Full Stack Developer": {
        "Junior": {
            "skills": [
                {"name": "HTML", "weight": 2, "priority": "High"},
                {"name": "CSS", "weight": 2, "priority": "High"},
                {"name": "JavaScript", "weight": 3, "priority": "High"},
                {"name": "React", "weight": 3, "priority": "High"},
                {"name": "Python", "weight": 3, "priority": "High"},
                {"name": "REST APIs", "weight": 3, "priority": "High"},
                {"name": "SQL", "weight": 2, "priority": "Medium"},
                {"name": "Git", "weight": 2, "priority": "Medium"},
                {"name": "Authentication", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Full Stack Job Tracker",
                    "description": (
                        "Build a React frontend and authenticated backend for "
                        "tracking job applications, interviews, and notes."
                    ),
                    "skills": [
                        "React",
                        "Python",
                        "REST APIs",
                        "SQL",
                        "Authentication",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates complete frontend-to-backend application "
                        "development."
                    ),
                },
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "TypeScript", "weight": 3, "priority": "High"},
                {"name": "React", "weight": 3, "priority": "High"},
                {"name": "Frontend Architecture", "weight": 2, "priority": "Medium"},
                {"name": "FastAPI", "weight": 3, "priority": "High"},
                {"name": "PostgreSQL", "weight": 3, "priority": "High"},
                {"name": "Redis", "weight": 2, "priority": "Medium"},
                {"name": "Docker", "weight": 2, "priority": "Medium"},
                {"name": "Testing", "weight": 2, "priority": "Medium"},
                {"name": "CI/CD", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Production Multi-Tenant SaaS",
                    "description": (
                        "Build a multi-tenant SaaS product with React, FastAPI, "
                        "PostgreSQL, Redis, testing, and automated deployment."
                    ),
                    "skills": [
                        "React",
                        "TypeScript",
                        "FastAPI",
                        "PostgreSQL",
                        "Docker",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Shows ownership across frontend, backend, database, "
                        "performance, testing, and deployment."
                    ),
                },
            ],
        },
        "Senior": {
            "skills": [
                {"name": "System Design", "weight": 3, "priority": "High"},
                {"name": "Frontend Architecture", "weight": 3, "priority": "High"},
                {"name": "Backend Architecture", "weight": 3, "priority": "High"},
                {"name": "Database Architecture", "weight": 3, "priority": "High"},
                {"name": "Cloud Architecture", "weight": 2, "priority": "Medium"},
                {"name": "Observability", "weight": 2, "priority": "Medium"},
                {"name": "Security", "weight": 2, "priority": "Medium"},
                {"name": "Technical Leadership", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Scalable AI SaaS Platform",
                    "description": (
                        "Architect a complete AI SaaS platform with modular frontend, "
                        "distributed backend services, caching, queues, observability, "
                        "security, and cloud deployment."
                    ),
                    "skills": [
                        "System Design",
                        "Frontend Architecture",
                        "Backend Architecture",
                        "Cloud Architecture",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates senior full-stack architecture and end-to-end "
                        "technical ownership."
                    ),
                },
            ],
        },
    }
}
