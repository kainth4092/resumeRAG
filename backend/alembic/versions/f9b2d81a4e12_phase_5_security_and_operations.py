"""phase_5_security_and_operations

Revision ID: f9b2d81a4e12
Revises: e8a175c37793
Create Date: 2026-10-29 13:10:00.000000

"""
from typing import Sequence, Union
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'f9b2d81a4e12'
down_revision: Union[str, Sequence[str], None] = 'e8a175c37793'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users columns
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1")
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false")
    op.execute("UPDATE users SET email_verified = true WHERE provider = 'google'")
    op.execute("ALTER TABLE resumes ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT false")
    op.execute("ALTER TABLE resumes ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64)")
    op.execute("ALTER TABLE user_jobs ADD COLUMN IF NOT EXISTS notes TEXT")

    # 2. email_verification_tokens table
    op.execute("""
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(128) NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            used_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_email_verification_tokens_user_id ON email_verification_tokens (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_email_verification_tokens_token_hash ON email_verification_tokens (token_hash)")

    # 3. refresh_tokens table
    op.execute("""
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(128) NOT NULL UNIQUE,
            expires_at TIMESTAMPTZ NOT NULL,
            revoked_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_refresh_tokens_token_hash ON refresh_tokens (token_hash)")

    # 4. Remove dead columns from user_settings if present
    op.execute("ALTER TABLE user_settings DROP COLUMN IF EXISTS weekly_digest")
    op.execute("ALTER TABLE user_settings DROP COLUMN IF EXISTS job_alerts")
    op.execute("ALTER TABLE user_settings DROP COLUMN IF EXISTS share_analytics")
    op.execute("ALTER TABLE user_settings DROP COLUMN IF EXISTS personalize_jobs")

    # 5. Indexes on Foreign Keys
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_experience_user_id ON user_experience (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_skills_user_id ON user_skills (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_education_user_id ON user_education (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_user_projects_user_id ON user_projects (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_resumes_user_id ON resumes (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_resumes_parent_resume_id ON resumes (parent_resume_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_resumes_job_context_id ON resumes (job_context_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_interview_sessions_resume_id ON interview_sessions (resume_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_interview_sessions_job_context_id ON interview_sessions (job_context_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_interview_sessions_pipeline_run_id ON interview_sessions (pipeline_run_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_interview_questions_session_id ON interview_questions (session_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_mock_interview_sessions_user_id ON mock_interview_sessions (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_mock_interview_answers_session_id ON mock_interview_answers (session_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_mock_interview_answers_question_id ON mock_interview_answers (question_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_interview_question_bank_created_by ON interview_question_bank (created_by)")


def downgrade() -> None:
    pass
