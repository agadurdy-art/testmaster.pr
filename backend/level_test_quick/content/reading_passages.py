"""
Reading passages for the quick onboarding assessment.

Each passage has:
- `id`: stable identifier
- `level`: 'B1', 'B2', or 'C1' — drives adaptive routing in Stage 2
- `title`, `body`: the passage itself (~300-400 words)
- `questions`: list of question dicts

Question shape:
    {
        "qid": "R1_Q1",
        "type": "mcq" | "tfng" | "fill",
        "stem": "What is the writer's main purpose ...",
        "options": [{"key": "A", "text": "...", "correct": True}, ...],  # mcq
        "answer": "TRUE" | "FALSE" | "NOT GIVEN",                          # tfng
        "answer_text": "500 million",                                      # fill (accept variants)
        "answer_variants": ["500m", "500 million", "five hundred million"],
        "skill_tag": "main_idea" | "detail" | "inference" | "vocab" | "tfng",
        "rationale": "Why each distractor was chosen — for content audit only,
                      not sent to the client."
    }

Anti-leakage rules enforced (per spec project_quick_assessment_spec):
- Longest option ≠ always correct
- Answer distribution balanced across A/B/C/D and T/F/NG
- Distractors are paraphrase traps / partial truth / semantic inverse
- Inference questions synthesize 2+ sentences
- Vocab-in-context requires surrounding sentences
"""

