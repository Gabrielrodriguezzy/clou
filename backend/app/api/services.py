from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from app.core.database import get_db
from app.models.platform import Platform
from app.models.category import Category
from app.models.service import Service, ServiceStatus
from app.models.order import Order, OrderStatus
from app.models.user import User
from app.schemas.service import PlatformResponse, CategoryResponse, ServiceResponse, StatsResponse

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/stats", response_model=StatsResponse)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Retorna estatísticas reais do sistema para a landing page."""
    # Total de pedidos
    orders_count = await db.scalar(select(func.count(Order.id)))

    # Total de usuários
    users_count = await db.scalar(select(func.count(User.id)))

    # Taxa de entrega (completed / total com status definido)
    total_with_status = await db.scalar(
        select(func.count(Order.id)).where(Order.status.in_([
            OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS,
            OrderStatus.PROCESSING, OrderStatus.ERROR,
            OrderStatus.CANCELLED, OrderStatus.PARTIAL,
        ]))
    )
    completed_count = await db.scalar(
        select(func.count(Order.id)).where(Order.status == OrderStatus.COMPLETED)
    )
    delivery_rate = round((completed_count / total_with_status * 100) if total_with_status and total_with_status > 0 else 0, 1)

    # Total de serviços ativos
    services_count = await db.scalar(
        select(func.count(Service.id)).where(Service.status == ServiceStatus.ACTIVE)
    )

    # Total de itens processados (soma de todas as quantidades dos pedidos)
    items_count = await db.scalar(
        select(func.coalesce(func.sum(Order.quantity), 0))
    )

    return StatsResponse(
        total_orders=orders_count or 0,
        total_users=users_count or 0,
        avg_delivery_rate=delivery_rate,
        total_services=services_count or 0,
        total_items_processed=items_count or 0,
    )


@router.get("/platforms", response_model=list[PlatformResponse])
async def list_platforms(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Platform).where(Platform.is_active == True).order_by(Platform.sort_order)
    )
    return result.scalars().all()


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(
    platform_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Category).where(Category.is_active == True)
    if platform_id:
        query = query.where(Category.platform_id == platform_id)
    result = await db.execute(query.order_by(Category.sort_order))
    return result.scalars().all()


@router.get("/services", response_model=list[ServiceResponse])
async def list_services(
    platform_id: Optional[int] = Query(None),
    category_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Service)
        .where(Service.status == ServiceStatus.ACTIVE)
        .options(selectinload(Service.platform), selectinload(Service.category))
    )
    if platform_id:
        query = query.where(Service.platform_id == platform_id)
    if category_id:
        query = query.where(Service.category_id == category_id)
    result = await db.execute(query.order_by(Service.sort_order))
    return result.scalars().all()


@router.get("/services/by-slug/{slug}", response_model=ServiceResponse)
async def get_service_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Service)
        .where(Service.slug == slug)
        .options(selectinload(Service.platform), selectinload(Service.category))
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return service


@router.get("/services/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Service)
        .where(Service.id == service_id)
        .options(selectinload(Service.platform), selectinload(Service.category))
    )
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return service
