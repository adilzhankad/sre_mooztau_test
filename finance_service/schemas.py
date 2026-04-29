from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel

from models import TransactionType


class BankAccountBase(BaseModel):
    name: str
    bank_name: str


class BankAccountCreate(BankAccountBase):
    pass


class BankAccountOut(BankAccountBase):
    id: int
    balance: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int
    level: int
    children: List["CategoryOut"] = []

    class Config:
        from_attributes = True


CategoryOut.model_rebuild()


class TransactionBase(BaseModel):
    type: TransactionType
    amount: Decimal
    date: date
    description: Optional[str] = None
    initiator: Optional[str] = None
    account_id: int
    category_id: Optional[int] = None
    order_ref: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    id: int
    created_at: datetime
    account: BankAccountOut

    class Config:
        from_attributes = True


class ReportSummary(BaseModel):
    total_income: Decimal
    total_expense: Decimal
    net: Decimal
    transaction_count: int


class CategoryReport(BaseModel):
    category_id: Optional[int]
    category_name: Optional[str]
    total: Decimal
    count: int
