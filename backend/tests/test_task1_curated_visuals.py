import ast
import random
import unittest
from pathlib import Path
from typing import Any, Dict


QUESTION_BANK_PATH = Path("/Users/aga/testmaster-2026-review/backend/routes/question_bank.py")


def load_question_bank_symbols(symbol_names):
    source = QUESTION_BANK_PATH.read_text()
    tree = ast.parse(source)
    selected = [
        node for node in tree.body
        if (
            isinstance(node, ast.Assign)
            and any(isinstance(target, ast.Name) and target.id in symbol_names for target in node.targets)
        )
        or (isinstance(node, ast.FunctionDef) and node.name in symbol_names)
    ]
    module = ast.Module(body=selected, type_ignores=[])
    namespace = {"random": random, "Dict": Dict, "Any": Any}
    exec(compile(module, str(QUESTION_BANK_PATH), "exec"), namespace)
    return namespace


class CuratedTask1VisualTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ns = load_question_bank_symbols({
            "CURATED_TASK1_PROCESS_VISUALS",
            "CURATED_TASK1_MAP_VISUALS",
            "_build_curated_task1_visual",
        })

    def test_process_visual_uses_static_asset_bank(self):
        payload = self.ns["_build_curated_task1_visual"]("process", "environment", "5.5-6.5")
        self.assertTrue(payload["image_url"].startswith("/static/visuals/"))
        self.assertEqual(payload["task_data"]["visual_type"], "process")
        self.assertIn("stages", payload["task_data"])
        self.assertGreater(len(payload["task_data"]["stages"]), 0)

    def test_map_visual_uses_static_asset_bank(self):
        payload = self.ns["_build_curated_task1_visual"]("map", "housing_architecture", "7.0-9.0")
        self.assertTrue(payload["image_url"].startswith("/static/visuals/"))
        self.assertEqual(payload["task_data"]["visual_type"], "map")
        self.assertIn("features_before", payload["task_data"])
        self.assertIn("features_after", payload["task_data"])
        self.assertEqual(payload["task_data"]["band_calibration"]["target_band"], "7.0-9.0")


if __name__ == "__main__":
    unittest.main()
