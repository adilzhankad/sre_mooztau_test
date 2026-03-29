"""
Seed initial data: products only.
Organizations and users are seeded by auth_service.
Run: cd orders_service && python -m scripts.seed
"""
from database import SessionLocal
from models import Product


def seed():
    db = SessionLocal()

    # Products — ALL models from the spec
    products_data = [
        # (category, model, name, unit)
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

    # Summary
    print(f"\nTotal: {db.query(Product).count()} products")
    db.close()


if __name__ == "__main__":
    print("=== Seeding MoozTau data ===")
    seed()
    print("=== Done ===")
