import enum
from datetime import datetime

from sqlalchemy import BigInteger, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    DEALER_ADMIN = "DEALER_ADMIN"
    DEALER_MANAGER = "DEALER_MANAGER"
    FACTORY_ADMIN = "FACTORY_ADMIN"
    FACTORY_WORKER = "FACTORY_WORKER"


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
    managed_orders = relationship("Order", back_populates="manager", foreign_keys="Order.manager_id")
