from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user, get_admin_user
from app.core.security_ext import AuditLogger
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.service import Service, ServiceStatus
from app.models.coupon import Coupon
from app.models.referral import Referral, ReferralStatus
from app.models.partner_payout import PartnerPayout
from app.models.partner import Partner
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

    AuditLogger.admin_action(
        admin_id=admin.id, admin_email=admin.email,
        action=f"update_user:{user_id}", target=f"user:{user.email}"
    )

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


@router.patch("/coupons/{code}")
async def deactivate_coupon(
    code: str,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Coupon).where(Coupon.code == code.upper().strip()))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=404, detail="Cupom não encontrado")

    coupon.is_active = False
    await db.flush()
    await db.refresh(coupon)
    return {"code": coupon.code, "is_active": coupon.is_active}


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


# ─── Parceiros (Grupos de Divulgação) ────────────────────────────────


class PartnerReportItem(BaseModel):
    """Um parceiro (dono de grupo) com seus números consolidados."""
    partner_id: int
    partner_name: str
    partner_email: str
    ref_code: str
    referred_count: int
    total_spent: float
    commission_5pct: float
    paid_out: float
    balance_due: float
    last_activity: Optional[str] = None
    status: str  # "active" | "pending" | "inactive"


class PartnerPayoutRequest(BaseModel):
    partner_id: int
    amount: float = Field(..., gt=0)
    notes: Optional[str] = None


class PartnerCreate(BaseModel):
    """Criar um novo parceiro (dono de grupo)."""
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., max_length=255)
    ref_code: str = Field(..., min_length=3, max_length=50, pattern=r"^[A-Z0-9_]+$")
    commission_rate: float = Field(default=5.0, ge=0, le=100)
    pix_key: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=500)


class PartnerResponse(BaseModel):
    """Resposta com dados do parceiro."""
    id: int
    user_id: Optional[int] = None
    name: str
    email: str
    ref_code: str
    commission_rate: float
    pix_key: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: str
    referral_link: str = ""

    model_config = {"from_attributes": True}


