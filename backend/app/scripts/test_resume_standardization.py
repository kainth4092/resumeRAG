import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.database import SessionLocal
from app.models.resume import Resume
from app.models.user import User
from app.resume.services.resume_normalizer import (
    normalize_resume,
    get_canonical_hash,
    coerce_to_canonical,
)
from app.resume.services.resume_scoring_service import calculate_scores
from app.resume.services.resume_analysis_service import analyze_resume_canonical


def test_pipeline():
    db = SessionLocal()

    # 1. Fetch or create a test user
    user = db.query(User).first()
    if not user:
        print("No user found in database to run integration tests.")
        db.close()
        return

    print(f"Running tests using user: {user.email} (ID: {user.id})")

    # 2. Define three semantically identical resume sources:

    # Source A: Profile data dictionary (represented as raw canonical dictionary)
    profile_data = {
        "contact": {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "  123-456-7890 ",
            "location": "New York, NY",
            "linkedin": "linkedin.com/in/janedoe",
            "github": "github.com/janedoe",
            "portfolio": "janedoe.dev",
        },
        "headline": "Senior Software Engineer",
        "summary": "Experienced software engineer specializing in backend development and cloud architecture.",
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL", "AWS"],
        "experience": [
            {
                "company": "Tech Corp",
                "role": "Software Engineer",
                "start_date": "Jan 2022",
                "end_date": "Present",
                "currently_working": True,
                "location": "New York",
                "bullets": [
                    "• Led design and development of FastAPI microservices.",
                    "- Optimized database queries reducing response times by 30%.",
                ],
            }
        ],
        "projects": [
            {
                "title": "Resume RAG",
                "description": "An AI-powered resume analysis platform.",
                "technologies": ["Python", "React", "Docker"],
                "github_url": "github.com/janedoe/resume-rag",
                "live_url": "",
            }
        ],
        "education": [
            {
                "institution": "State University",
                "degree": "B.S. Computer Science",
                "start_date": "2018",
                "end_date": "2022",
                "location": "",
            }
        ],
        "certifications": [],
        "achievements": [],
        "languages": [],
        "publications": [],
        "volunteer_experience": [],
    }

    # Source B: A dirty dictionary representing a different/unstructured format
    dirty_data = {
        "contact": {
            "name": " JANE DOE ",
            "email": "JANE.DOE@EXAMPLE.COM",
            "phone": "1234567890",
            "location": "New York, NY",
            "linkedin": "https://linkedin.com/in/janedoe/",
            "github": "https://github.com/janedoe",
            "portfolio": "http://janedoe.dev",
        },
        "headline": "  Senior Software Engineer  ",
        "summary": "Experienced software engineer specializing in backend development and cloud architecture. ",
        # Different order, casing, duplicates
        "skills": ["fastapi", "PYTHON", "fastapi", "AWS", "Docker", "PostgreSQL"],
        "experience": [
            {
                "company": "Tech Corp",
                "role": "Software Engineer",
                "start_date": "Jan 2022",
                "end_date": "Present",
                "currently_working": True,
                "location": "New York",
                # Wacky bullet spacing and symbols
                "bullets": [
                    "  Led design and development of FastAPI microservices.  ",
                    " * Optimized database queries reducing response times by 30%. ",
                ],
            }
        ],
        "projects": [
            {
                "title": "Resume RAG",
                "description": "An AI-powered resume analysis platform.",
                "technologies": ["Docker", "Python", "React"],
                "github_url": "https://github.com/janedoe/resume-rag",
                "live_url": "",
            }
        ],
        "education": [
            {
                "institution": "State University",
                "degree": "B.S. Computer Science",
                "start_date": "2018",
                "end_date": "2022",
                "location": "",
            }
        ],
    }

    # 3. Test Normalizer and Hashing
    norm_profile = normalize_resume(profile_data)
    norm_dirty = normalize_resume(dirty_data)

    hash_profile = get_canonical_hash(norm_profile)
    hash_dirty = get_canonical_hash(norm_dirty)

    print("\n--- Testing Canonical Normalizer & Hashing ---")
    print(f"Profile Hash: {hash_profile}")
    print(f"Dirty Hash:   {hash_dirty}")

    if hash_profile == hash_dirty:
        print(
            "SUCCESS: Semantically identical inputs produced identical canonical hashes!"
        )
    else:
        print("FAIL: Hashes do not match!")
        # Print differences
        for key in norm_profile:
            val_p = norm_profile.get(key)
            val_d = norm_dirty.get(key)
            if val_p != val_d:
                print(f"Mismatch in key '{key}':")
                print(f"  Profile: {json.dumps(val_p)}")
                print(f"  Dirty:   {json.dumps(val_d)}")
        db.close()
        return

    # 4. Test Scoring Consistency
    scores_profile = calculate_scores(norm_profile)
    scores_dirty = calculate_scores(norm_dirty)

    print("\n--- Testing Scoring Consistency ---")
    print(f"Profile Health Score: {scores_profile['resume_health_score']}")
    print(f"Dirty Health Score:   {scores_dirty['resume_health_score']}")
    print(f"Profile ATS Score:    {scores_profile['ats_score']}")
    print(f"Dirty ATS Score:      {scores_dirty['ats_score']}")

    if scores_profile == scores_dirty:
        print(
            "SUCCESS: Semantically identical inputs produced identical deterministic scores!"
        )
    else:
        print("FAIL: Scores do not match!")
        db.close()
        return

    # 5. Test Integration & Cache Hits in DB
    print("\n--- Testing Database Cache Integration ---")

    # Clean up any existing test resumes first
    db.query(Resume).filter(Resume.title.like("Test Resume %")).delete(
        synchronize_session=False
    )
    db.commit()

    resume_a = Resume(
        user_id=user.id,
        title="Test Resume A",
        original_filename="test_a.json",
        file_path="test_a.json",
        parsed_text="Jane Doe Senior Software Engineer Tech Corp...",
        resume_json=json.dumps(norm_profile),
    )
    resume_b = Resume(
        user_id=user.id,
        title="Test Resume B",
        original_filename="test_b.json",
        file_path="test_b.json",
        parsed_text="JANE DOE Senior Software Engineer Tech Corp...",
        resume_json=json.dumps(norm_dirty),
    )

    db.add(resume_a)
    db.add(resume_b)
    db.commit()
    db.refresh(resume_a)
    db.refresh(resume_b)

    print(f"Created Resume A ID: {resume_a.id}")
    print(f"Created Resume B ID: {resume_b.id}")

    try:
        # Run health analysis on A (will trigger cache miss + LLM call or mock result)
        print("\nAnalyzing Health for Resume A (expecting cache miss / LLM call)...")
        result_a = analyze_resume_canonical(db, resume_a)
        print(
            f"Resume A Health Analysis completed. Score: {result_a['resume_health_score']}"
        )

        # Run health analysis on B (should be a cache hit since B has identical content hash!)
        print("\nAnalyzing Health for Resume B (expecting cache hit!)...")
        result_b = analyze_resume_canonical(db, resume_b)
        print(
            f"Resume B Health Analysis completed. Score: {result_b['resume_health_score']}"
        )

        # Verify result content matching
        if (
            result_a["resume_health_score"] == result_b["resume_health_score"]
            and result_a["summary"] == result_b["summary"]
        ):
            print(
                "SUCCESS: Cache hit returned exact identical qualitative and quantitative results for Resume B!"
            )
        else:
            print("FAIL: Cache hit results do not match!")

    finally:
        # Clean up test resumes
        db.query(Resume).filter(Resume.id.in_([resume_a.id, resume_b.id])).delete(
            synchronize_session=False
        )
        db.commit()
        db.close()


if __name__ == "__main__":
    test_pipeline()
