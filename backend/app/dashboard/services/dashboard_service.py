import json
from datetime import (
    datetime,
    timezone,
)

from sqlalchemy.orm import Session

from app.models.user import User
from app.dashboard.repository.dashboard_repository import DashboardRepository


class DashboardService:

    @staticmethod
    def _safe_json(value, default=None):
        if default is None:
            default = {}

        if not value:
            return default

        if isinstance(value, (dict, list)):
            return value

        try:
            return json.loads(value)
        except (TypeError, ValueError, json.JSONDecodeError):
            return default

    @staticmethod
    def _get_score(resume, analysis):
        possible_scores = [
            analysis.get("ats_score"),
            analysis.get("overall_score"),
            analysis.get("score"),
            getattr(resume, "ats_score", None),
        ]

        for score in possible_scores:
            try:
                if score is not None:
                    return max(0, min(100, int(float(score))))
            except (ValueError, TypeError):
                continue

        return 0

    @staticmethod
    def _format_date(value):
        if not value:
            return None

        try:
            return value.isoformat()
        except AttributeError:
            return str(value)

    @staticmethod
    def get_dashboard_data(
        db: Session,
        current_user: User,
        local_hour: int | None = None,
    ) -> dict:

        user_id = current_user.id

        raw_name = current_user.name or current_user.email.split("@")[0] or "User"

        user_name = " ".join(word.capitalize() for word in raw_name.split())

        if local_hour is None:
            local_hour = datetime.now().hour

        if 5 <= local_hour < 12:
            greeting_period = "Morning"
        elif 12 <= local_hour < 17:
            greeting_period = "Afternoon"
        elif 17 <= local_hour < 22:
            greeting_period = "Evening"
        else:
            greeting_period = "Night"

        resumes = DashboardRepository.get_user_resumes(
            db,
            user_id,
        )

        jobs = DashboardRepository.get_user_tracked_jobs(
            db,
            user_id,
        )

        interviews = DashboardRepository.get_user_interviews(
            db,
            user_id,
        )

        mock_interviews = DashboardRepository.get_user_mock_interviews(
            db,
            user_id,
        )

        community_questions = DashboardRepository.get_user_community_questions(
            db,
            user_id,
        )

        skills = DashboardRepository.get_user_skills(
            db,
            user_id,
        )

        projects = DashboardRepository.get_user_projects(
            db,
            user_id,
        )

        experience = DashboardRepository.get_user_experience(
            db,
            user_id,
        )

        education = DashboardRepository.get_user_education(
            db,
            user_id,
        )

        # -----------------------------------------
        # ACTIVE/LATEST RESUME
        # -----------------------------------------

        active_resume = next(
            (resume for resume in resumes if getattr(resume, "is_active", False)),
            None,
        )

        if active_resume is None and resumes:
            active_resume = resumes[0]

        active_analysis = {}

        if active_resume:
            active_analysis = DashboardService._safe_json(
                getattr(
                    active_resume,
                    "analysis_results",
                    None,
                ),
                {},
            )

        current_ats_score = 0

        if active_resume:
            current_ats_score = DashboardService._get_score(
                active_resume,
                active_analysis,
            )

        # -----------------------------------------
        # REAL ATS HISTORY
        # -----------------------------------------

        resume_history = []

        for resume in resumes:
            analysis = DashboardService._safe_json(
                getattr(
                    resume,
                    "analysis_results",
                    None,
                ),
                {},
            )

            resume_history.append(
                {
                    "id": resume.id,
                    "title": (resume.title or resume.original_filename or "Resume"),
                    "score": DashboardService._get_score(
                        resume,
                        analysis,
                    ),
                    "is_active": bool(
                        getattr(
                            resume,
                            "is_active",
                            False,
                        )
                    ),
                    "created_at": (DashboardService._format_date(resume.created_at)),
                }
            )

        # -----------------------------------------
        # PROFILE COMPLETION
        # -----------------------------------------

        profile_checks = [
            bool(raw_name),
            bool(skills),
            bool(projects),
            bool(education),
            bool(experience),
            bool(resumes),
        ]

        completed_profile_items = sum(profile_checks)

        profile_completion = round(
            (completed_profile_items / len(profile_checks)) * 100
        )

        # -----------------------------------------
        # REAL JOB COUNTS
        # -----------------------------------------

        status_counts = {}

        for job in jobs:
            status = getattr(job, "status", None) or "Saved"

            normalized_status = str(status).strip().lower()

            status_counts[normalized_status] = (
                status_counts.get(
                    normalized_status,
                    0,
                )
                + 1
            )

        applied_jobs = sum(
            value
            for key, value in status_counts.items()
            if key
            in {
                "applied",
                "application",
            }
        )

        interview_jobs = sum(
            value
            for key, value in status_counts.items()
            if key
            in {
                "interview",
                "interviewing",
            }
        )

        offer_jobs = sum(
            value
            for key, value in status_counts.items()
            if key
            in {
                "offer",
                "offered",
                "accepted",
            }
        )

        # -----------------------------------------
        # REAL RECENT ACTIVITY
        # -----------------------------------------

        activities = []

        for resume in resumes[:5]:
            activities.append(
                {
                    "id": f"resume-{resume.id}",
                    "type": "resume",
                    "title": "Resume saved",
                    "description": (
                        resume.title or resume.original_filename or "Resume"
                    ),
                    "created_at": (DashboardService._format_date(resume.created_at)),
                }
            )

        for job in jobs[:5]:
            activities.append(
                {
                    "id": f"job-{job.id}",
                    "type": "job",
                    "title": "Job tracked",
                    "description": (
                        (
                            f"{job.job_title} at "
                            f"{job.company_name}"
                        )
                        if (
                            getattr(
                                job,
                                "job_title",
                                None,
                            )
                            and getattr(
                                job,
                                "company_name",
                                None,
                            )
                        )
                        else (
                            getattr(
                                job,
                                "job_title",
                                None,
                            )
                            or "Job application"
                        )
                    ),
                    "created_at": (
                        DashboardService._format_date(
                            getattr(
                                job,
                                "created_at",
                                None,
                            )
                        )
                    ),
                }
            )

        for interview in interviews[:5]:
            activities.append(
                {
                    "id": (f"interview-{interview.id}"),
                    "type": "interview",
                    "title": "Interview prepared",
                    "description": (
                        interview.role or interview.company or "Interview session"
                    ),
                    "created_at": (DashboardService._format_date(interview.created_at)),
                }
            )

        activities.sort(
            key=lambda item: (item.get("created_at") or ""),
            reverse=True,
        )

        activities = activities[:10]

        # -----------------------------------------
        # REAL SUGGESTIONS
        # No OpenRouter call
        # -----------------------------------------

        suggestions = []

        saved_suggestions = active_analysis.get("suggestions") or []

        if isinstance(saved_suggestions, list):
            suggestions.extend(str(item) for item in saved_suggestions[:3] if item)

        if not resumes:
            suggestions.append("Upload a resume to start ATS analysis.")

        if resumes and current_ats_score == 0:
            suggestions.append(
                "Analyze your resume against a job description to generate an ATS score."
            )

        if not skills:
            suggestions.append(
                "Add your technical skills to improve profile completeness."
            )

        if not projects:
            suggestions.append(
                "Add at least one project to strengthen your professional profile."
            )

        if not jobs:
            suggestions.append(
                "Add a job application to start tracking your job search."
            )

        if not interviews and not mock_interviews:
            suggestions.append("Complete an interview practice session.")

        suggestions = list(dict.fromkeys(suggestions))[:5]

        # -----------------------------------------
        # FINAL RESPONSE
        # -----------------------------------------

        return {
            "greeting": (f"Good {greeting_period}, " f"{user_name}"),
            "user_name": user_name,
            "current_ats_score": current_ats_score,
            "ats_score": current_ats_score,
            "profile_completion": profile_completion,
            "total_resumes": len(resumes),
            "total_tracked_jobs": len(jobs),
            "total_interviews": (len(interviews) + len(mock_interviews)),
            "community_questions": (len(community_questions)),
            "job_statistics": {
                "total": len(jobs),
                "applied": applied_jobs,
                "interviews": interview_jobs,
                "offers": offer_jobs,
                "statuses": status_counts,
            },
            "profile_statistics": {
                "skills": len(skills),
                "projects": len(projects),
                "experience": len(experience),
                "education": len(education),
            },
            "resume_history": resume_history,
            "recent_activity": activities,
            "activities": activities,
            "suggestions": suggestions,
            "matched_keywords": (
                active_analysis.get(
                    "matched_keywords",
                    [],
                )
            ),
            "missing_keywords": (
                active_analysis.get(
                    "missing_keywords",
                    [],
                )
            ),
            "empty_states": {
                "no_resumes": len(resumes) == 0,
                "no_jobs": len(jobs) == 0,
                "no_interviews": (len(interviews) == 0 and len(mock_interviews) == 0),
            },
            "generated_at": (
                datetime.now(
                    timezone.utc
                ).isoformat()
            ),
        }
