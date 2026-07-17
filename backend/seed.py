#!/usr/bin/env python3
"""Popula o banco com serviços reais do SMMPanel.com para o público brasileiro."""
import asyncio, sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import async_session_factory, init_db
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.platform import Platform
from app.models.category import Category
from app.models.service import Service, ServiceStatus
from app.models.provider import Provider
from app.models.provider_service import ProviderService
from sqlalchemy import select, delete

CAMBIO = 5.50  # USD -> BRL

def calc_price(custo_usd: float, margem_pct: int = 150) -> float:
    """Calcula preço de venda em BRL com margem"""
    custo_brl = custo_usd * CAMBIO
    return round(custo_brl * (1 + margem_pct / 100), 2)


async def seed():
    await init_db()
    async with async_session_factory() as db:
        # Limpar dados existentes (mantendo usuários)
        await db.execute(delete(ProviderService))
        await db.execute(delete(Service))
        await db.execute(delete(Category))
        await db.execute(delete(Platform))
        await db.execute(delete(Provider))

        # 1. Usuários
        for u in [
            User(email="admin@clou.com", password_hash=hash_password("admin123"), name="Admin Clou", role=UserRole.SUPERADMIN, balance=99999.0),
            User(email="teste@clou.com", password_hash=hash_password("teste123"), name="Usuário Teste", balance=100.0),
        ]:
            exists = await db.execute(select(User).where(User.email == u.email))
            if not exists.scalar_one_or_none():
                db.add(u)
        await db.flush()

        # 2. Platforms
        platforms = {
            "instagram": Platform(name="Instagram", slug="instagram", icon="instagram", sort_order=1),
            "tiktok": Platform(name="TikTok", slug="tiktok", icon="tiktok", sort_order=2),
            "youtube": Platform(name="YouTube", slug="youtube", icon="youtube", sort_order=3),
            "twitter": Platform(name="Twitter / X", slug="twitter", icon="twitter", sort_order=4),
            "telegram": Platform(name="Telegram", slug="telegram", icon="telegram", sort_order=5),
        }
        for p in platforms.values():
            db.add(p)
        await db.flush()
        # Mapear slugs para IDs
        for slug, p in platforms.items():
            platforms[slug] = p

        # 3. Provedor
        provider = Provider(
            name="SMMPanel.com",
            api_url="https://smmpanel.com/api/v2",
            api_key="e64ff2c1024309b47b97aa4399524479",
            description="Provedor principal - seguidores, curtidas, visualizações",
            is_active=True,
            priority=1,
        )
        db.add(provider)
        await db.flush()

        # 4. Serviços organizados
        # Estrutura: (categoria, slug_cat, [(nome, slug_svc, desc, provedor_id, custo_usd, min, max, tempo, margem)])
        services_data = [
            # ─── INSTAGRAM ───
            ("Instagram", "instagram", [
                ("Seguidores", "seguidores", [
                    ("Seguidores Brasil (10K/dia)", "seguidores-brasil-10k",
                     "Seguidores brasileiros reais, entrega super rápida. Sem refill.",
                     1861, 0.6425, 50, 1000000, "0-2 min", 80),
                    ("Seguidores Brasil Feminino (365d Refill)", "seguidores-brasil-feminino",
                     "Seguidores brasileiros femininos com garantia de 365 dias. Melhor custo-benefício.",
                     1864, 0.3943, 50, 10000, "0-2 min", 150),
                    ("Seguidores Brasil (20K/dia, Perfis Reais)", "seguidores-brasil-reais",
                     "Seguidores brasileiros com perfis reais antigos. Alta retenção.",
                     1862, 2.5010, 50, 500000, "0-10 min", 60),
                    ("Seguidores Mundiais (500K/dia)", "seguidores-mundiais",
                     "Seguidores globais, entrega ultrarrápida até 10 milhões.",
                     2085, 0.2234, 10, 1000000, "0-30 min", 200),
                ]),
                ("Curtidas", "curtidas", [
                    ("Curtidas Instantâneas (Non Drop)", "curtidas-instantaneas",
                     "Curtidas não-drop, entregues em segundos. 100K/hora.",
                     1769, 0.0549, 10, 50000, "Instantâneo", 300),
                    ("Curtidas Brasileiras (30d Refill)", "curtidas-brasileiras-refill",
                     "Curtidas de alta qualidade com 30 dias de garantia.",
                     1918, 0.0779, 10, 30000, "0-1h", 280),
                    ("Curtidas (100K/hora, Non Drop)", "curtidas-100k-hora",
                     "Curtidas em alta velocidade. Ideal para posts virais.",
                     1718, 0.0579, 10, 100000, "0-5 min", 290),
                ]),
                ("Visualizações", "visualizacoes", [
                    ("Visualizações Stories", "visualizacoes-stories",
                     "Visualizações para stories do Instagram. Entrega rápida.",
                     0, 0.15, 50, 50000, "0-6h", 150),
                    ("Visualizações Reels", "visualizacoes-reels",
                     "Visualizações para Reels. Resultados em horas.",
                     0, 0.20, 100, 100000, "0-24h", 150),
                ]),
            ]),
            # ─── TIKTOK ───
            ("TikTok", "tiktok", [
                ("Visualizações", "visualizacoes", [
                    ("Visualizações TikTok (Ultrafast)", "visualizacoes-tiktok-ultrafast",
                     "Visualizações ultrarrápidas para TikTok. 5M/dia. Melhor preço do mercado! 🔥",
                     1984, 0.0539, 100, 9500000, "Instantâneo", 250),
                    ("Visualizações TikTok (Free, Ilimitado)", "visualizacoes-tiktok-free",
                     "Visualizações para TikTok sem limite máximo. Entrega grátis incluída.",
                     1840, 0.0789, 100, 2147483647, "0-30 min", 200),
                    ("Visualizações TikTok (500K/hora)", "visualizacoes-tiktok-500k",
                     "Visualizações em massa para TikTok. 500K por hora.",
                     1841, 0.0867, 100, 2147483647, "0-5 min", 180),
                ]),
                ("Curtidas", "curtidas", [
                    ("Curtidas TikTok (30d Refill)", "curtidas-tiktok-refill",
                     "Curtidas para TikTok com 30 dias de garantia.",
                     1663, 0.3171, 10, 500000, "0-1h", 150),
                    ("Curtidas TikTok (25K/dia)", "curtidas-tiktok-25k",
                     "Curtidas rápidas para TikTok. Sem refill.",
                     1662, 0.3067, 10, 30000, "0-1h", 150),
                ]),
                ("Seguidores", "seguidores", [
                    ("Seguidores TikTok (30d Refill)", "seguidores-tiktok-refill",
                     "Seguidores para TikTok com 30 dias de garantia.",
                     1980, 3.7525, 10, 50000, "0-24h", 80),
                    ("Seguidores TikTok (HQ, 100K/dia)", "seguidores-tiktok-hq",
                     "Seguidores de alta qualidade para TikTok. Entrega rápida.",
                     1982, 3.7550, 10, 100000, "0-24h", 80),
                ]),
            ]),
            # ─── YOUTUBE ───
            ("YouTube", "youtube", [
                ("Visualizações", "visualizacoes", [
                    ("Visualizações YouTube (Suggested, Lifetime)", "visualizacoes-youtube-suggested",
                     "Visualizações sugeridas pelo YouTube. Garantia vitalícia. Melhor custo!",
                     1644, 0.7425, 100, 300000, "0-60 min", 80),
                    ("Visualizações YouTube (50K/dia)", "visualizacoes-youtube-50k",
                     "Visualizações rápidas para YouTube. Entrega em minutos.",
                     1650, 0.7860, 40, 300000, "0-30 min", 80),
                    ("🇧🇷 Visualizações Únicas Brasil (RAV)", "visualizacoes-youtube-brasil",
                     "Visualizações únicas brasileiras de alta qualidade. Público real do Brasil.",
                     887, 4.2500, 100, 500000, "0-24h", 50),
                ]),
                ("Inscritos", "inscritos", [
                    ("Inscritos YouTube (30d Refill)", "inscritos-youtube-refill",
                     "Inscritos para YouTube com 30 dias de garantia. Crescimento orgânico.",
                     1976, 14.40, 10, 5000, "0-48h", 40),
                ]),
            ]),
            # ─── TELEGRAM ───
            ("Telegram", "telegram", [
                ("Visualizações", "visualizacoes", [
                    ("Visualizações de Posts (50K/dia)", "visualizacoes-telegram-posts",
                     "Visualizações para posts do Telegram. 50K/dia.",
                     796, 0.0529, 10, 500000, "0-60 min", 310),
                    ("Visualizações Telegram (Mais Barato)", "visualizacoes-telegram-barato",
                     "Visualizações para qualquer post do Telegram. Preço imbatível.",
                     1703, 0.0826, 100, 100000, "0-30 min", 200),
                ]),
                ("Membros", "membros", [
                    ("Membros Grupo/Canal (30d Refill)", "membros-telegram-refill",
                     "Membros para grupos ou canais do Telegram com 30 dias de garantia.",
                     842, 0.2200, 10, 50000, "0-1h", 200),
                ]),
            ]),
        ]

        all_services = []
        provider_services = []
        svc_counter = 1

        for plataforma_nome, plataforma_slug, categorias in services_data:
            plat = platforms[plataforma_slug]
            for cat_nome, cat_slug, servicos in categorias:
                cat = Category(name=cat_nome, slug=cat_slug, platform_id=plat.id, sort_order=1)
                db.add(cat)
                await db.flush()

                for svc_data in servicos:
                    nome, slug, desc, ps_id, custo_usd, min_v, max_v, tempo, margem = svc_data
                    preco_venda = calc_price(custo_usd, margem) if custo_usd > 0 else round(custo_usd * CAMBIO * 2.5, 2)

                    svc = Service(
                        id=svc_counter,
                        name=nome,
                        slug=slug,
                        description=desc,
                        price=preco_venda,
                        min_amount=min_v,
                        max_amount=max_v,
                        avg_time=tempo,
                        guarantee="30 dias" if "refill" in slug.lower() or "garantia" in desc.lower() else "7 dias",
                        platform_id=plat.id,
                        category_id=cat.id,
                        status=ServiceStatus.ACTIVE,
                        sort_order=1,
                    )
                    db.add(svc)
                    all_services.append(svc)

                    if ps_id and ps_id > 0:
                        provider_services.append(
                            ProviderService(
                                provider_id=provider.id,
                                service_id=svc_counter,
                                provider_service_id=str(ps_id),
                                provider_price=custo_usd,
                            )
                        )

                    svc_counter += 1

        # Adicionar mapeamentos do provedor
        for ps in provider_services:
            db.add(ps)

        await db.commit()

        print(f"\n{'='*60}")
        print(f"✅ CATÁLOGO CLOU ATUALIZADO!")
        print(f"{'='*60}")
        print(f"   {len(all_services)} serviços em {len(services_data)} categorias")
        print(f"   {len(provider_services)} mapeamentos com SMMPanel.com")
        print(f"\n📊 PREÇOS (venda em BRL):")
        print(f"{'-'*60}")
        for s in all_services:
            print(f"   R$ {s.price:>6.2f}/1K | {s.name[:45]}")
        print(f"\n   Admin: admin@clou.com / admin123")
        print(f"   Teste: teste@clou.com / teste123")


if __name__ == "__main__":
    asyncio.run(seed())
