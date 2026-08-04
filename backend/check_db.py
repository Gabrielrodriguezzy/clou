#!/usr/bin/env python3
"""Check production DB state before migration."""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ["DATABASE_URL"] = "postgresql+asyncpg://neondb_owner:npg_xeKyq3Ai9LRG@ep-misty-dawn-acmmi3rm-pooler.sa-east-1.aws.neon.tech/neondb"

from app.core.database import async_session_factory, init_db
from app.models.provider import Provider
from app.models.service import Service
from app.models.order import Order
from sqlalchemy import select, func


async def check():
    await init_db()
    async with async_session_factory() as db:
        p_count = (await db.execute(select(func.count()).select_from(Provider))).scalar()
        s_count = (await db.execute(select(func.count()).select_from(Service))).scalar()
        o_count = (await db.execute(select(func.count()).select_from(Order))).scalar()
        print(f"Provedores: {p_count}")
        print(f"Serviços:   {s_count}")
        print(f"Pedidos:    {o_count}")
        
        if p_count:
            providers = (await db.execute(select(Provider))).scalars().all()
            for p in providers:
                print(f"  Provider ID {p.id}: {p.name} | ativo={p.is_active} | prioridade={p.priority}")
        
        if s_count:
            services = (await db.execute(select(Service).order_by(Service.id))).scalars().all()
            print(f"  Primeiros 5 serviços:")
            for s in services[:5]:
                print(f"    ID {s.id}: {s.name[:45]:<45} R${s.price:<6.2f}/1K")
        
        if o_count:
            # Check if any orders reference services
            orders = (await db.execute(select(Order).limit(3))).scalars().all()
            print(f"  Últimos pedidos:")
            for o in orders:
                print(f"    Order #{o.id}: service_id={o.service_id} status={o.status}")

asyncio.run(check())