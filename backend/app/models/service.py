import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class ServiceStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)  # preço de venda
    min_amount = Column(Integer, default=1, nullable=False)
    max_amount = Column(Integer, default=10000, nullable=False)
    avg_time = Column(String(50), default="0-24h")  # tempo estimado
    guarantee = Column(String(50), default="30 dias")
    platform_id = Column(Integer, ForeignKey("platforms.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    status = Column(SAEnum(ServiceStatus), default=ServiceStatus.ACTIVE)
    sort_order = Column(Integer, default=0)
    slug = Column(String(200), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    platform = relationship("Platform", back_populates="services")
    category = relationship("Category", back_populates="services")
    provider_services = relationship("ProviderService", back_populates="service", lazy="selectin")
