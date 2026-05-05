"""
EvalForge - Scoring Engine
Computes composite evaluation scores from individual metrics.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field
import numpy as np


@dataclass
class EvaluationScore:
    """Represents a complete evaluation result."""
    semantic_similarity: float = 0.0
    relevance_score: float = 0.0
    hallucination_score: float = 0.0
    groundedness_score: float = 0.0
    composite_score: float = 0.0
    flags: List[str] = field(default_factory=list)
    details: Dict = field(default_factory=dict)

    def to_dict(self) -> Dict:
        return {
            "semantic_similarity": round(self.semantic_similarity, 4),
            "relevance_score": round(self.relevance_score, 4),
            "hallucination_score": round(self.hallucination_score, 4),
            "groundedness_score": round(self.groundedness_score, 4),
            "composite_score": round(self.composite_score, 4),
            "flags": self.flags,
            "details": self.details,
        }


@dataclass
class BenchmarkResult:
    """Represents a benchmarking result for a single model."""
    model_name: str = ""
    accuracy: float = 0.0
    avg_latency_ms: float = 0.0
    cost_per_1k_tokens: float = 0.0
    semantic_similarity: float = 0.0
    hallucination_rate: float = 0.0
    total_samples: int = 0
    successful_samples: int = 0
    details: Dict = field(default_factory=dict)

    def to_dict(self) -> Dict:
        return {
            "model_name": self.model_name,
            "accuracy": round(self.accuracy, 4),
            "avg_latency_ms": round(self.avg_latency_ms, 2),
            "cost_per_1k_tokens": round(self.cost_per_1k_tokens, 6),
            "semantic_similarity": round(self.semantic_similarity, 4),
            "hallucination_rate": round(self.hallucination_rate, 4),
            "total_samples": self.total_samples,
            "successful_samples": self.successful_samples,
            "details": self.details,
        }


class ScoringEngine:
    """Computes composite scores from individual evaluation metrics."""

    # Default weights for composite scoring
    DEFAULT_WEIGHTS = {
        "semantic_similarity": 0.35,
        "relevance_score": 0.25,
        "hallucination_score": 0.25,
        "groundedness_score": 0.15,
    }

    @staticmethod
    def compute_composite_score(
        scores: Dict[str, float],
        weights: Optional[Dict[str, float]] = None,
    ) -> float:
        """Compute weighted composite score from individual metrics."""
        if weights is None:
            weights = ScoringEngine.DEFAULT_WEIGHTS

        composite = 0.0
        total_weight = 0.0

        for metric, weight in weights.items():
            if metric in scores and scores[metric] is not None:
                # Hallucination score is inverted (lower is better)
                if metric == "hallucination_score":
                    composite += (1.0 - scores[metric]) * weight
                else:
                    composite += scores[metric] * weight
                total_weight += weight

        if total_weight == 0:
            return 0.0

        return composite / total_weight

    @staticmethod
    def classify_quality(composite_score: float) -> str:
        """Classify output quality based on composite score."""
        if composite_score >= 0.9:
            return "Excellent"
        elif composite_score >= 0.75:
            return "Good"
        elif composite_score >= 0.6:
            return "Fair"
        elif composite_score >= 0.4:
            return "Poor"
        else:
            return "Critical"

    @staticmethod
    def generate_flags(score: EvaluationScore) -> List[str]:
        """Generate warning flags based on evaluation scores."""
        flags = []

        if score.hallucination_score > 0.5:
            flags.append("🚨 High hallucination risk detected")
        elif score.hallucination_score > 0.3:
            flags.append("⚠️ Moderate hallucination risk")

        if score.semantic_similarity < 0.5:
            flags.append("📉 Low semantic similarity to expected output")

        if score.relevance_score < 0.4:
            flags.append("❌ Low relevance to provided context")

        if score.groundedness_score < 0.5:
            flags.append("⛔ Output poorly grounded in context")

        if not flags:
            flags.append("✅ Output quality is acceptable")

        return flags

    @staticmethod
    def aggregate_benchmark_results(results: List[BenchmarkResult]) -> Dict:
        """Aggregate multiple benchmark results into a summary."""
        if not results:
            return {}

        summary = {
            "total_models": len(results),
            "best_accuracy": max(r.accuracy for r in results),
            "best_accuracy_model": max(results, key=lambda r: r.accuracy).model_name,
            "fastest_model": min(results, key=lambda r: r.avg_latency_ms).model_name,
            "fastest_latency_ms": min(r.avg_latency_ms for r in results),
            "cheapest_model": min(results, key=lambda r: r.cost_per_1k_tokens).model_name,
            "lowest_hallucination_model": min(results, key=lambda r: r.hallucination_rate).model_name,
            "models": [r.to_dict() for r in results],
        }
        return summary


scoring_engine = ScoringEngine()
