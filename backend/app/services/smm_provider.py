"""Cliente para API do SMMPanel.com"""
import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

SMMPANEL_API_URL = "https://smmpanel.com/api/v2"


class SMMPanelClient:
    """Cliente para integrar com o provedor SMMPanel.com"""

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def _post(self, **params) -> dict:
        """Envia requisição POST para a API"""
        params["key"] = self.api_key
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(SMMPANEL_API_URL, data=params)
            resp.raise_for_status()
            return resp.json()

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
