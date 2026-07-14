from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum as SAEnum
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    RESELLER = "reseller"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    email_notifications = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
