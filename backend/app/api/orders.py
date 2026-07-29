from datetime import datetime, timezone, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.security_ext import sanitize_text, validate_link, AuditLogger
from app.models.user import User
from app.models.service import Service, ServiceStatus
from app.models.order import Order, OrderStatus
from app.models.platform import Platform
from app.models.transaction import Transaction, TransactionType
from app.schemas.order import OrderCreate, OrderResponse, ProfileOrdersResponse, ProfileGroup, ProfileSummary, WeekGroup, WeekOrderItem
from app.workers.order_worker import process_single_order

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    background_tasks: BackgroundTasks = Depends(BackgroundTasks),
):
    # Sanitizar e validar link
    link = sanitize_text(data.link.strip(), max_length=2048)
    if not validate_link(link):
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
        link=link,
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

    # Disparar processamento do pedido em background
    # Commit primeiro para garantir que o pedido exista no banco
    await db.commit()
    background_tasks.add_task(process_single_order, order.id)

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


@router.get("/by-profile", response_model=ProfileOrdersResponse)
async def orders_by_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Agrupa pedidos por link (perfil) com quebra semanal."""
    # Buscar todos os pedidos do usuário com service + platform
    result = await db.execute(
        select(Order, Service, Platform)
        .join(Service, Order.service_id == Service.id)
        .join(Platform, Service.platform_id == Platform.id)
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    )
    rows = result.all()

    if not rows:
        return ProfileOrdersResponse(profiles=[], summary=ProfileSummary(total_profiles=0, total_spent=0, total_orders=0))

    # Agrupar por link
    profiles_map: dict[str, dict] = {}

    for order, service, platform in rows:
        link = order.link
        if link not in profiles_map:
            profiles_map[link] = {
                "link": link,
                "platform": platform.name,
                "orders": [],
                "total_spent": 0.0,
            }
        p = profiles_map[link]
        p["orders"].append({
            "id": order.id,
            "service_name": service.name,
            "platform_name": platform.name,
            "quantity": order.quantity,
            "charge": order.charge,
            "status": order.status.value if hasattr(order.status, "value") else order.status,
            "created_at": order.created_at,
        })
        p["total_spent"] += order.charge

    profiles_list = []
    total_all_spent = 0.0
    total_all_orders = 0

    for link, data in profiles_map.items():
        orders = data["orders"]
        total_all_spent += data["total_spent"]
        total_all_orders += len(orders)

        # Agrupar por semana
        weeks_map: dict[str, dict] = {}
        for o in orders:
            dt = o["created_at"]
            if dt.tzinfo:
                dt = dt.astimezone(timezone.utc)
            # Segunda-feira da semana
            monday = dt - timedelta(days=dt.weekday())
            week_key = monday.strftime("%Y-%m-%d")
            week_start_dt = monday

            if week_key not in weeks_map:
                sunday = monday + timedelta(days=6)
                month_names = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
                week_num = week_start_dt.isocalendar()[1]
                label = f"Semana {week_num} ({week_start_dt.day} {month_names[week_start_dt.month-1]} - {sunday.day} {month_names[sunday.month-1]})"
                weeks_map[week_key] = {
                    "week_start": week_key,
                    "week_label": label,
                    "orders": [],
                    "total_spent": 0.0,
                }
            w = weeks_map[week_key]
            w["orders"].append(WeekOrderItem(**o))
            w["total_spent"] += o["charge"]

        # Ordenar semanas da mais recente para a mais antiga
        sorted_weeks = sorted(weeks_map.values(), key=lambda w: w["week_start"], reverse=True)
        week_groups = [
            WeekGroup(
                week_start=w["week_start"],
                week_label=w["week_label"],
                orders_count=len(w["orders"]),
                total_spent=round(w["total_spent"], 2),
                orders=w["orders"],
            )
            for w in sorted_weeks
        ]

        dates = sorted([o["created_at"] for o in orders], reverse=True)

        profiles_list.append(ProfileGroup(
            link=link,
            platform=data["platform"],
            total_spent=round(data["total_spent"], 2),
            total_orders=len(orders),
            first_order=dates[-1],
            last_order=dates[0],
            weeks=week_groups,
        ))

    return ProfileOrdersResponse(
        profiles=profiles_list,
        summary=ProfileSummary(
            total_profiles=len(profiles_list),
            total_spent=round(total_all_spent, 2),
            total_orders=total_all_orders,
        ),
    )


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
