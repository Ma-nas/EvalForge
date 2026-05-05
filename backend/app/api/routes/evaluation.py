"""
EvalForge - Evaluation API Routes
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    EvaluationRequest, EvaluationResponse,
    BatchEvaluationRequest, BatchEvaluationResponse,
)
from app.services.evaluator import evaluator_service

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])


@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_single(request: EvaluationRequest):
    """Evaluate a single LLM output against expected output."""
    try:
        return evaluator_service.evaluate_single(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate/batch", response_model=BatchEvaluationResponse)
async def evaluate_batch(request: BatchEvaluationRequest):
    """Evaluate a batch of LLM outputs."""
    try:
        return evaluator_service.evaluate_batch(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
