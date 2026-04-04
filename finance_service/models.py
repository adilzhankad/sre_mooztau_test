import enum
from datetime import datetime, date

from sqlalchemy import (
    BigInteger, String, Boolean, DateTime, Numeric, Text,
    SmallInteger, Date, ForeignKey,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    DEALER_ADMIN = "DEALER_ADMIN"
    DEALER_MANAGER = "DEALER_MANAGER"
    FACTORY_ADMIN = "FACTORY_ADMIN"
    FACTORY_WORKER = "FACTORY_WORKER"


class OrgType(str, enum.Enum):
    HQ = "HQ"
    BRANCH = "BRANCH"
    DEALER = "DEALER"


# ---------------------------------------------------------------------------
# Reference models (read-only, owned by auth_service)
# ---------------------------------------------------------------------------

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), unique=True)
    org_type: Mapped[str] = mapped_column(String(20), default=OrgType.DEALER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    contact_phone: Mapped[str] = mapped_column(String(50), default="")
    contact_email: Mapped[str] = mapped_column(String(200), default="")
    address: Mapped[str] = mapped_column(Text, default="")
    region: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    organization_id = mapped_column(BigInteger, ForeignKey("organizations.id"), nullable=True)
    role: Mapped[str] = mapped_column(String(20))
    full_name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[str] = mapped_column(String(50), unique=True)
    email: Mapped[str] = mapped_column(String(200), default="")
    password_hash: Mapped[str] = mapped_column(String(200))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="users")


# ---------------------------------------------------------------------------
# Finance own tables
# ---------------------------------------------------------------------------

class Category(Base):
    __tablename__ = "fin_categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    parent_id = mapped_column(BigInteger, ForeignKey("fin_categories.id"), nullable=True)
    level: Mapped[int] = mapped_column(SmallInteger, default=1)
    full_path: Mapped[str] = mapped_column(String(500), default="")

    parent = relationship("Category", back_populates="children", remote_side=[id], foreign_keys=[parent_id])
    children = relationship("Category", back_populates="parent", foreign_keys=[parent_id])


def compute_category_fields(category: "Category", session) -> None:
    """Auto-compute level and full_path based on parent chain."""
    if category.parent_id is None:
        category.level = 1
        category.full_path = category.name
    else:
        parent = session.get(Category, category.parent_id)
        if parent is not None:
            category.level = parent.level + 1
            category.full_path = f"{parent.full_path} > {category.name}"
        else:
            category.level = 1
            category.full_path = category.name


class BankAccount(Base):
    __tablename__ = "fin_bank_accounts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    balance = mapped_column(Numeric(15, 2), default=0)


class Transaction(Base):
    __tablename__ = "fin_transactions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    transaction_type: Mapped[str] = mapped_column(String(10), nullable=False)  # "income" / "expense"
    amount = mapped_column(Numeric(15, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="KZT")
    account_id = mapped_column(BigInteger, ForeignKey("fin_bank_accounts.id"), nullable=True)
    comment: Mapped[str] = mapped_column(Text, default="")
    category_l1_id = mapped_column(BigInteger, ForeignKey("fin_categories.id"), nullable=True)
    category_l2_id = mapped_column(BigInteger, ForeignKey("fin_categories.id"), nullable=True)
    category_l3_id = mapped_column(BigInteger, ForeignKey("fin_categories.id"), nullable=True)
    category_l4_id = mapped_column(BigInteger, ForeignKey("fin_categories.id"), nullable=True)
    initiator_id = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    # Cross-service reference (NOT a foreign key)
    order_id = mapped_column(BigInteger, nullable=True)
    order_number: Mapped[str] = mapped_column(String(20), default="")
    counterparty_name: Mapped[str] = mapped_column(String(200), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    account = relationship("BankAccount", foreign_keys=[account_id])
    category_l1 = relationship("Category", foreign_keys=[category_l1_id])
    category_l2 = relationship("Category", foreign_keys=[category_l2_id])
    category_l3 = relationship("Category", foreign_keys=[category_l3_id])
    category_l4 = relationship("Category", foreign_keys=[category_l4_id])
    initiator = relationship("User", foreign_keys=[initiator_id])
