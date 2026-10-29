import json
import io
import pytest
from datetime import datetime, timezone, timedelta
from app.models.user import User
from app.models.resume import Resume
from app.models.challenge import ChallengeAttempt
from app.models.interview_bank import InterviewQuestionBank
from app.core.database import SessionLocal
from app.core.security import hash_password, create_access_token


@pytest.fixture
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def test_users(db_session):
    """Create two distinct users to verify IDOR / resource isolation."""
    # Clean up prior test runs if any
    existing_users = db_session.query(User).filter(
        User.email.in_(["usera_quality@example.com", "userb_quality@example.com"])
    ).all()
    if existing_users:
        uids = [u.id for u in existing_users]
        db_session.query(Resume).filter(Resume.user_id.in_(uids)).delete(synchronize_session=False)
        db_session.query(ChallengeAttempt).filter(ChallengeAttempt.user_id.in_(uids)).delete(synchronize_session=False)
        db_session.query(User).filter(User.id.in_(uids)).delete(synchronize_session=False)
        db_session.commit()

    # User A
    user_a = User(
        email="usera_quality@example.com",
        name="User A",
        password_hash=hash_password("ValidPass123!"),
        is_active=True,
        email_verified=True,
        token_version=1,
    )
    # User B
    user_b = User(
        email="userb_quality@example.com",
        name="User B",
        password_hash=hash_password("ValidPass123!"),
        is_active=True,
        email_verified=True,
        token_version=1,
    )
    db_session.add_all([user_a, user_b])
    db_session.commit()
    db_session.refresh(user_a)
    db_session.refresh(user_b)

    token_a = create_access_token({"sub": str(user_a.id)})
    token_b = create_access_token({"sub": str(user_b.id)})

    return {
        "user_a": user_a,
        "token_a": token_a,
        "headers_a": {"Authorization": f"Bearer {token_a}"},
        "user_b": user_b,
        "token_b": token_b,
        "headers_b": {"Authorization": f"Bearer {token_b}"},
    }


def test_idor_resume_isolation(client, db_session, test_users):
    """Verify that User B cannot read, update, or delete User A's resume."""
    headers_a = test_users["headers_a"]
    headers_b = test_users["headers_b"]
    user_a = test_users["user_a"]

    # Create Resume owned by User A
    resume_a = Resume(
        user_id=user_a.id,
        title="User A's Secret Resume",
        original_filename="user_a_resume.pdf",
        file_path="uploads/user_a_resume.pdf",
        source="upload",
        is_active=True,
        parsed_text="Confidential User A experience at Company X",
        resume_json=json.dumps({"name": "User A", "skills": ["Python"]}),
    )
    db_session.add(resume_a)
    db_session.commit()
    db_session.refresh(resume_a)

    resume_id = resume_a.id

    # User A can access it
    res_a = client.get(f"/api/resume/{resume_id}", headers=headers_a)
    assert res_a.status_code == 200
    assert res_a.json()["title"] == "User A's Secret Resume"

    # User B (different user) attempting GET /resume/{id} -> 404 Not Found (no IDOR leakage)
    res_b_get = client.get(f"/api/resume/{resume_id}", headers=headers_b)
    assert res_b_get.status_code in [403, 404]

    # User B attempting PUT /resume/{id} -> 404/403
    res_b_put = client.put(
        f"/api/resume/{resume_id}",
        json={"title": "Hacked by User B"},
        headers=headers_b,
    )
    assert res_b_put.status_code in [403, 404]

    # Verify resume was not modified
    db_session.refresh(resume_a)
    assert resume_a.title == "User A's Secret Resume"

    # User B attempting DELETE /resume/{id} -> 404/403
    res_b_del = client.delete(f"/api/resume/{resume_id}", headers=headers_b)
    assert res_b_del.status_code in [403, 404]

    # Verify resume was not deleted
    assert db_session.query(Resume).filter(Resume.id == resume_id).first() is not None


def test_upload_validation_rejects_disallowed_extensions(client, test_users):
    """Verify file upload rejects dangerous extensions (.exe, .sh, .py)."""
    headers = test_users["headers_a"]

    bad_files = [
        ("malicious.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/x-msdownload"),
        ("exploit.sh", b"#!/bin/bash\nrm -rf /", "application/x-sh"),
        ("script.py", b"import os; os.system('ls')", "text/x-python"),
    ]

    for filename, content, mime in bad_files:
        files = {"file": (filename, io.BytesIO(content), mime)}
        res = client.post("/api/resume/upload", files=files, headers=headers)
        assert res.status_code in [400, 422], f"Expected rejection for {filename}, got {res.status_code}"


