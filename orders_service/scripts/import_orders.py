"""
Import all orders from Заказдар (2).xlsx into platform_orders.
Maps Excel statuses to OrderStatus enum, channels to organizations.

Run: cd orders_service && python -m scripts.import_orders
"""
import re
import sys
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation
from pathlib import Path

import openpyxl

from database import SessionLocal
from models import (
    Organization, User, Product, Order, OrderItem,
    OrderHistory, Payment, OrderStatus,
)

_script_dir = Path(__file__).resolve().parent.parent
EXCEL_PATH = _script_dir / "data" / "Заказдар (2).xlsx"
if not EXCEL_PATH.exists():
    EXCEL_PATH = _script_dir.parent / "data" / "Заказдар (2).xlsx"
if not EXCEL_PATH.exists():
    EXCEL_PATH = Path("/app/data/Заказдар (2).xlsx")

STATUS_MAP = {
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


def clean(val):
    if val is None:
        return ""
    s = str(val).strip().replace("\xa0", " ").replace("\u200b", "")
    return s


def clean_phone(val):
    if not val:
        return ""
    return clean(val).replace(" ", "").replace("-", "").replace("(", "").replace(")", "")


def to_decimal(val):
    if val is None:
        return None
    try:
        return Decimal(str(val))
    except (InvalidOperation, ValueError):
        return None


def to_date(val):
    if val is None:
        return None
    if hasattr(val, "date"):
        return val.date()
    return None


def import_orders():
    db = SessionLocal()

    # Check if already imported
    existing_count = db.query(Order).count()
    if existing_count > 50:
        print(f"Already have {existing_count} orders. Skipping import.")
        db.close()
        return

    # Delete existing test orders
    if existing_count > 0:
        print(f"Deleting {existing_count} existing orders...")
        db.query(Payment).delete()
        db.query(OrderHistory).delete()
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.commit()

    # Build org map: channel name -> org id
    org_map = {}
    for org in db.query(Organization).all():
        org_map[org.name] = org.id
    # Handle "МТ Кулан" → use MoozTau HQ
    hq = db.query(Organization).filter(Organization.name == "MoozTau").first()
    if not hq:
        print("ERROR: MoozTau org not found. Run auth seed first.")
        db.close()
        return

    # Get admin user
    admin = db.query(User).filter(User.phone == "+77000000001").first()
    if not admin:
        print("ERROR: Admin user not found. Run auth seed first.")
        db.close()
        return

    # Build product map: model -> product
    product_map = {}
    for p in db.query(Product).all():
        product_map[p.model] = p

    # Load Excel
    print(f"Loading {EXCEL_PATH}...")
    wb = openpyxl.load_workbook(str(EXCEL_PATH), read_only=True, data_only=True)
    ws = wb["MoozTau"]

    imported = 0
    skipped = 0

    for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True)):
        vals = list(row)
        order_num_raw = clean(vals[0])
        if not order_num_raw:
            skipped += 1
            continue

        order_num = re.sub(r"\s+", "", order_num_raw)
        if not order_num:
            skipped += 1
            continue

        # Map fields
        contract = clean(vals[1])
        order_date = to_date(vals[2]) or date(2024, 1, 1)
        manager_name = clean(vals[3])
        region = clean(vals[4])
        address = clean(vals[5])
        client_name = clean(vals[6])
        phone = clean_phone(vals[7])
        product_name = clean(vals[8])
        model_code = clean(vals[9])
        quantity = to_decimal(vals[10]) or Decimal("1")
        unit = clean(vals[11]) or "метр"
        color = clean(vals[12])
        length = to_decimal(vals[13])
        height = to_decimal(vals[14])
        width = to_decimal(vals[15])
        revenue = to_decimal(vals[16]) or Decimal("0")
        price_per_meter = to_decimal(vals[17])
        deadline = to_date(vals[18])
        accepted_date = to_date(vals[19])
        status_raw = clean(vals[20]) if len(vals) > 20 else ""
        document = clean(vals[23]) if len(vals) > 23 else ""
        production = clean(vals[24]) if len(vals) > 24 else ""
        channel = clean(vals[25]) if len(vals) > 25 else ""
        payment_total = to_decimal(vals[26]) if len(vals) > 26 else None
        balance = to_decimal(vals[27]) if len(vals) > 27 else None

        # Map status
        status = STATUS_MAP.get(status_raw, OrderStatus.NEW)

        # Map organization
        org_id = org_map.get(channel, hq.id)

        # Warranty
        warranty = None
        if accepted_date:
            warranty = accepted_date + timedelta(days=365)

        # Handle duplicate order numbers
        base_num = f"L-{order_num.zfill(6)}"
        final_num = base_num
        suffix = 1
        while db.query(Order).filter(Order.order_number == final_num).first():
            suffix += 1
            final_num = f"{base_num}-{suffix}"

        # Create order
        order = Order(
            order_number=final_num,
            contract_number=contract,
            organization_id=org_id,
            manager_id=admin.id,
            factory="Кулан",
            client_name=client_name,
            client_phone=phone,
            client_region=region,
            client_address=address,
            total_amount=revenue,
            order_date=order_date,
            deadline=deadline,
            accepted_date=accepted_date,
            warranty_end_date=warranty,
            status=status,
            has_contract=(document == "С док"),
        )
        db.add(order)
        db.flush()

        # Create order item
        product = product_map.get(model_code)
        item = OrderItem(
            order_id=order.id,
            product_id=product.id if product else None,
            model=model_code or product_name,
            category=product_name,
            quantity=quantity,
            unit=unit,
            length=length,
            height=height,
            width=width,
            color=color,
            price_per_unit=price_per_meter or Decimal("0"),
            total_price=revenue,
        )
        db.add(item)

        # Create payment if paid
        if payment_total and payment_total > 0:
            db.add(Payment(
                order_id=order.id,
                amount=payment_total,
                payment_date=order_date,
                payment_method="",
                notes="Импорт из Excel",
            ))

        # History
        db.add(OrderHistory(
            order_id=order.id,
            user_id=admin.id,
            action="created",
            new_value=status,
            note="Импорт из Excel",
        ))

        imported += 1
        if imported % 100 == 0:
            print(f"  ... {imported} imported")

    db.commit()
    wb.close()
    db.close()

    print(f"\nDone: {imported} orders imported, {skipped} skipped")


if __name__ == "__main__":
    print("=== Importing orders from Excel ===")
    import_orders()
    print("=== Done ===")
