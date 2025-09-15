from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from sqlalchemy.orm import Session

from db.session import SessionLocal
from models.dataset import Dataset
from schemas.dataset import DatasetOut, DatasetDetail
from services.stats import compute_stats
from services.types import infer_column_types

from typing import List, Dict, Any

import pandas as pd
import numpy as np
from io import BytesIO

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload", response_model=DatasetOut)
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Hanya mensupport tipe file CSV.")
    try:
        contents = await file.read()
        df = pd.read_csv(BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Gagal membaca file CSV: {e}")

    # detesi tipe kolom
    numeric_cols, categorical_cols = infer_column_types(df)

    # statistik untuk kolom numerik
    stats = compute_stats(df, bins="sturges")
    
    # Preview 5 baris pertama
    preview_rows = df.head(5).to_dict(orient="records")

    # Simpan raw data dalam bentuk JSON
    raw_data = df.to_dict(orient="records")

    dataset = Dataset(
        filename=file.filename,
        n_rows=int(df.shape[0]),
        n_cols=int(df.shape[1]),
        numeric_columns=numeric_cols,
        categorical_columns=categorical_cols,
        stats=stats,
        preview_rows=preview_rows,
        raw_data=raw_data
    )

    db: Session = next(get_db())
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset


@router.get("", response_model=list[DatasetOut])
def list_datasets():
    db: Session = next(get_db())
    items = db.query(Dataset).order_by(Dataset.id.desc()).all()
    return items


@router.get("/{dataset_id}", response_model=DatasetDetail)
def get_dataset_detail(dataset_id: int):
    db: Session = next(get_db())
    item = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Dataset tidak ditemukan")
    return item


@router.get("/{dataset_id}/groupby")
def groupby(
    dataset_id: int,
    by: List[str] = Query(..., description="Kolom kategorik untuk group by"),
    limit: int = Query(100, ge=1, le=10000),
    sort: str = Query("count:desc", description="count:asc|count:desc")
):
    db: Session = next(get_db())
    ds: Dataset | None = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset tidak ditemukan")
    if not ds.raw_data:
        raise HTTPException(status_code=400, detail="Dataset tidak memiliki data mentah")
    
    # validasi kolom
    cat_cols = set(ds.categorical_columns or [])
    for col in by:
        if col not in cat_cols:
            raise HTTPException(status_code=400, detail=f"Kolom '{col}' bukan kolom kategorik")
    
    df = pd.DataFrame(ds.raw_data)
    for col in by:
        if col not in df.columns:
            raise HTTPException(status_code=400, detail=f"Kolom '{col}' tidak ditemukan")
        
    grp_by = df.groupby(by, dropna=False).size().reset_index(name="count")

    # sorting
    direction = "desc" if sort.lower().endswith(":desc") else "asc"
    grp_by = grp_by.sort_values("count", ascending=(direction == "asc"))

    # limit
    grp_by = grp_by.head(limit)

    # Response records
    records: List[Dict[str, Any]] = grp_by.to_dict(orient="records")

    return {
        "by": by,
        "rows": records,
        "total_groups": int(len(grp_by))
    }