"""
EvalForge - Hallucination Detection API Routes
"""

import uuid
from typing import List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.models.schemas import HallucinationRequest, HallucinationResponse
from app.models.database import get_db, HallucinationRecord
from app.services.hallucination import hallucination_detector
from app.core.config import logger

router = APIRouter(prefix="/hallucination", tags=["Hallucination Detection"])


@router.post("/detect", response_model=HallucinationResponse)
async def detect_hallucination(request: HallucinationRequest, db: Session = Depends(get_db)):
    """Detect hallucinations in LLM output by verifying claims against context and save to database."""
    try:
        result = hallucination_detector.detect(request)
        detection_id = str(uuid.uuid4())[:8]
        now = datetime.utcnow().isoformat()
        result.id = detection_id
        result.timestamp = now

        # Persist to database
        record = HallucinationRecord(
            id=detection_id,
            context=request.context,
            output=request.output,
            prompt=request.prompt,
            hallucination_score=result.hallucination_score,
            total_claims=result.total_claims,
            supported_claims=result.supported_claims,
            unsupported_claims=result.unsupported_claims,
            claims=[c.model_dump() for c in result.claims],
            flags=result.flags,
            details=result.details,
        )
        db.add(record)
        db.commit()

        logger.info(f"Hallucination detection {detection_id}: score={result.hallucination_score:.4f} ({result.supported_claims}/{result.total_claims} supported)")
        return result
    except Exception as e:
        logger.error(f"Hallucination detection failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_hallucination_history(limit: int = 20, db: Session = Depends(get_db)):
    """Retrieve recent hallucination detection records."""
    records = (
        db.query(HallucinationRecord)
        .order_by(HallucinationRecord.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "hallucination_score": r.hallucination_score,
            "total_claims": r.total_claims,
            "supported_claims": r.supported_claims,
            "unsupported_claims": r.unsupported_claims,
            "prompt": r.prompt,
            "output": (r.output[:120] + "...") if len(r.output) > 120 else r.output,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in records
    ]
