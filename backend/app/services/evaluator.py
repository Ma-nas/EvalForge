"""
EvalForge - LLM Evaluator Service
Core evaluation logic for measuring LLM output quality.
"""

import uuid
import time
import numpy as np
from typing import Dict, List, Optional
from datetime import datetime

from app.core.embeddings import embedding_service
from app.core.scoring import EvaluationScore, scoring_engine
from app.models.schemas import (
    EvaluationRequest,
    EvaluationResponse,
    BatchEvaluationRequest,
    BatchEvaluationResponse,
)


class EvaluatorService:
    """Evaluates LLM outputs against expected outputs and context."""

    def __init__(self):
        self.embedding_service = embedding_service

    def evaluate_single(self, request: EvaluationRequest) -> EvaluationResponse:
        """Evaluate a single LLM output."""
        eval_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        # 1. Compute semantic similarity between expected and actual output
        semantic_sim = self.embedding_service.semantic_similarity(
            request.expected_output, request.actual_output
        )

        # 2. Compute relevance score (how relevant is the output to the prompt)
        relevance = self.embedding_service.semantic_similarity(
            request.prompt, request.actual_output
        )

        # 3. Compute hallucination score
        hallucination = self._compute_hallucination_score(
            context=request.context,
            actual_output=request.actual_output,
            expected_output=request.expected_output,
        )

        # 4. Compute groundedness score (if context provided)
        groundedness = 0.0
        if request.context:
            groundedness = self.embedding_service.semantic_similarity(
                request.context, request.actual_output
            )

        # 5. Build score object
        score = EvaluationScore(
            semantic_similarity=semantic_sim,
            relevance_score=relevance,
            hallucination_score=hallucination,
            groundedness_score=groundedness,
        )

        # 6. Compute composite score
        score.composite_score = scoring_engine.compute_composite_score({
            "semantic_similarity": semantic_sim,
            "relevance_score": relevance,
            "hallucination_score": hallucination,
            "groundedness_score": groundedness,
        })

        # 7. Generate flags
        score.flags = scoring_engine.generate_flags(score)

        # 8. Quality classification
        quality_label = scoring_engine.classify_quality(score.composite_score)

        latency = (time.time() - start_time) * 1000

        return EvaluationResponse(
            id=eval_id,
            prompt=request.prompt[:100],
            semantic_similarity=score.semantic_similarity,
            relevance_score=score.relevance_score,
            hallucination_score=score.hallucination_score,
            groundedness_score=score.groundedness_score,
            composite_score=score.composite_score,
            quality_label=quality_label,
            flags=score.flags,
            details={
                "model_name": request.model_name or "unknown",
                "latency_ms": round(latency, 2),
                "prompt_length": len(request.prompt),
                "output_length": len(request.actual_output),
                "context_provided": request.context is not None,
            },
            timestamp=datetime.utcnow().isoformat(),
        )

    def evaluate_batch(self, request: BatchEvaluationRequest) -> BatchEvaluationResponse:
        """Evaluate a batch of LLM outputs."""
        results = []
        quality_dist = {"Excellent": 0, "Good": 0, "Fair": 0, "Poor": 0, "Critical": 0}

        for sample in request.samples:
            if request.model_name:
                sample.model_name = request.model_name
            result = self.evaluate_single(sample)
            results.append(result)
            quality_dist[result.quality_label] = quality_dist.get(result.quality_label, 0) + 1

        n = len(results)
        return BatchEvaluationResponse(
            total_samples=n,
            avg_semantic_similarity=round(sum(r.semantic_similarity for r in results) / n, 4) if n else 0,
            avg_relevance_score=round(sum(r.relevance_score for r in results) / n, 4) if n else 0,
            avg_hallucination_score=round(sum(r.hallucination_score for r in results) / n, 4) if n else 0,
            avg_groundedness_score=round(sum(r.groundedness_score for r in results) / n, 4) if n else 0,
            avg_composite_score=round(sum(r.composite_score for r in results) / n, 4) if n else 0,
            quality_distribution=quality_dist,
            results=results,
            timestamp=datetime.utcnow().isoformat(),
        )

    def _compute_hallucination_score(
        self,
        context: Optional[str],
        actual_output: str,
        expected_output: str,
    ) -> float:
        """
        Compute hallucination score (0 = no hallucination, 1 = fully hallucinated).
        Uses multiple signals:
        - Semantic divergence from expected output
        - Context grounding (if context provided)
        - Sentence-level analysis
        """
        scores = []

        # Signal 1: Inverse semantic similarity to expected output
        sim_to_expected = self.embedding_service.semantic_similarity(
            expected_output, actual_output
        )
        scores.append(1.0 - sim_to_expected)

        # Signal 2: Context grounding check
        if context:
            sim_to_context = self.embedding_service.semantic_similarity(
                context, actual_output
            )
            # If output is far from context, it may be hallucinated
            scores.append(1.0 - sim_to_context)

        # Signal 3: Sentence-level divergence
        output_sentences = self._split_sentences(actual_output)
        if output_sentences and context:
            sentence_scores = []
            for sentence in output_sentences[:10]:  # Limit to first 10 sentences
                if len(sentence.strip()) > 10:
                    sent_sim = self.embedding_service.semantic_similarity(
                        context, sentence
                    )
                    sentence_scores.append(1.0 - sent_sim)
            if sentence_scores:
                scores.append(np.mean(sentence_scores))

        return float(np.mean(scores)) if scores else 0.5

    @staticmethod
    def _split_sentences(text: str) -> List[str]:
        """Simple sentence splitting."""
        import re
        sentences = re.split(r'(?<=[.!?])\s+', text)
        return [s.strip() for s in sentences if s.strip()]


evaluator_service = EvaluatorService()
