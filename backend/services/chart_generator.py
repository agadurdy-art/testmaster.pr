"""
Back-compat shim (Faz 1 refactor, 2026-07-02).

The original module mixed SVG rendering and data synthesis; it was split into:
- services/chart_renderer.py       (IELTSChartGenerator + chart_generator)
- services/chart_data_generator.py (IELTSDataGenerator + data_generator)

All historical import paths keep working via these re-exports.
"""

from services.chart_renderer import IELTSChartGenerator, chart_generator
from services.chart_data_generator import IELTSDataGenerator, data_generator

__all__ = [
    "IELTSChartGenerator",
    "chart_generator",
    "IELTSDataGenerator",
    "data_generator",
]
