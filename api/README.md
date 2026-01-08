# SynthData FastAPI Backend

Production-grade REST API for synthetic tabular data generation and evaluation.

## 🎯 Overview

This FastAPI backend provides a thin orchestration layer over the existing `engine/` codebase. It exposes two main endpoints:

1. **POST /generate** - Generate synthetic data using CTGAN
2. **POST /evaluate** - Evaluate synthetic data quality with 4 metrics

### Key Design Principles

✅ **Separation of Concerns** - API layer only handles HTTP; ML logic stays in engine  
✅ **Non-Breaking** - Zero modifications to engine/ directory  
✅ **Frontend-Friendly** - JSON-first, CORS-enabled for React Native/Expo  
✅ **Testable** - Full Swagger UI at `/docs`  
✅ **Production-Ready** - Error handling, validation, file size limits  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Run the Server

```bash
# From the api/ directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Test in Browser

Open: **http://localhost:8000/docs**

You'll see Swagger UI with interactive API documentation.

---
