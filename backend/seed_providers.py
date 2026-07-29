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
        result = await db.execute(select(Provider).where(Provider.name == "JustAnotherPanel"))
        if result.scalar_one_or_none():
            print("⚠️ Provedor JustAnotherPanel já existe. Pulando.")
            return

        # Criar provedor
        provider = Provider(
            name="JustAnotherPanel",
            api_url="https://justanotherpanel.com/api/v2",
            api_key="54c8bdf3b400bc18e338a1478c035a54",
            description="Provedor principal - JAP: seguidores, curtidas, visualizações e mais (5.797 serviços)",
            is_active=True,
            priority=1,
        )
        db.add(provider)
        await db.flush()

        # Mapeamento: service_id -> (provider_service_id, provider_price)
        # Fonte: https://justanotherpanel.com/api/v2
        mapping = {
            1: (8096, 0.7938),   # Seguidores Brasileiros -> BR 10K/day No Refill
            2: (720, 0.2125),    # Seguidores Mundiais -> Mundial
            3: (8095, 0.8125),   # Seguidores BR Feminino -> BR Auto-Refill 30D
            4: (720, 0.2125),    # Seguidores Mundiais -> Worldwide
            5: (8216, 0.0125),   # Curtidas Instantâneas -> IG Likes rapido
            6: (4265, 0.4038),   # Curtidas Brasileiras -> BR Likes Refill 30D
            7: (2260, 0.0313),   # Vis TikTok -> Ultrafast
            8: (10022, 0.0188),  # Curtidas TikTok -> Likes Refill No
            9: (10023, 0.0200),  # Curtidas TikTok 30d Refill -> Likes Refill 30D
            10: (8777, 1.25),    # Seg TikTok -> Followers Refill 30D
            11: (8040, 0.5250),  # Vis YouTube Suggested -> Views 365D Refill
            12: (6298, 0.5400),  # Vis YouTube 50K/dia -> Views 10K
            13: (3519, 12.50),   # Inscritos YouTube -> Subs Refill 30D
            14: (7381, 0.0063),  # Vis Telegram Posts -> Views Fast Non Drop
            15: (8523, 0.29),    # Membros Telegram -> Members Refill 30D
            16: (3455, 5.3148),  # Vis YouTube BR -> BR YT Discovery ADS
            17: (8407, 0.0029),  # Vis Telegram Barato -> Views 1 Post
            18: (8096, 0.7938),  # Seguidores BR Perfis Reais -> BR No Refill
            19: (8777, 1.25),    # Seg TikTok HQ -> Followers Refill 30D
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
        print(f"✅ Provedor JustAnotherPanel (JAP) configurado com {len(mapping)} serviços mapeados!")


if __name__ == "__main__":
    asyncio.run(seed_providers())
