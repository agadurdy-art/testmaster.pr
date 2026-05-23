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
    # ── B1 (Stage 2 — Foundation) ─────────────────────────────────────
    {
        "id": "R_B1_SLEEP_MEMORY",
        "level": "B1",
        "title": "How Sleep Helps You Remember",
        "body": (
            "Most people know that sleep makes them feel rested. But sleep "
            "also helps the brain in another important way: it helps us "
            "remember things.\n\n"
            "When you learn something during the day, your brain stores it "
            "in a temporary place called short-term memory. Short-term "
            "memory is like a small notepad: it holds information for a "
            "short time, but it can lose things quickly. To keep something "
            "for longer, your brain needs to move it to long-term memory. "
            "This is the work your brain does while you sleep.\n\n"
            "Scientists at Harvard University did a simple test in 2019. "
            "Two groups of students learned the same list of 50 new words. "
            "After learning, the first group slept for eight hours. The "
            "second group stayed awake all night. Two days later, both "
            "groups were tested again. The group that had slept remembered "
            "about 65% of the words. The group that stayed awake remembered "
            "only 32%.\n\n"
            "The lesson is clear: if you want to learn something well, do "
            "not study all night. Sleep is not lost time. It is the time "
            "your brain works hardest to keep what you have learned."
        ),
        "word_count": 245,
        "questions": [
            {
                "qid": "R_B1_SLEEP_MEMORY_Q1",
                "type": "mcq",
                "skill_tag": "main_idea",
                "stem": "What is the main idea of this passage?",
                "options": [
                    {"key": "A", "text": "Students who study all night get higher scores."},
                    {"key": "B", "text": "Sleep helps the brain store what you have learned.", "correct": True},
                    {"key": "C", "text": "Short-term memory is the same as long-term memory."},
                    {"key": "D", "text": "Harvard University is the best university in the world."},
                ],
                "rationale": "B captures both topic + thesis. A is opposite of conclusion. C contradicts para 2. D irrelevant.",
            },
            {
                "qid": "R_B1_SLEEP_MEMORY_Q2",
                "type": "tfng",
                "skill_tag": "detail",
                "stem": "The students who slept eight hours remembered more than half the words.",
                "answer": "TRUE",
                "rationale": "65% > 50%. TRUE.",
            },
            {
                "qid": "R_B1_SLEEP_MEMORY_Q3",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "The group that stayed awake remembered only ______ per cent of the words.",
                "answer_text": "32",
                "answer_variants": ["32", "thirty-two", "thirty two", "32%"],
                "rationale": "Tests number-from-text retrieval.",
            },
            {
                "qid": "R_B1_SLEEP_MEMORY_Q4",
                "type": "mcq",
                "skill_tag": "vocab",
                "stem": "In the passage, 'temporary' (paragraph 2) most nearly means:",
                "options": [
                    {"key": "A", "text": "permanent and long-lasting"},
                    {"key": "B", "text": "lasting only for a short time", "correct": True},
                    {"key": "C", "text": "very large and important"},
                    {"key": "D", "text": "secret or hidden"},
                ],
                "rationale": "A = opposite. C/D unrelated. Context: 'holds information for a short time'.",
            },
        ],
    },

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

    # ── C1 (Stage 2 — Advanced) ───────────────────────────────────────
    {
        "id": "R_C1_COOPERATION",
        "level": "C1",
        "title": "Why Strangers Cooperate",
        "body": (
            "For most of human history, our ancestors lived in small bands "
            "of at most a few hundred people. Within these bands, "
            "cooperation was reinforced through repeated face-to-face "
            "interaction — those who cheated or failed to contribute were "
            "remembered and excluded. Modern life, however, places us "
            "daily into transactions with complete strangers: the cashier, "
            "the delivery driver, the unseen software engineer whose code "
            "we depend on. That such cooperation persists at all is, on "
            "the face of it, evolutionarily puzzling.\n\n"
            "One influential answer comes from the theory of indirect "
            "reciprocity. Even when we will never meet someone again, our "
            "behaviour towards them is observed — directly by witnesses, "
            "and indirectly through reputation systems such as online "
            "reviews. A driver who is rude to a passenger is not punished "
            "by that passenger alone; subsequent passengers, having seen "
            "the rating, may decline the ride entirely. Selection pressure "
            "in such environments favours those who maintain a "
            "cooperative reputation, regardless of immediate cost.\n\n"
            "Critics have pointed out, however, that indirect reciprocity "
            "alone cannot explain cooperation in genuinely anonymous "
            "settings, where no observer is present and no rating system "
            "operates. Experiments in economic laboratories have "
            "consistently shown that, even when guaranteed anonymity, a "
            "substantial minority of participants donate to strangers, "
            "punish unfair players at personal cost, or contribute to "
            "public goods. This suggests that some component of human "
            "cooperation is not strategic at all but rather internalised "
            "— a moral disposition shaped by the long evolutionary tail "
            "of repeated, small-group interaction.\n\n"
            "What emerges is a picture of layered motivation: we "
            "cooperate partly because our reputations depend on it, "
            "partly because we cannot quite shut off the instincts that "
            "served us in tribal contexts, and partly because doing so "
            "feels right. Untangling which of these mechanisms drives "
            "any given act of trust remains one of the open questions of "
            "behavioural science."
        ),
        "word_count": 380,
        "questions": [
            {
                "qid": "R_C1_COOPERATION_Q1",
                "type": "mcq",
                "skill_tag": "main_idea",
                "stem": "What is the writer's overall position on why strangers cooperate?",
                "options": [
                    {"key": "A", "text": "It is fully explained by indirect reciprocity through reputation."},
                    {"key": "B", "text": "It is best understood as a combination of reputation incentives and internalised dispositions inherited from small-group living.", "correct": True},
                    {"key": "C", "text": "It cannot be explained by current science."},
                    {"key": "D", "text": "It is mostly the result of legal and institutional enforcement."},
                ],
                "rationale": (
                    "Paragraph 4 explicitly frames a 'layered motivation' synthesis. "
                    "A is the position critiqued in para 3 (insufficient alone). C is too "
                    "strong — the article does not say science has failed. D introduces "
                    "law/institutions which the passage never discusses."
                ),
            },
            {
                "qid": "R_C1_COOPERATION_Q2",
                "type": "tfng",
                "skill_tag": "inference",
                "stem": "Online review systems are an example of an indirect reciprocity mechanism.",
                "answer": "TRUE",
                "rationale": (
                    "Para 2 lists 'reputation systems such as online reviews' as part of "
                    "indirect reciprocity. TRUE — direct paraphrase."
                ),
            },
            {
                "qid": "R_C1_COOPERATION_Q3",
                "type": "tfng",
                "skill_tag": "tfng",
                "stem": "The laboratory experiments mentioned in paragraph 3 were conducted in countries across all continents.",
                "answer": "NOT GIVEN",
                "rationale": "Para 3 mentions 'experiments in economic laboratories' but says nothing about their geographic spread.",
            },
            {
                "qid": "R_C1_COOPERATION_Q4",
                "type": "mcq",
                "skill_tag": "vocab",
                "stem": "In paragraph 3, 'a moral disposition shaped by the long evolutionary tail of repeated, small-group interaction' suggests that the disposition:",
                "options": [
                    {"key": "A", "text": "is learned individually in childhood through repetition"},
                    {"key": "B", "text": "evolved over very long timescales as a residue of how our ancestors lived", "correct": True},
                    {"key": "C", "text": "appears only in people who have lived in small communities themselves"},
                    {"key": "D", "text": "is unique to humans among primates"},
                ],
                "rationale": (
                    "Requires synthesising 'evolutionary tail' (long time) + 'small-group "
                    "interaction' (ancestral context). A confuses individual learning with "
                    "evolution. C contradicts the universalist claim. D is not addressed."
                ),
            },
        ],
    },
]

# Stage 2 difficulty buckets — Stage 1 anchor score (0-4) routes here.
PASSAGE_BUCKETS = {
    "C1": ["R_C1_COOPERATION"],       # 4/4 anchor → C1
    "B2": ["R_B2_OCTOPUS"],           # 2-3/4 → B2 (also Stage 1 default)
    "B1": ["R_B1_SLEEP_MEMORY"],      # 0-1/4 → B1
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
