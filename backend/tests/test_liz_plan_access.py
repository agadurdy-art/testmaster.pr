import importlib.util
import pathlib
import unittest


REPO_ROOT = pathlib.Path("/Users/aga/testmaster-2026-review")
PLAN_ACCESS_PATH = REPO_ROOT / "backend" / "plan_access.py"


def load_plan_access():
    spec = importlib.util.spec_from_file_location("plan_access", PLAN_ACCESS_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class LizPlanAccessTests(unittest.TestCase):
    def setUp(self):
        self.plan_access = load_plan_access()

    def test_learner_and_above_have_liz_messages(self):
        for plan in ("learner", "achiever", "master"):
            features = self.plan_access.get_plan_features(plan)
            self.assertGreater(features.get("max_liz_messages", 0), 0)

    def test_free_and_explorer_do_not_have_liz_messages(self):
        for plan in ("free", "explorer"):
            features = self.plan_access.get_plan_features(plan)
            self.assertEqual(features.get("max_liz_messages", 0), 0)


if __name__ == "__main__":
    unittest.main()
