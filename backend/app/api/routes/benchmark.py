"""
EvalForge - Benchmark API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.models.schemas import (
    BenchmarkRequest, BenchmarkResponse,
    BatchBenchmarkRequest, BatchBenchmarkResponse,
)
from app.models.database import get_db, BenchmarkRecord
from app.services.benchmark import benchmark_service
from app.core.config import logger

router = APIRouter(prefix="/benchmark", tags=["Benchmarking"])


@router.post("/run", response_model=BenchmarkResponse)
async def run_benchmark(request: BenchmarkRequest, db: Session = Depends(get_db)):
    """Benchmark a prompt across multiple LLM models."""
    try:
        result = await benchmark_service.benchmark_single(request)

        # Persist each model result to database
        for model_result in result.results:
            record = BenchmarkRecord(
                prompt=request.prompt,
                model_name=model_result.model_name,
                output=model_result.output[:2000] if model_result.output else "",
                latency_ms=model_result.latency_ms,
                semantic_similarity=model_result.semantic_similarity,
                token_count=model_result.token_count,
                cost_estimate=model_result.cost_estimate,
                error=model_result.error,
            )
            db.add(record)
        db.commit()

        logger.info(f"Benchmark completed: {len(result.results)} models, best={result.best_model}")
        return result
    except Exception as e:
        logger.error(f"Benchmark failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run/batch", response_model=BatchBenchmarkResponse)
async def run_batch_benchmark(request: BatchBenchmarkRequest, db: Session = Depends(get_db)):
    """Run batch benchmarking across models."""
    try:
        result = await benchmark_service.benchmark_batch(request)
        logger.info(f"Batch benchmark: {result.total_samples} samples across {result.models_compared}")
        return result
    except Exception as e:
        logger.error(f"Batch benchmark failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
