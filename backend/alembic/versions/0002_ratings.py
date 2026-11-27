"""Adiciona avaliações de filmes.

Revision ID: 0002
Revises: 0001
"""
import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "ratings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("movie_id", sa.Integer(), sa.ForeignKey("movies.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("comment", sa.String(300), nullable=False, server_default=""),
        sa.CheckConstraint("score BETWEEN 1 AND 5", name="ck_ratings_score"),
    )


def downgrade():
    op.drop_table("ratings")
