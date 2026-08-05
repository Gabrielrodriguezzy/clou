from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from contextlib import asynccontextmanager
from pathlib import Path
import time
import logging
import asyncio

from app.core.config import settings
from app.core.database import init_db
from app.core.security_ext import rate_limiter, AuditLogger
from app.api import auth, services, orders, deposits, admin, coupons, referrals, partners
from app.workers.order_worker import OrderWorker

logger = logging.getLogger(__name__)

# ─── Security Headers Middleware ──────────────────────────────────────

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "0",  # Desliga obsoleto, confia em CSP
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

if settings.ENVIRONMENT == "production":
    SECURITY_HEADERS["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    SECURITY_HEADERS["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self' data:; "
        "connect-src 'self' https:; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENVIRONMENT != "testing":
        await init_db()
    # Iniciar worker periodico para atualizar status dos pedidos
    worker_task = None
    if settings.ENVIRONMENT != "testing":
        async def periodic_status_check():
            worker = OrderWorker()
            while True:
                try:
                    await asyncio.sleep(300)  # 5 minutos
                    result = await worker.update_order_statuses()
                    if result > 0:
                        logger.info(f"Worker: {result} pedidos atualizados")
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Worker periodico: {e}")
        worker_task = asyncio.create_task(periodic_status_check())
    yield
    if worker_task:
        worker_task.cancel()


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

# ─── Rate Limiter Middleware ────────────────────────────────────────────

RATE_LIMIT_CONFIG = {
    "/api/auth/login": {"max": 10, "window": 60},
    "/api/auth/register": {"max": 10, "window": 60},
    "/api/auth/refresh": {"max": 10, "window": 60},
    "/api/auth/change-password": {"max": 5, "window": 60},
}


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting por IP para endpoints sensíveis."""
    path = request.url.path
    if path in RATE_LIMIT_CONFIG:
        config = RATE_LIMIT_CONFIG[path]
        ip = request.client.host if request.client else "unknown"
        # Tentar pegar IP real via proxy headers
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
        if not rate_limiter.check(path, ip, config["max"], config["window"]):
            return JSONResponse(
                status_code=429,
                content={"detail": "Muitas requisições. Aguarde um momento antes de tentar novamente."},
            )
    response = await call_next(request)
    return response

# ─── CORS (configurável) ──────────────────────────────────────────────
cors_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# ─── Trusted Host ─────────────────────────────────────────────────────
if settings.ENVIRONMENT == "production":
    trusted_hosts = [h.strip() for h in settings.CORS_ORIGINS.split(",") if h.strip()]
    trusted_hosts = [h.replace("https://", "").replace("http://", "").split("/")[0] for h in trusted_hosts]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

# ─── Cache Middleware (para endpoints GET públicos do catálogo) ───────

CACHE_ENDPOINTS = {
    "/api/stats": 300,
    "/api/platforms": 600,
    "/api/categories": 600,
    "/api/services": 300,
}


@app.middleware("http")
async def cache_middleware(request: Request, call_next):
    """Adiciona Cache-Control em endpoints GET públicos do catálogo."""
    response = await call_next(request)
    path = request.url.path
    if request.method == "GET" and path in CACHE_ENDPOINTS:
        max_age = CACHE_ENDPOINTS[path]
        response.headers["Cache-Control"] = f"public, max-age={max_age}, s-maxage={max_age * 2}"
    return response


# ─── Security Headers + Audit ─────────────────────────────────────────


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    start = time.time()

    # Security headers
    response = await call_next(request)
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value

    # Request timing
    elapsed = time.time() - start
    if elapsed > 5:
        logger.warning(f"SLOW_REQUEST: {request.method} {request.url.path} took {elapsed:.2f}s")

    return response


# ─── Rotas ────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(orders.router)
app.include_router(deposits.router)
app.include_router(coupons.router)
app.include_router(admin.router)
app.include_router(referrals.router)
app.include_router(partners.router)

# ─── Páginas estáticas ────────────────────────────────────────────────
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
