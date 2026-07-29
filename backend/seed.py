#!/usr/bin/env python3
"""Popula o banco com serviços reais do JustAnotherPanel (JAP) para o público brasileiro."""
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
            name="JustAnotherPanel",
            api_url="https://justanotherpanel.com/api/v2",
            api_key="54c8bdf3b400bc18e338a1478c035a54",
            description="Provedor principal - JAP: seguidores, curtidas, visualizações (5.797 serviços)",
            is_active=True,
            priority=1,
        )
        db.add(provider)
        await db.flush()

        # 4. Serviços organizados
        # Estrutura: (categoria, slug_cat, [(nome, slug_svc, desc, JAP_ID, custo_usd, min, max, tempo, margem)])
        # Fonte JAP: https://justanotherpanel.com/api/v2
        services_data = [
            # ─── INSTAGRAM ───
            ("Instagram", "instagram", [
                ("Seguidores", "seguidores", [
                    ("Seguidores Brasil (10K/dia)", "seguidores-brasil-10k",
                     "Seguidores brasileiros reais, entrega super rápida. Sem refill.",
                     8096, 0.7938, 50, 50000, "1-2h", 60),
                    ("Seguidores Brasil Feminino (Auto-Refill 30D)", "seguidores-brasil-feminino",
                     "Seguidores brasileiros com auto-refill de 30 dias. Melhor custo-benefício.",
                     8095, 0.8125, 50, 50000, "1-2h", 80),
                    ("Seguidores Brasil (20K/dia)", "seguidores-brasil-reais",
                     "Seguidores brasileiros com entrega rápida. Alta retenção.",
                     8096, 0.7938, 50, 50000, "1h", 80),
                    ("Seguidores Mundiais (100K/dia)", "seguidores-mundiais",
                     "Seguidores globais, entrega ultrarrápida até 250K.",
                     720, 0.2125, 10, 250000, "0-1h", 120),
                ]),
                ("Curtidas", "curtidas", [
                    ("Curtidas Instantâneas (Non Drop)", "curtidas-instantaneas",
                                         "Curtidas não-drop, entrega em minutos. Até 100K/dia.",
                                         8216, 0.0125, 10, 100000, "0-1h", 600),
                    ("Curtidas Brasileiras (30d Refill)", "curtidas-brasileiras-refill",
                     "Curtidas de alta qualidade com 30 dias de garantia.",
                     4265, 0.4038, 10, 20000, "0-1h", 60),
                    ("Curtidas (300K/dia)", "curtidas-300k-dia",
                     "Curtidas em alta velocidade. Ideal para posts virais.",
                     8216, 0.0125, 10, 100000, "0-5 min", 600),
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
                     "Visualizações ultrarrápidas para TikTok. 10M/dia. Melhor preço!",
                     2260, 0.0313, 100, 10000000, "Instantâneo", 350),
                ]),
                ("Curtidas", "curtidas", [
                    ("Curtidas TikTok (30d Refill)", "curtidas-tiktok-refill",
                     "Curtidas para TikTok com 30 dias de garantia.",
                     10023, 0.0200, 10, 500000, "0-1h", 400),
                    ("Curtidas TikTok (25K/dia)", "curtidas-tiktok-25k",
                     "Curtidas rápidas para TikTok. Sem refill.",
                     10022, 0.0188, 10, 5000000, "0-1h", 500),
                ]),
                ("Seguidores", "seguidores", [
                    ("Seguidores TikTok (30d Refill)", "seguidores-tiktok-refill",
                     "Seguidores para TikTok com 30 dias de garantia.",
                     8777, 1.25, 10, 100000, "0-2h", 100),
                    ("Seguidores TikTok (HQ)", "seguidores-tiktok-hq",
                     "Seguidores de alta qualidade para TikTok.",
                     8777, 1.25, 10, 100000, "0-2h", 100),
                ]),
            ]),
            # ─── YOUTUBE ───
            ("YouTube", "youtube", [
                ("Visualizações", "visualizacoes", [
                    ("Visualizações YouTube (365d Refill)", "visualizacoes-youtube-refill",
                     "Visualizações com 365 dias de garantia. Melhor custo!",
                     8040, 0.5250, 100, 1000000, "0-1h", 120),
                    ("Visualizações YouTube (50K/dia)", "visualizacoes-youtube-50k",
                     "Visualizações rápidas para YouTube. Entrega em minutos.",
                     6298, 0.5400, 100, 99991, "0-1h", 100),
                    ("🇧🇷 Visualizações Únicas Brasil (Discovery)", "visualizacoes-youtube-brasil",
                     "Visualizações únicas brasileiras Discovery ADS. Zero drop.",
                     3455, 5.3148, 10000, 10000000, "24h", 40),
                ]),
                ("Inscritos", "inscritos", [
                    ("Inscritos YouTube (30d Refill)", "inscritos-youtube-refill",
                     "Inscritos para YouTube com 30 dias de garantia.",
                     3519, 12.50, 5, 100000, "0-3h", 45),
                ]),
            ]),
            # ─── TELEGRAM ───
            ("Telegram", "telegram", [
                ("Visualizações", "visualizacoes", [
                    ("Visualizações de Posts (Non Drop)", "visualizacoes-telegram-posts",
                     "Visualizações para posts do Telegram. Non Drop.",
                     7381, 0.0063, 10, 500000, "0-1h", 500),
                    ("Visualizações Telegram (Mais Barato)", "visualizacoes-telegram-barato",
                     "Visualizações para qualquer post do Telegram. Preço imbatível.",
                     8407, 0.0029, 10, 399999, "0-1h", 800),
                ]),
                ("Membros", "membros", [
                    ("Membros Grupo/Canal (30d Refill)", "membros-telegram-refill",
                     "Membros para grupos ou canais do Telegram com 30 dias de garantia.",
                     8523, 0.29, 10, 100000, "0-1h", 80),
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
        print(f"   {len(provider_services)} mapeamentos com JustAnotherPanel(JAP)")
        print(f"\n📊 PREÇOS (venda em BRL):")
        print(f"{'-'*60}")
        for s in all_services:
            print(f"   R$ {s.price:>6.2f}/1K | {s.name[:45]}")
        print(f"\n   Admin: admin@clou.com / admin123")
        print(f"   Teste: teste@clou.com / teste123")


if __name__ == "__main__":
    asyncio.run(seed())
