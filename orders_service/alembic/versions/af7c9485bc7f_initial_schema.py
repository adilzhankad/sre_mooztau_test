"""initial schema

Revision ID: af7c9485bc7f
Revises:
Create Date: 2026-03-28 18:56:57.721835
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'af7c9485bc7f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'organizations',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(200), unique=True, nullable=False),
        sa.Column('org_type', sa.String(20), server_default='dealer', nullable=False),
        sa.Column('is_active', sa.Boolean, server_default=sa.text('true'), nullable=False),
        sa.Column('contact_phone', sa.String(50), server_default='', nullable=False),
        sa.Column('contact_email', sa.String(200), server_default='', nullable=False),
        sa.Column('address', sa.Text, server_default='', nullable=False),
        sa.Column('region', sa.String(200), server_default='', nullable=False),
        sa.Column('credit_limit', sa.Numeric(15, 2), nullable=True),
        sa.Column('balance', sa.Numeric(15, 2), server_default='0'),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'users',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('organization_id', sa.BigInteger, sa.ForeignKey('organizations.id'), nullable=True),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('phone', sa.String(50), unique=True, nullable=False),
        sa.Column('email', sa.String(200), server_default='', nullable=False),
        sa.Column('password_hash', sa.String(200), nullable=False),
        sa.Column('is_active', sa.Boolean, server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'products',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('category', sa.String(20), nullable=False),
        sa.Column('model', sa.String(50), unique=True, nullable=False),
        sa.Column('name', sa.String(200), server_default='', nullable=False),
        sa.Column('description', sa.Text, server_default='', nullable=False),
        sa.Column('unit', sa.String(10), server_default='piece', nullable=False),
        sa.Column('default_length', sa.Numeric(10, 2), nullable=True),
        sa.Column('default_height', sa.Numeric(10, 2), nullable=True),
        sa.Column('default_width', sa.Numeric(10, 2), nullable=True),
        sa.Column('available_colors', sa.Text, server_default='', nullable=False),
        sa.Column('is_active', sa.Boolean, server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'prices',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('product_id', sa.BigInteger, sa.ForeignKey('products.id'), nullable=False),
        sa.Column('dealer_price', sa.Numeric(15, 2), nullable=True),
        sa.Column('recommended_price', sa.Numeric(15, 2), nullable=True),
        sa.Column('price_per_meter', sa.Numeric(15, 2), nullable=True),
        sa.Column('effective_from', sa.Date, nullable=False),
        sa.Column('effective_to', sa.Date, nullable=True),
        sa.Column('created_by_id', sa.BigInteger, sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'platform_orders',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('order_number', sa.String(20), unique=True, nullable=False),
        sa.Column('contract_number', sa.String(100), server_default='', nullable=False),
        sa.Column('organization_id', sa.BigInteger, sa.ForeignKey('organizations.id'), nullable=False),
        sa.Column('manager_id', sa.BigInteger, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('factory', sa.String(50), server_default='Кулан', nullable=False),
        sa.Column('client_name', sa.String(200), nullable=False),
        sa.Column('client_phone', sa.String(50), nullable=False),
        sa.Column('client_region', sa.String(200), nullable=False),
        sa.Column('client_address', sa.Text, nullable=False),
        sa.Column('total_amount', sa.Numeric(15, 2), server_default='0'),
        sa.Column('dealer_cost', sa.Numeric(15, 2), nullable=True),
        sa.Column('order_date', sa.Date, nullable=False),
        sa.Column('deadline', sa.Date, nullable=True),
        sa.Column('accepted_date', sa.Date, nullable=True),
        sa.Column('warranty_end_date', sa.Date, nullable=True),
        sa.Column('status', sa.String(20), server_default='new', nullable=False),
        sa.Column('has_contract', sa.Boolean, server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'platform_order_items',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('order_id', sa.BigInteger, sa.ForeignKey('platform_orders.id'), nullable=False),
        sa.Column('product_id', sa.BigInteger, sa.ForeignKey('products.id'), nullable=True),
        sa.Column('model', sa.String(50), nullable=False),
        sa.Column('category', sa.String(50), server_default='', nullable=False),
        sa.Column('quantity', sa.Numeric(10, 2), server_default='1'),
        sa.Column('unit', sa.String(10), server_default='piece', nullable=False),
        sa.Column('length', sa.Numeric(10, 2), nullable=True),
        sa.Column('height', sa.Numeric(10, 2), nullable=True),
        sa.Column('width', sa.Numeric(10, 2), nullable=True),
        sa.Column('color', sa.String(50), server_default='', nullable=False),
        sa.Column('price_per_unit', sa.Numeric(15, 2), server_default='0'),
        sa.Column('total_price', sa.Numeric(15, 2), server_default='0'),
    )

    op.create_table(
        'platform_order_history',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('order_id', sa.BigInteger, sa.ForeignKey('platform_orders.id'), nullable=False),
        sa.Column('user_id', sa.BigInteger, sa.ForeignKey('users.id'), nullable=True),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('old_value', sa.Text, server_default='', nullable=False),
        sa.Column('new_value', sa.Text, server_default='', nullable=False),
        sa.Column('note', sa.Text, server_default='', nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'platform_payments',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('order_id', sa.BigInteger, sa.ForeignKey('platform_orders.id'), nullable=False),
        sa.Column('amount', sa.Numeric(15, 2), nullable=False),
        sa.Column('payment_date', sa.Date, nullable=False),
        sa.Column('payment_method', sa.String(50), server_default='', nullable=False),
        sa.Column('received_by_id', sa.BigInteger, sa.ForeignKey('users.id'), nullable=True),
        sa.Column('notes', sa.Text, server_default='', nullable=False),
        sa.Column('created_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'inventory',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('factory', sa.String(50), nullable=False),
        sa.Column('product_id', sa.BigInteger, sa.ForeignKey('products.id'), nullable=False),
        sa.Column('model', sa.String(50), nullable=False),
        sa.Column('color', sa.String(50), server_default='', nullable=False),
        sa.Column('quantity', sa.Integer, server_default='0', nullable=False),
        sa.Column('status', sa.String(20), server_default='in_stock', nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.text('now()'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('inventory')
    op.drop_table('platform_payments')
    op.drop_table('platform_order_history')
    op.drop_table('platform_order_items')
    op.drop_table('platform_orders')
    op.drop_table('prices')
    op.drop_table('products')
    op.drop_table('users')
    op.drop_table('organizations')
