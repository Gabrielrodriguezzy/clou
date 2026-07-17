from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReferralResponse(BaseModel):
    id: int
    referred_email: str
    bonus: float
    referred_deposit: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReferralStatsResponse(BaseModel):
    total_referrals: int
    total_bonus: float
    referral_code: str
    referral_link: str
