from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import BankAccount, ExpenseCategory, Transaction, TransactionType
from schemas import (
    BankAccountCreate,
    BankAccountOut,
    CategoryCreate,
    CategoryOut,
    CategoryReport,
    ReportSummary,
    TransactionCreate,
    TransactionOut,
)

router = APIRouter()


# ── Bank Accounts ────────────────────────────────────────────────────────────

@router.get("/accounts", response_model=List[BankAccountOut], tags=["accounts"])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(BankAccount).all()


@router.post("/accounts", response_model=BankAccountOut, status_code=201, tags=["accounts"])
def create_account(data: BankAccountCreate, db: Session = Depends(get_db)):
    account = BankAccount(**data.model_dump())
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/accounts/{account_id}", response_model=BankAccountOut, tags=["accounts"])
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.get(BankAccount, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


# ── Categories ────────────────────────────────────────────────────────────────

@router.get("/categories", response_model=List[CategoryOut], tags=["categories"])
def list_categories(db: Session = Depends(get_db)):
    return db.query(ExpenseCategory).filter(ExpenseCategory.parent_id.is_(None)).all()


@router.post("/categories", response_model=CategoryOut, status_code=201, tags=["categories"])
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    level = 1
    if data.parent_id:
        parent = db.get(ExpenseCategory, data.parent_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent category not found")
        level = parent.level + 1
        if level > 4:
            raise HTTPException(status_code=400, detail="Maximum category depth is 4")
    category = ExpenseCategory(name=data.name, parent_id=data.parent_id, level=level)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# ── Transactions ──────────────────────────────────────────────────────────────

@router.get("/transactions", response_model=List[TransactionOut], tags=["transactions"])
def list_transactions(
    type: Optional[TransactionType] = None,
    account_id: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    q = db.query(Transaction)
    if type:
        q = q.filter(Transaction.type == type)
    if account_id:
        q = q.filter(Transaction.account_id == account_id)
    return q.order_by(Transaction.date.desc()).offset(offset).limit(limit).all()


@router.post("/transactions", response_model=TransactionOut, status_code=201, tags=["transactions"])
def create_transaction(data: TransactionCreate, db: Session = Depends(get_db)):
    account = db.get(BankAccount, data.account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    tx = Transaction(**data.model_dump())
    db.add(tx)

    if data.type == TransactionType.INCOME:
        account.balance += data.amount
    else:
        account.balance -= data.amount

    db.commit()
    db.refresh(tx)
    return tx


@router.get("/transactions/{tx_id}", response_model=TransactionOut, tags=["transactions"])
def get_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.get(Transaction, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports/summary", response_model=ReportSummary, tags=["reports"])
def report_summary(db: Session = Depends(get_db)):
    rows = (
        db.query(Transaction.type, func.sum(Transaction.amount), func.count(Transaction.id))
        .group_by(Transaction.type)
        .all()
    )
    income = Decimal(0)
    expense = Decimal(0)
    count = 0
    for t, total, cnt in rows:
        count += cnt
        if t == TransactionType.INCOME:
            income = total or Decimal(0)
        else:
            expense = total or Decimal(0)
    return ReportSummary(
        total_income=income,
        total_expense=expense,
        net=income - expense,
        transaction_count=count,
    )


@router.get("/reports/by-category", response_model=List[CategoryReport], tags=["reports"])
def report_by_category(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Transaction.category_id,
            ExpenseCategory.name,
            func.sum(Transaction.amount),
            func.count(Transaction.id),
        )
        .outerjoin(ExpenseCategory, Transaction.category_id == ExpenseCategory.id)
        .filter(Transaction.type == TransactionType.EXPENSE)
        .group_by(Transaction.category_id, ExpenseCategory.name)
        .all()
    )
    return [
        CategoryReport(
            category_id=cat_id,
            category_name=cat_name,
            total=total or Decimal(0),
            count=cnt,
        )
        for cat_id, cat_name, total, cnt in rows
    ]
