SOFTWARE_ENGINEER_CATALOG = {
    "Software Engineer": {
        "Junior": {
            "skills": [
                {"name": "Programming Fundamentals", "weight": 3, "priority": "High"},
                {"name": "Data Structures", "weight": 3, "priority": "High"},
                {"name": "Algorithms", "weight": 3, "priority": "High"},
                {
                    "name": "Object-Oriented Programming",
                    "weight": 3,
                    "priority": "High",
                },
                {"name": "Git", "weight": 2, "priority": "Medium"},
                {"name": "SQL", "weight": 2, "priority": "Medium"},
                {"name": "REST APIs", "weight": 2, "priority": "Medium"},
                {"name": "Testing", "weight": 1, "priority": "Low"},
                {"name": "Debugging", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Issue Tracking System",
                    "description": (
                        "Build an application for creating, assigning, prioritizing, "
                        "and tracking software issues with authentication and persistence."
                    ),
                    "skills": [
                        "Programming Fundamentals",
                        "Object-Oriented Programming",
                        "SQL",
                        "REST APIs",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates software design, data modeling, API development, "
                        "and practical problem solving."
                    ),
                },
                {
                    "name": "Algorithm Visualizer",
                    "description": (
                        "Create an interactive application that visualizes sorting, "
                        "searching, graph traversal, and pathfinding algorithms."
                    ),
                    "skills": [
                        "Data Structures",
                        "Algorithms",
                        "Debugging",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates strong computer science fundamentals and the "
                        "ability to explain algorithmic behavior visually."
                    ),
                },
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "Data Structures", "weight": 3, "priority": "High"},
                {"name": "Algorithms", "weight": 3, "priority": "High"},
                {"name": "Design Patterns", "weight": 3, "priority": "High"},
                {"name": "System Design", "weight": 3, "priority": "High"},
                {"name": "Database Design", "weight": 2, "priority": "Medium"},
                {"name": "API Design", "weight": 2, "priority": "Medium"},
                {"name": "Testing", "weight": 2, "priority": "Medium"},
                {"name": "Docker", "weight": 2, "priority": "Medium"},
                {"name": "CI/CD", "weight": 2, "priority": "Medium"},
                {"name": "Code Review", "weight": 1, "priority": "Low"},
            ],
            "projects": [
                {
                    "name": "Scalable Collaboration Platform",
                    "description": (
                        "Build a collaborative workspace with authentication, real-time "
                        "updates, caching, background processing, testing, and deployment."
                    ),
                    "skills": [
                        "System Design",
                        "API Design",
                        "Database Design",
                        "Docker",
                        "CI/CD",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates ownership of production-grade architecture, "
                        "deployment, scalability, and maintainable code."
                    ),
                },
            ],
        },
        "Senior": {
            "skills": [
                {"name": "System Design", "weight": 3, "priority": "High"},
                {"name": "Distributed Systems", "weight": 3, "priority": "High"},
                {"name": "Software Architecture", "weight": 3, "priority": "High"},
                {"name": "Database Architecture", "weight": 3, "priority": "High"},
                {"name": "Scalability", "weight": 3, "priority": "High"},
                {"name": "Observability", "weight": 2, "priority": "Medium"},
                {"name": "Security", "weight": 2, "priority": "Medium"},
                {"name": "Technical Leadership", "weight": 2, "priority": "Medium"},
                {"name": "Mentoring", "weight": 1, "priority": "Low"},
            ],
            "projects": [
                {
                    "name": "Distributed Multi-Service Platform",
                    "description": (
                        "Architect a distributed platform with independently deployable "
                        "services, messaging, caching, observability, resilience, and "
                        "failure recovery."
                    ),
                    "skills": [
                        "Distributed Systems",
                        "Software Architecture",
                        "System Design",
                        "Observability",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates senior-level architecture, scalability decisions, "
                        "resilience engineering, and technical ownership."
                    ),
                },
            ],
        },
    }
}
