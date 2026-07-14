"""Worker para processar pedidos do Clou via provedores SMM."""
import asyncio
import json
import logging
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.core.config import settings
from app.models.order import Order, OrderStatus
from app.models.provider import Provider
from app.models.provider_service import ProviderService
from app.services.smm_provider import SMMPanelClient

logger = logging.getLogger(__name__)


class OrderWorker:
    """Processa pedidos pendentes e atualiza status"""

    def __init__(self):
        self.engine = create_async_engine(
            settings.DATABASE_URL,
            echo=False,
            pool_size=2,
            max_overflow=2,
            pool_timeout=30,
            pool_recycle=300,  # recicla conexões a cada 5 min
        )
        self.session_factory = async_sessionmaker(self.engine, class_=AsyncSession)

    async def process_pending_orders(self):
        """Busca pedidos PENDING e envia para o provedor"""
        async with self.session_factory() as db:
            result = await db.execute(
                select(Order)
                .where(Order.status == OrderStatus.PENDING)
                .order_by(Order.created_at.asc())
                .limit(10)
            )
            orders = result.scalars().all()

            if not orders:
                return 0

            # Buscar provedor ativo com menor prioridade
            provider_result = await db.execute(
                select(Provider)
                .where(Provider.is_active == True)
                .order_by(Provider.priority)
                .limit(1)
            )
            provider = provider_result.scalar_one_or_none()
            if not provider:
                logger.warning("Nenhum provedor ativo configurado")
                return 0

            client = SMMPanelClient(api_key=provider.api_key)
            processed = 0

            for order in orders:
                try:
                    # Buscar mapeamento do serviço
                    ps_result = await db.execute(
                        select(ProviderService)
                        .where(
                            ProviderService.provider_id == provider.id,
                            ProviderService.service_id == order.service_id,
                        )
                    )
                    ps = ps_result.scalar_one_or_none()
                    if not ps:
                        logger.warning(f"Serviço {order.service_id} não mapeado no provedor {provider.id}")
                        order.status = OrderStatus.ERROR
                        order.notes = "Serviço não mapeado no provedor"
                        continue

                    # Enviar pedido ao provedor
                    result = await client.add_order(
                        service_id=ps.provider_service_id,
                        link=order.link,
                        quantity=order.quantity,
                    )

                    provider_order_id = result.get("order")
                    if provider_order_id:
                        order.provider_id = provider.id
                        order.provider_order_id = str(provider_order_id)
                        order.status = OrderStatus.PROCESSING
                        order.cost = round(
                            ps.provider_price * (order.quantity / 1000), 2
                        )
                        logger.info(
                            f"Pedido #{order.id} enviado ao provedor. "
                            f"ID provedor: {provider_order_id}"
                        )
                        processed += 1

                except Exception as e:
                    logger.error(f"Erro ao processar pedido #{order.id}: {e}")
                    order.status = OrderStatus.ERROR
                    order.notes = f"Erro no provedor: {str(e)[:200]}"

            await db.commit()
            return processed

    async def update_order_statuses(self):
        """Atualiza status de pedidos em andamento"""
        async with self.session_factory() as db:
            result = await db.execute(
                select(Order)
                .where(
                    Order.status.in_([OrderStatus.PROCESSING, OrderStatus.IN_PROGRESS]),
                    Order.provider_order_id.isnot(None),
                )
                .limit(50)
            )
            orders = result.scalars().all()

            if not orders:
                return 0

            # Agrupar por provedor
            by_provider: dict[int, list[Order]] = {}
            for order in orders:
                if order.provider_id:
                    by_provider.setdefault(order.provider_id, []).append(order)

            updated = 0
            for provider_id, provider_orders in by_provider.items():
                provider_result = await db.execute(
                    select(Provider).where(Provider.id == provider_id)
                )
                provider = provider_result.scalar_one_or_none()
                if not provider:
                    continue

                client = SMMPanelClient(api_key=provider.api_key)

                # Consultar status em lote
                order_ids = [int(o.provider_order_id) for o in provider_orders if o.provider_order_id]
                try:
                    statuses = await client.multi_status(order_ids)
                except Exception as e:
                    logger.error(f"Erro ao consultar status do provedor {provider_id}: {e}")
                    continue

                for order in provider_orders:
                    if not order.provider_order_id:
                        continue
                    status_data = statuses.get(str(order.provider_order_id), {})
                    new_status = status_data.get("status", "").lower()

                    if "completed" in new_status or "success" in new_status:
                        order.status = OrderStatus.COMPLETED
                        updated += 1
                    elif "processing" in new_status or "progress" in new_status:
                        order.status = OrderStatus.IN_PROGRESS
                        if "remains" in status_data:
                            order.remains = status_data["remains"]
                        if "start_count" in status_data:
                            order.start_count = status_data["start_count"]
                        updated += 1
                    elif "canceled" in new_status or "cancelled" in new_status:
                        order.status = OrderStatus.CANCELLED
                        updated += 1
                    elif "error" in new_status or "refunded" in new_status:
                        order.status = OrderStatus.ERROR
                        updated += 1

            await db.commit()
            return updated

    async def run_once(self):
        """Executa um ciclo completo de processamento"""
        processed = await self.process_pending_orders()
        updated = await self.update_order_statuses()
        return {"processed": processed, "updated": updated}


async def main():
    """Executa o worker uma vez (para usar via cron ou Celery)"""
    worker = OrderWorker()
    result = await worker.run_once()
    logger.info(f"Worker: {result['processed']} novos, {result['updated']} atualizados")
    print(json.dumps(result))
    return result


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
