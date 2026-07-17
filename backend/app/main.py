from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from contextlib import asynccontextmanager
from pathlib import Path
import time
import logging

from app.core.config import settings
from app.core.database import init_db
from app.core.security_ext import limiter, AuditLogger
from app.api import auth, services, orders, deposits, admin, coupons, referrals
from app.workers.order_worker import OrderWorker

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

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
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

# ─── Rate Limiter ─────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
