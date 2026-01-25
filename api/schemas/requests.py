"""
Request and Response Schemas

Pydantic models for API request validation and response serialization.
All schemas are JSON-serializable for React Native / Expo compatibility.
"""

from typing import Dict, List, Optional, Any, Literal, Union
from pydantic import BaseModel, Field, validator


# ========== GENERATION ENDPOINTS ==========


class SchemaColumnDefinition(BaseModel):
    """Declarative column schema for Mode B (schema-only generation)."""

    name: str = Field(..., description="Column name")
    type: Literal["int", "float", "categorical", "identifier"] = Field(
        ..., description="Column data type"
    )
    min: Optional[float] = Field(None, description="Minimum value for numeric types")
    max: Optional[float] = Field(None, description="Maximum value for numeric types")
    values: Optional[List[str]] = Field(None, description="Allowed values for categorical columns")
    start: Optional[int] = Field(1, description="Starting value for identifier columns (sequential)")
    null_rate: float = Field(0.0, ge=0, le=1, description="Fraction of nulls to insert (0-1)")

    @validator("values", always=True)
    def require_values_for_categorical(cls, v, values):
        if values.get("type") == "categorical" and not v:
            raise ValueError("categorical columns require a non-empty values list")
        return v

    @validator("min", "max")
    def require_min_max_for_numeric(cls, v, values):
        if values.get("type") in {"int", "float"} and v is None:
            raise ValueError("numeric columns require min and max")
        return v


class SchemaDefinition(BaseModel):
    """Top-level schema wrapper for Mode B generation."""

    columns: List[SchemaColumnDefinition] = Field(..., description="List of column definitions")
    seed: int = Field(42, description="Deterministic seed for schema sampling")

    class Config:
        schema_extra = {
            "example": {
                "seed": 42,
                "columns": [
                    {"name": "id", "type": "identifier", "start": 1},
                    {"name": "age", "type": "int", "min": 18, "max": 90},
                    {"name": "income", "type": "float", "min": 20000, "max": 250000},
                    {"name": "gender", "type": "categorical", "values": ["M", "F"]}
                ]
            }
        }

class GenerateRequest(BaseModel):
    """
    Request to generate synthetic data.
    
    Either provide:
    - file_path: Path to CSV on server
    - Or upload file separately via multipart/form-data
    
    Configuration parameters are optional — defaults are production-ready.
    """
    
    file_path: Optional[str] = Field(
        None,
        description="Path to CSV file on server (alternative to file upload)"
    )

    schema: Optional[SchemaDefinition] = Field(
        None,
        description="Schema-only generation payload (Mode B, no real data required)"
    )
    
    n_rows: int = Field(
        1000,
        ge=1,
        le=100000,
        description="Number of synthetic rows to generate"
    )
    
    epochs: Optional[int] = Field(
        300,
        ge=10,
        le=1000,
        description="CTGAN training epochs (more = better quality, slower)"
    )
    
    batch_size: Optional[int] = Field(
        500,
        ge=10,
        le=2000,
        description="CTGAN batch size"
    )
    
    categorical_threshold: Optional[int] = Field(
        10,
        ge=2,
        le=50,
        description="Max unique values to treat column as categorical"
    )
    
    apply_constraints: bool = Field(
        True,
        description="Apply post-processing constraints (recommended)"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "n_rows": 1000,
                "epochs": 300,
                "apply_constraints": True
            }
        }


class GenerateResponse(BaseModel):
    """
    Response from generation endpoint.
    
    Returns metadata only — NOT the full dataset.
    Client can download the CSV via the download_url.
    """
    
    dataset_id: str = Field(..., description="Unique identifier for generated dataset")
    rows_generated: int = Field(..., description="Number of rows in synthetic dataset")
    columns: List[str] = Field(..., description="Column names in dataset")
    file_size_bytes: int = Field(..., description="Size of output CSV file")
    download_url: str = Field(..., description="URL to download the synthetic CSV")
    message: str = Field(..., description="Status message")
    
    class Config:
        schema_extra = {
            "example": {
                "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
                "rows_generated": 1000,
                "columns": ["age", "income", "gender", "region"],
                "file_size_bytes": 45678,
                "download_url": "/download/550e8400-e29b-41d4-a716-446655440000",
                "message": "Synthetic data generated successfully"
            }
        }


# ========== EVALUATION ENDPOINTS ==========

