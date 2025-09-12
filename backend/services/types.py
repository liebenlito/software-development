import pandas as pd
from typing import List, Tuple

def infer_column_types(df: pd.DataFrame, numeric_threshold: float = 0.9) -> Tuple[List[str], List[str]]:
    numeric_cols: List[str] = []
    categorical_cols: List[str] = []

    for col in df.columns:
        s = df[col]
        s_num = pd.to_numeric(s, errors="coerce")
        valid_ratio = s_num.notna().mean()
        if valid_ratio >= numeric_threshold:
            numeric_cols.append(col)
        else:
            categorical_cols.append(col)

    return numeric_cols, categorical_cols