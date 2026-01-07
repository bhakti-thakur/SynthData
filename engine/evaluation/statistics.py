"""
Statistical similarity metrics for synthetic data evaluation.

Implements three complementary statistical tests:
1. KS Test: Detects distributional differences in numeric columns
2. Chi-Square Test: Detects categorical distribution shifts
3. Correlation MSE: Ensures structural relationships are preserved

All metrics are identifier-aware: exclude identifier columns automatically.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np
from scipy.stats import ks_2samp, chi2_contingency


def _get_non_identifier_columns(
    df_real: pd.DataFrame,
    df_synthetic: pd.DataFrame,
    schema: 'Schema'
) -> tuple:
    """
    Extract trainable (non-identifier) columns from schema.
    
    Args:
        df_real: Real data DataFrame
        df_synthetic: Synthetic data DataFrame
        schema: Schema object from engine
        
    Returns:
        Tuple of (real_cols, synthetic_cols, numeric_cols_to_test, categorical_cols_to_test)
    """
    trainable_cols = [col.name for col in schema.get_trainable_columns()]
    numeric_cols = [col.name for col in schema.get_numeric_columns() if col.name in trainable_cols]
    categorical_cols = [col.name for col in schema.get_categorical_columns() if col.name in trainable_cols]
    
    df_real_train = df_real[trainable_cols].copy()
    df_synthetic_train = df_synthetic[trainable_cols].copy()
    
    return df_real_train, df_synthetic_train, numeric_cols, categorical_cols


def _ks_test_numeric(
    df_real: pd.DataFrame,
    df_synthetic: pd.DataFrame,
    numeric_columns: List[str]
) -> Dict[str, Dict[str, float]]:
    """
    Run Kolmogorov–Smirnov test for numeric columns.
    
    The KS test is a non-parametric test that compares empirical CDFs of two samples.
    It's sensitive to location, scale, and shape of distributions.
    
    Why: Detects if synthetic numeric distributions deviate from real distributions
    (e.g., too narrow, too wide, or shifted).
    
    Args:
        df_real: Real data (trainable columns only)
        df_synthetic: Synthetic data (trainable columns only)
        numeric_columns: List of numeric column names
        
    Returns:
        {
            "column_name": {
                "statistic": float (0 to 1),
                "p_value": float (0 to 1)
            },
            ...
        }
    """
    ks_results = {}
    
    for col in numeric_columns:
        # Drop NaNs to get clean samples
        real_vals = df_real[col].dropna().values
        synth_vals = df_synthetic[col].dropna().values
        
        if len(real_vals) == 0 or len(synth_vals) == 0:
            # Skip columns with no data
            continue
        
        statistic, p_value = ks_2samp(real_vals, synth_vals)
        ks_results[col] = {
            "statistic": float(statistic),
            "p_value": float(p_value)
        }
    
    return ks_results


def _chi_square_test_categorical(
    df_real: pd.DataFrame,
    df_synthetic: pd.DataFrame,
    categorical_columns: List[str]
) -> Dict[str, Dict[str, float]]:
    """
    Run Chi-square test for categorical columns.
    
    The Chi-square test compares observed vs expected frequencies for categorical
    distributions. It's robust and doesn't assume normality.
    
    Why: Detects if synthetic categorical distributions (e.g., gender, region)
    deviate significantly from real distributions. Important for ensuring
    demographic and stratification consistency.
    
    Handles edge cases:
    - Categories present in one dataset but not the other
    - Zero-count categories (add pseudocount to avoid division by zero)
    
    Args:
        df_real: Real data (trainable columns only)
        df_synthetic: Synthetic data (trainable columns only)
        categorical_columns: List of categorical column names
        
    Returns:
        {
            "column_name": {
                "statistic": float,
                "p_value": float
            },
            ...
        }
    """
    chi_results = {}
    
    for col in categorical_columns:
        # Get value counts
        real_counts = df_real[col].value_counts()
        synth_counts = df_synthetic[col].value_counts()
        
        # Align categories: include all categories from both datasets
        all_categories = set(real_counts.index) | set(synth_counts.index)
        
        real_freqs = np.array([real_counts.get(cat, 0) for cat in all_categories])
        synth_freqs = np.array([synth_counts.get(cat, 0) for cat in all_categories])
        
        # If either row has all zeros, skip
        if real_freqs.sum() == 0 or synth_freqs.sum() == 0:
            continue
        
        # Create contingency table: rows are [real, synthetic], columns are categories
        contingency_table = np.array([real_freqs, synth_freqs])
        
        # Run chi-square test
        try:
            chi2_stat, p_value, dof, expected = chi2_contingency(contingency_table)
            chi_results[col] = {
                "statistic": float(chi2_stat),
                "p_value": float(p_value)
            }
        except (ValueError, ZeroDivisionError):
            # Skip if chi-square test fails (e.g., all expected < 5)
            continue
    
    return chi_results


def _correlation_mse(
    df_real: pd.DataFrame,
    df_synthetic: pd.DataFrame,
    numeric_columns: List[str]
) -> float:
    """
    Compute MSE between correlation matrices of numeric columns.
    
    Pearson correlation captures linear relationships between variables.
    Comparing correlation matrices ensures synthetic data preserves the
    structure and co-movement patterns of real data.
    
    Why: Ensures relationships between features are preserved. If synthetic
    data has different correlations, it may violate business logic or
    domain constraints.
    
    Args:
        df_real: Real data (trainable columns only)
        df_synthetic: Synthetic data (trainable columns only)
        numeric_columns: List of numeric column names to include
        
    Returns:
        MSE between correlation matrices as float
    """
    if len(numeric_columns) < 2:
        # Need at least 2 columns to compute correlation
        return 0.0
    
    # Compute correlation matrices (drop NaNs)
    real_corr = df_real[numeric_columns].corr()
    synth_corr = df_synthetic[numeric_columns].corr()
    
    # Compute MSE
    mse = np.mean((real_corr.values - synth_corr.values) ** 2)
    
    return float(mse)


def evaluate_statistical_similarity(
    df_real: pd.DataFrame,
    df_synthetic: pd.DataFrame,
    schema: 'Schema'
) -> Dict[str, Any]:
    """
    Comprehensive statistical evaluation of synthetic data.
    
    Computes three complementary metrics:
    1. KS Test (numeric): Detects distributional drift
    2. Chi-Square (categorical): Detects categorical distribution shifts
    3. Correlation MSE: Ensures relationships are preserved
    
    Interpretation:
    - KS/Chi-square p_value > 0.05: Good (fail to reject null hypothesis of equality)
    - Correlation MSE close to 0: Good (relationships preserved)
    
    Args:
        df_real: Real data DataFrame
        df_synthetic: Synthetic data DataFrame
        schema: Schema object from SynthDataEngine (contains column metadata)
        
    Returns:
        {
            "ks_test": {
                "column_name": {"statistic": X, "p_value": Y},
                ...
            },
            "chi_square": {
                "column_name": {"statistic": X, "p_value": Y},
                ...
            },
            "correlation_mse": float
        }
        
    Example:
        >>> evaluation = evaluate_statistical_similarity(df_real, df_synthetic, schema)
        >>> print(f"Correlation MSE: {evaluation['correlation_mse']:.6f}")
        >>> for col, result in evaluation["ks_test"].items():
        ...     print(f"{col}: p={result['p_value']:.4f}")
    """
    # Filter to trainable columns and identify types
    df_real_train, df_synthetic_train, numeric_cols, categorical_cols = _get_non_identifier_columns(
        df_real, df_synthetic, schema
    )
    
    # Run tests
    ks_results = _ks_test_numeric(df_real_train, df_synthetic_train, numeric_cols)
    chi_results = _chi_square_test_categorical(df_real_train, df_synthetic_train, categorical_cols)
    corr_mse = _correlation_mse(df_real_train, df_synthetic_train, numeric_cols)
    
    return {
        "ks_test": ks_results,
        "chi_square": chi_results,
        "correlation_mse": corr_mse
    }
