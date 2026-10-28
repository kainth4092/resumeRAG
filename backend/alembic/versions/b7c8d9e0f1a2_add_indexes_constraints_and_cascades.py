"""add_indexes_constraints_and_cascades

Revision ID: b7c8d9e0f1a2
Revises: 9ecf701a092e
Create Date: 2026-10-28 16:25:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b7c8d9e0f1a2"
down_revision: Union[str, Sequence[str], None] = "9ecf701a092e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Unique constraint on (user_jobs.user_id, job_id)
    op.create_unique_constraint(
        "uq_user_jobs_user_id_job_id",
        "user_jobs",
        ["user_id", "job_id"],
    )

    # 2. Performance indexes
    op.create_index(
        "ix_resumes_user_id_created_at",
        "resumes",
        ["user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_interview_sessions_user_id_created_at",
        "interview_sessions",
        ["user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_notifications_user_id_is_read",
        "notifications",
        ["user_id", "is_read"],
        unique=False,
    )
    op.create_index(
        "ix_user_jobs_user_id_created_at",
        "user_jobs",
        ["user_id", "created_at"],
        unique=False,
    )

    # 3. ON DELETE CASCADE foreign keys for resumes and profile child tables
    op.drop_constraint("resumes_user_id_fkey", "resumes", type_="foreignkey")
    op.create_foreign_key(
        "resumes_user_id_fkey",
        "resumes",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("profiles_user_id_fkey", "profiles", type_="foreignkey")
    op.create_foreign_key(
        "profiles_user_id_fkey",
        "profiles",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("user_skills_user_id_fkey", "user_skills", type_="foreignkey")
    op.create_foreign_key(
        "user_skills_user_id_fkey",
        "user_skills",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("user_projects_user_id_fkey", "user_projects", type_="foreignkey")
    op.create_foreign_key(
        "user_projects_user_id_fkey",
        "user_projects",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("user_education_user_id_fkey", "user_education", type_="foreignkey")
    op.create_foreign_key(
        "user_education_user_id_fkey",
        "user_education",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.drop_constraint("user_experience_user_id_fkey", "user_experience", type_="foreignkey")
    op.create_foreign_key(
        "user_experience_user_id_fkey",
        "user_experience",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    # Revert foreign keys to no cascade
    op.drop_constraint("user_experience_user_id_fkey", "user_experience", type_="foreignkey")
    op.create_foreign_key(
        "user_experience_user_id_fkey",
        "user_experience",
        "users",
        ["user_id"],
        ["id"],
    )

    op.drop_constraint("user_education_user_id_fkey", "user_education", type_="foreignkey")
    op.create_foreign_key(
        "user_education_user_id_fkey",
        "user_education",
        "users",
        ["user_id"],
        ["id"],
    )

    op.drop_constraint("user_projects_user_id_fkey", "user_projects", type_="foreignkey")
    op.create_foreign_key(
        "user_projects_user_id_fkey",
        "user_projects",
        "users",
        ["user_id"],
        ["id"],
    )

    op.drop_constraint("user_skills_user_id_fkey", "user_skills", type_="foreignkey")
    op.create_foreign_key(
        "user_skills_user_id_fkey",
        "user_skills",
        "users",
        ["user_id"],
        ["id"],
    )

    op.drop_constraint("profiles_user_id_fkey", "profiles", type_="foreignkey")
    op.create_foreign_key(
        "profiles_user_id_fkey",
        "profiles",
        "users",
        ["user_id"],
        ["id"],
    )

    op.drop_constraint("resumes_user_id_fkey", "resumes", type_="foreignkey")
    op.create_foreign_key(
        "resumes_user_id_fkey",
        "resumes",
        "users",
        ["user_id"],
        ["id"],
    )

    # Revert indexes
    op.drop_index("ix_user_jobs_user_id_created_at", table_name="user_jobs")
    op.drop_index("ix_notifications_user_id_is_read", table_name="notifications")
    op.drop_index("ix_interview_sessions_user_id_created_at", table_name="interview_sessions")
    op.drop_index("ix_resumes_user_id_created_at", table_name="resumes")

    # Revert unique constraint
    op.drop_constraint("uq_user_jobs_user_id_job_id", "user_jobs", type_="unique")
