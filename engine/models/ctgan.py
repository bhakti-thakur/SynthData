"""
CTGAN-based generator wrapper.

Provides a clean interface to the CTGAN model from the SDV library.
Hides all CTGAN implementation details behind a simple fit/sample API.
"""

from typing import Optional, List
import pandas as pd
import numpy as np
from ctgan import CTGAN

from engine.schema.infer import Schema


class CTGANGenerator:
    """
    Wrapper around CTGAN for synthetic tabular data generation.
    
    CTGAN (Conditional Tabular GAN) is a state-of-the-art model for
    generating synthetic tabular data with mixed data types.
    
    Reference: https://github.com/sdv-dev/CTGAN
    """
    
    def __init__(
        self,
        epochs: int = 300,
        batch_size: int = 500,
        generator_dim: tuple = (256, 256),
        discriminator_dim: tuple = (256, 256),
        verbose: bool = False
    ):
        """
        Initialize CTGAN generator.
        
        Args:
            epochs: Number of training epochs
            batch_size: Training batch size
            generator_dim: Generator network architecture
            discriminator_dim: Discriminator network architecture
            verbose: Whether to print training progress
        """
        self.epochs = epochs
        self.batch_size = batch_size
        self.generator_dim = generator_dim
        self.discriminator_dim = discriminator_dim
        self.verbose = verbose
        
        self._model: Optional[CTGAN] = None
        self._discrete_columns: List[str] = []
        self._is_fitted = False
    
    def fit(self, data: pd.DataFrame, schema: Schema) -> None:
        """
        Train the CTGAN model on input data.
        
        Args:
            data: Training DataFrame
            schema: Schema object with column metadata
            
        Design decisions:
        - Use schema to identify discrete (categorical) columns
        - CTGAN handles type inference internally but we pass discrete columns explicitly
        - Training is done in-place; model stored in self._model
        """
        # Extract discrete column names from schema
        self._discrete_columns = [
            col.name for col in schema.get_categorical_columns()
        ]
        
        # Initialize CTGAN model
        self._model = CTGAN(
            epochs=self.epochs,
            batch_size=self.batch_size,
            generator_dim=self.generator_dim,
            discriminator_dim=self.discriminator_dim,
            verbose=self.verbose
        )
        
        # Train the model
        # CTGAN expects discrete_columns as a list of column names
        self._model.fit(
            data,
            discrete_columns=self._discrete_columns
        )
        
        self._is_fitted = True
    
    def sample(self, n: int) -> pd.DataFrame:
        """
        Generate synthetic samples.
        
        Args:
            n: Number of rows to generate
            
        Returns:
            DataFrame with synthetic data
            
        Raises:
            RuntimeError: If model has not been fitted
        """
        if not self._is_fitted or self._model is None:
            raise RuntimeError("Model must be fitted before sampling. Call fit() first.")
        
        # Generate samples
        synthetic_data = self._model.sample(n)
        
        return synthetic_data
    
    def save(self, filepath: str) -> None:
        """Save trained model to disk."""
        if not self._is_fitted or self._model is None:
            raise RuntimeError("Cannot save unfitted model.")
        
        self._model.save(filepath)
    
    def load(self, filepath: str) -> None:
        """Load trained model from disk."""
        self._model = CTGAN.load(filepath)
        self._is_fitted = True
