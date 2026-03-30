"""
Seed initial data: products and test orders.
Organizations and users are seeded by auth_service.
Run: cd orders_service && python -m scripts.seed
"""
from datetime import date, timedelta
from decimal import Decimal

from database import SessionLocal
from models import Product, Organization, User, Order, OrderItem, OrderHistory, Payment


def seed_products(db):
    products_data = [
        ("outdoor", "JS", "Выносной JS", "meter"),
        ("outdoor", "J-2000", "Выносной J-2000", "meter"),
        ("outdoor", "J-1250", "Выносной J-1250", "meter"),
        ("outdoor", "J-1500", "Выносной J-1500", "meter"),
        ("outdoor", "J-1850", "Выносной J-1850", "meter"),
        ("outdoor", "J-960", "Выносной J-960", "piece"),
        ("outdoor", "J-2500", "Выносной J-2500", "meter"),
        ("outdoor", "J-3000", "Выносной J-3000", "meter"),
        ("outdoor", "J-1350", "Выносной J-1350", "meter"),
        ("outdoor", "M-1350", "Выносной M-1350", "meter"),
        ("outdoor", "M-600", "Выносной M-600", "piece"),
        ("outdoor", "M-1250", "Выносной M-1250", "meter"),
        ("outdoor", "M-2000", "Выносной M-2000", "meter"),
        ("outdoor", "MS", "Выносной MS", "meter"),
        ("outdoor", "JS-3750", "Выносной JS-3750", "meter"),
        ("outdoor", "JS-2500", "Выносной JS-2500", "meter"),
        ("outdoor", "JS-6000", "Выносной JS-6000", "meter"),
        ("outdoor", "S", "Выносной S", "meter"),
        ("outdoor", "S-2400", "Выносной S-2400", "meter"),
        ("outdoor", "S-4000", "Выносной S-4000", "meter"),
        ("built_in", "E-2000", "Встроенный E-2000", "meter"),
        ("built_in", "E-1250", "Встроенный E-1250", "meter"),
        ("built_in", "ES", "Встроенный ES", "meter"),
        ("built_in", "ES-5000", "Встроенный ES-5000", "meter"),
        ("built_in", "ES-2500", "Встроенный ES-2500", "meter"),
        ("freezer", "A-2000", "Морозильник A-2000", "piece"),
        ("freezer", "A-1250", "Морозильник A-1250", "piece"),
        ("freezer", "A-1350", "Морозильник A-1350", "piece"),
        ("freezer", "A-1500", "Морозильник A-1500", "piece"),
        ("freezer", "A-620", "Морозильник A-620", "piece"),
        ("freezer", "AS", "Морозильник AS", "piece"),
        ("freezer", "AS-2000", "Морозильник AS-2000", "piece"),
        ("freezer", "AS-2500", "Морозильник AS-2500", "piece"),
        ("freezer", "AS-6500", "Морозильник AS-6500", "piece"),
        ("freezer", "AS-7000", "Морозильник AS-7000", "piece"),
        ("freezer", "AT-2000", "Морозильник AT-2000", "piece"),
        ("unit", "T-10/12", "Агрегат T-10/12", "piece"),
        ("unit", "T-10/16", "Агрегат T-10/16", "piece"),
        ("unit", "T-6/10", "Агрегат T-6/10", "piece"),
        ("door", "Есік", "Дверь", "piece"),
        ("without_unit", "Без агрегата", "Без агрегата", "piece"),
    ]

    for category, model, name, unit in products_data:
        if not db.query(Product).filter(Product.model == model).first():
            db.add(Product(category=category, model=model, name=name, unit=unit))
            print(f"  + Product: {model} ({category})")
    db.commit()
    print(f"\nTotal: {db.query(Product).count()} products")


