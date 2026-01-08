"""
/generate endpoint

Thin orchestration layer for synthetic data generation.
Calls the existing engine without modifying core logic.
"""

import sys
import uuid
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse

# Add engine to Python path (non-invasive)
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "engine"))

# Import from existing engine (READ-ONLY)
from engine.generator import SynthDataEngine

from config import config
from schemas.requests import GenerateResponse


router = APIRouter(prefix="/generate", tags=["Generation"])


@router.post(
    "",
    response_model=GenerateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Synthetic Data",
    description="""
    Generate synthetic tabular data using CTGAN.
    
    **Input Options:**
    1. Upload a CSV file (multipart/form-data)
    2. Provide a file path on the server
    
    **Process:**
    - Load training data
    - Infer schema (automatic column type detection)
    - Train CTGAN model
    - Generate synthetic rows
    - Apply constraints and post-processing
    - Save to file
    
    **Returns:** Metadata only (not full dataset). Use download_url to retrieve CSV.
    """
)
async def generate_synthetic_data(
    file: Optional[UploadFile] = File(None, description="CSV file to upload"),
    file_path: Optional[str] = Form(None, description="Path to CSV on server"),
    n_rows: int = Form(1000, ge=1, le=100000, description="Rows to generate"),
    epochs: int = Form(300, ge=50, le=1000, description="Training epochs"),
    batch_size: int = Form(500, ge=100, le=2000, description="Batch size"),
    categorical_threshold: int = Form(10, ge=2, le=50, description="Categorical threshold"),
    apply_constraints: bool = Form(True, description="Apply post-processing")
) -> GenerateResponse:
    """
    Generate synthetic data endpoint.
    
    Steps:
    1. Load input data (from upload or file path)
    2. Initialize SynthDataEngine with provided config
    3. Fit engine on training data
    4. Generate synthetic rows
    5. Save output CSV
    6. Return metadata (dataset_id, download URL, etc.)
    """
    
    # ========== STEP 1: LOAD INPUT DATA ==========
    
    df_real: Optional[pd.DataFrame] = None
    
    if file is not None:
        # Option A: File upload
        if not config.validate_file_extension(file.filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {config.ALLOWED_EXTENSIONS}"
            )
        
        # Save uploaded file temporarily
        upload_path = config.get_upload_path(file.filename)
        
        try:
            contents = await file.read()
            
            # Check file size
            if len(contents) > config.MAX_UPLOAD_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Max size: {config.MAX_UPLOAD_SIZE_MB}MB"
                )
            
            with open(upload_path, "wb") as f:
                f.write(contents)
            
            df_real = pd.read_csv(upload_path)
            
        except pd.errors.ParserError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid CSV format: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading file: {str(e)}"
            )
    
    elif file_path is not None:
        # Option B: File path on server
        path = Path(file_path)
        
        if not path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File not found: {file_path}"
            )
        
        try:
            df_real = pd.read_csv(path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error reading file: {str(e)}"
            )
    
    else:
        # Neither file nor path provided
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide either 'file' upload or 'file_path'"
        )
    
    # ========== STEP 2: INITIALIZE ENGINE ==========
    
    try:
        engine = SynthDataEngine(
            epochs=epochs,
            batch_size=batch_size,
            categorical_threshold=categorical_threshold,
            verbose=True  # Enable logging for monitoring
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error initializing engine: {str(e)}"
        )
    
    # ========== STEP 3: FIT ENGINE ON TRAINING DATA ==========
    
    try:
        schema = engine.fit(df_real)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error training model: {str(e)}"
        )
    
    # ========== STEP 4: GENERATE SYNTHETIC DATA ==========
    
    try:
        df_synthetic = engine.generate(
            n_rows=n_rows,
            apply_constraints=apply_constraints
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating synthetic data: {str(e)}"
        )
    
    # ========== STEP 5: SAVE OUTPUT ==========
    
    # Generate unique dataset ID
    dataset_id = str(uuid.uuid4())
    output_path = config.get_output_path(dataset_id)
    
    try:
        df_synthetic.to_csv(output_path, index=False)
        file_size = output_path.stat().st_size
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving output: {str(e)}"
        )
    
    # ========== STEP 6: RETURN METADATA ==========
    
    return GenerateResponse(
        dataset_id=dataset_id,
        rows_generated=len(df_synthetic),
        columns=df_synthetic.columns.tolist(),
        file_size_bytes=file_size,
        download_url=f"/generate/download/{dataset_id}",
        message="Synthetic data generated successfully"
    )


@router.get(
    "/download/{dataset_id}",
    response_class=FileResponse,
    summary="Download Synthetic Dataset",
    description="Download a previously generated synthetic dataset as CSV"
)
async def download_dataset(dataset_id: str):
    """
    Download synthetic dataset by ID.
    
    Returns the CSV file for download.
    """
    output_path = config.get_output_path(dataset_id)
    
    if not output_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset not found: {dataset_id}"
        )
    
    return FileResponse(
        path=output_path,
        media_type="text/csv",
        filename=f"synthetic_{dataset_id}.csv"
    )
