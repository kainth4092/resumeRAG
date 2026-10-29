import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.resume import Resume
from app.models.job_context import JobContext
from app.models.interview import InterviewSession, InterviewQuestion
from app.models.interview_bank import InterviewQuestionBank
from app.schemas.resume_doc import to_resume_doc

logger = logging.getLogger(__name__)


def prepare_interview_session(
    db: Session,
    user_id: int,
    generated_resume: Resume,
    job_context: JobContext,
    skill_gaps: list[str],
    pipeline_run_id: str | None = None,
) -> InterviewSession:
    """
    Step 4: Create one InterviewSession bound to generated resume + JD.
    Generates exactly 25 structured questions across:
    - Technical (matched skills, querying question bank first)
    - Project (from resume's real projects)
    - Experience (from resume's real experience bullets)
    - Gap-based ("how would you learn X" for skill_gaps)
    - Behavioral
    Answers stay lazy with details_generated=False.
    """
    resume_doc = to_resume_doc(generated_resume.resume_json or generated_resume.parsed_text)
    company_name = job_context.company or "Target Company"
    role_name = job_context.title or resume_doc.headline or "Software Engineer"
    candidate_type = (job_context.seniority or "MID").upper()

    session = InterviewSession(
        user_id=user_id,
        resume_id=generated_resume.id,
        job_context_id=job_context.id,
        pipeline_run_id=pipeline_run_id,
        company=company_name,
        role=role_name,
        candidate_type=candidate_type,
        job_description=job_context.raw_description,
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    questions_to_create: list[dict] = []

    # 1. Technical Questions (Target: 8)
    # Check bank first for matching skills
    matched_skills = [
        s for s in resume_doc.skills
        if s.lower() in [req.lower() for req in (job_context.required_skills or [])]
    ] or resume_doc.skills

    bank_questions = []
    if matched_skills:
        skill_clauses = [
            func.lower(InterviewQuestionBank.skill) == s.strip().lower()
            for s in matched_skills[:10]
            if s and s.strip()
        ]
        bank_questions = (
            db.query(InterviewQuestionBank)
            .filter(or_(*skill_clauses))
            .limit(8)
            .all()
        )

    for bq in bank_questions:
        questions_to_create.append({
            "category": "Technical",
            "question": bq.question,
            "difficulty": bq.difficulty or "Medium",
            "tech_skill": bq.skill,
            "estimated_duration": "3-4 minutes",
        })

    # Fill remaining technical questions up to 8
    target_tech_count = 8
    for skill in matched_skills:
        if len(questions_to_create) >= target_tech_count:
            break
        questions_to_create.append({
            "category": "Technical",
            "question": f"How do you approach performance optimization and architecture design when building scalable systems with {skill}?",
            "difficulty": "Medium",
            "tech_skill": skill,
            "estimated_duration": "3-4 minutes",
        })

    # 2. Project Questions (Target: 5)
    for proj in resume_doc.projects[:5]:
        techs = ", ".join(proj.technologies[:3]) if proj.technologies else "modern technologies"
        bullet_ctx = proj.bullets[0] if proj.bullets else "the core architecture"
        questions_to_create.append({
            "category": "Project",
            "question": f"In your project '{proj.title}', what key technical trade-offs did you make when implementing {bullet_ctx} using {techs}?",
            "difficulty": "Medium",
            "tech_skill": proj.technologies[0] if proj.technologies else None,
            "estimated_duration": "3-4 minutes",
        })

    while len([q for q in questions_to_create if q["category"] == "Project"]) < 5:
        questions_to_create.append({
            "category": "Project",
            "question": "Walk me through the most technically challenging bug or outage you encountered in a recent project and how you resolved it.",
            "difficulty": "Medium",
            "tech_skill": None,
            "estimated_duration": "3-4 minutes",
        })

    # 3. Experience Questions (Target: 5)
    for exp in resume_doc.experience[:5]:
        bullet = exp.bullets[0] if exp.bullets else "your primary responsibilities"
        questions_to_create.append({
            "category": "Experience",
            "question": f"During your time at {exp.company} as {exp.role}, you worked on {bullet}. What metrics or results validated your approach?",
            "difficulty": "Medium",
            "tech_skill": None,
            "estimated_duration": "3-4 minutes",
        })

    while len([q for q in questions_to_create if q["category"] == "Experience"]) < 5:
        questions_to_create.append({
            "category": "Experience",
            "question": "Can you describe a time at work when project requirements shifted abruptly, and how you managed delivery without sacrificing quality?",
            "difficulty": "Medium",
            "tech_skill": None,
            "estimated_duration": "3-4 minutes",
        })

    # 4. Gap-based Questions (Target: 4)
    gaps_to_use = skill_gaps if skill_gaps else (job_context.preferred_skills or ["emerging industry tools"])
    for gap in gaps_to_use[:4]:
        questions_to_create.append({
            "category": "Skill Gap",
            "question": f"This role values experience with {gap}. How would you ramp up and apply your core engineering strengths to quickly master {gap} at {company_name}?",
            "difficulty": "Medium",
            "tech_skill": gap,
            "estimated_duration": "3-4 minutes",
        })

    while len([q for q in questions_to_create if q["category"] == "Skill Gap"]) < 4:
        questions_to_create.append({
            "category": "Skill Gap",
            "question": "How do you systematically evaluate and learn new frameworks or architectural patterns that your team adopts?",
            "difficulty": "Medium",
            "tech_skill": None,
            "estimated_duration": "3-4 minutes",
        })

    # 5. Behavioral Questions (Target: 3)
    behavioral_qs = [
        "Tell me about a time you had a technical disagreement with a peer or team lead. How did you resolve it and keep the project moving?",
        "Describe a situation where a production issue occurred due to your team's code. How did you communicate with stakeholders and post-mortem the root cause?",
        "How do you balance engineering velocity with technical debt when under strict business deadlines?",
    ]
    for b_q in behavioral_qs[:3]:
        questions_to_create.append({
            "category": "Behavioral",
            "question": b_q,
            "difficulty": "Medium",
            "tech_skill": None,
            "estimated_duration": "3-4 minutes",
        })

    # Ensure total is exactly 25
    final_questions = questions_to_create[:25]
    while len(final_questions) < 25:
        final_questions.append({
            "category": "Behavioral",
            "question": "What is the most significant technical contribution you have made to an engineering team, and what was its long-term impact?",
            "difficulty": "Medium",
            "tech_skill": None,
            "estimated_duration": "3-4 minutes",
        })

    # Persist in DB with details_generated=False (lazy answers)
    for q_data in final_questions:
        iq = InterviewQuestion(
            session_id=session.id,
            category=q_data["category"],
            question=q_data["question"],
            difficulty=q_data["difficulty"],
            estimated_duration=q_data["estimated_duration"],
            tech_skill=q_data.get("tech_skill"),
            answer=None,
            details_generated=False,
            bookmarked=False,
        )
        db.add(iq)

    db.commit()
    db.refresh(session)
    return session
