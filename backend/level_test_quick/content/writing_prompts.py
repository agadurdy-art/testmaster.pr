"""
Writing prompts for the quick assessment.

Adaptive logic (per spec project_quick_assessment_spec):
- Combined Stage 1+2 reading+listening ≥ 6/8 → high-band abstract argument
- Combined < 6/8 → mid-band compare/contrast

Both prompts target ~100 words in 5 minutes — discriminating enough for
heuristic scoring at the band 4-7 range (the realistic band span for
guests taking a quick onboarding test).
"""

WRITING_PROMPTS = [
    {
        "id": "W_MID_WFH",
        "level": "B1-B2",
        "stem": (
            "Some companies now allow employees to work from home permanently.\n\n"
            "Write a short paragraph (60–100 words) explaining ONE advantage "
            "AND ONE disadvantage of permanent home working. Use specific "
            "reasons or examples to support your points.\n\n"
            "Time: 5 minutes."
        ),
        "expected_words": (60, 100),
        "time_limit_sec": 300,
        "target_band_range": (4.0, 6.5),
    },
    {
        "id": "W_HIGH_AI_LEARNING",
        "level": "B2-C1",
        "stem": (
            "Some educators believe artificial intelligence tutors will replace "
            "human teachers within the next twenty years. Others argue this is "
            "neither realistic nor desirable.\n\n"
            "Write a short paragraph (80–120 words) presenting your own view "
            "with one supporting reason and one counter-argument addressed.\n\n"
            "Time: 5 minutes."
        ),
        "expected_words": (80, 120),
        "time_limit_sec": 300,
        "target_band_range": (5.5, 8.0),
    },
]


def prompt_for_combined_score(combined_correct, total_so_far):
    """
    Pick writing prompt based on combined Stage 1 + Stage 2 reading+listening score.
    combined_correct out of total_so_far (= 8 by Stage 3).
    """
    if total_so_far <= 0:
        return WRITING_PROMPTS[0]
    if combined_correct / total_so_far >= 6 / 8:
        return WRITING_PROMPTS[1]
    return WRITING_PROMPTS[0]


def get_prompt(prompt_id):
    for p in WRITING_PROMPTS:
        if p["id"] == prompt_id:
            return p
    return None
