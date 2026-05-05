"""
EvalForge - Embedding Utilities
Provides semantic embedding generation and similarity computation.
"""

import numpy as np
from typing import List, Optional
from functools import lru_cache


class EmbeddingService:
    """Handles text embedding generation and similarity calculations."""

    _instance = None
    _model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def _load_model(self):
        """Lazy-load the sentence transformer model."""
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            from app.core.config import settings
            print(f"📦 Loading embedding model: {settings.EMBEDDING_MODEL}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            print("✅ Embedding model loaded successfully")
        return self._model

    def encode(self, texts: List[str]) -> np.ndarray:
        """Generate embeddings for a list of texts."""
        model = self._load_model()
        embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings

    def encode_single(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        return self.encode([text])[0]

    @staticmethod
    def cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compute cosine similarity between two embeddings."""
        dot_product = np.dot(embedding1, embedding2)
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        if norm1 == 0 or norm2 == 0:
            return 0.0
        return float(dot_product / (norm1 * norm2))

    def semantic_similarity(self, text1: str, text2: str) -> float:
        """Compute semantic similarity between two texts."""
        embeddings = self.encode([text1, text2])
        return self.cosine_similarity(embeddings[0], embeddings[1])

    def batch_similarity(self, reference: str, candidates: List[str]) -> List[float]:
        """Compute similarity of multiple candidates against a reference."""
        all_texts = [reference] + candidates
        embeddings = self.encode(all_texts)
        ref_embedding = embeddings[0]
        similarities = [
            self.cosine_similarity(ref_embedding, emb)
            for emb in embeddings[1:]
        ]
        return similarities


# Singleton instance
embedding_service = EmbeddingService()
