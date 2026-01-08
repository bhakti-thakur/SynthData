# SynthData FastAPI Backend

Production-grade REST API for synthetic tabular data generation and evaluation.

## 🎯 Overview

This FastAPI backend provides a thin orchestration layer over the existing `engine/` codebase. It exposes two main endpoints:

1. **POST /generate**
	- **Mode A (default):** Data-driven CTGAN (unchanged)
	- **Mode B (new):** Schema-only generation (no real data required)
2. **POST /evaluate**
	- **Mode A:** Full 4-metric comparison (requires real data)
	- **Mode B:** Schema consistency report (no statistical tests)

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

## 🧭 Schema-Only Mode (Mode B)

Use when no real dataset is available. Generation is deterministic and rule-based (no ML).

- **Generate:** POST `/generate` with `schema` (JSON text) and `n_rows`. Do **not** send `file`/`file_path`.
- **Evaluate:** POST `/evaluate` with `schema` and either `dataset_id` (from `/generate`) or `synthetic_file`. Real data is not required and KS/Chi-Square/AUC are skipped.

### Example Schema

```json
{
	"seed": 42,
	"columns": [
		{"name": "id", "type": "identifier", "start": 1},
		{"name": "age", "type": "int", "min": 18, "max": 90},
		{"name": "income", "type": "float", "min": 30000, "max": 120000},
		{"name": "gender", "type": "categorical", "values": ["M", "F"]}
	]
}
```

**Tip:** If both schema and file are provided, the API returns 400 to keep Mode A behavior unchanged.

---
