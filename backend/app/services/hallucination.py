"""
EvalForge - Hallucination Detection Module
Detects unsupported claims and fabricated facts in LLM outputs.
"""

import re
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime

from app.core.embeddings import embedding_service
from app.models.schemas import (
    HallucinationRequest,
    HallucinationResponse,
    HallucinationClaim,
)


class HallucinationDetector:
    """
    Detects hallucinations in LLM outputs by:
    1. Extracting individual claims from the output
    2. Verifying each claim against the source context
    3. Computing a hallucination score
    """

    # Threshold for considering a claim as supported
    SUPPORT_THRESHOLD = 0.55
    HIGH_SUPPORT_THRESHOLD = 0.70

    def __init__(self):
        self.embedding_service = embedding_service

    def detect(self, request: HallucinationRequest) -> HallucinationResponse:
        """Run full hallucination detection on an LLM output."""

        # Step 1: Extract claims from the output
        claims_text = self._extract_claims(request.output)

        # Step 2: Split context into chunks for fine-grained matching
        context_chunks = self._chunk_context(request.context)

        # Step 3: Verify each claim against the context
        verified_claims = []
        for claim_text in claims_text:
            claim = self._verify_claim(claim_text, context_chunks, request.context)
            verified_claims.append(claim)

        # Step 4: Compute overall hallucination score
        total = len(verified_claims)
        supported = sum(1 for c in verified_claims if c.is_supported)
        unsupported = total - supported

        hallucination_score = unsupported / total if total > 0 else 0.0

        # Step 5: Generate flags
        flags = self._generate_flags(hallucination_score, verified_claims)

        return HallucinationResponse(
            hallucination_score=round(hallucination_score, 4),
            total_claims=total,
            supported_claims=supported,
            unsupported_claims=unsupported,
            claims=verified_claims,
            flags=flags,
            details={
                "context_chunks": len(context_chunks),
                "avg_claim_confidence": round(
                    np.mean([c.confidence for c in verified_claims]), 4
                ) if verified_claims else 0,
                "support_threshold": self.SUPPORT_THRESHOLD,
            },
        )

    def _extract_claims(self, text: str) -> List[str]:
        """Extract individual claims/statements from text."""
        # Split by sentences
        sentences = re.split(r'(?<=[.!?])\s+', text)
        claims = []
        for sentence in sentences:
            sentence = sentence.strip()
            # Filter out very short or non-claim sentences
            if len(sentence) > 15 and not sentence.startswith(("?", "!")):
                # Split compound sentences
                sub_claims = re.split(r'\s*(?:;\s*|,\s*(?:and|but|however|also)\s+)', sentence)
                for claim in sub_claims:
                    claim = claim.strip()
                    if len(claim) > 15:
                        claims.append(claim)
        return claims if claims else [text]

    def _chunk_context(self, context: str, chunk_size: int = 200, overlap: int = 50) -> List[str]:
        """Split context into overlapping chunks for matching."""
        words = context.split()
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        if not chunks:
            chunks = [context]
        return chunks

    def _verify_claim(
        self,
        claim: str,
        context_chunks: List[str],
        full_context: str,
    ) -> HallucinationClaim:
        """Verify a single claim against context chunks."""

        # Compute similarity against each context chunk
        chunk_similarities = self.embedding_service.batch_similarity(claim, context_chunks)

        max_similarity = max(chunk_similarities) if chunk_similarities else 0.0
        best_chunk_idx = int(np.argmax(chunk_similarities)) if chunk_similarities else 0

        # Also check against full context
        full_sim = self.embedding_service.semantic_similarity(claim, full_context)

        # Use the better of chunk-level and full-context similarity
        best_similarity = max(max_similarity, full_sim)

        is_supported = best_similarity >= self.SUPPORT_THRESHOLD
        confidence = best_similarity

        # Find evidence
        evidence = None
        if is_supported and context_chunks:
            evidence = context_chunks[best_chunk_idx][:200] + "..."

        return HallucinationClaim(
            claim=claim[:200],
            is_supported=is_supported,
            confidence=round(confidence, 4),
            evidence=evidence,
        )

    def _generate_flags(
        self,
        hallucination_score: float,
        claims: List[HallucinationClaim],
    ) -> List[str]:
        """Generate warning flags based on detection results."""
        flags = []

        if hallucination_score > 0.6:
            flags.append("🚨 CRITICAL: Majority of claims are unsupported by context")
        elif hallucination_score > 0.3:
            flags.append("⚠️ WARNING: Significant hallucination detected")
        elif hallucination_score > 0.1:
            flags.append("🔶 NOTICE: Minor unsupported claims detected")
        else:
            flags.append("✅ Output is well-grounded in the provided context")

        # Check for low-confidence claims
        low_conf_claims = [c for c in claims if c.confidence < 0.4]
        if low_conf_claims:
            flags.append(f"📉 {len(low_conf_claims)} claim(s) have very low confidence")

        # Check for fabricated facts pattern
        unsupported = [c for c in claims if not c.is_supported]
        if len(unsupported) > 3:
            flags.append("🔴 Multiple fabricated facts detected - output may be unreliable")

        return flags


hallucination_detector = HallucinationDetector()
