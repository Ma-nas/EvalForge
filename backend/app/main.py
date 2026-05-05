"""
EvalForge - FastAPI Main Application
Production-grade LLM Evaluation, Benchmarking & Hallucination Detection Platform.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.models.database import init_db
from app.api.routes import evaluation, hallucination, benchmark, rag, dataset

# Initialize FastAPI app
app = FastAPI(
    title="🔥 EvalForge API",
    description="LLM Evaluation, Benchmarking & Hallucination Detection Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(evaluation.router, prefix="/api/v1")
app.include_router(hallucination.router, prefix="/api/v1")
app.include_router(benchmark.router, prefix="/api/v1")
app.include_router(rag.router, prefix="/api/v1")
app.include_router(dataset.router, prefix="/api/v1")


@app.on_event("startup")
async def startup():
    """Initialize database and load models on startup."""
    print("🔥 EvalForge API starting up...")
    init_db()
    print("✅ Database initialized")


@app.get("/")
async def root():
    return {
        "name": "EvalForge API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "evaluation": "/api/v1/evaluation/evaluate",
            "hallucination": "/api/v1/hallucination/detect",
            "benchmark": "/api/v1/benchmark/run",
            "rag": "/api/v1/rag/evaluate",
            "datasets": "/api/v1/datasets/",
        },
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "evalforge"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
