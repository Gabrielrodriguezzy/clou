from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.referral import Referral, ReferralStatus
from app.schemas.referral import ReferralResponse, ReferralStatsResponse

router = APIRouter(prefix="/api/referrals", tags=["referrals"])


@router.get("/stats", response_model=ReferralStatsResponse)
async def get_referral_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Contar indicações do usuário
    result = await db.execute(
        select(Referral).where(Referral.referrer_id == current_user.id)
    )
    referrals = result.scalars().all()

    total_bonus = sum(r.bonus for r in referrals if r.status == ReferralStatus.PAID)

    # Código de referência = user_id codificado (simples)
    import base64
    ref_code = base64.urlsafe_b64encode(str(current_user.id).encode()).decode().rstrip("=")

    app_url = "https://clou.gg"
    referral_link = f"{app_url}/register?ref={ref_code}"

    return ReferralStatsResponse(
        total_referrals=len(referrals),
        total_bonus=total_bonus,
        referral_code=ref_code,
        referral_link=referral_link,
    )


@router.get("", response_model=list[ReferralResponse])
async def get_referrals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Referral)
        .where(Referral.referrer_id == current_user.id)
        .order_by(Referral.created_at.desc())
    )
    return result.scalars().all()
