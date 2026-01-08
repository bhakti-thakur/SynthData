# Evaluation Engine

Evaluation framework for synthetic tabular data quality assessment.

## Overview

The Evaluation Engine provides quantitative, research-backed metrics to compare REAL vs SYNTHETIC data:

1. **Statistical Similarity** - Detects distributional differences
2. **Adversarial Detectability** - Measures structural distinguishability
3. **Correlation Preservation** - Ensures feature relationships are maintained

## Key Features

- **Identifier-aware**: Automatically excludes ID columns from evaluation
- **Type-aware**: Handles numeric, categorical, and mixed-type data
- **Robust**: Handles missing values, edge cases, and zero-count categories
- **Production-ready**: No hyperparameter tuning required
- **Interpretable**: All metrics have clear, actionable interpretations

## Metrics

### 1. KS Test (Numeric Columns)

**Function**: `evaluate_statistical_similarity()` → `ks_test`

**What it measures**: Whether synthetic numeric distributions match real distributions

**Method**: Two-sample Kolmogorov–Smirnov test
- Non-parametric (no normality assumption)
- Sensitive to location, scale, and shape
- Tests null hypothesis: "Two distributions are equal"

**Interpretation**:
- **p-value > 0.05**: ✓ Distributions are statistically equivalent
- **p-value ≤ 0.05**: ✗ Significant difference detected
- **statistic**: Maximum absolute difference between CDFs (0 to 1)

**Example**:
```python
eval_results = evaluate_statistical_similarity(df_real, df_synthetic, schema)
ks_tests = eval_results["ks_test"]
for column, result in ks_tests.items():
    p_val = result["p_value"]
    if p_val > 0.05:
        print(f"✓ {column}: distributions match (p={p_val:.4f})")
    else:
        print(f"✗ {column}: distributions differ (p={p_val:.4f})")
```

### 2. Chi-Square Test (Categorical Columns)

**Function**: `evaluate_statistical_similarity()` → `chi_square`

**What it measures**: Whether synthetic categorical distributions match real distributions

**Method**: Chi-square goodness-of-fit test
- Compares observed vs expected frequencies
- Robust to categorical data
- Tests null hypothesis: "Two distributions are equal"

**Interpretation**:
- **p-value > 0.05**: ✓ Distributions are statistically equivalent
- **p-value ≤ 0.05**: ✗ Significant difference detected
- **statistic**: Aggregated squared differences between frequencies

**Edge cases handled**:
- Missing categories in one dataset: treated as 0 count
- Empty columns: skipped
- Zero-count categories: preserved (not removed)

**Example**:
```python
chi_results = eval_results["chi_square"]
for column, result in chi_results.items():
    p_val = result["p_value"]
    if p_val > 0.05:
        print(f"✓ {column}: category distributions match (p={p_val:.4f})")
```

### 3. Correlation Matrix MSE

**Function**: `evaluate_statistical_similarity()` → `correlation_mse`

**What it measures**: Whether synthetic data preserves linear relationships between numeric features

**Method**: Mean Squared Error between Pearson correlation matrices
```
MSE = mean((real_corr - synthetic_corr)²)
```

**Why this matters**:
- Feature relationships encode domain logic
- Broken correlations can violate business rules
- Example: Absence of correlation between age and income in synthetic data suggests structural issues

**Interpretation**:
- **MSE < 0.05**: ✓ Relationships well-preserved
- **MSE 0.05-0.10**: ⚠ Minor distortion
- **MSE > 0.10**: ✗ Significant relationship changes

**Example**:
```python
corr_mse = eval_results["correlation_mse"]
if corr_mse < 0.05:
    print(f"✓ Correlations preserved (MSE={corr_mse:.6f})")
else:
    print(f"✗ Correlations distorted (MSE={corr_mse:.6f})")
```

### 4. Adversarial Detectability (AUC)

**Function**: `evaluate_adversarial_detectability()`

**What it measures**: How easily a classifier can distinguish real from synthetic data

**Method**: RandomForestClassifier binary classification
- Labels: real=1, synthetic=0
- Features: One-hot encoded numeric + categorical columns
- Train/test split: 70/30 (stratified)
- Metric: ROC-AUC on test set

**Why this metric**:
- Holistic: Captures any systematic difference (captures failures in other metrics)
- Parameter-free: RF handles feature interactions automatically
- Research-standard: Widely used in privacy/synthetic data literature
- Model-agnostic: Works on any tabular structure

**Interpretation**:
- **AUC ≈ 0.50**: ✓ EXCELLENT - Indistinguishable from real
- **AUC 0.50-0.60**: ✓ GOOD - Limited distinguishability
- **AUC > 0.65**: ✗ WARNING - Easily distinguished
- **AUC > 0.80**: ✗ POOR - Very easily distinguished

