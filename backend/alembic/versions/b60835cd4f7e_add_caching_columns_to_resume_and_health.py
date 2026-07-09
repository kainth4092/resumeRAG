"""add_caching_columns_to_resume_and_health

Revision ID: b60835cd4f7e
Revises: 50fec7e968ff
Create Date: 2026-07-09 10:10:02.691300
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b60835cd4f7e"
down_revision: Union[str, Sequence[str], None] = "50fec7e968ff"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "resume_health_analyses",
        sa.Column("canonical_hash", sa.String(length=64), nullable=True),
    )

    op.add_column(
        "resume_health_analyses",
        sa.Column("scoring_version", sa.String(length=20), nullable=True),
    )

    op.add_column(
        "resume_health_analyses",
        sa.Column("prompt_version", sa.String(length=20), nullable=True),
    )

    op.add_column(
        "resume_health_analyses",
        sa.Column("analysis_type", sa.String(length=20), nullable=True),
    )

    op.add_column(
        "resume_health_analyses",
        sa.Column("jd_hash", sa.String(length=64), nullable=True),
    )

    op.add_column(
        "resumes",
        sa.Column("canonical_hash", sa.String(length=64), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("resumes", "canonical_hash")

    op.drop_column("resume_health_analyses", "jd_hash")
    op.drop_column("resume_health_analyses", "analysis_type")
    op.drop_column("resume_health_analyses", "prompt_version")
    op.drop_column("resume_health_analyses", "scoring_version")
    op.drop_column("resume_health_analyses", "canonical_hash")
