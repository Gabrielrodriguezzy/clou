from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PlatformResponse(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    is_active: bool
    sort_order: int

    model_config = {"from_attributes": True}


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    platform_id: int
    sort_order: int

    model_config = {"from_attributes": True}


class ServiceResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    min_amount: int
    max_amount: int
    avg_time: str
    guarantee: str
    platform_id: int
    category_id: Optional[int] = None
    status: str
    slug: Optional[str] = None
    sort_order: int = 0
    platform: Optional[PlatformResponse] = None
    category: Optional[CategoryResponse] = None

    model_config = {"from_attributes": True}


class ServiceListResponse(BaseModel):
    platforms: List[PlatformResponse]
    services: List[ServiceResponse]


class StatsResponse(BaseModel):
    total_orders: int
    total_users: int
    avg_delivery_rate: float
    total_services: int
    total_items_processed: int = 0
