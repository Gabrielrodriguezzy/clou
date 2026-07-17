from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
from pathlib import Path
from app.core.config import settings
from app.core.database import init_db
from app.api import auth, services, orders, deposits, admin, coupons, referrals
from app.workers.order_worker import OrderWorker


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENVIRONMENT != "testing":
        await init_db()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.APP_URL, "http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(deposits.router)
app.include_router(coupons.router)
app.include_router(admin.router)
app.include_router(referrals.router)

# Páginas estáticas (Termos e Privacidade)
TEMPLATES_DIR = Path(__file__).parent / "templates"


def _read_html(filename: str) -> str:
    path = TEMPLATES_DIR / filename
    if path.exists():
        return path.read_text(encoding="utf-8")
    return "<h1>Página não encontrada</h1>"


@app.get("/termos", response_class=HTMLResponse)
async def termos():
    return HTMLResponse(content=_read_html("termos.html"))


@app.get("/privacidade", response_class=HTMLResponse)
async def privacidade():
    return HTMLResponse(content=_read_html("privacidade.html"))


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "0.1.0"}


@app.post("/api/worker/run")
async def run_worker():
    """Endpoint para executar o worker manualmente ou via cron"""
    worker = OrderWorker()
    result = await worker.run_once()
    return {"status": "ok", "result": result}
