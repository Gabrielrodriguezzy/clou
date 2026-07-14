from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User, UserRole
from app.schemas.user import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    UserUpdate, PasswordChange, UserPreferences,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email já cadastrado")
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        name=data.name,
        role=UserRole.USER,
    )
    db.add(user)
    await db.flush()
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou senha inválidos")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Conta bloqueada")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(access_token=token)


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
        if len(data.name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Nome deve ter pelo menos 2 caracteres")
        current_user.name = data.name.strip()
    await db.flush()
    await db.refresh(current_user)
    return current_user


@router.post("/change-password")
async def change_password(
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
