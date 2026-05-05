"""
EvalForge - RAG Evaluation Service
Evaluates Retrieval-Augmented Generation pipelines.
"""

import numpy as np
from typing import List, Dict
from datetime import datetime

from app.core.embeddings import embedding_service
from app.models.schemas import RAGEvaluationRequest, RAGEvaluationResponse


class RAGEvaluatorService:
    """Evaluates RAG pipeline quality: retrieval precision, context relevance, faithfulness."""

    def evaluate(self, request: RAGEvaluationRequest) -> RAGEvaluationResponse:
        # 1. Retrieval Precision - how relevant are retrieved docs to the query
        context_sims = embedding_service.batch_similarity(request.query, request.retrieved_contexts)
        retrieval_precision = float(np.mean([1.0 if s > 0.5 else 0.0 for s in context_sims])) if context_sims else 0.0

        # 2. Context Relevance - average similarity of contexts to query
        context_relevance = float(np.mean(context_sims)) if context_sims else 0.0

        # 3. Answer Relevance - how relevant is the answer to the query
        answer_relevance = embedding_service.semantic_similarity(request.query, request.generated_output)

        # 4. Groundedness - how grounded is the answer in retrieved contexts
        combined_context = " ".join(request.retrieved_contexts)
        groundedness = embedding_service.semantic_similarity(combined_context, request.generated_output)

        # 5. Faithfulness - sentence-level grounding check
        import re
        sentences = re.split(r'(?<=[.!?])\s+', request.generated_output)
        faithful_count = 0
        total_sentences = 0
        for sent in sentences:
            if len(sent.strip()) > 10:
                total_sentences += 1
                sent_sim = embedding_service.semantic_similarity(combined_context, sent)
                if sent_sim > 0.5:
                    faithful_count += 1
        faithfulness = faithful_count / total_sentences if total_sentences > 0 else 0.0

        # 6. Composite RAG Score
        composite = (retrieval_precision * 0.2 + context_relevance * 0.2 +
                     answer_relevance * 0.2 + groundedness * 0.2 + faithfulness * 0.2)

        # Ground truth comparison
        details = {"context_similarities": [round(s, 4) for s in context_sims], "num_contexts": len(request.retrieved_contexts)}
        if request.ground_truth:
            gt_sim = embedding_service.semantic_similarity(request.ground_truth, request.generated_output)
            details["ground_truth_similarity"] = round(gt_sim, 4)
            composite = composite * 0.7 + gt_sim * 0.3

        # Flags
        flags = []
        if retrieval_precision < 0.5:
            flags.append("⚠️ Low retrieval precision - retrieved documents may not be relevant")
        if groundedness < 0.5:
            flags.append("🚨 Low groundedness - answer may contain unsupported information")
        if faithfulness < 0.5:
            flags.append("⚠️ Low faithfulness - some claims not supported by context")
        if context_relevance < 0.4:
            flags.append("📉 Context relevance is low - consider improving retrieval")
        if not flags:
            flags.append("✅ RAG pipeline quality is good")

        return RAGEvaluationResponse(
            retrieval_precision=round(retrieval_precision, 4),
            context_relevance=round(context_relevance, 4),
            answer_relevance=round(answer_relevance, 4),
            groundedness_score=round(groundedness, 4),
            faithfulness_score=round(faithfulness, 4),
            composite_rag_score=round(composite, 4),
            details=details, flags=flags,
            timestamp=datetime.utcnow().isoformat(),
        )

rag_evaluator_service = RAGEvaluatorService()
