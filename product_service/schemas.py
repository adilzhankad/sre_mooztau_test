from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel

from models import ProductCategory


class ProductBase(BaseModel):
    category: ProductCategory
    model: str
    name: str = ""
    description: str = ""
    unit: str = "piece"
    default_length: Optional[Decimal] = None
    default_height: Optional[Decimal] = None
    default_width: Optional[Decimal] = None
    available_colors: str = ""
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit: Optional[str] = None
    default_length: Optional[Decimal] = None
    default_height: Optional[Decimal] = None
    default_width: Optional[Decimal] = None
    available_colors: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
