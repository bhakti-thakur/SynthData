"""
SynthData.ai Engine

Production-grade synthetic tabular data generation engine.

This package exposes only the public engine interface.
Internal modules should be imported explicitly when needed.
"""

from engine.generation.generator import SynthDataEngine
from engine.schema.infer import infer_schema
from engine.models.ctgan import CTGANGenerator

__all__ = [
    "SynthDataEngine",
    "infer_schema",
    "CTGANGenerator",
]
