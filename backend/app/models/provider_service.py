from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class ProviderService(Base):
    __tablename__ = "provider_services"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    provider_service_id = Column(String(100), nullable=False)  # ID do serviço no provedor
    provider_price = Column(Float, nullable=False)  # preço que pagamos
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    provider = relationship("Provider", back_populates="provider_services")
    service = relationship("Service", back_populates="provider_services")
