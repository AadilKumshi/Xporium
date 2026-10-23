"""add experiment sharing and library

Revision ID: 9f2c1a7e4b6d
Revises: 738bb8fa10d7
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9f2c1a7e4b6d"
down_revision: Union[str, Sequence[str], None] = "738bb8fa10d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "experiment_share_tokens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("experiment_id", sa.Integer(), nullable=False),
        sa.Column("owner_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=6), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["experiment_id"], ["experiments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("code"),
    )
    op.create_index(
        "ix_experiment_share_tokens_id",
        "experiment_share_tokens",
        ["id"],
    )
    op.create_index(
        "ix_experiment_share_tokens_experiment_id",
        "experiment_share_tokens",
        ["experiment_id"],
    )
    op.create_index(
        "ix_experiment_share_tokens_owner_id",
        "experiment_share_tokens",
        ["owner_id"],
    )
    op.create_index(
        "ix_experiment_share_tokens_code",
        "experiment_share_tokens",
        ["code"],
    )
    op.create_index(
        "ix_experiment_share_tokens_expires_at",
        "experiment_share_tokens",
        ["expires_at"],
    )

    op.create_table(
        "library_experiments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("experiment_id", sa.Integer(), nullable=False),
        sa.Column(
            "added_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["experiment_id"], ["experiments.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", "experiment_id", name="uq_library_user_experiment"),
    )
    op.create_index("ix_library_experiments_id", "library_experiments", ["id"])
    op.create_index("ix_library_experiments_user_id", "library_experiments", ["user_id"])
    op.create_index(
        "ix_library_experiments_experiment_id",
        "library_experiments",
        ["experiment_id"],
    )


def downgrade() -> None:
    op.drop_table("library_experiments")
    op.drop_table("experiment_share_tokens")
