from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class OrderCreate(BaseModel):
    service_id: int
    link: str = Field(..., max_length=500)
    quantity: int = Field(..., ge=1)


class OrderResponse(BaseModel):
    id: int
    user_id: int
    service_id: int
    provider_id: Optional[int] = None
    link: str
    quantity: int
    charge: float
    status: str
    start_count: Optional[int] = None
    remains: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderDetailResponse(OrderResponse):
    service_name: Optional[str] = None
    service: Optional[dict] = None


class WeekOrderItem(BaseModel):
    id: int
    service_name: str
    platform_name: str
    quantity: int
    charge: float
    status: str
    created_at: datetime


class WeekGroup(BaseModel):
    week_start: str  # ISO date da segunda-feira
    week_label: str  # "Semana 31 (27 jul - 2 ago)"
    orders_count: int
    total_spent: float
    orders: list[WeekOrderItem]


class ProfileGroup(BaseModel):
    link: str
    platform: str
    total_spent: float
    total_orders: int
    first_order: datetime
    last_order: datetime
    weeks: list[WeekGroup]


class ProfileSummary(BaseModel):
    total_profiles: int
    total_spent: float
    total_orders: int


class ProfileOrdersResponse(BaseModel):
    profiles: list[ProfileGroup]
    summary: ProfileSummary
