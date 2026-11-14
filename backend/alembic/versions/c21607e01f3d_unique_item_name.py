"""prevent duplicate item names (case insensitive)

Revision ID: c21607e01f3d
Revises: 8f34ef17ab26
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "c21607e01f3d"
down_revision: str | Sequence[str] | None = "8f34ef17ab26"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Não modifica dados existentes. Se já existirem nomes duplicados, será
    # necessário corrigir manualmente esses registros antes de migrar.
    op.create_index(
        "uq_items_name_normalized",
        "items",
        [sa.text("lower(trim(name))")],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_items_name_normalized", table_name="items")
