import enum
from datetime import datetime

from sqlalchemy import BigInteger, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class OrgType(str, enum.Enum):
    HQ = "HQ"
    BRANCH = "BRANCH"
    DEALER = "DEALER"


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
    orders = relationship("Order", back_populates="organization")
