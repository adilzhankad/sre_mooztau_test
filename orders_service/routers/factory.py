from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from database import get_db
from models.user import User, UserRole
from models.order import Order, OrderItem, OrderHistory, OrderStatus
from models.product import Product
from models.inventory import Inventory
from schemas.order import StatusChange, OrderItemOut, OrderHistoryOut
from schemas.inventory import InventoryCreate, InventoryUpdate, InventoryOut
from services.permissions import can_change_status
from middleware.auth import get_current_user, require_factory

router = APIRouter(prefix="/api/factory", tags=["Factory"])

FACTORY_VISIBLE_STATUSES = [
    OrderStatus.CONFIRMED,
    OrderStatus.IN_PRODUCTION,
    OrderStatus.READY,
]


def _factory_order_to_dict(order: Order) -> dict:
    """Build order dict WITHOUT price information for factory users."""
    items = []
    for item in order.items:
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "model": item.model,
            "category": item.category,
            "quantity": item.quantity,
            "unit": item.unit,
            "length": item.length,
            "height": item.height,
            "width": item.width,
            "color": item.color,
        })

    return {
        "id": order.id,
        "order_number": order.order_number,
        "factory": order.factory,
        "client_name": order.client_name,
        "client_region": order.client_region,
        "order_date": order.order_date,
        "deadline": order.deadline,
        "status": order.status,
        "items": items,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


@router.get("/orders")
def factory_list_orders(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_factory),
):
    query = db.query(Order).options(
        joinedload(Order.items),
    ).filter(Order.status.in_(FACTORY_VISIBLE_STATUSES))

    if status_filter and status_filter in [s.value for s in FACTORY_VISIBLE_STATUSES]:
        query = query.filter(Order.status == status_filter)

    orders = query.order_by(Order.id.desc()).all()

    # Deduplicate after joinedload
    seen = set()
    unique_orders = []
    for o in orders:
        if o.id not in seen:
            seen.add(o.id)
            unique_orders.append(o)

    return [_factory_order_to_dict(o) for o in unique_orders]


@router.get("/orders/{order_id}")
def factory_get_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_factory),
):
    order = db.query(Order).options(
        joinedload(Order.items),
    ).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    if order.status not in FACTORY_VISIBLE_STATUSES:
        raise HTTPException(status_code=403, detail="Заказ недоступен для просмотра")

    return _factory_order_to_dict(order)


@router.patch("/orders/{order_id}/status")
def factory_update_status(
    order_id: int,
    payload: StatusChange,
    db: Session = Depends(get_db),
    user: User = Depends(require_factory),
):
    order = db.query(Order).options(
        joinedload(Order.items),
    ).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")

    old_status = order.status
    new_status = payload.status

    # Factory can only do certain transitions
    allowed_transitions = [
        (OrderStatus.CONFIRMED, OrderStatus.IN_PRODUCTION),
        (OrderStatus.IN_PRODUCTION, OrderStatus.READY),
    ]
    if user.role == UserRole.SUPER_ADMIN:
        if not can_change_status(user, old_status, new_status):
            raise HTTPException(
                status_code=403,
                detail=f"Нельзя изменить статус с '{old_status}' на '{new_status}'",
            )
    else:
        if (old_status, new_status) not in allowed_transitions:
            raise HTTPException(
                status_code=403,
                detail=f"Фабрика не может изменить статус с '{old_status}' на '{new_status}'",
            )

    order.status = new_status

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
        joinedload(Order.items),
    ).filter(Order.id == order.id).first()

    return _factory_order_to_dict(order)


@router.get("/dashboard")
def factory_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_factory),
):
    confirmed_count = db.query(func.count(Order.id)).filter(
        Order.status == OrderStatus.CONFIRMED
    ).scalar() or 0

    in_production = db.query(func.count(Order.id)).filter(
        Order.status == OrderStatus.IN_PRODUCTION
    ).scalar() or 0

    ready = db.query(func.count(Order.id)).filter(
        Order.status == OrderStatus.READY
    ).scalar() or 0

    shipped = db.query(func.count(Order.id)).filter(
        Order.status == OrderStatus.SHIPPING
    ).scalar() or 0

    total_orders = confirmed_count + in_production + ready + shipped

    return {
        "total_orders": total_orders,
        "in_production": in_production,
        "ready": ready,
        "shipped": shipped,
    }


@router.get("/inventory", response_model=List[InventoryOut])
def list_inventory(
    model: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_factory),
):
    query = db.query(Inventory)

    if model:
        query = query.filter(Inventory.model.ilike(f"%{model}%"))

    items = query.order_by(Inventory.id).all()
    return items


@router.post("/inventory", response_model=InventoryOut, status_code=status.HTTP_201_CREATED)
def add_inventory(
    payload: InventoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_factory),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    existing = db.query(Inventory).filter(
        Inventory.factory == "Кулан",
        Inventory.product_id == payload.product_id,
        Inventory.color == payload.color,
    ).first()

    if existing:
        existing.quantity += payload.quantity
        db.commit()
        db.refresh(existing)
        return existing

    inv = Inventory(
        factory="Кулан",
        product_id=payload.product_id,
        model=payload.model,
        color=payload.color,
        quantity=payload.quantity,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


@router.put("/inventory/{inventory_id}", response_model=InventoryOut)
def update_inventory(
    inventory_id: int,
    payload: InventoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_factory),
):
    inv = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Запись склада не найдена")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(inv, field, value)

    db.commit()
    db.refresh(inv)
    return inv
