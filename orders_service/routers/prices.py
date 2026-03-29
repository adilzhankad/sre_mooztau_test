from typing import List
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.product import Product, Price
from schemas.product import PriceCreate, PriceOut
from services.permissions import get_visible_price_fields
from middleware.auth import get_current_user, require_super_admin

router = APIRouter(prefix="/api/prices", tags=["Prices"])


@router.get("/", response_model=List[dict])
def list_current_prices(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    today = date.today()

    prices = db.query(Price).filter(
        Price.effective_from <= today,
    ).filter(
        (Price.effective_to == None) | (Price.effective_to >= today)
    ).order_by(Price.product_id, Price.effective_from.desc()).all()

    # Deduplicate: keep the latest price per product
    seen_products = set()
    unique_prices = []
    for p in prices:
        if p.product_id not in seen_products:
            seen_products.add(p.product_id)
            unique_prices.append(p)

    visible_fields = get_visible_price_fields(user)
    result = []
    for p in unique_prices:
        price_data = {
            "id": p.id,
            "product_id": p.product_id,
            "effective_from": p.effective_from,
            "effective_to": p.effective_to,
            "created_at": p.created_at,
        }
        for field in ["dealer_price", "recommended_price", "price_per_meter"]:
            if field in visible_fields:
                price_data[field] = getattr(p, field)
            else:
                price_data[field] = None
        result.append(price_data)

    return result


@router.post("/", response_model=PriceOut, status_code=status.HTTP_201_CREATED)
def create_price(
    payload: PriceCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    # Close the current active price for this product (set effective_to)
    today = date.today()
    active_price = db.query(Price).filter(
        Price.product_id == payload.product_id,
        Price.effective_from <= today,
    ).filter(
        (Price.effective_to == None) | (Price.effective_to >= today)
    ).order_by(Price.effective_from.desc()).first()

    if active_price and payload.effective_from <= today:
        active_price.effective_to = payload.effective_from

    price = Price(
        product_id=payload.product_id,
        dealer_price=payload.dealer_price,
        recommended_price=payload.recommended_price,
        price_per_meter=payload.price_per_meter,
        effective_from=payload.effective_from,
        effective_to=payload.effective_to,
        created_by_id=user.id,
    )
    db.add(price)
    db.commit()
    db.refresh(price)
    return price
