import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class DepositStatus(str, enum.Enum):
    PENDING = "pending"           # aguardando pagamento
    PAID = "paid"                 # pago, creditar saldo
    COMPLETED = "completed"       # saldo já creditado
    EXPIRED = "expired"           # expirou
    CANCELLED = "cancelled"       # cancelado
    REFUNDED = "refunded"         # reembolsado


class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)  # valor do depósito
    fee = Column(Float, default=0.0)  # taxa
    net_amount = Column(Float, nullable=False)  # valor líquido
    payment_method = Column(String(50), default="pix")
    status = Column(SAEnum(DepositStatus), default=DepositStatus.PENDING)
    external_id = Column(String(255), nullable=True)  # ID no gateway
    pix_qr_code = Column(Text, nullable=True)  # QR Code em base64
    pix_qr_text = Column(Text, nullable=True)  # copia e cola
    payment_data = Column(JSON, nullable=True)  # dados completos do pagamento
    expires_at = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", lazy="selectin")
