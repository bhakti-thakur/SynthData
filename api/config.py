"""
FastAPI Configuration Module

Centralized configuration for paths, defaults, and constants.
NO business logic here — only configuration values.
"""

from pathlib import Path
from typing import Optional


class Config:
    """
    Application configuration.
    
    All paths and defaults are defined here to ensure consistency
    across the API layer.
    """
    
    # ========== PATHS ==========
    
    # Root directory of the project
    PROJECT_ROOT = Path(__file__).parent.parent.resolve()
    
    # Engine directory (READ-ONLY — never modify)
    ENGINE_DIR = PROJECT_ROOT / "engine"
    
    # Data storage directory for uploads and outputs
    DATA_DIR = PROJECT_ROOT / "data"
    UPLOADS_DIR = DATA_DIR / "uploads"
    OUTPUTS_DIR = DATA_DIR / "outputs"
    
    # Ensure directories exist
    DATA_DIR.mkdir(exist_ok=True)
    UPLOADS_DIR.mkdir(exist_ok=True)
    OUTPUTS_DIR.mkdir(exist_ok=True)
    
    # ========== ENGINE DEFAULTS ==========
    
    # CTGAN training parameters (can be overridden by API request)
    DEFAULT_EPOCHS = 300
    DEFAULT_BATCH_SIZE = 500
    DEFAULT_CATEGORICAL_THRESHOLD = 10
    
    # Generation defaults
    DEFAULT_ROWS_TO_GENERATE = 1000
    
    # ========== API SETTINGS ==========
    
    # API metadata
    APP_TITLE = "SynthData API"
    APP_VERSION = "1.0.0"
    APP_DESCRIPTION = """
    Production-grade synthetic data generation API.
    
    Features:
    - Generate synthetic tabular data using CTGAN
    - Evaluate synthetic data quality with 4 complementary metrics
    - JSON-first responses for easy frontend integration
    """
    
    # CORS (for React Native / Expo)
    CORS_ORIGINS = [
        "http://localhost:8081",  # Expo default
        "http://localhost:19000",  # Expo alternative
        "http://localhost:19002",  # Expo web
    ]
    
    # File upload limits
    MAX_UPLOAD_SIZE_MB = 100
    MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    # Supported file types
    ALLOWED_EXTENSIONS = {".csv"}
    
    # ========== VALIDATION ==========
    
    @staticmethod
    def validate_file_extension(filename: str) -> bool:
        """Check if file extension is allowed."""
        return Path(filename).suffix.lower() in Config.ALLOWED_EXTENSIONS
    
    @staticmethod
    def get_output_path(dataset_id: str) -> Path:
        """Generate output file path for a given dataset ID."""
        return Config.OUTPUTS_DIR / f"{dataset_id}.csv"
    
    @staticmethod
    def get_upload_path(filename: str) -> Path:
        """Generate upload file path."""
        return Config.UPLOADS_DIR / filename


# Singleton config instance
config = Config()
