"""replace approved with status

Revision ID: 54179255e3cd
Revises: d718a1b664eb
Create Date: 2026-06-23 18:21:52.132664

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "54179255e3cd"
down_revision: Union[str, Sequence[str], None] = "d718a1b664eb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "interview_question_bank",
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="Pending",
        ),
    )
    op.execute(
        "UPDATE interview_question_bank SET status='Approved' WHERE approved=true"
    )

    op.execute(
        "UPDATE interview_question_bank SET status='Pending' WHERE approved=false"
    )

    op.drop_column(
        "interview_question_bank",
        "approved",
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass
