from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user, decode_access_token
from app.core.security_ext import sanitize_text, AuditLogger
from app.models.user import User, UserRole
from app.models.referral import Referral, ReferralStatus
from app.models.partner import Partner
from app.schemas.user import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    UserUpdate, PasswordChange, UserPreferences,
)
from datetime import datetime, timedelta, timezone
from app.core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _create_refresh_token(user_id: int) -> str:
    """Refresh token com expiração mais longa."""
    return create_access_token(
        {"sub": str(user_id), "type": "refresh"},
        expires_delta=timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: Request, data: UserRegister, db: AsyncSession = Depends(get_db)):
    import base64

    # Sanitizar nome
    data.name = sanitize_text(data.name, max_length=100)
    if len(data.name) < 2:
        raise HTTPException(status_code=400, detail="Nome deve ter pelo menos 2 caracteres")

    # Verificar email duplicado (case-insensitive)
    normalized_email = data.email.lower().strip()
    result = await db.execute(select(User).where(User.email == normalized_email))
    if result.scalar_one_or_none():
        AuditLogger.login_attempt(email=normalized_email, success=False, ip=request.client.host if request.client else None)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")

    user = User(
        email=normalized_email,
        password_hash=hash_password(data.password),
        name=data.name,
        role=UserRole.USER,
    )
    db.add(user)
    await db.flush()

    # Processar indicação — suporta ref_code customizado (parceiro) e base64 (padrão)
    referrer_id: Optional[int] = None
    if data.ref_code:
        ref = data.ref_code.strip().upper()
        # 1. Tentar como código de parceiro (custom, ex: "GRUPOJOÃO")
        partner_result = await db.execute(
            select(Partner).where(Partner.ref_code == ref, Partner.is_active == True)
        )
        partner = partner_result.scalar_one_or_none()
        if partner and partner.user_id and partner.user_id != user.id:
            referrer_id = partner.user_id
        else:
            # 2. Fallback: base64 do user_id (padrão)
            try:
                decoded = base64.urlsafe_b64decode(data.ref_code + "==")
                referrer_id = int(decoded.decode())
            except Exception:
                pass  # código inválido, ignorar

        if referrer_id and referrer_id != user.id:
            referrer = await db.get(User, referrer_id)
            if referrer:
                referral = Referral(
                    referrer_id=referrer_id,
                    referred_id=user.id,
                    referred_email=user.email,
                    status=ReferralStatus.PENDING,
                )
                db.add(referral)

    token = create_access_token({"sub": str(user.id)})
    refresh_token = _create_refresh_token(user.id)

    AuditLogger.login_attempt(email=normalized_email, success=True, ip=request.client.host if request.client else None)

    return TokenResponse(access_token=token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db)):
    normalized_email = data.email.lower().strip()
    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password_hash):
        AuditLogger.login_attempt(email=normalized_email, success=False, ip=request.client.host if request.client else None)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha inválidos")

    if not user.is_active:
        AuditLogger.login_attempt(email=normalized_email, success=False, ip=request.client.host if request.client else None)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta bloqueada")

    token = create_access_token({"sub": str(user.id)})
    refresh_token = _create_refresh_token(user.id)

    AuditLogger.login_attempt(email=normalized_email, success=True, ip=request.client.host if request.client else None)

    return TokenResponse(access_token=token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    """Troca refresh token por um novo access token + refresh token (rotação)."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token não fornecido")
    
    token = auth_header.replace("Bearer ", "")
    payload = decode_access_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token inválido ou expirado")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    # Verificar se usuário ainda existe
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuário não encontrado ou inativo")
    
    # Rotação: novo access + novo refresh (anterior morre)
    new_token = create_access_token({"sub": str(user.id)})
    new_refresh = _create_refresh_token(user.id)
    
    AuditLogger.log("token_refresh", user_id=user.id, email=user.email)
    
    return TokenResponse(access_token=new_token, refresh_token=new_refresh)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Logout: cliente deve descartar o token. 
    Para stateless JWT não podemos invalidar server-side sem blacklist,
    mas o refresh token de curta duração + rotação mitiga o risco."""
    AuditLogger.log("logout", user_id=current_user.id, email=current_user.email)
    return {"message": "Logout realizado com sucesso"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.name is not None:
        sanitized = sanitize_text(data.name, max_length=100)
        if len(sanitized) < 2:
            raise HTTPException(status_code=400, detail="Nome deve ter pelo menos 2 caracteres")
        current_user.name = sanitized
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.post("/change-password")
async def change_password(
    request: Request,
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="A nova senha deve ser diferente da atual")
    current_user.password_hash = hash_password(data.new_password)
    await db.flush()
    
    AuditLogger.log("password_change", user_id=current_user.id, email=current_user.email)
    
    return {"message": "Senha alterada com sucesso"}


@router.get("/preferences")
async def get_preferences(current_user: User = Depends(get_current_user)):
    return {
        "email_notifications": current_user.email_notifications,
        "marketing_emails": current_user.marketing_emails,
    }


@router.put("/preferences")
async def update_preferences(
    data: UserPreferences,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.email_notifications is not None:
        current_user.email_notifications = data.email_notifications
    if data.marketing_emails is not None:
        current_user.marketing_emails = data.marketing_emails
    await db.flush()
    return {
        "email_notifications": current_user.email_notifications,
        "marketing_emails": current_user.marketing_emails,
    }
