"""
SynthData FastAPI Application

Production-grade REST API for synthetic data generation and evaluation.
This is a thin orchestration layer — all ML logic lives in the engine/ directory.

Architecture:
- FastAPI handles HTTP, validation, serialization
- Engine handles ML/data processing
- Clean separation of concerns
"""

# Load environment variables FIRST, before any other imports
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.config import config
from api.schemas.requests import HealthResponse, ErrorResponse
from api.routes import auth, evaluate, generate, history
from api import models  # noqa: F401
from api.db.base import Base
from api.db.session import engine

# import sys
import os

# ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
# ENGINE_DIR = os.path.join(ROOT_DIR, "engine")

# if ENGINE_DIR not in sys.path:
#     sys.path.append(ENGINE_DIR)

# from config import config
# from schemas.requests import HealthResponse, ErrorResponse
# from routes import generate, evaluate


# ========== CREATE FASTAPI APP ==========

app = FastAPI(
    title=config.APP_TITLE,
    version=config.APP_VERSION,
    description=config.APP_DESCRIPTION,
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
    openapi_url="/openapi.json"
)


# ========== CORS MIDDLEWARE (for React Native / Expo) ==========

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== INCLUDE ROUTERS ==========

app.include_router(auth.router)
app.include_router(generate.router)
app.include_router(evaluate.router)
app.include_router(history.router)


# ========== HEALTH CHECK ENDPOINT ==========

@app.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    tags=["Health"],
    summary="Health Check",
    description="Check if the API is running and responsive"
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint.
    
    Returns service status and version information.
    Useful for monitoring, load balancers, and debugging.
    """
    return HealthResponse(
        status="healthy",
        version=config.APP_VERSION,
        message="SynthData API is running"
    )


# ========== ROOT ENDPOINT ==========

@app.get(
    "/",
    tags=["Info"],
    summary="API Information",
    description="Get basic API information and links to documentation"
)
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "name": config.APP_TITLE,
        "version": config.APP_VERSION,
        "status": "running",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_spec": "/openapi.json"
        },
        "endpoints": {
            "generate": "/generate",
            "evaluate": "/evaluate",
            "health": "/health"
        },
        "message": "Welcome to SynthData API. Visit /docs for interactive documentation."
    }


# ========== GLOBAL EXCEPTION HANDLER ==========

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """
    Catch-all exception handler for unexpected errors.
    
    Ensures all errors return JSON (not HTML) for frontend compatibility.
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="InternalServerError",
            message="An unexpected error occurred",
            detail=str(exc)
        ).dict()
    )


# ========== STARTUP EVENT ==========

@app.on_event("startup")
async def startup_event():
    """
    Run on application startup.
    
    Useful for:
    - Initializing connections
    - Loading models
    - Setting up directories
    """
    os.makedirs(config.DATA_DIR, exist_ok=True)

    Base.metadata.create_all(bind=engine)

    print(f"🚀 {config.APP_TITLE} v{config.APP_VERSION} is starting...")
    print(f"📁 Data directory: {config.DATA_DIR}")
    print(f"📊 Engine directory: {config.ENGINE_DIR}")
    print(f"✅ Startup complete. Visit http://localhost:8000/docs for API documentation.")


# ========== SHUTDOWN EVENT ==========

@app.on_event("shutdown")
async def shutdown_event():
    """
    Run on application shutdown.
    
    Useful for:
    - Closing connections
    - Cleaning up resources
    - Saving state
    """
    print(f"👋 {config.APP_TITLE} is shutting down...")


# ========== RUN INSTRUCTIONS ==========

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # (True) Auto-reload on code changes (development only) False for production
        log_level="info"
    )