**Ranges explained**:
- AUC = 0.50: Random classifier (perfect synthetic quality)
- AUC = 1.00: Perfect classifier (terrible synthetic quality)
- AUC = 0.52: 52% confidence → effectively random

**Example**:
```python
auc = evaluate_adversarial_detectability(df_real, df_synthetic, schema)
print(f"Adversarial AUC: {auc:.4f}")
if auc < 0.55:
    print("✓ Excellent - synthetic is hard to detect")
elif auc < 0.60:
    print("✓ Good - synthetic has limited distinguishability")
else:
    print("✗ Warning - synthetic is easily distinguishable")
```

## Usage

### Interpreting Full Report

```python
import json

report = {
    "ks_test": {
        "age": {"statistic": 0.04, "p_value": 0.62},
        "income": {"statistic": 0.05, "p_value": 0.48}
    },
    "chi_square": {
        "gender": {"statistic": 1.9, "p_value": 0.38},
        "region": {"statistic": 0.8, "p_value": 0.92}
    },
    "correlation_mse": 0.012,
    "adversarial_auc": 0.51
}

# What this means:
# ✓ KS tests: All p-values > 0.05 → numeric distributions match
# ✓ Chi-square tests: All p-values > 0.05 → categorical distributions match
# ✓ Correlation MSE: 0.012 < 0.05 → feature relationships preserved
# ✓ Adversarial AUC: 0.51 ≈ 0.5 → difficult to distinguish
```

## Integration with Test Script

The evaluation is automatically integrated into `test.py`. Running the test generates:

1. **Console output**: Formatted evaluation summary
2. **JSON report**: `data/evaluation_report.json` - Complete results for downstream analysis

```bash
python test.py
```

Output includes:
```
EVALUATION ENGINE - STATISTICAL SIMILARITY
📊 KS Test (Numeric Distributions):
  age                  | KS-stat: 0.0412 | p-value: 0.6234 | ✓ PASS

📊 Chi-Square Test (Categorical Distributions):
  gender               | Chi2:   1.9456 | p-value: 0.3782 | ✓ PASS

📊 Correlation Preservation (MSE):
  Correlation MSE: 0.012345
  ✓ PASS (relationships well-preserved)

EVALUATION ENGINE - ADVERSARIAL DETECTABILITY
🎯 Binary Classification AUC: 0.5142
  ✓ EXCELLENT - Synthetic indistinguishable from real
```

## Dependencies

All metrics use standard, widely-available Python libraries:
- `numpy`: Numerical operations
- `pandas`: Data manipulation
- `scipy.stats`: KS and Chi-square tests
- `sklearn`: RandomForestClassifier and ROC-AUC

No new dependencies beyond existing engine requirements.

## Architecture

```
evaluation/
├── __init__.py              # Package entry point
├── statistics.py            # Statistical tests (KS, Chi-square, Correlation)
└── adversarial.py           # Adversarial detectability (RF classifier)
```

### Design Principles

1. **Isolation**: Evaluation is a separate module, doesn't modify generation pipeline
2. **Type awareness**: Automatically handles numeric vs categorical via schema
3. **ID awareness**: Identifier columns excluded automatically
4. **Robustness**: All functions handle edge cases (empty columns, missing values)
5. **Determinism**: Results are deterministic (fixed random_state in adversarial)
6. **JSON-serializable**: All outputs can be saved/loaded

## Common Questions

**Q: Which metric is most important?**␠␠
A: Adversarial AUC is most holistic (captures if ANY difference exists), but use all three together for complete picture.

**Q: What if some tests pass and some fail?**␠␠
A: Check which specific columns fail. May indicate CTGAN needs more training, or domain constraints are missing.

**Q: Can I get false positives/negatives?**␠␠
A: Yes. High p-values can occur by chance (use multiple tests). Recommend checking all 4 metrics together.

**Q: How many samples do I need?**␠␠
A: Larger samples (>1000) give more stable results. Minimum 100-200 for reasonable estimates.

**Q: Can I modify the RandomForest parameters?**␠␠
A: Yes, use `evaluate_adversarial_detectability(..., n_estimators=200, random_state=123)`

<!-- ## References

- Kolmogorov–Smirnov test: Non-parametric test for continuous distributions
- Chi-square test: Goodness-of-fit test for categorical distributions
- Correlation analysis: Pearson correlation for linear relationships
- Adversarial testing: Standard method in privacy/synthetic data literature
  - Reference: "Synthetic Data Generation – Methodology and Applications", NeurIPS 2021 -->

---

**Status**: Production-ready | **Version**: 1.0 | **Maintained**: Active
---

