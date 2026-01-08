"""
SynthData FastAPI Application

Production-grade REST API for synthetic data generation and evaluation.
This is a thin orchestration layer — all ML logic lives in the engine/ directory.

Architecture:
- FastAPI handles HTTP, validation, serialization
- Engine handles ML/data processing
- Clean separation of concerns
"""

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import config
from schemas.requests import HealthResponse, ErrorResponse
from routes import generate, evaluate


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

app.include_router(generate.router)
app.include_router(evaluate.router)


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
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (development only)
        log_level="info"
    )
