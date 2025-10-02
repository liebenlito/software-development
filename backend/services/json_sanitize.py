from __future__ import annotations
import math
import numpy as np
import pandas as pd
from datetime import datetime, date
from typing import Any, Mapping, Sequence

def to_json_primitive(x: Any) -> Any:
    # None langsung ok
    if x is None:
        return None

    # Numpy scalar → Python scalar
    if isinstance(x, (np.integer,)):
        return int(x)
    if isinstance(x, (np.floating,)):
        f = float(x)
        # NaN/Inf → None
        if math.isnan(f) or math.isinf(f):
            return None
        return f
    if isinstance(x, (np.bool_,)):
        return bool(x)

    # Pandas missing
    if x is pd.NA:
        return None

    # pandas Timestamp / datetime / date → ISO string
    if isinstance(x, (pd.Timestamp, datetime)):
        return x.isoformat()
    if isinstance(x, date):
        return x.isoformat()

    # float Python: cek NaN/Inf juga
    if isinstance(x, float):
        if math.isnan(x) or math.isinf(x):
            return None
        return x

    # list / tuple
    if isinstance(x, (list, tuple)):
        return [to_json_primitive(v) for v in x]

    # dict / mapping
    if isinstance(x, Mapping):
        return {str(k): to_json_primitive(v) for k, v in x.items()}

    # pandas types umum (Series/DataFrame tidak kita izinkan di sini)
    return x  # biarkan string/int/bool python apa adanya

def sanitize_obj(obj: Any) -> Any:
    return to_json_primitive(obj)