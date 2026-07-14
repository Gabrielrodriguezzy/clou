from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from app.core.database import get_db
from app.models.platform import Platform
from app.models.category import Category
from app.models.service import Service, ServiceStatus
from app.schemas.service import PlatformResponse, CategoryResponse, ServiceResponse

router = APIRouter(prefix="/api", tags=["catalog"])


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
