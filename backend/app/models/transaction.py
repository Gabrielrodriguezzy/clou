import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"           # depósito via pagamento
    PURCHASE = "purchase"         # compra de serviço
    REFUND = "refund"             # reembolso
    ADJUSTMENT = "adjustment"     # ajuste manual (admin)
    COMMISSION = "commission"     # comissão de revenda


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(SAEnum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)  # positivo = entrada, negativo = saída
    balance_before = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    reference_type = Column(String(50), nullable=True)  # order, deposit, etc
    reference_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", lazy="selectin")
