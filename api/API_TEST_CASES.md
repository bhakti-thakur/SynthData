# SynthData API Test Cases for Testing API

**Updated for JWT Authentication with Refresh Tokens**

Base URL: `http://localhost:8000`

---

## PREREQUISITE: Authentication Setup

All endpoints except `/auth/*` and `/health` require JWT Bearer token authentication.

**Token Flow:**
1. Register or Login to get `access_token` + `refresh_token`
2. Use `access_token` in `Authorization: Bearer {token}` header
3. When access token expires (30 min), use `refresh_token` at `/auth/refresh` to get new tokens
4. Logout clears refresh token from DB

---

## TEST 1: Health Check (No Auth Required)

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

## TEST 2: Root Endpoint (No Auth Required)

**Endpoint:** `GET /`

**Headers:** None required

**Body:** None

**Expected Response (200 OK):**
```json
{
  "name": "SynthData API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/auth",
    "generate": "/generate",
    "evaluate": "/evaluate",
    "health": "/health"
  }
}
```

---

## TEST 3: Register New User

**Endpoint:** `POST /auth/register`

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Expected Response (201 Created):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Save `refresh_token` for TEST 7 (logout test)**

---

## TEST 4: Login with Email/Password

**Endpoint:** `POST /auth/login`

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Note:** 
- Password must be at least 8 characters
- Each login generates a NEW refresh token (single-device login enforced)
- Previous device's refresh token becomes invalid

---

## TEST 5: Google OAuth Login

**Endpoint:** `POST /auth/google`

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "id_token": "GOOGLE_ID_TOKEN_HERE"
}
```

**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Note:** 
- Requires valid Google ID token (get from Google SDK)
- Email must be present in token
- Auto-creates user account if doesn't exist

---

## TEST 6: Refresh Access Token

**Endpoint:** `POST /auth/refresh`

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Security Notes:**
- Old refresh token becomes invalid immediately (token rotation)
- Returns new access + refresh tokens
- Expires after 7 days of inactivity (exp claim in JWT)
- Malformed/invalid/expired token → 401 Unauthorized

---

## TEST 7: Logout (Clear Refresh Token)

**Endpoint:** `POST /auth/logout`

**Headers:** 
- Authorization: `Bearer {access_token}`
- Content-Type: `application/json`

**Body:** Empty JSON `{}`

**Expected Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

**After Logout:**
- Access token still valid for ~30 minutes
- Refresh token becomes invalid immediately
- Cannot refresh again unless login again
- Cannot use endpoints requiring auth after token expires

---

## TEST 8: Invalid Login Credentials

**Endpoint:** `POST /auth/login`

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "detail": "Invalid credentials"
}
```

---

## TEST 9: Duplicate Email Registration

**Endpoint:** `POST /auth/register`

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "anotherpassword123"
}
```

**Expected Response (400 Bad Request):**
```json
{
  "detail": "Email already registered"
}
```

---

## TEST 10: Invalid Refresh Token

**Endpoint:** `POST /auth/refresh`

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "refresh_token": "invalid-token-string"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "detail": "Invalid or expired refresh token"
}
```

---

## TEST 11: Refresh After Logout

**Endpoint:** `POST /auth/refresh`

**Prerequisites:** Must have called TEST 7 (logout) first

**Headers:** 
- Content-Type: `application/json`

**Body (Raw JSON):**
```json
{
  "refresh_token": "the-token-you-saved-before-logout"
}
```

**Expected Response (401 Unauthorized):**
```json
{
  "detail": "Invalid refresh token"
}
```

**Reason:** Logout sets `refresh_token_hash = None`, making token invalid

---

## TEST 12: Missing Authorization Header

**Endpoint:** `POST /generate` (any authenticated endpoint)

**Headers:** None

**Body:** Form-Data with file

**Expected Response (403 Forbidden):**
```json
{
  "detail": "Not authenticated"
}
```

---

## TEST 13: Expired/Invalid Access Token

**Endpoint:** `POST /generate` (any authenticated endpoint)

