from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.deposit import Deposit, DepositStatus
from app.models.transaction import Transaction, TransactionType
from app.schemas.deposit import DepositCreate, DepositResponse
from datetime import datetime, timedelta, timezone
import uuid
from typing import Optional

router = APIRouter(prefix="/api/deposits", tags=["deposits"])


@router.post("", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    data: DepositCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.amount < 1:
        raise HTTPException(status_code=400, detail="Valor mínimo de depósito é R$ 1,00")

    fee = round(data.amount * 0.01, 2)  # 1% de taxa
    net_amount = round(data.amount - fee, 2)

    # Gerar QR Code Pix simulado (em produção usaria API Mercado Pago)
    external_id = f"clou_{uuid.uuid4().hex[:16]}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    deposit = Deposit(
        user_id=current_user.id,
        amount=data.amount,
        fee=fee,
        net_amount=net_amount,
        payment_method="pix",
        status=DepositStatus.PENDING,
        external_id=external_id,
        pix_qr_text=f"00020126580014br.gov.bcb.pix0136{external_id}520400005303986540{data.amount:.2f}5802BR5913ClouPainel6008SaoPaulo62070503***6304ABCD",
        pix_qr_code="",  # Em produção: gerar QR Code real da API MP
        expires_at=expires_at,
    )
    db.add(deposit)
    await db.flush()
    await db.refresh(deposit)

    return deposit


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


# Webhook simulado para testes (em produção viria do Mercado Pago)
@router.post("/webhook/pix")
async def pix_webhook(
    data: dict,
    db: AsyncSession = Depends(get_db),
):
    external_id = data.get("external_id")
    status_webhook = data.get("status", "paid")

    result = await db.execute(
        select(Deposit).where(Deposit.external_id == external_id)
    )
    deposit = result.scalar_one_or_none()
    if not deposit:
        raise HTTPException(status_code=404, detail="Depósito não encontrado")

    if status_webhook == "paid" and deposit.status == DepositStatus.PENDING:
        deposit.status = DepositStatus.PAID
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
