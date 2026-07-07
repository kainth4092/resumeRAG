import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.dashboard.repository.dashboard_repository import DashboardRepository

class DashboardService:
    @staticmethod
    def get_dashboard_data(db: Session, current_user: User, local_hour: int = None) -> dict:
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

        resumes = DashboardRepository.get_user_resumes(db, current_user.id)
        tracked_jobs = DashboardRepository.get_user_tracked_jobs(db, current_user.id)
        interviews = DashboardRepository.get_user_interviews(db, current_user.id)
        community_questions = DashboardRepository.get_user_community_questions(db, current_user.id)

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
                "ats_score": active_resume.ats_score or 0 if active_resume else 0,
                "matched_keywords": [],
                "missing_keywords": [],
                "suggestions": [
                    "Upload or generate your resume to get started!",
                    "Analyze your resume against a job description to see suggestions.",
                ] if not active_resume else [
                    "Review suggestions on the Resume Analysis page.",
                    "Optimize formatting and keywords to boost your ATS score."
                ],
                "heatmap": {
                    "contact_info": 0,
                    "summary": 0,
                    "skills": 0,
                    "experience": 0,
                    "projects": 0,
                    "education": 0,
                },
            }

        # 3. ATS Score Trend
        score_trend = []
        for r in resumes:
            month_label = r.created_at.strftime("%b %d") if r.created_at else "Jun 01"
            score_trend.append(
                {"month": month_label, "score": r.ats_score or 0, "title": r.title}
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
        days_map = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_counts = {
            day: {"applied": 0, "interviews": 0, "resumes": 0, "questions": 0}
            for day in days_map
        }

        def make_naive(dt):
            if dt is None:
                return None
            return dt.replace(tzinfo=None) if dt.tzinfo is not None else dt

        now_utc = datetime.utcnow()
        seven_days_ago = now_utc - timedelta(days=7)

        for job in tracked_jobs:
            job_created_at = make_naive(job.created_at)
            if job_created_at and job_created_at >= seven_days_ago:
                day_name = job_created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["applied"] += 1

        for session in interviews:
            session_created_at = make_naive(session.created_at)
            if session_created_at and session_created_at >= seven_days_ago:
                day_name = session_created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["interviews"] += 1

        for r in resumes:
            r_created_at = make_naive(r.created_at)
            if r_created_at and r_created_at >= seven_days_ago:
                day_name = r_created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["resumes"] += 1

        for q in community_questions:
            q_created_at = make_naive(q.created_at)
            if q_created_at and q_created_at >= seven_days_ago:
                day_name = q_created_at.strftime("%a")
                if day_name in weekly_counts:
                    weekly_counts[day_name]["questions"] += 1

        weekly_activity = []
        for day in days_map:
            weekly_activity.append(
                {
                    "day": day,
                    "applied": weekly_counts[day]["applied"] + weekly_counts[day]["resumes"],
                    "interviews": weekly_counts[day]["interviews"],
                }
            )

        # 6. Recent Activity Log
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

        activities.sort(key=lambda x: x["time_ms"], reverse=True)
        recent_activities = activities[:8]

        # 7. Recruiter Eye Simulation
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
        for r in resumes[::-1]:
            resume_history.append(
                {
                    "id": r.id,
                    "title": r.title,
                    "ats_score": r.ats_score or 0,
                    "version": r.version or "v1",
                    "template": r.template or "Professional",
                    "created_at": r.created_at.isoformat() if r.created_at else None,
                    "is_active": r.is_active,
                }
            )

        # 10. Stats Summary
        thirty_days_ago = now_utc - timedelta(days=30)
        resumes_this_month = sum(1 for r in resumes if make_naive(r.created_at) and make_naive(r.created_at) >= thirty_days_ago)
        jobs_this_week = sum(1 for j in tracked_jobs if make_naive(j.created_at) and make_naive(j.created_at) >= seven_days_ago)
        interviews_this_week = sum(1 for i in interviews if make_naive(i.created_at) and make_naive(i.created_at) >= seven_days_ago)

        ats_trend = None
        if len(resumes) >= 2:
            latest_score = resumes[-1].ats_score or 0
            prev_score = resumes[-2].ats_score or 0
            diff = latest_score - prev_score
            if diff > 0:
                ats_trend = f"+{diff} pts"
            elif diff < 0:
                ats_trend = f"{diff} pts"
            else:
                ats_trend = "Steady"

        stats_summary = {
            "ats_score": score_val,
            "ats_trend": ats_trend or "First version",
            "resumes_count": len(resumes),
            "resumes_trend": f"+{resumes_this_month} this month" if resumes_this_month > 0 else "0 this month",
            "jobs_count": len(tracked_jobs),
            "jobs_trend": f"+{jobs_this_week} this week" if jobs_this_week > 0 else "0 this week",
            "interviews_count": len(interviews),
            "interviews_trend": f"+{interviews_this_week} this week" if interviews_this_week > 0 else "0 this week",
        }

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
            "total_tracked_jobs": len(tracked_jobs),
            "total_interviews": len(interviews),
            "stats_summary": stats_summary,
        }

