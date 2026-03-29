from typing import Optional
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel


class ProductCreate(BaseModel):
    category: str
    model: str
    name: str = ""
    description: str = ""
    unit: str = "piece"
    default_length: Optional[Decimal] = None
    default_height: Optional[Decimal] = None
    default_width: Optional[Decimal] = None
    available_colors: str = ""


class ProductUpdate(BaseModel):
    category: Optional[str] = None
    model: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    default_length: Optional[Decimal] = None
    default_height: Optional[Decimal] = None
    default_width: Optional[Decimal] = None
    available_colors: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    category: str
    model: str
    name: str
    description: str
    unit: str
    default_length: Optional[Decimal]
    default_height: Optional[Decimal]
    default_width: Optional[Decimal]
    available_colors: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PriceCreate(BaseModel):
    product_id: int
    dealer_price: Optional[Decimal] = None
    recommended_price: Optional[Decimal] = None
    price_per_meter: Optional[Decimal] = None
    effective_from: date
    effective_to: Optional[date] = None


class PriceOut(BaseModel):
    id: int
    product_id: int
    dealer_price: Optional[Decimal]
    recommended_price: Optional[Decimal]
    price_per_meter: Optional[Decimal]
    effective_from: date
    effective_to: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True
