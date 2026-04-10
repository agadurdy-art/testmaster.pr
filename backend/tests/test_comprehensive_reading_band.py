import importlib.util
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "level_test_reading_data.py"
SPEC = importlib.util.spec_from_file_location("level_test_reading_data", MODULE_PATH)
level_test_reading_data = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(level_test_reading_data)


def test_comprehensive_reading_band_all_correct_reaches_nine():
    questions = level_test_reading_data.COMPREHENSIVE_READING_QUESTIONS
    band = level_test_reading_data.calculate_comprehensive_reading_band(questions)
    assert band == 9.0


def test_comprehensive_reading_band_zero_correct_returns_minimum():
    band = level_test_reading_data.calculate_comprehensive_reading_band([])
    assert band == 2.0


def test_comprehensive_reading_band_single_hard_guess_does_not_overinflate():
    questions = level_test_reading_data.COMPREHENSIVE_READING_QUESTIONS
    hardest_only = [questions[-1]]
    band = level_test_reading_data.calculate_comprehensive_reading_band(hardest_only)
    assert band == 3.0
