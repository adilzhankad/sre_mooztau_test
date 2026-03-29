import enum
from datetime import datetime

from sqlalchemy import BigInteger, String, DateTime, Numeric, ForeignKey, Integer
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class InventoryStatus(str, enum.Enum):
    IN_STOCK = "in_stock"
    RESERVED = "reserved"
    SHIPPED = "shipped"


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    factory: Mapped[str] = mapped_column(String(50))
    product_id = mapped_column(BigInteger, ForeignKey("products.id"), nullable=False)
    model: Mapped[str] = mapped_column(String(50))
    color: Mapped[str] = mapped_column(String(50), default="")
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default=InventoryStatus.IN_STOCK)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product = relationship("Product")
