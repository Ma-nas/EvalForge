"""
EvalForge - Benchmark API Routes
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    BenchmarkRequest, BenchmarkResponse,
    BatchBenchmarkRequest, BatchBenchmarkResponse,
)
from app.services.benchmark import benchmark_service

router = APIRouter(prefix="/benchmark", tags=["Benchmarking"])


@router.post("/run", response_model=BenchmarkResponse)
async def run_benchmark(request: BenchmarkRequest):
    """Benchmark a prompt across multiple LLM models."""
    try:
        return await benchmark_service.benchmark_single(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run/batch", response_model=BatchBenchmarkResponse)
async def run_batch_benchmark(request: BatchBenchmarkRequest):
    """Run batch benchmarking across models."""
    try:
        return await benchmark_service.benchmark_batch(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
