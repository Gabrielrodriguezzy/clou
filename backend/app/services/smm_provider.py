"""Cliente para API do SMMPanel.com — com retry e timeout configuráveis."""
import asyncio
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

SMMPANEL_API_URL = "https://justanotherpanel.com/api/v2"

# Configurações de resiliência
MAX_RETRIES = 2
RETRY_BACKOFF = 3.0  # segundos
HTTP_TIMEOUT = 60.0


class SMMPanelClient:
    """Cliente para integrar com o provedor JustAnotherPanel (JAP)"""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def _post(self, **params) -> dict:
        """Envia requisição POST para a API com retry automático."""
        params["key"] = self.api_key

        last_error = None
        for attempt in range(1, MAX_RETRIES + 2):  # 1 tentativa + retries
            try:
                async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
                    resp = await client.post(SMMPANEL_API_URL, data=params)
                    resp.raise_for_status()
                    return resp.json()
            except httpx.TimeoutException as e:
                last_error = e
                logger.warning(
                    f"Timeout na API SMMPanel (tentativa {attempt}/{MAX_RETRIES + 1}): {e}"
                )
            except httpx.ConnectError as e:
                last_error = e
                logger.warning(
                    f"Erro de conexão com SMMPanel (tentativa {attempt}/{MAX_RETRIES + 1}): {e}"
                )
            except httpx.HTTPStatusError as e:
                # Erro HTTP não tem retry — é resposta do servidor
                logger.error(f"HTTP {e.response.status_code} da API SMMPanel: {e.response.text[:200]}")
                raise

            if attempt <= MAX_RETRIES:
                await asyncio.sleep(RETRY_BACKOFF * attempt)  # backoff progressivo

        raise last_error or RuntimeError("Falha ao comunicar com SMMPanel após retries")

    async def balance(self) -> dict:
        """Verifica saldo da conta"""
        return await self._post(action="balance")

    async def services(self) -> list[dict]:
        """Lista todos os serviços disponíveis"""
        return await self._post(action="services")

    async def add_order(self, service_id: int, link: str, quantity: int) -> dict:
        """
        Cria um pedido no provedor.
        Retorna: {"order": 123456}
        """
        return await self._post(
            action="add",
            service=service_id,
            link=link,
            quantity=quantity,
        )

    async def order_status(self, order_id: int) -> dict:
        """
        Consulta o status de um pedido.
        Retorno típico: {
            "status": "In progress",
            "start_count": 0,
            "remains": 500,
            "charge": 0.50
        }
        """
        return await self._post(
            action="status",
            order=order_id,
        )

    async def multi_status(self, order_ids: list[int]) -> dict:
        """Consulta status de múltiplos pedidos"""
        return await self._post(
            action="status",
            orders=",".join(str(o) for o in order_ids),
        )
