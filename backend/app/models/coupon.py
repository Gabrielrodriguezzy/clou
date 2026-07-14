from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Date
from app.core.database import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    discount_percent = Column(Integer, nullable=False)  # 0-100
    min_amount = Column(Float, default=0.0)  # valor mínimo do pedido
    max_uses = Column(Integer, default=0)  # 0 = ilimitado
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
