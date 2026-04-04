from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class InventoryCreate(BaseModel):
    product_id: int
    model: str
    color: str = ""
    quantity: int = 0


class InventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    status: Optional[str] = None


class InventoryOut(BaseModel):
    id: int
    factory: str
    product_id: int
    model: str
    color: str
    quantity: int
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True
