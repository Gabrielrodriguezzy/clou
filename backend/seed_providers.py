import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import async_session_factory, init_db
from app.core.security import hash_password
from app.models.provider import Provider
from app.models.provider_service import ProviderService
from app.models.service import Service
from sqlalchemy import select


async def seed_providers():
    await init_db()
    async with async_session_factory() as db:
        # Verificar se já existe
        result = await db.execute(select(Provider).where(Provider.name == "SMMPanel.com"))
        if result.scalar_one_or_none():
            print("⚠️ Provedor SMMPanel.com já existe. Pulando.")
            return

        # Criar provedor
        provider = Provider(
            name="SMMPanel.com",
            api_url="https://smmpanel.com/api/v2",
            api_key="e64ff2c1024309b47b97aa4399524479",
            description="Provedor principal - seguidores, curtidas, visualizações e mais",
            is_active=True,
            priority=1,
        )
        db.add(provider)
        await db.flush()

        # Mapeamento: service_id -> (provider_service_id, provider_price)
        mapping = {
            1: (1861, 0.6425),   # Seguidores Brasileiros -> BR 10K/day No Refill
            2: (2085, 0.2234),   # Seguidores Mundiais -> Mundial 500K/day
            3: (1864, 0.3943),   # Seguidores BR + Perfil -> Female BR Refill
            4: (1769, 0.0549),   # Curtidas Brasileiras -> Non Drop Instant
            5: (1718, 0.0579),   # Curtidas Instantâneas -> 100K/hour
            6: (1918, 0.0779),   # (sem mapeamento direto) -> Curtidas HQ
            7: (1984, 0.0539),   # Vis TikTok -> Ultrafast
            8: (1662, 0.3067),   # Curtidas TikTok -> 25K/day
            9: (1663, 0.3171),   # (outro serviço TikTok)
            10: (1980, 3.7525),  # Seg TikTok -> Refill 30d
            11: (1644, 0.7425),  # Vis YouTube BR -> Suggested Lifetime
            12: (1644, 0.7425),  # Vis YouTube Mundial -> Suggested Lifetime
            13: (1976, 14.40),   # Inscritos YouTube -> 30d Refill
            16: (796, 0.0529),   # Membros Telegram -> Post Views 50K/day
        }

        for service_id, (ps_id, price) in mapping.items():
            # Verificar se o service existe
            svc = await db.execute(select(Service).where(Service.id == service_id))
            if not svc.scalar_one_or_none():
                print(f"  ⚠️ Service ID {service_id} não encontrado. Pulando.")
                continue

            ps = ProviderService(
                provider_id=provider.id,
                service_id=service_id,
                provider_service_id=str(ps_id),
                provider_price=price,
            )
            db.add(ps)

        await db.commit()
        print(f"✅ Provedor SMMPanel.com configurado com {len(mapping)} serviços mapeados!")


if __name__ == "__main__":
    asyncio.run(seed_providers())
