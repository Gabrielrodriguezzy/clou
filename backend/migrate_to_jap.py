#!/usr/bin/env python3
"""
Migração completa: SMMPanel.com → JustAnotherPanel (JAP)
Atualiza provider, mapeamentos e preços in-place. Preserva pedidos existentes.
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import async_session_factory, init_db
from app.models.provider import Provider
from app.models.provider_service import ProviderService
from app.models.service import Service
from sqlalchemy import select, delete

CAMBIO = 5.50
JAP_API_KEY = "54c8bdf3b400bc18e338a1478c035a54"

# service_id: (jap_id, cost_usd, new_margin_pct)
NEW_DATA = {
    1:  (8096, 0.7938, 60),   # Seguidores Brasil (10K/dia)
    2:  (720, 0.2125, 120),   # Seguidores Mundiais (100K/dia)
    3:  (8095, 0.8125, 80),   # Seguidores Brasil Feminino (Auto-Refill 30D)
    4:  (720, 0.2125, 120),  # Seguidores Mundiais -> Worldwide followers
    5:  (8216, 0.0125, 600),  # Curtidas (300K/dia) -> IG Likes rapido
    6:  (4265, 0.4038, 60),   # Curtidas Brasileiras (30d Refill)
    7:  (2260, 0.0313, 350),  # Vis TikTok Ultrafast
    8:  (10022, 0.0188, 500), # Curtidas TikTok (25K/dia)
    9:  (10023, 0.0200, 400), # Curtidas TikTok 30d Refill
    10: (8777, 1.25, 100),    # Seg TikTok 30d Refill
    11: (8040, 0.5250, 120),  # Vis YouTube 365d Refill
    12: (6298, 0.5400, 100),  # Vis YouTube 50K/dia
    13: (3519, 12.50, 45),    # Inscritos YouTube 30d Refill
    14: (7381, 0.0063, 500),  # Vis Telegram Posts Non Drop
    15: (8523, 0.29, 80),     # Membros Telegram 30d Refill
    16: (3455, 5.3148, 40),   # Vis YouTube BR Discovery
    17: (8407, 0.0029, 800),  # Vis Telegram Mais Barato
    18: (8096, 0.7938, 80),   # Seguidores Brasil (20K/dia)
    19: (8777, 1.25, 100),    # Seg TikTok HQ
}


async def migrate():
    await init_db()
    async with async_session_factory() as db:
        print("=" * 60)
        print("  MIGRAÇÃO SMMPanel.com → JustAnotherPanel (JAP)")
        print("=" * 60)

        # 1. Provider — atualizar o existente
        r = await db.execute(select(Provider).where(Provider.name == "SMMPanel.com"))
        provider = r.scalar_one_or_none()
        if provider:
            old_name = provider.name
            provider.name = "JustAnotherPanel"
            provider.api_url = "https://justanotherpanel.com/api/v2"
            provider.api_key = JAP_API_KEY
            provider.description = "JAP - 5.797 serviços SMM (antigo SMMPanel.com)"
            print(f"  ✅ Provider '{old_name}' → 'JustAnotherPanel' atualizado")
        else:
            # Pode já ter sido renomeado em tentativa anterior
            r2 = await db.execute(select(Provider).where(Provider.name.like("%JustAnother%")))
            provider = r2.scalar_one_or_none()
            if not provider:
                provider = Provider(
                    name="JustAnotherPanel",
                    api_url="https://justanotherpanel.com/api/v2",
                    api_key=JAP_API_KEY,
                    description="JAP - 5.797 serviços SMM",
                    is_active=True, priority=1,
                )
                db.add(provider)
                print("  ✅ Provider JustAnotherPanel criado")
            else:
                print("  ✅ Provider JustAnotherPanel já existe, reutilizando")
        await db.flush()

        # 2. Limpar mapeamentos antigos deste provider
        await db.execute(
            delete(ProviderService).where(ProviderService.provider_id == provider.id)
        )

        # 3. Atualizar preços dos serviços + novos mapeamentos
        services_updated = 0
        ps_created = 0

        for sid, (jap_id, cost_usd, margin) in NEW_DATA.items():
            # Buscar serviço
            r = await db.execute(select(Service).where(Service.id == sid))
            svc = r.scalar_one_or_none()
            if not svc:
                print(f"  ⚠️ Service ID {sid} não encontrado — pulando")
                continue

            # Calcular novo preço
            cost_brl = cost_usd * CAMBIO
            new_price = round(cost_brl * (1 + margin / 100), 2) if cost_usd > 0 else round(cost_usd * CAMBIO * 2.5, 2)
            old_price = svc.price
            svc.price = new_price
            services_updated += 1

            # Criar mapeamento provider → service
            ps = ProviderService(
                provider_id=provider.id,
                service_id=sid,
                provider_service_id=str(jap_id),
                provider_price=cost_usd,
            )
            db.add(ps)
            ps_created += 1

            arrow = "▼" if new_price < old_price else "▲"
            print(f"  ID {sid:>2}: R${old_price:<6.2f} → R${new_price:<6.2f} {arrow} ({margin}% margem | JAP ID {jap_id})")

        await db.commit()

        print(f"\n{'=' * 60}")
        print(f"✅ MIGRAÇÃO CONCLUÍDA!")
        print(f"{'=' * 60}")
        print(f"  • {services_updated} serviços com novos preços")
        print(f"  • {ps_created} mapeamentos com JAP")
        print(f"  • Provider: JustAnotherPanel (ID {provider.id})")
        print(f"  • API URL: https://justanotherpanel.com/api/v2")
        print(f"  • Saldo atual: $0.00 USD (depositar antes de usar)")
        print()
        print(f"📌 PRÓXIMOS PASSOS:")
        print(f"  1. Depositar saldo na conta JAP")
        print(f"  2. Testar com um pedido de R$ 0,80 (Curtidas Instantâneas)")
        print(f"  3. Verificar status do pedido no dashboard")


if __name__ == "__main__":
    asyncio.run(migrate())