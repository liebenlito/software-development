from __future__ import annotations
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

def col_stats(series: pd.Series, *, bins: str | int = "sturges") -> Dict[str, Any]:
    s = series.dropna().astype(float, errors="ignore")
    s = pd.to_numeric(s, errors="coerce").dropna()
    if s.empty:
        return{
            "mean": None, "median": None, "std": None, "min": None, "max": None,
            "q1": None, "q3": None, "skew": None, "kurtosis": None,
            "hist": None,
            "count": 0
        }
    
    st = {
        "mean": float(s.mean()),
        "median": float(s.median()),
        "std": float(s.std(ddof=1)) if s.size > 1 else 0.0,
        "min": float(s.min()),
        "max": float(s.max()),
        "q1": float(s.quantile(0.25)),
        "q3": float(s.quantile(0.75)),
        "skew": float(s.skew()) if s.size > 2 else 0.0,
        "kurtosis": float(s.kurt()) if s.size > 3 else 0.0,
        "count": int(s.size)
    }

    # Histogram
    try:
        counts, bin_edges = np.histogram(s.values, bins=bins)
        st["hist"] = {
            "counts": counts.tolist(),
            "bin_edges": [float(b) for b in bin_edges.tolist()]
        }
    except Exception:
        st["hist"] = None
    
    return st

def compute_stats(df: pd.DataFrame, *, bins: str | int = "sturges") -> Dict[str, Any]:
    numeric_df = df.select_dtypes(include="number")
    result = {}
    
    for col in numeric_df.columns.tolist():
        result[col] = col_stats(numeric_df[col], bins=bins)

    return result