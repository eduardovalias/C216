"""Cria catálogo de filmes.

Revision ID: 0001
Revises:
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "movies",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("genre", sa.String(40), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("duration_min", sa.Integer(), nullable=False),
        sa.Column("synopsis", sa.String(600), nullable=False, server_default=""),
        sa.Column("watchlisted", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_index("ix_movies_title", "movies", ["title"])
    op.create_index("uq_movies_title_lower", "movies", [sa.text("lower(title)")], unique=True)


def downgrade():
    op.drop_index("uq_movies_title_lower", table_name="movies")
    op.drop_index("ix_movies_title", table_name="movies")
    op.drop_table("movies")
