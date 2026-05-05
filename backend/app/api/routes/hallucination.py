"""
EvalForge - Hallucination Detection API Routes
"""

from fastapi import APIRouter, HTTPException
from app.models.schemas import HallucinationRequest, HallucinationResponse
from app.services.hallucination import hallucination_detector

router = APIRouter(prefix="/hallucination", tags=["Hallucination Detection"])


@router.post("/detect", response_model=HallucinationResponse)
async def detect_hallucination(request: HallucinationRequest):
    """Detect hallucinations in LLM output by verifying claims against context."""
    try:
        return hallucination_detector.detect(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
