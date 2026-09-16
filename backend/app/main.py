"""
EvalForge - FastAPI Main Application
Production-grade LLM Evaluation, Benchmarking & Hallucination Detection Platform.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings, logger
from app.models.database import init_db, SessionLocal
from app.api.routes import evaluation, hallucination, benchmark, rag, dataset, export
from app.api.routes import auth, dashboard
from app.api.routes.dataset import seed_default_datasets


# ─── Rate Limiter ──────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT])


# ─── Lifespan (replaces deprecated @app.on_event) ─────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("EvalForge API starting up...")
    init_db()
    # Seed default sample datasets if not already present
    try:
        db = SessionLocal()
        seed_default_datasets(db)
        db.close()
    except Exception as e:
        logger.warning(f"Default dataset seeding skipped: {e}")
    logger.info("EvalForge API ready — all systems operational")
    yield
    logger.info("EvalForge API shutting down...")



# ─── Initialize FastAPI App ────────────────────────────────
app = FastAPI(
    title="🔥 EvalForge API",
    description="Production-Grade LLM Evaluation, Benchmarking & Hallucination Detection Platform",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ─── CORS Middleware ───────────────────────────────────────
allow_origins = settings.CORS_ORIGINS
allow_credentials = True
if "*" in allow_origins:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request Logging Middleware ────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every incoming request with method, path, and status."""
    response: Response = await call_next(request)
    if not request.url.path.startswith("/docs") and not request.url.path.startswith("/openapi"):
        logger.debug(
            f"{request.method} {request.url.path} → {response.status_code}"
        )
    return response


# ─── Register Routers ─────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(evaluation.router, prefix="/api/v1")
app.include_router(hallucination.router, prefix="/api/v1")
app.include_router(benchmark.router, prefix="/api/v1")
app.include_router(rag.router, prefix="/api/v1")
app.include_router(dataset.router, prefix="/api/v1")
app.include_router(export.router, prefix="/api/v1")


# ─── Root & Health Endpoints ──────────────────────────────
@app.get("/")
async def root():
    return {
        "name": "EvalForge API",
        "version": "1.1.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/v1/auth",
            "dashboard": "/api/v1/dashboard/summary",
            "evaluation": "/api/v1/evaluation/evaluate",
            "hallucination": "/api/v1/hallucination/detect",
            "benchmark": "/api/v1/benchmark/run",
            "rag": "/api/v1/rag/evaluate",
            "datasets": "/api/v1/datasets/",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "evalforge", "version": "1.1.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
