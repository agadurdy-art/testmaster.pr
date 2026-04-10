import unittest

from services.lesson_registry import LessonRegistry


class LessonRegistryRecommendationTests(unittest.TestCase):
    def setUp(self):
        self.registry = LessonRegistry(None)

    def test_build_lesson_path_uses_course_specific_routes(self):
        self.assertEqual(
            self.registry._build_lesson_path("beginner", "beginner-lesson-4", 4),
            "/beginner-course?lesson=beginner-lesson-4",
        )
        self.assertEqual(
            self.registry._build_lesson_path("mastery", "mastery-module-7", 7),
            "/mastery-course?lesson=7",
        )
        self.assertEqual(
            self.registry._build_lesson_path("advanced", "advanced-module-2", 2),
            "/advanced-mastery?lesson=2",
        )

    def test_target_stages_prioritize_matching_band_course(self):
        self.assertEqual(self.registry._get_target_stages(4.5), ["beginner"])
        self.assertEqual(self.registry._get_target_stages(6.0), ["mastery", "beginner"])
        self.assertEqual(self.registry._get_target_stages(7.5), ["advanced", "mastery"])

    def test_build_recommendation_contains_navigation_metadata(self):
        lesson = {
            "id": "mastery-module-5",
            "title": "Technology",
            "module_number": 5,
            "learning_goals": ["Improve cohesion"],
        }
        recommendation = self.registry._build_recommendation(
            lesson=lesson,
            stage="mastery",
            relevance_score=9,
            matched_weaknesses=["coherence"],
            matched_context_terms=["technology"],
            skill="writing",
            topic="technology",
            current_band=6.0,
        )

        self.assertEqual(recommendation["lesson_path"], "/mastery-course?lesson=5")
        self.assertEqual(recommendation["course_stage"], "mastery")
        self.assertEqual(recommendation["course_name"], "IELTS Mastery Course")
        self.assertIn("Targets coherence", recommendation["reason"])
        self.assertEqual(recommendation["recommended_for_band"], "5.5-6.5")


if __name__ == "__main__":
    unittest.main()
