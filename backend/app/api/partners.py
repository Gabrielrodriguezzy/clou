"""
Endpoint público para auto-cadastro de revendedores (página /afiliados).
Também: dashboard do parceiro (estatísticas próprias).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.partner import Partner
from app.models.partner_payout import PartnerPayout
from app.models.referral import Referral, ReferralStatus
from app.models.order import Order, OrderStatus
from app.services.tiers import get_tier, next_tier, sales_to_next_tier

router = APIRouter(prefix="/api/partners", tags=["partners"])


# ─── Schemas ──────────────────────────────────────────────────────────

class PartnerRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., max_length=255)
    pix_key: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = Field(None, max_length=500)
    # Opcional: código promocional que o convidou
    referred_by: Optional[str] = Field(None, max_length=50)


class PartnerRegisterResponse(BaseModel):
    success: bool
    ref_code: str
    referral_link: str
    message: str


class TierInfo(BaseModel):
    name: str
    rate: float
    sales_for_tier: float  # vendas total no tier atual
    min_sales: float
    max_sales: Optional[float]
    next_tier_name: Optional[str] = None
    sales_to_next: Optional[float] = None  # quanto falta pro próximo
    next_tier_rate: Optional[float] = None


class WeekSummary(BaseModel):
    week_start: str
    week_label: str
    new_referrals: int
    active_referrals: int
    total_spent: float
    commission: float


class PartnerMyStatsResponse(BaseModel):
    partner_name: str
    ref_code: str
    referral_link: str
    pix_key: Optional[str] = None
    commission_rate: float
    tier: TierInfo
    total_referred: int
    total_spent: float
    commission_due: float
    paid_out: float
    balance_due: float
    weeks: list[WeekSummary]


# ─── Utilitários ──────────────────────────────────────────────────────

def _generate_ref_code(name: str) -> str:
    """Gera código único baseado no nome + aleatório."""
    import secrets
    base = name.strip().upper().replace(" ", "")[:8]
    suffix = secrets.token_hex(2).upper()
    return f"REF{base}{suffix}"


def _week_label(monday: datetime) -> str:
    month_names = ["jan", "fev", "mar", "abr", "mai", "jun",
                   "jul", "ago", "set", "out", "nov", "dez"]
    sunday = monday + timedelta(days=6)
    week_num = monday.isocalendar()[1]
    return (f"Semana {week_num} ({monday.day} {month_names[monday.month-1]}"
            f" - {sunday.day} {month_names[sunday.month-1]})")


# ─── Endpoint: Auto-cadastro ─────────────────────────────────────────

@router.post("/register", response_model=PartnerRegisterResponse)
async def partner_register(
    data: PartnerRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Auto-cadastro público para a página de afiliados."""

    # Validar email
    normalized_email = data.email.lower().strip()
    existing = await db.execute(
        select(Partner).where(Partner.email == normalized_email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Este email já está cadastrado como parceiro")

    # Gerar código único (tenta até achar único)
    for _ in range(10):
        ref_code = _generate_ref_code(data.name)
        dup = await db.execute(select(Partner).where(Partner.ref_code == ref_code))
        if not dup.scalar_one_or_none():
            break
    else:
        raise HTTPException(status_code=500, detail="Erro ao gerar código único")

    # Criar Partner (pendente — admin precisa aprovar)
    partner = Partner(
        user_id=None,  # sem usuário ainda — cria quando aprovar
        name=data.name.strip(),
        email=normalized_email,
        ref_code=ref_code,
        commission_rate=5.0,
        pix_key=data.pix_key,
        notes=data.notes,
        is_active=False,  # pendente de aprovação
    )
    db.add(partner)
    await db.flush()

    referral_link = f"https://cloustore.online/register?ref={ref_code}"

    return PartnerRegisterResponse(
        success=True,
        ref_code=ref_code,
        referral_link=referral_link,
        message="Cadastro recebido! O administrador vai analisar e ativar seu acesso em breve.",
    )


# ─── Endpoint: Dashboard do parceiro (próprias estatísticas) ──────────

@router.get("/my-stats", response_model=PartnerMyStatsResponse)
async def partner_my_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Retorna estatísticas completas para o dashboard do parceiro."""

    # Buscar registro de Partner
    result = await db.execute(
        select(Partner).where(Partner.user_id == current_user.id)
    )
    partner = result.scalar_one_or_none()

    if not partner:
        # Verificar se é parceiro ainda sem user_id
        result2 = await db.execute(
            select(Partner).where(Partner.email == current_user.email)
        )
        partner = result2.scalar_one_or_none()

    if not partner:
        raise HTTPException(status_code=403, detail="Você não é um revendedor cadastrado")

    if not partner.is_active:
        raise HTTPException(status_code=403, detail="Seu cadastro como revendedor está pendente de aprovação")

    app_url = "https://cloustore.online"
    referral_link = f"{app_url}/register?ref={partner.ref_code}"

    # Buscar referrals
    ref_result = await db.execute(
        select(Referral).where(Referral.referrer_id == current_user.id)
    )
    referrals = ref_result.scalars().all()
    total_referred = len(referrals)

    referred_ids = [r.referred_id for r in referrals]

    # Total gasto pelos indicados
    total_spent = 0.0
    if referred_ids:
        spent = await db.execute(
            select(func.coalesce(func.sum(Order.charge), 0))
            .where(
                Order.user_id.in_(referred_ids),
                Order.status.in_([OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS,
                                  OrderStatus.PROCESSING, OrderStatus.PARTIAL]),
            )
        )
        total_spent = round(float(spent.scalar() or 0), 2)

    # Calcular tier
    tier = get_tier(total_spent)
    effective_rate = tier.rate  # usa tier rate, não a fixa do partner

    # Comissão usando a taxa do tier
    commission_due = round(total_spent * effective_rate / 100, 2)

    # Total já pago
    paid = await db.execute(
        select(func.coalesce(func.sum(PartnerPayout.amount), 0))
        .where(PartnerPayout.partner_id == current_user.id)
    )
    paid_out = round(float(paid.scalar() or 0), 2)
    balance_due = round(commission_due - paid_out, 2)

    # Quebra semanal
    month_names = ["jan", "fev", "mar", "abr", "mai", "jun",
                   "jul", "ago", "set", "out", "nov", "dez"]
    weeks_map: dict[str, dict] = {}

    # Buscar pedidos dos indicados
    referred_orders = []
    if referred_ids:
        orders_result = await db.execute(
            select(Order).where(
                Order.user_id.in_(referred_ids),
                Order.status.in_([OrderStatus.COMPLETED, OrderStatus.IN_PROGRESS,
                                  OrderStatus.PROCESSING, OrderStatus.PARTIAL]),
            ).order_by(Order.created_at.desc())
        )
        referred_orders = orders_result.scalars().all()

    orders_by_user: dict[int, list[Order]] = defaultdict(list)
    for o in referred_orders:
        orders_by_user[o.user_id].append(o)

    for ref in referrals:
        ref_dt = ref.created_at
        if ref_dt.tzinfo:
            ref_dt = ref_dt.astimezone(timezone.utc)
        monday = ref_dt - timedelta(days=ref_dt.weekday())
        week_key = monday.strftime("%Y-%m-%d")
        if week_key not in weeks_map:
            weeks_map[week_key] = {
                "week_start": week_key,
                "week_label": _week_label(monday),
                "new_referrals": 0,
                "active_referrals": set(),
                "total_spent": 0.0,
            }
        weeks_map[week_key]["new_referrals"] += 1

        user_orders = orders_by_user.get(ref.referred_id, [])
        if user_orders:
            weeks_map[week_key]["active_referrals"].add(ref.referred_id)
        for o in user_orders:
            odt = o.created_at
            if odt.tzinfo:
                odt = odt.astimezone(timezone.utc)
            om = odt - timedelta(days=odt.weekday())
            owk = om.strftime("%Y-%m-%d")
            if owk not in weeks_map:
                weeks_map[owk] = {
                    "week_start": owk,
                    "week_label": _week_label(om),
                    "new_referrals": 0,
                    "active_referrals": set(),
                    "total_spent": 0.0,
                }
            weeks_map[owk]["total_spent"] += o.charge

    sorted_weeks = sorted(weeks_map.values(), key=lambda w: w["week_start"], reverse=True)
    weeks_data = [
        WeekSummary(
            week_start=w["week_start"],
            week_label=w["week_label"],
            new_referrals=w["new_referrals"],
            active_referrals=len(w["active_referrals"]),
            total_spent=round(w["total_spent"], 2),
            commission=round(w["total_spent"] * effective_rate / 100, 2),
        )
        for w in sorted_weeks
    ]

    nxt = next_tier(total_spent)

    return PartnerMyStatsResponse(
        partner_name=partner.name,
        ref_code=partner.ref_code,
        referral_link=referral_link,
        pix_key=partner.pix_key,
        commission_rate=effective_rate,
        tier=TierInfo(
            name=tier.name,
            rate=tier.rate,
            sales_for_tier=total_spent,
            min_sales=tier.min_sales,
            max_sales=tier.max_sales,
            next_tier_name=nxt.name if nxt else None,
            sales_to_next=sales_to_next_tier(total_spent) if nxt else None,
            next_tier_rate=nxt.rate if nxt else None,
        ),
        total_referred=total_referred,
        total_spent=total_spent,
        commission_due=commission_due,
        paid_out=paid_out,
        balance_due=balance_due,
        weeks=weeks_data,
    )