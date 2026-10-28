"""add resume file_content_base64

Revision ID: 6d1b6a7d9f41
Revises: fc5b0191d6e9
Create Date: 2026-07-03 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "6d1b6a7d9f41"
down_revision = "eca40e1ba14e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "resumes",
        sa.Column("file_content_base64", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("resumes", "file_content_base64")