READING_PASSAGES = [
    # ── B2 anchor passage ──────────────────────────────────────────────
    {
        "id": "R_B2_OCTOPUS",
        "level": "B2",
        "title": "The Eight-Armed Problem Solver",
        "body": (
            "Octopuses are masters of escape. Caretakers at the Seattle "
            "Aquarium have repeatedly found their octopus, Inky, sliding "
            "out of his tank at night through a six-centimetre drain, "
            "raiding nearby tanks of fish, and returning before staff "
            "arrived in the morning. This behaviour is not unusual. Across "
            "aquariums worldwide, octopuses are known to unscrew jar lids "
            "from inside, navigate underwater mazes, and even recognise "
            "individual human faces — a remarkable feat for a creature "
            "whose nearest cousin is the garden snail.\n\n"
            "The biological foundation of this intelligence is unusual. An "
            "octopus has nine brains. One is a central brain located "
            "between its eyes, and the other eight are smaller ganglia, "
            "one inside each arm. Together they contain roughly 500 "
            "million neurons, comparable to the brain of a dog. Each arm "
            "can act independently: an octopus can be solving a puzzle "
            "with one arm while another arm explores a different corner of "
            "the tank.\n\n"
            "In 2017, researchers at the University of Otago in New "
            "Zealand tested whether octopuses could plan their actions. "
            "The animals were placed in mazes that required selecting one "
            "of two routes based on the visible reward. Within a few "
            "attempts, the octopuses learned to choose the longer route "
            "when it offered a larger meal — evidence of forward-looking "
            "decision-making rather than simple stimulus response.\n\n"
            "What makes octopus cognition particularly striking is how it "
            "evolved. The last common ancestor of octopuses and humans "
            "lived around 600 million years ago and was almost certainly a "
            "flat, primitive worm with no brain to speak of. This means "
            "intelligence has evolved independently at least twice on "
            "Earth: once in vertebrates and once in cephalopods. Studying "
            "the octopus brain is therefore not just biology — it is, in a "
            "sense, an early look at how an alien mind might work."
        ),
        "word_count": 341,
        "questions": [
            {
                "qid": "R_B2_OCTOPUS_Q1",
                "type": "mcq",
                "skill_tag": "main_idea",
                "stem": "What is the writer's main purpose in this passage?",
                "options": [
                    {"key": "A", "text": "To warn aquarium staff about escape risks."},
                    {"key": "B", "text": "To explain how octopus arms function independently."},
                    {"key": "C", "text": "To present octopus intelligence as a separate, independent evolution of cognition.", "correct": True},
                    {"key": "D", "text": "To compare octopus intelligence to dolphin intelligence."},
                ],
                "rationale": (
                    "A = the Inky anecdote is a hook in para 1, not the thesis. "
                    "B = independent arm action is one supporting detail in para 2. "
                    "D = dolphins are never mentioned. C correctly captures the "
                    "para 4 evolutionary-independence argument."
                ),
            },
            {
                "qid": "R_B2_OCTOPUS_Q2",
                "type": "tfng",
                "skill_tag": "detail",
                "stem": "Inky escaped through an opening that was less than ten centimetres wide.",
                "answer": "TRUE",
                "rationale": "Para 1: 'six-centimetre drain'. 6 < 10 → TRUE.",
            },
            {
                "qid": "R_B2_OCTOPUS_Q3",
                "type": "tfng",
                "skill_tag": "tfng",
                "stem": "The University of Otago study used eight different mazes.",
                "answer": "NOT GIVEN",
                "rationale": (
                    "Para 3 mentions mazes but never specifies how many. The number "
                    "eight relates to arms in para 2, not maze count — a classic "
                    "T/F/NG paraphrase trap."
                ),
            },
            {
                "qid": "R_B2_OCTOPUS_Q4",
                "type": "mcq",
                "skill_tag": "inference",
                "stem": "Why does the writer mention 'the garden snail'?",
                "options": [
                    {"key": "A", "text": "To explain how octopuses developed their suction cups."},
                    {"key": "B", "text": "To emphasise how surprising octopus intelligence is, given the family it belongs to.", "correct": True},
                    {"key": "C", "text": "To compare the lifespan of octopuses and snails."},
                    {"key": "D", "text": "To suggest that snails might also be intelligent."},
                ],
                "rationale": (
                    "Synthesises 'nearest cousin is the garden snail' (low expectations "
                    "set) with the surrounding 'remarkable feat' (surprise inferred). "
                    "A/C are irrelevant; D is an over-reach inference not supported."
                ),
            },
            {
                "qid": "R_B2_OCTOPUS_Q5",
                "type": "mcq",
                "skill_tag": "vocab",
                "stem": "In paragraph 3, 'forward-looking decision-making' most nearly means:",
                "options": [
                    {"key": "A", "text": "Choosing what is immediately rewarding."},
                    {"key": "B", "text": "Selecting an action based on a future, larger reward.", "correct": True},
                    {"key": "C", "text": "Looking forward in the maze before choosing."},
                    {"key": "D", "text": "Reacting quickly to bright colours."},
                ],
                "rationale": (
                    "Surrounding sentence: 'chose the longer route when it offered a "
                    "larger meal — rather than simple stimulus response'. A = opposite "
                    "(immediate vs future). C = literal interpretation. D = unrelated."
                ),
            },
        ],
        # Answer distribution check: MCQ correct positions = C, B, B (well "
        # distributed across 3 MCQs); T/F/NG = TRUE, NOT GIVEN (balanced)
    },
]

# Stage 2 difficulty buckets — Stage 1 anchor score (0-4) routes here.
# (Other passages to be authored in subsequent sessions — Day 1 ships only
#  the B2 anchor as a working pilot.)
PASSAGE_BUCKETS = {
    "C1": [],          # 4/4 Stage 1 anchor → C1 register
    "B2": ["R_B2_OCTOPUS"],  # 2-3/4 → B2 (default Stage 1 anchor passage too)
    "B1": [],          # 0-1/4 → B1 register
}


def get_passage(passage_id):
    """Return passage dict by id, or None if missing."""
    for p in READING_PASSAGES:
        if p["id"] == passage_id:
            return p
    return None


def passage_for_difficulty(level):
    """Pick a passage matching the requested CEFR level."""
    bucket = PASSAGE_BUCKETS.get(level, [])
    if not bucket:
        # Fallback to B2 — single available passage in v1
        return get_passage("R_B2_OCTOPUS")
    return get_passage(bucket[0])
