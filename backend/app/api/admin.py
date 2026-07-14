from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user, get_admin_user
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.service import Service, ServiceStatus
from app.models.coupon import Coupon
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ─── Schemas ────────────────────────────────────────────────────────

class UserAdminResponse(BaseModel):
    id: int
    email: str
    name: str
    balance: float
    role: str
    is_active: bool
    created_at: datetime
    total_orders: int = 0

    model_config = {"from_attributes": True}


class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    balance: Optional[float] = None


class OrderAdminResponse(BaseModel):
    id: int
    user_id: int
    service_id: int
    provider_id: int | None
    provider_order_id: str | None
    link: str
    quantity: int
    charge: float
    cost: float
    status: str
    notes: str | None
    created_at: datetime
    user_name: str = ""
    service_name: str = ""

    model_config = {"from_attributes": True}


class OrderAdminUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None


class CouponCreate(BaseModel):
    code: str = Field(..., max_length=50)
    discount_percent: int = Field(..., ge=1, le=100)
    max_uses: int = 0
    min_amount: float = 0
    expires_in_days: Optional[int] = None


class ServiceAdminUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    min_amount: Optional[int] = None
    max_amount: Optional[int] = None
    status: Optional[str] = None
    avg_time: Optional[str] = None


# ─── Endpoints ──────────────────────────────────────────────────────

# Ping de diagnóstico
@router.get("/ping")
async def admin_ping(admin: User = Depends(get_admin_user)):
    return {"status": "ok", "admin": admin.name, "role": admin.role}


# ─── Usuários ───────────────────────────────────────────────────────

@router.get("/users", response_model=list[UserAdminResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if search:
        query = query.where(
            (User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()

    # Enriquecer com total de pedidos
    response = []
    for u in users:
        order_count = await db.scalar(
            select(func.count(Order.id)).where(Order.user_id == u.id)
        )
        response.append(UserAdminResponse(
            id=u.id, email=u.email, name=u.name,
            balance=u.balance, role=u.role.value if hasattr(u.role, "value") else str(u.role),
            is_active=u.is_active, created_at=u.created_at,
            total_orders=order_count or 0,
        ))
    return response


@router.patch("/users/{user_id}", response_model=UserAdminResponse)
async def update_user(
    user_id: int,
    data: UserAdminUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    updates = data.model_dump(exclude_none=True)
    if "balance" in updates:
        updates["balance"] = round(updates["balance"], 2)
    for key, val in updates.items():
        setattr(user, key, val)
    await db.flush()
    await db.refresh(user)

    order_count = await db.scalar(
        select(func.count(Order.id)).where(Order.user_id == user.id)
    )
    return UserAdminResponse(
        id=user.id, email=user.email, name=user.name,
        balance=user.balance, role=user.role.value if hasattr(user.role, "value") else str(user.role),
        is_active=user.is_active, created_at=user.created_at,
        total_orders=order_count or 0,
    )


# ─── Pedidos ────────────────────────────────────────────────────────

@router.get("/orders", response_model=list[OrderAdminResponse])
async def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).options(selectinload(Order.user), selectinload(Order.service))
    if status:
        query = query.where(Order.status == status)
    if user_id:
        query = query.where(Order.user_id == user_id)
    query = query.order_by(Order.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    return [
        OrderAdminResponse(
            id=o.id, user_id=o.user_id, service_id=o.service_id,
            provider_id=o.provider_id, provider_order_id=o.provider_order_id,
            link=o.link, quantity=o.quantity, charge=o.charge, cost=o.cost,
            status=o.status.value if hasattr(o.status, "value") else str(o.status),
            notes=o.notes, created_at=o.created_at,
            user_name=o.user.name if o.user else "",
            service_name=o.service.name if o.service else "",
        )
        for o in orders
    ]


@router.patch("/orders/{order_id}")
async def update_order(
    order_id: int,
    data: OrderAdminUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    if data.status is not None:
        order.status = data.status
    if data.notes is not None:
        order.notes = data.notes
    await db.flush()
    return {"status": "ok", "order_id": order_id, "new_status": str(order.status)}


# ─── Cupons ────────────────────────────────────────────────────────

@router.post("/coupons")
async def create_coupon(
    data: CouponCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    # Verificar se já existe
    result = await db.execute(select(Coupon).where(Coupon.code == data.code.upper().strip()))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=409, detail="Cupom com este código já existe")

    expires_at = None
    if data.expires_in_days:
        expires_at = datetime.now(timezone.utc).replace(hour=23, minute=59, second=59) + __import__("datetime").timedelta(days=data.expires_in_days)

    coupon = Coupon(
        code=data.code.upper().strip(),
        discount_percent=data.discount_percent,
        max_uses=data.max_uses,
        min_amount=data.min_amount,
        expires_at=expires_at,
        is_active=True,
        used_count=0,
    )
    db.add(coupon)
    await db.flush()
    await db.refresh(coupon)
    return {
        "id": coupon.id,
        "code": coupon.code,
        "discount_percent": coupon.discount_percent,
        "max_uses": coupon.max_uses,
        "min_amount": coupon.min_amount,
        "expires_at": coupon.expires_at.isoformat() if coupon.expires_at else None,
        "is_active": coupon.is_active,
    }


# ─── Serviços ──────────────────────────────────────────────────────

@router.patch("/services/{service_id}")
async def update_service(
    service_id: int,
    data: ServiceAdminUpdate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")

    updates = data.model_dump(exclude_none=True)
    for key, val in updates.items():
        setattr(service, key, val)
    await db.flush()
    await db.refresh(service)
    return {
        "id": service.id,
        "name": service.name,
        "price": service.price,
        "status": service.status.value if hasattr(service.status, "value") else str(service.status),
    }
