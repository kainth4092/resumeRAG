from app.services.roadmap.roles.frontend import FRONTEND_CATALOG
from app.services.roadmap.roles.backend import BACKEND_CATALOG
from app.services.roadmap.roles.fullstack import FULLSTACK_CATALOG
from app.services.roadmap.roles.software_engineer import SOFTWARE_ENGINEER_CATALOG
from app.services.roadmap.roles.data import DATA_CATALOG
from app.services.roadmap.roles.ai_ml import AI_ML_CATALOG
from app.services.roadmap.roles.devops_cloud import DEVOPS_CLOUD_CATALOG
from app.services.roadmap.roles.mobile_qa import MOBILE_QA_CATALOG
from app.services.roadmap.roles.cybersecurity import CYBERSECURITY_CATALOG


ROLE_CATALOG = {
    **FRONTEND_CATALOG,
    **BACKEND_CATALOG,
    **FULLSTACK_CATALOG,
    **SOFTWARE_ENGINEER_CATALOG,
    **DATA_CATALOG,
    **AI_ML_CATALOG,
    **DEVOPS_CLOUD_CATALOG,
    **MOBILE_QA_CATALOG,
    **CYBERSECURITY_CATALOG,
}

ROLE_ALIASES = {
    "frontend developer": "Frontend Developer",
    "frontend dev": "Frontend Developer",
    "front end developer": "Frontend Developer",
    "front-end developer": "Frontend Developer",
    "frontend engineer": "Frontend Developer",
    "react developer": "Frontend Developer",
    "backend developer": "Backend Developer",
    "backend dev": "Backend Developer",
    "back end developer": "Backend Developer",
    "back-end developer": "Backend Developer",
    "backend engineer": "Backend Developer",
    "full stack developer": "Full Stack Developer",
    "fullstack developer": "Full Stack Developer",
    "full-stack developer": "Full Stack Developer",
    "full stack engineer": "Full Stack Developer",
    "software engineer": "Software Engineer",
    "software developer": "Software Engineer",
    "swe": "Software Engineer",
    "data analyst": "Data Analyst",
    "business data analyst": "Data Analyst",
    "data scientist": "Data Scientist",
    "ai/ml engineer": "AI/ML Engineer",
    "ai engineer": "AI/ML Engineer",
    "ml engineer": "AI/ML Engineer",
    "machine learning engineer": "AI/ML Engineer",
    "artificial intelligence engineer": "AI/ML Engineer",
    "devops engineer": "DevOps Engineer",
    "devops": "DevOps Engineer",
    "cloud engineer": "Cloud Engineer",
    "cloud developer": "Cloud Engineer",
    "mobile developer": "Mobile Developer",
    "mobile app developer": "Mobile Developer",
    "react native developer": "Mobile Developer",
    "qa engineer": "QA Engineer",
    "quality assurance engineer": "QA Engineer",
    "software tester": "QA Engineer",
    "automation tester": "QA Engineer",
    "cybersecurity engineer": "Cybersecurity Engineer",
    "cyber security engineer": "Cybersecurity Engineer",
    "security engineer": "Cybersecurity Engineer",
}
