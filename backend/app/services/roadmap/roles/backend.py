BACKEND_CATALOG = {
    "Backend Developer": {
        "Junior": {
            "skills": [
                {"name": "Python", "weight": 3, "priority": "High"},
                {"name": "REST APIs", "weight": 3, "priority": "High"},
                {"name": "SQL", "weight": 3, "priority": "High"},
                {"name": "PostgreSQL", "weight": 2, "priority": "Medium"},
                {"name": "Git", "weight": 2, "priority": "Medium"},
                {"name": "Authentication", "weight": 2, "priority": "Medium"},
                {"name": "Testing", "weight": 1, "priority": "Low"},
            ],
            "projects": [
                {
                    "name": "REST API with Authentication",
                    "description": (
                        "Build a REST API with JWT authentication, authorization, "
                        "validation, database persistence, and error handling."
                    ),
                    "skills": [
                        "Python",
                        "REST APIs",
                        "PostgreSQL",
                        "Authentication",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates fundamental backend engineering and secure "
                        "API development."
                    ),
                },
                {
                    "name": "Job Application Tracker API",
                    "description": (
                        "Create an API for tracking applications, status changes, "
                        "notes, filters, and user-specific data."
                    ),
                    "skills": [
                        "Python",
                        "REST APIs",
                        "SQL",
                        "Authentication",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates practical CRUD design, relationships, "
                        "authorization, and database modeling."
                    ),
                },
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "Python", "weight": 3, "priority": "High"},
                {"name": "FastAPI", "weight": 3, "priority": "High"},
                {"name": "PostgreSQL", "weight": 3, "priority": "High"},
                {"name": "API Design", "weight": 3, "priority": "High"},
                {"name": "Redis", "weight": 2, "priority": "Medium"},
                {"name": "Docker", "weight": 2, "priority": "Medium"},
                {"name": "Testing", "weight": 2, "priority": "Medium"},
                {"name": "Database Optimization", "weight": 2, "priority": "Medium"},
                {"name": "Background Jobs", "weight": 1, "priority": "Low"},
            ],
            "projects": [
                {
                    "name": "Scalable SaaS Backend",
                    "description": (
                        "Build a multi-user SaaS API with JWT authentication, "
                        "PostgreSQL, Redis caching, background jobs, and Docker."
                    ),
                    "skills": [
                        "FastAPI",
                        "PostgreSQL",
                        "Redis",
                        "Docker",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Shows production backend engineering, performance "
                        "optimization, and asynchronous workflow design."
                    ),
                },
            ],
        },
        "Senior": {
            "skills": [
                {"name": "System Design", "weight": 3, "priority": "High"},
                {"name": "Distributed Systems", "weight": 3, "priority": "High"},
                {"name": "Database Architecture", "weight": 3, "priority": "High"},
                {"name": "API Architecture", "weight": 3, "priority": "High"},
                {"name": "Caching", "weight": 2, "priority": "Medium"},
                {"name": "Message Queues", "weight": 2, "priority": "Medium"},
                {"name": "Observability", "weight": 2, "priority": "Medium"},
                {"name": "Security", "weight": 2, "priority": "Medium"},
                {"name": "Technical Leadership", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Distributed Event-Driven Platform",
                    "description": (
                        "Design a distributed backend using services, asynchronous "
                        "events, caching, queues, observability, and failure recovery."
                    ),
                    "skills": [
                        "Distributed Systems",
                        "System Design",
                        "Message Queues",
                        "Observability",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates architecture decisions expected from senior "
                        "backend engineers."
                    ),
                },
            ],
        },
    }
}
