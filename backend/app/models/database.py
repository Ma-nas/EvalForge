"""
EvalForge - Database Models
SQLAlchemy ORM models for persistent storage.
"""

from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

from app.core.config import settings, logger

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for getting database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─── User Model ───────────────────────────────────────────

class User(Base):
    """Stores user accounts for authentication."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Evaluation Model ─────────────────────────────────────

class EvaluationRecord(Base):
    """Stores evaluation results."""
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prompt = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    expected_output = Column(Text, nullable=False)
    actual_output = Column(Text, nullable=False)
    model_name = Column(String, nullable=True)
    semantic_similarity = Column(Float, default=0.0)
    relevance_score = Column(Float, default=0.0)
    hallucination_score = Column(Float, default=0.0)
    groundedness_score = Column(Float, default=0.0)
    composite_score = Column(Float, default=0.0)
    quality_label = Column(String, default="Unknown")
    flags = Column(JSON, default=list)
    details = Column(JSON, default=dict)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Benchmark Model ──────────────────────────────────────

class BenchmarkRecord(Base):
    """Stores benchmark results."""
    __tablename__ = "benchmarks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prompt = Column(Text, nullable=False)
    model_name = Column(String, nullable=False)
    output = Column(Text, nullable=True)
    latency_ms = Column(Float, default=0.0)
    semantic_similarity = Column(Float, nullable=True)
    hallucination_score = Column(Float, nullable=True)
    token_count = Column(Integer, nullable=True)
    cost_estimate = Column(Float, nullable=True)
    error = Column(Text, nullable=True)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Dataset Model ────────────────────────────────────────

class DatasetRecord(Base):
    """Stores uploaded dataset metadata."""
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    format = Column(String, nullable=False)
    total_rows = Column(Integer, default=0)
    columns = Column(JSON, default=list)
    file_path = Column(String, nullable=False)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Hallucination Model ──────────────────────────────────

class HallucinationRecord(Base):
    """Stores hallucination detection results."""
    __tablename__ = "hallucinations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    context = Column(Text, nullable=False)
    output = Column(Text, nullable=False)
    prompt = Column(Text, nullable=True)
    hallucination_score = Column(Float, default=0.0)
    total_claims = Column(Integer, default=0)
    supported_claims = Column(Integer, default=0)
    unsupported_claims = Column(Integer, default=0)
    claims = Column(JSON, default=list)
    flags = Column(JSON, default=list)
    details = Column(JSON, default=dict)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── RAG Model ────────────────────────────────────────────

class RAGRecord(Base):
    """Stores RAG evaluation results."""
    __tablename__ = "rag_evaluations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    query = Column(Text, nullable=False)
    retrieved_contexts = Column(JSON, default=list)
    generated_output = Column(Text, nullable=False)
    ground_truth = Column(Text, nullable=True)
    retrieval_precision = Column(Float, default=0.0)
    context_relevance = Column(Float, default=0.0)
    answer_relevance = Column(Float, default=0.0)
    groundedness_score = Column(Float, default=0.0)
    faithfulness_score = Column(Float, default=0.0)
    composite_rag_score = Column(Float, default=0.0)
    flags = Column(JSON, default=list)
    details = Column(JSON, default=dict)
    user_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


from sqlalchemy import text

# Create all tables
def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)
    try:
        with engine.connect() as conn:

            for table_name in ["datasets", "evaluations", "benchmarks"]:
                cursor = conn.execute(text(f"PRAGMA table_info({table_name})"))
                cols = [row[1] for row in cursor.fetchall()]
                if cols and "user_id" not in cols:
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN user_id VARCHAR"))
                    conn.commit()
    except Exception as e:
        logger.debug(f"Migration check: {e}")
    logger.info("Database tables initialized successfully")




