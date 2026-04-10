import ast
import sys
import unittest
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

BACKEND_ROOT = Path("/Users/aga/testmaster-2026-review/backend")
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from plan_access import get_plan_features, get_plan_label, normalize_plan_name, plan_meets_minimum


SERVER_PATH = Path("/Users/aga/testmaster-2026-review/backend/server.py")


def load_symbols(symbol_names):
    source = SERVER_PATH.read_text()
    tree = ast.parse(source)
    selected = []
    for node in tree.body:
        if isinstance(node, ast.FunctionDef) and node.name in symbol_names:
            selected.append(node)

    module = ast.Module(body=selected, type_ignores=[])
    namespace = {
        "datetime": datetime,
        "List": List,
        "Dict": Dict,
        "Any": Any,
        "is_admin_email": lambda email: (email or "").strip().lower() in {
            "aga.durdy@gmail.com",
            "ieltsace@testmaster.pro",
            "admin@ieltsace.com",
            "stemhousebenluc@gmail.com",
        },
        "plan_meets_minimum": plan_meets_minimum,
        "normalize_plan_name": normalize_plan_name,
        "get_plan_label": get_plan_label,
        "get_plan_features": get_plan_features,
    }
    exec(compile(module, str(SERVER_PATH), "exec"), namespace)
    return namespace


class AdminHelperTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ns = load_symbols({
            "_course_preview_allowed",
            "_apply_speaking_band_cap",
            "_parse_admin_dt",
            "_summarize_progress_by_type",
            "_normalize_admin_user",
            "_build_admin_plan_update",
            "_build_learning_platform_summary",
            "_build_vocabulary_engine_summary",
        })

    def test_plan_normalization_maps_legacy_tiers(self):
        self.assertEqual(normalize_plan_name("pro"), "master")
        self.assertEqual(normalize_plan_name("booster"), "achiever")
        self.assertEqual(normalize_plan_name("starter"), "learner")

    def test_course_preview_allows_only_lesson_one_for_free(self):
        preview_allowed = self.ns["_course_preview_allowed"]
        self.assertTrue(preview_allowed("free", "learner", 1))
        self.assertFalse(preview_allowed("free", "learner", 2))
        self.assertTrue(preview_allowed("learner", "learner", 5))

    def test_speaking_band_cap_limits_short_advanced_response(self):
        apply_cap = self.ns["_apply_speaking_band_cap"]
        result = apply_cap(7.5, word_count=20, sentence_count=1, template_risk=0.1, track="advanced")
        self.assertEqual(result["band_score"], 5.0)
        self.assertIsNotNone(result["band_cap"])
        self.assertTrue(result["cap_reasons"])

    def test_normalize_admin_user_exposes_modern_plan(self):
        normalize_user = self.ns["_normalize_admin_user"]
        user = normalize_user({"id": "u1", "email": "student@test.com", "plan": "pro"})
        self.assertEqual(user["plan"], "master")
        self.assertEqual(user["plan_label"], "Master")
        self.assertEqual(user["legacy_plan"], "pro")
        self.assertTrue(user["plan_features"]["advanced_mastery"])

    def test_admin_plan_update_promotes_admin_to_master(self):
        build_update = self.ns["_build_admin_plan_update"]
        update = build_update({"id": "admin-1", "email": "aga.durdy@gmail.com", "plan": "free", "examCredits": 0})
        self.assertEqual(update["plan"], "master")
        self.assertEqual(update["subscription"], "Admin")
        self.assertEqual(update["examCredits"], 25)
        self.assertTrue(update["verified"])
        self.assertTrue(update["email_verified"])

    def test_admin_plan_update_preserves_non_admins(self):
        build_update = self.ns["_build_admin_plan_update"]
        update = build_update({
            "id": "user-1",
            "email": "student@test.com",
            "plan": "master",
            "subscription": "Pro",
            "examCredits": 8,
            "payment_method": "paypal",
        })
        self.assertIsNone(update)

    def test_admin_plan_update_keeps_higher_admin_credit_balance(self):
        build_update = self.ns["_build_admin_plan_update"]
        update = build_update({"id": "admin-1", "email": "aga.durdy@gmail.com", "plan": "master", "examCredits": 42})
        self.assertEqual(update["examCredits"], 42)

    def test_summarize_progress_by_type_calculates_averages(self):
        summarize = self.ns["_summarize_progress_by_type"]
        stats = summarize([
            {"test_type": "reading", "band_score": 6.5},
            {"test_type": "reading", "band_score": 7.5},
            {"test_type": "writing", "band_score": 6.0},
        ])
        self.assertEqual(stats["reading"]["count"], 2)
        self.assertEqual(stats["reading"]["avg_band"], 7.0)
        self.assertEqual(stats["reading"]["best_band"], 7.5)
        self.assertEqual(stats["writing"]["avg_band"], 6.0)

    def test_learning_platform_summary_extracts_completed_lessons(self):
        summarize = self.ns["_build_learning_platform_summary"]
        summary = summarize({
            "current_level_id": "level-1",
            "current_unit_id": "unit-2",
            "current_lesson_id": "lesson-3",
            "total_hours_studied": 2.5,
            "last_updated": "2026-04-08T10:00:00+00:00",
            "level_progress": [
                {
                    "level_id": "level-1",
                    "current_unit_number": 2,
                    "completed": False,
                    "unit_progress": [
                        {
                            "unit_id": "unit-2",
                            "completed": False,
                            "quiz_attempts": [{"score": 8}],
                            "lesson_progress": [
                                {
                                    "lesson_id": "lesson-1",
                                    "completed": True,
                                    "completion_date": "2026-04-07T10:00:00+00:00",
                                    "score": 90,
                                    "time_spent_minutes": 25,
                                },
                                {
                                    "lesson_id": "lesson-2",
                                    "completed": False,
                                },
                            ],
                        }
                    ],
                }
            ],
        })
        self.assertEqual(summary["lessons_completed"], 1)
        self.assertEqual(summary["levels_started"], 1)
        self.assertEqual(summary["recent_completed_lessons"][0]["lesson_id"], "lesson-1")

    def test_vocabulary_engine_summary_marks_completed_modules(self):
        summarize = self.ns["_build_vocabulary_engine_summary"]
        summary = summarize([
            {
                "module_id": "m1",
                "learn_completed": True,
                "practice_completed": True,
                "quiz_completed": True,
                "learn_completed_at": "2026-04-07T08:00:00+00:00",
                "practice_completed_at": "2026-04-07T09:00:00+00:00",
                "quiz_completed_at": "2026-04-07T10:00:00+00:00",
            }
        ])
        self.assertEqual(summary["modules_started"], 1)
        self.assertEqual(summary["modules_completed"], 1)
        self.assertEqual(summary["recent_modules"][0]["progress_percent"], 100)


if __name__ == "__main__":
    unittest.main()
