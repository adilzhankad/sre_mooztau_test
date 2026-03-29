from typing import Optional, List
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.product import Product, Price
from schemas.product import ProductCreate, ProductUpdate, ProductOut, PriceOut
from middleware.auth import get_current_user, require_super_admin

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("/", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)

    products = query.order_by(Product.id).all()
    return products


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    existing = db.query(Product).filter(Product.model == payload.model).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Продукт с такой моделью уже существует",
        )

    product = Product(
        category=payload.category,
        model=payload.model,
        name=payload.name,
        description=payload.description,
        unit=payload.unit,
        default_length=payload.default_length,
        default_height=payload.default_height,
        default_width=payload.default_width,
        available_colors=payload.available_colors,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=dict)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    product_data = ProductOut.model_validate(product).model_dump()

    today = date.today()
    current_price = db.query(Price).filter(
        Price.product_id == product_id,
        Price.effective_from <= today,
    ).filter(
        (Price.effective_to == None) | (Price.effective_to >= today)
    ).order_by(Price.effective_from.desc()).first()

    product_data["current_price"] = None
    if current_price:
        product_data["current_price"] = PriceOut.model_validate(current_price).model_dump()

    return product_data


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_super_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}/prices", response_model=List[PriceOut])
def get_price_history(
    product_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Продукт не найден")

    prices = db.query(Price).filter(
        Price.product_id == product_id
    ).order_by(Price.effective_from.desc()).all()
    return prices
