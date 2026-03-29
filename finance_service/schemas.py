from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Category
# ---------------------------------------------------------------------------

class CategoryCreate(BaseModel):
    name: str
    parent_id: Optional[int] = None


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    level: int
    parent_id: Optional[int] = None
    full_path: str


# ---------------------------------------------------------------------------
# BankAccount
# ---------------------------------------------------------------------------

class BankAccountCreate(BaseModel):
    name: str
    balance: Optional[Decimal] = Decimal("0")


class BankAccountUpdate(BaseModel):
    name: Optional[str] = None
    balance: Optional[Decimal] = None


class BankAccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    balance: Decimal


# ---------------------------------------------------------------------------
# Transaction
# ---------------------------------------------------------------------------

class TransactionCreate(BaseModel):
    date: date
    transaction_type: str  # "income" / "expense"
    amount: Decimal
    currency: Optional[str] = "KZT"
    account_id: Optional[int] = None
    comment: Optional[str] = ""
    category_l1_id: Optional[int] = None
    category_l2_id: Optional[int] = None
    category_l3_id: Optional[int] = None
    category_l4_id: Optional[int] = None
    initiator_id: Optional[int] = None
    order_id: Optional[int] = None
    order_number: Optional[str] = ""
    counterparty_name: Optional[str] = ""


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: date
    transaction_type: str
    amount: Decimal
    currency: str
    account_name: Optional[str] = None
    comment: str
    category_l1_name: Optional[str] = None
    category_l2_name: Optional[str] = None
    category_l3_name: Optional[str] = None
    category_l4_name: Optional[str] = None
    initiator_name: Optional[str] = None
    order_id: Optional[int] = None
    order_number: str
    counterparty_name: str
    created_at: datetime


class TransactionListOut(BaseModel):
    count: int
    results: List[TransactionOut]


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

class ReportSummary(BaseModel):
    income: Decimal
    expense: Decimal
    balance: Decimal


class CategoryBreakdown(BaseModel):
    category_name: Optional[str] = None
    total: Decimal


class InitiatorBreakdown(BaseModel):
    initiator_name: Optional[str] = None
    total: Decimal


# ---------------------------------------------------------------------------
# Auto-income (called by orders_service)
# ---------------------------------------------------------------------------

class AutoIncomeRequest(BaseModel):
    order_id: int
    order_number: str
    amount: Decimal
    payment_date: date
    payment_method: Optional[str] = ""
    client_name: Optional[str] = ""
    organization_name: Optional[str] = ""
