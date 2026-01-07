"""
Schema inference module.

Analyzes a pandas DataFrame to extract:
- Column types (numeric vs categorical)
- Data types (int vs float for numeric)
- Constraints (min/max, unique categories)
- Missing value patterns
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np


@dataclass
class ColumnInfo:
    """Metadata for a single column."""
    
    name: str
    dtype: str  # 'int', 'float', 'categorical'
    is_categorical: bool
    
    # For numeric columns
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    
    # For categorical columns
    categories: Optional[List[str]] = None
    
    # Missing data
    has_missing: bool = False
    missing_rate: float = 0.0
    
    # Identifier detection (for auto-increment IDs, UUIDs, etc.)
    is_identifier: bool = False  # True if column is likely a unique identifier
    
    def __repr__(self) -> str:
        if self.is_identifier:
            return f"ColumnInfo(name='{self.name}', type='identifier', unique=True)"
        elif self.is_categorical:
            return f"ColumnInfo(name='{self.name}', type='categorical', categories={len(self.categories) if self.categories else 0})"
        else:
            return f"ColumnInfo(name='{self.name}', type='{self.dtype}', range=[{self.min_value}, {self.max_value}])"


@dataclass
class Schema:
    """Complete schema for a tabular dataset."""
    
    columns: List[ColumnInfo] = field(default_factory=list)
    num_rows: int = 0
    num_columns: int = 0
    
    def get_column(self, name: str) -> Optional[ColumnInfo]:
        """Get column info by name."""
        for col in self.columns:
            if col.name == name:
                return col
        return None
    
    def get_numeric_columns(self) -> List[ColumnInfo]:
        """Return all numeric columns."""
        return [col for col in self.columns if not col.is_categorical]
    
    def get_categorical_columns(self) -> List[ColumnInfo]:
        """Return all categorical columns."""
        return [col for col in self.columns if col.is_categorical]
    
    def get_identifier_columns(self) -> List[ColumnInfo]:
        """Return all identifier columns."""
        return [col for col in self.columns if col.is_identifier]
    
    def get_trainable_columns(self) -> List[ColumnInfo]:
        """Return columns that should be used for training (excludes identifiers)."""
        return [col for col in self.columns if not col.is_identifier]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert schema to dictionary format."""
        return {
            "num_rows": self.num_rows,
            "num_columns": self.num_columns,
            "columns": [
                {
                    "name": col.name,
                    "dtype": col.dtype,
                    "is_categorical": col.is_categorical,
                    "min_value": col.min_value,
                    "max_value": col.max_value,
                    "categories": col.categories,
                    "has_missing": col.has_missing,
                    "missing_rate": col.missing_rate,
                }
                for col in self.columns
            ]
        }
    
    def __repr__(self) -> str:
        return f"Schema(rows={self.num_rows}, columns={self.num_columns})"


def infer_schema(df: pd.DataFrame, categorical_threshold: int = 10) -> Schema:
    """
    Infer schema from a pandas DataFrame.
    
    Args:
        df: Input DataFrame
        categorical_threshold: Max unique values to treat a numeric column as categorical
        
    Returns:
        Schema object with inferred metadata
        
    Design decisions:
    - Columns with ≤ categorical_threshold unique values → categorical
    - Object/string types → categorical
    - Numeric types → int or float based on dtype
    - Missing values tracked but not imputed here
    - Identifier detection: numeric columns with >95% unique values
    """
    schema = Schema(
        num_rows=len(df),
        num_columns=len(df.columns)
    )
    
    for col_name in df.columns:
        col_data = df[col_name]
        
        # Detect missing values
        missing_mask = col_data.isna()
        has_missing = missing_mask.any()
        missing_rate = missing_mask.sum() / len(df) if len(df) > 0 else 0.0
        
        # Get non-null data for analysis
        non_null_data = col_data.dropna()
        
        # Determine if categorical
        is_categorical = False
        is_identifier = False
        categories = None
        min_val = None
        max_val = None
        dtype_str = 'float'
        
        if pd.api.types.is_object_dtype(col_data) or pd.api.types.is_categorical_dtype(col_data):
            # String/object types are categorical
            is_categorical = True
            categories = sorted([str(x) for x in non_null_data.unique()])
            dtype_str = 'categorical'
            
        elif pd.api.types.is_numeric_dtype(col_data):
            # Check for identifier pattern (high uniqueness)
            n_unique = non_null_data.nunique()
            uniqueness_ratio = n_unique / len(non_null_data) if len(non_null_data) > 0 else 0.0
            
            if uniqueness_ratio > 0.95 and pd.api.types.is_integer_dtype(col_data):
                # Likely an identifier column (e.g., customer_id, transaction_id)
                is_identifier = True
                dtype_str = 'identifier'
                min_val = float(non_null_data.min())
                max_val = float(non_null_data.max())
            elif n_unique <= categorical_threshold:
                # Low cardinality numeric → categorical
                is_categorical = True
                categories = sorted([str(x) for x in non_null_data.unique()])
                dtype_str = 'categorical'
            else:
                # Standard numeric column
                is_categorical = False
                min_val = float(non_null_data.min())
                max_val = float(non_null_data.max())
                
                # Detect int vs float
                if pd.api.types.is_integer_dtype(col_data):
                    dtype_str = 'int'
                else:
                    # Check if all values are whole numbers
                    if len(non_null_data) > 0 and (non_null_data % 1 == 0).all():
                        dtype_str = 'int'
                    else:
                        dtype_str = 'float'
        else:
            # Fallback: treat as categorical
            is_categorical = True
            categories = sorted([str(x) for x in non_null_data.unique()])
            dtype_str = 'categorical'
        
        # Create column info
        col_info = ColumnInfo(
            name=col_name,
            dtype=dtype_str,
            is_categorical=is_categorical,
            is_identifier=is_identifier,
            min_value=min_val,
            max_value=max_val,
            categories=categories,
            has_missing=has_missing,
            missing_rate=float(missing_rate)
        )
        
        schema.columns.append(col_info)
    
    return schema
