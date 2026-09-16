"""
EvalForge - Dashboard API Routes
Provides aggregated metrics from real database records.
"""

from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.database import get_db, EvaluationRecord, BenchmarkRecord, DatasetRecord
from app.models.schemas import DashboardSummaryResponse
from app.core.config import logger

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Get aggregated dashboard metrics from real database records.
    Returns evaluation stats, model comparisons, quality distribution, and trends.
    """
    # ── Total Evaluations & Averages ──
    eval_count = db.query(func.count(EvaluationRecord.id)).scalar() or 0
    avg_similarity = db.query(func.avg(EvaluationRecord.semantic_similarity)).scalar() or 0.0
    avg_hallucination = db.query(func.avg(EvaluationRecord.hallucination_score)).scalar() or 0.0
    avg_composite = db.query(func.avg(EvaluationRecord.composite_score)).scalar() or 0.0

    # ── Benchmark Stats ──
    benchmark_models = db.query(func.count(func.distinct(BenchmarkRecord.model_name))).scalar() or 0
    avg_latency = db.query(func.avg(BenchmarkRecord.latency_ms)).scalar() or 0.0

    # ── Dataset Count ──
    dataset_count = db.query(func.count(DatasetRecord.id)).scalar() or 0

    # ── Quality Distribution ──
    quality_dist = {"Excellent": 0, "Good": 0, "Fair": 0, "Poor": 0, "Critical": 0}
    dist_rows = (
        db.query(EvaluationRecord.quality_label, func.count(EvaluationRecord.id))
        .group_by(EvaluationRecord.quality_label)
        .all()
    )
    for label, count in dist_rows:
        if label in quality_dist:
            quality_dist[label] = count

    # ── Model Comparison (from benchmarks) ──
    model_comparison = []
    model_stats = (
        db.query(
            BenchmarkRecord.model_name,
            func.avg(BenchmarkRecord.semantic_similarity),
            func.avg(BenchmarkRecord.latency_ms),
            func.avg(BenchmarkRecord.cost_estimate),
            func.count(BenchmarkRecord.id),
        )
        .group_by(BenchmarkRecord.model_name)
        .all()
    )
    for model_name, avg_sim, avg_lat, avg_cost, count in model_stats:
        model_comparison.append({
            "model": model_name,
            "accuracy": round((avg_sim or 0) * 100, 1),
            "latency": round(avg_lat or 0, 1),
            "cost": round(avg_cost or 0, 6),
            "runs": count,
        })

    # ── Weekly Trend Data (last 7 days) ──
    trend_data = []
    today = datetime.utcnow().date()
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())

        day_evals = (
            db.query(
                func.avg(EvaluationRecord.composite_score),
                func.avg(EvaluationRecord.hallucination_score),
                func.count(EvaluationRecord.id),
            )
            .filter(EvaluationRecord.created_at.between(day_start, day_end))
            .first()
        )

        avg_acc, avg_hall, count = day_evals
        trend_data.append({
            "day": day.strftime("%a"),
            "date": day.isoformat(),
            "accuracy": round((avg_acc or 0) * 100, 1),
            "hallucination": round((avg_hall or 0) * 100, 1),
            "count": count or 0,
        })

    # ── Recent Evaluations ──
    recent = (
        db.query(EvaluationRecord)
        .order_by(EvaluationRecord.created_at.desc())
        .limit(10)
        .all()
    )
    recent_evals = [
        {
            "id": r.id,
            "prompt": (r.prompt[:80] + "...") if len(r.prompt) > 80 else r.prompt,
            "model": r.model_name or "unknown",
            "composite_score": round(r.composite_score, 4),
            "quality_label": r.quality_label,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in recent
    ]

    logger.debug(f"Dashboard summary: {eval_count} evals, {benchmark_models} models, {dataset_count} datasets")

    return DashboardSummaryResponse(
        metrics={
            "total_evaluations": eval_count,
            "avg_accuracy": round(avg_composite, 4),
            "avg_hallucination_rate": round(avg_hallucination, 4),
            "avg_latency_ms": round(avg_latency, 1),
            "models_benchmarked": benchmark_models,
            "datasets_uploaded": dataset_count,
        },
        model_comparison=model_comparison,
        quality_distribution=quality_dist,
        trend_data=trend_data,
        recent_evaluations=recent_evals,
    )
