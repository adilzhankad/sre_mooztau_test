import enum
from datetime import datetime

from sqlalchemy import BigInteger, String, Boolean, DateTime, Numeric, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class OrgType(str, enum.Enum):
    HQ = "hq"
    BRANCH = "branch"
    DEALER = "dealer"


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    org_type: Mapped[str] = mapped_column(String(50), nullable=False, default=OrgType.DEALER.value)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=True)
    region: Mapped[str] = mapped_column(String(255), nullable=True)
    credit_limit: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True)
    balance: Mapped[float] = mapped_column(Numeric(15, 2), default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    DEALER_ADMIN = "dealer_admin"
    DEALER_MANAGER = "dealer_manager"
    FACTORY_ADMIN = "factory_admin"
    FACTORY_WORKER = "factory_worker"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("organizations.id"), nullable=True)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization")
