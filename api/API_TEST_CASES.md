# SynthData API Test Cases for Testing API

Base URL: `http://localhost:8000`

---

## TEST 1: Health Check

**Endpoint:** `GET /health`

**Headers:** None required

**Body:** None

**Expected Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "message": "SynthData API is running"
}
```

---

## TEST 2: Root Endpoint

**Endpoint:** `GET /`

**Headers:** None required

**Body:** None

**Expected Response (200 OK):**
```json
{
  "name": "SynthData API",
  "version": "1.0.0",
  "endpoints": {
    "generate": "/generate",
    "evaluate": "/evaluate",
    "health": "/health"
  }
}
```

---

## TEST 3: Generate Synthetic Data (File Upload)

**Endpoint:** `POST /generate`

**Headers:** 
- Content-Type: `multipart/form-data` (auto-set by Hoppscotch)

**Body (Form-Data):**
- `file`: **FILE UPLOAD** - Select your CSV file (e.g., `input.csv` or `synthetic_output.csv`)
- `n_rows`: `100` (number, 1-100000)
- `epochs`: `100` (number)
- `batch_size`: `100` (number, minimum 100)
- `apply_constraints`: `true` (boolean)

**Expected Response (201 Created):**
```json
{
  "message": "Synthetic data generated successfully",
  "dataset_id": "synth_20260108_143052_a1b2c3",
  "rows_generated": 100,
  "columns": ["customer_id", "age", "income", "gender", "region"],
  "download_url": "/generate/download/synth_20260108_143052_a1b2c3",
  "generation_params": {
    "epochs": 100,
    "batch_size": 100,
    "apply_constraints": true
  }
}
```

---

## TEST 3B: Generate Synthetic Data (Schema-Only, Mode B)

**Endpoint:** `POST /generate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `schema`: JSON text (example below)
- `n_rows`: `50` (number)

**Schema Example (paste as text):**
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

**Expected Response (201 Created):**
```json
{
  "message": "Synthetic data generated successfully",
  "dataset_id": "schema_20260108_143500_abcd12",
  "rows_generated": 50,
  "columns": ["id", "age", "income", "gender"],
  "download_url": "/generate/download/schema_20260108_143500_abcd12",
  "generation_params": {
    "epochs": 300,
    "batch_size": 500,
    "apply_constraints": true
  }
}
```

---

## TEST 4: Generate - File Path (Alternative Method)

**Endpoint:** `POST /generate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `file_path`: `C:/Users/tbhak/Desktop/SynthData/engine/data/input.csv` (text)
- `n_rows`: `50` (number)
- `epochs`: `50` (number)

**Expected Response (201 Created):**
```json
{
  "message": "Synthetic data generated successfully",
  "dataset_id": "synth_20260108_143105_x9y8z7",
  "rows_generated": 50,
  "columns": ["customer_id", "age", "income", "gender", "region"],
  "download_url": "/generate/download/synth_20260108_143105_x9y8z7",
  "generation_params": {
    "epochs": 50,
    "batch_size": 500,
    "apply_constraints": true
  }
}
```

---

## TEST 5: Generate - Invalid (No File or Path)

**Endpoint:** `POST /generate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `n_rows`: `100` (number)

**Expected Response (400 Bad Request):**
```json
{
  "detail": "Must provide either 'file' upload or 'file_path'"
}
```

---

## TEST 6: Generate - Invalid n_rows (Too Large)

**Endpoint:** `POST /generate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `file_path`: `C:/Users/tbhak/Desktop/SynthData/engine/data/input.csv` (text)
- `n_rows`: `200000` (number - exceeds max 100000)

**Expected Response (422 Validation Error):**
```json
{
  "detail": [
    {
      "type": "less_than_equal",
      "loc": ["body", "n_rows"],
      "msg": "Input should be less than or equal to 100000",
      "input": 200000,
      "ctx": {"le": 100000}
    }
  ]
}
```

---

## TEST 7: Generate - File Not Found

**Endpoint:** `POST /generate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `file_path`: `C:/nonexistent/file.csv` (text)
- `n_rows`: `100` (number)

**Expected Response (404 Not Found):**
```json
{
  "detail": "File not found: C:/nonexistent/file.csv"
}
```

---

## TEST 8: Download Generated Dataset

**Endpoint:** `GET /generate/download/{dataset_id}`

**Example:** `GET /generate/download/synth_20260108_143052_a1b2c3`

**Headers:** None required

**Body:** None

**Expected Response (200 OK):**
- Content-Type: `text/csv; charset=utf-8`
- CSV file download with synthetic data
- Headers: `customer_id,age,income,gender,region`
- 100+ rows of data

---

## TEST 9: Download - Invalid Dataset ID

**Endpoint:** `GET /generate/download/nonexistent-id`

**Headers:** None required

**Body:** None

**Expected Response (404 Not Found):**
```json
{
  "detail": "Dataset not found: nonexistent-id"
}
```

