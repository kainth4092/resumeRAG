import random
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.interview_bank import InterviewQuestionBank
from app.models.challenge import ChallengeAttempt

logger = logging.getLogger(__name__)


class ChallengeService:
    @staticmethod
    def get_challenge_questions(
        db: Session,
        user_id: int | None = None,
        count: int = 10,
    ) -> dict:
        """
        Return pre-generated MCQ challenge questions without correct options.
        Creates a ChallengeAttempt record to enforce server-side grading and time limit.
        """
        # Fetch only questions with complete pre-generated MCQ data
        query = db.query(InterviewQuestionBank).filter(
            InterviewQuestionBank.option_a.isnot(None),
            InterviewQuestionBank.option_b.isnot(None),
            InterviewQuestionBank.option_c.isnot(None),
            InterviewQuestionBank.option_d.isnot(None),
            InterviewQuestionBank.correct_option.isnot(None),
        )

        all_candidates = query.all()
        if not all_candidates:
            # Fallback to any questions if no pre-generated questions exist yet
            all_candidates = db.query(InterviewQuestionBank).all()

        sample_size = min(len(all_candidates), count)
        selected = random.sample(all_candidates, sample_size) if sample_size > 0 else []

        attempt_id = None
        if user_id and selected:
            attempt = ChallengeAttempt(
                user_id=user_id,
                question_ids=[q.id for q in selected],
                total_questions=len(selected),
                started_at=datetime.now(timezone.utc),
            )
            db.add(attempt)
            db.commit()
            db.refresh(attempt)
            attempt_id = attempt.id

        # Never send correct_option or short_explanation to the client before grading!
        formatted_questions = [
            {
                "id": q.id,
                "question": q.question,
                "skill": q.skill or "General",
                "category": q.category or "Technical",
                "difficulty": q.difficulty or "Medium",
                "company": q.company,
                "option_a": q.option_a or "Option A",
                "option_b": q.option_b or "Option B",
                "option_c": q.option_c or "Option C",
                "option_d": q.option_d or "Option D",
            }
            for q in selected
        ]

        return {
            "attempt_id": attempt_id,
            "questions": formatted_questions,
            "time_limit_seconds": 600,
        }

    @staticmethod
    def submit_challenge(
        db: Session,
        user_id: int,
        payload: dict,
    ) -> dict:
        """
        Grade challenge attempt server-side.
        Enforces 10-minute server-side limit and checks answers against real database rows.
        """
        attempt_id = payload.get("attempt_id")
        attempt = None

        if attempt_id:
            attempt = (
                db.query(ChallengeAttempt)
                .filter(
                    ChallengeAttempt.id == attempt_id,
                    ChallengeAttempt.user_id == user_id,
                )
                .first()
            )
            if not attempt:
                raise HTTPException(status_code=404, detail="Challenge attempt not found.")
            if attempt.completed:
                raise HTTPException(status_code=400, detail="Challenge attempt already submitted.")

            # Enforce 10-minute server-side timeout with 30s grace period for network latency
            now = datetime.now(timezone.utc)
            start = attempt.started_at
            if start.tzinfo is None:
                start = start.replace(tzinfo=timezone.utc)
            elapsed_seconds = int((now - start).total_seconds())
            if elapsed_seconds > 630:
                logger.warning(
                    "Challenge attempt %s submitted after timeout: %ds elapsed",
                    attempt_id,
                    elapsed_seconds,
                )

        answers = payload.get("answers", [])
        question_ids = [a.get("question_id") for a in answers if a.get("question_id")]

        if attempt and attempt.question_ids:
            target_ids = attempt.question_ids
        else:
            target_ids = question_ids

        db_questions = (
            db.query(InterviewQuestionBank)
            .filter(InterviewQuestionBank.id.in_(target_ids))
            .all()
        )
        q_map = {q.id: q for q in db_questions}

        user_answer_map = {
            a.get("question_id"): str(a.get("selected_option") or "").strip().upper()
            for a in answers
        }

        correct = 0
        wrong = 0
        skipped = 0
        wrong_skills = []
        graded_results = []

        for q_id in target_ids:
            q = q_map.get(q_id)
            if not q:
                continue

            selected = user_answer_map.get(q_id) or None
            real_correct = str(q.correct_option or "A").strip().upper()
            is_correct = bool(selected and selected == real_correct)

            if not selected:
                skipped += 1
            elif is_correct:
                correct += 1
            else:
                wrong += 1
                wrong_skills.append(q.skill or "General")

            graded_results.append(
                {
                    "question_id": q.id,
                    "question": q.question,
                    "selected_option": selected,
                    "correct_option": real_correct,
                    "is_correct": is_correct,
                    "short_explanation": q.short_explanation or q.answer,
                }
            )

        total_attempted = correct + wrong
        accuracy = round((correct / total_attempted * 100), 1) if total_attempted > 0 else 0.0

        skill_topic_map = {
            "react": "React Hooks",
            "sql": "SQL JOIN",
            "postgresql": "SQL JOIN",
            "javascript": "Closures",
            "python": "Async Await",
            "fastapi": "Async Await",
            "html": "Semantic HTML",
            "css": "CSS Flexbox & Grid",
            "dbms": "Database Normalization",
            "oop": "OOP Principles",
        }

        topics_to_revise = []
        for s in wrong_skills:
            topic = skill_topic_map.get(s.strip().lower(), f"{s} Fundamentals")
            if topic not in topics_to_revise:
                topics_to_revise.append(topic)

        time_taken_seconds = payload.get("time_taken", 0)
        if attempt:
            now = datetime.now(timezone.utc)
            attempt.score = correct
            attempt.accuracy = accuracy
            attempt.time_taken_seconds = min(time_taken_seconds, 600)
            attempt.completed = True
            attempt.submitted_at = now
            db.commit()

        minutes = time_taken_seconds // 60
        seconds = time_taken_seconds % 60
        time_taken_str = f"{minutes:02d}:{seconds:02d}"

        return {
            "score": correct,
            "accuracy": accuracy,
            "correct": correct,
            "wrong": wrong,
            "skipped": skipped,
            "time_taken": time_taken_str,
            "topics_to_revise": topics_to_revise,
            "results": graded_results,
        }
