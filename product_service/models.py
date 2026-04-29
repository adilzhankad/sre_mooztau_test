import enum
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, Column, DateTime, Numeric, String, Text

from database import Base


class ProductCategory(str, enum.Enum):
    BUILT_IN = "BUILT_IN"
    OUTDOOR = "OUTDOOR"
    FREEZER = "FREEZER"
    UNIT = "UNIT"
    DOOR = "DOOR"
    WITHOUT_UNIT = "WITHOUT_UNIT"


class Product(Base):
    __tablename__ = "products"
    # Shared table with orders_service — read/write, no migration here

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    category = Column(String(20))
    model = Column(String(50), unique=True)
    name = Column(String(200), default="")
    description = Column(Text, default="")
    unit = Column(String(10), default="piece")
    default_length = Column(Numeric(10, 2), nullable=True)
    default_height = Column(Numeric(10, 2), nullable=True)
    default_width = Column(Numeric(10, 2), nullable=True)
    available_colors = Column(Text, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
