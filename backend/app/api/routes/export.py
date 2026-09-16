"""
EvalForge - Export API Routes
Allows exporting evaluation, benchmark, hallucination, and RAG metrics as CSV or JSON.
"""

import io
import csv
import json
from datetime import datetime
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.models.database import (
    get_db,
    EvaluationRecord,
    BenchmarkRecord,
    HallucinationRecord,
    RAGRecord,
)

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/evaluations")
async def export_evaluations(
    format: str = Query("json", pattern="^(json|csv)$"),
    limit: int = Query(500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    """Export evaluation history as CSV or JSON."""
    records = (
        db.query(EvaluationRecord)
        .order_by(EvaluationRecord.created_at.desc())
        .limit(limit)
        .all()
    )

    data = [
        {
            "id": r.id,
            "prompt": r.prompt,
            "expected_output": r.expected_output,
            "actual_output": r.actual_output,
            "model_name": r.model_name or "unknown",
            "semantic_similarity": r.semantic_similarity,
            "relevance_score": r.relevance_score,
            "hallucination_score": r.hallucination_score,
            "groundedness_score": r.groundedness_score,
            "composite_score": r.composite_score,
            "quality_label": r.quality_label,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in records
    ]

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
            writer.writeheader()
            writer.writerows(data)
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=evalforge_evaluations_{timestamp}.csv"},
        )

    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=evalforge_evaluations_{timestamp}.json"},
    )


@router.get("/benchmarks")
async def export_benchmarks(
    format: str = Query("json", pattern="^(json|csv)$"),
    limit: int = Query(500, ge=1, le=5000),
    db: Session = Depends(get_db),
):
    """Export benchmark history as CSV or JSON."""
    records = (
        db.query(BenchmarkRecord)
        .order_by(BenchmarkRecord.created_at.desc())
        .limit(limit)
        .all()
    )

    data = [
        {
            "id": r.id,
            "prompt": r.prompt,
            "model_name": r.model_name,
            "output": r.output,
            "latency_ms": r.latency_ms,
            "semantic_similarity": r.semantic_similarity,
            "token_count": r.token_count,
            "cost_estimate": r.cost_estimate,
            "error": r.error,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in records
    ]

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

    if format == "csv":
        output = io.StringIO()
        if data:
            writer = csv.DictWriter(output, fieldnames=list(data[0].keys()))
            writer.writeheader()
            writer.writerows(data)
        output.seek(0)
        return StreamingResponse(
            output,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=evalforge_benchmarks_{timestamp}.csv"},
        )

    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=evalforge_benchmarks_{timestamp}.json"},
    )
