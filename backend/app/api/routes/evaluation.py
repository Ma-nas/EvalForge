"""
EvalForge - Evaluation API Routes
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.models.schemas import (
    EvaluationRequest, EvaluationResponse,
    BatchEvaluationRequest, BatchEvaluationResponse,
)
from app.models.database import get_db, EvaluationRecord
from app.services.evaluator import evaluator_service
from app.core.config import logger

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_single(request: EvaluationRequest, db: Session = Depends(get_db)):
    """Evaluate a single LLM output against expected output."""
    try:
        result = evaluator_service.evaluate_single(request)

        # Persist to database
        record = EvaluationRecord(
            id=result.id,
            prompt=request.prompt,
            context=request.context,
            expected_output=request.expected_output,
            actual_output=request.actual_output,
            model_name=request.model_name,
            semantic_similarity=result.semantic_similarity,
            relevance_score=result.relevance_score,
            hallucination_score=result.hallucination_score,
            groundedness_score=result.groundedness_score,
            composite_score=result.composite_score,
            quality_label=result.quality_label,
            flags=result.flags,
            details=result.details,
        )
        db.add(record)
        db.commit()

        logger.info(f"Evaluation {result.id}: {result.quality_label} (composite={result.composite_score:.4f})")
        return result
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate/batch", response_model=BatchEvaluationResponse)
async def evaluate_batch(request: BatchEvaluationRequest, db: Session = Depends(get_db)):
    """Evaluate a batch of LLM outputs."""
    try:
        result = evaluator_service.evaluate_batch(request)

        # Persist each evaluation to database
        for eval_result in result.results:
            record = EvaluationRecord(
                id=eval_result.id,
                prompt=eval_result.prompt,
                model_name=request.model_name,
                semantic_similarity=eval_result.semantic_similarity,
                relevance_score=eval_result.relevance_score,
                hallucination_score=eval_result.hallucination_score,
                groundedness_score=eval_result.groundedness_score,
                composite_score=eval_result.composite_score,
                quality_label=eval_result.quality_label,
                flags=eval_result.flags,
                details=eval_result.details,
                expected_output="",
                actual_output="",
            )
            db.add(record)
        db.commit()

        logger.info(f"Batch evaluation: {result.total_samples} samples, avg_composite={result.avg_composite_score:.4f}")
        return result
    except Exception as e:
        logger.error(f"Batch evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
