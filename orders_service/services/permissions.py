"""
Permission helpers: filter querysets based on user role and organization.
"""
from typing import List
from sqlalchemy.orm import Session, Query
from models.user import User, UserRole
from models.order import Order


def filter_orders_by_role(query: Query, user: User) -> Query:
    """Filter orders based on user's role and organization."""
    if user.role == UserRole.SUPER_ADMIN:
        return query  # sees everything

    if user.role == UserRole.DEALER_ADMIN:
        return query.filter(Order.organization_id == user.organization_id)

    if user.role == UserRole.DEALER_MANAGER:
        return query.filter(Order.manager_id == user.id)

    if user.role in (UserRole.FACTORY_ADMIN, UserRole.FACTORY_WORKER):
        # Factory sees orders in production-related statuses
        from models.order import OrderStatus
        factory_statuses = [
            OrderStatus.CONFIRMED, OrderStatus.IN_PRODUCTION,
            OrderStatus.READY, OrderStatus.SHIPPING,
        ]
        return query.filter(Order.status.in_(factory_statuses))

    return query.filter(False)  # no access by default


def can_change_status(user: User, old_status: str, new_status: str) -> bool:
    """Check if user can transition order from old_status to new_status."""
    from models.order import OrderStatus

    transitions = {
        # (old, new): allowed_roles
        (OrderStatus.NEW, OrderStatus.CONFIRMED): [UserRole.SUPER_ADMIN],
        (OrderStatus.CONFIRMED, OrderStatus.IN_PRODUCTION): [UserRole.SUPER_ADMIN, UserRole.FACTORY_ADMIN],
        (OrderStatus.IN_PRODUCTION, OrderStatus.READY): [UserRole.FACTORY_ADMIN, UserRole.FACTORY_WORKER],
        (OrderStatus.READY, OrderStatus.SHIPPING): [UserRole.SUPER_ADMIN],
        (OrderStatus.SHIPPING, OrderStatus.DELIVERED): [UserRole.SUPER_ADMIN, UserRole.DEALER_ADMIN],
        (OrderStatus.DELIVERED, OrderStatus.ACCEPTED): [UserRole.SUPER_ADMIN, UserRole.DEALER_ADMIN, UserRole.DEALER_MANAGER],
        (OrderStatus.ACCEPTED, OrderStatus.COMPLETED): [UserRole.SUPER_ADMIN],
    }

    # SUPER_ADMIN can always reject/return
    if user.role == UserRole.SUPER_ADMIN and new_status in (OrderStatus.REJECTED, OrderStatus.RETURNED):
        return True

    allowed = transitions.get((old_status, new_status), [])
    return user.role in allowed


def get_visible_price_fields(user: User) -> List[str]:
    """Return which price fields this user can see."""
    if user.role == UserRole.SUPER_ADMIN:
        return ["dealer_price", "recommended_price", "price_per_meter"]
    if user.role == UserRole.DEALER_ADMIN:
        return ["dealer_price", "recommended_price", "price_per_meter"]
    if user.role == UserRole.DEALER_MANAGER:
        return ["recommended_price", "price_per_meter"]
    return []  # factory roles don't see prices
