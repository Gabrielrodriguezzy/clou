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
    Esqueleto para integração real com Mercado Pago.
    Requer credenciais: access_token, webhook_secret, integrator_id.
    """

    def __init__(self, access_token: str, webhook_secret: str, integrator_id: str = ""):
        self.access_token = access_token
        self.webhook_secret = webhook_secret
        self.integrator_id = integrator_id

    def create_payment(
        self,
        amount: float,
        external_id: str,
        description: str = "Depósito Clou",
    ) -> dict:
        """
        Implementação futura:
        1. POST https://api.mercadopago.com/v1/payments
           Headers: Authorization: Bearer {access_token}
           Body: {
             transaction_amount: amount,
             description: description,
             payment_method_id: "pix",
             payer: { email: email_do_cliente }
           }
        2. Extrair: qr_code_base64, qr_code, expiration_date da resposta
        """
        raise NotImplementedError(
            "Mercado Pago ainda não integrado. "
            "Para implementar: "
            "1. Criar credenciais no Mercado Pago (access_token, webhook_secret) "
            "2. Configurar PIX_PROVIDER=mercadopago no .env "
            "3. Completar este método com httpx.post() para a API do MP"
        )

    def handle_webhook(self, data: dict) -> dict:
        """
        Implementação futura:
        1. Validar assinatura do webhook com webhook_secret
        2. Extrair external_id e action (payment.updated, payment.created)
        3. Se action == "payment.updated" e status == "approved":
             retornar status="paid"
        """
        raise NotImplementedError(
            "Webhook do Mercado Pago ainda não implementado. "
            "Configurar endpoint /api/deposits/webhook/pix no MP."
        )


def get_pix_provider(config: dict) -> PixProvider:
    """Factory: retorna o provider baseado na config."""
    provider_name = config.get("PIX_PROVIDER", "mock")
    if provider_name == "mercadopago":
        return MercadoPagoPixProvider(
            access_token=config.get("MERCADO_PAGO_ACCESS_TOKEN", ""),
            webhook_secret=config.get("MERCADO_PAGO_WEBHOOK_SECRET", ""),
            integrator_id=config.get("MERCADO_PAGO_INTEGRATOR_ID", ""),
        )
    return MockPixProvider()
