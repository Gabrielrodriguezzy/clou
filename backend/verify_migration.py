#!/usr/bin/env python3
"""Verifica estado pós-migração no banco Neon."""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ["DATABASE_URL"] = "postgresql+asyncpg://neondb_owner:npg_xeKyq3Ai9LRG@ep-misty-dawn-acmmi3rm-pooler.sa-east-1.aws.neon.tech/neondb"

from app.core.database import async_session_factory, init_db
from app.models.provider import Provider
from app.models.service import Service
from app.models.provider_service import ProviderService
from app.models.order import Order
from sqlalchemy import select, func

EXPECTED_PRICES = {
    1: 6.99, 2: 2.57, 3: 8.04, 4: 0.80, 5: 0.80,
    6: 3.55, 7: 0.77, 8: 0.62, 9: 0.55, 10: 13.75,
    11: 6.35, 12: 5.94, 13: 99.69, 14: 0.21, 15: 2.87,
    16: 40.92, 17: 0.14, 18: 7.86, 19: 13.75,
}

EXPECTED_PS = {
    1: 8096, 2: 720, 3: 8095, 4: 1865, 5: 1865,
    6: 4265, 7: 2260, 8: 10022, 9: 10023, 10: 8777,
    11: 8040, 12: 6298, 13: 3519, 14: 7381, 15: 8523,
    16: 3455, 17: 8407, 18: 8096, 19: 8777,
}

async def verify():
    await init_db()
    async with async_session_factory() as db:
        errors = []

        # 1. Provider
        r = await db.execute(select(Provider))
        p = r.scalar_one_or_none()
        if not p:
            errors.append("❌ Provider não encontrado!")
        elif p.name != "JustAnotherPanel":
            errors.append(f"❌ Provider name: {p.name} (esperado JustAnotherPanel)")
        else:
            print(f"✅ Provider: {p.name} | ativo={p.is_active} | URL={p.api_url[:40]}...")

        # 2. Services - check all prices
        svcs = (await db.execute(select(Service).order_by(Service.id))).scalars().all()
        print(f"\n✅ {len(svcs)} serviços no total")

        price_ok = 0
        for s in svcs:
            expected = EXPECTED_PRICES.get(s.id)
            if expected is not None:
                if abs(s.price - expected) < 0.02:
                    price_ok += 1
                else:
                    errors.append(f"❌ Serviço ID {s.id}: preço R${s.price} (esperado R${expected})")

        print(f"✅ {price_ok}/{len(EXPECTED_PRICES)} preços corretos")

        # 3. Provider Services
        ps_list = (await db.execute(
            select(ProviderService).where(ProviderService.provider_id == p.id)
        )).scalars().all()
        print(f"✅ {len(ps_list)} mapeamentos provider_service")

        ps_ok = 0
        for ps in ps_list:
            expected_id = EXPECTED_PS.get(ps.service_id)
            if expected_id is not None and int(ps.provider_service_id) == expected_id:
                ps_ok += 1
            elif expected_id is not None:
                errors.append(f"❌ PS service {ps.service_id}: JAP ID {ps.provider_service_id} (esperado {expected_id})")

        print(f"✅ {ps_ok}/{len(EXPECTED_PS)} mapeamentos corretos")

        # 4. Orders still intact
        o_count = (await db.execute(select(func.count()).select_from(Order))).scalar()
        print(f"✅ {o_count} pedidos preservados")

        # 5. Summary services
        print(f"\n{'─'*60}")
        print(f"{'ID':>3} {'Nome':<40} {'Preço':>8} {'JAP ID':>7}")
        print(f"{'─'*60}")
        for s in svcs:
            ps = next((x for x in ps_list if x.service_id == s.id), None)
            jap = ps.provider_service_id if ps else "—"
            print(f"{s.id:>3} {s.name[:40]:<40} R${s.price:<6.2f} {jap:>7}")

        if errors:
            print(f"\n❌ {len(errors)} ERRO(s):")
            for e in errors:
                print(f"  {e}")
        else:
            print(f"\n✅ Tudo certo — 0 erros!")

asyncio.run(verify())