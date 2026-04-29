import math
from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.user import User
from models.order import OrderHistory
from middleware.auth import get_current_user, require_super_admin

router = APIRouter(prefix="/api/audit", tags=["Audit"])

HOUR_NIGHT_START = 22
HOUR_NIGHT_END = 6


def _history_to_audit_log(h: OrderHistory) -> dict:
    role = h.user.role if h.user else "unknown"
    org_id = h.user.organization_id if h.user else None
    return {
        "id": str(h.id),
        "event_time": h.created_at.isoformat() if h.created_at else None,
        "user_id": h.user_id,
        "user_role": role,
        "organization_id": org_id,
        "action": h.action,
        "resource_type": "order",
        "resource_id": str(h.order_id),
        "old_value": {"value": h.old_value} if h.old_value else None,
        "new_value": {"value": h.new_value} if h.new_value else None,
        "ip_address": None,
        "request_id": None,
        "comment": h.note or None,
    }


@router.get("/logs")
def get_audit_logs(
    user_id: Optional[int] = None,
    resource_type: Optional[str] = None,
    action: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    query = db.query(OrderHistory)

    if user_id:
        query = query.filter(OrderHistory.user_id == user_id)
    if action:
        query = query.filter(OrderHistory.action == action)
    if date_from:
        try:
            dt = datetime.fromisoformat(date_from)
            query = query.filter(OrderHistory.created_at >= dt)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to)
            query = query.filter(OrderHistory.created_at <= dt)
        except ValueError:
            pass

    total = query.count()
    items = query.order_by(OrderHistory.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "count": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
        "results": [_history_to_audit_log(h) for h in items],
    }


@router.get("/logs/{resource_type}/{resource_id}")
def get_resource_history(
    resource_type: str,
    resource_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    query = db.query(OrderHistory)
    if resource_type == "order":
        try:
            query = query.filter(OrderHistory.order_id == int(resource_id))
        except ValueError:
            pass

    total = query.count()
    items = query.order_by(OrderHistory.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "count": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
        "results": [_history_to_audit_log(h) for h in items],
    }


@router.get("/users/{user_id}/activity")
def get_user_activity(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    query = db.query(OrderHistory).filter(OrderHistory.user_id == user_id)

    total = query.count()
    items = query.order_by(OrderHistory.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "count": total,
        "page": page,
        "page_size": page_size,
        "pages": math.ceil(total / page_size) if total else 1,
        "results": [_history_to_audit_log(h) for h in items],
    }


@router.get("/suspicious")
def get_suspicious_patterns(
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    mass_deletions_rows = (
        db.query(
            OrderHistory.user_id,
            func.count(OrderHistory.id).label("delete_count"),
            func.min(OrderHistory.created_at).label("first_event"),
            func.max(OrderHistory.created_at).label("last_event"),
        )
        .filter(OrderHistory.action.in_(["deleted", "cancelled", "returned"]))
        .group_by(OrderHistory.user_id)
        .having(func.count(OrderHistory.id) >= 3)
        .all()
    )

    mass_deletions = []
    for row in mass_deletions_rows:
        user_obj = db.query(User).filter(User.id == row.user_id).first()
        mass_deletions.append({
            "user_id": row.user_id,
            "user_role": user_obj.role if user_obj else "unknown",
            "delete_count": row.delete_count,
            "first_event": row.first_event.isoformat() if row.first_event else None,
            "last_event": row.last_event.isoformat() if row.last_event else None,
        })

    night_rows = db.query(OrderHistory).all()
    night_logins = []
    for h in night_rows:
        if not h.created_at:
            continue
        hour = h.created_at.hour
        if hour >= HOUR_NIGHT_START or hour < HOUR_NIGHT_END:
            user_obj = h.user
            night_logins.append({
                "user_id": h.user_id,
                "user_role": user_obj.role if user_obj else "unknown",
                "event_time": h.created_at.isoformat(),
                "ip_address": None,
            })

    return {
        "mass_deletions": mass_deletions,
        "night_logins": night_logins[:50],
    }
