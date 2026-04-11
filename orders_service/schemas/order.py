from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, field_validator


class OrderItemCreate(BaseModel):
    product_id: Optional[int] = None
    model: str
    category: str = ""
    quantity: Decimal = Decimal("1")
    unit: str = "piece"
    length: Optional[Decimal] = None
    height: Optional[Decimal] = None
    width: Optional[Decimal] = None
    color: str = ""
    recommended_price: Decimal = Decimal("0")
    price_per_unit: Decimal = Decimal("0")
    discount_percent: Decimal = Decimal("0")
    discount_amount: Decimal = Decimal("0")
    total_price: Decimal = Decimal("0")


class OrderItemOut(BaseModel):
    id: int
    product_id: Optional[int]
    model: str
    category: str
    quantity: Decimal
    unit: str
    length: Optional[Decimal]
    height: Optional[Decimal]
    width: Optional[Decimal]
    color: str
    recommended_price: Decimal
    price_per_unit: Decimal
    discount_percent: Decimal
    discount_amount: Decimal
    total_price: Decimal

    class Config:
        from_attributes = True


class OrderItemUpdate(BaseModel):
    quantity: Optional[Decimal] = None
    color: Optional[str] = None
    recommended_price: Optional[Decimal] = None
    price_per_unit: Optional[Decimal] = None
    discount_percent: Optional[Decimal] = None
    discount_amount: Optional[Decimal] = None
    length: Optional[Decimal] = None
    height: Optional[Decimal] = None
    width: Optional[Decimal] = None


class OrderCreate(BaseModel):
    contract_number: str = ""
    client_name: str
    client_phone: str
    client_iin: str = ""
    client_region: str
    client_address: str
    delivery_address: str = ""
    payment_type: str = ""
    discount_percent: Decimal = Decimal("0")
    deadline: Optional[date] = None
    has_contract: bool = False
    items: List[OrderItemCreate]

    @field_validator("items")
    @classmethod
    def at_least_one_item(cls, v):
        if not v:
            raise ValueError("Заказ должен содержать хотя бы одну позицию")
        return v


class OrderUpdate(BaseModel):
    contract_number: Optional[str] = None
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    client_iin: Optional[str] = None
    client_region: Optional[str] = None
    client_address: Optional[str] = None
    delivery_address: Optional[str] = None
    payment_type: Optional[str] = None
    discount_percent: Optional[Decimal] = None
    deadline: Optional[date] = None
    has_contract: Optional[bool] = None


class StatusChange(BaseModel):
    status: str
    note: str = ""


class PaymentCreate(BaseModel):
    amount: Decimal
    payment_date: date
    payment_method: str = ""
    notes: str = ""


class PaymentOut(BaseModel):
    id: int
    order_id: int
    amount: Decimal
    payment_date: date
    payment_method: str
    notes: str
    created_at: datetime

    class Config:
        from_attributes = True


class OrderHistoryOut(BaseModel):
    id: int
    action: str
    old_value: str
    new_value: str
    note: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class OrderOut(BaseModel):
    id: int
    order_number: str
    contract_number: str
    organization_id: int
    organization_name: Optional[str] = None
    manager_id: int
    manager_name: Optional[str] = None
    factory: str
    client_name: str
    client_phone: str
    client_iin: str
    client_region: str
    client_address: str
    delivery_address: str
    total_amount: Decimal
    discount_percent: Decimal
    discount_amount: Decimal
    final_amount: Decimal
    dealer_cost: Optional[Decimal]
    payment_type: str
    order_date: date
    deadline: Optional[date]
    accepted_date: Optional[date]
    warranty_end_date: Optional[date]
    status: str
    has_contract: bool
    items: List[OrderItemOut] = []
    payments: List[PaymentOut] = []
    payment_received: Decimal = Decimal("0")
    payment_remaining: Decimal = Decimal("0")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderListOut(BaseModel):
    count: int
    results: List[OrderOut]
