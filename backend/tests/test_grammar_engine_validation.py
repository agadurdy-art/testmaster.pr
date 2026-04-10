import ast
import os
import unittest


GRAMMAR_ENGINE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "routes", "grammar_engine.py")


def load_functions(function_names):
    with open(GRAMMAR_ENGINE_PATH, "r", encoding="utf-8") as handle:
        source = handle.read()
    module = ast.parse(source, filename=GRAMMAR_ENGINE_PATH)
    selected_nodes = [
        node for node in module.body if isinstance(node, ast.FunctionDef) and node.name in function_names
    ]
    extracted = ast.Module(body=selected_nodes, type_ignores=[])
    namespace = {
        "PLACEHOLDER_PATTERNS": [
            "option a",
            "option b",
            "word1",
            "word2",
            "opt1",
            "opt2",
            "sentence 1",
            "another sentence",
            "correct sentence",
            "incorrect sentence",
            "model response",
        ]
    }
    exec(compile(extracted, GRAMMAR_ENGINE_PATH, "exec"), namespace)
    return [namespace[name] for name in function_names]


(
    _is_meaningful_text,
    _validate_options,
    _validate_learn_payload,
    _validate_practice_payload,
    _validate_quiz_payload,
    _validate_prompt_payload,
    _payload_is_valid,
) = load_functions([
    "_is_meaningful_text",
    "_validate_options",
    "_validate_learn_payload",
    "_validate_practice_payload",
    "_validate_quiz_payload",
    "_validate_prompt_payload",
    "_payload_is_valid",
])


class GrammarEngineValidationTests(unittest.TestCase):
    def test_practice_payload_rejects_placeholder_options(self):
        payload = {
            "title": "Practice",
            "sections": [
                {
                    "type": "recognition",
                    "title": "Spot the Grammar",
                    "items": [
                        {
                            "id": "rec-1",
                            "options": ["Option A", "A real sentence"],
                            "correct_index": 1,
                            "explanation": "Why",
                        }
                    ],
                }
            ],
        }
        self.assertFalse(_payload_is_valid("practice", payload))

    def test_quiz_payload_accepts_well_formed_questions(self):
        payload = {
            "title": "Checkpoint",
            "questions": [
                {
                    "id": f"q{i}",
                    "type": "multiple_choice" if i < 4 else "gap_fill" if i < 7 else "error_detection",
                    "question": "Which sentence uses the target grammar naturally?" if i < 4 else None,
                    "sentence": "She ___ to the office every morning." if 4 <= i < 7 else "He have studied every weekend.", 
                    "options": ["She goes to the office every morning.", "She go to the office every morning.", "She going to the office every morning."] if i < 4 else ["goes", "go", "going", "gone"] if 4 <= i < 7 else None,
                    "correct_index": 0 if i < 4 else None,
                    "correct": "goes" if 4 <= i < 7 else None,
                    "has_error": True if i >= 7 else None,
                    "difficulty": "medium",
                    "tests": "form",
                }
                for i in range(10)
            ],
        }
        self.assertTrue(_payload_is_valid("quiz", payload))


if __name__ == "__main__":
    unittest.main()
