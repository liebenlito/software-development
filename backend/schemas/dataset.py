from pydantic import BaseModel
from typing import Dict, Any, List, Optional

class DatasetOut(BaseModel):
    id: int
    filename: str
    n_rows: int
    n_cols: int
    numeric_columns: Optional[List[str]] = None
    stats: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class DatasetDetail(DatasetOut):
    preview_rows: Optional[List[Dict[str, Any]]] = None