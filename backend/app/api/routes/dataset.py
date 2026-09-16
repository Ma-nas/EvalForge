"""
EvalForge - Dataset Management API Routes
Upload, list, preview, seed, and evaluate datasets.
"""

import os
import uuid
import shutil
from pathlib import Path
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.config import settings, logger
from app.models.database import get_db, DatasetRecord, EvaluationRecord
from app.models.schemas import (
    DatasetInfo,
    DatasetListResponse,
    DatasetBatchEvaluateRequest,
    BatchEvaluationResponse,
    EvaluationRequest,
)
from app.services.evaluator import evaluator_service
from app.services.benchmark import benchmark_service

router = APIRouter(prefix="/datasets", tags=["Datasets"])

# Allowed file extensions and MIME types
ALLOWED_EXTENSIONS = {"csv", "json"}
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024  # Convert to bytes


def seed_default_datasets(db: Session):
    """Seed sample datasets if the database table is empty."""
    existing_count = db.query(DatasetRecord).count()
    if existing_count > 0:
        return

    sample_files = [
        ("truthfulqa_sample.csv", "csv"),
        ("squad_sample.json", "json"),
    ]

    for filename, fmt in sample_files:
        src_path = settings.DATASETS_DIR / filename
        if not src_path.exists():
            continue

        dataset_id = f"seed-{uuid.uuid4().hex[:6]}"
        dest_path = settings.UPLOADS_DIR / f"{dataset_id}_{filename}"
        shutil.copy(str(src_path), str(dest_path))

        try:
            if fmt == "csv":
                df = pd.read_csv(str(dest_path))
            else:
                df = pd.read_json(str(dest_path))

            record = DatasetRecord(
                id=dataset_id,
                filename=filename,
                format=fmt,
                total_rows=len(df),
                columns=list(df.columns),
                file_path=str(dest_path),
            )
            db.add(record)
            db.commit()
            logger.info(f"Seeded default dataset: {filename} ({len(df)} rows)")
        except Exception as e:
            logger.warning(f"Failed to seed {filename}: {e}")
            db.rollback()


