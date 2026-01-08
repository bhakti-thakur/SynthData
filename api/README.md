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

## 📡 API Endpoints

### Health Check

**GET /health**

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "message": "SynthData API is running"
}
```

---

### Generate Synthetic Data

**POST /generate**

**Option A: Upload CSV File**

```bash
curl -X POST "http://localhost:8000/generate" \
  -F "file=@data/input.csv" \
  -F "n_rows=1000" \
  -F "epochs=300" \
  -F "apply_constraints=true"
```

**Option B: Use File Path on Server**

```bash
curl -X POST "http://localhost:8000/generate" \
  -F "file_path=engine/data/input.csv" \
  -F "n_rows=1000"
```

**Response:**
```json
{
  "dataset_id": "550e8400-e29b-41d4-a716-446655440000",
  "rows_generated": 1000,
  "columns": ["age", "income", "gender", "region"],
  "file_size_bytes": 45678,
  "download_url": "/generate/download/550e8400-e29b-41d4-a716-446655440000",
  "message": "Synthetic data generated successfully"
}
```

**Download the CSV:**

```bash
curl -O http://localhost:8000/generate/download/550e8400-e29b-41d4-a716-446655440000
```

---

### Evaluate Synthetic Data

**POST /evaluate**

**Option A: Upload Both Files**

```bash
curl -X POST "http://localhost:8000/evaluate" \
  -F "real_file=@data/real.csv" \
  -F "synthetic_file=@data/synthetic.csv"
```

**Option B: Use Dataset ID from /generate**

```bash
curl -X POST "http://localhost:8000/evaluate" \
  -F "real_file=@data/real.csv" \
  -F "dataset_id=550e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "ks_test": {
    "age": {"statistic": 0.0412, "p_value": 0.6234},
    "income": {"statistic": 0.0385, "p_value": 0.7892}
  },
  "chi_square": {
    "gender": {"statistic": 1.9456, "p_value": 0.3782}
  },
  "correlation_mse": 0.012345,
  "adversarial_auc": 0.5142,
  "message": "Evaluation completed successfully",
  "interpretation": {
    "ks_test": "✓ PASS - All numeric distributions match (p > 0.05)",
    "chi_square": "✓ PASS - All categorical distributions match (p > 0.05)",
    "correlation_mse": "✓ PASS - Relationships well-preserved (MSE=0.012345)",
    "adversarial_auc": "✓ EXCELLENT - Synthetic indistinguishable from real (AUC=0.5142)"
  }
}
```

---

## 📊 Metric Interpretation

| Metric | Good | Acceptable | Poor |
|--------|------|------------|------|
| **KS p-value** | > 0.05 | 0.02-0.05 | < 0.02 |
| **Chi-square p-value** | > 0.05 | 0.02-0.05 | < 0.02 |
| **Correlation MSE** | < 0.05 | 0.05-0.10 | > 0.10 |
| **Adversarial AUC** | 0.48-0.52 | 0.50-0.60 | > 0.65 |

---

## 🧪 Testing with Swagger UI

1. Navigate to: **http://localhost:8000/docs**
2. Click on any endpoint (e.g., `/generate`)
3. Click **"Try it out"**
4. Upload a file or fill in parameters
5. Click **"Execute"**
6. View the response

---

## 🗂️ Project Structure

```
api/
├── main.py                 # FastAPI app, startup, CORS
├── config.py               # Paths, defaults, constants
├── requirements.txt        # API dependencies
├── routes/
│   ├── generate.py         # POST /generate, GET /download
│   └── evaluate.py         # POST /evaluate
└── schemas/
    └── requests.py         # Pydantic models
```

---

## 🔒 Security & Limits

| Setting | Value |
|---------|-------|
| Max file size | 100 MB |
| Allowed formats | .csv only |
| CORS origins | localhost:8081, 19000, 19002 |
| Max rows to generate | 100,000 |

Modify these in `api/config.py`.

---

## 🌐 React Native / Expo Integration

### Example: Generate Synthetic Data

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:8000';

async function generateSyntheticData(file: File, nRows: number) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('n_rows', nRows.toString());
  formData.append('epochs', '300');
  
  const response = await axios.post(`${API_URL}/generate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data; // { dataset_id, rows_generated, download_url, ... }
}
```

### Example: Evaluate Data

```typescript
async function evaluateData(realFile: File, datasetId: string) {
  const formData = new FormData();
  formData.append('real_file', realFile);
  formData.append('dataset_id', datasetId);
  
  const response = await axios.post(`${API_URL}/evaluate`, formData);
  
  return response.data; // { ks_test, chi_square, correlation_mse, adversarial_auc, ... }
}
```

---

## 🐛 Troubleshooting

### Error: "Module 'engine' not found"

**Solution**: The API adds `engine/` to Python path automatically. Ensure your directory structure matches:

```
SynthData/
├── engine/
└── api/
```

### Error: "File too large"

**Solution**: Increase `MAX_UPLOAD_SIZE_MB` in `api/config.py`.

### CORS Errors from React Native

**Solution**: Add your Expo URL to `CORS_ORIGINS` in `api/config.py`:

```python
CORS_ORIGINS = [
    "http://your-expo-url:19000",
    ...
]
```

---

## 📝 Development Tips

### Auto-Reload

Uvicorn auto-reloads on code changes when using `--reload`:

```bash
uvicorn main:app --reload
```

### View Logs

All requests are logged to stdout. Monitor with:

```bash
python main.py | tee api.log
```

### Test with cURL

```bash
# Health check
curl http://localhost:8000/health

# Generate (with file)
curl -X POST http://localhost:8000/generate \
  -F "file=@test.csv" \
  -F "n_rows=500"

# Evaluate
curl -X POST http://localhost:8000/evaluate \
  -F "real_file=@real.csv" \
  -F "synthetic_file=@synthetic.csv"
```

---

## 🚀 Deployment

### Production Server

Use Gunicorn with Uvicorn workers:

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker (Optional)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY engine/ ./engine/
COPY api/ ./api/

EXPOSE 8000

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## ✅ Design Guarantees

- ✅ **Non-Breaking** - Zero changes to `engine/`
- ✅ **Stateless** - Each request is independent
- ✅ **JSON-First** - All responses JSON-serializable
- ✅ **CORS-Enabled** - Ready for React Native/Expo
- ✅ **Validated** - Pydantic ensures type safety
- ✅ **Documented** - Full Swagger UI
- ✅ **Production-Ready** - Error handling, file limits, logging

---

## 📚 Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Engine README**: `../engine/README.md`
- **Evaluation Docs**: `../engine/evaluation/README.md`
- **Swagger UI**: http://localhost:8000/docs (when running)

---

**Status**: ✅ Production-Ready  
**Version**: 1.0.0  
**Last Updated**: January 8, 2026
