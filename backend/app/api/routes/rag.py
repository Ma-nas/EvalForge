"""
EvalForge - RAG Evaluation API Routes
"""

import uuid
from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.models.schemas import RAGEvaluationRequest, RAGEvaluationResponse
from app.models.database import get_db, RAGRecord
from app.services.rag_evaluator import rag_evaluator_service
from app.core.config import logger

router = APIRouter(prefix="/rag", tags=["RAG Evaluation"])


@router.post("/evaluate", response_model=RAGEvaluationResponse)
async def evaluate_rag(request: RAGEvaluationRequest, db: Session = Depends(get_db)):
    """Evaluate a RAG pipeline's retrieval and generation quality and persist to database."""
    try:
        result = rag_evaluator_service.evaluate(request)
        rag_id = str(uuid.uuid4())[:8]
        result.id = rag_id

        # Persist to database
        record = RAGRecord(
            id=rag_id,
            query=request.query,
            retrieved_contexts=request.retrieved_contexts,
            generated_output=request.generated_output,
            ground_truth=request.ground_truth,
            retrieval_precision=result.retrieval_precision,
            context_relevance=result.context_relevance,
            answer_relevance=result.answer_relevance,
            groundedness_score=result.groundedness_score,
            faithfulness_score=result.faithfulness_score,
            composite_rag_score=result.composite_rag_score,
            flags=result.flags,
            details=result.details,
        )
        db.add(record)
        db.commit()

        logger.info(f"RAG evaluation {rag_id}: composite={result.composite_rag_score:.4f}")
        return result
    except Exception as e:
        logger.error(f"RAG evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_rag_history(limit: int = 20, db: Session = Depends(get_db)):
    """Retrieve recent RAG evaluation records."""
    records = (
        db.query(RAGRecord)
        .order_by(RAGRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "query": (r.query[:80] + "...") if len(r.query) > 80 else r.query,
            "composite_rag_score": r.composite_rag_score,
            "retrieval_precision": r.retrieval_precision,
            "faithfulness_score": r.faithfulness_score,
            "groundedness_score": r.groundedness_score,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in records
    ]
