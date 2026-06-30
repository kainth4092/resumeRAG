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
        return db.query(Resume).filter(Resume.user_id == user_id, Resume.is_active == True).first()

    @staticmethod
    def get_latest_resume(db: Session, user_id: int):
        return db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.created_at.desc()).first()

    @staticmethod
    def get_cached_search(db: Session, query_key: str):
        return db.query(SearchCache).filter(SearchCache.query == query_key).first()

    @staticmethod
    def add_search_cache(db: Session, query_key: str, jobs_json: list):
        new_cache = SearchCache(query=query_key, jobs_json=jobs_json)
        db.add(new_cache)
        db.commit()
        return new_cache

    @staticmethod
    def get_cached_job(db: Session, job_id: str):
        return db.query(JobCache).filter(JobCache.job_id == job_id).first()

    @staticmethod
    def add_job_cache(db: Session, job_id: str, data: dict):
        new_job_cache = JobCache(job_id=job_id, data=data)
        db.add(new_job_cache)
        db.commit()
        return new_job_cache
