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
