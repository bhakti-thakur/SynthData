# SynthData.ai Engine

Production-grade synthetic tabular data generation engine built with CTGAN.

## Overview

SynthData.ai is a modular Python engine for generating high-quality synthetic tabular data. It preserves statistical properties, supports mixed data types (numeric + categorical), and enforces constraints automatically.

**Key Features:**
- ✅ Automatic schema inference from CSV/DataFrame
- ✅ CTGAN-based generation (state-of-the-art)
- ✅ Mixed data type support (int, float, categorical)
- ✅ Constraint enforcement (min/max, categories)
- ✅ Clean, modular architecture
- ✅ API-ready (FastAPI integration coming soon)

## Project Structure

```
synthdata-engine/
├── schema/
│   ├── __init__.py
│   └── infer.py          # Schema inference logic
├── models/
│   ├── __init__.py
│   └── ctgan.py          # CTGAN wrapper
├── engine/
│   ├── __init__.py
│   └── generator.py      # Main orchestrator
├── test.py               # Test script
├── requirements.txt
└── README.md
```

## Installation

### Prerequisites
- Python 3.10 or higher
- pip

### Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd \SynthData\engine
   ```

2. **Create a virtual environment (Optional; Recommended):**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Quick Start

### Run the Test Script

The included test script demonstrates the full pipeline:

```bash
python test.py
```

This will:
1. Create/load sample data
2. Infer schema
3. Train CTGAN model
4. Generate synthetic data
5. Compare statistics
6. Save output to `data/synthetic_output.csv`

## Architecture

### 1. Schema Inference (`schema/infer.py`)

Analyzes DataFrames to extract:
- Column types (numeric vs categorical)
- Data types (int vs float)
- Constraints (min, max, unique categories)
- Missing value patterns

**Key Classes:**
- `ColumnInfo`: Metadata for a single column
- `Schema`: Complete dataset schema
- `infer_schema()`: Main inference function

### 2. CTGAN Wrapper (`models/ctgan.py`)

Clean interface to CTGAN library:
- `fit(data, schema)`: Train on data
- `sample(n)`: Generate synthetic rows
- `save()/load()`: Model persistence

**Design:** Hides all CTGAN complexity behind a simple API.

### 3. Generation Engine (`engine/generator.py`)

Orchestrates the full pipeline:
1. Schema inference
2. Model training
3. Sample generation
4. Post-processing (type casting, constraint enforcement)

**Key Class:**
- `SynthDataEngine`: Main entry point

## Configuration

### Engine Parameters

```python
engine = SynthDataEngine(
    epochs=300,                    # Training epochs (100-500 recommended)
    batch_size=500,                # Batch size (adjust based on data size)
    categorical_threshold=10,      # Max unique values for categorical
    verbose=True                   # Print progress
)
```

### Post-Processing

By default, generated data is post-processed to:
- Cast integers correctly
- Clip numeric values to min/max range
- Ensure categorical values are strings

Disable with: `engine.generate(n_rows=1000, apply_constraints=False)`

## Schema Details

### Automatic Type Detection

- **Categorical**: Object/string types, or numeric with ≤10 unique values
- **Integer**: Whole number numerics
- **Float**: Continuous numerics

### Example Schema Output

```python
schema = engine.schema
for col in schema.columns:
    print(col)

# Output:
# ColumnInfo(name='age', type='int', range=[18.0, 79.0])
# ColumnInfo(name='income', type='float', range=[15234.56, 198765.43])
# ColumnInfo(name='gender', type='categorical', categories=3)
```

## Performance

### Timing (1000 rows, 7 columns, 100 epochs):
- Schema inference: <1 second
- Training: 30-60 seconds (CPU) / 10-20 seconds (GPU)
- Generation: <1 second

### Recommendations:
- Use GPU for faster training (CTGAN uses PyTorch)
- Start with 100 epochs for testing, 300+ for production
- Batch size: 500-1000 for most datasets

## Roadmap

- [x] Core engine implementation
- [x] CTGAN integration
- [x] Schema inference
- [x] Post-processing
- [ ] FastAPI backend
- [ ] Additional models (VAE, Gaussian Copula)
- [ ] Advanced constraints (foreign keys, custom validators)
- [ ] Quality metrics (statistical tests, ML efficacy)

## Technical Notes

### Why CTGAN?

CTGAN (Conditional Tabular GAN) from the Synthetic Data Vault (SDV) project is the current state-of-the-art for tabular data because:
1. Handles mixed data types natively
2. Preserves correlations between columns
3. Supports categorical columns with many categories
4. Backed by research and production use

<!-- Reference: [CTGAN Paper (NeurIPS 2019)](https://arxiv.org/abs/1907.00503) -->

### Design Principles

1. **Modularity**: Each component (schema, model, engine) is independent
2. **Extensibility**: Easy to add new models or post-processing steps
3. **Type Safety**: Python type hints throughout
4. **Production-Ready**: No notebooks, clean .py modules
5. **API-First**: Built to be wrapped by FastAPI/Flask

## License

This is a proprietary project for SynthData.ai.

## Contact

For questions or issues, contact the development team.

---

**Built with ❤️ for synthetic data generation**
