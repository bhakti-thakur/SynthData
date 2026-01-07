"""
Adversarial detectability test for synthetic data evaluation.

Implements a binary classification task:
- Real data → Label = 1
- Synthetic data → Label = 0

Uses RandomForestClassifier to measure how well a model can distinguish
synthetic from real data. Lower AUC (closer to 0.5) indicates better
synthetic data quality.

This is a model-agnostic, parameter-free approach that captures overall
distributional differences without assumptions about specific metrics.
"""

from typing import Tuple
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import roc_auc_score


def _prepare_adversarial_data(
    df_real: pd.DataFrame,
    df_synthetic: pd.DataFrame,
    schema: 'Schema'
) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Prepare labeled combined dataset with one-hot encoded features.
    
    Process:
    1. Filter to trainable columns only (exclude identifiers)
    2. Create labels: real=1, synthetic=0
    3. One-hot encode categorical columns
    4. Fill missing values with column mean/mode
    
    Args:
        df_real: Real data DataFrame
        df_synthetic: Synthetic data DataFrame
        schema: Schema object from engine
        
    Returns:
        Tuple of (features_df, labels_array)
    """
    # Get trainable columns and categorize them
    trainable_cols = [col.name for col in schema.get_trainable_columns()]
    numeric_cols = [col.name for col in schema.get_numeric_columns() if col.name in trainable_cols]
    categorical_cols = [col.name for col in schema.get_categorical_columns() if col.name in trainable_cols]
    
    # Create combined dataset with labels
    df_real_labeled = df_real[trainable_cols].copy()
    df_real_labeled['__is_real__'] = 1
    
    df_synthetic_labeled = df_synthetic[trainable_cols].copy()
    df_synthetic_labeled['__is_real__'] = 0
    
    # Combine
    df_combined = pd.concat([df_real_labeled, df_synthetic_labeled], ignore_index=True)
    
    # Extract labels
    y = df_combined['__is_real__'].values
    df_combined = df_combined.drop('__is_real__', axis=1)
    
    # One-hot encode categorical columns (use first category as reference to avoid multicollinearity)
    if categorical_cols:
        df_combined = pd.get_dummies(df_combined, columns=categorical_cols, drop_first=True)
    
    # Fill missing values
    for col in df_combined.columns:
        if df_combined[col].isna().any():
            if df_combined[col].dtype in ['float64', 'float32', 'int64', 'int32']:
                # Numeric: fill with mean
                df_combined[col].fillna(df_combined[col].mean(), inplace=True)
            else:
                # Categorical: fill with mode
                mode_val = df_combined[col].mode()
                if len(mode_val) > 0:
                    df_combined[col].fillna(mode_val[0], inplace=True)
                else:
                    df_combined[col].fillna(0, inplace=True)
    
    return df_combined, y


def evaluate_adversarial_detectability(
    df_real: pd.DataFrame,
    df_synthetic: pd.DataFrame,
    schema: 'Schema',
    random_state: int = 42,
    n_estimators: int = 100
) -> float:
    """
    Train a RandomForest classifier to distinguish real from synthetic data.
    
    Approach:
    1. Combine real (label=1) and synthetic (label=0) data
    2. One-hot encode all categorical features
    3. Split into 70% train, 30% test (stratified)
    4. Train RandomForestClassifier
    5. Compute ROC-AUC on test set
    
    Interpretation:
    - AUC ≈ 0.5: Excellent synthetic quality (model cannot distinguish)
    - AUC → 1.0: Poor synthetic quality (model easily distinguishes)
    - AUC < 0.5: Unusual (model predicts inverted; still indicates poor distinction)
    
    Why this metric:
    - Parameter-free: Works on any tabular data without tuning
    - Model-agnostic: RF captures feature interactions automatically
    - Captures holistic quality: Detects any systematic difference between real/synthetic
    - Research-standard: Widely used in privacy/synthetic data literature
    
    Args:
        df_real: Real data DataFrame
        df_synthetic: Synthetic data DataFrame
        schema: Schema object from engine
        random_state: Random seed for reproducibility
        n_estimators: Number of trees in RandomForest (default 100)
        
    Returns:
        ROC-AUC score as float (0.0 to 1.0)
        
    Example:
        >>> auc = evaluate_adversarial_detectability(df_real, df_synthetic, schema)
        >>> print(f"Adversarial AUC: {auc:.4f}")
        >>> if auc > 0.6:
        ...     print("Warning: Synthetic data is easily distinguishable")
    """
    # Prepare data
    X, y = _prepare_adversarial_data(df_real, df_synthetic, schema)
    
    # Split into train/test (stratified to maintain class balance)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.30,
        random_state=random_state,
        stratify=y
    )
    
    # Train RandomForest classifier
    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        random_state=random_state,
        n_jobs=-1,  # Use all available CPUs
        verbose=0
    )
    clf.fit(X_train, y_train)
    
    # Compute ROC-AUC on test set
    y_pred_proba = clf.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_pred_proba)
    
    return float(auc)