@router.post("/seed", response_model=DatasetListResponse)
async def seed_samples(db: Session = Depends(get_db)):
    """Manually seed sample datasets."""
    seed_default_datasets(db)
    records = db.query(DatasetRecord).order_by(DatasetRecord.created_at.desc()).all()
    datasets = [
        DatasetInfo(
            id=r.id,
            filename=r.filename,
            format=r.format,
            total_rows=r.total_rows,
            columns=r.columns or [],
            preview=[],
            uploaded_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in records
    ]
    return DatasetListResponse(datasets=datasets, total=len(datasets))


@router.post("/upload", response_model=DatasetInfo)
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a CSV or JSON dataset for evaluation."""
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    # Validate file extension
    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            400,
            f"Unsupported file type: .{ext}. Only CSV and JSON files are supported."
        )

    # Read content and validate file size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            413,
            f"File too large ({len(content) / (1024*1024):.1f}MB). "
            f"Maximum allowed size is {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    if len(content) == 0:
        raise HTTPException(400, "File is empty")

    dataset_id = str(uuid.uuid4())[:8]
    safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._-")
    file_path = os.path.join(str(settings.UPLOADS_DIR), f"{dataset_id}_{safe_filename}")

    # Save file
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse file
    try:
        if ext == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_json(file_path)

        if df.empty:
            os.remove(file_path)
            raise HTTPException(400, "File contains no data rows")

        columns = list(df.columns)
        total_rows = len(df)
        preview = df.head(5).to_dict(orient="records")
    except HTTPException:
        raise
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(400, f"Failed to parse file: {str(e)}")

    # Save to database
    record = DatasetRecord(
        id=dataset_id,
        filename=file.filename,
        format=ext,
        total_rows=total_rows,
        columns=columns,
        file_path=file_path,
    )
    db.add(record)
    db.commit()

    logger.info(f"Dataset uploaded: {file.filename} ({total_rows} rows, {ext})")

    return DatasetInfo(
        id=dataset_id,
        filename=file.filename,
        format=ext,
        total_rows=total_rows,
        columns=columns,
        preview=preview,
        uploaded_at=datetime.utcnow().isoformat(),
    )


@router.get("/", response_model=DatasetListResponse)
async def list_datasets(db: Session = Depends(get_db)):
    """List all uploaded datasets."""
    records = db.query(DatasetRecord).order_by(DatasetRecord.created_at.desc()).all()
    datasets = [
        DatasetInfo(
            id=r.id,
            filename=r.filename,
            format=r.format,
            total_rows=r.total_rows,
            columns=r.columns or [],
            preview=[],
            uploaded_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in records
    ]
    return DatasetListResponse(datasets=datasets, total=len(datasets))


@router.get("/{dataset_id}", response_model=DatasetInfo)
async def get_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Get details of a specific dataset."""
    record = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not record:
        raise HTTPException(404, "Dataset not found")
    return DatasetInfo(
        id=record.id,
        filename=record.filename,
        format=record.format,
        total_rows=record.total_rows,
        columns=record.columns or [],
        preview=[],
        uploaded_at=record.created_at.isoformat() if record.created_at else "",
    )


@router.get("/{dataset_id}/data")
async def get_dataset_data(dataset_id: str, limit: int = 100, offset: int = 0, db: Session = Depends(get_db)):
    """Get the actual data from a dataset."""
    record = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not record:
        raise HTTPException(404, "Dataset not found")

    if not os.path.exists(record.file_path):
        raise HTTPException(404, "Dataset file not found on disk")

    try:
        if record.format == "csv":
            df = pd.read_csv(record.file_path)
        else:
            df = pd.read_json(record.file_path)

        data = df.iloc[offset:offset + limit].to_dict(orient="records")
        return {"data": data, "total": len(df), "offset": offset, "limit": limit}
    except Exception as e:
        raise HTTPException(500, f"Failed to read dataset: {str(e)}")


@router.post("/{dataset_id}/evaluate", response_model=BatchEvaluationResponse)
async def evaluate_dataset_batch(
    dataset_id: str,
    req: DatasetBatchEvaluateRequest,
    db: Session = Depends(get_db),
):
    """Run batch evaluation on samples directly from an uploaded dataset."""
    record = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not record:
        raise HTTPException(404, "Dataset not found")

    if not os.path.exists(record.file_path):
        raise HTTPException(404, "Dataset file not found on disk")

    try:
        if record.format == "csv":
            df = pd.read_csv(record.file_path)
        else:
            df = pd.read_json(record.file_path)
    except Exception as e:
        raise HTTPException(500, f"Failed to read dataset file: {str(e)}")

    cols = df.columns
    # Auto-detect column names if defaults are missing
    prompt_col = req.prompt_column if req.prompt_column in cols else next((c for c in cols if c.lower() in ["question", "prompt", "input", "query"]), cols[0])
    expected_col = req.expected_output_column if req.expected_output_column in cols else next((c for c in cols if c.lower() in ["best_answer", "answer", "expected_output", "ground_truth"]), cols[1] if len(cols) > 1 else cols[0])
    context_col = req.context_column if req.context_column and req.context_column in cols else next((c for c in cols if c.lower() in ["context", "document", "passage"]), None)
    actual_col = req.actual_output_column if req.actual_output_column and req.actual_output_column in cols else next((c for c in cols if c.lower() in ["actual_output", "generated_output", "incorrect_answer"]), None)

    sub_df = df.head(req.max_samples)
    eval_requests: List[EvaluationRequest] = []

    for _, row in sub_df.iterrows():
        prompt = str(row.get(prompt_col, ""))
        expected = str(row.get(expected_col, ""))
        context = str(row.get(context_col, "")) if context_col else None
        
        # If dataset doesn't have actual LLM outputs, generate simulated or model response
        if actual_col and pd.notna(row.get(actual_col)):
            actual = str(row.get(actual_col))
        else:
            # Run model generation
            run_res = await benchmark_service._run_model(req.model_name or "gemini-1.5-flash", prompt, context)
            actual = run_res.output if run_res.output else expected

        eval_requests.append(
            EvaluationRequest(
                prompt=prompt,
                context=context,
                expected_output=expected,
                actual_output=actual,
                model_name=req.model_name,
            )
        )

    # Run batch evaluation
    from app.models.schemas import BatchEvaluationRequest
    batch_req = BatchEvaluationRequest(samples=eval_requests, model_name=req.model_name)
    result = evaluator_service.evaluate_batch(batch_req)

    # Persist to database
    for eval_result in result.results:
        rec = EvaluationRecord(
            id=eval_result.id,
            prompt=eval_result.prompt,
            model_name=req.model_name,
            semantic_similarity=eval_result.semantic_similarity,
            relevance_score=eval_result.relevance_score,
            hallucination_score=eval_result.hallucination_score,
            groundedness_score=eval_result.groundedness_score,
            composite_score=eval_result.composite_score,
            quality_label=eval_result.quality_label,
            flags=eval_result.flags,
            details=eval_result.details,
            expected_output="",
            actual_output="",
        )
        db.add(rec)
    db.commit()

    logger.info(f"Evaluated dataset {record.filename}: {len(eval_requests)} rows evaluated")
    return result


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    """Delete a dataset."""
    record = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
    if not record:
        raise HTTPException(404, "Dataset not found")

    # Delete file from disk
    if os.path.exists(record.file_path):
        os.remove(record.file_path)

    # Delete from DB
    db.delete(record)
    db.commit()

    logger.info(f"Dataset deleted: {record.filename} (id={dataset_id})")
    return {"message": "Dataset deleted", "id": dataset_id}
