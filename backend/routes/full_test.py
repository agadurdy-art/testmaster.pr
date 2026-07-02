"""
IELTS-Style Full Test Mode API Routes — aggregation shim.
=========================================================
Faz 1 refactor (2026-07-02): the original 1,234-line module was split into
single-responsibility modules:

- routes/full_test_registry.py  test registry + serving endpoints + answer stripping
- routes/full_test_sessions.py  session lifecycle (start/submit-section/complete/results)
- routes/full_test_scoring.py   per-skill evaluators (L/R/W/S) + band helpers
- routes/full_test_feedback.py  evaluation orchestrator + AI teacher feedback + summary

This module re-exports every historical name so `from routes.full_test
import ...` (server.py, question_bank_meta.py) keeps working. Route paths
are byte-identical: all endpoints register on the single shared `router`
(defined in full_test_registry; session routes added by full_test_sessions).

All content is 100% ORIGINAL - not copied from Cambridge.
Designed to match IELTS format, timing, and difficulty.
"""

from routes.full_test_registry import (  # noqa: F401 — historical re-exports
    router,
    get_all_test_sets,
    get_test_by_id,
    strip_answers,
    strip_section_answers,
    ACADEMIC_SET_A, ACADEMIC_SET_A_READING,
    ACADEMIC_SET_B, ACADEMIC_SET_B_READING,
    ACADEMIC_SET_C, ACADEMIC_SET_C_READING,
    ACADEMIC_SET_D, ACADEMIC_SET_D_READING,
    ACADEMIC_SET_E, ACADEMIC_SET_F, ACADEMIC_SET_G, ACADEMIC_SET_H,
    GENERAL_SET_A, GENERAL_SET_B, GENERAL_SET_C, GENERAL_SET_D,
    IELTS17_TEST1,
)
from routes.full_test_scoring import (  # noqa: F401 — historical re-exports
    CAMBRIDGE_HELPERS_AVAILABLE,
    check_answer,
    evaluate_listening,
    evaluate_reading,
    _classify_task_type_v4,
    evaluate_writing_section,
    evaluate_speaking_section,
)
from routes.full_test_feedback import (  # noqa: F401 — historical re-exports
    evaluate_full_test,
    generate_ai_teacher_feedback,
    generate_test_summary,
    get_band_recommendation,
)
import routes.full_test_sessions  # noqa: F401 — registers session routes on `router`

# Guarded in the original module; keep the same failure tolerance for the
# historical test-structure re-exports.
try:
    from content.full_tests.test_structure import (  # noqa: F401
        TestType, SectionType, TEST_TIMINGS,
        calculate_listening_band, calculate_reading_band,
        calculate_overall_band, validate_full_test
    )
except ImportError:
    pass
