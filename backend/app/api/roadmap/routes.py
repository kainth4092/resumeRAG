import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.user_roadmap import UserRoadmap
from app.schemas.roadmap import (
    RoadmapResponse,
    UpdateTargetRoleRequest,
    ToggleTaskRequest,
)

router = APIRouter(prefix="/api/roadmap", tags=["Roadmap"])


def get_or_create_roadmap(db: Session, user_id: int) -> UserRoadmap:
    roadmap = db.query(UserRoadmap).filter(UserRoadmap.user_id == user_id).first()
    if not roadmap:
        roadmap = UserRoadmap(
            user_id=user_id,
            target_role="Senior Frontend Engineer",
            target_level="At top-tier startups (Stripe, Linear, Vercel level)",
            completed_tasks="[]",
        )
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
    return roadmap


@router.get("", response_model=RoadmapResponse)
def get_roadmap(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    roadmap_db = get_or_create_roadmap(db, current_user.id)
    target_role = roadmap_db.target_role
    target_level = roadmap_db.target_level

    try:
        completed = json.loads(roadmap_db.completed_tasks or "[]")
    except Exception:
        completed = []

    user_skills_lower = [s.skill_name.lower().strip() for s in current_user.skills]

    role_lower = target_role.lower()

    if (
        "frontend" in role_lower
        or "react" in role_lower
        or "ui" in role_lower
        or "ux" in role_lower
        or "web" in role_lower
        or "javascript" in role_lower
        or "html" in role_lower
    ):
        core_required = [
            ("React", 90),
            ("TypeScript", 85),
            ("Node.js", 80),
            ("GraphQL", 75),
            ("CSS/Tailwind", 85),
            ("Next.js", 80),
            ("Web Performance", 75),
            ("Testing (Jest/Cypress)", 70),
            ("System Design", 75),
            ("Git/GitHub", 90),
        ]
        t30_tasks = [
            "Master advanced React patterns (hooks, context, rendering optimization)",
            "Deep dive into TypeScript strict type configurations & generics",
            "Set up component unit testing using Vitest or Jest/React Testing Library",
            "Solve 10 frontend coding challenges focused on layout and speed",
        ]
        t60_tasks = [
            "Build or migrate a web app to Next.js App Router & Server Components",
            "Implement global state management with Zustand or Redux Toolkit",
            "Optimize Core Web Vitals (LCP, CLS, FID) to achieve 90+ lighthouse score",
            "Implement accessibility (a11y) standards in dynamic component systems",
        ]
        t90_tasks = [
            "Design and document a scalable micro-frontend architecture design system",
            "Conduct mock frontend system design & performance reviews",
            "Build and publish an open-source React component library to npm",
            "Apply to 5 high-quality frontend developer roles weekly",
        ]
        recommendations = [
            {
                "title": "React - The Complete Guide",
                "type": "Course",
                "platform": "Udemy",
                "time": "40h",
                "priority": "High",
                "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
            },
            {
                "title": "TypeScript Mastery Pro",
                "type": "Course",
                "platform": "Frontend Masters",
                "time": "20h",
                "priority": "High",
                "url": "https://frontendmasters.com/courses/typescript-v3/",
            },
            {
                "title": "Next.js Official Tutorials",
                "type": "Course",
                "platform": "NextJS.org",
                "time": "15h",
                "priority": "Medium",
                "url": "https://nextjs.org/learn",
            },
            {
                "title": "Designing Data-Intensive Applications",
                "type": "Book",
                "platform": "O'Reilly",
                "time": "30h",
                "priority": "Medium",
                "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
            },
        ]
        projects = [
            {
                "name": "Collaborative Real-time Whiteboard",
                "skills": ["React", "TypeScript", "WebSockets", "CSS/Tailwind"],
                "difficulty": "Hard",
                "url": "https://github.com/topics/collaborative-whiteboard",
            },
            {
                "name": "Custom UI Component Library with Storybook",
                "skills": [
                    "React",
                    "CSS/Tailwind",
                    "Git/GitHub",
                    "Testing (Jest/Cypress)",
                ],
                "difficulty": "Medium",
                "url": "https://storybook.js.org/blog/how-to-build-a-component-library-with-react-and-storybook/",
            },
            {
                "name": "Next.js SaaS Analytics Dashboard",
                "skills": ["Next.js", "React", "TypeScript", "GraphQL"],
                "difficulty": "Hard",
                "url": "https://github.com/topics/saas-dashboard",
            },
        ]
    elif (
        "devops" in role_lower
        or "cloud" in role_lower
        or "sre" in role_lower
        or "platform" in role_lower
        or "infrastructure" in role_lower
    ):
        core_required = [
            ("AWS/Cloud", 85),
            ("Docker/Kubernetes", 85),
            ("Terraform", 80),
            ("CI/CD", 80),
            ("Linux/Bash", 75),
            ("Python/Go", 70),
            ("Git/GitHub", 90),
            ("Monitoring/Prometheus", 70),
            ("Networking", 75),
            ("Security/IAM", 80),
        ]
        t30_tasks = [
            "Prepare and take AWS Solutions Architect Associate mock tests",
            "Write modular Infrastructure as Code using Terraform modules",
            "Master advanced Docker networking and multi-stage container builds",
            "Create automation scripts using Python or Bash for system health checks",
        ]
        t60_tasks = [
            "Set up multi-stage CI/CD pipelines using GitHub Actions or GitLab CI",
            "Deploy and configure a multi-node Kubernetes cluster with Helm charts",
            "Implement centralized logging and metrics monitoring (ELK/Prometheus/Grafana)",
            "Conduct high-availability system failure mock simulations",
        ]
        t90_tasks = [
            "Design secure VPC architectures with strict IAM policies and firewalls",
            "Optimize cloud costs and container resource allocations",
            "Participate in Kubernetes CKA/CKAD mock exam prep",
            "Apply to 5 high-quality DevOps/SRE roles weekly",
        ]
        recommendations = [
            {
                "title": "AWS Certified Solutions Architect Associate",
                "type": "Course",
                "platform": "A Cloud Guru",
                "time": "45h",
                "priority": "High",
                "url": "https://acloudguru.com/course/aws-certified-solutions-architect-associate-saa-c03",
            },
            {
                "title": "Docker and Kubernetes: The Complete Guide",
                "type": "Course",
                "platform": "Udemy",
                "time": "22h",
                "priority": "High",
                "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
            },
            {
                "title": "Terraform Up & Running",
                "type": "Book",
                "platform": "O'Reilly",
                "time": "12h",
                "priority": "Medium",
                "url": "https://www.terraform.io/intro",
            },
            {
                "title": "Site Reliability Engineering (SRE) Book",
                "type": "Book",
                "platform": "Google SRE",
                "time": "18h",
                "priority": "Medium",
                "url": "https://sre.google/sre-book/table-of-contents/",
            },
        ]
        projects = [
            {
                "name": "Automated AWS EKS Deployment with Terraform",
                "skills": ["AWS/Cloud", "Terraform", "Docker/Kubernetes", "Git/GitHub"],
                "difficulty": "Hard",
                "url": "https://github.com/hashicorp/learn-terraform-provision-eks-cluster",
            },
            {
                "name": "GitOps Pipeline with ArgoCD and Kubernetes",
                "skills": [
                    "Docker/Kubernetes",
                    "CI/CD",
                    "Git/GitHub",
                    "Monitoring/Prometheus",
                ],
                "difficulty": "Hard",
                "url": "https://argo-cd.readthedocs.io/en/stable/getting_started/",
            },
            {
                "name": "High Availability Log Analysis Stack",
                "skills": [
                    "Linux/Bash",
                    "Monitoring/Prometheus",
                    "Networking",
                    "Security/IAM",
                ],
                "difficulty": "Medium",
                "url": "https://github.com/elastic/elasticsearch",
            },
        ]
    elif (
        "data" in role_lower
        or "analytics" in role_lower
        or "ai" in role_lower
        or "ml" in role_lower
        or "machine learning" in role_lower
        or "nlp" in role_lower
        or "spark" in role_lower
    ):
        core_required = [
            ("Python", 90),
            ("SQL/PostgreSQL", 85),
            ("Spark/Databricks", 80),
            ("Data Warehousing", 75),
            ("ETL Pipelines", 85),
            ("Machine Learning", 70),
            ("Git/GitHub", 90),
            ("Docker", 70),
            ("Pandas/NumPy", 85),
            ("AWS/Cloud", 70),
        ]
        t30_tasks = [
            "Optimize complex SQL queries and understand database index optimization",
            "Write production-grade ETL scripts using Python (Pandas/NumPy)",
            "Understand dimensional data modeling: Star and Snowflake schemas",
            "Solve 15 advanced SQL and database challenges",
        ]
        t60_tasks = [
            "Build real-time streaming data pipeline using Apache Spark/Kafka",
            "Deploy a machine learning model or ETL pipeline in Docker containers",
            "Set up data orchestration using Apache Airflow or Prefect",
            "Configure cloud data warehouse (Snowflake/Redshift) integrations",
        ]
        t90_tasks = [
            "Implement data governance, monitoring, and quality checks",
            "Complete end-to-end data pipeline project with reporting dashboard",
            "Prepare for technical system design for data architectures",
            "Apply to 5 high-quality Data / AI / ML roles weekly",
        ]
        recommendations = [
            {
                "title": "Data Engineering Zoomcamp",
                "type": "Course",
                "platform": "DataTalks.Club",
                "time": "40h",
                "priority": "High",
                "url": "https://github.com/DataTalksClub/data-engineering-zoomcamp",
            },
            {
                "title": "Machine Learning Specialization",
                "type": "Course",
                "platform": "Coursera / Stanford",
                "time": "50h",
                "priority": "High",
                "url": "https://www.coursera.org/specializations/machine-learning-introduction",
            },
            {
                "title": "Apache Spark & Python Mastery",
                "type": "Course",
                "platform": "Udemy",
                "time": "20h",
                "priority": "Medium",
                "url": "https://www.udemy.com/course/taming-big-data-with-apache-spark-hands-on/",
            },
            {
                "title": "Designing Data-Intensive Applications",
                "type": "Book",
                "platform": "O'Reilly",
                "time": "30h",
                "priority": "Medium",
                "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
            },
        ]
        projects = [
            {
                "name": "Financial Market Real-time Streaming Pipeline",
                "skills": [
                    "Spark/Databricks",
                    "ETL Pipelines",
                    "Docker",
                    "SQL/PostgreSQL",
                ],
                "difficulty": "Hard",
                "url": "https://github.com/topics/streaming-pipeline",
            },
            {
                "name": "End-to-End ML Model API Deployment",
                "skills": ["Python", "Machine Learning", "Docker", "AWS/Cloud"],
                "difficulty": "Medium",
                "url": "https://github.com/topics/mlops-pipeline",
            },
            {
                "name": "Log Aggregator and Analytics Warehouse",
                "skills": [
                    "SQL/PostgreSQL",
                    "Data Warehousing",
                    "ETL Pipelines",
                    "Pandas/NumPy",
                ],
                "difficulty": "Medium",
                "url": "https://github.com/topics/etl-pipeline",
            },
        ]
    elif "fullstack" in role_lower or "full-stack" in role_lower:
        core_required = [
            ("React", 85),
            ("Node.js/Python", 85),
            ("TypeScript", 80),
            ("PostgreSQL", 80),
            ("System Design", 80),
            ("Git/GitHub", 90),
            ("CSS/Tailwind", 80),
            ("Redis", 70),
            ("AWS/Cloud", 70),
            ("Next.js", 75),
        ]
        t30_tasks = [
            "Build dynamic and responsive frontend views using React and Tailwind CSS",
            "Design clean RESTful/GraphQL API endpoints with Node.js/Python",
            "Configure database connections, schemas, and migrations in PostgreSQL",
            "Solve 15 full-stack design and algorithmic challenges",
        ]
        t60_tasks = [
            "Implement secure JSON Web Token (JWT) auth and OAuth flows",
            "Set up Redis caching to optimize database queries and load speeds",
            "Write comprehensive end-to-end and unit tests (Jest/Cypress/pytest)",
            "Containerize the entire application using Docker Compose",
        ]
        t90_tasks = [
            "Deploy the frontend and backend with CI/CD to AWS or similar cloud platform",
            "Conduct database query optimizations and performance profiling",
            "Design a scalable system design document for your portfolio product",
            "Apply to 5 high-quality Fullstack Developer roles weekly",
        ]
        recommendations = [
            {
                "title": "Full Stack Open",
                "type": "Course",
                "platform": "University of Helsinki",
                "time": "80h",
                "priority": "High",
                "url": "https://fullstackopen.com/en/",
            },
            {
                "title": "Epic Web Dev by Kent C. Dodds",
                "type": "Course",
                "platform": "EpicWeb.dev",
                "time": "60h",
                "priority": "High",
                "url": "https://www.epicweb.dev",
            },
            {
                "title": "System Design Fundamentals",
                "type": "Course",
                "platform": "ByteByteGo",
                "time": "25h",
                "priority": "Medium",
                "url": "https://bytebytego.com",
            },
            {
                "title": "Designing Data-Intensive Applications",
                "type": "Book",
                "platform": "O'Reilly",
                "time": "30h",
                "priority": "Medium",
                "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
            },
        ]
        projects = [
            {
                "name": "SaaS Subscription Platform with Stripe",
                "skills": ["React", "Node.js/Python", "PostgreSQL", "TypeScript"],
                "difficulty": "Hard",
                "url": "https://github.com/stripe/stripe-node",
            },
            {
                "name": "Real-time Task Collaboration App",
                "skills": ["React", "Redis", "Next.js", "CSS/Tailwind"],
                "difficulty": "Medium",
                "url": "https://github.com/topics/collaborative-app",
            },
            {
                "name": "Distributed Analytics Dashboard",
                "skills": ["TypeScript", "System Design", "AWS/Cloud", "PostgreSQL"],
                "difficulty": "Hard",
                "url": "https://github.com/topics/analytics-dashboard",
            },
        ]
    elif (
        "backend" in role_lower
        or "python" in role_lower
        or "go" in role_lower
        or "fastapi" in role_lower
        or "node" in role_lower
        or "java" in role_lower
        or "rust" in role_lower
        or "c#" in role_lower
        or "django" in role_lower
    ):
        core_required = [
            ("Python/Go/Node.js", 85),
            ("System Design", 80),
            ("PostgreSQL", 85),
            ("Redis", 75),
            ("Docker/Kubernetes", 70),
            ("Microservices", 75),
            ("Git/GitHub", 90),
            ("AWS/Cloud", 75),
            ("CI/CD", 70),
            ("Security/Auth", 80),
        ]
        t30_tasks = [
            "Design clean, versioned REST/gRPC API structures using FastAPI/Go/Node",
            "Optimize SQL queries and understand database index indexing in PostgreSQL",
            "Set up unit testing suites (pytest/Vitest) and run test coverages",
            "Solve 15 technical challenges related to data structures & algorithms",
        ]
        t60_tasks = [
            "Implement Redis caching, rate limiting, and message pub/sub",
            "Build and containerize microservices using Docker and Docker Compose",
            "Integrate OAuth2/JWT secure authentication and authorization flows",
            "Set up automated CI/CD deployment pipelines to cloud infrastructure",
        ]
        t90_tasks = [
            "Design distributed architectures with event queues (RabbitMQ/Kafka)",
            "Conduct load testing and performance profiling of API endpoints",
            "Obtain basic cloud developer certifications (AWS/GCP)",
            "Apply to 5 high-quality backend engineer roles weekly",
        ]
        recommendations = [
            {
                "title": "Backend Engineering Boot Camp",
                "type": "Course",
                "platform": "Udemy",
                "time": "30h",
                "priority": "High",
                "url": "https://www.udemy.com/course/backend-engineering/",
            },
            {
                "title": "System Design Fundamentals",
                "type": "Course",
                "platform": "ByteByteGo",
                "time": "25h",
                "priority": "High",
                "url": "https://bytebytego.com",
            },
            {
                "title": "PostgreSQL Mastery",
                "type": "Course",
                "platform": "Udemy",
                "time": "18h",
                "priority": "Medium",
                "url": "https://www.postgresql.org/docs/",
            },
            {
                "title": "Designing Data-Intensive Applications",
                "type": "Book",
                "platform": "O'Reilly",
                "time": "30h",
                "priority": "Medium",
                "url": "https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/",
            },
        ]
        projects = [
            {
                "name": "High Performance Rate Limiter & API Gateway",
                "skills": [
                    "Redis",
                    "Python/Go/Node.js",
                    "Docker/Kubernetes",
                    "Security/Auth",
                ],
                "difficulty": "Hard",
                "url": "https://github.com/topics/api-gateway",
            },
            {
                "name": "Distributed Job Queue and Worker System",
                "skills": ["Redis", "Python/Go/Node.js", "PostgreSQL", "Git/GitHub"],
                "difficulty": "Hard",
                "url": "https://github.com/topics/job-queue",
            },
            {
                "name": "Containerized Microservices Auth API",
                "skills": ["Microservices", "Security/Auth", "AWS/Cloud", "CI/CD"],
                "difficulty": "Medium",
                "url": "https://github.com/topics/auth-service",
            },
        ]
    else:
        # General Software Engineer
        core_required = [
            ("Git/GitHub", 90),
            ("Software Principles", 85),
            ("System Design", 75),
            ("SQL/PostgreSQL", 80),
            ("Programming Basics", 85),
            ("Testing/QA", 75),
            ("Docker/Containers", 70),
            ("Cloud Basics", 70),
            ("Data Structures", 80),
            ("Security Basics", 75),
        ]
        t30_tasks = [
            "Learn git flow, branches, pull requests, and code review practices",
            "Master fundamental programming syntax, clean code guidelines, and design patterns",
            "Practice basic relational database structure, tables, and CRUD queries",
            "Solve 15 basic to intermediate data structure problems",
        ]
        t60_tasks = [
            "Write unit tests and learn regression/integration testing principles",
            "Build and run multi-container applications locally using Docker Compose",
            "Understand system design principles: Load balancers, caching, scalability",
            "Deploy a basic web service or script to a cloud provider",
        ]
        t90_tasks = [
            "Complete a portfolio capstone project with clean architecture principles",
            "Review interview preparation resources: technical, behavioral, and resume reviews",
            "Obtain basic software developer certifications",
            "Apply to 5 entry/mid-level general software engineering roles weekly",
        ]
        recommendations = [
            {
                "title": "CS50: Introduction to Computer Science",
                "type": "Course",
                "platform": "Harvard / edX",
                "time": "80h",
                "priority": "High",
                "url": "https://pll.harvard.edu/course/cs50-introduction-computer-science",
            },
            {
                "title": "Git & GitHub Complete Guide",
                "type": "Course",
                "platform": "Udemy",
                "time": "15h",
                "priority": "High",
                "url": "https://github.com/donnemartin/system-design-primer",
            },
            {
                "title": "System Design Primer",
                "type": "Course",
                "platform": "GitHub Open Source",
                "time": "25h",
                "priority": "Medium",
                "url": "https://github.com/donnemartin/system-design-primer",
            },
            {
                "title": "Clean Code",
                "type": "Book",
                "platform": "O'Reilly",
                "time": "20h",
                "priority": "Medium",
                "url": "https://www.oreilly.com/library/view/clean-code-a-handbook/9780136083238/",
            },
        ]
        projects = [
            {
                "name": "Relational Task Manager API",
                "skills": [
                    "SQL/PostgreSQL",
                    "Programming Basics",
                    "Testing/QA",
                    "Git/GitHub",
                ],
                "difficulty": "Medium",
                "url": "https://github.com/topics/task-manager-api",
            },
            {
                "name": "Local Development Containerized Stack",
                "skills": ["Docker/Containers", "Cloud Basics", "Git/GitHub"],
                "difficulty": "Medium",
                "url": "https://github.com/topics/docker-compose",
            },
            {
                "name": "System Architecture Mock documentation",
                "skills": ["System Design", "Software Principles", "Security Basics"],
                "difficulty": "Hard",
                "url": "https://github.com/topics/architecture-documentation",
            },
        ]

    # Calculate actual skill levels based on the user's registered skills in profile
    current_skills_map = {}
    required_skills_list = []

    for skill in current_user.skills:
        skill_name = skill.skill_name.strip()
        current_skills_map[skill_name.lower()] = 80 + (hash(skill_name) % 15)

    # Standard baseline fallback levels for skills if user doesn't have them in their profile
    standard_defaults = {
        "react": 75,
        "typescript": 70,
        "node.js": 70,
        "git/github": 80,
        "postgresql": 65,
        "system design": 50,
        "aws/cloud": 40,
        "redis": 30,
        "docker/kubernetes": 30,
        "microservices": 40,
        "graphql": 60,
        "terraform": 20,
        "next.js": 60,
        "css/tailwind": 75,
        "python": 75,
        "sql/postgresql": 75,
        "spark/databricks": 40,
        "data warehousing": 40,
        "etl pipelines": 50,
        "machine learning": 45,
        "pandas/numpy": 65,
        "monitoring/prometheus": 35,
        "linux/bash": 60,
        "security/iam": 45,
        "docker": 55,
        "micro-frontend": 30,
        "testing (jest/cypress)": 50,
        "web performance": 50,
        "software principles": 70,
        "data structures": 60,
        "security basics": 50,
    }

    current_skills_output = []
    for skill_name, required_level in core_required:
        key = skill_name.lower()

        # Check if user has this skill in their profile
        is_user_owned = False
        user_skill_level = 85
        for user_skill in user_skills_lower:
            if user_skill == key or user_skill in key or key in user_skill:
                is_user_owned = True
                user_skill_level = current_skills_map.get(user_skill, 85)
                break

        if is_user_owned:
            level = user_skill_level
        else:
            # Fallback to standard defaults or a default low level
            level = standard_defaults.get(key, 25)

        current_skills_output.append({"name": skill_name, "level": level})

        # Calculate gap analysis
        if level < required_level:
            gap_size = required_level - level
            gap_tag = "high" if gap_size > 30 else "medium"
            required_skills_list.append(
                {"name": skill_name, "level": level, "gap": gap_tag}
            )

    # Sort current skills by level descending
    current_skills_output.sort(key=lambda x: x["level"], reverse=True)
    display_current_skills = current_skills_output[:8]

    # Calculate overall readiness percentage based strictly on target role's core requirements
    if core_required:
        total_user_level = sum(
            next(
                (
                    cs["level"]
                    for cs in current_skills_output
                    if cs["name"].lower() == req[0].lower()
                ),
                25,
            )
            for req in core_required
        )
        total_req_level = sum(req[1] for req in core_required)
        readiness = int((total_user_level / total_req_level) * 100)
        readiness = max(35, min(95, readiness))
    else:
        readiness = 60

    roadmap_data = [
        {
            "period": "30 Days",
            "color": "border-primary bg-primary/10 text-primary",
            "barColor": "bg-primary",
            "items": [{"done": (t in completed), "text": t} for t in t30_tasks],
        },
        {
            "period": "60 Days",
            "color": "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
            "barColor": "bg-amber-500",
            "items": [{"done": (t in completed), "text": t} for t in t60_tasks],
        },
        {
            "period": "90 Days",
            "color": "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            "barColor": "bg-emerald-500",
            "items": [{"done": (t in completed), "text": t} for t in t90_tasks],
        },
    ]

    return {
        "readiness": readiness,
        "target_role": target_role,
        "target_level": target_level,
        "current_skills": display_current_skills,
        "required_skills": required_skills_list[:8],
        "roadmap": roadmap_data,
        "learning_recommendations": recommendations,
        "projects_to_build": projects,
    }


@router.put("/target", response_model=RoadmapResponse)
def update_target_role(
    payload: UpdateTargetRoleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    roadmap_db = get_or_create_roadmap(db, current_user.id)
    roadmap_db.target_role = payload.target_role
    roadmap_db.target_level = payload.target_level
    try:
        db.commit()
        db.refresh(roadmap_db)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update target role")

    return get_roadmap(db=db, current_user=current_user)


@router.post("/toggle-task", response_model=RoadmapResponse)
def toggle_task(
    payload: ToggleTaskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    roadmap_db = get_or_create_roadmap(db, current_user.id)
    try:
        completed = json.loads(roadmap_db.completed_tasks or "[]")
    except Exception:
        completed = []

    task = payload.task_text.strip()
    if payload.done:
        if task not in completed:
            completed.append(task)
    else:
        if task in completed:
            completed.remove(task)

    roadmap_db.completed_tasks = json.dumps(completed)
    try:
        db.commit()
        db.refresh(roadmap_db)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update task progress")

    return get_roadmap(db=db, current_user=current_user)
