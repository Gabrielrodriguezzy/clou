import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"           # aguardando processamento
    PROCESSING = "processing"     # enviado ao provedor
    IN_PROGRESS = "in_progress"   # provedor processando
    COMPLETED = "completed"       # concluído
    PARTIAL = "partial"           # parcialmente concluído
    CANCELLED = "cancelled"       # cancelado
    REFUNDED = "refunded"         # reembolsado
    ERROR = "error"               # erro no provedor


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    provider_order_id = Column(String(100), nullable=True)  # ID do pedido no provedor
    link = Column(Text, nullable=False)  # link do perfil alvo
    quantity = Column(Integer, nullable=False)
    charge = Column(Float, nullable=False)  # valor cobrado do cliente
    cost = Column(Float, default=0.0)  # custo (preço do provedor)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    start_count = Column(Integer, nullable=True)
    remains = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", lazy="selectin")
    service = relationship("Service", lazy="selectin")
    provider = relationship("Provider", lazy="selectin")
