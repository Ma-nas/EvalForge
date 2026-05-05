"""
EvalForge - Dataset Management API Routes
"""

import os
import uuid
import json
import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any
from datetime import datetime

from app.core.config import settings
from app.models.schemas import DatasetInfo, DatasetListResponse

router = APIRouter(prefix="/datasets", tags=["Datasets"])

# In-memory dataset registry (for MVP - can migrate to DB later)
_datasets: Dict[str, DatasetInfo] = {}


@router.post("/upload", response_model=DatasetInfo)
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a CSV or JSON dataset for evaluation."""
    if not file.filename:
        raise HTTPException(400, "No filename provided")

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("csv", "json"):
        raise HTTPException(400, "Only CSV and JSON files are supported")

    dataset_id = str(uuid.uuid4())[:8]
    file_path = os.path.join(str(settings.UPLOADS_DIR), f"{dataset_id}_{file.filename}")

    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse file
    try:
        if ext == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_json(file_path)

        columns = list(df.columns)
        total_rows = len(df)
        preview = df.head(5).to_dict(orient="records")
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(400, f"Failed to parse file: {str(e)}")

    info = DatasetInfo(
        id=dataset_id,
        filename=file.filename,
        format=ext,
        total_rows=total_rows,
        columns=columns,
        preview=preview,
        uploaded_at=datetime.utcnow().isoformat(),
    )
    _datasets[dataset_id] = info
    return info


@router.get("/", response_model=DatasetListResponse)
async def list_datasets():
    """List all uploaded datasets."""
    return DatasetListResponse(datasets=list(_datasets.values()), total=len(_datasets))


@router.get("/{dataset_id}", response_model=DatasetInfo)
async def get_dataset(dataset_id: str):
    """Get details of a specific dataset."""
    if dataset_id not in _datasets:
        raise HTTPException(404, "Dataset not found")
    return _datasets[dataset_id]


@router.get("/{dataset_id}/data")
async def get_dataset_data(dataset_id: str, limit: int = 100, offset: int = 0):
    """Get the actual data from a dataset."""
    if dataset_id not in _datasets:
        raise HTTPException(404, "Dataset not found")

    info = _datasets[dataset_id]
    file_path = os.path.join(str(settings.UPLOADS_DIR), f"{dataset_id}_{info.filename}")

    try:
        if info.format == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_json(file_path)

        data = df.iloc[offset:offset + limit].to_dict(orient="records")
        return {"data": data, "total": len(df), "offset": offset, "limit": limit}
    except Exception as e:
        raise HTTPException(500, f"Failed to read dataset: {str(e)}")


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: str):
    """Delete a dataset."""
    if dataset_id not in _datasets:
        raise HTTPException(404, "Dataset not found")

    info = _datasets[dataset_id]
    file_path = os.path.join(str(settings.UPLOADS_DIR), f"{dataset_id}_{info.filename}")
    if os.path.exists(file_path):
        os.remove(file_path)

    del _datasets[dataset_id]
    return {"message": "Dataset deleted", "id": dataset_id}
