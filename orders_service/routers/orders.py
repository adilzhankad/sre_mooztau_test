import math
from typing import Optional, List
from datetime import date, datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_

from database import get_db
from models.user import User, UserRole
from models.organization import Organization
from models.order import Order, OrderItem, OrderHistory, OrderStatus
from models.payment import Payment
from schemas.order import (
    OrderCreate, OrderUpdate, OrderOut, OrderItemOut, OrderItemUpdate,
    StatusChange, OrderHistoryOut, PaymentCreate, PaymentOut, OrderListOut,
)
from services.permissions import filter_orders_by_role, can_change_status
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def enrich_order(order: Order) -> dict:
    total_paid = sum(Decimal(str(p.amount)) for p in order.payments)
    total_amount = Decimal(str(order.total_amount)) if order.total_amount else Decimal("0")

    items = []
    for item in order.items:
        items.append(OrderItemOut.model_validate(item).model_dump())

    payments = []
    for p in order.payments:
        payments.append(PaymentOut.model_validate(p).model_dump())

    return {
        "id": order.id,
        "order_number": order.order_number,
        "contract_number": order.contract_number,
        "organization_id": order.organization_id,
        "organization_name": order.organization.name if order.organization else None,
        "manager_id": order.manager_id,
        "manager_name": order.manager.full_name if order.manager else None,
        "factory": order.factory,
        "client_name": order.client_name,
        "client_phone": order.client_phone,
        "client_region": order.client_region,
        "client_address": order.client_address,
        "total_amount": total_amount,
        "dealer_cost": order.dealer_cost,
        "order_date": order.order_date,
        "deadline": order.deadline,
        "accepted_date": order.accepted_date,
        "warranty_end_date": order.warranty_end_date,
        "status": order.status,
        "has_contract": order.has_contract,
        "items": items,
        "payments": payments,
        "payment_received": total_paid,
        "payment_remaining": total_amount - total_paid,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


def _generate_order_number(db: Session) -> str:
    last_order = db.query(Order).order_by(Order.id.desc()).first()
    if last_order and last_order.order_number:
        try:
            last_num = int(last_order.order_number.replace("MZ-", ""))
            next_num = last_num + 1
        except ValueError:
            next_num = 1
    else:
        next_num = 1
    return f"MZ-{next_num:06d}"


@router.get("/")
def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    organization_id: Optional[int] = None,
    manager_id: Optional[int] = None,
    region: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.manager),
        joinedload(Order.items),
        joinedload(Order.payments),
    )

    # Role-based filtering
    query = filter_orders_by_role(query, user)

    # Additional filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Order.order_number.ilike(search_term),
                Order.client_name.ilike(search_term),
                Order.client_phone.ilike(search_term),
                Order.contract_number.ilike(search_term),
            )
        )

    if status_filter:
        query = query.filter(Order.status == status_filter)

    if organization_id is not None:
        query = query.filter(Order.organization_id == organization_id)

    if manager_id is not None:
        query = query.filter(Order.manager_id == manager_id)

    if region:
        query = query.filter(Order.client_region.ilike(f"%{region}%"))

    if date_from:
        query = query.filter(Order.order_date >= date_from)

    if date_to:
        query = query.filter(Order.order_date <= date_to)

    # Count total before pagination
    total = query.with_entities(func.count(Order.id)).scalar() or 0

    # Pagination
    offset = (page - 1) * page_size
    orders = query.order_by(Order.id.desc()).offset(offset).limit(page_size).all()

    # Deduplicate (joinedload can cause duplicates)
    seen = set()
    unique_orders = []
    for o in orders:
        if o.id not in seen:
            seen.add(o.id)
            unique_orders.append(o)

    results = [enrich_order(o) for o in unique_orders]
    pages = math.ceil(total / page_size) if page_size else 1

    return {
        "count": total,
        "results": results,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # Determine organization_id and manager_id
    if user.role == UserRole.SUPER_ADMIN:
        org_id = payload.organization_id if hasattr(payload, "organization_id") and payload.organization_id else user.organization_id
        if not org_id:
            raise HTTPException(
                status_code=400, detail="Укажите организацию для заказа"
            )
    elif user.role in (UserRole.DEALER_ADMIN, UserRole.DEALER_MANAGER):
        org_id = user.organization_id
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав для создания заказа")

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Организация не найдена")

    manager_id = user.id
    if user.role == UserRole.SUPER_ADMIN and hasattr(payload, "manager_id") and getattr(payload, "manager_id", None):
        manager_id = payload.manager_id

    order_number = _generate_order_number(db)
    order_date = payload.order_date if hasattr(payload, "order_date") and payload.order_date else date.today()

    # Calculate total_amount from items
    total_amount = Decimal("0")
    for item in payload.items:
        if item.total_price:
            total_amount += Decimal(str(item.total_price))
        else:
            total_amount += Decimal(str(item.price_per_unit)) * Decimal(str(item.quantity))

    order = Order(
        order_number=order_number,
        contract_number=payload.contract_number,
        organization_id=org_id,
        manager_id=manager_id,
        factory="Кулан",
        client_name=payload.client_name,
        client_phone=payload.client_phone,
        client_region=payload.client_region,
        client_address=payload.client_address,
        total_amount=total_amount,
        order_date=order_date,
        deadline=payload.deadline,
        has_contract=payload.has_contract,
        status=OrderStatus.NEW,
    )
    db.add(order)
    db.flush()

    # Create order items
    for item_data in payload.items:
        item_total = item_data.total_price if item_data.total_price else (
            Decimal(str(item_data.price_per_unit)) * Decimal(str(item_data.quantity))
        )
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            model=item_data.model,
            category=item_data.category,
            quantity=item_data.quantity,
            unit=item_data.unit,
            length=item_data.length,
            height=item_data.height,
            width=item_data.width,
            color=item_data.color,
            price_per_unit=item_data.price_per_unit,
            total_price=item_total,
        )
        db.add(order_item)

    # Create history entry
    history = OrderHistory(
        order_id=order.id,
        user_id=user.id,
        action="created",
        old_value="",
        new_value=OrderStatus.NEW,
        note=f"Заказ {order_number} создан",
    )
    db.add(history)

    db.commit()
    db.refresh(order)

    # Reload with relationships
    order = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.manager),
        joinedload(Order.items),
        joinedload(Order.payments),
    ).filter(Order.id == order.id).first()

    return enrich_order(order)


