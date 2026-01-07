"""
Synthetic data generation orchestrator.

Coordinates the entire pipeline:
1. Schema inference from input data
2. Model training (CTGAN)
3. Sample generation
4. Post-processing (type casting, constraint enforcement)
"""

from typing import Optional
import pandas as pd
import numpy as np

from schema.infer import Schema, ColumnInfo, infer_schema
from models.ctgan import CTGANGenerator


class SynthDataEngine:
    """
    Main engine for synthetic data generation.
    
    This class orchestrates the full pipeline from raw data to
    synthetic output, handling schema inference, training, and
    post-processing automatically.
    
    Usage:
        engine = SynthDataEngine()
        engine.fit(training_data)
        synthetic_data = engine.generate(n_rows=1000)
    """
    
    def __init__(
        self,
        epochs: int = 300,
        batch_size: int = 500,
        categorical_threshold: int = 10,
        verbose: bool = False
    ):
        """
        Initialize the synthetic data engine.
        
        Args:
            epochs: Number of training epochs for CTGAN
            batch_size: Batch size for CTGAN training
            categorical_threshold: Max unique values to treat column as categorical
            verbose: Whether to print progress during training
        """
        self.epochs = epochs
        self.batch_size = batch_size
        self.categorical_threshold = categorical_threshold
        self.verbose = verbose
        
        self._schema: Optional[Schema] = None
        self._model: Optional[CTGANGenerator] = None
        self._is_fitted = False
        self._original_stats: dict = {}  # Store mean/std of original data for moment matching
    
    def fit(self, data: pd.DataFrame) -> Schema:
        """
        Fit the engine on training data.
        
        Steps:
        1. Infer schema from data
        2. Exclude identifier columns from training
        3. Initialize and train CTGAN model
        4. Store model, schema, and original statistics for generation
        
        Args:
            data: Training DataFrame
            
        Returns:
            Inferred Schema object
        """
        if self.verbose:
            print(f"[SynthDataEngine] Fitting on {len(data)} rows, {len(data.columns)} columns")
        
        # Step 1: Infer schema
        if self.verbose:
            print("[SynthDataEngine] Inferring schema...")
        
        self._schema = infer_schema(
            data,
            categorical_threshold=self.categorical_threshold
        )
        
        # Identify trainable vs identifier columns
        trainable_cols = [col.name for col in self._schema.get_trainable_columns()]
        identifier_cols = [col.name for col in self._schema.get_identifier_columns()]
        
        if self.verbose:
            n_numeric = len([c for c in self._schema.get_trainable_columns() if not c.is_categorical])
            n_categorical = len([c for c in self._schema.get_trainable_columns() if c.is_categorical])
            print(f"[SynthDataEngine] Schema: {n_numeric} numeric, {n_categorical} categorical")
            if identifier_cols:
                print(f"[SynthDataEngine] Excluding {len(identifier_cols)} identifier column(s): {identifier_cols}")
        
        # Step 2: Prepare training data (exclude identifiers)
        data_train = data[trainable_cols].copy()
        
        # Step 3: Store original statistics for post-processing
        self._original_stats = self._compute_statistics(data_train)
        
        # Step 4: Initialize model
        self._model = CTGANGenerator(
            epochs=self.epochs,
            batch_size=self.batch_size,
            verbose=self.verbose
        )
        
        # Step 5: Train model
        if self.verbose:
            print("[SynthDataEngine] Training CTGAN model...")
        
        # Create a sub-schema for trainable columns only
        trainable_schema = Schema(
            columns=[col for col in self._schema.columns if not col.is_identifier],
            num_rows=self._schema.num_rows,
            num_columns=len(trainable_cols)
        )
        
        self._model.fit(data_train, trainable_schema)
        
        self._is_fitted = True
        
        if self.verbose:
            print("[SynthDataEngine] Training complete!")
        
        return self._schema
    
    def generate(self, n_rows: int, apply_constraints: bool = True) -> pd.DataFrame:
        """
        Generate synthetic data.
        
        Args:
            n_rows: Number of rows to generate
            apply_constraints: Whether to apply post-processing (type casting, clipping, moment matching)
            
        Returns:
            DataFrame with synthetic data
            
        Raises:
            RuntimeError: If engine has not been fitted
        """
        if not self._is_fitted or self._model is None or self._schema is None:
            raise RuntimeError("Engine must be fitted before generating. Call fit() first.")
        
        if self.verbose:
            print(f"[SynthDataEngine] Generating {n_rows} synthetic rows...")
        
        # Generate raw samples from CTGAN (trainable columns only)
        synthetic_data = self._model.sample(n_rows)
        
        # Apply post-processing if requested
        if apply_constraints:
            synthetic_data = self._post_process(synthetic_data, n_rows)
        
        if self.verbose:
            print("[SynthDataEngine] Generation complete!")
        
        return synthetic_data
    
    def _post_process(self, data: pd.DataFrame, n_rows: int) -> pd.DataFrame:
        """
        Apply post-processing to enforce constraints and correct types.
        
        Post-processing pipeline:
        1. Regenerate identifier columns
        2. Apply moment matching to numeric columns
        3. Type casting (int/float/categorical)
        4. Min/max clipping for numeric columns
        
        Args:
            data: Raw synthetic data from CTGAN (trainable columns only)
            n_rows: Number of rows being generated
            
        Returns:
            Post-processed DataFrame with all columns (including identifiers)
        """
        processed = data.copy()
        
        # Step 1: Process trainable columns
        for col_info in self._schema.get_trainable_columns():
            col_name = col_info.name
            
            if col_name not in processed.columns:
                continue
            
            if col_info.is_categorical:
                # Categorical: ensure values are strings
                processed[col_name] = processed[col_name].astype(str)
                
            else:
                # Numeric column - apply moment matching first
                if col_name in self._original_stats:
                    processed[col_name] = self._apply_moment_matching(
                        processed[col_name],
                        self._original_stats[col_name]
                    )
                
                col_data = processed[col_name]
                
                # Clip to min/max range
                if col_info.min_value is not None:
                    col_data = col_data.clip(lower=col_info.min_value)
                if col_info.max_value is not None:
                    col_data = col_data.clip(upper=col_info.max_value)
                
                # Cast to int if needed
                if col_info.dtype == 'int':
                    col_data = col_data.round().astype(int)
                else:
                    col_data = col_data.astype(float)
                
                processed[col_name] = col_data
        
        # Step 2: Regenerate identifier columns
        for col_info in self._schema.get_identifier_columns():
            processed = self._regenerate_identifier(processed, col_info, n_rows)
        
        # Step 3: Reorder columns to match original schema
        column_order = [col.name for col in self._schema.columns]
        processed = processed[column_order]
        
        return processed
    
    def _compute_statistics(self, data: pd.DataFrame) -> dict:
        """
        Compute mean and std for numeric columns.
        
        Args:
            data: Training data
            
        Returns:
            Dict mapping column name to {'mean': float, 'std': float}
        """
        stats = {}
        for col in data.select_dtypes(include=[np.number]).columns:
            stats[col] = {
                'mean': float(data[col].mean()),
                'std': float(data[col].std())
            }
        return stats
    
    def _apply_moment_matching(self, synthetic_col: pd.Series, orig_stats: dict) -> pd.Series:
        """
        Rescale synthetic column to match original mean and std.
        
        Formula: X_new = (X - X_mean) / X_std * orig_std + orig_mean
        
        Args:
            synthetic_col: Synthetic data column
            orig_stats: {'mean': float, 'std': float} from original data
            
        Returns:
            Rescaled column
        """
        synth_mean = synthetic_col.mean()
        synth_std = synthetic_col.std()
        
        # Avoid division by zero
        if synth_std < 1e-6:
            # If synthetic has no variance, center it at original mean
            return pd.Series([orig_stats['mean']] * len(synthetic_col), index=synthetic_col.index)
        
        # Standardize then rescale to original distribution
        standardized = (synthetic_col - synth_mean) / synth_std
        rescaled = standardized * orig_stats['std'] + orig_stats['mean']
        
        return rescaled
    
    def _regenerate_identifier(self, data: pd.DataFrame, col_info: ColumnInfo, n_rows: int) -> pd.DataFrame:
        """
        Regenerate identifier column deterministically.
        
        Strategy: Generate sequential integers from min to max range.
        
        Args:
            data: Current synthetic data
            col_info: Column metadata
            n_rows: Number of rows
            
        Returns:
            DataFrame with identifier column added
        """
        # Generate sequential IDs starting from min_value
        start = int(col_info.min_value) if col_info.min_value is not None else 1
        identifier_values = list(range(start, start + n_rows))
        
        # Insert at beginning or maintain original position
        data[col_info.name] = identifier_values
        
        return data
    
    @property
    def schema(self) -> Optional[Schema]:
        """Get the inferred schema (available after fitting)."""
        return self._schema
    
    def save_model(self, filepath: str) -> None:
        """Save trained model to disk."""
        if not self._is_fitted or self._model is None:
            raise RuntimeError("Cannot save unfitted model.")
        
        self._model.save(filepath)
        
        if self.verbose:
            print(f"[SynthDataEngine] Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """
        Load trained model from disk.
        
        Note: This only loads the CTGAN model. Schema must be re-inferred
        or loaded separately if needed for full functionality.
        """
        self._model = CTGANGenerator()
        self._model.load(filepath)
        self._is_fitted = True
        
        if self.verbose:
            print(f"[SynthDataEngine] Model loaded from {filepath}")
