"""
/evaluate endpoint

Thin orchestration layer for synthetic data evaluation.
Calls the existing evaluation engine without modifying core logic.
"""

import sys
import json
from pathlib import Path
from typing import Optional, Union

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

# Add engine to Python path (non-invasive)
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "engine"))

# Import from existing engine (READ-ONLY)
from engine.generator import SynthDataEngine
from schema.infer import infer_schema
from evaluation.statistics import evaluate_statistical_similarity
from evaluation.adversarial import evaluate_adversarial_detectability
from evaluation.schema_consistency import evaluate_schema_consistency

from config import config
from schemas.requests import (
    EvaluateResponse,
    SchemaEvaluateResponse,
    KSTestResult,
    ChiSquareResult,
    SchemaDefinition,
)


router = APIRouter(prefix="/evaluate", tags=["Evaluation"])


@router.post(
    "",
    response_model=Union[EvaluateResponse, SchemaEvaluateResponse],
    status_code=status.HTTP_200_OK,
    summary="Evaluate Synthetic Data Quality",
    description="""
    Evaluate synthetic data using 4 complementary metrics:
    
    1. **KS Test** - Numeric distributions (p > 0.05 = good)
    2. **Chi-Square Test** - Categorical distributions (p > 0.05 = good)
    3. **Correlation MSE** - Feature relationships (< 0.05 = good)
    4. **Adversarial AUC** - Overall quality (≈ 0.50 = excellent)
    
    **Input Options:**
    - Upload both real and synthetic CSVs
    - Provide file paths on server
    - Use dataset_id from previous /generate call (for synthetic data)
    - Provide only schema + synthetic data to run schema consistency checks (Mode B)
    """
)
async def evaluate_synthetic_data(
    real_file: Optional[UploadFile] = File(None, description="Real CSV file"),
    synthetic_file: Optional[UploadFile] = File(None, description="Synthetic CSV file"),
    real_file_path: Optional[str] = Form(None, description="Path to real CSV"),
    synthetic_file_path: Optional[str] = Form(None, description="Path to synthetic CSV"),
    dataset_id: Optional[str] = Form(None, description="Dataset ID from /generate"),
    schema: Optional[str] = Form(None, description="JSON schema for schema-only evaluation (Mode B)")
) -> Union[EvaluateResponse, SchemaEvaluateResponse]:
    """
    Evaluate synthetic data quality.
    
    Steps:
    1. Load real data
    2. Load synthetic data (from upload, path, or dataset_id)
    3. Infer schema from real data
    4. Run 4 evaluation metrics
    5. Generate interpretations
    6. Return JSON report
    """
    
    # ========== STEP 0: OPTIONAL SCHEMA PARSING (MODE B) ==========
    schema_definition: Optional[SchemaDefinition] = None
    if schema:
        try:
            schema_dict = json.loads(schema)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid schema JSON: {str(e)}"
            )
        try:
            schema_definition = SchemaDefinition.parse_obj(schema_dict)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Schema validation failed: {str(e)}"
            )

    df_real: Optional[pd.DataFrame] = None
    
    # ========== STEP 1: LOAD REAL DATA (MODE A ONLY) ==========
    if schema_definition and (real_file is not None or real_file_path is not None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Schema evaluation is schema-only; omit real data inputs"
        )
    
    if real_file is not None:
        # Option A: Upload
        if not config.validate_file_extension(real_file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {config.ALLOWED_EXTENSIONS}"
            )
        
        try:
            contents = await real_file.read()
            
            if len(contents) > config.MAX_UPLOAD_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Max size: {config.MAX_UPLOAD_SIZE_MB}MB"
                )
            
            # Save temporarily
            temp_path = config.UPLOADS_DIR / f"temp_real_{real_file.filename}"
            with open(temp_path, "wb") as f:
                f.write(contents)
            
            df_real = pd.read_csv(temp_path)
            
        except pd.errors.ParserError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid CSV format: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading real file: {str(e)}"
            )
    
    elif real_file_path is not None:
        # Option B: File path
        path = Path(real_file_path)
        
        if not path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Real file not found: {real_file_path}"
            )
        
        try:
            df_real = pd.read_csv(path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading real file: {str(e)}"
            )
    
    elif schema_definition is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide 'real_file' upload or 'real_file_path'"
        )
    
    # ========== STEP 2: LOAD SYNTHETIC DATA ==========
    
    df_synthetic: Optional[pd.DataFrame] = None
    
    if synthetic_file is not None:
        # Option A: Upload
        if not config.validate_file_extension(synthetic_file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {config.ALLOWED_EXTENSIONS}"
            )
        
        try:
            contents = await synthetic_file.read()
            
            if len(contents) > config.MAX_UPLOAD_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Max size: {config.MAX_UPLOAD_SIZE_MB}MB"
                )
            
            temp_path = config.UPLOADS_DIR / f"temp_synthetic_{synthetic_file.filename}"
            with open(temp_path, "wb") as f:
                f.write(contents)
            
            df_synthetic = pd.read_csv(temp_path)
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading synthetic file: {str(e)}"
            )
    
    elif synthetic_file_path is not None:
        # Option B: File path
        path = Path(synthetic_file_path)
        
        if not path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Synthetic file not found: {synthetic_file_path}"
            )
        
        try:
            df_synthetic = pd.read_csv(path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading synthetic file: {str(e)}"
            )
    
    elif dataset_id is not None:
        # Option C: Dataset ID from /generate
        output_path = config.get_output_path(dataset_id)
        
        if not output_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Dataset not found: {dataset_id}"
            )
        
        try:
            df_synthetic = pd.read_csv(output_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading synthetic dataset: {str(e)}"
            )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide 'synthetic_file', 'synthetic_file_path', or 'dataset_id'"
        )

    # ========== MODE B: SCHEMA-ONLY EVALUATION ==========
    if df_real is None:
        if schema_definition is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Schema definition required when no real data is provided"
            )

        try:
            schema_result = evaluate_schema_consistency(df_synthetic, schema_definition.dict())
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error running schema evaluation: {str(e)}"
            )

        return SchemaEvaluateResponse(**schema_result)
    
    # ========== STEP 3: INFER SCHEMA ==========
    
    try:
        schema = infer_schema(df_real, categorical_threshold=config.DEFAULT_CATEGORICAL_THRESHOLD)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error inferring schema: {str(e)}"
        )
    
    # ========== STEP 4: RUN EVALUATION METRICS ==========
    
    try:
        # Statistical similarity (KS, Chi-square, Correlation MSE)
        stats = evaluate_statistical_similarity(df_real, df_synthetic, schema)
        
        # Adversarial detectability (Random Forest AUC)
        auc = evaluate_adversarial_detectability(df_real, df_synthetic, schema)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error running evaluation: {str(e)}"
        )
    
    # ========== STEP 5: FORMAT RESULTS ==========
    
    # Convert to Pydantic models for validation
    ks_results = {
        col: KSTestResult(statistic=result["statistic"], p_value=result["p_value"])
        for col, result in stats["ks_test"].items()
    }
    
    chi_results = {
        col: ChiSquareResult(statistic=result["statistic"], p_value=result["p_value"])
        for col, result in stats["chi_square"].items()
    }
    
    # ========== STEP 6: GENERATE INTERPRETATIONS ==========
    
    interpretation = _generate_interpretation(stats, auc)
    
    return EvaluateResponse(
        ks_test=ks_results,
        chi_square=chi_results,
        correlation_mse=stats["correlation_mse"],
        adversarial_auc=auc,
        message="Evaluation completed successfully",
        interpretation=interpretation
    )