@router.get("/{order_id}")
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.manager),
        joinedload(Order.items),
        joinedload(Order.payments),
    ).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Check access
    if user.role == UserRole.SUPER_ADMIN:
        pass
    elif user.role == UserRole.DEALER_ADMIN:
        if order.organization_id != user.organization_id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    elif user.role == UserRole.DEALER_MANAGER:
        if order.manager_id != user.id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    elif user.role in (UserRole.FACTORY_ADMIN, UserRole.FACTORY_WORKER):
        factory_statuses = [
            OrderStatus.CONFIRMED, OrderStatus.IN_PRODUCTION,
            OrderStatus.READY, OrderStatus.SHIPPING,
        ]
        if order.status not in factory_statuses:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    return enrich_order(order)


@router.put("/{order_id}")
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.manager),
        joinedload(Order.items),
        joinedload(Order.payments),
    ).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Check access
    if user.role == UserRole.SUPER_ADMIN:
        pass
    elif user.role == UserRole.DEALER_ADMIN:
        if order.organization_id != user.organization_id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    elif user.role == UserRole.DEALER_MANAGER:
        if order.manager_id != user.id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    # Only allow editing in certain statuses
    if order.status not in (OrderStatus.NEW, OrderStatus.CONFIRMED):
        raise HTTPException(
            status_code=400,
            detail="Нельзя редактировать заказ в текущем статусе",
        )

    update_data = payload.model_dump(exclude_unset=True)
    changed_fields = []
    for field, value in update_data.items():
        old_val = getattr(order, field, None)
        if old_val != value:
            changed_fields.append(f"{field}: {old_val} -> {value}")
            setattr(order, field, value)

    if changed_fields:
        history = OrderHistory(
            order_id=order.id,
            user_id=user.id,
            action="updated",
            old_value="",
            new_value="; ".join(changed_fields),
            note="Заказ обновлен",
        )
        db.add(history)

    db.commit()
    db.refresh(order)

    order = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.manager),
        joinedload(Order.items),
        joinedload(Order.payments),
    ).filter(Order.id == order.id).first()

    return enrich_order(order)


