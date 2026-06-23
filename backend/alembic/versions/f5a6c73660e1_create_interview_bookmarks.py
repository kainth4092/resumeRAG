"""create interview bookmarks

Revision ID: f5a6c73660e1
Revises: 89ecaaa10dd2
Create Date: 2026-06-23 18:35:26.566252

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f5a6c73660e1'
down_revision: Union[str, Sequence[str], None] = '89ecaaa10dd2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
