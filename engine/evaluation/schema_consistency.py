"""
Schema-only evaluation utilities for Mode B.

Validates generated data against a declarative schema without requiring real data.
"""

from __future__ import annotations

from typing import Dict
import pandas as pd

from schema_generator.generator import SUPPORTED_TYPES


def _validate_identifier(series: pd.Series, start: int = 1):
    """Property-based identifier validation (dtype-agnostic).

    Conditions (order-invariant):
    1) No nulls
    2) All values are integer-coercible
    3) All values are unique
    4) min == start
    5) max == start + n - 1 (continuous range)
    """

    if series.isna().any():
        return False, "Identifier contains null values"

    try:
        s_int = series.astype("int64")
    except Exception:
        return False, "Identifier contains non-integer values"

    n = len(s_int)

    if s_int.nunique() != n:
        return False, "Identifier contains duplicate values"

    min_v = int(s_int.min())
    max_v = int(s_int.max())

    if min_v != start:
        return False, f"Identifier does not start from {start}"

    if max_v != start + n - 1:
        return False, "Identifier is not continuous"

    return True, None


def evaluate_schema_consistency(df: pd.DataFrame, schema: Dict) -> Dict:
    """Validate a synthetic dataset against the provided schema.

    Checks type correctness, numeric ranges, categorical domain adherence,
    null rates, and identifier uniqueness/sequentiality.
    """
    type_issues = []
    range_violations = 0
    category_violations = 0
    identifier_issues = None
    null_rate: Dict[str, float] = {}

    columns = schema.get("columns", [])

    for col in columns:
        name = col.get("name")
        col_type = col.get("type")

        if col_type not in SUPPORTED_TYPES:
            type_issues.append(f"Unsupported type for {name}")
            continue

        if name not in df.columns:
            type_issues.append(f"Missing column: {name}")
            continue

        series = df[name]
        null_rate[name] = float(series.isna().mean())

        if col_type == "int":
            if not pd.api.types.is_integer_dtype(series.dropna()):
                type_issues.append(f"Column {name} is not integer")
            min_v, max_v = col.get("min"), col.get("max")
            below = (series.dropna() < min_v).sum()
            above = (series.dropna() > max_v).sum()
            range_violations += int(below + above)

        elif col_type == "float":
            if not pd.api.types.is_numeric_dtype(series.dropna()):
                type_issues.append(f"Column {name} is not numeric")
            min_v, max_v = col.get("min"), col.get("max")
            below = (series.dropna() < min_v).sum()
            above = (series.dropna() > max_v).sum()
            range_violations += int(below + above)

        elif col_type == "categorical":
            allowed = set(col.get("values", []))
            invalid = series.dropna().map(lambda v: v not in allowed).sum()
            category_violations += int(invalid)

        elif col_type == "identifier":
            start = int(col.get("start", 1))
            valid, msg = _validate_identifier(series, start=start)
            if not valid:
                identifier_issues = msg

    schema_validity = "PASS" if not type_issues and range_violations == 0 and category_violations == 0 and not identifier_issues else "FAIL"

    type_consistency = "All columns match declared types" if not type_issues else "; ".join(type_issues)

    return {
        "schema_validity": schema_validity,
        "type_consistency": type_consistency,
        "range_violations": int(range_violations),
        "category_violations": int(category_violations),
        "null_rate": null_rate,
        "identifier_issues": identifier_issues,
        "message": "Schema-only evaluation completed"
    }
