from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DepositCreate(BaseModel):
    amount: float


class DepositResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    fee: float
    net_amount: float
    payment_method: str
    status: str
    pix_qr_code: Optional[str] = None
    pix_qr_text: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PixPaymentResponse(BaseModel):
    deposit_id: int
    qr_code_base64: str
    qr_code_text: str
    amount: float
    expires_at: datetime
