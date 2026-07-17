import secrets
import logging
from typing import Optional
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


def _generate_secret_key() -> str:
    """Gera uma SECRET_KEY aleatória de 64 caracteres hex."""
    return secrets.token_hex(32)


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Clou"
    APP_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://clou:clou_secret@postgres:5432/clou"

    # Redis
    REDIS_URL: str = "redis://redis:6379/0"

    # Security
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24h
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS - lista separada por vírgulas
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # Rate limiting
    RATE_LIMIT_AUTH: str = "10/minute"       # login/register
    RATE_LIMIT_GENERAL: str = "60/minute"    # demais endpoints

    # Mercado Pago
    MERCADO_PAGO_ACCESS_TOKEN: Optional[str] = None
    MERCADO_PAGO_WEBHOOK_SECRET: Optional[str] = None
    MERCADO_PAGO_INTEGRATOR_ID: Optional[str] = None
    MERCADO_PAGO_SANDBOX: bool = True

    # SMM Providers
    SMM_PROVIDER_API_URL: Optional[str] = None
    SMM_PROVIDER_API_KEY: Optional[str] = None

    # Pix provider (mock | mercadopago)
    PIX_PROVIDER: str = "mock"

    # Webhook secret for Pix
    PIX_WEBHOOK_SECRET: str = ""

    model_config = {"env_file": "../.env", "case_sensitive": True}


def _resolve_settings() -> Settings:
    s = Settings()
    # Se SECRET_KEY ainda é o placeholder, gerar automática e avisar
    if s.SECRET_KEY == "change-me-to-a-random-secret-key":
        s.SECRET_KEY = _generate_secret_key()
        logger.warning(
            "SECRET_KEY não definida no .env — usando chave gerada aleatoriamente. "
            "Defina SECRET_KEY no .env para manter sessões entre restart do servidor."
        )
    return s


settings = _resolve_settings()
