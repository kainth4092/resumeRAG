import json
import asyncio
import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.core.database import Base, get_db
from app.core.dependencies import get_current_user
from app.main import app
from app.models.user import User
from app.models.resume import Resume
from app.models.job_context import JobContext
from app.models.pipeline_run import PipelineRun
from app.schemas.resume_doc import ResumeDoc, ContactInfo, ExperienceItem, ProjectItem
from app.resume.services.generation_validator import GenerationValidator
from app.pipeline.services.job_matcher import rank_jobs_for_resume
from app.pipeline.services.roadmap_builder import build_pipeline_roadmap


# Setup in-memory SQLite for deterministic pipeline testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def user_a(db_session):
    user = User(
        id=1,
        email="usera@example.com",
        name="Alice Engineer",
        password_hash="fakehashedpassword",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def user_b(db_session):
    user = User(
        id=2,
        email="userb@example.com",
        name="Bob Developer",
        password_hash="fakehashedpassword",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_source_resume(db_session, user_a):
    doc = ResumeDoc(
        contact=ContactInfo(name="Alice Engineer", email="alice@example.com"),
        headline="Full Stack Engineer",
        skills=["Python", "FastAPI", "React", "Docker"],
        experience=[
            ExperienceItem(
                company="TechCorp",
                role="Software Engineer",
                bullets=["Built robust REST APIs using FastAPI and Python."],
            )
        ],
        projects=[
            ProjectItem(
                title="E-commerce App",
                bullets=["Implemented payment gateway integration."],
                technologies=["React", "Node.js"],
            )
        ],
    )
    resume = Resume(
        id=10,
        user_id=user_a.id,
        title="Alice's Uploaded Resume",
        original_filename="Alice_Resume.pdf",
        file_path="uploads/alice_resume.pdf",
        source="upload",
        is_active=True,
        resume_json=json.dumps(doc.model_dump()),
        parsed_text="Alice Engineer. Full Stack Engineer. Skills: Python, FastAPI, React, Docker.",
    )
    db_session.add(resume)
    db_session.commit()
    db_session.refresh(resume)
    return resume


# 1. Test Generation Validator rejects invented employer, skill, and metrics
def test_validator_rejects_hallucinations():
    source_doc = ResumeDoc(
        contact=ContactInfo(name="Alice Engineer", email="alice@example.com"),
        headline="Software Engineer",
        summary="Experienced engineer with 3 years in backend systems.",
        skills=["Python", "FastAPI"],
        experience=[
            ExperienceItem(
                company="TechCorp",
                role="Engineer",
                bullets=["Built APIs in Python serving 100 requests per second."],
            )
        ],
    )

    # Unauthorized skills (Quantum Computing, Solidity)
    is_valid_skills, violations_skills = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Software Engineer",
        rewritten_summary="Experienced engineer.",
        rewritten_skills=["Python", "FastAPI", "Quantum Computing", "Solidity"],
        experience_bullet_replacements={},
        project_bullet_replacements={},
    )
    assert not is_valid_skills
    assert any("Unauthorized skill added" in v for v in violations_skills)

    # Hallucinated metric (87% invented, original had 100)
    is_valid_metrics, violations_metrics = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Software Engineer",
        rewritten_summary="Experienced engineer.",
        rewritten_skills=["Python", "FastAPI"],
        experience_bullet_replacements={
            (0, 0): "Accelerated throughput by 87% with zero downtime.",
        },
        project_bullet_replacements={},
    )
    assert not is_valid_metrics
    assert any("Introduced unverified numbers/metrics" in v for v in violations_metrics)

    # Valid truthful wording
    is_valid_ok, violations_ok = GenerationValidator.validate_wording(
        source_doc=source_doc,
        rewritten_headline="Senior Software Engineer",
        rewritten_summary="Experienced backend engineer with 3 years building reliable services.",
        rewritten_skills=["Python", "FastAPI"],
        experience_bullet_replacements={
            (0, 0): "Developed high-performance APIs in Python serving 100 requests per second.",
        },
        project_bullet_replacements={},
    )
    assert is_valid_ok
    assert len(violations_ok) == 0


