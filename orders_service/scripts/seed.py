"""
Seed initial data: products.
Organizations and users are seeded by auth_service.
Run: cd orders_service && python -m scripts.seed
"""
from database import SessionLocal
from models import Product


def seed_products(db):
    """Products from Копия Заказдар.xlsx — real MoozTau catalog."""
    products_data = [
        # (category, model, name, unit)
        # Холодильник встроенный (Встроенный) — метр
        ("BUILT_IN", "J-2000", "Холодильник встроенный J-2000", "meter"),
        ("BUILT_IN", "J-1250", "Холодильник встроенный J-1250", "meter"),
        ("BUILT_IN", "J-1500", "Холодильник встроенный J-1500", "meter"),
        ("BUILT_IN", "J-1850", "Холодильник встроенный J-1850", "meter"),
        ("BUILT_IN", "J-960", "Холодильник встроенный J-960", "piece"),
        ("BUILT_IN", "J-1350", "Холодильник встроенный J-1350", "meter"),
        ("BUILT_IN", "J-2500", "Холодильник встроенный J-2500", "meter"),
        ("BUILT_IN", "J-3000", "Холодильник встроенный J-3000", "meter"),
        ("BUILT_IN", "J", "Холодильник встроенный J", "meter"),
        ("BUILT_IN", "E-2000", "Холодильник встроенный E-2000", "meter"),
        ("BUILT_IN", "E-1250", "Холодильник встроенный E-1250", "meter"),
        ("BUILT_IN", "ES", "Холодильник встроенный ES", "meter"),
        ("BUILT_IN", "ES-5000", "Холодильник встроенный ES-5000", "meter"),
        ("BUILT_IN", "ES-2500", "Холодильник встроенный ES-2500", "meter"),
        ("BUILT_IN", "M-1250", "Холодильник встроенный M-1250", "meter"),
        ("BUILT_IN", "M-1350", "Холодильник встроенный M-1350", "meter"),
        ("BUILT_IN", "A", "Холодильник встроенный A", "piece"),
        ("BUILT_IN", "A-2000", "Холодильник встроенный A-2000", "piece"),
        ("BUILT_IN", "A-1250", "Холодильник встроенный A-1250", "piece"),
        ("BUILT_IN", "A-1350", "Холодильник встроенный A-1350", "piece"),
        ("BUILT_IN", "A-1500", "Холодильник встроенный A-1500", "piece"),
        ("BUILT_IN", "A-620", "Холодильник встроенный A-620", "piece"),
        ("BUILT_IN", "AT-2000", "Холодильник встроенный AT-2000", "piece"),
        # Холодильник выносной (Выносной) — метр
        ("OUTDOOR", "JS", "Холодильник выносной JS", "meter"),
        ("OUTDOOR", "JS-1250", "Холодильник выносной JS-1250", "meter"),
        ("OUTDOOR", "JS-2500", "Холодильник выносной JS-2500", "meter"),
        ("OUTDOOR", "JS-3750", "Холодильник выносной JS-3750", "meter"),
        ("OUTDOOR", "JS-6000", "Холодильник выносной JS-6000", "meter"),
        ("OUTDOOR", "AS", "Холодильник выносной AS", "piece"),
        ("OUTDOOR", "AS-2000", "Холодильник выносной AS-2000", "piece"),
        ("OUTDOOR", "AS-2500", "Холодильник выносной AS-2500", "piece"),
        ("OUTDOOR", "MS", "Холодильник выносной MS", "meter"),
        # Морозильник — метр
        ("FREEZER", "M-600", "Морозильник M-600", "piece"),
        ("FREEZER", "M-1250", "Морозильник M-1250", "meter"),
        ("FREEZER", "M-1350", "Морозильник M-1350", "meter"),
        ("FREEZER", "M-2000", "Морозильник M-2000", "meter"),
        # Агрегат — штука
        ("UNIT", "S", "Агрегат S", "piece"),
        ("UNIT", "S-2000(-25)", "Агрегат S-2000(-25)", "piece"),
        ("UNIT", "S-2400", "Агрегат S-2400", "piece"),
        ("UNIT", "S-3600", "Агрегат S-3600", "piece"),
        ("UNIT", "S-4000", "Агрегат S-4000", "piece"),
        ("UNIT", "S-4800", "Агрегат S-4800", "piece"),
        ("UNIT", "S-5500", "Агрегат S-5500", "piece"),
        ("UNIT", "S-6700", "Агрегат S-6700", "piece"),
        ("UNIT", "S-7800", "Агрегат S-7800", "piece"),
        ("UNIT", "S-9600", "Агрегат S-9600", "piece"),
        ("UNIT", "T-6/10", "Агрегат T-6/10", "piece"),
        ("UNIT", "T-8/12", "Агрегат T-8/12", "piece"),
        ("UNIT", "T-10/12", "Агрегат T-10/12", "piece"),
        ("UNIT", "T-10/16", "Агрегат T-10/16", "piece"),
        ("UNIT", "T-10/19", "Агрегат T-10/19", "piece"),
        ("UNIT", "T-12/19", "Агрегат T-12/19", "piece"),
        ("UNIT", "T-12/22", "Агрегат T-12/22", "piece"),
        ("UNIT", "T-16/22", "Агрегат T-16/22", "piece"),
        ("UNIT", "T-22/35", "Агрегат T-22/35", "piece"),
        # Дверь
        ("DOOR", "Есік", "Дверь (Есік)", "piece"),
        # Без агрегата
        ("WITHOUT_UNIT", "Без агрегата", "Холодильник без агрегата", "piece"),
    ]

    created = 0
    for category, model, name, unit in products_data:
        if not db.query(Product).filter(Product.model == model).first():
            db.add(Product(category=category, model=model, name=name, unit=unit))
            created += 1
    db.commit()
    total = db.query(Product).count()
    print(f"  Products: +{created} new, {total} total")


def seed():
    db = SessionLocal()
    try:
        seed_products(db)
    except Exception as e:
        db.rollback()
        print(f"\nSeed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=== Seeding MoozTau products ===")
    seed()
    print("=== Done ===")