@router.patch("/{order_id}/status")
def change_order_status(
    order_id: int,
    payload: StatusChange,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.manager),
        joinedload(Order.items),
        joinedload(Order.payments),
    ).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    old_status = order.status
    new_status = payload.status

    if not can_change_status(user, old_status, new_status):
        raise HTTPException(
            status_code=403,
            detail=f"Вы не можете изменить статус с '{old_status}' на '{new_status}'",
        )

    # If COMPLETED, check that order is fully paid
    if new_status == OrderStatus.COMPLETED:
        total_paid = sum(Decimal(str(p.amount)) for p in order.payments)
        total_amount = Decimal(str(order.total_amount)) if order.total_amount else Decimal("0")
        if total_paid < total_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Заказ не полностью оплачен. "
                       f"Оплачено: {total_paid}, Итого: {total_amount}",
            )

    order.status = new_status

    # Auto-set dates on acceptance
    if new_status == OrderStatus.ACCEPTED:
        order.accepted_date = date.today()
        order.warranty_end_date = date.today() + timedelta(days=365)

    history = OrderHistory(
        order_id=order.id,
        user_id=user.id,
        action="status_changed",
        old_value=old_status,
        new_value=new_status,
        note=payload.note or f"Статус изменен: {old_status} -> {new_status}",
    )
    db.add(history)

    db.commit()
    db.refresh(order)

    order = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.manager),
        joinedload(Order.items),
        joinedload(Order.payments),
    ).filter(Order.id == order.id).first()

    return enrich_order(order)


@router.get("/{order_id}/history", response_model=List[OrderHistoryOut])
def get_order_history(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Access check
    if user.role == UserRole.SUPER_ADMIN:
        pass
    elif user.role == UserRole.DEALER_ADMIN:
        if order.organization_id != user.organization_id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    elif user.role == UserRole.DEALER_MANAGER:
        if order.manager_id != user.id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    entries = db.query(OrderHistory).options(
        joinedload(OrderHistory.user)
    ).filter(
        OrderHistory.order_id == order_id
    ).order_by(OrderHistory.created_at.desc()).all()

    result = []
    for entry in entries:
        data = OrderHistoryOut.model_validate(entry).model_dump()
        data["user_name"] = entry.user.full_name if entry.user else None
        result.append(data)

    return result


@router.get("/{order_id}/payments", response_model=List[PaymentOut])
def get_order_payments(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if user.role == UserRole.SUPER_ADMIN:
        pass
    elif user.role == UserRole.DEALER_ADMIN:
        if order.organization_id != user.organization_id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    elif user.role == UserRole.DEALER_MANAGER:
        if order.manager_id != user.id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    payments = db.query(Payment).filter(
        Payment.order_id == order_id
    ).order_by(Payment.payment_date.desc()).all()
    return payments


@router.patch("/{order_id}/items/{item_id}", response_model=OrderItemOut)
def update_order_item(
    order_id: int,
    item_id: int,
    payload: OrderItemUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    # Permission check
    if user.role == UserRole.SUPER_ADMIN:
        pass
    elif user.role == UserRole.DEALER_ADMIN:
        if order.organization_id != user.organization_id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    elif user.role == UserRole.DEALER_MANAGER:
        if order.manager_id != user.id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав")

    item = db.query(OrderItem).filter(
        OrderItem.id == item_id, OrderItem.order_id == order_id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Позиция не найдена")

    # Update fields
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(item, field, value)

    # Recalculate total_price
    item.total_price = item.quantity * item.price_per_unit
    db.flush()

    # Recalculate order total
    order.total_amount = sum(i.quantity * i.price_per_unit for i in order.items)

    # History
    db.add(OrderHistory(
        order_id=order.id,
        user_id=user.id,
        action="item_updated",
        old_value="",
        new_value=f"{item.model}: {item.price_per_unit} x {item.quantity} = {item.total_price}",
        note=f"Позиция {item.model} обновлена",
    ))

    db.commit()
    db.refresh(item)
    return item


@router.post("/{order_id}/payments", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def add_payment(
    order_id: int,
    payload: PaymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    order = db.query(Order).options(
        joinedload(Order.organization),
        joinedload(Order.payments),
    ).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if user.role == UserRole.SUPER_ADMIN:
        pass
    elif user.role == UserRole.DEALER_ADMIN:
        if order.organization_id != user.organization_id:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
    else:
        raise HTTPException(status_code=403, detail="Недостаточно прав для добавления оплаты")

    if order.status in (OrderStatus.REJECTED, OrderStatus.RETURNED):
        raise HTTPException(
            status_code=400,
            detail="Нельзя добавить оплату к отклоненному/возвращенному заказу",
        )

    payment = Payment(
        order_id=order.id,
        amount=payload.amount,
        payment_date=payload.payment_date,
        payment_method=payload.payment_method,
        received_by_id=user.id,
        notes=payload.notes,
    )
    db.add(payment)

    history = OrderHistory(
        order_id=order.id,
        user_id=user.id,
        action="payment_added",
        old_value="",
        new_value=str(payload.amount),
        note=f"Оплата {payload.amount} добавлена ({payload.payment_method})",
    )
    db.add(history)

    db.commit()
    db.refresh(payment)

    return payment
