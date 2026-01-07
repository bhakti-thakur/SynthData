"""
Test script for SynthData.ai engine.

Demonstrates the complete pipeline:
1. Load a CSV dataset
2. Fit the engine
3. Generate synthetic data
4. Compare statistics
5. Save output
"""

import pandas as pd
import numpy as np
from pathlib import Path

from engine.generator import SynthDataEngine


def create_sample_data() -> pd.DataFrame:
    """
    Create a sample dataset for testing if no CSV is provided.
    
    Generates a realistic customer dataset with:
    - Numeric columns (age, income, purchases)
    - Categorical columns (gender, region, membership)
    - Mixed distributions
    """
    np.random.seed(42)
    
    n_rows = 1000
    
    data = {
        'customer_id': range(1, n_rows + 1),
        'age': np.random.randint(18, 80, n_rows),
        'income': np.random.normal(50000, 20000, n_rows).clip(15000, 200000),
        'purchases': np.random.randint(0, 50, n_rows),
        'gender': np.random.choice(['Male', 'Female', 'Other'], n_rows, p=[0.48, 0.48, 0.04]),
        'region': np.random.choice(['North', 'South', 'East', 'West'], n_rows),
        'membership': np.random.choice(['Bronze', 'Silver', 'Gold'], n_rows, p=[0.6, 0.3, 0.1])
    }
    
    df = pd.DataFrame(data)
    return df


def print_statistics(df: pd.DataFrame, title: str = "Dataset Statistics"):
    """Print basic statistics for a DataFrame."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    print(f"\nFirst 5 rows:")
    print(df.head())
    print(f"\nNumeric column statistics:")
    print(df.describe())
    print(f"\nCategorical value counts:")
    for col in df.select_dtypes(include=['object', 'category']).columns:
        print(f"\n{col}:")
        print(df[col].value_counts())


def main():
    """Main test function."""
    
    print("SynthData.ai Engine - Test Script")
    print("="*60)
    
    # Step 1: Load or create data
    # You can replace this with: df = pd.read_csv("your_data.csv")
    csv_path = Path("data/input.csv")
    
    if csv_path.exists():
        print(f"\nLoading data from {csv_path}...")
        df_original = pd.read_csv(csv_path)
    else:
        print("\nNo input CSV found. Creating sample dataset...")
        df_original = create_sample_data()
        
        # Save sample data for reference
        csv_path.parent.mkdir(parents=True, exist_ok=True)
        df_original.to_csv(csv_path, index=False)
        print(f"Sample data saved to {csv_path}")
    
    # Print original data statistics
    print_statistics(df_original, "ORIGINAL DATA")
    
    # Step 2: Initialize and fit engine
    print("\n" + "="*60)
    print("TRAINING SYNTHETIC DATA ENGINE")
    print("="*60)
    
    engine = SynthDataEngine(
        epochs=300,  # Use 300+ for better quality; 100 for quick testing
        batch_size=500,
        categorical_threshold=10,
        verbose=True
    )
    
    schema = engine.fit(df_original)
    
    # Print schema info
    print("\n" + "="*60)
    print("INFERRED SCHEMA")
    print("="*60)
    for col in schema.columns:
        print(col)
    
    # Step 3: Generate synthetic data
    print("\n" + "="*60)
    print("GENERATING SYNTHETIC DATA")
    print("="*60)
    
    n_synthetic_rows = len(df_original)  # Generate same number of rows
    df_synthetic = engine.generate(n_rows=n_synthetic_rows, apply_constraints=True)
    
    # Print synthetic data statistics
    print_statistics(df_synthetic, "SYNTHETIC DATA")
    
    # Step 4: Save synthetic data
    output_path = Path("data/synthetic_output.csv")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df_synthetic.to_csv(output_path, index=False)
    
    print("\n" + "="*60)
    print(f"✓ Synthetic data saved to {output_path}")
    print("="*60)
    
    # Step 5: Basic comparison
    print("\n" + "="*60)
    print("COMPARISON SUMMARY")
    print("="*60)
    
    # Compare all numeric columns
    for col in df_original.select_dtypes(include=[np.number]).columns:
        if col in df_synthetic.columns:
            orig_mean = df_original[col].mean()
            synth_mean = df_synthetic[col].mean()
            orig_std = df_original[col].std()
            synth_std = df_synthetic[col].std()
            
            print(f"\n{col}:")
            print(f"  Mean:   {orig_mean:.2f} → {synth_mean:.2f} "
                  f"(diff: {abs(orig_mean - synth_mean)/orig_mean*100:.1f}%)")
            print(f"  Std:    {orig_std:.2f} → {synth_std:.2f} "
                  f"(diff: {abs(orig_std - synth_std)/orig_std*100:.1f}%)")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60)


if __name__ == "__main__":
    main()
