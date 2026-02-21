# SynthData FastAPI Backend

Production-ready REST API for synthetic tabular data generation and evaluation.

## 🎯 Overview

This FastAPI backend provides a thin orchestration layer over the existing `engine/` codebase. It exposes two main endpoints:

1. **POST /generate**
	- **Mode A (default):** Data-driven CTGAN (unchanged)
	- **Mode B (new):** Schema-only generation (no real data required)
2. **POST /evaluate**
	- **Mode A:** Full 4-metric comparison (requires real data)
	- **Mode B:** Schema consistency report (no statistical tests)

### Key Design Principles

- **Separation of Concerns** - API layer only handles HTTP; ML logic stays in engine  
- **Non-Breaking** - Zero modifications to engine/ directory  
- **Frontend-Friendly** - JSON-first, CORS-enabled for React Native/Expo  
- **Testable** - Full Swagger UI at `/docs`  
- **Production-Ready** - Error handling, validation, file size limits  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd api
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a local env file from the template:

```bash
cd api
copy .env.example .env
```

Required variables:

- DATABASE_URL
- SECRET_KEY
- GOOGLE_CLIENT_ID

Example DATABASE_URL format:

```text
postgresql+psycopg2://username:password@host:5432/database_name
```

If you use PowerShell and want temporary values for a single session:

```powershell
$env:DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/synthdata"
$env:SECRET_KEY="change_me_to_a_long_random_secret"
$env:GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
```

### 3. Prepare PostgreSQL

1. Ensure PostgreSQL server is running.
2. Create the target database used in DATABASE_URL.

Example with psql:

```sql
CREATE DATABASE synthdata;
```

No manual table creation is required. Tables are auto-created at startup using SQLAlchemy metadata.

### 4. Run the Server

```bash
# From the api/ directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test in Browser

Open: **http://localhost:8000/docs**

You'll see Swagger UI with interactive API documentation.

---

## 🗃️ Database Schema (PostgreSQL)

### users

- id: UUID (primary key)
- email: string (unique, indexed, required)
- hashed_password: string (nullable for Google users)
- is_google_user: boolean (required, default false)
- created_at: timestamptz (server default now)

### user_activities

- id: UUID (primary key)
- user_id: UUID (foreign key to users.id, indexed)
- activity_type: string (required)
- mode: string (required)
- created_at: timestamptz (server default now)
- dataset_id: string (nullable)
- input_metadata: JSONB (nullable)
- result_snapshot: JSONB (nullable)
- download_url: string (nullable)

---

## ✅ Prerequisite Verification Checklist

1. PostgreSQL reachable from this machine.
2. DATABASE_URL points to an existing database.
3. SECRET_KEY is set and non-empty.
4. GOOGLE_CLIENT_ID is set.
5. API starts without runtime env errors.
6. /docs is accessible.
7. Register/Login returns bearer token.
8. /generate and /evaluate work with Authorization header.
9. /history returns activities for authenticated user.

---

## 📊 Data-Driven Mode (Mode A)

Use when you have real training data. Generation uses CTGAN (deep learning GAN).

- **Generate:** POST `/generate` with `file` (upload) or `file_path` (server path) + training parameters (`epochs`, `batch_size`, etc.)
- **Evaluate:** POST `/evaluate` with `real_file` and either `synthetic_file` or `dataset_id`. Returns 4 metrics: KS test, Chi-square, Correlation MSE, Adversarial AUC.

### Example Request (File Upload)

**Endpoint:** `POST /generate`

**Body (multipart/form-data):**
```
file: <upload your CSV>
n_rows: 100
epochs: 300
batch_size: 500
apply_constraints: true
```

**Expected Response:**
```json
{
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "rows_generated": 100,
  "columns": ["age", "income", "gender", "region"],
  "download_url": "/generate/download/550e8400-e29b-41d4-a716-446655440000",
  "message": "Synthetic data generated successfully"
}
```

**Tip:** Training takes 30-120 seconds depending on data size and epochs. Use the `download_url` to retrieve the CSV.

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
