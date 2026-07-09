CYBERSECURITY_CATALOG = {
    "Cybersecurity Engineer": {
        "Junior": {
            "skills": [
                {"name": "Networking Fundamentals", "weight": 3, "priority": "High"},
                {"name": "Linux", "weight": 3, "priority": "High"},
                {"name": "Security Fundamentals", "weight": 3, "priority": "High"},
                {"name": "OWASP Top 10", "weight": 3, "priority": "High"},
                {"name": "Python", "weight": 2, "priority": "Medium"},
                {"name": "IAM", "weight": 2, "priority": "Medium"},
                {"name": "Log Analysis", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Secure Web Application Assessment Lab",
                    "description": (
                        "Build a legal local security lab to identify, document, "
                        "and remediate common web application vulnerabilities."
                    ),
                    "skills": [
                        "OWASP Top 10",
                        "Security Fundamentals",
                        "Linux",
                        "Log Analysis",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates secure development awareness, vulnerability "
                        "analysis, remediation, and professional reporting."
                    ),
                }
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "Application Security", "weight": 3, "priority": "High"},
                {"name": "Cloud Security", "weight": 3, "priority": "High"},
                {"name": "Threat Modeling", "weight": 3, "priority": "High"},
                {"name": "SIEM", "weight": 2, "priority": "Medium"},
                {"name": "Incident Response", "weight": 3, "priority": "High"},
                {"name": "Security Automation", "weight": 2, "priority": "Medium"},
                {"name": "Container Security", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Cloud Security Monitoring Platform",
                    "description": (
                        "Build a defensive monitoring platform that collects logs, "
                        "detects suspicious behavior, generates alerts, and documents response workflows."
                    ),
                    "skills": [
                        "Cloud Security",
                        "SIEM",
                        "Incident Response",
                        "Security Automation",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates defensive security engineering, monitoring, "
                        "automation, and incident response."
                    ),
                }
            ],
        },
        "Senior": {
            "skills": [
                {"name": "Security Architecture", "weight": 3, "priority": "High"},
                {"name": "Zero Trust Architecture", "weight": 3, "priority": "High"},
                {
                    "name": "Cloud Security Architecture",
                    "weight": 3,
                    "priority": "High",
                },
                {"name": "Threat Modeling", "weight": 3, "priority": "High"},
                {"name": "DevSecOps", "weight": 3, "priority": "High"},
                {"name": "Security Governance", "weight": 2, "priority": "Medium"},
                {"name": "Incident Management", "weight": 2, "priority": "Medium"},
                {"name": "Technical Leadership", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Enterprise Zero Trust Security Architecture",
                    "description": (
                        "Design an enterprise security architecture covering identity, "
                        "network segmentation, application security, cloud controls, "
                        "observability, governance, and incident management."
                    ),
                    "skills": [
                        "Security Architecture",
                        "Zero Trust Architecture",
                        "Cloud Security Architecture",
                        "DevSecOps",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates senior security architecture, risk management, "
                        "governance, and organization-wide technical leadership."
                    ),
                }
            ],
        },
    }
}
