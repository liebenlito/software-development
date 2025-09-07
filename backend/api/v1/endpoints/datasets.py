from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from db.session import SessionLocal
from models.dataset import Dataset
from schemas.dataset import DatasetOut, DatasetDetail
from services.stats import compute_stats

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

    numeric_df = df.select_dtypes(include="number")
    stats = compute_stats(df, bins="sturges")

    # stats = {}
    # for col in numeric_df.columns.tolist():
    #     series = numeric_df[col].dropna()
    #     stats[col] = {
    #         "mean": float(series.mean()) if not series.empty else None,
    #         "median": float(series.median()) if not series.empty else None,
    #         "std": float(series.std(ddof=1)) if not series.empty else None,
    #         "min": float(series.min()) if not series.empty else None,
    #         "max": float(series.max()) if not series.empty else None,
    #     }

    # stats = {col_stats(numeric_df[col] for col in numeric_df.columns.tolist())}
    
    # Preview 5 baris pertama
    preview_rows = df.head(5).to_dict(orient="records")

    dataset = Dataset(
        filename=file.filename,
        n_rows=int(df.shape[0]),
        n_cols=int(df.shape[1]),
        numeric_columns=numeric_df.columns.tolist(),
        stats=stats,
        preview_rows=preview_rows
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

