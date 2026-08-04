#!/usr/bin/env python3
"""Migra Clou para SmmOficial como único provedor.
Remove MTP e JAP, adiciona SmmOficial, desativa serviços sem mapping.
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import async_session_factory, init_db
from app.models.provider import Provider
from app.models.provider_service import ProviderService
from app.models.service import Service
from app.models.order import OrderStatus
from sqlalchemy import select, delete, update

API_URL = "https://smmoficial.com/api/v2"
API_KEY = "ce9e9c57a3a90c0c9808864e4963763a"

# Mapeamento: service_id -> (smmoficial_id, price_brl_1k, nome_servico_provedor)
MAPPING = {
    # ── Instagram ──
    1: (1048, 3.00, "Seguidores Brasileiros R30"),       # Seg BR 10K/dia
    2: (301,  2.98, "Seguidores BR e mix R60"),          # Seg BR Feminino
    3: (1048, 3.00, "Seguidores Brasileiros R30"),       # Seg BR 20K/dia
    4: (301,  2.98, "Seguidores BR e mix R60"),          # Seg Mundiais
    5: (1002, 0.30, "Curtidas Permanentes S1"),          # Curtidas Instantâneas
    6: (1002, 0.30, "Curtidas Permanentes S1"),          # Curtidas BR 30d
    7: (1002, 0.30, "Curtidas Permanentes S1"),          # Curtidas 300K/dia
    8: (996,  0.06, "Visualizações REELS S1"),           # Visualizações Reels (sub para Stories)
    9: (996,  0.06, "Visualizações REELS S1"),           # Visualizações Reels

    # ── TikTok ──
    10: (1028, 2.92, "VIEWS TIKTOK 01"),                 # Vis TikTok Ultrafast
    11: (975,  1.13, "TikTok Curtidas Mistas Reais R30"),# Curtidas TikTok 30d
    12: (975,  1.13, "TikTok Curtidas Mistas Reais R30"),# Curtidas TikTok 25K/dia
    13: (913, 18.93, "Seguidores TikTok BR R30"),         # Seg TikTok 30d
    14: (913, 18.93, "Seguidores TikTok BR R30"),         # Seg TikTok HQ

    # ── YouTube ── NÃO TEM suporte real
    # ── Telegram ── NÃO TEM suporte real
}

# Serviços SEM mapping na SmmOficial (serão desativados)
SERVICOS_SEM_SUPORTE = [15, 16, 17, 18, 19, 20, 21,  # YouTube + Telegram
                        8]  # Stories (não tem na SmmOficial)


async def seed():
    await init_db()
    async with async_session_factory() as db:
        # 1. DESATIVAR provedores antigos
        for nome in ["MorethanPanel", "JustAnotherPanel"]:
            r = await db.execute(select(Provider).where(Provider.name == nome))
            p = r.scalar_one_or_none()
            if p:
                p.is_active = False
                print(f"🔴 {nome} desativado (is_active=False)")

        # 2. Remover mappings antigos
        await db.execute(delete(ProviderService))
        print("🧹 Mappings antigos removidos")

        # 3. CRIAR SmmOficial
        r = await db.execute(select(Provider).where(Provider.name == "SmmOficial"))
        prov = r.scalar_one_or_none()
        if not prov:
            prov = Provider(
                name="SmmOficial",
                api_url=API_URL,
                api_key=API_KEY,
                description="Provedor principal - serviços SMM em R$ (brasileiro)",
                is_active=True,
                priority=1,
            )
            db.add(prov)
            await db.flush()
            print(f"✅ SmmOficial criado (id={prov.id})")
        else:
            prov.api_url = API_URL
            prov.api_key = API_KEY
            prov.is_active = True
            prov.priority = 1
            print(f"ℹ️ SmmOficial atualizado (id={prov.id})")

        # 4. ADICIONAR mappings
        added = 0
        for svc_id, (smm_id, price, nome_svc) in MAPPING.items():
            ps = ProviderService(
                provider_id=prov.id,
                service_id=svc_id,
                provider_service_id=str(smm_id),
                provider_price=price,
            )
            db.add(ps)
            added += 1
        print(f"✅ {added} serviços mapeados para SmmOficial")

        # 5. DESATIVAR serviços sem suporte
        for svc_id in SERVICOS_SEM_SUPORTE:
            r = await db.execute(select(Service).where(Service.id == svc_id))
            s = r.scalar_one_or_none()
            if s:
                s.status = "inactive"
                print(f"⏹️  Serviço {svc_id} ({s.name[:30]}) desativado (sem provedor)")

        await db.commit()

        # 6. RESUMO
        r = await db.execute(select(Provider).order_by(Provider.priority))
        print(f"\n📊 PROVEDORES:")
        for p in r.scalars().all():
            print(f"  {'✅' if p.is_active else '🔴'} {p.name} (prioridade {p.priority})")

        r = await db.execute(select(Service).order_by(Service.id))
        print(f"\n📊 CATÁLOGO:")
        ativos = 0
        for s in r.scalars().all():
            status = "✅" if s.status == "active" else "⏹️"
            if s.status == "active": ativos += 1
            print(f"  {status} {s.id:>2}: {s.name[:40]:40} R${s.price:>6.2f}")

        print(f"\n📊 {ativos} serviços ativos, {21 - ativos} desativados")


if __name__ == "__main__":
    asyncio.run(seed())