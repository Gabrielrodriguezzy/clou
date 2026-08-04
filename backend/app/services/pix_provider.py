"""Provedor Pix — abstrato com implementação Mock e preparação para Mercado Pago."""
import uuid
from datetime import datetime, timedelta, timezone
from typing import Protocol, runtime_checkable


@runtime_checkable
class PixProvider(Protocol):
    """Contrato para provedores de pagamento Pix."""

    def create_payment(
        self,
        amount: float,
        external_id: str,
        description: str = "Depósito Clou",
    ) -> dict:
        """
        Cria um pagamento Pix.
        Retorna dict com:
          - pix_qr_code: str (base64 do QR code estático, opcional)
          - pix_qr_text: str (copia-e-cola)
          - expires_at: datetime
        """
        ...

    def handle_webhook(self, data: dict) -> dict:
        """
        Processa webhook de confirmação de pagamento.
        Retorna dict com:
          - external_id: str
          - status: str ("paid" | "failed" | "refunded")
          - paid_at: datetime | None
        """
        ...


class MockPixProvider:
    """Implementação mock para desenvolvimento/teste."""

    def create_payment(
        self,
        amount: float,
        external_id: str,
        description: str = "Depósito Clou",
    ) -> dict:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
        # Gera um texto Pix simulado (formato bruto de QR code)
        pix_text = (
            f"00020126580014br.gov.bcb.pix0136{external_id}"
            f"520400005303986540{amount:.2f}5802BR5913ClouPainel"
            f"6008SaoPaulo62070503***6304ABCD"
        )
        return {
            "pix_qr_code": "",
            "pix_qr_text": pix_text,
            "expires_at": expires_at,
        }

    def handle_webhook(self, data: dict) -> dict:
        external_id = data.get("external_id", "")
        status = data.get("status", "paid")
        paid_at = datetime.now(timezone.utc) if status == "paid" else None
        return {
            "external_id": external_id,
            "status": status,
            "paid_at": paid_at,
        }


class MercadoPagoPixProvider:
    """
    Provedor Pix real via Mercado Pago.
    Gera QR Code dinâmico e processa webhooks de confirmação.
    """

    API_BASE = "https://api.mercadopago.com"

    def __init__(self, access_token: str, webhook_secret: str = "", sandbox: bool = True):
        self.access_token = access_token
        self.webhook_secret = webhook_secret
        self.sandbox = sandbox

    async def create_payment(
        self,
        amount: float,
        external_id: str,
        description: str = "Depósito Clou",
        payer_email: str = "",
    ) -> dict:
        """
        Cria um pagamento Pix via API do Mercado Pago.
        Retorna QR code (base64) + copia-e-cola + expiration.
        """
        import httpx

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Idempotency-Key": external_id,
        }

        body = {
            "transaction_amount": amount,
            "description": description[:255],
            "payment_method_id": "pix",
            "payer": {"email": payer_email or "cliente@clou.app"},
            "date_of_expiration": (
                datetime.now(timezone.utc) + timedelta(minutes=30)
            ).isoformat().replace("+00:00", "Z"),
        }

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.API_BASE}/v1/payments",
                headers=headers,
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()

        transaction_data = data.get("point_of_interaction", {}).get("transaction_data", {})

        return {
            "pix_qr_code": transaction_data.get("qr_code_base64", ""),
            "pix_qr_text": transaction_data.get("qr_code", ""),
            "expires_at": data.get("date_of_expiration"),
            "payment_id": data.get("id"),
            "payment_data": data,
        }

    async def handle_webhook(self, data: dict) -> dict:
        """
        Processa notificação do webhook do Mercado Pago.
        Busca o status real do pagamento na API e retorna.
        """
        import httpx

        # Extrair payment_id da notificação
        payment_id = data.get("data", {}).get("id")
        if not payment_id:
            return {"status": "ignored", "external_id": ""}

        headers = {"Authorization": f"Bearer {self.access_token}"}

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                f"{self.API_BASE}/v1/payments/{payment_id}",
                headers=headers,
            )
            resp.raise_for_status()
            payment = resp.json()

        status = payment.get("status", "")
        external_id = payment.get("external_reference", "") or str(payment.get("id", ""))

        if status == "approved":
            return {
                "external_id": external_id,
                "status": "paid",
                "paid_at": payment.get("date_approved"),
            }
        elif status in ("rejected", "cancelled", "refunded"):
            return {
                "external_id": external_id,
                "status": "failed",
                "paid_at": None,
            }
        else:
            return {
                "external_id": external_id,
                "status": "pending",
                "paid_at": None,
            }


def get_pix_provider(config: dict) -> MercadoPagoPixProvider:
    """Factory: retorna o provider baseado na config.
    Se MERCADO_PAGO_ACCESS_TOKEN estiver presente, usa MP.
    Fallback: tenta carregar de pix_config.json se o token não veio nas env vars."""
    token = config.get("MERCADO_PAGO_ACCESS_TOKEN", "")
    
    # Se não veio das env vars, tentar do arquivo de config local
    if not token or token == "None" or len(token) < 10:
        import json as _json, os
        _cfg_path = os.path.join(os.path.dirname(__file__), "pix_config.json")
        if os.path.exists(_cfg_path):
            with open(_cfg_path) as _f:
                _cfg = _json.load(_f)
            token = _cfg.get("MERCADO_PAGO_ACCESS_TOKEN", token)
    
    if token and token != "None" and len(token) > 10:
        return MercadoPagoPixProvider(
            access_token=token,
            webhook_secret=config.get("MERCADO_PAGO_WEBHOOK_SECRET", ""),
            sandbox=config.get("MERCADO_PAGO_SANDBOX", False),
        )
    return MockPixProvider()
