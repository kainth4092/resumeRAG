import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.resume import Resume
from app.models.user_jobs import UserJob
from app.models.interview import InterviewSession
from app.models.interview_bank import InterviewQuestionBank

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard_data(
    local_hour: int = Query(
        None, description="Client local hour (0-23) for dynamic greeting"
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        user_name = current_user.name or current_user.email.split("@")[0]
        if not user_name:
            user_name = "User"

        user_name = " ".join([w.capitalize() for w in user_name.split()])

        if local_hour is None:
            local_hour = datetime.now().hour

        if 5 <= local_hour < 12:
            greeting_type = "Morning"
        elif 12 <= local_hour < 17:
            greeting_type = "Afternoon"
        elif 17 <= local_hour < 22:
            greeting_type = "Evening"
        else:
            greeting_type = "Night"

        greeting = f"Good {greeting_type}, {user_name}"

        resumes = (
            db.query(Resume)
            .filter(Resume.user_id == current_user.id)
            .order_by(Resume.created_at.asc())
            .all()
        )

        tracked_jobs = (
            db.query(UserJob).filter(UserJob.user_id == current_user.id).all()
        )

        interviews = (
            db.query(InterviewSession)
            .filter(InterviewSession.user_id == current_user.id)
            .all()
        )

        community_questions = (
            db.query(InterviewQuestionBank)
            .filter(InterviewQuestionBank.created_by == current_user.id)
            .all()
        )
        empty_states = {
            "no_resumes": len(resumes) == 0,
            "no_jobs": len(tracked_jobs) == 0,
            "no_interviews": len(interviews) == 0,
        }

        # Find active or latest resume
        active_resume = next((r for r in resumes if r.is_active), None)
        if not active_resume and resumes:
            active_resume = resumes[-1]  # latest created is at the end of asc list

        # Parse active resume analysis results
        analysis = None
        if active_resume and active_resume.analysis_results:
            try:
                analysis = json.loads(active_resume.analysis_results)
            except Exception:
                pass

        # If no active resume or no analysis results, provide a baseline
        if not analysis:
            analysis = {
                "ats_score": 75 if active_resume else 0,
                "matched_keywords": (
                    ["React", "JavaScript", "SQL"] if active_resume else []
                ),
                "missing_keywords": (
                    ["TypeScript", "AWS", "Docker"] if active_resume else []
                ),
                "suggestions": [
                    "Upload or generate your resume to get started!",
                    "Analyze your resume against a job description to see suggestions.",
                ],
                "heatmap": {
                    "contact_info": 80 if active_resume else 0,
                    "summary": 60 if active_resume else 0,
                    "skills": 70 if active_resume else 0,
                    "experience": 65 if active_resume else 0,
                    "projects": 50 if active_resume else 0,
                    "education": 90 if active_resume else 0,
                },
            }

        # 3. ATS Score Trend
        # Begins from user's first resume (June onward in chronological order)
        score_trend = []
        for r in resumes:
            month_label = r.created_at.strftime("%b %d") if r.created_at else "Jun 01"
            score_trend.append(
                {"month": month_label, "score": r.ats_score or 75, "title": r.title}
            )

        # 4. Resume DNA (Radar Chart)
        heatmap = analysis.get("heatmap", {})
        resume_dna = [
            {"skill": "Contact Info", "A": heatmap.get("contact_info", 0)},
            {"skill": "Summary", "A": heatmap.get("summary", 0)},
            {"skill": "Skills", "A": heatmap.get("skills", 0)},
            {"skill": "Experience", "A": heatmap.get("experience", 0)},
            {"skill": "Projects", "A": heatmap.get("projects", 0)},
            {"skill": "Education", "A": heatmap.get("education", 0)},
        ]

        # 5. Weekly Activity
        # Build day-by-day mapping for the last 7 days
        days_map = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_counts = {
            day: {"applied": 0, "interviews": 0, "resumes": 0, "questions": 0}
            for day in days_map
        }

        now_utc = datetime.utcnow()
        seven_days_ago = now_utc - timedelta(days=7)

        for job in tracked_jobs:
            if job.created_at and job.created_at >= seven_days_ago:
                day_name = job.created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["applied"] += 1

        for session in interviews:
            if session.created_at and session.created_at >= seven_days_ago:
                day_name = session.created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["interviews"] += 1

        for r in resumes:
            if r.created_at and r.created_at >= seven_days_ago:
                day_name = r.created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["resumes"] += 1

        for q in community_questions:
            if q.created_at and q.created_at >= seven_days_ago:
                day_name = q.created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["questions"] += 1

        weekly_activity = []
        # Return in Mon-Sun order
        for day in days_map:
            weekly_activity.append(
                {
                    "day": day,
                    "applied": weekly_counts[day]["applied"]
                    + weekly_counts[day][
                        "resumes"
                    ],  # Resumes generated + job applications tracked
                    "interviews": weekly_counts[day]["interviews"],
                }
            )

        # 6. Recent Activity Log (aggregated and sorted descending)
        activities = []

        for r in resumes:
            t = r.created_at or datetime.now()
            is_gen = r.title.startswith("Optimized:")
            activities.append(
                {
                    "type": "resume",
                    "title": "Resume Generated" if is_gen else "Resume Uploaded",
                    "body": r.title,
                    "timestamp": t.isoformat(),
                    "time_ms": int(t.timestamp() * 1000),
                }
            )

        for job in tracked_jobs:
            t = job.created_at or datetime.now()
            activities.append(
                {
                    "type": "job",
                    "title": "Job Applied" if job.status == "Applied" else "Job Saved",
                    "body": f"{job.job_title} at {job.company_name}",
                    "timestamp": t.isoformat(),
                    "time_ms": int(t.timestamp() * 1000),
                }
            )

        for session in interviews:
            t = session.created_at or datetime.now()
            activities.append(
                {
                    "type": "interview",
                    "title": "Interview Prep Started",
                    "body": f"Prep session for {session.role or 'Software Engineer'} at {session.company or 'Company'}",
                    "timestamp": t.isoformat(),
                    "time_ms": int(t.timestamp() * 1000),
                }
            )

        for q in community_questions:
            t = q.created_at or datetime.now()
            activities.append(
                {
                    "type": "question",
                    "title": "Community Question Added",
                    "body": (
                        q.question[:60] + "..." if len(q.question) > 60 else q.question
                    ),
                    "timestamp": t.isoformat(),
                    "time_ms": int(t.timestamp() * 1000),
                }
            )

        # Sort activities descending by timestamp
        activities.sort(key=lambda x: x["time_ms"], reverse=True)
        recent_activities = activities[:8]  # return top 8 activities

        # 7. Recruiter Eye Simulation
        # Estimate quality based on average heatmap scores
        scores_list = list(heatmap.values())
        avg_score = int(sum(scores_list) / len(scores_list)) if scores_list else 70

        strongly_visible = []
        needs_improvement = []

        for key, val in heatmap.items():
            nice_name = " ".join([w.capitalize() for w in key.split("_")])
            if val >= 80:
                strongly_visible.append(nice_name)
            else:
                needs_improvement.append(nice_name)

        if not strongly_visible and active_resume:
            strongly_visible = ["Headline", "Education", "Skills"]
        if not needs_improvement and active_resume:
            needs_improvement = ["Projects", "Summary"]

        recruiter_eye = {
            "scan_quality": avg_score,
            "strongly_visible": strongly_visible,
            "needs_improvement": needs_improvement,
        }

        # 8. Resume Insights
        score_val = analysis.get("ats_score", 0)
        if score_val >= 85:
            strength_rating = "Excellent"
        elif score_val >= 70:
            strength_rating = "Good"
        else:
            strength_rating = "Needs Optimization"

        resume_insights = {
            "ats_score": score_val,
            "detected_role": (
                active_resume.title.replace("Optimized: ", "")
                if active_resume
                else "Not Detected"
            ),
            "strength_rating": strength_rating,
            "missing_skills": analysis.get("missing_keywords", []),
            "top_skills": analysis.get("matched_keywords", []),
            "suggestions": analysis.get("suggestions", []),
        }

        # 9. Resume History
        resume_history = []
        for r in resumes[::-1]:  # newest first
            resume_history.append(
                {
                    "id": r.id,
                    "title": r.title,
                    "ats_score": r.ats_score or 75,
                    "version": r.version or "v1",
                    "template": r.template or "Professional",
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                    "is_active": r.is_active,
                }
            )

        return {
            "greeting": greeting,
            "empty_states": empty_states,
            "score_trend": score_trend,
            "resume_dna": resume_dna,
            "weekly_activity": weekly_activity,
            "recent_activities": recent_activities,
            "recruiter_eye": recruiter_eye,
            "resume_insights": resume_insights,
            "resume_history": resume_history,
        }

    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
