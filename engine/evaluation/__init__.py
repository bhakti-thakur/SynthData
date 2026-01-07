"""
Evaluation module for synthetic data quality assessment.

This module provides production-grade evaluation metrics to quantitatively
compare real vs synthetic tabular data:
- Statistical similarity metrics (KS test, Chi-square, correlation MSE)
- Adversarial detectability testing
"""

from .statistics import evaluate_statistical_similarity
from .adversarial import evaluate_adversarial_detectability

__all__ = [
    "evaluate_statistical_similarity",
    "evaluate_adversarial_detectability",
]
