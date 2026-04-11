"""add discount and client fields

Revision ID: 996d6675c7d9
Revises: af7c9485bc7f
Create Date: 2026-04-11 14:38:54.654798
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '996d6675c7d9'
down_revision: Union[str, None] = 'af7c9485bc7f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.add_column('platform_order_items', sa.Column('recommended_price', sa.Numeric(precision=15, scale=2), server_default='0'))
    op.add_column('platform_order_items', sa.Column('discount_percent', sa.Numeric(precision=5, scale=2), server_default='0'))
    op.add_column('platform_order_items', sa.Column('discount_amount', sa.Numeric(precision=15, scale=2), server_default='0'))
    op.add_column('platform_orders', sa.Column('client_iin', sa.String(length=20), server_default='', nullable=False))
    op.add_column('platform_orders', sa.Column('delivery_address', sa.Text(), server_default='', nullable=False))
    op.add_column('platform_orders', sa.Column('discount_percent', sa.Numeric(precision=5, scale=2), server_default='0'))
    op.add_column('platform_orders', sa.Column('discount_amount', sa.Numeric(precision=15, scale=2), server_default='0'))
    op.add_column('platform_orders', sa.Column('final_amount', sa.Numeric(precision=15, scale=2), server_default='0'))
    op.add_column('platform_orders', sa.Column('payment_type', sa.String(length=50), server_default='', nullable=False))

def downgrade() -> None:
    op.drop_column('platform_orders', 'payment_type')
    op.drop_column('platform_orders', 'final_amount')
    op.drop_column('platform_orders', 'discount_amount')
    op.drop_column('platform_orders', 'discount_percent')
    op.drop_column('platform_orders', 'delivery_address')
    op.drop_column('platform_orders', 'client_iin')
    op.drop_column('platform_order_items', 'discount_amount')
    op.drop_column('platform_order_items', 'discount_percent')
    op.drop_column('platform_order_items', 'recommended_price')
