from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from app.core.database import Base


class Partner(Base):
    """Parceiro registrado (dono de grupo) com ref_code customizado."""
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    ref_code = Column(String(50), unique=True, nullable=False, index=True)
    commission_rate = Column(Float, default=5.0)  # percentual (ex: 5 = 5%)
    pix_key = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))