import enum
from datetime import datetime

from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, String, Text

from database import Base


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


class Organization(Base):
    __tablename__ = "organizations"
    # Shared table — read-only access here

    id = Column(BigInteger, primary_key=True)
    name = Column(String(200))
    org_type = Column(String(20))
    is_active = Column(Boolean, default=True)
    contact_phone = Column(String(50), default="")
    contact_email = Column(String(200), default="")
    address = Column(Text, default="")
    region = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"
    # Shared table — read + profile update

    id = Column(BigInteger, primary_key=True)
    organization_id = Column(BigInteger, ForeignKey("organizations.id"), nullable=True)
    role = Column(String(20))
    full_name = Column(String(200))
    phone = Column(String(50), unique=True)
    email = Column(String(200), default="")
    password_hash = Column(String(200))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
