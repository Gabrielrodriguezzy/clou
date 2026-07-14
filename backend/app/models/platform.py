from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base


class Platform(Base):
    __tablename__ = "platforms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    slug = Column(String(50), unique=True, nullable=False, index=True)
    icon = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    categories = relationship("Category", back_populates="platform", lazy="selectin")
    services = relationship("Service", back_populates="platform", lazy="selectin")
