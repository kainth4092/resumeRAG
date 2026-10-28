from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.models.user_skill import UserSkill
from app.models.resume import Resume
from app.models.job_cache import SearchCache, JobCache

class JobsRepository:
    @staticmethod
    def get_user_profile(db: Session, user_id: int):
        return db.query(Profile).filter(Profile.user_id == user_id).first()

    @staticmethod
    def get_user_skills(db: Session, user_id: int):
        return db.query(UserSkill).filter(UserSkill.user_id == user_id).all()

    @staticmethod
    def get_active_resume(db: Session, user_id: int):
        return db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active).first()

    @staticmethod
    def get_latest_resume(db: Session, user_id: int):
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).first()

    @staticmethod
    def get_cached_search(db: Session, query_key: str):
        cache = db.query(SearchCache).filter(SearchCache.query == query_key).first()
        if not cache or not cache.created_at:
            return None
        # Enforce 6-hour TTL
        now = datetime.now(timezone.utc) if cache.created_at.tzinfo else datetime.utcnow()
        if cache.created_at < now - timedelta(hours=6):
            return None
        return cache

    @staticmethod
    def add_search_cache(db: Session, query_key: str, jobs_json: list):
        try:
            existing = db.query(SearchCache).filter(SearchCache.query == query_key).first()
            if existing:
                existing.jobs_json = jobs_json
                existing.created_at = datetime.utcnow()
                db.commit()
                return existing
            new_cache = SearchCache(query=query_key, jobs_json=jobs_json)
            db.add(new_cache)
            db.commit()
            return new_cache
        except Exception:
            db.rollback()
            return None

    @staticmethod
    def get_cached_job(db: Session, job_id: str):
        cache = db.query(JobCache).filter(JobCache.job_id == job_id).first()
        if not cache or not cache.created_at:
            return None
        # Enforce 24-hour TTL
        now = datetime.now(timezone.utc) if cache.created_at.tzinfo else datetime.utcnow()
        if cache.created_at < now - timedelta(hours=24):
            return None
        return cache

    @staticmethod
    def add_job_cache(db: Session, job_id: str, data: dict):
        try:
            existing = db.query(JobCache).filter(JobCache.job_id == job_id).first()
            if existing:
                existing.data = data
                existing.created_at = datetime.utcnow()
                db.commit()
                return existing
            new_job_cache = JobCache(job_id=job_id, data=data)
            db.add(new_job_cache)
            db.commit()
            return new_job_cache
        except Exception:
            db.rollback()
            return None

