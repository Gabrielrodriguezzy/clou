from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False)
    platform_id = Column(Integer, ForeignKey("platforms.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    platform = relationship("Platform", back_populates="categories")
    services = relationship("Service", back_populates="category", lazy="selectin")