# 2. Test FastEmbed + Skill Overlap + Title similarity ranking order
def test_jobs_ranking_algorithm():
    resume_doc = ResumeDoc(
        headline="Senior Python Engineer",
        skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
    )

    raw_jobs = [
        {
            "job_id": "job_irrelevant",
            "job_title": "Dental Assistant",
            "employer_name": "Smile Clinic",
            "job_description": "Assist dentists with patient hygiene and dental equipment preparation.",
        },
        {
            "job_id": "job_perfect_match",
            "job_title": "Senior Python Backend Engineer",
            "employer_name": "FinTech Innovations",
            "job_description": "Looking for a Senior Python Engineer skilled in FastAPI, PostgreSQL, Docker, and Redis.",
        },
        {
            "job_id": "job_partial_match",
            "job_title": "Full Stack React Developer",
            "employer_name": "Web Solutions",
            "job_description": "Frontend React development with some occasional Python backend scripts.",
        },
    ]

    ranked = rank_jobs_for_resume(resume_doc, raw_jobs)
    assert len(ranked) == 3
    # Perfect match must be first
    assert ranked[0]["job_id"] == "job_perfect_match"
    assert ranked[0]["score"] > ranked[1]["score"]
    assert "Python" in ranked[0]["matched_skills"]
    assert len(ranked[0]["missing_skills"]) == 0 or "Docker" in ranked[0]["matched_skills"]
    # Irrelevant job must be lowest
    assert ranked[-1]["job_id"] == "job_irrelevant"


# 3. Test Roadmap includes JD gaps with stable task IDs and portfolio tasks
def test_roadmap_builder_gaps_and_stable_ids(db_session, user_a, sample_source_resume):
    job_context = JobContext(
        title="Senior Cloud Engineer",
        seniority="Senior",
        required_skills=["Kubernetes", "Terraform", "AWS"],
        preferred_skills=["Golang"],
    )
    suggested_projects = [
        {
            "title": "Cloud Infrastructure Deployer",
            "description": "Deploy scalable microservices using Terraform and Kubernetes.",
            "skills": ["Terraform", "Kubernetes", "AWS"],
        }
    ]

    roadmap = build_pipeline_roadmap(
        db=db_session,
        user_id=user_a.id,
        generated_resume=sample_source_resume,
        job_context=job_context,
        suggested_projects=suggested_projects,
    )

    assert "Cloud" in roadmap.target_role or "Engineer" in roadmap.target_role
    phases = roadmap.plan.get("roadmap", []) if isinstance(roadmap.plan, dict) else roadmap.plan
    assert len(phases) >= 1

    task_ids = []
    has_portfolio_project = False
    for phase in phases:
        for task in phase.get("tasks", []):
            tid = str(task["id"])
            assert tid.startswith("phase_") or tid.startswith("task_") or "suggested" in tid
            task_ids.append(tid)
            if "Cloud Infrastructure Deployer" in task.get("title", ""):
                has_portfolio_project = True

    # Stable task IDs must be unique
    assert len(task_ids) == len(set(task_ids))
    assert has_portfolio_project


# 4. Test Idempotency and IDOR via API client
def test_pipeline_api_idempotency_and_idor(db_session, user_a, user_b, sample_source_resume):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: user_a

    client = TestClient(app)

    # Mock pipeline runner to avoid background worker race conditions
    with patch("app.api.pipeline.routes.execute_pipeline_run"):
        payload = {
            "job_description": "We are seeking a Backend Engineer with Python, FastAPI, and Docker experience to build high-scale APIs.",
            "source": {"type": "resume", "resume_id": sample_source_resume.id},
            "template": "modern",
        }

        # First request -> 202 Created
        resp1 = client.post("/api/pipeline/runs", json=payload)
        assert resp1.status_code == 202
        run_id_1 = resp1.json()["run_id"]

        # Duplicate request with same inputs -> Idempotent, returns existing run_id
        resp2 = client.post("/api/pipeline/runs", json=payload)
        assert resp2.status_code == 202
        run_id_2 = resp2.json()["run_id"]
        assert run_id_1 == run_id_2

        # Verify run can be fetched by User A
        get_resp = client.get(f"/api/pipeline/runs/{run_id_1}")
        assert get_resp.status_code == 200
        assert get_resp.json()["id"] == run_id_1

        # Test IDOR: Switch to User B
        app.dependency_overrides[get_current_user] = lambda: user_b

        # User B trying to access User A's run -> 403 or 404
        idor_run_resp = client.get(f"/api/pipeline/runs/{run_id_1}")
        assert idor_run_resp.status_code in (403, 404)

        # User B trying to recommend jobs for User A's resume -> 403 or 404
        idor_jobs_resp = client.get(f"/api/jobs/recommended?resume_id={sample_source_resume.id}")
        assert idor_jobs_resp.status_code in (403, 404)

        # User B trying to get roadmap for User A's resume -> 403 or 404
        idor_roadmap_resp = client.get(f"/api/roadmap?resume_id={sample_source_resume.id}")
        assert idor_roadmap_resp.status_code in (403, 404)

        # User B trying to get interview session for User A's resume -> 403 or 404
        idor_interview_resp = client.get(f"/api/interview/session-by-resume/{sample_source_resume.id}")
        assert idor_interview_resp.status_code in (403, 404)

    app.dependency_overrides.clear()


