"""
Schema-only synthetic data generator (Mode B).

Deterministic, rule-based sampling from a provided schema.
No ML, GANs, or training steps.
"""

from __future__ import annotations

from typing import Dict, List, Any
import numpy as np
import pandas as pd


SUPPORTED_TYPES = {"int", "float", "categorical", "identifier"}


class SchemaDataGenerator:
    """Generate tabular data from a declarative schema.

    Uses a fixed RNG seed for deterministic outputs. Values are sampled
    uniformly within provided ranges or value lists; identifiers are sequential.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.rng = np.random.default_rng(seed)

    def generate(self, schema: Dict[str, Any], n_rows: int) -> pd.DataFrame:
        """Generate synthetic data from schema.

        Args:
            schema: Dict with a ``columns`` list describing each column.
            n_rows: Number of rows to generate.

        Returns:
            Pandas DataFrame containing synthetic rows.

        Raises:
            ValueError: If schema is invalid or missing required fields.
        """
        self._validate_schema(schema)

        columns: List[Dict[str, Any]] = schema.get("columns", [])
        data = {}

        for col_def in columns:
            name = col_def["name"]
            col_type = col_def["type"]
            null_rate = float(col_def.get("null_rate", 0.0))

            series = self._generate_column(col_def, n_rows)
            if null_rate > 0:
                series = self._apply_nulls(series, null_rate)

            data[name] = series

        df = pd.DataFrame(data)

        # Ensure conventional sequential 'id' if present.
        # WHY: Many downstream validators expect an auto-incrementing identifier.
        # This keeps Mode B deterministic and avoids spurious schema failures.
        if "id" in df.columns:
            df["id"] = pd.Series(range(1, n_rows + 1), dtype="Int64")

        return df

    def _generate_column(self, col_def: Dict[str, Any], n_rows: int) -> pd.Series:
        col_type = col_def["type"]

        if col_type == "identifier":
            start = int(col_def.get("start", 1))
            values = np.arange(start, start + n_rows)
            series = pd.Series(values, dtype="Int64")
            return series

        if col_type == "int":
            min_val = int(col_def["min"])
            max_val = int(col_def["max"])
            values = self.rng.integers(min_val, max_val + 1, size=n_rows)
            return pd.Series(values, dtype="Int64")

        if col_type == "float":
            min_val = float(col_def["min"])
            max_val = float(col_def["max"])
            values = self.rng.uniform(min_val, max_val, size=n_rows)
            return pd.Series(values, dtype=float)

        if col_type == "categorical":
            choices = col_def["values"]
            values = self.rng.choice(choices, size=n_rows, replace=True)
            return pd.Series(values, dtype=object)

        raise ValueError(f"Unsupported column type: {col_type}")

    def _apply_nulls(self, series: pd.Series, null_rate: float) -> pd.Series:
        if not 0 <= null_rate <= 1:
            raise ValueError("null_rate must be between 0 and 1")

        if null_rate == 0:
            return series

        mask = self.rng.random(series.shape[0]) < null_rate
        # Use pandas nullable types to preserve ints when nulls are present.
        if pd.api.types.is_integer_dtype(series.dtype):
            series = series.astype("Int64")
            series[mask] = pd.NA
        else:
            series[mask] = np.nan
        return series

    def _validate_schema(self, schema: Dict[str, Any]) -> None:
        if not isinstance(schema, dict):
            raise ValueError("schema must be a dictionary")

        columns = schema.get("columns")
        if not columns or not isinstance(columns, list):
            raise ValueError("schema must include a 'columns' list")

        for col in columns:
            if not isinstance(col, dict):
                raise ValueError("each column definition must be a dict")

            if "name" not in col or "type" not in col:
                raise ValueError("column definitions require 'name' and 'type'")

            if col["type"] not in SUPPORTED_TYPES:
                raise ValueError(f"unsupported type: {col['type']}")

            if col["type"] in {"int", "float"}:
                if "min" not in col or "max" not in col:
                    raise ValueError(f"numeric column '{col['name']}' requires min/max")
                if float(col["min"]) > float(col["max"]):
                    raise ValueError(f"min must be <= max for column '{col['name']}'")

            if col["type"] == "categorical":
                values = col.get("values", [])
                if not values:
                    raise ValueError(f"categorical column '{col['name']}' requires values list")

            if col.get("null_rate", 0) and not 0 <= float(col.get("null_rate")) <= 1:
                raise ValueError(f"null_rate must be 0-1 for column '{col['name']}'")