def seed_orders(db):
    # Check if orders already exist
    if db.query(Order).first():
        print("\n  Orders already seeded, skipping.")
        return

    # Wait for auth_service to seed organizations and users
    import time
    org, manager = None, None
    for attempt in range(15):
        org = db.query(Organization).filter(Organization.name == "Dealer Astana Premium").first()
        manager = db.query(User).filter(User.phone == "+77000000001").first()
        if org and manager:
            break
        print(f"  Waiting for auth_service seed... ({attempt + 1}/15)")
        db.expire_all()
        time.sleep(2)

    if not org or not manager:
        print("\n  ⚠ Org or manager not found after waiting. Skipping orders.")
        return

    # Helper to get product by model
    def prod(model):
        return db.query(Product).filter(Product.model == model).first()

    today = date.today()

    orders_data = [
        # (order_number, status, client, region, days_ago, items: [(model, qty, color, price)])
        {
            "order_number": "MZ-2026-001",
            "status": "new",
            "client_name": "Ержан Касымов",
            "client_phone": "+77011112233",
            "client_region": "Astana",
            "client_address": "ул. Кенесары 40, кв. 15",
            "days_ago": 0,
            "items": [
                ("JS", 3.5, "белый", Decimal("85000")),
                ("T-10/12", 1, "серый", Decimal("120000")),
            ],
        },
        {
            "order_number": "MZ-2026-002",
            "status": "confirmed",
            "client_name": "Айгуль Нурланова",
            "client_phone": "+77022223344",
            "client_region": "Almaty",
            "client_address": "пр. Достык 150, офис 8",
            "days_ago": 3,
            "items": [
                ("E-2000", 2.0, "коричневый", Decimal("95000")),
                ("Есік", 2, "", Decimal("45000")),
            ],
        },
        {
            "order_number": "MZ-2026-003",
            "status": "in_production",
            "client_name": "Бауыржан Серикбаев",
            "client_phone": "+77033334455",
            "client_region": "Karaganda",
            "client_address": "ул. Бухар Жырау 70",
            "days_ago": 7,
            "items": [
                ("A-2000", 2, "белый", Decimal("210000")),
                ("A-1250", 1, "серый", Decimal("175000")),
                ("T-10/16", 2, "", Decimal("135000")),
            ],
        },
        {
            "order_number": "MZ-2026-004",
            "status": "ready",
            "client_name": "Динара Жумабекова",
            "client_phone": "+77044445566",
            "client_region": "Shymkent",
            "client_address": "ул. Тауке Хана 25",
            "days_ago": 14,
            "items": [
                ("J-2000", 5.0, "зелёный", Decimal("78000")),
                ("J-1250", 3.0, "зелёный", Decimal("65000")),
            ],
        },
        {
            "order_number": "MZ-2026-005",
            "status": "shipping",
            "client_name": "Нурлан Абдикаримов",
            "client_phone": "+77055556677",
            "client_region": "Aktobe",
            "client_address": "пр. Абилкайыр Хана 30",
            "days_ago": 10,
            "items": [
                ("ES-5000", 1.5, "белый", Decimal("320000")),
            ],
        },
        {
            "order_number": "MZ-2026-006",
            "status": "delivered",
            "client_name": "Мадина Оразбекова",
            "client_phone": "+77066667788",
            "client_region": "Atyrau",
            "client_address": "ул. Сатпаев 12",
            "days_ago": 20,
            "items": [
                ("AS-2500", 1, "белый", Decimal("450000")),
                ("T-10/12", 1, "", Decimal("120000")),
            ],
        },
        {
            "order_number": "MZ-2026-007",
            "status": "completed",
            "client_name": "Асхат Тлеубердиев",
            "client_phone": "+77077778899",
            "client_region": "Pavlodar",
            "client_address": "ул. Кайырбаева 55",
            "days_ago": 30,
            "items": [
                ("M-2000", 4.0, "коричневый", Decimal("72000")),
                ("M-1350", 2.5, "коричневый", Decimal("60000")),
                ("Есік", 1, "", Decimal("45000")),
            ],
        },
        {
            "order_number": "MZ-2026-008",
            "status": "new",
            "client_name": "Гульнара Сейтжанова",
            "client_phone": "+77088889900",
            "client_region": "Kostanay",
            "client_address": "ул. Аль-Фараби 18",
            "days_ago": 1,
            "items": [
                ("J-1850", 6.0, "белый", Decimal("82000")),
                ("J-960", 2, "белый", Decimal("55000")),
                ("T-6/10", 1, "", Decimal("95000")),
            ],
        },
    ]

    print("\n--- Orders ---")
    for od in orders_data:
        order_date = today - timedelta(days=od["days_ago"])
        deadline = order_date + timedelta(days=21)

        # Calculate totals
        items_total = sum(
            Decimal(str(qty)) * price for _, qty, _, price in od["items"]
        )

        order = Order(
            order_number=od["order_number"],
            organization_id=org.id,
            manager_id=manager.id,
            factory="Кулан",
            client_name=od["client_name"],
            client_phone=od["client_phone"],
            client_region=od["client_region"],
            client_address=od["client_address"],
            total_amount=items_total,
            order_date=order_date,
            deadline=deadline,
            status=od["status"],
        )
        db.add(order)
        db.flush()

        for model, qty, color, price in od["items"]:
            p = prod(model)
            db.add(OrderItem(
                order_id=order.id,
                product_id=p.id if p else None,
                model=model,
                category=p.category if p else "",
                quantity=qty,
                unit=p.unit if p else "piece",
                color=color,
                price_per_unit=price,
                total_price=Decimal(str(qty)) * price,
            ))

        # Add history entry
        db.add(OrderHistory(
            order_id=order.id,
            user_id=manager.id,
            action="created",
            new_value=od["status"],
            note="Тестовый заказ",
        ))

        # Add payment for delivered/completed orders
        if od["status"] in ("delivered", "completed"):
            db.add(Payment(
                order_id=order.id,
                amount=items_total,
                payment_date=order_date + timedelta(days=2),
                payment_method="Kaspi",
                received_by_id=manager.id,
            ))

        print(f"  + Order: {od['order_number']} [{od['status']}] — {od['client_name']} ({items_total:,.0f} ₸)")

    db.commit()
    print(f"\nTotal: {db.query(Order).count()} orders")


def seed():
    db = SessionLocal()
    try:
        seed_products(db)
        seed_orders(db)
    except Exception as e:
        db.rollback()
        print(f"\nSeed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=== Seeding MoozTau data ===")
    seed()
    print("=== Done ===")
