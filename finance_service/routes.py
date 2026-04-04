import io
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from openpyxl import Workbook
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from config import settings
from database import get_db
from models import (
    User, UserRole, Organization,
    Category, BankAccount, Transaction,
    compute_category_fields,
)
from schemas import (
    CategoryCreate, CategoryOut,
    BankAccountCreate, BankAccountUpdate, BankAccountOut,
    TransactionCreate, TransactionOut, TransactionListOut,
    ReportSummary, CategoryBreakdown, InitiatorBreakdown,
    AutoIncomeRequest,
)

router = APIRouter()

# ---------------------------------------------------------------------------
# Auth middleware
# ---------------------------------------------------------------------------

security = HTTPBearer(auto_error=False)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Не авторизован")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Невалидный токен")

    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    return user


def require_roles(*roles: str):
    """Dependency factory that checks user has one of the specified roles."""
    async def checker(user: User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        return user
    return checker


require_admin = require_roles(UserRole.SUPER_ADMIN, UserRole.DEALER_ADMIN)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _serialize_transaction(t: Transaction) -> dict:
    return {
        "id": t.id,
        "date": t.date,
        "transaction_type": t.transaction_type,
        "amount": t.amount,
        "currency": t.currency,
        "account_id": t.account_id,
        "account_name": t.account.name if t.account else None,
        "comment": t.comment or "",
        "category_l1_id": t.category_l1_id,
        "category_l1_name": t.category_l1.name if t.category_l1 else None,
        "category_l2_id": t.category_l2_id,
        "category_l2_name": t.category_l2.name if t.category_l2 else None,
        "category_l3_id": t.category_l3_id,
        "category_l3_name": t.category_l3.name if t.category_l3 else None,
        "category_l4_id": t.category_l4_id,
        "category_l4_name": t.category_l4.name if t.category_l4 else None,
        "initiator_id": t.initiator_id,
        "initiator_name": t.initiator.full_name if t.initiator else None,
        "order_id": t.order_id,
        "order_number": t.order_number or "",
        "counterparty_name": t.counterparty_name or "",
        "created_at": t.created_at,
    }


# ===========================================================================
# Categories
# ===========================================================================

@router.get("/api/finance/categories/", response_model=List[CategoryOut], tags=["Categories"])
def list_categories(
    level: Optional[int] = Query(None),
    parent_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Category)
    if level is not None:
        q = q.filter(Category.level == level)
    if parent_id is not None:
        q = q.filter(Category.parent_id == parent_id)
    return q.order_by(Category.full_path).all()


@router.post("/api/finance/categories/", response_model=CategoryOut, status_code=201, tags=["Categories"])
def create_category(
    data: CategoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    cat = Category(name=data.name, parent_id=data.parent_id)
    compute_category_fields(cat, db)

    if cat.level > 4:
        raise HTTPException(status_code=400, detail="Максимальная глубина категории — 4 уровня")

    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/api/finance/categories/{category_id}", status_code=204, tags=["Categories"])
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Категория не найдена")

    # Check for child categories
    children = db.query(Category).filter(Category.parent_id == category_id).first()
    if children:
        raise HTTPException(status_code=400, detail="Нельзя удалить категорию с дочерними записями")

    # Check for transactions referencing this category at any level
    has_txn = db.query(Transaction).filter(
        or_(
            Transaction.category_l1_id == category_id,
            Transaction.category_l2_id == category_id,
            Transaction.category_l3_id == category_id,
            Transaction.category_l4_id == category_id,
        )
    ).first()
    if has_txn:
        raise HTTPException(status_code=400, detail="Нельзя удалить категорию, привязанную к транзакциям")

    db.delete(cat)
    db.commit()


# ===========================================================================
# Bank Accounts
# ===========================================================================

@router.get("/api/finance/accounts/", response_model=List[BankAccountOut], tags=["Bank Accounts"])
def list_accounts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(BankAccount).order_by(BankAccount.name).all()


@router.post("/api/finance/accounts/", response_model=BankAccountOut, status_code=201, tags=["Bank Accounts"])
def create_account(
    data: BankAccountCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    existing = db.query(BankAccount).filter(BankAccount.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Счёт с таким названием уже существует")

    acc = BankAccount(name=data.name, balance=data.balance or Decimal("0"))
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return acc


@router.put("/api/finance/accounts/{account_id}", response_model=BankAccountOut, tags=["Bank Accounts"])
def update_account(
    account_id: int,
    data: BankAccountUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    acc = db.query(BankAccount).filter(BankAccount.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Счёт не найден")

    if data.name is not None:
        dup = db.query(BankAccount).filter(BankAccount.name == data.name, BankAccount.id != account_id).first()
        if dup:
            raise HTTPException(status_code=400, detail="Счёт с таким названием уже существует")
        acc.name = data.name

    if data.balance is not None:
        acc.balance = data.balance

    db.commit()
    db.refresh(acc)
    return acc


# ===========================================================================
# Transactions
# ===========================================================================

def _apply_transaction_filters(q, date_from, date_to, txn_type, account_id, category_l1_id, initiator_id, search):
    if date_from:
        q = q.filter(Transaction.date >= date_from)
    if date_to:
        q = q.filter(Transaction.date <= date_to)
    if txn_type:
        q = q.filter(Transaction.transaction_type == txn_type)
    if account_id:
        q = q.filter(Transaction.account_id == account_id)
    if category_l1_id:
        q = q.filter(Transaction.category_l1_id == category_l1_id)
    if initiator_id:
        q = q.filter(Transaction.initiator_id == initiator_id)
    if search:
        like_pattern = f"%{search}%"
        q = q.filter(
            or_(
                Transaction.comment.ilike(like_pattern),
                Transaction.order_number.ilike(like_pattern),
                Transaction.counterparty_name.ilike(like_pattern),
            )
        )
    return q


@router.get("/api/finance/transactions/", response_model=TransactionListOut, tags=["Transactions"])
def list_transactions(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    type: Optional[str] = Query(None, alias="type"),
    account_id: Optional[int] = Query(None),
    category_l1_id: Optional[int] = Query(None),
    initiator_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Transaction).options(
        joinedload(Transaction.account),
        joinedload(Transaction.category_l1),
        joinedload(Transaction.category_l2),
        joinedload(Transaction.category_l3),
        joinedload(Transaction.category_l4),
        joinedload(Transaction.initiator),
    )

    q = _apply_transaction_filters(q, date_from, date_to, type, account_id, category_l1_id, initiator_id, search)

    total = q.count()
    offset = (page - 1) * page_size
    transactions = q.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(offset).limit(page_size).all()

    return {
        "count": total,
        "results": [_serialize_transaction(t) for t in transactions],
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
    }


@router.post("/api/finance/transactions/", response_model=TransactionOut, status_code=201, tags=["Transactions"])
def create_transaction(
    data: TransactionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if data.transaction_type not in ("income", "expense"):
        raise HTTPException(status_code=400, detail="transaction_type должен быть 'income' или 'expense'")

    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="Сумма должна быть больше нуля")

    txn = Transaction(
        date=data.date,
        transaction_type=data.transaction_type,
        amount=data.amount,
        currency=data.currency or "KZT",
        account_id=data.account_id,
        comment=data.comment or "",
        category_l1_id=data.category_l1_id,
        category_l2_id=data.category_l2_id,
        category_l3_id=data.category_l3_id,
        category_l4_id=data.category_l4_id,
        initiator_id=data.initiator_id,
        order_id=data.order_id,
        order_number=data.order_number or "",
        counterparty_name=data.counterparty_name or "",
        created_at=datetime.utcnow(),
    )
    db.add(txn)

    # Update bank account balance
    if data.account_id:
        acc = db.query(BankAccount).filter(BankAccount.id == data.account_id).first()
        if acc:
            if data.transaction_type == "income":
                acc.balance = (acc.balance or Decimal("0")) + data.amount
            else:
                acc.balance = (acc.balance or Decimal("0")) - data.amount

    db.commit()
    db.refresh(txn)

    # Eagerly load relationships for serialization
    _ = txn.account
    _ = txn.category_l1
    _ = txn.category_l2
    _ = txn.category_l3
    _ = txn.category_l4
    _ = txn.initiator

    return _serialize_transaction(txn)


@router.get("/api/finance/transactions/{transaction_id}", response_model=TransactionOut, tags=["Transactions"])
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    txn = db.query(Transaction).options(
        joinedload(Transaction.account),
        joinedload(Transaction.category_l1),
        joinedload(Transaction.category_l2),
        joinedload(Transaction.category_l3),
        joinedload(Transaction.category_l4),
        joinedload(Transaction.initiator),
    ).filter(Transaction.id == transaction_id).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")

    return _serialize_transaction(txn)


@router.delete("/api/finance/transactions/{transaction_id}", status_code=204, tags=["Transactions"])
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")

    # Reverse balance change on bank account
    if txn.account_id:
        acc = db.query(BankAccount).filter(BankAccount.id == txn.account_id).first()
        if acc:
            if txn.transaction_type == "income":
                acc.balance = (acc.balance or Decimal("0")) - txn.amount
            else:
                acc.balance = (acc.balance or Decimal("0")) + txn.amount

    db.delete(txn)
    db.commit()


# ===========================================================================
# Auto-income (called by orders_service)
# ===========================================================================

@router.post("/api/finance/auto-income", response_model=TransactionOut, tags=["Auto Income"])
def auto_income(
    data: AutoIncomeRequest,
    db: Session = Depends(get_db),
):
    """
    Called by orders_service when a payment is added.
    Creates an income transaction automatically.
    No JWT required — internal service-to-service call.
    """
    # Try to find bank account by payment method name
    account = None
    if data.payment_method:
        account = db.query(BankAccount).filter(BankAccount.name.ilike(data.payment_method)).first()

    # Try to find "Продажа" category as L1
    sale_category = db.query(Category).filter(Category.name == "Продажа", Category.level == 1).first()

    counterparty = data.client_name or ""
    if data.organization_name:
        counterparty = f"{data.client_name} ({data.organization_name})" if data.client_name else data.organization_name

    txn = Transaction(
        date=data.payment_date,
        transaction_type="income",
        amount=data.amount,
        currency="KZT",
        account_id=account.id if account else None,
        comment=f"Оплата по заказу {data.order_number}",
        category_l1_id=sale_category.id if sale_category else None,
        order_id=data.order_id,
        order_number=data.order_number or "",
        counterparty_name=counterparty,
        created_at=datetime.utcnow(),
    )
    db.add(txn)

    # Update bank account balance
    if account:
        account.balance = (account.balance or Decimal("0")) + data.amount

    db.commit()
    db.refresh(txn)

    _ = txn.account
    _ = txn.category_l1
    _ = txn.category_l2
    _ = txn.category_l3
    _ = txn.category_l4
    _ = txn.initiator

    return _serialize_transaction(txn)


# ===========================================================================
# Reports
# ===========================================================================

@router.get("/api/finance/reports/summary", response_model=ReportSummary, tags=["Reports"])
def report_summary(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    base = db.query(Transaction)
    if date_from:
        base = base.filter(Transaction.date >= date_from)
    if date_to:
        base = base.filter(Transaction.date <= date_to)

    income_val = Decimal(str(
        base.filter(Transaction.transaction_type == "income").with_entities(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).scalar()
    ))

    expense_val = Decimal(str(
        base.filter(Transaction.transaction_type == "expense").with_entities(
            func.coalesce(func.sum(Transaction.amount), 0)
        ).scalar()
    ))

    return {
        "income": income_val,
        "expense": expense_val,
        "balance": income_val - expense_val,
    }


@router.get("/api/finance/reports/by-category", response_model=List[CategoryBreakdown], tags=["Reports"])
def report_by_category(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    transaction_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(
        Category.id.label("category_id"),
        Category.name.label("category_name"),
        func.coalesce(func.sum(Transaction.amount), 0).label("total"),
    ).outerjoin(
        Transaction, Transaction.category_l1_id == Category.id
    ).filter(
        Category.level == 1
    )

    if date_from:
        q = q.filter(Transaction.date >= date_from)
    if date_to:
        q = q.filter(Transaction.date <= date_to)
    if transaction_type:
        q = q.filter(Transaction.transaction_type == transaction_type)

    rows = q.group_by(Category.id, Category.name).order_by(func.sum(Transaction.amount).desc().nullslast()).all()

    return [{"category_id": r.category_id, "category_name": r.category_name, "total": Decimal(str(r.total))} for r in rows]


@router.get("/api/finance/reports/by-initiator", response_model=List[InitiatorBreakdown], tags=["Reports"])
def report_by_initiator(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    transaction_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(
        User.id.label("initiator_id"),
        User.full_name.label("initiator_name"),
        func.coalesce(func.sum(Transaction.amount), 0).label("total"),
    ).outerjoin(
        Transaction, Transaction.initiator_id == User.id
    )

    if date_from:
        q = q.filter(Transaction.date >= date_from)
    if date_to:
        q = q.filter(Transaction.date <= date_to)
    if transaction_type:
        q = q.filter(Transaction.transaction_type == transaction_type)

    # Only show users who have at least one transaction
    q = q.having(func.sum(Transaction.amount) > 0)

    rows = q.group_by(User.id, User.full_name).order_by(func.sum(Transaction.amount).desc()).all()

    return [{"initiator_id": r.initiator_id, "initiator_name": r.initiator_name, "total": Decimal(str(r.total))} for r in rows]


@router.get("/api/finance/reports/export/excel", tags=["Reports"])
def export_excel(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    type: Optional[str] = Query(None, alias="type"),
    account_id: Optional[int] = Query(None),
    category_l1_id: Optional[int] = Query(None),
    initiator_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Transaction).options(
        joinedload(Transaction.account),
        joinedload(Transaction.category_l1),
        joinedload(Transaction.category_l2),
        joinedload(Transaction.category_l3),
        joinedload(Transaction.category_l4),
        joinedload(Transaction.initiator),
    )

    q = _apply_transaction_filters(q, date_from, date_to, type, account_id, category_l1_id, initiator_id, search)
    transactions = q.order_by(Transaction.date.desc(), Transaction.id.desc()).all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Транзакции"

    headers = [
        "ID", "Дата", "Тип", "Сумма", "Валюта", "Счёт",
        "Категория L1", "Категория L2", "Категория L3", "Категория L4",
        "Инициатор", "Заказ", "Контрагент", "Комментарий", "Создано",
    ]
    ws.append(headers)

    for t in transactions:
        ws.append([
            t.id,
            t.date.isoformat() if t.date else "",
            "Доход" if t.transaction_type == "income" else "Расход",
            float(t.amount) if t.amount else 0,
            t.currency,
            t.account.name if t.account else "",
            t.category_l1.name if t.category_l1 else "",
            t.category_l2.name if t.category_l2 else "",
            t.category_l3.name if t.category_l3 else "",
            t.category_l4.name if t.category_l4 else "",
            t.initiator.full_name if t.initiator else "",
            t.order_number or "",
            t.counterparty_name or "",
            t.comment or "",
            t.created_at.isoformat() if t.created_at else "",
        ])

    # Auto-size columns
    for col in ws.columns:
        max_length = 0
        col_letter = col[0].column_letter
        for cell in col:
            val = str(cell.value) if cell.value is not None else ""
            if len(val) > max_length:
                max_length = len(val)
        ws.column_dimensions[col_letter].width = min(max_length + 2, 40)

    stream = io.BytesIO()
    wb.save(stream)
    stream.seek(0)

    filename = "transactions"
    if date_from:
        filename += f"_from_{date_from.isoformat()}"
    if date_to:
        filename += f"_to_{date_to.isoformat()}"
    filename += ".xlsx"

    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
