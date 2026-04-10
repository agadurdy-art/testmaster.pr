import ast
import unittest
from pathlib import Path
from typing import Any, Dict, List


SERVER_PATH = Path("/Users/aga/testmaster-2026-review/backend/server.py")
LISTENING_PATH = Path("/Users/aga/testmaster-2026-review/backend/routes/listening_qb.py")


def load_server_symbols(symbol_names):
    source = SERVER_PATH.read_text()
    tree = ast.parse(source)
    selected = [
        node for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name in symbol_names
    ]
    module = ast.Module(body=selected, type_ignores=[])
    namespace = {"List": List, "Dict": Dict, "Any": Any}
    exec(compile(module, str(SERVER_PATH), "exec"), namespace)
    return namespace


def load_listening_symbols(symbol_names):
    source = LISTENING_PATH.read_text()
    tree = ast.parse(source)
    selected = [
        node for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name in symbol_names
    ]
    module = ast.Module(body=selected, type_ignores=[])
    namespace = {"List": List, "Dict": Dict, "Any": Any}
    exec(compile(module, str(LISTENING_PATH), "exec"), namespace)
    return namespace


class QBDiagnosticHelperTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server_ns = load_server_symbols({
            "_build_vocab_grammar_root_cause_analysis",
            "_build_vocab_grammar_study_plan",
        })
        cls.listening_ns = load_listening_symbols({
            "build_listening_root_cause_analysis",
            "build_listening_study_plan",
        })

    def test_vocab_grammar_root_causes_rank_units(self):
        build_root = self.server_ns["_build_vocab_grammar_root_cause_analysis"]
        causes = build_root([
            {"is_correct": False, "unit_id": "articles", "unit_title": "Articles"},
            {"is_correct": False, "unit_id": "articles", "unit_title": "Articles"},
            {"is_correct": False, "unit_id": "collocations", "unit_title": "Collocations"},
            {"is_correct": True, "unit_id": "tenses", "unit_title": "Tenses"},
        ])
        self.assertEqual(causes[0]["code"], "articles")
        self.assertEqual(causes[0]["count"], 2)
        self.assertEqual(causes[1]["code"], "collocations")

    def test_vocab_grammar_study_plan_points_to_lesson(self):
        build_plan = self.server_ns["_build_vocab_grammar_study_plan"]
        plan = build_plan(
            58.0,
            [{"id": "articles", "title": "Articles Unit"}],
            [{"code": "articles", "label": "Articles", "count": 3}],
        )
        self.assertEqual(plan["target_score"], 78)
        self.assertEqual(plan["roadmap_steps"][0]["route"], "/vocab-grammar?lesson=articles")

    def test_listening_root_causes_capture_wrong_skill_clusters(self):
        build_root = self.listening_ns["build_listening_root_cause_analysis"]
        causes = build_root([
            {"is_correct": False, "skill_tested": ["spelling"]},
            {"is_correct": False, "skill_tested": ["spelling", "numbers"]},
            {"is_correct": True, "skill_tested": ["main idea"]},
        ])
        self.assertEqual(causes[0]["code"], "spelling")
        self.assertEqual(causes[0]["count"], 2)

    def test_listening_study_plan_sets_target_band(self):
        build_plan = self.listening_ns["build_listening_study_plan"]
        plan = build_plan(
            estimated_band=6.0,
            weak_skills=["spelling"],
            recommended_lessons=[{"lesson_path": "/mastery-course?lesson=3", "reason": "Spelling fix"}],
            root_cause_analysis=[{"code": "spelling", "label": "Spelling"}],
        )
        self.assertEqual(plan["target_band"], 7.0)
        self.assertEqual(plan["roadmap_steps"][0]["route"], "/mastery-course?lesson=3")


if __name__ == "__main__":
    unittest.main()
