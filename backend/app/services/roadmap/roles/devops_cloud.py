DEVOPS_CLOUD_CATALOG = {
    "DevOps Engineer": {
        "Junior": {
            "skills": [
                {"name": "Linux", "weight": 3, "priority": "High"},
                {"name": "Git", "weight": 3, "priority": "High"},
                {"name": "Bash", "weight": 2, "priority": "Medium"},
                {"name": "Docker", "weight": 3, "priority": "High"},
                {"name": "CI/CD", "weight": 3, "priority": "High"},
                {"name": "Networking Fundamentals", "weight": 2, "priority": "Medium"},
                {"name": "Cloud Fundamentals", "weight": 2, "priority": "Medium"},
                {"name": "Monitoring", "weight": 1, "priority": "Low"},
            ],
            "projects": [
                {
                    "name": "Automated Application Deployment Pipeline",
                    "description": (
                        "Containerize a web application and build an automated "
                        "CI/CD pipeline for testing and deployment."
                    ),
                    "skills": ["Docker", "Git", "CI/CD", "Linux"],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates practical automation, containerization, "
                        "version control, and deployment fundamentals."
                    ),
                }
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "Docker", "weight": 3, "priority": "High"},
                {"name": "Kubernetes", "weight": 3, "priority": "High"},
                {"name": "Terraform", "weight": 3, "priority": "High"},
                {"name": "CI/CD", "weight": 3, "priority": "High"},
                {"name": "AWS", "weight": 3, "priority": "High"},
                {"name": "Monitoring", "weight": 2, "priority": "Medium"},
                {"name": "Prometheus", "weight": 2, "priority": "Medium"},
                {"name": "Grafana", "weight": 2, "priority": "Medium"},
                {"name": "Infrastructure as Code", "weight": 3, "priority": "High"},
            ],
            "projects": [
                {
                    "name": "Kubernetes Production Platform",
                    "description": (
                        "Deploy a multi-service application using Kubernetes, "
                        "Terraform, automated CI/CD, monitoring, and dashboards."
                    ),
                    "skills": [
                        "Kubernetes",
                        "Terraform",
                        "CI/CD",
                        "Prometheus",
                        "Grafana",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Shows production infrastructure automation, orchestration, "
                        "observability, and deployment ownership."
                    ),
                }
            ],
        },
        "Senior": {
            "skills": [
                {"name": "Platform Engineering", "weight": 3, "priority": "High"},
                {"name": "Kubernetes Architecture", "weight": 3, "priority": "High"},
                {"name": "Cloud Architecture", "weight": 3, "priority": "High"},
                {"name": "Infrastructure as Code", "weight": 3, "priority": "High"},
                {"name": "Observability", "weight": 3, "priority": "High"},
                {
                    "name": "Site Reliability Engineering",
                    "weight": 3,
                    "priority": "High",
                },
                {"name": "Disaster Recovery", "weight": 2, "priority": "Medium"},
                {"name": "DevSecOps", "weight": 2, "priority": "Medium"},
                {"name": "Technical Leadership", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Enterprise Internal Developer Platform",
                    "description": (
                        "Architect a self-service developer platform with automated "
                        "infrastructure, deployments, observability, security, "
                        "reliability targets, and disaster recovery."
                    ),
                    "skills": [
                        "Platform Engineering",
                        "Kubernetes Architecture",
                        "Observability",
                        "Site Reliability Engineering",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates senior ownership of developer productivity, "
                        "reliability, scalability, and infrastructure strategy."
                    ),
                }
            ],
        },
    },
    "Cloud Engineer": {
        "Junior": {
            "skills": [
                {"name": "Cloud Fundamentals", "weight": 3, "priority": "High"},
                {"name": "AWS", "weight": 3, "priority": "High"},
                {"name": "Linux", "weight": 3, "priority": "High"},
                {"name": "Networking Fundamentals", "weight": 3, "priority": "High"},
                {"name": "IAM", "weight": 2, "priority": "Medium"},
                {"name": "Docker", "weight": 2, "priority": "Medium"},
                {"name": "Cloud Storage", "weight": 2, "priority": "Medium"},
                {"name": "Monitoring", "weight": 1, "priority": "Low"},
            ],
            "projects": [
                {
                    "name": "Highly Available Cloud Web Application",
                    "description": (
                        "Deploy a web application using cloud compute, managed "
                        "database, storage, networking, IAM, and monitoring."
                    ),
                    "skills": [
                        "AWS",
                        "Linux",
                        "Networking Fundamentals",
                        "IAM",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates practical understanding of core cloud "
                        "services and secure application deployment."
                    ),
                }
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "AWS", "weight": 3, "priority": "High"},
                {"name": "Cloud Architecture", "weight": 3, "priority": "High"},
                {"name": "Terraform", "weight": 3, "priority": "High"},
                {"name": "Kubernetes", "weight": 2, "priority": "Medium"},
                {"name": "Cloud Security", "weight": 3, "priority": "High"},
                {"name": "High Availability", "weight": 2, "priority": "Medium"},
                {"name": "Cost Optimization", "weight": 2, "priority": "Medium"},
                {"name": "Observability", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Multi-Tier Cloud Infrastructure",
                    "description": (
                        "Provision a secure and highly available cloud architecture "
                        "using infrastructure as code, private networking, autoscaling, "
                        "monitoring, and cost controls."
                    ),
                    "skills": [
                        "AWS",
                        "Terraform",
                        "Cloud Security",
                        "High Availability",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Shows production cloud architecture, automation, security, "
                        "reliability, and cost awareness."
                    ),
                }
            ],
        },
        "Senior": {
            "skills": [
                {
                    "name": "Enterprise Cloud Architecture",
                    "weight": 3,
                    "priority": "High",
                },
                {"name": "Multi-Cloud Strategy", "weight": 2, "priority": "Medium"},
                {
                    "name": "Cloud Security Architecture",
                    "weight": 3,
                    "priority": "High",
                },
                {"name": "Cloud Governance", "weight": 3, "priority": "High"},
                {"name": "FinOps", "weight": 2, "priority": "Medium"},
                {"name": "Disaster Recovery", "weight": 3, "priority": "High"},
                {"name": "Distributed Systems", "weight": 3, "priority": "High"},
                {"name": "Technical Leadership", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Enterprise Cloud Landing Zone",
                    "description": (
                        "Design a governed multi-account cloud foundation with "
                        "identity, security controls, networking, observability, "
                        "cost governance, and disaster recovery."
                    ),
                    "skills": [
                        "Enterprise Cloud Architecture",
                        "Cloud Governance",
                        "Cloud Security Architecture",
                        "Disaster Recovery",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates enterprise-level cloud strategy, governance, "
                        "security, and architectural leadership."
                    ),
                }
            ],
        },
    },
}
