from datetime import datetime, date

from sqlalchemy import BigInteger, String, DateTime, Date, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

from database import Base


class Payment(Base):
    __tablename__ = "platform_payments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    order_id = mapped_column(BigInteger, ForeignKey("platform_orders.id"), nullable=False)
    amount = mapped_column(Numeric(15, 2), nullable=False)
    payment_date = mapped_column(Date, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="")  # Kaspi, Halyk, etc.
    received_by_id = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order = relationship("Order", back_populates="payments")
    received_by = relationship("User")
