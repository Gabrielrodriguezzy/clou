"""Configuração de testes — banco SQLite in-memory + dados básicos."""
import pytest
import pytest_asyncio
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.core.security import hash_password, create_access_token
from app.models.user import User, UserRole
from app.models.platform import Platform
from app.models.service import Service, ServiceStatus
from app.models.coupon import Coupon
from app.models.order import Order
from datetime import datetime, timezone, timedelta


# ─── Engine de teste (SQLite async em memória) ───────────────────

TEST_DATABASE_URL = "sqlite+aiosqlite://"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    echo=False,
)

TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


# ─── Setup/Teardown automático por função de teste ───────────────

@pytest.fixture(autouse=True, scope="function")
async def setup_db():
    """Cria tabelas antes de cada teste e dropa depois."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def _get_test_db() -> AsyncGenerator[AsyncSession, None]:
    """Fornece sessão de teste para o FastAPI (dependency override)."""
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def db() -> AsyncGenerator[AsyncSession, None]:
    """Sessão de banco para testes."""
    async with TestSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Cliente HTTP de teste com banco override."""
    app.dependency_overrides[get_db] = _get_test_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ─── Seeds para testes ───────────────────────────────────────────

@pytest_asyncio.fixture(scope="function")
async def seed_platform(db) -> Platform:
    p = Platform(name="Instagram", slug="instagram", is_active=True, sort_order=1)
    db.add(p)
    await db.flush()
    await db.refresh(p)
    return p


@pytest_asyncio.fixture(scope="function")
async def seed_service(db, seed_platform) -> Service:
    s = Service(
        name="Seguidores Brasil Teste", description="Descrição de teste",
        price=5.50, min_amount=100, max_amount=10000,
        avg_time="24 horas", guarantee="30 dias",
        platform_id=seed_platform.id, status=ServiceStatus.ACTIVE,
        slug="seguidores-brasil-teste", sort_order=1,
    )
    db.add(s)
    await db.flush()
    await db.refresh(s)
    return s


@pytest_asyncio.fixture(scope="function")
async def seed_user(db) -> User:
    u = User(
        email="teste@clou.com", name="Usuário Teste",
        password_hash=hash_password("Teste123!"),
        balance=100.0, role=UserRole.USER, is_active=True,
    )
    db.add(u)
    await db.flush()
    await db.refresh(u)
    return u


@pytest_asyncio.fixture(scope="function")
async def seed_admin(db) -> User:
    u = User(
        email="admin@clou.com", name="Admin Teste",
        password_hash=hash_password("Admin123!"),
        balance=99999.0, role=UserRole.ADMIN, is_active=True,
    )
    db.add(u)
    await db.flush()
    await db.refresh(u)
    return u


@pytest_asyncio.fixture(scope="function")
async def user_token(seed_user) -> str:
    return create_access_token({"sub": str(seed_user.id)})


@pytest_asyncio.fixture(scope="function")
async def admin_token(seed_admin) -> str:
    return create_access_token({"sub": str(seed_admin.id)})


@pytest_asyncio.fixture(scope="function")
async def seed_coupon(db) -> Coupon:
    c = Coupon(
        code="TESTE10", discount_percent=10, max_uses=100, min_amount=1.0,
        is_active=True, used_count=0,
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
    )
    db.add(c)
    await db.flush()
    await db.refresh(c)
    return c


@pytest_asyncio.fixture(scope="function")
async def seed_expired_coupon(db) -> Coupon:
    c = Coupon(
        code="EXPIRADO", discount_percent=50, max_uses=100, min_amount=1.0,
        is_active=True, used_count=0,
        expires_at=datetime.now(timezone.utc) - timedelta(days=1),
    )
    db.add(c)
    await db.flush()
    await db.refresh(c)
    return c
