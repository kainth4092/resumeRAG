from app.schemas.resume_doc import to_resume_doc
from app.resume.services.resume_scoring_service import calculate_scores


def test_scoring_without_jd():
    resume = to_resume_doc({
        "contact": {"name": "Test User", "email": "test@example.com", "phone": "1234567890"},
        "headline": "Software Engineer",
        "summary": "Experienced engineer.",
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL", "React", "TypeScript"],
        "experience": [
            {
                "company": "Acme Inc",
                "role": "Developer",
                "bullets": ["Increased throughput by 25% using FastAPI."]
            }
        ]
    })

    scores = calculate_scores(resume)
    assert 50 <= scores["ats_score"] <= 100
    assert "section_scores" in scores
    assert "reasons" in scores
    assert len(scores["reasons"]) > 0
    assert scores["section_scores"]["skills"] >= 75


def test_scoring_with_jd_matches_and_missing():
    resume = to_resume_doc({
        "contact": {"name": "Test User", "email": "test@example.com", "phone": "1234567890"},
        "skills": ["Python", "FastAPI", "Docker"],
        "experience": [
            {
                "company": "Acme Inc",
                "role": "Backend Engineer",
                "bullets": ["Built microservices in Python."]
            }
        ]
    })

    jd = """
    We are looking for a Senior Python Developer with experience in:
    - Python
    - FastAPI
    - Docker
    - Kubernetes
    - AWS
    """

    scores = calculate_scores(resume, jd)
    assert "matched_keywords" in scores
    assert "missing_keywords" in scores
    assert "Python" in scores["matched_keywords"]
    assert "FastAPI" in scores["matched_keywords"]
    assert "Docker" in scores["matched_keywords"]
    assert "Kubernetes" in scores["missing_keywords"] or "AWS" in scores["missing_keywords"]
    assert scores["keyword_coverage"] > 0
    assert len(scores["reasons"]) > 0
