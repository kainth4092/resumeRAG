DATA_CATALOG = {
    "Data Analyst": {
        "Junior": {
            "skills": [
                {"name": "Excel", "weight": 3, "priority": "High"},
                {"name": "SQL", "weight": 3, "priority": "High"},
                {"name": "Python", "weight": 2, "priority": "Medium"},
                {"name": "Pandas", "weight": 3, "priority": "High"},
                {"name": "Data Cleaning", "weight": 3, "priority": "High"},
                {"name": "Data Visualization", "weight": 2, "priority": "Medium"},
                {"name": "Statistics", "weight": 2, "priority": "Medium"},
                {"name": "Power BI", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Sales Performance Analytics Dashboard",
                    "description": (
                        "Clean and analyze sales data, identify trends and KPIs, "
                        "and build an interactive business dashboard."
                    ),
                    "skills": [
                        "SQL",
                        "Pandas",
                        "Data Cleaning",
                        "Data Visualization",
                        "Power BI",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates the complete analytics workflow from raw data "
                        "to actionable business insights."
                    ),
                },
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "Advanced SQL", "weight": 3, "priority": "High"},
                {"name": "Python", "weight": 3, "priority": "High"},
                {"name": "Pandas", "weight": 3, "priority": "High"},
                {"name": "Statistics", "weight": 3, "priority": "High"},
                {"name": "Data Visualization", "weight": 3, "priority": "High"},
                {"name": "Power BI", "weight": 2, "priority": "Medium"},
                {"name": "Tableau", "weight": 2, "priority": "Medium"},
                {"name": "A/B Testing", "weight": 2, "priority": "Medium"},
                {"name": "Data Modeling", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Customer Retention Analytics Platform",
                    "description": (
                        "Analyze customer behavior, cohort retention, churn signals, "
                        "segments, and experiment results through an interactive dashboard."
                    ),
                    "skills": [
                        "Advanced SQL",
                        "Python",
                        "Statistics",
                        "A/B Testing",
                        "Data Visualization",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Shows advanced analytical thinking, experimentation, business "
                        "metrics, and stakeholder-ready communication."
                    ),
                },
            ],
        },
        "Senior": {
            "skills": [
                {"name": "Analytics Strategy", "weight": 3, "priority": "High"},
                {"name": "Advanced Statistics", "weight": 3, "priority": "High"},
                {"name": "Data Modeling", "weight": 3, "priority": "High"},
                {"name": "Experiment Design", "weight": 3, "priority": "High"},
                {"name": "Data Warehousing", "weight": 2, "priority": "Medium"},
                {"name": "Business Intelligence", "weight": 3, "priority": "High"},
                {"name": "Data Governance", "weight": 2, "priority": "Medium"},
                {"name": "Stakeholder Management", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Executive Analytics and Experimentation Platform",
                    "description": (
                        "Design an analytics platform combining trusted KPIs, semantic "
                        "data models, experiment analysis, governance, and executive reporting."
                    ),
                    "skills": [
                        "Analytics Strategy",
                        "Data Modeling",
                        "Experiment Design",
                        "Business Intelligence",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates analytics leadership, metric governance, strategic "
                        "decision support, and organizational impact."
                    ),
                },
            ],
        },
    },
    "Data Scientist": {
        "Junior": {
            "skills": [
                {"name": "Python", "weight": 3, "priority": "High"},
                {"name": "Pandas", "weight": 3, "priority": "High"},
                {"name": "NumPy", "weight": 3, "priority": "High"},
                {"name": "Statistics", "weight": 3, "priority": "High"},
                {"name": "SQL", "weight": 2, "priority": "Medium"},
                {"name": "Data Visualization", "weight": 2, "priority": "Medium"},
                {"name": "Machine Learning", "weight": 3, "priority": "High"},
                {"name": "Scikit-learn", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Customer Churn Prediction",
                    "description": (
                        "Build an end-to-end churn prediction workflow including EDA, "
                        "feature engineering, model training, evaluation, and interpretation."
                    ),
                    "skills": [
                        "Python",
                        "Pandas",
                        "Statistics",
                        "Machine Learning",
                        "Scikit-learn",
                    ],
                    "difficulty": "Medium",
                    "why": (
                        "Demonstrates the complete applied data science lifecycle."
                    ),
                },
            ],
        },
        "Mid-Level": {
            "skills": [
                {"name": "Machine Learning", "weight": 3, "priority": "High"},
                {"name": "Feature Engineering", "weight": 3, "priority": "High"},
                {"name": "Advanced Statistics", "weight": 3, "priority": "High"},
                {"name": "Model Evaluation", "weight": 3, "priority": "High"},
                {"name": "Experiment Design", "weight": 2, "priority": "Medium"},
                {"name": "Time Series", "weight": 2, "priority": "Medium"},
                {"name": "Docker", "weight": 2, "priority": "Medium"},
                {"name": "MLflow", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Production Demand Forecasting System",
                    "description": (
                        "Build a forecasting pipeline with feature engineering, "
                        "backtesting, experiment tracking, containerization, and monitoring."
                    ),
                    "skills": [
                        "Machine Learning",
                        "Feature Engineering",
                        "Time Series",
                        "MLflow",
                        "Docker",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Shows production-oriented data science beyond notebook-only modeling."
                    ),
                },
            ],
        },
        "Senior": {
            "skills": [
                {"name": "ML System Design", "weight": 3, "priority": "High"},
                {"name": "Advanced Machine Learning", "weight": 3, "priority": "High"},
                {"name": "Causal Inference", "weight": 3, "priority": "High"},
                {"name": "Experiment Design", "weight": 3, "priority": "High"},
                {"name": "MLOps", "weight": 3, "priority": "High"},
                {"name": "Model Monitoring", "weight": 2, "priority": "Medium"},
                {"name": "Data Strategy", "weight": 2, "priority": "Medium"},
                {"name": "Technical Leadership", "weight": 2, "priority": "Medium"},
            ],
            "projects": [
                {
                    "name": "Enterprise ML Decision Platform",
                    "description": (
                        "Architect a platform supporting training, experimentation, "
                        "deployment, monitoring, governance, and causal decision analysis."
                    ),
                    "skills": [
                        "ML System Design",
                        "MLOps",
                        "Causal Inference",
                        "Model Monitoring",
                    ],
                    "difficulty": "Hard",
                    "why": (
                        "Demonstrates senior ownership of ML systems, experimentation, "
                        "governance, and business decision infrastructure."
                    ),
                },
            ],
        },
    },
}