# 5. Test Source Resume is NEVER modified by the pipeline
def test_source_resume_never_modified(db_session, user_a, sample_source_resume):
    async def _test():
        from app.schemas.resume_doc import to_resume_doc

        original_json = sample_source_resume.resume_json
        original_text = sample_source_resume.parsed_text
        original_active = sample_source_resume.is_active

        job_ctx = JobContext(
            id=1,
            user_id=user_a.id,
            raw_description="Looking for Python, FastAPI, React.",
            description_hash="hash123",
            title="Python Engineer",
            seniority="Mid",
            required_skills=["Python", "FastAPI"],
        )
        db_session.add(job_ctx)
        db_session.commit()

        from app.pipeline.services.resume_generator import generate_tailored_resume

        with patch("app.pipeline.services.resume_generator.generate_resume") as mock_gen:
            parsed_doc = to_resume_doc(sample_source_resume.resume_json)
            mock_tailored = ResumeDoc(
                contact=parsed_doc.contact,
                headline="Tailored Python Engineer",
                skills=["Python", "FastAPI", "React", "Docker"],
                experience=parsed_doc.experience,
                projects=parsed_doc.projects,
            )
            mock_gen.return_value = (mock_tailored, ["PostgreSQL"], [])

            new_resume, ats_breakdown, skill_gaps, suggested_projects = await generate_tailored_resume(
                db=db_session,
                user_id=user_a.id,
                job_context=job_ctx,
                source_resume_id=sample_source_resume.id,
            )

            assert new_resume.id != sample_source_resume.id
            assert new_resume.source == "generated"
            assert new_resume.parent_resume_id == sample_source_resume.id
            assert new_resume.is_active is False

            # Verify source resume was NEVER touched
            db_session.refresh(sample_source_resume)
            assert sample_source_resume.resume_json == original_json
            assert sample_source_resume.parsed_text == original_text
            assert sample_source_resume.is_active == original_active

    asyncio.run(_test())


# 6. Test Partial Failure (Step 3 fails, status becomes 'partial', resume preserved)
def test_partial_failure_preserves_resume(db_session, user_a, sample_source_resume):
    async def _test():
        from app.pipeline.services.pipeline_runner import execute_pipeline_run

        run = PipelineRun(
            user_id=user_a.id,
            source_resume_id=sample_source_resume.id,
            description_hash="fakehash999",
            template="modern",
            status="queued",
            steps=[],
        )
        db_session.add(run)
        db_session.commit()
        db_session.refresh(run)

        with patch("app.pipeline.services.pipeline_runner.SessionLocal", return_value=db_session), \
             patch("app.pipeline.services.pipeline_runner.extract_or_get_job_context") as mock_ctx, \
             patch("app.pipeline.services.pipeline_runner.generate_tailored_resume") as mock_res, \
             patch("app.pipeline.services.pipeline_runner.match_and_rank_jobs") as mock_jobs, \
             patch("app.pipeline.services.pipeline_runner.prepare_interview_session") as mock_intv, \
             patch("app.pipeline.services.pipeline_runner.build_pipeline_roadmap") as mock_rdm:

            fake_ctx = JobContext(id=5, user_id=user_a.id, raw_description="JD text", title="Dev", required_skills=["Python"])
            fake_res = Resume(
                id=99,
                user_id=user_a.id,
                title="Tailored Resume",
                original_filename="Tailored.pdf",
                file_path="",
                parsed_text="Tailored",
                source="generated",
                parent_resume_id=sample_source_resume.id,
                is_active=False,
            )
            db_session.add(fake_res)
            db_session.commit()
            expected_resume_id = fake_res.id

            mock_ctx.return_value = fake_ctx
            mock_res.return_value = (fake_res, {}, [], [])
            mock_jobs.side_effect = RuntimeError("JSearch provider rate limit 429")
            mock_intv.return_value = MagicMock()
            mock_rdm.return_value = MagicMock()

            await execute_pipeline_run(
                run_id=str(run.id),
                job_description="JD text",
            )

            updated_run = db_session.query(PipelineRun).filter(PipelineRun.id == run.id).first()
            assert updated_run.status == "partial"
            assert updated_run.generated_resume_id == expected_resume_id

            jobs_step = next(s for s in updated_run.steps if s["name"] == "jobs")
            assert jobs_step["status"] == "failed"
            assert "JSearch provider rate limit" in jobs_step["error"]

    asyncio.run(_test())


# 7. Test Daily Quota Limit (429)
def test_pipeline_quota_limit(db_session, user_a):
    from app.core.quota import check_and_increment_daily_quota

    # Exhaust quota up to limit
    for _ in range(50):
        check_and_increment_daily_quota(
            db=db_session,
            user_id=user_a.id,
            feature="pipeline_run",
            max_daily_calls=50,
        )

    # Next call must raise 429
    with pytest.raises(Exception) as excinfo:
        check_and_increment_daily_quota(
            db=db_session,
            user_id=user_a.id,
            feature="pipeline_run",
            max_daily_calls=50,
        )
    assert excinfo.value.status_code == 429