---

## TEST 10: Evaluate - Both Files Uploaded

**Endpoint:** `POST /evaluate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `real_file`: Upload real CSV (e.g., `input.csv`)
- `synthetic_file`: Upload synthetic CSV (e.g., `synthetic_output.csv`)

**Expected Response (200 OK):**
```json
{
  "message": "Evaluation completed successfully",
  "ks_test": {
    "age": {
      "statistic": 0.0234,
      "p_value": 0.9876,
      "similar": true
    },
    "income": {
      "statistic": 0.0456,
      "p_value": 0.8234,
      "similar": true
    }
  },
  "chi_square": {
    "gender": {
      "statistic": 1.234,
      "p_value": 0.5432,
      "similar": true
    },
    "region": {
      "statistic": 2.345,
      "p_value": 0.4321,
      "similar": true
    }
  },
  "correlation_mse": 0.002345,
  "adversarial_auc": 0.5234,
  "interpretation": {
    "ks_test": "2/2 numeric columns passed KS test (p > 0.05) - distributions are statistically similar",
    "chi_square": "2/2 categorical columns passed Chi-square test (p > 0.05) - distributions are statistically similar",
    "correlation_mse": "Correlation MSE: 0.0023 - Excellent preservation (< 0.01)",
    "adversarial_auc": "Adversarial AUC: 0.5234 - Excellent quality (near 0.5 = hard to distinguish)"
  }
}
```

---

## TEST 10B: Evaluate - Schema-Only (Mode B)

**Endpoint:** `POST /evaluate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `schema`: (JSON text, same as TEST 3B schema example)
- `dataset_id`: Use the ID returned from TEST 3B

**Expected Response (200 OK):**
```json
{
  "schema_validity": "PASS",
  "type_consistency": "All columns match declared types",
  "range_violations": 0,
  "category_violations": 0,
  "null_rate": {
    "id": 0.0,
    "age": 0.0,
    "income": 0.0,
    "gender": 0.0
  },
  "identifier_issues": null,
  "message": "Schema-only evaluation completed"
}
```

---

## TEST 11: Evaluate - Using Dataset ID

**Prerequisite:** First run TEST 3 to generate synthetic data and get `dataset_id`

**Endpoint:** `POST /evaluate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `real_file`: Upload real CSV (e.g., `input.csv`)
- `dataset_id`: `synth_20260108_143052_a1b2c3` (text - use ID from TEST 3)

**Expected Response (200 OK):**
```json
{
  "message": "Evaluation completed successfully",
  "ks_test": { /* same structure as TEST 10 */ },
  "chi_square": { /* same structure as TEST 10 */ },
  "correlation_mse": 0.002345,
  "adversarial_auc": 0.5234,
  "interpretation": { /* same structure as TEST 10 */ }
}
```

---

## TEST 12: Evaluate - Missing Real File

**Endpoint:** `POST /evaluate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `dataset_id`: `synth_20260108_143052_a1b2c3` (text)

**Expected Response (400 Bad Request):**
```json
{
  "detail": "Must provide 'real_file' for comparison"
}
```

---

## TEST 13: Evaluate - Missing Synthetic Source

**Endpoint:** `POST /evaluate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `real_file`: Upload real CSV

**Expected Response (400 Bad Request):**
```json
{
  "detail": "Must provide either 'synthetic_file' or 'dataset_id'"
}
```

---

## TEST 14: Evaluate - Invalid Dataset ID

**Endpoint:** `POST /evaluate`

**Headers:** 
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `real_file`: Upload real CSV
- `dataset_id`: `invalid-id-12345` (text)

**Expected Response (404 Not Found):**
```json
{
  "detail": "Dataset not found: invalid-id-12345"
}
```

---

## FULL WORKFLOW TEST

### Step 1: Generate
`POST /generate` with `input.csv` file → Get `dataset_id`

### Step 2: Download
`GET /generate/download/{dataset_id}` → Download CSV

### Step 3: Evaluate
`POST /evaluate` with `real_file` + `dataset_id` → Get quality metrics

---

## Quick Hoppscotch Setup

1. **Open Hoppscotch:** https://hoppscotch.io/
2. **Set Base URL:** `http://localhost:8000`
3. **For File Uploads:**
   - Select "Body" tab
   - Choose "Multipart Form"
   - Add fields with types (Text, File, Number)
4. **Run Tests:** Copy the endpoint, method, and body from above
5. **Check Response:** Verify status code and response body match expected output

---

## Tips

- **Start with TEST 1** (Health Check) to verify server is running
- **Save `dataset_id`** from TEST 3 for use in TEST 8, 11, 14
- **File paths** must use forward slashes or double backslashes on Windows
- **Generation takes 30-60 seconds** depending on epochs and data size
- **Evaluation takes 10-20 seconds** for statistical tests
- **Use Swagger UI** alternative: http://localhost:8000/docs