**Headers:** 
- Authorization: `Bearer invalid-or-expired-token`

**Body:** Form-Data with file

**Expected Response (401 Unauthorized):**
```json
{
  "detail": "Invalid authentication token"
}
```

---

## TEST 14: Generate Synthetic Data (File Upload)

**Endpoint:** `POST /generate`

**Headers:** 
- Authorization: `Bearer {access_token}`
- Content-Type: `multipart/form-data` (auto-set by Hoppscotch)

**Body (Form-Data):**
- `file`: **FILE UPLOAD** - Select your CSV file (e.g., `input.csv` or `synthetic_output.csv`)
- `n_rows`: `100` (number, 1-100000)
- `epochs`: `100` (number)
- `batch_size`: `100` (number, minimum 100) (can not be ODD (rule applied by CT GAN lib))
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

**Note:** 
- Requires valid access token
- Activity is logged in user's history
- Dataset is linked to user account
- Generated dataset will download only if you send bearer token isnide the get request 

---

## TEST 15: Generate Synthetic Data (Schema-Only, Mode B)

**Endpoint:** `POST /generate`

**Headers:** 
- Authorization: `Bearer {access_token}`
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `data_schema`: JSON text (example below)
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

## TEST 16: Generate - File Path (Alternative Method)

**Endpoint:** `POST /generate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

## TEST 17: Generate - Invalid (No File or Path)

**Endpoint:** `POST /generate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

## TEST 18: Generate - Invalid n_rows (Too Large)

**Endpoint:** `POST /generate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

## TEST 19: Generate - File Not Found

**Endpoint:** `POST /generate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

## TEST 20: Download Generated Dataset

**Endpoint:** `GET /generate/download/{dataset_id}`

**Example:** `GET /generate/download/synth_20260108_143052_a1b2c3`

**Headers:** 
- Authorization: `Bearer {access_token}`

**Body:** None

**Expected Response (200 OK):**
- Content-Type: `text/csv; charset=utf-8`
- CSV file download with synthetic data
- Headers: `customer_id,age,income,gender,region`
- 100+ rows of data

**Note:** Only dataset owner can download their datasets

---

## TEST 21: Download - Invalid Dataset ID

**Endpoint:** `GET /generate/download/nonexistent-id`

**Headers:** 
- Authorization: `Bearer {access_token}`

**Body:** None

**Expected Response (404 Not Found):**
```json
{
  "detail": "Dataset not found: nonexistent-id"
}
```

---

## TEST 22: Evaluate - Both Files Uploaded

**Endpoint:** `POST /evaluate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

**Note:** Activity is logged in user's history

---

## TEST 23: Evaluate - Schema-Only (Mode B)

**Endpoint:** `POST /evaluate`

**Headers:** 
- Authorization: `Bearer {access_token}`
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `data_schema`: (JSON text, same as TEST 15 schema example)
- `dataset_id`: Use the ID returned from TEST 15

**Note:** Can evaluate schema against a synthetic data file too (can also upload schema and frontend can parse schema and send it as json text)

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

## TEST 24: Evaluate - Using Dataset ID

**Prerequisite:** First run TEST 14 to generate synthetic data and get `dataset_id`

**Endpoint:** `POST /evaluate`

**Headers:** 
- Authorization: `Bearer {access_token}`
- Content-Type: `multipart/form-data`

**Body (Form-Data):**
- `real_file`: Upload real CSV (e.g., `input.csv`)
- `dataset_id`: `synth_20260108_143052_a1b2c3` (text - use ID from TEST 14)

**Expected Response (200 OK):**
```json
{
  "message": "Evaluation completed successfully",
  "ks_test": { /* same structure as TEST 22 */ },
  "chi_square": { /* same structure as TEST 22 */ },
  "correlation_mse": 0.002345,
  "adversarial_auc": 0.5234,
  "interpretation": { /* same structure as TEST 22 */ }
}
```

---

## TEST 25: Evaluate - Missing Real File

**Endpoint:** `POST /evaluate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

