"""Set recommended prices for all products. Run: python -m scripts.set_prices"""
from datetime import date
from decimal import Decimal
from database import SessionLocal
from models import Product, Price

PRICES = {
    "A-1000": 390000,
    "A-1250": 490000,
    "A-1500": 490000,
    "A-2000": 690000,
    "AT-2000": 800000,
    "J-1000": 340000,
    "J-1250": 390000,
    "J-1500": 490000,
    "J-2000": 650000,
    "E-1250": 690000,
    "E-2000": 890000,
    "JS-1250": 470000,
    "JS-2500": 840000,
    "JS-3750": 1200000,
    "ES-1250": 950000,
    "ES-2000": 1250000,
    "ES-2500": 1650000,
    "ES-3750": 1900000,
    "ES-Бок": 85000,
    "S-2400": 750000,
    "S-3600": 870000,
    "S-4000": 1280000,
    "S-4800": 1300000,
    "S-5500": 1340000,
    "S-6700": 1500000,
    "S-7800": 1570000,
    "S-9600": 1650000,
}

def main():
    db = SessionLocal()
    today = date.today()

    for model, rec_price in PRICES.items():
        product = db.query(Product).filter(Product.model == model).first()
        if not product:
            print(f"  SKIP {model} — not found")
            continue

        existing = db.query(Price).filter(
            Price.product_id == product.id,
            Price.effective_to.is_(None),
        ).first()

        if existing:
            existing.recommended_price = Decimal(str(rec_price))
            print(f"  UPD {model}: {rec_price:,} ₸")
        else:
            db.add(Price(
                product_id=product.id,
                recommended_price=Decimal(str(rec_price)),
                effective_from=today,
            ))
            print(f"  NEW {model}: {rec_price:,} ₸")

    db.commit()
    print(f"\nTotal prices set: {db.query(Price).count()}")
    db.close()

if __name__ == "__main__":
    print("=== Setting recommended prices ===")
    main()
