"""add_google_auth_fields_to_users

Revision ID: cd8a18eb1fdf
Revises: 6d1b6a7d9f41
Create Date: 2026-07-06 18:06:02.702881

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cd8a18eb1fdf'
down_revision: Union[str, Sequence[str], None] = '6d1b6a7d9f41'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('provider', sa.String(length=50), nullable=True, server_default='local'))
    op.add_column('users', sa.Column('provider_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(length=1000), nullable=True))
    op.alter_column('users', 'password_hash',
               existing_type=sa.VARCHAR(length=100),
               nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'password_hash',
               existing_type=sa.VARCHAR(length=100),
               nullable=False)
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'provider_id')
    op.drop_column('users', 'provider')
