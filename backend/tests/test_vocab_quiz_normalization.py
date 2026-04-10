import ast
import os
import re
import unittest


SERVER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "server.py")


def load_functions(function_names):
    with open(SERVER_PATH, "r", encoding="utf-8") as handle:
        source = handle.read()
    module = ast.parse(source, filename=SERVER_PATH)
    selected_nodes = [node for node in module.body if isinstance(node, ast.FunctionDef) and node.name in function_names]
    extracted = ast.Module(body=selected_nodes, type_ignores=[])
    namespace = {"re": re}
    exec(compile(extracted, SERVER_PATH, "exec"), namespace)
    return [namespace[name] for name in function_names]


(
    _normalize_vocab_option_text,
    _get_vocab_quiz_correct_answer_meta,
    _is_vocab_quiz_answer_correct,
    _select_vocabulary_quiz_questions,
) = load_functions([
    "_normalize_vocab_option_text",
    "_get_vocab_quiz_correct_answer_meta",
    "_is_vocab_quiz_answer_correct",
    "_select_vocabulary_quiz_questions",
])


class VocabularyQuizNormalizationTests(unittest.TestCase):
    def test_letter_answer_maps_to_correct_index(self):
        question = {
            "type": "multiple_choice",
            "question": "Vocabulary: What does tuition mean?",
            "options": ["A) Fees", "B) Teaching or instruction", "C) Schedule", "D) Uniform"],
            "answer": "B",
        }

        meta = _get_vocab_quiz_correct_answer_meta(question)
        self.assertEqual(meta["correct_index"], 1)
        self.assertTrue(_is_vocab_quiz_answer_correct(question, 1))
        self.assertFalse(_is_vocab_quiz_answer_correct(question, 0))

    def test_text_answer_maps_to_option_index(self):
        question = {
            "type": "multiple_choice",
            "question": "Which collocation is correct?",
            "options": ["A) make a decision", "B) do a decision", "C) have a decision"],
            "answer": "make a decision",
        }

        meta = _get_vocab_quiz_correct_answer_meta(question)
        self.assertEqual(meta["correct_index"], 0)
        self.assertTrue(_is_vocab_quiz_answer_correct(question, 0))

    def test_selected_questions_keep_vocab_first_and_ids_stable(self):
        module = {
            "quiz": {
                "questions": [
                    {"question": "Grammar: choose correctly", "type": "multiple_choice", "options": ["A", "B"], "answer": "A"},
                    {"question": "Vocabulary: what does x mean?", "type": "multiple_choice", "options": ["A", "B"], "answer": "B"},
                    {"question": "Collocation: choose the correct phrase", "type": "multiple_choice", "options": ["A", "B"], "answer": "A"},
                ]
            }
        }

        selected = _select_vocabulary_quiz_questions(module)
        self.assertEqual(selected[0]["id"], "q-0")
        self.assertIn("Vocabulary", selected[0]["question"])
        self.assertIn("Collocation", selected[1]["question"])


if __name__ == "__main__":
    unittest.main()
