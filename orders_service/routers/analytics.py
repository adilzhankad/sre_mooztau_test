from typing import Optional
from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from database import get_db
from models.user import User, UserRole
from models.organization import Organization
from models.order import Order, OrderItem, OrderStatus
from models.payment import Payment
from middleware.auth import require_super_admin

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/overview")
def analytics_overview(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    query = db.query(Order)
    prev_query = db.query(Order)

    if date_from and date_to:
        query = query.filter(Order.order_date >= date_from, Order.order_date <= date_to)
        # Previous period for growth calculation
        period_length = (date_to - date_from).days
        prev_from = date_from - timedelta(days=period_length)
        prev_to = date_from - timedelta(days=1)
        prev_query = prev_query.filter(Order.order_date >= prev_from, Order.order_date <= prev_to)
    elif date_from:
        query = query.filter(Order.order_date >= date_from)
        prev_query = prev_query.filter(Order.order_date < date_from)
    elif date_to:
        query = query.filter(Order.order_date <= date_to)
        prev_query = prev_query.filter(Order.order_date <= date_to)

    total_orders = query.count()
    total_revenue = query.with_entities(
        func.coalesce(func.sum(Order.total_amount), 0)
    ).scalar()

    avg_check = Decimal("0")
    if total_orders > 0:
        avg_check = Decimal(str(total_revenue)) / total_orders

    # Previous period
    prev_total_orders = prev_query.count()
    prev_revenue = prev_query.with_entities(
        func.coalesce(func.sum(Order.total_amount), 0)
    ).scalar()

    orders_growth = 0.0
    if prev_total_orders > 0:
        orders_growth = round(
            ((total_orders - prev_total_orders) / prev_total_orders) * 100, 2
        )

    revenue_growth = 0.0
    if prev_revenue and prev_revenue > 0:
        revenue_growth = round(
            float((Decimal(str(total_revenue)) - Decimal(str(prev_revenue))) / Decimal(str(prev_revenue)) * 100), 2
        )

    return {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "avg_check": float(avg_check),
        "orders_growth": orders_growth,
        "revenue_growth": revenue_growth,
        "prev_total_orders": prev_total_orders,
        "prev_revenue": float(prev_revenue),
    }


@router.get("/revenue")
def analytics_revenue(
    period: str = Query("monthly", pattern="^(monthly|weekly|daily)$"),
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    current_year = year or date.today().year

    # Revenue by month
    monthly_revenue = db.query(
        extract("month", Order.order_date).label("month"),
        func.count(Order.id).label("orders_count"),
        func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
    ).filter(
        extract("year", Order.order_date) == current_year,
    ).group_by(
        extract("month", Order.order_date)
    ).order_by(
        extract("month", Order.order_date)
    ).all()

    by_period = []
    for row in monthly_revenue:
        by_period.append({
            "period": int(row.month),
            "orders_count": row.orders_count,
            "revenue": float(row.revenue),
        })

    # Revenue by channel (organization type)
    by_channel = db.query(
        Organization.org_type.label("channel"),
        func.count(Order.id).label("orders_count"),
        func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
    ).join(
        Organization, Order.organization_id == Organization.id
    ).filter(
        extract("year", Order.order_date) == current_year,
    ).group_by(
        Organization.org_type
    ).all()

    channels = []
    for row in by_channel:
        channels.append({
            "channel": row.channel,
            "orders_count": row.orders_count,
            "revenue": float(row.revenue),
        })

    # Revenue by manager
    by_manager = db.query(
        User.id.label("manager_id"),
        User.full_name.label("manager_name"),
        func.count(Order.id).label("orders_count"),
        func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
    ).join(
        User, Order.manager_id == User.id
    ).filter(
        extract("year", Order.order_date) == current_year,
    ).group_by(
        User.id, User.full_name
    ).order_by(
        func.sum(Order.total_amount).desc()
    ).all()

    managers = []
    for row in by_manager:
        managers.append({
            "manager_id": row.manager_id,
            "manager_name": row.manager_name,
            "orders_count": row.orders_count,
            "revenue": float(row.revenue),
        })

    return {
        "year": current_year,
        "by_period": by_period,
        "by_channel": channels,
        "by_manager": managers,
    }


@router.get("/orders")
def analytics_orders(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    base_query = db.query(Order)
    if date_from:
        base_query = base_query.filter(Order.order_date >= date_from)
    if date_to:
        base_query = base_query.filter(Order.order_date <= date_to)

    # By status
    by_status = base_query.with_entities(
        Order.status,
        func.count(Order.id).label("count"),
    ).group_by(Order.status).all()

    status_data = []
    for row in by_status:
        status_data.append({"status": row.status, "count": row.count})

    # By region
    by_region = base_query.with_entities(
        Order.client_region,
        func.count(Order.id).label("count"),
        func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
    ).group_by(Order.client_region).order_by(
        func.count(Order.id).desc()
    ).all()

    region_data = []
    for row in by_region:
        region_data.append({
            "region": row.client_region,
            "count": row.count,
            "revenue": float(row.revenue),
        })

    # By model (product)
    items_query = db.query(OrderItem).join(Order, OrderItem.order_id == Order.id)
    if date_from:
        items_query = items_query.filter(Order.order_date >= date_from)
    if date_to:
        items_query = items_query.filter(Order.order_date <= date_to)

    by_model = items_query.with_entities(
        OrderItem.model,
        func.count(OrderItem.id).label("count"),
        func.coalesce(func.sum(OrderItem.total_price), 0).label("revenue"),
    ).group_by(OrderItem.model).order_by(
        func.count(OrderItem.id).desc()
    ).limit(20).all()

    model_data = []
    for row in by_model:
        model_data.append({
            "model": row.model,
            "count": row.count,
            "revenue": float(row.revenue),
        })

    return {
        "by_status": status_data,
        "by_region": region_data,
        "by_model": model_data,
    }


@router.get("/dealers")
def analytics_dealers(
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    dealers = db.query(
        Organization.id.label("org_id"),
        Organization.name.label("org_name"),
        Organization.region.label("region"),
        Organization.credit_limit,
        func.count(Order.id).label("orders_count"),
        func.coalesce(func.sum(Order.total_amount), 0).label("total_revenue"),
    ).outerjoin(
        Order, Order.organization_id == Organization.id
    ).group_by(
        Organization.id, Organization.name, Organization.region, Organization.credit_limit
    ).order_by(
        func.sum(Order.total_amount).desc().nullslast()
    ).all()

    result = []
    for row in dealers:
        # Calculate total paid for this org
        total_paid = db.query(
            func.coalesce(func.sum(Payment.amount), 0)
        ).join(
            Order, Payment.order_id == Order.id
        ).filter(
            Order.organization_id == row.org_id
        ).scalar()

        debt = float(row.total_revenue) - float(total_paid)

        result.append({
            "organization_id": row.org_id,
            "organization_name": row.org_name,
            "region": row.region,
            "orders_count": row.orders_count,
            "total_revenue": float(row.total_revenue),
            "total_paid": float(total_paid),
            "debt": debt,
            "credit_limit": float(row.credit_limit) if row.credit_limit else None,
        })

    return result


@router.get("/regions")
def analytics_regions(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    query = db.query(
        Order.client_region.label("region"),
        func.count(Order.id).label("orders_count"),
        func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
    )

    if date_from:
        query = query.filter(Order.order_date >= date_from)
    if date_to:
        query = query.filter(Order.order_date <= date_to)

    rows = query.group_by(Order.client_region).order_by(
        func.sum(Order.total_amount).desc()
    ).all()

    result = []
    for row in rows:
        result.append({
            "region": row.region,
            "orders_count": row.orders_count,
            "revenue": float(row.revenue),
        })

    return result


@router.get("/products")
def analytics_products(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    query = db.query(
        OrderItem.model.label("model"),
        OrderItem.category.label("category"),
        func.count(OrderItem.id).label("orders_count"),
        func.coalesce(func.sum(OrderItem.quantity), 0).label("total_quantity"),
        func.coalesce(func.sum(OrderItem.total_price), 0).label("revenue"),
    ).join(Order, OrderItem.order_id == Order.id)

    if date_from:
        query = query.filter(Order.order_date >= date_from)
    if date_to:
        query = query.filter(Order.order_date <= date_to)

    rows = query.group_by(
        OrderItem.model, OrderItem.category
    ).order_by(
        func.sum(OrderItem.total_price).desc()
    ).limit(limit).all()

    result = []
    for row in rows:
        result.append({
            "model": row.model,
            "category": row.category,
            "orders_count": row.orders_count,
            "total_quantity": float(row.total_quantity),
            "revenue": float(row.revenue),
        })

    return result


@router.get("/payments")
def analytics_payments(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    pay_query = db.query(Payment)
    if date_from:
        pay_query = pay_query.filter(Payment.payment_date >= date_from)
    if date_to:
        pay_query = pay_query.filter(Payment.payment_date <= date_to)

    total_received = pay_query.with_entities(
        func.coalesce(func.sum(Payment.amount), 0)
    ).scalar()

    # Total outstanding (all orders total - all payments)
    order_query = db.query(Order)
    if date_from:
        order_query = order_query.filter(Order.order_date >= date_from)
    if date_to:
        order_query = order_query.filter(Order.order_date <= date_to)

    total_order_amount = order_query.with_entities(
        func.coalesce(func.sum(Order.total_amount), 0)
    ).scalar()

    total_all_paid = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).join(Order, Payment.order_id == Order.id).scalar()

    if date_from:
        total_all_paid = db.query(
            func.coalesce(func.sum(Payment.amount), 0)
        ).join(Order, Payment.order_id == Order.id).filter(
            Order.order_date >= date_from
        ).scalar()
    if date_to:
        total_all_paid = db.query(
            func.coalesce(func.sum(Payment.amount), 0)
        ).join(Order, Payment.order_id == Order.id).filter(
            Order.order_date <= date_to
        ).scalar()

    outstanding = float(total_order_amount) - float(total_all_paid)

    # By payment method
    by_method = pay_query.with_entities(
        Payment.payment_method,
        func.count(Payment.id).label("count"),
        func.coalesce(func.sum(Payment.amount), 0).label("total"),
    ).group_by(Payment.payment_method).all()

    methods = []
    for row in by_method:
        methods.append({
            "method": row.payment_method or "Не указан",
            "count": row.count,
            "total": float(row.total),
        })

    # Monthly payment stats
    monthly = pay_query.with_entities(
        extract("year", Payment.payment_date).label("year"),
        extract("month", Payment.payment_date).label("month"),
        func.count(Payment.id).label("count"),
        func.coalesce(func.sum(Payment.amount), 0).label("total"),
    ).group_by(
        extract("year", Payment.payment_date),
        extract("month", Payment.payment_date),
    ).order_by(
        extract("year", Payment.payment_date),
        extract("month", Payment.payment_date),
    ).all()

    monthly_data = []
    for row in monthly:
        monthly_data.append({
            "year": int(row.year),
            "month": int(row.month),
            "count": row.count,
            "total": float(row.total),
        })

    return {
        "total_received": float(total_received),
        "total_outstanding": outstanding,
        "by_method": methods,
        "monthly": monthly_data,
    }
