"""
EvalForge - Pydantic Schemas
Request/Response models for the API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ─── Enums ────────────────────────────────────────────────

class ModelProvider(str, Enum):
    GEMINI = "gemini"
    OPENAI = "openai"
    LOCAL = "local"


class EvaluationType(str, Enum):
    SINGLE = "single"
    BATCH = "batch"
    RAG = "rag"


# ─── Evaluation Schemas ──────────────────────────────────

class EvaluationRequest(BaseModel):
    """Request body for single evaluation."""
    prompt: str = Field(..., description="The input prompt sent to the LLM")
    context: Optional[str] = Field(None, description="Context/reference document")
    expected_output: str = Field(..., description="Expected/ground-truth output")
    actual_output: str = Field(..., description="The LLM's actual output")
    model_name: Optional[str] = Field(None, description="Name of the model that generated the output")


class EvaluationResponse(BaseModel):
    """Response for a single evaluation."""
    id: str
    prompt: str
    semantic_similarity: float
    relevance_score: float
    hallucination_score: float
    groundedness_score: float
    composite_score: float
    quality_label: str
    flags: List[str]
    details: Dict[str, Any]
    timestamp: str


class BatchEvaluationRequest(BaseModel):
    """Request body for batch evaluation."""
    samples: List[EvaluationRequest]
    model_name: Optional[str] = None


class BatchEvaluationResponse(BaseModel):
    """Response for batch evaluation."""
    total_samples: int
    avg_semantic_similarity: float
    avg_relevance_score: float
    avg_hallucination_score: float
    avg_groundedness_score: float
    avg_composite_score: float
    quality_distribution: Dict[str, int]
    results: List[EvaluationResponse]
    timestamp: str


# ─── Hallucination Schemas ────────────────────────────────

class HallucinationRequest(BaseModel):
    """Request for hallucination detection."""
    context: str = Field(..., description="Source context/document")
    output: str = Field(..., description="LLM output to check")
    prompt: Optional[str] = Field(None, description="Original prompt")


class HallucinationClaim(BaseModel):
    """A single claim extracted from the output."""
    claim: str
    is_supported: bool
    confidence: float
    evidence: Optional[str] = None


class HallucinationResponse(BaseModel):
    """Response for hallucination detection."""
    hallucination_score: float
    total_claims: int
    supported_claims: int
    unsupported_claims: int
    claims: List[HallucinationClaim]
    flags: List[str]
    details: Dict[str, Any]


# ─── Benchmark Schemas ────────────────────────────────────

class BenchmarkRequest(BaseModel):
    """Request for multi-model benchmarking."""
    prompt: str = Field(..., description="Prompt to benchmark")
    context: Optional[str] = Field(None, description="Optional context")
    expected_output: Optional[str] = Field(None, description="Optional expected output")
    models: List[str] = Field(
        default=["gemini"],
        description="Models to benchmark (gemini, openai)"
    )


class BenchmarkModelResult(BaseModel):
    """Result for a single model in benchmark."""
    model_name: str
    output: str
    latency_ms: float
    semantic_similarity: Optional[float] = None
    hallucination_score: Optional[float] = None
    token_count: Optional[int] = None
    cost_estimate: Optional[float] = None
    error: Optional[str] = None


class BenchmarkResponse(BaseModel):
    """Response for benchmarking."""
    prompt: str
    results: List[BenchmarkModelResult]
    best_model: str
    summary: Dict[str, Any]
    timestamp: str


class BatchBenchmarkRequest(BaseModel):
    """Request for batch benchmarking."""
    samples: List[BenchmarkRequest]
    models: List[str] = Field(default=["gemini"])


class BatchBenchmarkResponse(BaseModel):
    """Response for batch benchmarking."""
    total_samples: int
    models_compared: List[str]
    model_summaries: Dict[str, Any]
    best_overall_model: str
    timestamp: str


# ─── RAG Schemas ──────────────────────────────────────────

class RAGEvaluationRequest(BaseModel):
    """Request for RAG evaluation."""
    query: str = Field(..., description="User query")
    retrieved_contexts: List[str] = Field(..., description="Retrieved document chunks")
    generated_output: str = Field(..., description="RAG-generated output")
    ground_truth: Optional[str] = Field(None, description="Ground truth answer")


class RAGEvaluationResponse(BaseModel):
    """Response for RAG evaluation."""
    retrieval_precision: float
    context_relevance: float
    answer_relevance: float
    groundedness_score: float
    faithfulness_score: float
    composite_rag_score: float
    details: Dict[str, Any]
    flags: List[str]
    timestamp: str


# ─── Dataset Schemas ──────────────────────────────────────

class DatasetInfo(BaseModel):
    """Information about an uploaded dataset."""
    id: str
    filename: str
    format: str
    total_rows: int
    columns: List[str]
    preview: List[Dict[str, Any]]
    uploaded_at: str


class DatasetListResponse(BaseModel):
    """Response for listing datasets."""
    datasets: List[DatasetInfo]
    total: int


# ─── Dashboard Schemas ───────────────────────────────────

class DashboardStats(BaseModel):
    """Dashboard statistics."""
    total_evaluations: int
    avg_accuracy: float
    avg_hallucination_rate: float
    avg_latency_ms: float
    models_benchmarked: int
    datasets_uploaded: int
    recent_evaluations: List[Dict[str, Any]]
    score_distribution: Dict[str, int]
    model_comparison: List[Dict[str, Any]]
