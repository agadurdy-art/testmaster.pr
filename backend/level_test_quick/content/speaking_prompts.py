"""
Speaking prompts for the quick assessment.

Pipeline: browser Web Speech API records + transcribes locally → server-side
heuristic scoring on the transcript. Zero per-test cost (no Azure / Whisper
API calls). Server falls back to transformers.js client-side Whisper-base if
Web Speech API is unsupported (Safari mobile, some Firefox builds).

Adaptive: combined Stage 1+2 ≥ 6/8 → 3 prompts including Part 2 cue card;
< 6/8 → 2 simpler Part 1 prompts.
"""

SPEAKING_PROMPTS = [
    # Part 1 — personal (low-stakes warm-up, included in BOTH adaptive paths)
    {
        "id": "S_P1_HOMETOWN",
        "part": "part1",
        "level": "A2-B1",
        "stem": (
            "Tell me about your hometown. Where is it, and what do you like "
            "most about it? Speak for about 45 seconds."
        ),
        "duration_sec": 45,
        "prep_sec": 0,
    },
    {
        "id": "S_P1_BOOKS_FILMS",
        "part": "part1",
        "level": "B1-B2",
        "stem": (
            "Do you prefer reading books or watching films? Why? Give a recent "
            "example. About 45 seconds."
        ),
        "duration_sec": 45,
        "prep_sec": 0,
    },
    # Part 2 mini cue card — high-band only (combined ≥ 6/8)
    {
        "id": "S_P2_FUTURE_SKILL",
        "part": "part2",
        "level": "B2-C1",
        "stem": (
            "Describe a skill you would like to learn in the next year.\n\n"
            "You should say:\n"
            "  • what the skill is\n"
            "  • why you want to learn it\n"
            "  • how you plan to learn it\n\n"
            "You have 30 seconds to prepare, then speak for up to 60 seconds."
        ),
        "duration_sec": 60,
        "prep_sec": 30,
    },
]


def prompts_for_combined_score(combined_correct, total_so_far):
    """
    Return ordered list of speaking prompt IDs based on adaptive routing.
    """
    if total_so_far <= 0:
        return ["S_P1_HOMETOWN", "S_P1_BOOKS_FILMS"]
    if combined_correct / total_so_far >= 6 / 8:
        return ["S_P1_HOMETOWN", "S_P1_BOOKS_FILMS", "S_P2_FUTURE_SKILL"]
    return ["S_P1_HOMETOWN", "S_P1_BOOKS_FILMS"]


def get_prompt(prompt_id):
    for p in SPEAKING_PROMPTS:
        if p["id"] == prompt_id:
            return p
    return None
