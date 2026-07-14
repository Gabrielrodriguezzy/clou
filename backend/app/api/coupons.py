from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.coupon import Coupon
from pydantic import BaseModel

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


class CouponApply(BaseModel):
    code: str
    amount: float  # valor do pedido antes do desconto


class CouponResponse(BaseModel):
    code: str
    discount_percent: int
    discount_amount: float
    final_amount: float
    valid: bool

    model_config = {"from_attributes": True}


@router.post("/validate", response_model=CouponResponse)
async def validate_coupon(
    data: CouponApply,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Coupon).where(Coupon.code == data.code.upper().strip()))
    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(status_code=404, detail="Cupom não encontrado")
    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="Cupom inativo")
    if coupon.max_uses > 0 and coupon.used_count >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="Cupom esgotado")
    if coupon.expires_at and coupon.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Cupom expirado")
    if data.amount < coupon.min_amount:
        raise HTTPException(
            status_code=400,
            detail=f"Valor mínimo para este cupom: R$ {coupon.min_amount:.2f}",
        )

    discount = round(data.amount * coupon.discount_percent / 100, 2)
    final = round(data.amount - discount, 2)

    return CouponResponse(
        code=coupon.code,
        discount_percent=coupon.discount_percent,
        discount_amount=discount,
        final_amount=final,
        valid=True,
    )
