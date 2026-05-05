"""
EvalForge - RAG Evaluation API Routes
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import RAGEvaluationRequest, RAGEvaluationResponse
from app.services.rag_evaluator import rag_evaluator_service

router = APIRouter(prefix="/rag", tags=["RAG Evaluation"])


@router.post("/evaluate", response_model=RAGEvaluationResponse)
async def evaluate_rag(request: RAGEvaluationRequest):
    """Evaluate a RAG pipeline's retrieval and generation quality."""
    try:
        return rag_evaluator_service.evaluate(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
