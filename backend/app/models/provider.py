from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    api_url = Column(String(255), nullable=False)
    api_key = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=0)  # menor = maior prioridade
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    provider_services = relationship("ProviderService", back_populates="provider", lazy="selectin")
