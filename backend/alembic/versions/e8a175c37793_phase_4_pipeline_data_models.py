"""phase_4_pipeline_data_models

Revision ID: e8a175c37793
Revises: 8379d8ca644b
Create Date: 2026-10-29 11:31:40.018640

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e8a175c37793'
down_revision: Union[str, Sequence[str], None] = '8379d8ca644b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Recreate job_contexts with primary key id and relational columns
    op.drop_table('job_contexts')
    op.create_table(
        'job_contexts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('raw_description', sa.Text(), nullable=False),
        sa.Column('description_hash', sa.String(length=64), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('company', sa.String(length=255), nullable=True),
        sa.Column('seniority', sa.String(length=100), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('required_skills', sa.JSON(), nullable=True),
        sa.Column('preferred_skills', sa.JSON(), nullable=True),
        sa.Column('keywords', sa.JSON(), nullable=True),
        sa.Column('responsibilities', sa.JSON(), nullable=True),
        sa.Column('source_job_id', sa.String(length=255), nullable=True),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_job_contexts_description_hash', 'job_contexts', ['description_hash'], unique=False)
    op.create_index('ix_job_contexts_user_id', 'job_contexts', ['user_id'], unique=False)

    # 2. Add Phase 4 columns to resumes
    op.add_column('resumes', sa.Column('source', sa.String(length=50), server_default='upload', nullable=False))
    op.add_column('resumes', sa.Column('parent_resume_id', sa.Integer(), nullable=True))
    op.add_column('resumes', sa.Column('job_context_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_resumes_parent_resume_id', 'resumes', 'resumes', ['parent_resume_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_resumes_job_context_id', 'resumes', 'job_contexts', ['job_context_id'], ['id'], ondelete='SET NULL')

    # 3. Create pipeline_runs table
    op.create_table(
        'pipeline_runs',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('source_resume_id', sa.Integer(), nullable=True),
        sa.Column('generated_resume_id', sa.Integer(), nullable=True),
        sa.Column('job_context_id', sa.Integer(), nullable=True),
        sa.Column('description_hash', sa.String(length=64), nullable=False),
        sa.Column('template', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('steps', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['generated_resume_id'], ['resumes.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['job_context_id'], ['job_contexts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['source_resume_id'], ['resumes.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'source_resume_id', 'description_hash', 'template', name='uq_pipeline_runs_idempotency')
    )
    op.create_index(op.f('ix_pipeline_runs_description_hash'), 'pipeline_runs', ['description_hash'], unique=False)
    op.create_index(op.f('ix_pipeline_runs_user_id'), 'pipeline_runs', ['user_id'], unique=False)
    op.create_index('ix_pipeline_runs_user_id_created_at', 'pipeline_runs', ['user_id', 'created_at'], unique=False)

    # 4. Create resume_job_matches table
    op.create_table(
        'resume_job_matches',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('resume_id', sa.Integer(), nullable=False),
        sa.Column('job_id', sa.String(length=255), nullable=False),
        sa.Column('score', sa.Float(), nullable=False),
        sa.Column('matched_skills', sa.JSON(), nullable=False),
        sa.Column('missing_skills', sa.JSON(), nullable=False),
        sa.Column('reasons', sa.JSON(), nullable=False),
        sa.Column('job_data', sa.JSON(), nullable=True),
        sa.Column('computed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_resume_job_matches_job_id', 'resume_job_matches', ['job_id'], unique=False)
    op.create_index(op.f('ix_resume_job_matches_resume_id'), 'resume_job_matches', ['resume_id'], unique=False)
    op.create_index('ix_resume_job_matches_resume_score', 'resume_job_matches', ['resume_id', 'score'], unique=False)

    # 5. Create roadmaps table and migrate existing rows from user_roadmaps
    op.create_table(
        'roadmaps',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('resume_id', sa.Integer(), nullable=True),
        sa.Column('job_context_id', sa.Integer(), nullable=True),
        sa.Column('target_role', sa.String(length=150), nullable=False),
        sa.Column('target_level', sa.String(length=250), nullable=False),
        sa.Column('plan', sa.JSON(), nullable=True),
        sa.Column('completed_tasks', sa.JSON(), nullable=False),
        sa.Column('generated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['job_context_id'], ['job_contexts.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_roadmaps_id'), 'roadmaps', ['id'], unique=False)
    op.create_index('ix_roadmaps_resume_id', 'roadmaps', ['resume_id'], unique=False)
    op.create_index('ix_roadmaps_user_id_generated_at', 'roadmaps', ['user_id', 'generated_at'], unique=False)

    # Migrate existing user_roadmaps into roadmaps
    op.execute("""
        INSERT INTO roadmaps (user_id, target_role, target_level, completed_tasks, generated_at)
        SELECT user_id, target_role, target_level,
               CASE 
                   WHEN completed_tasks IS NOT NULL AND completed_tasks != '' THEN completed_tasks::json 
                   ELSE '[]'::json 
               END,
               NOW() FROM user_roadmaps
    """)
    op.drop_table('user_roadmaps')

    # 6. Update interview_sessions
    op.add_column('interview_sessions', sa.Column('job_context_id', sa.Integer(), nullable=True))
    op.add_column('interview_sessions', sa.Column('pipeline_run_id', sa.String(length=36), nullable=True))
    op.create_foreign_key('fk_interview_sessions_job_context_id', 'interview_sessions', 'job_contexts', ['job_context_id'], ['id'], ondelete='SET NULL')
    op.create_foreign_key('fk_interview_sessions_pipeline_run_id', 'interview_sessions', 'pipeline_runs', ['pipeline_run_id'], ['id'], ondelete='SET NULL')

    # 7. Create llm_usage table
    op.create_table(
        'llm_usage',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('feature', sa.String(length=50), nullable=False),
        sa.Column('call_count', sa.Integer(), nullable=False),
        sa.Column('tokens_used', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'date', 'feature', name='uq_llm_usage_user_date_feature')
    )
    op.create_index('ix_llm_usage_user_id_date', 'llm_usage', ['user_id', 'date'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_llm_usage_user_id_date', table_name='llm_usage')
    op.drop_table('llm_usage')

    op.drop_constraint('fk_interview_sessions_pipeline_run_id', 'interview_sessions', type_='foreignkey')
    op.drop_constraint('fk_interview_sessions_job_context_id', 'interview_sessions', type_='foreignkey')
    op.drop_column('interview_sessions', 'pipeline_run_id')
    op.drop_column('interview_sessions', 'job_context_id')

    op.create_table(
        'user_roadmaps',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False),
        sa.Column('target_role', sa.VARCHAR(length=150), autoincrement=False, nullable=False),
        sa.Column('target_level', sa.VARCHAR(length=250), autoincrement=False, nullable=False),
        sa.Column('completed_tasks', postgresql.JSON(astext_type=sa.Text()), server_default=sa.text("'[]'::json"), autoincrement=False, nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='user_roadmaps_user_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='user_roadmaps_pkey'),
        sa.UniqueConstraint('user_id', name='user_roadmaps_user_id_key')
    )
    op.create_index(op.f('ix_user_roadmaps_id'), 'user_roadmaps', ['id'], unique=False)

    op.execute("""
        INSERT INTO user_roadmaps (user_id, target_role, target_level, completed_tasks)
        SELECT user_id, target_role, target_level, completed_tasks FROM roadmaps
    """)

    op.drop_index('ix_roadmaps_user_id_generated_at', table_name='roadmaps')
    op.drop_index('ix_roadmaps_resume_id', table_name='roadmaps')
    op.drop_index(op.f('ix_roadmaps_id'), table_name='roadmaps')
    op.drop_table('roadmaps')

    op.drop_index('ix_resume_job_matches_resume_score', table_name='resume_job_matches')
    op.drop_index(op.f('ix_resume_job_matches_resume_id'), table_name='resume_job_matches')
    op.drop_index('ix_resume_job_matches_job_id', table_name='resume_job_matches')
    op.drop_table('resume_job_matches')

    op.drop_index('ix_pipeline_runs_user_id_created_at', table_name='pipeline_runs')
    op.drop_index(op.f('ix_pipeline_runs_user_id'), table_name='pipeline_runs')
    op.drop_index(op.f('ix_pipeline_runs_description_hash'), table_name='pipeline_runs')
    op.drop_table('pipeline_runs')

    op.drop_constraint('fk_resumes_job_context_id', 'resumes', type_='foreignkey')
    op.drop_constraint('fk_resumes_parent_resume_id', 'resumes', type_='foreignkey')
    op.drop_column('resumes', 'job_context_id')
    op.drop_column('resumes', 'parent_resume_id')
    op.drop_column('resumes', 'source')

    op.drop_index('ix_job_contexts_user_id', table_name='job_contexts')
    op.drop_index('ix_job_contexts_description_hash', table_name='job_contexts')
    op.drop_table('job_contexts')
    op.create_table(
        'job_contexts',
        sa.Column('jd_hash', sa.VARCHAR(length=64), primary_key=True),
        sa.Column('keywords_json', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
