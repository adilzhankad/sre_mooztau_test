import enum
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from database import Base


class TransactionType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"


class BankAccount(Base):
    __tablename__ = "bank_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    bank_name = Column(String(100), nullable=False)
    balance = Column(Numeric(15, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account")


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    parent_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)
    level = Column(Integer, default=1)

    parent = relationship("ExpenseCategory", remote_side=[id], back_populates="children")
    children = relationship("ExpenseCategory", back_populates="parent")
    transactions = relationship("Transaction", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    description = Column(Text, nullable=True)
    initiator = Column(String(200), nullable=True)
    account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)
    order_ref = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("BankAccount", back_populates="transactions")
    category = relationship("ExpenseCategory", back_populates="transactions")
