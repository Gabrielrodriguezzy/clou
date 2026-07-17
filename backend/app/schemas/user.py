from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re


class UserRegister(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., max_length=100)
    ref_code: Optional[str] = Field(None, max_length=50)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Senha deve conter pelo menos uma letra maiúscula")
        if not re.search(r"[0-9]", v):
            raise ValueError("Senha deve conter pelo menos um número")
        if not re.search(r"[^a-zA-Z0-9]", v):
            raise ValueError("Senha deve conter pelo menos um caractere especial (!@#$% etc)")
        return v


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    balance: float
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=128)


class UserPreferences(BaseModel):
    email_notifications: Optional[bool] = None
    marketing_emails: Optional[bool] = None