@router.post("/partners/create", response_model=PartnerResponse)
async def create_partner(
    data: PartnerCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Cria um novo parceiro e gera o link de indicação para ele."""
    # Verificar se ref_code já existe
    exists = await db.execute(select(Partner).where(Partner.ref_code == data.ref_code.strip().upper()))
    if exists.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Já existe um parceiro com este código")

    # Verificar se email já existe
    exists_email = await db.execute(select(Partner).where(Partner.email == data.email.lower().strip()))
    if exists_email.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Já existe um parceiro com este email")

    # Buscar ou criar usuário para o parceiro
    user_result = await db.execute(select(User).where(User.email == data.email.lower().strip()))
    user = user_result.scalar_one_or_none()
    user_id = user.id if user else None

    partner = Partner(
        user_id=user_id,
        name=data.name.strip(),
        email=data.email.lower().strip(),
        ref_code=data.ref_code.strip().upper(),
        commission_rate=data.commission_rate,
        pix_key=data.pix_key,
        notes=data.notes,
        is_active=True,
    )
    db.add(partner)
    await db.flush()
    await db.refresh(partner)

    # Se não existe usuário, criar um (role=user, senha aleatória)
    if not user:
        from app.core.security import hash_password
        import secrets
        temp_password = secrets.token_urlsafe(8)
        new_user = User(
            email=data.email.lower().strip(),
            password_hash=hash_password(temp_password),
            name=data.name.strip(),
            role=UserRole.USER,
        )
        db.add(new_user)
        await db.flush()
        partner.user_id = new_user.id
        await db.flush()

    AuditLogger.admin_action(
        admin_id=admin.id, admin_email=admin.email,
        action=f"create_partner:{partner.id}",
        target=f"partner:{partner.name} code:{partner.ref_code}",
    )

    return PartnerResponse(
        id=partner.id,
        user_id=partner.user_id,
        name=partner.name,
        email=partner.email,
        ref_code=partner.ref_code,
        commission_rate=partner.commission_rate,
        pix_key=partner.pix_key,
        notes=partner.notes,
        is_active=partner.is_active,
        created_at=partner.created_at.isoformat() if partner.created_at else "",
        referral_link=f"https://cloustore.online/register?ref={partner.ref_code}",
    )


@router.get("/partners", response_model=list[PartnerReportItem])
async def get_partners_report(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Relatório consolidado de parceiros.
    Inclui parceiros registrados (Partner table) e usuários com indicações.
    Commission usa a taxa configurada no Partner (padrão 5%).
    """
    import base64

    # 1. Buscar todos os parceiros registrados + usuários com indicações
    partners_result = await db.execute(select(Partner).order_by(Partner.created_at.desc()))
    registered_partners = {p.user_id: p for p in partners_result.scalars().all() if p.user_id}

    ref_result = await db.execute(
        select(Referral.referrer_id, func.count(Referral.id).label("cnt"))
        .group_by(Referral.referrer_id)
        .order_by(func.count(Referral.id).desc())
    )
    referrer_rows = ref_result.all()

    # Unir: todos os user_ids que são parceiros ou têm referrals
    all_ids = set(registered_partners.keys())
    all_ids.update(r.referrer_id for r in referrer_rows)

    if not all_ids:
        return []

    users_result = await db.execute(select(User).where(User.id.in_(list(all_ids))))
    users_map = {u.id: u for u in users_result.scalars().all()}

    report = []
    for user_id in sorted(all_ids):
        user = users_map.get(user_id)
        if not user:
            continue

        # Buscar referred_ids
        referred_result = await db.execute(
            select(Referral.referred_id).where(Referral.referrer_id == user_id)
        )
        referred_ids = [r.referred_id for r in referred_result.all()]
        referred_count = len(referred_ids)

        # Calcular total gasto
        total_spent = 0.0
        if referred_ids:
            spent_result = await db.execute(
                select(func.coalesce(func.sum(Order.charge), 0))
                .where(
                    Order.user_id.in_(referred_ids),
                    Order.status.in_([OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS, OrderStatus.PROCESSING, OrderStatus.PARTIAL]),
                )
            )
            total_spent = round(float(spent_result.scalar() or 0), 2)

        # Taxa de comissão: do Partner se existir, senão 5%
        partner = registered_partners.get(user_id)
        commission_rate = partner.commission_rate if partner else 5.0
        commission = round(total_spent * commission_rate / 100, 2)

        # Total já pago
        paid_result = await db.execute(
            select(func.coalesce(func.sum(PartnerPayout.amount), 0))
            .where(PartnerPayout.partner_id == user_id)
        )
        paid_out = round(float(paid_result.scalar() or 0), 2)
        balance_due = round(commission - paid_out, 2)

        # Última atividade
        last_activity = None
        if referred_ids:
            last_order = await db.execute(
                select(Order.created_at)
                .where(Order.user_id.in_(referred_ids))
                .order_by(Order.created_at.desc())
                .limit(1)
            )
            last_activity = last_order.scalar_one_or_none()

        # Código: usar o do Partner se existir, senão base64
        ref_code = partner.ref_code if partner else base64.urlsafe_b64encode(str(user_id).encode()).decode().rstrip("=")

        # Status
        if paid_out >= commission and commission > 0:
            status = "paid"
        elif balance_due >= 20:
            status = "ready"
        elif referred_count > 0 or partner:
            status = "active"
        else:
            status = "inactive"

        report.append(PartnerReportItem(
            partner_id=user_id,
            partner_name=user.name,
            partner_email=user.email,
            ref_code=ref_code,
            referred_count=referred_count,
            total_spent=total_spent,
            commission_5pct=commission,
            paid_out=paid_out,
            balance_due=balance_due,
            last_activity=last_activity.isoformat() if last_activity else None,
            status=status,
        ))

    return report


@router.post("/partners/payout")
async def register_partner_payout(
    data: PartnerPayoutRequest,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Registra um pagamento manual feito a um parceiro.
    O senhor envia o Pix por fora e registra aqui para controle.
    """
    # Verificar que o parceiro existe
    user_result = await db.execute(select(User).where(User.id == data.partner_id))
    partner = user_result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")

    payout = PartnerPayout(
        partner_id=data.partner_id,
        amount=round(data.amount, 2),
        notes=data.notes,
    )
    db.add(payout)
    await db.flush()
    await db.refresh(payout)

    AuditLogger.admin_action(
        admin_id=admin.id, admin_email=admin.email,
        action=f"partner_payout:{data.partner_id}",
        target=f"partner:{partner.email} amount:{data.amount}",
    )

    return {
        "id": payout.id,
        "partner_id": payout.partner_id,
        "amount": payout.amount,
        "paid_at": payout.paid_at.isoformat(),
        "notes": payout.notes,
    }


@router.get("/partners/payouts", response_model=list[dict])
async def list_partner_payouts(
    partner_id: Optional[int] = None,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Lista histórico de pagamentos a parceiros."""
    query = select(PartnerPayout).order_by(PartnerPayout.paid_at.desc())
    if partner_id:
        query = query.where(PartnerPayout.partner_id == partner_id)

    result = await db.execute(query)
    payouts = result.scalars().all()

    # Enriquecer com nome do parceiro
    output = []
    for p in payouts:
        partner = await db.get(User, p.partner_id)
        output.append({
            "id": p.id,
            "partner_id": p.partner_id,
            "partner_name": partner.name if partner else "Desconhecido",
            "amount": p.amount,
            "notes": p.notes,
            "paid_at": p.paid_at.isoformat(),
        })
    return output


class WeeklyPartnerStats(BaseModel):
    partner_id: int
    partner_name: str
    ref_code: str
    commission_rate: float
    referral_link: str
    pix_key: str | None = None
    total_referred: int
    total_spent: float
    commission_due: float
    paid_out: float
    balance_due: float
    weeks: list[dict]


@router.get("/partners/weekly-stats", response_model=list[WeeklyPartnerStats])
async def get_partners_weekly_stats(
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Filtrar de (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Filtrar até (YYYY-MM-DD)"),
):
    """Retorna dados de revendedores com quebra semanal de indicações e gastos.
    Opcional: filtrar por período com start_date e end_date (YYYY-MM-DD).
    """
    import base64
    from collections import defaultdict
    from datetime import timedelta, date as date_type

    month_names = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]

    # Buscar todos os parceiros
    partners_result = await db.execute(select(Partner).order_by(Partner.created_at.desc()))
    partners = partners_result.scalars().all()

    if not partners:
        return []

    # Mapear user_id -> partner
    partner_by_user = {p.user_id: p for p in partners if p.user_id}

    # Converter datas
    dt_start = None
    dt_end = None
    if start_date:
        try:
            dt_start = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(400, "start_date inválido. Use YYYY-MM-DD")
    if end_date:
        try:
            dt_end = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
        except ValueError:
            raise HTTPException(400, "end_date inválido. Use YYYY-MM-DD")

    # Buscar referrals de todos os parceiros
    partner_user_ids = [p.user_id for p in partners if p.user_id]
    if not partner_user_ids:
        return []

    ref_query = select(Referral).where(Referral.referrer_id.in_(partner_user_ids))
    if dt_start:
        ref_query = ref_query.where(Referral.created_at >= dt_start)
    if dt_end:
        ref_query = ref_query.where(Referral.created_at <= dt_end)
    referrals_result = await db.execute(ref_query)
    all_referrals = referrals_result.scalars().all()

    # Agrupar referrals por referrer
    referrals_by_referrer: dict[int, list[Referral]] = defaultdict(list)
    for r in all_referrals:
        referrals_by_referrer[r.referrer_id].append(r)

    # Buscar dados dos indicados
    all_referred_ids = [r.referred_id for r in all_referrals]
    referred_users_map = {}
    if all_referred_ids:
        users_result = await db.execute(select(User).where(User.id.in_(all_referred_ids)))
        referred_users_map = {u.id: u for u in users_result.scalars().all()}

    # Buscar pedidos dos indicados
    referred_orders = []
    if all_referred_ids:
        orders_query = select(Order).where(
            Order.user_id.in_(all_referred_ids),
            Order.status.in_([OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS, OrderStatus.PROCESSING, OrderStatus.PARTIAL]),
        )
        if dt_start:
            orders_query = orders_query.where(Order.created_at >= dt_start)
        if dt_end:
            orders_query = orders_query.where(Order.created_at <= dt_end)
        orders_result = await db.execute(orders_query.order_by(Order.created_at.desc()))
        referred_orders = orders_result.scalars().all()

    # Agrupar pedidos por user_id
    orders_by_user: dict[int, list[Order]] = defaultdict(list)
    for o in referred_orders:
        orders_by_user[o.user_id].append(o)

    # Total pago por parceiro
    paid_result = await db.execute(
        select(PartnerPayout.partner_id, func.coalesce(func.sum(PartnerPayout.amount), 0))
        .group_by(PartnerPayout.partner_id)
    )
    paid_map: dict[int, float] = {}
    for row in paid_result.all():
        paid_map[row[0]] = round(float(row[1]), 2)

    result = []

    for partner in partners:
        if not partner.user_id:
            continue

        user_id = partner.user_id
        referrals = referrals_by_referrer.get(user_id, [])
        total_referred = len(referrals)

        # Calcular total gasto + weekly breakdown
        total_spent = 0.0
        weeks_map: dict[str, dict] = {}
        all_dates_for_partner = set()

        for ref in referrals:
            ref_dt = ref.created_at
            if ref_dt.tzinfo:
                ref_dt = ref_dt.astimezone(timezone.utc)
            all_dates_for_partner.add(ref_dt)

            # Agrupar por semana
            monday = ref_dt - timedelta(days=ref_dt.weekday())
            week_key = monday.strftime("%Y-%m-%d")

            if week_key not in weeks_map:
                sunday = monday + timedelta(days=6)
                week_num = monday.isocalendar()[1]
                label = f"Semana {week_num} ({monday.day} {month_names[monday.month-1]} - {sunday.day} {month_names[sunday.month-1]})"
                weeks_map[week_key] = {
                    "week_start": week_key,
                    "week_label": label,
                    "new_referrals": 0,
                    "active_referrals": set(),
                    "total_spent": 0.0,
                }
            weeks_map[week_key]["new_referrals"] += 1

            # Pegar pedidos do indicado
            user_orders = orders_by_user.get(ref.referred_id, [])
            spent = sum(o.charge for o in user_orders)
            total_spent += spent

            if user_orders:
                weeks_map[week_key]["active_referrals"].add(ref.referred_id)

            # Distribuir gastos por semana do pedido, não da indicação
            for o in user_orders:
                odt = o.created_at
                if odt.tzinfo:
                    odt = odt.astimezone(timezone.utc)
                om = odt - timedelta(days=odt.weekday())
                owk = om.strftime("%Y-%m-%d")

                if owk not in weeks_map:
                    sunday = om + timedelta(days=6)
                    week_num = om.isocalendar()[1]
                    label = f"Semana {week_num} ({om.day} {month_names[om.month-1]} - {sunday.day} {month_names[sunday.month-1]})"
                    weeks_map[owk] = {
                        "week_start": owk,
                        "week_label": label,
                        "new_referrals": 0,
                        "active_referrals": set(),
                        "total_spent": 0.0,
                    }
                weeks_map[owk]["total_spent"] += o.charge

        commission_rate = partner.commission_rate
        commission_due = round(total_spent * commission_rate / 100, 2)
        paid_out = paid_map.get(user_id, 0.0)
        balance_due = round(commission_due - paid_out, 2)

        # Montar weeks
        sorted_weeks = sorted(weeks_map.values(), key=lambda w: w["week_start"], reverse=True)
        weeks_data = []
        for w in sorted_weeks:
            weeks_data.append({
                "week_start": w["week_start"],
                "week_label": w["week_label"],
                "new_referrals": w["new_referrals"],
                "active_referrals": len(w["active_referrals"]),
                "total_spent": round(w["total_spent"], 2),
                "commission": round(w["total_spent"] * commission_rate / 100, 2),
            })

        result.append(WeeklyPartnerStats(
            partner_id=user_id,
            partner_name=partner.name,
            ref_code=partner.ref_code,
            commission_rate=commission_rate,
            referral_link=f"https://cloustore.online/register?ref={partner.ref_code}",
            pix_key=partner.pix_key,
            total_referred=total_referred,
            total_spent=round(total_spent, 2),
            commission_due=commission_due,
            paid_out=paid_out,
            balance_due=balance_due,
            weeks=weeks_data,
        ))

    return result


@router.get("/partners/{partner_id}", response_model=PartnerResponse)
async def get_partner(
    partner_id: int,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Detalhes de um parceiro específico."""
    result = await db.execute(select(Partner).where(Partner.id == partner_id))
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")
    return PartnerResponse(
        id=partner.id,
        user_id=partner.user_id,
        name=partner.name,
        email=partner.email,
        ref_code=partner.ref_code,
        commission_rate=partner.commission_rate,
        pix_key=partner.pix_key,
        notes=partner.notes,
        is_active=partner.is_active,
        created_at=partner.created_at.isoformat() if partner.created_at else "",
        referral_link=f"https://cloustore.online/register?ref={partner.ref_code}",
    )


@router.patch("/partners/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: int,
    data: PartnerCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    """Atualizar dados de um parceiro."""
    result = await db.execute(select(Partner).where(Partner.id == partner_id))
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Parceiro não encontrado")

    partner.name = data.name.strip()
    partner.email = data.email.lower().strip()
    partner.ref_code = data.ref_code.strip().upper()
    partner.commission_rate = data.commission_rate
    partner.pix_key = data.pix_key
    partner.notes = data.notes
    await db.flush()
    await db.refresh(partner)

    AuditLogger.admin_action(
        admin_id=admin.id, admin_email=admin.email,
        action=f"update_partner:{partner.id}",
        target=f"partner:{partner.name}",
    )

    return PartnerResponse(
        id=partner.id,
        user_id=partner.user_id,
        name=partner.name,
        email=partner.email,
        ref_code=partner.ref_code,
        commission_rate=partner.commission_rate,
        pix_key=partner.pix_key,
        notes=partner.notes,
        is_active=partner.is_active,
        created_at=partner.created_at.isoformat() if partner.created_at else "",
        referral_link=f"https://cloustore.online/register?ref={partner.ref_code}",
    )
