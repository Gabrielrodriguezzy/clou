#!/usr/bin/env python3
"""Adiciona MorethanPanel (MTP) como provedor e mapeia os serviços recomendados.
Idempotente: cria o provider MTP se não existir e adiciona/atualiza os mapeamentos.
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import async_session_factory, init_db
from app.core.security import hash_password
from app.models.provider import Provider
from app.models.provider_service import ProviderService
from app.models.service import Service
from sqlalchemy import select, delete

MTP_API_URL = "https://morethanpanel.com/api/v2"
MTP_API_KEY = "cca26d9554da2a6cafa510ddc5a9f2fe"

# Mapeamento: service_id -> (MTP service_id, MTP price USD/1K)
# Serviços recomendados do MTP (🟢 estáveis)
MTP_MAPPING = {
    4:  (5440, 0.72),   # Seguidores Mundiais -> IG Followers 30d Refill
    5:  (2916, 0.05),   # Curtidas Instantâneas -> IG Likes 30d Refill
    10: (9857, 0.04),   # Vis TikTok -> TikTok Video Views 30d Refill
    15: (9221, 0.35),   # Vis YouTube -> Youtube Views 30d Refill
}


async def seed_mtp():
    await init_db()
    async with async_session_factory() as db:
        # 1. Criar provider MTP se não existir
        result = await db.execute(select(Provider).where(Provider.name == "MorethanPanel"))
        provider = result.scalar_one_or_none()
        if not provider:
            provider = Provider(
                name="MorethanPanel",
                api_url=MTP_API_URL,
                api_key=MTP_API_KEY,
                description="Provedor secundário - MTP: curtidas, views, seguidores mundiais (4.142 serviços)",
                is_active=True,
                priority=1,  # maior prioridade (tenta primeiro)
            )
            db.add(provider)
            await db.flush()
            print(f"✅ MorethanPanel criado (id={provider.id})")
        else:
            # Atualizar URL e prioridade caso já exista
            provider.api_url = MTP_API_URL
            provider.api_key = MTP_API_KEY
            provider.priority = 1
            provider.is_active = True
            print(f"ℹ️ MorethanPanel já existia (id={provider.id}), atualizado")

        # 2. Ajustar prioridade do JAP para 2 (fallback)
        jap = await db.execute(select(Provider).where(Provider.name == "JustAnotherPanel"))
        jap_provider = jap.scalar_one_or_none()
        if jap_provider:
            jap_provider.priority = 2
            print("ℹ️ JAP prioridade ajustada para 2 (fallback)")

        # 3. Mapear serviços para o MTP
        added = 0
        for service_id, (mtp_id, mtp_price) in MTP_MAPPING.items():
            # Verificar se o serviço existe
            svc = await db.execute(select(Service).where(Service.id == service_id))
            if not svc.scalar_one_or_none():
                print(f"  ⚠️ Service {service_id} não encontrado. Pulando.")
                continue

            # Upsert: remover mapping existente MTP para este serviço, depois adicionar
            await db.execute(delete(ProviderService).where(
                ProviderService.provider_id == provider.id,
                ProviderService.service_id == service_id,
            ))
            ps = ProviderService(
                provider_id=provider.id,
                service_id=service_id,
                provider_service_id=str(mtp_id),
                provider_price=mtp_price,
            )
            db.add(ps)
            added += 1
            print(f"  ✅ Serviço {service_id} -> MTP ID {mtp_id} (${mtp_price}/1K)")

        await db.commit()
        print(f"\n✅ MTP configurado com {added} mapeamentos!")


if __name__ == "__main__":
    asyncio.run(seed_mtp())