## TEST 26: Evaluate - Missing Synthetic Source

**Endpoint:** `POST /evaluate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

## TEST 27: Evaluate - Invalid Dataset ID

**Endpoint:** `POST /evaluate`

**Headers:** 
- Authorization: `Bearer {access_token}`
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

## TEST 28: View Activity History

**Endpoint:** `GET /history`

**Headers:** 
- Authorization: `Bearer {access_token}`

**Body:** None

**Expected Response (200 OK):**
```json
{
  "activities": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-uuid-here",
      "activity_type": "generate",
      "mode": "file",
      "input_metadata": {
        "file": "input.csv",
        "n_rows": 100,
        "epochs": 100
      },
      "result_snapshot": {
        "dataset_id": "synth_20260108_143052_a1b2c3",
        "rows_generated": 100,
        "columns": ["customer_id", "age", "income", "gender", "region"]
      },
      "created_at": "2026-02-21T10:30:45.123456+00:00"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "user-uuid-here",
      "activity_type": "evaluate",
      "mode": "statistical",
      "input_metadata": {
        "real_file": "input.csv",
        "synthetic_file": "synthetic_output.csv"
      },
      "result_snapshot": {
        "correlation_mse": 0.002345,
        "adversarial_auc": 0.5234
      },
      "created_at": "2026-02-21T10:35:20.654321+00:00"
    }
  ]
}
```

**Note:** Shows all activities for authenticated user

---

## TEST 29: View Activity by ID

**Endpoint:** `GET /history/{activity_id}`

**Example:** `GET /history/550e8400-e29b-41d4-a716-446655440000`

**Headers:** 
- Authorization: `Bearer {access_token}`

**Body:** None

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user-uuid-here",
  "activity_type": "generate",
  "mode": "file",
  "input_metadata": {
    "file": "input.csv",
    "n_rows": 100,
    "epochs": 100
  },
  "result_snapshot": {
    "dataset_id": "synth_20260108_143052_a1b2c3",
    "rows_generated": 100,
    "columns": ["customer_id", "age", "income", "gender", "region"]
  },
  "created_at": "2026-02-21T10:30:45.123456+00:00"
}
```

---

## FULL WORKFLOW TEST

### Step 1: Register/Login
`POST /auth/register` or `POST /auth/login` → Get `access_token` + `refresh_token`

### Step 2: Generate
`POST /generate` with Authorization header → Get `dataset_id`

### Step 3: Download
`GET /generate/download/{dataset_id}` with Authorization header → Download CSV

### Step 4: Evaluate
`POST /evaluate` with Authorization header → Get quality metrics

### Step 5: View History
`GET /history` with Authorization header → See all activities

### Step 6: Logout
`POST /auth/logout` with Authorization header → Clear refresh token

---

## Quick Hoppscotch Setup

1. **Open Hoppscotch:** https://hoppscotch.io/
2. **Set Base URL:** `http://localhost:8000`
3. **For JWT Auth:**
   - Copy `access_token` from login/register response
   - In Authorization tab, select "Bearer Token"
   - Paste token in the field
4. **For File Uploads:**
   - Select "Body" tab
   - Choose "Multipart Form"
   - Add fields with types (Text, File, Number)
5. **Run Tests:** Copy endpoint, method, and body from above
6. **Check Response:** Verify status code and response body match expected output

---

## Tips

- **Start with TEST 3** (Register) to get access token
- **Always include Authorization header** (except health/auth endpoints)
- **Save tokens** from registration/login for subsequent tests
- **Token expiration:** Access token = 30 minutes, Refresh token = 7 days
- **Use TEST 6** to refresh access token after 30 minutes
- **Use TEST 7** to logout and clear refresh token
- **File paths** must use forward slashes or double backslashes on Windows
- **Generation takes 30-60 seconds** depending on epochs and data size
- **Evaluation takes 10-20 seconds** for statistical tests
- **Use Swagger UI** alternative: http://localhost:8000/docs (includes auth form)
