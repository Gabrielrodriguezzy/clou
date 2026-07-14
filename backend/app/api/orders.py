from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.service import Service, ServiceStatus
from app.models.order import Order, OrderStatus
from app.models.transaction import Transaction, TransactionType
from app.schemas.order import OrderCreate, OrderResponse
from datetime import datetime, timezone

from urllib.parse import urlparse

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validar link
    link = data.link.strip()
    parsed = urlparse(link)
    if not parsed.scheme or not parsed.netloc:
        raise HTTPException(
            status_code=400,
            detail="Link inválido. Insira uma URL completa (ex: https://instagram.com/seuperfil)",
        )

    # Verificar serviço
    result = await db.execute(select(Service).where(Service.id == data.service_id))
    service = result.scalar_one_or_none()
    if not service or service.status != ServiceStatus.ACTIVE:
        raise HTTPException(status_code=404, detail="Serviço não encontrado ou inativo")
    if data.quantity < service.min_amount or data.quantity > service.max_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Quantidade deve estar entre {service.min_amount} e {service.max_amount}",
        )

    charge = round(service.price * (data.quantity / 1000), 2)

    # Verificar saldo
    if current_user.balance < charge:
        raise HTTPException(status_code=402, detail="Saldo insuficiente")

    # Criar pedido
    order = Order(
        user_id=current_user.id,
        service_id=service.id,
        link=data.link.strip(),
        quantity=data.quantity,
        charge=charge,
        status=OrderStatus.PENDING,
    )
    db.add(order)
    await db.flush()

    # Deduzir saldo
    balance_before = current_user.balance
    current_user.balance = round(current_user.balance - charge, 2)

    # Registrar transação
    tx = Transaction(
        user_id=current_user.id,
        type=TransactionType.PURCHASE,
        amount=-charge,
        balance_before=balance_before,
        balance_after=current_user.balance,
        description=f"Pedido #{order.id} - {service.name}",
        reference_type="order",
        reference_id=order.id,
    )
    db.add(tx)

    return order


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    result = await db.execute(
        select(Order)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(Order.id == order_id, Order.user_id == current_user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    return order
