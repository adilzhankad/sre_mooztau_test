import enum
from datetime import datetime, date
from decimal import Decimal

from sqlalchemy import BigInteger, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class OrderStatus(str, enum.Enum):
    NEW = "new"
    CONFIRMED = "confirmed"
    IN_PRODUCTION = "in_production"
    READY = "ready"
    SHIPPING = "shipping"
    DELIVERED = "delivered"
    ACCEPTED = "accepted"
    COMPLETED = "completed"
    REJECTED = "rejected"
    RETURNED = "returned"


class Order(Base):
    __tablename__ = "platform_orders"  # Different from Django's orders_order

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_number: Mapped[str] = mapped_column(String(20), unique=True)
    contract_number: Mapped[str] = mapped_column(String(100), default="")
    organization_id = mapped_column(BigInteger, ForeignKey("organizations.id"), nullable=False)
    manager_id = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    factory: Mapped[str] = mapped_column(String(50), default="Кулан")

    # Client info (ALL REQUIRED)
    client_name: Mapped[str] = mapped_column(String(200))
    client_phone: Mapped[str] = mapped_column(String(50))
    client_region: Mapped[str] = mapped_column(String(200))
    client_address: Mapped[str] = mapped_column(Text)

    # Financial
    total_amount = mapped_column(Numeric(15, 2), default=0)
    dealer_cost = mapped_column(Numeric(15, 2), nullable=True)

    # Dates
    order_date = mapped_column(Date, nullable=False)
    deadline = mapped_column(Date, nullable=True)
    accepted_date = mapped_column(Date, nullable=True)
    warranty_end_date = mapped_column(Date, nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(20), default=OrderStatus.NEW)
    has_contract: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="orders")
    manager = relationship("User", back_populates="managed_orders", foreign_keys=[manager_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    history = relationship("OrderHistory", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "platform_order_items"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_id = mapped_column(BigInteger, ForeignKey("platform_orders.id"), nullable=False)
    product_id = mapped_column(BigInteger, ForeignKey("products.id"), nullable=True)
    model: Mapped[str] = mapped_column(String(50))
    category: Mapped[str] = mapped_column(String(50), default="")
    quantity = mapped_column(Numeric(10, 2), default=1)
    unit: Mapped[str] = mapped_column(String(10), default="piece")
    length = mapped_column(Numeric(10, 2), nullable=True)
    height = mapped_column(Numeric(10, 2), nullable=True)
    width = mapped_column(Numeric(10, 2), nullable=True)
    color: Mapped[str] = mapped_column(String(50), default="")
    price_per_unit = mapped_column(Numeric(15, 2), default=0)
    total_price = mapped_column(Numeric(15, 2), default=0)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class OrderHistory(Base):
    __tablename__ = "platform_order_history"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_id = mapped_column(BigInteger, ForeignKey("platform_orders.id"), nullable=False)
    user_id = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(50))  # created, status_changed, updated, payment_added
    old_value: Mapped[str] = mapped_column(Text, default="")
    new_value: Mapped[str] = mapped_column(Text, default="")
    note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="history")
    user = relationship("User")
