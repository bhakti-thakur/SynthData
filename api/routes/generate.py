"""
/generate endpoint

Thin orchestration layer for synthetic data generation.
Calls the existing engine without modifying core logic.
"""

import sys
import uuid
import json
import logging
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

# Add engine to Python path (non-invasive)
# sys.path.insert(0, str(Path(__file__).parent.parent.parent / "engine"))

# Import from existing engine (READ-ONLY)
from engine.generation.generator import SynthDataEngine
from engine.schema_generator.generator import SchemaDataGenerator

from api.config import config
from api.core.activity import log_activity
from api.core.security import get_current_user
from api.db.session import get_db
from api.schemas.requests import GenerateResponse, SchemaDefinition


router = APIRouter(prefix="/generate", tags=["Generation"])
logger = logging.getLogger(__name__)


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
    3. Provide a JSON schema for schema-only generation (no real data)
    
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
    data_schema: Optional[str] = Form(None, description="JSON schema for schema-only generation (Mode B)"),
    n_rows: int = Form(1000, ge=1, le=100000, description="Rows to generate"),
    epochs: int = Form(300, ge=50, le=1000, description="Training epochs"),
    batch_size: int = Form(500, ge=100, le=2000, description="Batch size"),
    categorical_threshold: int = Form(10, ge=2, le=50, description="Categorical threshold"),
    apply_constraints: bool = Form(True, description="Apply post-processing"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
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
    print("[DEBUG] Entered /generate endpoint")
    
    # ========== STEP 0: VALIDATE INPUT MODE ==========
    # Three mutually exclusive modes:
    # Mode B: schema-only generation (data_schema provided)
    # Mode A: file-based generation (file or file_path provided)
    # Anything else: error
    
    schema_definition: Optional[SchemaDefinition] = None
    has_schema = data_schema is not None
    has_file = file is not None
    has_file_path = file_path is not None
    print(
        "[DEBUG] Parsed form fields:",
        {
            "data_schema_provided": has_schema,
            "file_provided": has_file,
            "file_path_provided": has_file_path,
            "n_rows": n_rows,
            "current_user_id": str(current_user.id),
        },
    )
    
    # Count how many input methods provided
    input_count = sum([has_schema, has_file, has_file_path])
    
    if input_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide one of: 'data_schema' (JSON for Mode B), 'file' (CSV upload), or 'file_path' (CSV path)"
        )
    
    if input_count > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide only one input method: either 'data_schema' OR 'file' OR 'file_path', not multiple"
        )
    
    df_real: Optional[pd.DataFrame] = None
    df_synthetic: Optional[pd.DataFrame] = None

    # ========== MODE B: SCHEMA-ONLY (NEW) ==========
    if has_schema:
        # Parse and validate schema JSON
        try:
            schema_dict = json.loads(data_schema)
            print("[DEBUG] Parsed schema:", schema_dict)
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
        
        # Mode B: schema_definition will be used later for generation without file

    # ========== MODE A: DATA-DRIVEN (UNCHANGED) ==========
    elif has_file or has_file_path:
        # Step 1: Load input data
        if file is not None:
            if not config.validate_file_extension(file.filename):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type. Allowed: {config.ALLOWED_EXTENSIONS}"
                )

            upload_path = config.get_upload_path(file.filename)

            try:
                contents = await file.read()

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
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Must provide either 'file' upload or 'file_path'"
            )

        # Step 2: Initialize engine (CTGAN)
        try:
            engine = SynthDataEngine(
                epochs=epochs,
                batch_size=batch_size,
                categorical_threshold=categorical_threshold,
                verbose=True  # keep logging for Mode A
            )
        except Exception as e:
            logger.exception("Failed to initialize SynthDataEngine")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error initializing engine: {str(e)}"
            )

        # Step 3: Fit engine on training data
        try:
            engine.fit(df_real)
        except Exception as e:
            logger.exception("CTGAN training failed during engine.fit")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error training model: {str(e)}"
            )

        # Step 4: Generate synthetic data
        try:
            df_synthetic = engine.generate(
                n_rows=n_rows,
                apply_constraints=apply_constraints
            )
        except Exception as e:
            logger.exception("Synthetic data generation failed during engine.generate")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating synthetic data: {str(e)}"
            )

    # ========== MODE B: SCHEMA-ONLY GENERATION ==========
    else:
        try:
            print("[DEBUG] Calling schema generation engine...")
            generator = SchemaDataGenerator(seed=schema_definition.seed)
            df_synthetic = generator.generate(schema_definition.dict(), n_rows=n_rows)
            df_synth = df_synthetic
            print("[DEBUG] Generated DataFrame type:", type(df_synth))
            print(
                "[DEBUG] Generated DataFrame shape:",
                df_synth.shape if df_synth is not None else None,
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Schema generation failed: {str(e)}"
            )

    df_synth = df_synthetic
    if df_synth is None or (hasattr(df_synth, "empty") and df_synth.empty):
        print("[DEBUG ERROR] df_synth is None or empty!")

    if df_synthetic is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Synthetic data generation did not produce any output"
        )

    # ========== STEP 5: SAVE OUTPUT ==========
    
    # Generate unique dataset ID
    dataset_id = str(uuid.uuid4())
    output_path = config.get_output_path(dataset_id)
    
    try:
        print("[DEBUG] Saving file to path:", output_path)
        df_synthetic.to_csv(output_path, index=False)
        file_size = output_path.stat().st_size
        print("[DEBUG] File saved successfully")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving output: {str(e)}"
        )
    
    # ========== STEP 6: RETURN METADATA ==========
    
    response = GenerateResponse(
        dataset_id=dataset_id,
        rows_generated=len(df_synthetic),
        columns=df_synthetic.columns.tolist(),
        file_size_bytes=file_size,
        download_url=f"/generate/download/{dataset_id}",
        message="Synthetic data generated successfully"
    )

    log_activity(
        db,
        user_id=current_user.id,
        activity_type="generate",
        mode="schema" if schema_definition else "model",
        dataset_id=dataset_id,
        input_metadata={
            "n_rows": n_rows,
            "epochs": epochs,
            "batch_size": batch_size,
            "categorical_threshold": categorical_threshold,
            "apply_constraints": apply_constraints,
            "has_schema": schema_definition is not None,
            "file_name": file.filename if file else None,
            "file_path": file_path,
        },
        result_snapshot={
            "rows_generated": response.rows_generated,
            "columns": response.columns,
            "file_size_bytes": response.file_size_bytes,
        },
        download_url=response.download_url,
    )

    return response


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
