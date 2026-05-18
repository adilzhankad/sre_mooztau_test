"""
Seed realistic demo data for screenshots — orders in different statuses,
inventory items, and payments.

Run inside the orders container:
    docker exec -i mooztau_back-orders-1 python -m scripts.seed_demo
"""
from datetime import date, datetime, timedelta
from decimal import Decimal
import random

from database import SessionLocal
from models import Order, OrderItem, OrderHistory, Payment, Product, Inventory
from models.order import OrderStatus
from models.inventory import InventoryStatus


def _next_order_number(db, idx):
    """Generate sequential MZ-000001 numbers starting from current max + 1."""
    last = db.query(Order).order_by(Order.id.desc()).first()
    base = 0
    if last and last.order_number and last.order_number.startswith("MZ-"):
        try:
            base = int(last.order_number.replace("MZ-", ""))
        except ValueError:
            base = 0
    return f"MZ-{base + idx + 1:06d}"


DEMO_ORDERS = [
    # (status, client_name, phone, region, address, items[(model, qty, price)])
    (OrderStatus.NEW, "Алмас Серикбаев", "+77011112233", "Алматы",
     "ул. Абая 150", [("J-2000", 2, 850000)]),

    (OrderStatus.NEW, "Болат Жанибеков", "+77022223344", "Астана",
     "пр. Республики 25", [("JS-2500", 3, 920000), ("S-3600", 1, 380000)]),

    (OrderStatus.NEW, "Айгуль Касымова", "+77033334455", "Шымкент",
     "ул. Тауке хана 78", [("M-1250", 1, 540000)]),

    (OrderStatus.CONFIRMED, "Ерлан Турсунов", "+77044445566", "Алматы",
     "мкр. Самал-2, 99", [("E-2000", 4, 780000)]),

    (OrderStatus.IN_PRODUCTION, "Дамир Сатпаев", "+77055556677", "Тараз",
     "ул. Сулейменова 12", [("A-1500", 2, 690000), ("Есік", 4, 85000)]),

    (OrderStatus.IN_PRODUCTION, "Гульнара Ахметова", "+77066667788", "Алматы",
     "пр. Достык 200", [("ES-2500", 1, 1100000)]),

    (OrderStatus.READY, "Канат Жумабаев", "+77077778899", "Астана",
     "ул. Кенесары 32", [("J-1500", 3, 720000), ("S-4000", 1, 410000)]),

    (OrderStatus.DELIVERED, "Самат Орынбасаров", "+77088889900", "Алматы",
     "ул. Сатпаева 88", [("AS-2000", 2, 870000)]),

    (OrderStatus.ACCEPTED, "Айдос Бекенов", "+77099990011", "Шымкент",
     "ул. Байтурсынова 5", [("J-2500", 1, 980000), ("T-12/22", 1, 360000)]),

    (OrderStatus.COMPLETED, "Мадина Сулейменова", "+77011112266", "Алматы",
     "ул. Манаса 44", [("JS-3750", 2, 1150000)]),
]


INVENTORY_ITEMS = [
    # (factory, model, color, quantity)
    ("Кулан", "J-2000", "Белый", 3),
    ("Кулан", "J-1500", "Серебристый", 5),
    ("Кулан", "JS-2500", "Белый", 2),
    ("Кулан", "M-1250", "Чёрный", 4),
    ("Кулан", "E-2000", "Белый", 6),
    ("Кулан", "A-1500", "Серебристый", 2),
    ("Тараз", "AS-2000", "Белый", 3),
    ("Тараз", "S-3600", "—", 8),
    ("Тараз", "S-4000", "—", 5),
    ("Тараз", "Есік", "Белый", 12),
    ("Тараз", "J-1250", "Белый", 4),
    ("Кулан", "ES-2500", "Серебристый", 1),
]


def seed_demo():
    db = SessionLocal()
    try:
        # Need organization + manager from auth_service
        from sqlalchemy import text

        hq_org_row = db.execute(text(
            "SELECT id FROM organizations WHERE name = 'MoozTau' LIMIT 1"
        )).first()
        admin_row = db.execute(text(
            "SELECT id FROM users WHERE phone = '+77000000001' LIMIT 1"
        )).first()

        if not hq_org_row or not admin_row:
            print("ERROR: organizations/users not seeded yet. Run auth_service seed first.")
            return

        hq_org_id = hq_org_row[0]
        admin_id = admin_row[0]

        # ── Orders ───────────────────────────────────────────────────────
        created_orders = 0
        for idx, (status, name, phone, region, address, items) in enumerate(DEMO_ORDERS):
            order_number = _next_order_number(db, idx)
            existing = db.query(Order).filter(Order.client_name == name).first()
            if existing:
                continue

            order_date = date.today() - timedelta(days=random.randint(0, 30))
            deadline = order_date + timedelta(days=random.randint(7, 30))

            total = sum(qty * price for _, qty, price in items)

            order = Order(
                order_number=order_number,
                organization_id=hq_org_id,
                manager_id=admin_id,
                factory="Кулан",
                client_name=name,
                client_phone=phone,
                client_region=region,
                client_address=address,
                total_amount=Decimal(total),
                final_amount=Decimal(total),
                payment_type="Kaspi" if idx % 2 == 0 else "Halyk",
                order_date=order_date,
                deadline=deadline,
                status=status.value if hasattr(status, "value") else status,
                has_contract=True,
            )
            db.add(order)
            db.flush()

            # Order items
            for model, qty, price in items:
                product = db.query(Product).filter(Product.model == model).first()
                if not product:
                    continue
                db.add(OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    model=model,
                    category=product.category,
                    quantity=Decimal(qty),
                    unit=product.unit,
                    price_per_unit=Decimal(price),
                    recommended_price=Decimal(price),
                    total_price=Decimal(qty * price),
                ))

            # History entry
            db.add(OrderHistory(
                order_id=order.id,
                user_id=admin_id,
                action="created",
                note=f"Заказ {order_number} создан (demo seed)",
            ))

            # Payment for completed/accepted orders
            if status in (OrderStatus.COMPLETED, OrderStatus.ACCEPTED, OrderStatus.DELIVERED):
                db.add(Payment(
                    order_id=order.id,
                    amount=Decimal(total),
                    payment_date=order_date + timedelta(days=2),
                    payment_method="Kaspi" if idx % 2 == 0 else "Halyk",
                    received_by_id=admin_id,
                    notes="Оплата по заказу (demo)",
                ))

            created_orders += 1
            print(f"  Created order {order_number} [{status}] — {name}")

        # ── Inventory ────────────────────────────────────────────────────
        created_inventory = 0
        for factory, model, color, quantity in INVENTORY_ITEMS:
            product = db.query(Product).filter(Product.model == model).first()
            if not product:
                continue

            existing = db.query(Inventory).filter(
                Inventory.factory == factory,
                Inventory.model == model,
                Inventory.color == color,
            ).first()

            if existing:
                continue

            db.add(Inventory(
                factory=factory,
                product_id=product.id,
                model=model,
                color=color,
                quantity=quantity,
                status=InventoryStatus.IN_STOCK.value,
            ))
            created_inventory += 1
            print(f"  Added inventory: {factory} / {model} / {color} × {quantity}")

        db.commit()
        print(f"\nDone. Created {created_orders} orders and {created_inventory} inventory items.")

    except Exception as e:
        db.rollback()
        print(f"ERROR: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()