class EvaluateRequest(BaseModel):
    """
    Request to evaluate synthetic data quality.
    
    Provide:
    - real_file_path: Path to real CSV (or upload)
    - synthetic_file_path: Path to synthetic CSV (or dataset_id from /generate)
    """
    
    real_file_path: Optional[str] = Field(
        None,
        description="Path to real CSV file on server"
    )
    
    synthetic_file_path: Optional[str] = Field(
        None,
        description="Path to synthetic CSV file on server"
    )
    
    dataset_id: Optional[str] = Field(
        None,
        description="Dataset ID from previous /generate call (alternative to synthetic_file_path)"
    )

    schema: Optional[SchemaDefinition] = Field(
        None,
        description="Schema definition for schema-only evaluation (Mode B)"
    )
    
    @validator('dataset_id', 'synthetic_file_path')
    def check_synthetic_source(cls, v, values):
        """Ensure at least one synthetic data source is provided."""
        # This validation happens after all fields are parsed
        return v
    
    class Config:
        schema_extra = {
            "example": {
                "real_file_path": "data/uploads/real_data.csv",
                "dataset_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class KSTestResult(BaseModel):
    """Result from Kolmogorov-Smirnov test for a single column."""
    statistic: float = Field(..., description="KS test statistic (0 to 1)")
    p_value: float = Field(..., description="p-value (>0.05 = distributions match)")


class ChiSquareResult(BaseModel):
    """Result from Chi-square test for a single column."""
    statistic: float = Field(..., description="Chi-square statistic")
    p_value: float = Field(..., description="p-value (>0.05 = distributions match)")


class EvaluateResponse(BaseModel):
    """
    Response from evaluation endpoint.
    
    Returns all 4 evaluation metrics:
    1. KS Test (per numeric column)
    2. Chi-Square Test (per categorical column)
    3. Correlation MSE (overall)
    4. Adversarial AUC (overall)
    """
    
    ks_test: Dict[str, KSTestResult] = Field(
        ...,
        description="KS test results for numeric columns"
    )
    
    chi_square: Dict[str, ChiSquareResult] = Field(
        ...,
        description="Chi-square test results for categorical columns"
    )
    
    correlation_mse: float = Field(
        ...,
        description="MSE between correlation matrices (<0.05 = good)"
    )
    
    adversarial_auc: float = Field(
        ...,
        description="ROC-AUC for RF classifier (≈0.50 = excellent)"
    )
    
    message: str = Field(..., description="Status message")
    
    interpretation: Dict[str, str] = Field(
        ...,
        description="Human-readable interpretation of results"
    )
    
    class Config:
        schema_extra = {
            "example": {
                "ks_test": {
                    "age": {"statistic": 0.0412, "p_value": 0.6234},
                    "income": {"statistic": 0.0385, "p_value": 0.7892}
                },
                "chi_square": {
                    "gender": {"statistic": 1.9456, "p_value": 0.3782}
                },
                "correlation_mse": 0.012345,
                "adversarial_auc": 0.5142,
                "message": "Evaluation completed successfully",
                "interpretation": {
                    "ks_test": "All numeric distributions match (p > 0.05)",
                    "chi_square": "All categorical distributions match (p > 0.05)",
                    "correlation_mse": "PASS - Relationships well-preserved",
                    "adversarial_auc": "EXCELLENT - Synthetic indistinguishable from real"
                }
            }
        }


class SchemaEvaluateResponse(BaseModel):
    """Schema-only evaluation response (Mode B)."""

    schema_validity: Literal["PASS", "FAIL"] = Field(..., description="Overall schema validity status")
    type_consistency: str = Field(..., description="Summary of type checks")
    range_violations: int = Field(..., description="Count of out-of-range numeric values")
    category_violations: int = Field(..., description="Count of invalid categorical values")
    null_rate: Dict[str, float] = Field(..., description="Observed null rate per column")
    identifier_issues: Optional[str] = Field(None, description="Identifier uniqueness/sequential issues if any")
    message: str = Field(..., description="Status message")

    class Config:
        schema_extra = {
            "example": {
                "schema_validity": "PASS",
                "type_consistency": "All columns match declared types",
                "range_violations": 0,
                "category_violations": 0,
                "null_rate": {"age": 0.0, "income": 0.0, "gender": 0.0},
                "identifier_issues": None,
                "message": "Schema-only evaluation completed"
            }
        }


# ========== UTILITY RESPONSES ==========

class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    message: str = Field(..., description="Health check message")


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    
    class Config:
        schema_extra = {
            "example": {
                "error": "ValidationError",
                "message": "Invalid request parameters",
                "detail": "n_rows must be between 1 and 100000"
            }
        }
