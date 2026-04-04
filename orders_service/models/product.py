import enum
from datetime import datetime, date

from sqlalchemy import BigInteger, String, Boolean, DateTime, Date, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class ProductCategory(str, enum.Enum):
    BUILT_IN = "BUILT_IN"
    OUTDOOR = "OUTDOOR"
    FREEZER = "FREEZER"
    UNIT = "UNIT"
    DOOR = "DOOR"
    WITHOUT_UNIT = "WITHOUT_UNIT"


class UnitType(str, enum.Enum):
    PIECE = "piece"
    METER = "meter"


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    category: Mapped[str] = mapped_column(String(20))
    model: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(200), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    unit: Mapped[str] = mapped_column(String(10), default="piece")
    default_length = mapped_column(Numeric(10, 2), nullable=True)
    default_height = mapped_column(Numeric(10, 2), nullable=True)
    default_width = mapped_column(Numeric(10, 2), nullable=True)
    available_colors: Mapped[str] = mapped_column(Text, default="")  # comma-separated
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    prices = relationship("Price", back_populates="product")


class Price(Base):
    __tablename__ = "prices"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    product_id = mapped_column(BigInteger, ForeignKey("products.id"), nullable=False)
    dealer_price = mapped_column(Numeric(15, 2), nullable=True)
    recommended_price = mapped_column(Numeric(15, 2), nullable=True)
    price_per_meter = mapped_column(Numeric(15, 2), nullable=True)
    effective_from = mapped_column(Date, nullable=False)
    effective_to = mapped_column(Date, nullable=True)
    created_by_id = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="prices")
    created_by = relationship("User")
