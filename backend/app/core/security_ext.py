"""Módulo de segurança do Clou.
Rate limiting, sanitização, logs de auditoria, criptografia.
"""
import re
import json
import base64
import logging
from datetime import datetime, timezone
from typing import Optional

from slowapi import Limiter
from slowapi.util import get_remote_address
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

logger = logging.getLogger("clou.security")

# ─── Rate Limiter ─────────────────────────────────────────────────────
# Compartilhado via main.py (injetado como dependência)
limiter = Limiter(key_func=get_remote_address)

# ─── Sanitização ──────────────────────────────────────────────────────

# Padrões de XSS
_XSS_PATTERN = re.compile(r"<[^>]*>|javascript:|on\w+\s*=|data:\s*text/html", re.IGNORECASE)
# Padrões de path traversal
_PATH_TRAVERSAL = re.compile(r"\.\./|\.\.\\|~[/\\]|%2e%2e", re.IGNORECASE)
# URLs permitidas (apenas http/https)
_VALID_URL = re.compile(r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE)


def sanitize_text(text: str, max_length: int = 500) -> str:
    """Remove tags HTML, javascript: e on* handlers de texto livre."""
    if not text:
        return text
    cleaned = _XSS_PATTERN.sub("", text.strip())
    return cleaned[:max_length]


def validate_link(link: str) -> bool:
    """Valida se o link é uma URL http/https válida e não tem path traversal."""
    if not link or len(link) > 2048:
        return False
    if _PATH_TRAVERSAL.search(link):
        return False
    return bool(_VALID_URL.match(link.strip()))


def sanitize_filename_component(name: str) -> str:
    """Remove caracteres perigosos de nomes (ex: nomes de arquivo)."""
    return re.sub(r'[^\w\s\-.,()]', '', name.strip())[:100]


# ─── Criptografia para secrets em repouso ─────────────────────────────

def _derive_key(master_key: str, salt: bytes = b"clou_secrets_v1") -> bytes:
    """Deriva uma chave AES-256 a partir da SECRET_KEY do app."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=600_000,
    )
    return kdf.derive(master_key.encode())


def encrypt_secret(plaintext: str, master_key: str) -> str:
    """Criptografa um secret (ex: API key) usando a SECRET_KEY do app."""
    key = _derive_key(master_key)
    f = Fernet(base64.urlsafe_b64encode(key))
    return f.encrypt(plaintext.encode()).decode()


def decrypt_secret(ciphertext: str, master_key: str) -> str:
    """Descriptografa um secret. Se não estiver criptografado, retorna como está."""
    try:
        key = _derive_key(master_key)
        f = Fernet(base64.urlsafe_b64encode(key))
        return f.decrypt(ciphertext.encode()).decode()
    except (Exception, InvalidToken):
        # Pode não estar criptografado (seed inicial, etc)
        return ciphertext


# ─── Audit Log ────────────────────────────────────────────────────────

class AuditLogger:
    """Log estruturado de eventos de segurança."""

    @staticmethod
    def log(event: str, user_id: Optional[int] = None, email: Optional[str] = None,
            ip: Optional[str] = None, detail: Optional[str] = None, extra: Optional[dict] = None):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event,
            "user_id": user_id,
            "email": email,
            "ip": ip,
            "detail": detail,
        }
        if extra:
            entry.update(extra)
        logger.warning(f"AUDIT: {json.dumps(entry, default=str)}")

    @staticmethod
    def login_attempt(email: str, success: bool, ip: Optional[str] = None):
        AuditLogger.log(
            event="login_attempt",
            email=email,
            ip=ip,
            detail="success" if success else "failed",
        )

    @staticmethod
    def admin_action(admin_id: int, admin_email: str, action: str, target: str):
        AuditLogger.log(
            event="admin_action",
            user_id=admin_id,
            email=admin_email,
            detail=f"{action} on {target}",
        )

    @staticmethod
    def suspicious_request(ip: str, path: str, reason: str):
        AuditLogger.log(
            event="suspicious_request",
            ip=ip,
            detail=f"{reason} - {path}",
        )
