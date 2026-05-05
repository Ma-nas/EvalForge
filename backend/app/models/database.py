"""
EvalForge - Database Models
SQLAlchemy ORM models for persistent storage.
"""

from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for getting database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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
    created_at = Column(DateTime, default=datetime.utcnow)


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
    created_at = Column(DateTime, default=datetime.utcnow)


class DatasetRecord(Base):
    """Stores uploaded dataset metadata."""
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, nullable=False)
    format = Column(String, nullable=False)
    total_rows = Column(Integer, default=0)
    columns = Column(JSON, default=list)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
