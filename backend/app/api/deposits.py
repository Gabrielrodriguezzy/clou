from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.core.security_ext import AuditLogger
from app.models.user import User
from app.models.deposit import Deposit, DepositStatus
from app.models.transaction import Transaction, TransactionType
from app.schemas.deposit import DepositCreate, DepositResponse
from app.services.pix_provider import get_pix_provider, MockPixProvider
from app.core.config import settings
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/deposits", tags=["deposits"])


@router.post("", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    data: DepositCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        if data.amount < 1.5:
            raise HTTPException(status_code=400, detail="Valor mínimo de depósito é R$ 1,50")

        fee = round(data.amount * 0.01, 2)
        net_amount = round(data.amount - fee, 2)

        external_id = f"clou_{uuid.uuid4().hex[:16]}"
        pix_provider = get_pix_provider(settings.model_dump())

        if isinstance(pix_provider, MockPixProvider):
            payment = pix_provider.create_payment(amount=data.amount, external_id=external_id)
        else:
            try:
                payment = await pix_provider.create_payment(
                    amount=data.amount,
                    external_id=external_id,
                    payer_email=current_user.email,
                )
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"Gateway: {str(e)[:200]}")

        deposit = Deposit(
            user_id=current_user.id,
            amount=data.amount,
            fee=fee,
            net_amount=net_amount,
            payment_method="pix",
            status=DepositStatus.PENDING,
            external_id=external_id,
            pix_qr_text=payment.get("pix_qr_text", ""),
            pix_qr_code=payment.get("pix_qr_code", ""),
            payment_data=payment.get("payment_data"),
            expires_at=payment.get("expires_at"),
        )
        db.add(deposit)
        await db.flush()
        await db.refresh(deposit)
        return deposit
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)[:200]}")


@router.get("", response_model=list[DepositResponse])
async def list_deposits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Deposit)
        .where(Deposit.user_id == current_user.id)
        .order_by(Deposit.created_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.get("/{deposit_id}", response_model=DepositResponse)
async def get_deposit(
    deposit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Deposit).where(Deposit.id == deposit_id, Deposit.user_id == current_user.id)
    )
    deposit = result.scalar_one_or_none()
    if not deposit:
        raise HTTPException(status_code=404, detail="Depósito não encontrado")
    return deposit


# Webhook Pix (funciona com mock e preparado para Mercado Pago real)
@router.post("/webhook/pix")
async def pix_webhook(
    request: Request,
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    # Verificar assinatura do webhook (se configurada)
    webhook_secret = settings.PIX_WEBHOOK_SECRET
    if webhook_secret:
        signature = request.headers.get("X-Signature", "")
        import hashlib, hmac
        body = await request.body()
        expected = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(f"sha256={expected}", signature):
            AuditLogger.suspicious_request(
                ip=request.client.host if request.client else "unknown",
                path="/api/deposits/webhook/pix",
                reason="invalid webhook signature",
            )
            raise HTTPException(status_code=403, detail="Assinatura inválida")

    pix_provider = get_pix_provider(settings.model_dump())
    
    # Chamada async para provider real
    if isinstance(pix_provider, MockPixProvider):
        result = pix_provider.handle_webhook(data)
    else:
        result = await pix_provider.handle_webhook(data)

    external_id = result.get("external_id", data.get("external_id", ""))
    status_webhook = result.get("status", "paid")

    if not external_id:
        raise HTTPException(status_code=400, detail="external_id não fornecido")

    deposit_result = await db.execute(
        select(Deposit).where(Deposit.external_id == external_id)
    )
    deposit = deposit_result.scalar_one_or_none()
    if not deposit:
        raise HTTPException(status_code=404, detail="Depósito não encontrado")

    if status_webhook == "paid" and deposit.status == DepositStatus.PENDING:
        deposit.status = DepositStatus.PAID
        deposit.paid_at = result.get("paid_at")
        if not deposit.paid_at:
            deposit.paid_at = datetime.now(timezone.utc)
        await db.flush()

        # Creditar saldo
        user_result = await db.execute(select(User).where(User.id == deposit.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            balance_before = user.balance
            user.balance = round(user.balance + deposit.net_amount, 2)

            tx = Transaction(
                user_id=user.id,
                type=TransactionType.DEPOSIT,
                amount=deposit.net_amount,
                balance_before=balance_before,
                balance_after=user.balance,
                description=f"Depósito via Pix - R$ {deposit.amount:.2f}",
                reference_type="deposit",
                reference_id=deposit.id,
            )
            db.add(tx)

        deposit.status = DepositStatus.COMPLETED

    return {"status": "ok"}