def _generate_interpretation(stats: dict, auc: float) -> dict:
    """
    Generate human-readable interpretations of evaluation results.
    
    Args:
        stats: Statistical evaluation results
        auc: Adversarial AUC score
        
    Returns:
        Dictionary of interpretations
    """
    interpretation = {}
    
    # KS Test interpretation
    ks_passed = all(result["p_value"] > 0.05 for result in stats["ks_test"].values())
    if ks_passed:
        interpretation["ks_test"] = "✓ PASS - All numeric distributions match (p > 0.05)"
    else:
        failed_cols = [col for col, r in stats["ks_test"].items() if r["p_value"] <= 0.05]
        interpretation["ks_test"] = f"✗ FAIL - Distributions differ for: {', '.join(failed_cols)}"
    
    # Chi-Square interpretation
    chi_passed = all(result["p_value"] > 0.05 for result in stats["chi_square"].values())
    if chi_passed:
        interpretation["chi_square"] = "✓ PASS - All categorical distributions match (p > 0.05)"
    else:
        failed_cols = [col for col, r in stats["chi_square"].items() if r["p_value"] <= 0.05]
        interpretation["chi_square"] = f"✗ FAIL - Distributions differ for: {', '.join(failed_cols)}"
    
    # Correlation MSE interpretation
    corr_mse = stats["correlation_mse"]
    if corr_mse < 0.05:
        interpretation["correlation_mse"] = f"✓ PASS - Relationships well-preserved (MSE={corr_mse:.6f})"
    elif corr_mse < 0.10:
        interpretation["correlation_mse"] = f"⚠ WARNING - Minor distortion (MSE={corr_mse:.6f})"
    else:
        interpretation["correlation_mse"] = f"✗ FAIL - Relationships distorted (MSE={corr_mse:.6f})"
    
    # Adversarial AUC interpretation
    if 0.45 <= auc <= 0.55:
        interpretation["adversarial_auc"] = f"✓ EXCELLENT - Synthetic indistinguishable from real (AUC={auc:.4f})"
    elif 0.40 <= auc < 0.45 or 0.55 < auc <= 0.60:
        interpretation["adversarial_auc"] = f"✓ GOOD - Limited distinguishability (AUC={auc:.4f})"
    else:
        interpretation["adversarial_auc"] = f"✗ WARNING - Easily distinguishable (AUC={auc:.4f})"
    
    return interpretation
