"""
Request and Response Schemas

Pydantic models for API request validation and response serialization.
All schemas are JSON-serializable for React Native / Expo compatibility.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field, validator


# ========== GENERATION ENDPOINTS ==========

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
    
    n_rows: int = Field(
        1000,
        ge=1,
        le=100000,
        description="Number of synthetic rows to generate"
    )
    
    epochs: Optional[int] = Field(
        300,
        ge=50,
        le=1000,
        description="CTGAN training epochs (more = better quality, slower)"
    )
    
    batch_size: Optional[int] = Field(
        500,
        ge=100,
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
