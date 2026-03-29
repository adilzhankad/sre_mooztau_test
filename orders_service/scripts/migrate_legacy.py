"""
Migrate legacy Django orders into the new platform.
Reads from: orders_order, orders_orderpayment, core_employee, core_region,
            core_productmodel, core_status, core_saleschannel
Writes to: platform_orders, platform_order_items, platform_payments

Run: cd orders_service && python -m scripts.migrate_legacy
"""
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import text

from database import SessionLocal, engine
from models import Organization, Order, OrderItem, OrderStatus, Payment


def migrate():
    db = SessionLocal()

    # Check if already migrated
    existing = db.query(Order).count()
    if existing > 0:
        print(f"Already have {existing} orders in platform_orders. Skipping.")
        db.close()
        return

    # Get default organization (MoozTau HQ)
    hq = db.query(Organization).filter(Organization.name == "MoozTau").first()
    if not hq:
        print("ERROR: Run seed.py first")
        db.close()
        return

    # Build org mapping from old sales channels
    org_map = {}
    for org in db.query(Organization).all():
        org_map[org.name] = org.id

    # Read legacy orders using raw SQL (Django tables)
    with engine.connect() as conn:
        # Check if legacy tables exist
        result = conn.execute(text(
            "SELECT EXISTS (SELECT FROM information_schema.tables "
            "WHERE table_name = 'orders_order')"
        ))
        if not result.scalar():
            print("Legacy table orders_order not found. Nothing to migrate.")
            db.close()
            return

        # Read old orders with JOINs
        rows = conn.execute(text("""
            SELECT
                o.id, o.order_number, o.contract_number, o.date,
                e.name as manager_name,
                r.name as region_name,
                o.address, o.client_name, o.phone, o.product_name,
                pm.code as model_code,
                o.quantity, o.unit, o.color,
                o.length, o.height, o.width,
                o.revenue, o.price_per_meter,
                o.deadline, o.accepted_date,
                s.name as status_name,
                sc.name as channel_name,
                o.payment_total, o.balance, o.document, o.production
            FROM orders_order o
            LEFT JOIN core_employee e ON o.manager_id = e.id
            LEFT JOIN core_region r ON o.region_id = r.id
            LEFT JOIN core_productmodel pm ON o.model_id = pm.id
            LEFT JOIN core_status s ON o.status_id = s.id
            LEFT JOIN core_saleschannel sc ON o.sales_channel_id = sc.id
            ORDER BY o.id
        """)).fetchall()

        print(f"Found {len(rows)} legacy orders")

        # Map old status names to new enum
        status_map = {
            "Завершен": OrderStatus.COMPLETED,
            "В работе": OrderStatus.IN_PRODUCTION,
            "В пути": OrderStatus.SHIPPING,
            "Товар доставлен": OrderStatus.DELIVERED,
            "Товар принят заказчиком": OrderStatus.ACCEPTED,
            "Отказ": OrderStatus.REJECTED,
            "Товар возврат": OrderStatus.RETURNED,
            "Анализ": OrderStatus.NEW,
            "Товар на согласование": OrderStatus.CONFIRMED,
            "Товар на складе": OrderStatus.READY,
            "Исполнен частично": OrderStatus.IN_PRODUCTION,
        }

        migrated = 0
        for row in rows:
            # Map organization
            channel = row.channel_name or "MoozTau"
            org_id = org_map.get(channel, hq.id)

            # Map status
            status = (
                status_map.get(row.status_name, OrderStatus.NEW)
                if row.status_name
                else OrderStatus.NEW
            )

            # Create order
            order = Order(
                order_number=f"L-{str(row.order_number).zfill(6)}",
                contract_number=row.contract_number or "",
                organization_id=org_id,
                manager_id=1,  # admin (will be fixed when real users are created)
                factory=row.production or "Кулан",
                client_name=row.client_name or "",
                client_phone=row.phone or "",
                client_region=row.region_name or "",
                client_address=row.address or "",
                total_amount=row.revenue or Decimal("0"),
                order_date=row.date or date(2024, 1, 1),
                deadline=row.deadline,
                accepted_date=row.accepted_date,
                warranty_end_date=(
                    (row.accepted_date + timedelta(days=365))
                    if row.accepted_date
                    else None
                ),
                status=status,
                has_contract=(row.document == "С док") if row.document else False,
            )
            db.add(order)
            db.flush()

            # Create order item
            item = OrderItem(
                order_id=order.id,
                model=row.model_code or row.product_name or "",
                category=row.product_name or "",
                quantity=row.quantity or Decimal("1"),
                unit=row.unit or "meter",
                length=row.length,
                height=row.height,
                width=row.width,
                color=row.color or "",
                price_per_unit=row.price_per_meter or Decimal("0"),
                total_price=row.revenue or Decimal("0"),
            )
            db.add(item)
            migrated += 1

        db.commit()
        print(f"Migrated {migrated} orders")

        # Now migrate payments
        payment_rows = conn.execute(text("""
            SELECT op.id, o.order_number, op.date, op.amount
            FROM orders_orderpayment op
            JOIN orders_order o ON op.order_id = o.id
            ORDER BY op.date
        """)).fetchall()

        print(f"Found {len(payment_rows)} legacy payments")

        # Build order_number -> new order id mapping
        order_lookup = {}
        for order in db.query(Order).all():
            # L-000001 -> 1
            num = order.order_number.replace("L-", "").lstrip("0") or "0"
            order_lookup[num] = order.id

        pay_migrated = 0
        for prow in payment_rows:
            order_num = str(prow.order_number).strip()
            new_order_id = order_lookup.get(order_num)
            if new_order_id and prow.amount:
                db.add(Payment(
                    order_id=new_order_id,
                    amount=prow.amount,
                    payment_date=prow.date,
                    payment_method="",
                    notes="Мигрировано из Excel",
                ))
                pay_migrated += 1

        db.commit()
        print(f"Migrated {pay_migrated} payments")

    db.close()


if __name__ == "__main__":
    print("=== Migrating legacy orders ===")
    migrate()
    print("=== Done ===")
