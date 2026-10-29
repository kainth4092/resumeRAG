import pytest
from app.schemas.resume_doc import to_resume_doc
from app.resume.services.generation_validator import GenerationValidator


@pytest.fixture
def source_doc():
    return to_resume_doc({
        "contact": {"name": "Alice Dev", "email": "alice@dev.com"},
        "headline": "Full Stack Developer",
        "summary": "5+ years of software development experience building scalable cloud applications.",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "React"],
        "experience": [
            {
                "company": "SaaS Inc",
                "role": "Software Engineer",
                "bullets": [
                    "Optimized database queries, reducing latency by 35% across 200 endpoints.",
                    "Built microservices handling 50k requests per second using FastAPI."
                ]
            }
        ],
        "projects": [
            {
                "title": "Task Manager",
                "technologies": ["React", "TypeScript", "Tailwind CSS"],
                "bullets": ["Developed real-time collaboration board serving 1000 users."]
            }
        ]
    })


def test_validator_passes_truthful_wording(source_doc):
    is_valid, violations = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Senior Full Stack Engineer | Python & Distributed Systems",
        rewritten_summary="Results-driven software engineer with 5 years of experience delivering robust microservices and real-time frontend interfaces.",
        rewritten_skills=["Python", "FastAPI", "React", "Docker", "PostgreSQL"],
        experience_bullet_replacements={
            (0, 0): "Refactored relational database queries, reducing response latency by 35% across 200 endpoints.",
        },
        project_bullet_replacements={
            (0, 0): "Engineered responsive real-time task board application supporting 1000 users.",
        }
    )
    assert is_valid is True
    assert len(violations) == 0


def test_validator_rejects_unauthorized_skills(source_doc):
    # AWS and Kubernetes are NOT in source skills or taxonomy synonyms
    is_valid, violations = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Full Stack Engineer",
        rewritten_summary="5 years of experience.",
        rewritten_skills=["Python", "AWS", "Kubernetes"],
        experience_bullet_replacements={},
        project_bullet_replacements={}
    )
    assert is_valid is False
    assert any("Unauthorized skill added: 'AWS'" in v for v in violations)
    assert any("Unauthorized skill added: 'Kubernetes'" in v for v in violations)


def test_validator_rejects_hallucinated_metrics(source_doc):
    # Original bullet has 35% and 200. Rewritten introduces 50% and 500!
    is_valid, violations = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Engineer",
        rewritten_summary="",
        rewritten_skills=["Python"],
        experience_bullet_replacements={
            (0, 0): "Improved database response times by 50% across 500 endpoints.",
        },
        project_bullet_replacements={}
    )
    assert is_valid is False
    assert any("Introduced unverified numbers/metrics" in v for v in violations)


def test_validator_rejects_unsupported_experience_years(source_doc):
    # Source resume has 5+ years claim; summary claims 10 years!
    is_valid, violations = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Senior Engineer",
        rewritten_summary="Experienced software engineer with 10+ years of experience in distributed systems.",
        rewritten_skills=["Python"],
        experience_bullet_replacements={},
        project_bullet_replacements={}
    )
    assert is_valid is False
    assert any("claims 10 years of experience" in v for v in violations)


def test_validator_rejects_excessive_summary_words(source_doc):
    long_summary = "word " * 115
    is_valid, violations = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Engineer",
        rewritten_summary=long_summary,
        rewritten_skills=["Python"],
        experience_bullet_replacements={},
        project_bullet_replacements={}
    )
    assert is_valid is False
    assert any("Summary exceeds 100 words" in v for v in violations)