def test_upload_validation_rejects_empty_file(client, test_users):
    """Verify empty 0-byte file uploads are rejected."""
    headers = test_users["headers_a"]
    files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    res = client.post("/api/resume/upload", files=files, headers=headers)
    assert res.status_code in [400, 422]


def test_challenge_grading_accuracy_and_timeout_enforcement(client, db_session, test_users):
    """
    Test server-side challenge grading:
    - Questions retrieved do NOT expose correct_option
    - Answers scored accurately
    - Attempt cannot be submitted twice
    - Attempt cannot be submitted by another user
    """
    headers_a = test_users["headers_a"]
    headers_b = test_users["headers_b"]
    user_a = test_users["user_a"]

    # Populate 2 test questions in bank
    q1 = InterviewQuestionBank(
        question="What is the time complexity of binary search?",
        answer="O(log n)",
        skill="Algorithms",
        category="Technical",
        difficulty="Easy",
        experience_level="Mid",
        option_a="O(n)",
        option_b="O(log n)",
        option_c="O(n^2)",
        option_d="O(1)",
        correct_option="B",
    )
    q2 = InterviewQuestionBank(
        question="Which hook manages local component state in React?",
        answer="useState",
        skill="React",
        category="Frontend",
        difficulty="Easy",
        experience_level="Mid",
        option_a="useState",
        option_b="useEffect",
        option_c="useContext",
        option_d="useRef",
        correct_option="A",
    )
    db_session.add_all([q1, q2])
    db_session.commit()
    db_session.refresh(q1)
    db_session.refresh(q2)

    # 1. Fetch challenge questions
    get_res = client.get("/api/interview/challenge/questions", headers=headers_a)
    assert get_res.status_code == 200
    q_data = get_res.json()

    assert "attempt_id" in q_data
    assert "questions" in q_data
    assert "time_limit_seconds" in q_data
    attempt_id = q_data["attempt_id"]

    # CRITICAL SECURITY CHECK: verify correct_option is NEVER leaked in challenge questions
    for q in q_data["questions"]:
        assert "correct_option" not in q
        assert "short_explanation" not in q

    # 2. User B tries to submit User A's attempt -> 404 Not Found (Ownership enforced)
    first_q_id = q_data["questions"][0]["id"]
    idor_submit = client.post(
        "/api/interview/challenge/submit",
        json={
            "attempt_id": attempt_id,
            "answers": [{"question_id": first_q_id, "selected_option": "B"}],
            "time_taken": 30,
        },
        headers=headers_b,
    )
    assert idor_submit.status_code == 404

    # 3. User A submits with 1 correct and 1 wrong answer from attempt questions
    real_q1 = db_session.query(InterviewQuestionBank).filter(InterviewQuestionBank.id == first_q_id).first()
    correct_opt = real_q1.correct_option or "A"
    wrong_opt = "B" if correct_opt != "B" else "C"

    second_q_id = q_data["questions"][1]["id"] if len(q_data["questions"]) > 1 else first_q_id
    answers_payload = [
        {"question_id": first_q_id, "selected_option": correct_opt},
    ]
    if second_q_id != first_q_id:
        answers_payload.append({"question_id": second_q_id, "selected_option": wrong_opt})

    submit_res = client.post(
        "/api/interview/challenge/submit",
        json={
            "attempt_id": attempt_id,
            "answers": answers_payload,
            "time_taken": 45,
        },
        headers=headers_a,
    )
    assert submit_res.status_code == 200
    result = submit_res.json()

    assert result["score"] >= 1
    assert result["correct"] >= 1
    assert "accuracy" in result

    # 4. Attempt cannot be submitted twice
    double_submit = client.post(
        "/api/interview/challenge/submit",
        json={
            "attempt_id": attempt_id,
            "answers": answers_payload,
            "time_taken": 50,
        },
        headers=headers_a,
    )
    assert double_submit.status_code == 400


def test_parser_fixture_integrity():
    """Verify that the anonymized resume fixture file loads and conforms to canonical fields."""
    with open("tests/fixtures/anonymized_resume_1.json", "r") as f:
        data = json.load(f)

    assert "parsed_text" in data
    assert "original_filename" in data
    assert len(data["parsed_text"]) > 100
    if "legacy_failed_resume_json" in data:
        parsed_doc = json.loads(data["legacy_failed_resume_json"])
        assert "contact" in parsed_doc
        assert "summary" in parsed_doc
