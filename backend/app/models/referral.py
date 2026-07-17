from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum
from app.core.database import Base
import enum


class ReferralStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"


class Referral(Base):
    __tablename__ = "referrals"

    id = Column(Integer, primary_key=True, index=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # quem indicou
    referred_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # quem foi indicado
    referred_email = Column(String(255), nullable=False)
    bonus = Column(Float, default=0.0)  # bônus concedido ao indicador
    referred_deposit = Column(Float, default=0.0)  # valor do primeiro depósito do indicado
    status = Column(SAEnum(ReferralStatus), default=ReferralStatus.PENDING)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    paid_at = Column(DateTime(timezone=True), nullable=True)
