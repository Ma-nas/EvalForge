"""
EvalForge - Pydantic Schemas
Request/Response models for the API.
"""

from pydantic import BaseModel, Field, field_validator
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


# ─── Auth Schemas ─────────────────────────────────────────

class UserCreate(BaseModel):
    """Request body for user registration."""
    email: str = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format")
        return v.lower().strip()


class UserLogin(BaseModel):
    """Request body for login."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="Password")


class UserResponse(BaseModel):
    """Response for user info."""
    id: str
    email: str
    username: str
    created_at: str


class TokenResponse(BaseModel):
    """Response for authentication token."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ─── Evaluation Schemas ──────────────────────────────────

class EvaluationRequest(BaseModel):
    """Request body for single evaluation."""
    prompt: str = Field(..., min_length=1, description="The input prompt sent to the LLM")
    context: Optional[str] = Field(None, description="Context/reference document")
    expected_output: str = Field(..., min_length=1, description="Expected/ground-truth output")
    actual_output: str = Field(..., min_length=1, description="The LLM's actual output")
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
    context: str = Field(..., min_length=10, description="Source context/document")
    output: str = Field(..., min_length=10, description="LLM output to check")
    prompt: Optional[str] = Field(None, description="Original prompt")


class HallucinationClaim(BaseModel):
    """A single claim extracted from the output."""
    claim: str
    is_supported: bool
    confidence: float
    evidence: Optional[str] = None


class HallucinationResponse(BaseModel):
    """Response for hallucination detection."""
    id: Optional[str] = None
    hallucination_score: float
    total_claims: int
    supported_claims: int
    unsupported_claims: int
    claims: List[HallucinationClaim]
    flags: List[str]
    details: Dict[str, Any]
    timestamp: Optional[str] = None


# ─── Benchmark Schemas ────────────────────────────────────

class BenchmarkRequest(BaseModel):
    """Request for multi-model benchmarking."""
    prompt: str = Field(..., min_length=1, description="Prompt to benchmark")
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
    query: str = Field(..., min_length=1, description="User query")
    retrieved_contexts: List[str] = Field(..., min_length=1, description="Retrieved document chunks")
    generated_output: str = Field(..., min_length=1, description="RAG-generated output")
    ground_truth: Optional[str] = Field(None, description="Ground truth answer")


class RAGEvaluationResponse(BaseModel):
    """Response for RAG evaluation."""
    id: Optional[str] = None
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

class DatasetBatchEvaluateRequest(BaseModel):
    """Request to batch evaluate rows from an existing dataset."""
    prompt_column: str = "question"
    expected_output_column: str = "best_answer"
    context_column: Optional[str] = None
    actual_output_column: Optional[str] = None
    model_name: Optional[str] = "gemini-1.5-flash"
    max_samples: int = 20


class DatasetInfo(BaseModel):
    """Information about an uploaded dataset."""
    id: str
    filename: str
    format: str
    total_rows: int
    columns: List[str]
    preview: List[Dict[str, Any]] = []
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


class DashboardSummaryResponse(BaseModel):
    """Response for dashboard summary endpoint."""
    metrics: Dict[str, Any]
    model_comparison: List[Dict[str, Any]]
    quality_distribution: Dict[str, int]
    trend_data: List[Dict[str, Any]]
    recent_evaluations: List[Dict[str, Any]]
