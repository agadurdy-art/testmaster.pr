import ast
import re
import unittest
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path


ROUTE_PATH = Path("/Users/aga/testmaster-2026-review/backend/routes/liz_teacher.py")


def load_symbols(symbol_names):
    source = ROUTE_PATH.read_text()
    tree = ast.parse(source)
    selected = []
    for node in tree.body:
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Name) and target.id in symbol_names:
                    selected.append(node)
                    break
        elif isinstance(node, ast.FunctionDef) and node.name in symbol_names:
            selected.append(node)

    module = ast.Module(body=selected, type_ignores=[])
    namespace = {
        "re": re,
        "uuid": uuid,
        "datetime": datetime,
        "timezone": timezone,
        "timedelta": timedelta,
        "LIZ_DEFAULT_MODEL": "gpt-4o-mini",
        "LIZ_DEEP_MODEL": "gpt-4o",
    }
    exec(compile(module, str(ROUTE_PATH), "exec"), namespace)
    return namespace


class LizTeacherHelperTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ns = load_symbols({
            "HOMEWORK_PATTERN",
            "LIZ_ALLOWED_HOMEWORK_TYPES",
            "LIZ_HISTORY_TURNS",
            "LIZ_CONTEXT_MESSAGE_CHARS",
            "_sanitize_homework_text",
            "build_recent_conversation_context",
            "parse_homework_from_response",
            "select_chat_model",
        })

    def test_homework_parser_limits_and_sanitizes(self):
        parse_homework = self.ns["parse_homework_from_response"]
        response = """
Hello there
[HOMEWORK]
type: invalid_type
title:   Academic   Word   List Practice   
task:   Learn 10 words and write one sentence for each.    
due: 99
[/HOMEWORK]
"""
        cleaned, items = parse_homework(response, "u1", "s1")
        self.assertEqual(cleaned, "Hello there")
        self.assertEqual(len(items), 1)
        item = items[0]
        self.assertEqual(item["type"], "vocabulary")
        self.assertEqual(item["title"], "Academic Word List Practice")
        self.assertEqual(item["task"], "Learn 10 words and write one sentence for each.")

    def test_recent_conversation_context_is_bounded(self):
        build_context = self.ns["build_recent_conversation_context"]
        messages = [{"role": "user" if i % 2 == 0 else "assistant", "content": f"message {i} " + ("x" * 500)} for i in range(20)]
        context = build_context(messages)
        self.assertIn("## Recent Conversation:", context)
        self.assertIn("Student:", context)
        self.assertIn("Liz:", context)
        self.assertLess(len(context), 4000)

    def test_select_chat_model_promotes_heavy_tasks(self):
        selector = self.ns["select_chat_model"]
        self.assertEqual(selector("Give me a study plan for next week", False), "gpt-4o")
        self.assertEqual(selector("Hello Liz", False), "gpt-4o-mini")
        self.assertEqual(selector("Short spoken answer", True), "gpt-4o")


if __name__ == "__main__":
    unittest.main()
