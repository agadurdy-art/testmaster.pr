"""
Listening clips for the quick assessment.

Each clip has:
- `id`: stable identifier
- `level`: 'A2', 'B1', 'B2', 'C1' (drives Stage 2 adaptive routing)
- `section`: 'section1' (booking/inquiry) | 'section3' (academic discussion) | 'section4' (lecture)
- `transcript`: full text with speaker labels
- `voices`: list of Kokoro voice assignments — e.g. [("HELEN", "bf_emma"), ("MARCO", "bm_fable")]
- `audio_url`: R2 URL (set after gen_quick_assessment_audio.py runs)
- `questions`: same shape as reading
"""

LISTENING_CLIPS = [
    # ── Section 1 conversation @ B1 register ──────────────────────────
    {
        "id": "L_S1_LANG_EXCHANGE",
        "level": "B1",
        "section": "section1",
        "voices": [
            # Mixed accents = realistic IELTS Section 1. Quality-first picks:
            #   bf_emma  (B-) is the highest-grade British female in Kokoro v1.
            #   am_fenrir (C+) is the highest-grade American male — replaces
            #     bm_fable (C) which sounded robotic on the first render.
            ("HELEN", "bf_emma"),
            ("MARCO", "am_fenrir"),
        ],
        # eleven_v3 + ellipsis pacing + natural fillers for human delivery (no bracket
        # tags — kept text-only so nothing is ever vocalised by mistake).
        # Fillers (um/uh/so/right/honestly) added for naturalness — they do NOT
        # change any testable fact (spelling, DOB, prices, reason, matching).
        "transcript_for_tts": [
            ("HELEN", "Good afternoon, Cambridge Language Exchange — Helen speaking. How can I help you?"),
            ("MARCO", "Oh, hi. Um, yes — I'd like to sign up as a Spanish–English exchange partner, please."),
            ("HELEN", "Of course. Let me just take a few details. Could I get your full name first?"),
            ("MARCO", "Sure. It's Marco Lambardi."),
            # Spelling rendered with HIGH stability + multilingual_v2 (per-turn
            # override) so the letters are crisp — at low stability the "A" slurred
            # to "O" and the answer came out "Lombardi" (a wrong-answer distractor).
            ("HELEN", "Let me just confirm the surname, letter by letter — is it L - A - M - B - A - R - D - I?",
             {"stability": 0.9, "style": 0.0, "model": "eleven_multilingual_v2"}),
            ("MARCO", "Yes, that's exactly right."),
            ("HELEN", "Lovely — got it. And your date of birth?"),
            ("MARCO", "The fifteenth of August, nineteen ninety-seven."),
            ("HELEN", "Perfect. And which language are you offering, and which would you like to learn?"),
            ("MARCO", "So, I'm a native Spanish speaker, and I'd like to improve my English. Especially for work — I, uh, give a lot of presentations."),
            ("HELEN", "Right, I see. Well, we've got three options. Weekly one-hour sessions for fifteen pounds a month; twice-weekly for twenty-five; or unlimited messaging for just eight."),
            ("MARCO", "Hmm... I think twice-weekly. The messaging one's cheaper, but honestly, I really need the speaking practice."),
            ("HELEN", "Good choice. And how would you like to be matched — by accent preference, or by topic interest?"),
            ("MARCO", "By topic interest, please. I'd much rather chat about something I actually care about."),
        ],
        "audio_url": "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev/quick_assessment/L_S1_LANG_EXCHANGE_el5.mp3",
        "duration_estimate_sec": 75,
        "questions": [
            {
                "qid": "L_S1_LANG_EXCHANGE_Q1",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "How is the new member's surname spelled?",
                "options": [
                    {"key": "A", "text": "Lombardi"},
                    {"key": "B", "text": "Lambardi", "correct": True},
                    {"key": "C", "text": "Lambradi"},
                    {"key": "D", "text": "Lombarbi"},
                ],
                "rationale": "Tests spelling-from-speech, classic Section 1 skill. Marco spells L-A-M-B-A-R-D-I aloud.",
            },
            {
                "qid": "L_S1_LANG_EXCHANGE_Q2",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "Date of birth: ______ (day month year)",
                "answer_text": "15 August 1997",
                "answer_variants": [
                    "15 august 1997",
                    "15/08/1997",
                    "15-08-1997",
                    "august 15, 1997",
                    "august 15 1997",
                    "15 aug 1997",
                ],
                "rationale": "Tests number + month transcription.",
            },
            {
                "qid": "L_S1_LANG_EXCHANGE_Q3",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "Monthly cost of Marco's chosen plan: £____",
                "answer_text": "25",
                "answer_variants": ["25", "£25", "twenty-five", "twenty five", "25 pounds"],
                "rationale": (
                    "Distractor numbers in audio: 15 (weekly), 8 (messaging). Tests "
                    "listening for the chosen option specifically — number trap."
                ),
            },
            {
                "qid": "L_S1_LANG_EXCHANGE_Q4",
                "type": "mcq",
                "skill_tag": "reasoning",
                "stem": "Why did Marco choose twice-weekly sessions over messaging?",
                "options": [
                    {"key": "A", "text": "It costs less per session."},
                    {"key": "B", "text": "He needs speaking practice.", "correct": True},
                    {"key": "C", "text": "He doesn't like messaging apps."},
                    {"key": "D", "text": "Messaging is fully booked."},
                ],
                "rationale": (
                    "Marco: 'The messaging one is cheaper but I really need speaking practice.' "
                    "A is reversed (messaging is cheaper not twice-weekly). C/D never mentioned."
                ),
            },
        ],
    },

    # ── Section 4 lecture @ B2 register ───────────────────────────────
    {
        "id": "L_S4_SLEEP_MEMORY",
        "level": "B2",
        "section": "section4",
        "voices": [
            # Academic lecture register — bm_george (C) holds the British
            # academic feel best out of the available BM voices.
            ("LECTURER", "bm_george"),
        ],
        # eleven_v3 academic-but-human delivery: spoken-form numbers so the model
        # says them naturally; light rhetoric. All facts (1960s, 2-3 hours, 2019
        # Harvard, 8 hours, 65% vs 32%) preserved.
        "transcript_for_tts": [
            ("LECTURER",
             "Right, so... tonight, when you sleep, your brain will not "
             "switch off. In fact, it'll work harder than during much of the day — but "
             "on a different task. While you're awake, your brain takes in information; "
             "while you sleep, it organises it."),
            ("LECTURER",
             "Now, researchers have known since the nineteen-sixties that learning is "
             "followed by a particular pattern of brain activity during sleep — "
             "specifically during what we call the slow-wave stage. This is the deepest "
             "part of sleep, typically reached two to three hours after falling asleep, "
             "and it appears to play a critical role in moving memories from short-term "
             "storage into long-term storage."),
            ("LECTURER",
             "A two-thousand-nineteen study at Harvard demonstrated this rather clearly. "
             "Two groups of students were taught the same vocabulary list. One group "
             "slept for a full eight hours afterwards; the other was kept awake for the "
             "same period. Two days later, the sleeping group remembered, on average, "
             "sixty-five per cent of the words. The awake group? Only "
             "thirty-two."),
        ],
        "audio_url": "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev/quick_assessment/L_S4_SLEEP_MEMORY_el5.mp3",
        "duration_estimate_sec": 70,
        "questions": [
            {
                "qid": "L_S4_SLEEP_MEMORY_Q1",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "According to the lecture, slow-wave sleep typically begins:",
                "options": [
                    {"key": "A", "text": "immediately after falling asleep"},
                    {"key": "B", "text": "two to three hours after falling asleep", "correct": True},
                    {"key": "C", "text": "eight hours after falling asleep"},
                    {"key": "D", "text": "only in younger people"},
                ],
                "rationale": (
                    "C is a number trap (8 hours = sleep duration in the study, not "
                    "slow-wave onset). D is never mentioned. A contradicts the lecture."
                ),
            },
            {
                "qid": "L_S4_SLEEP_MEMORY_Q2",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "The awake group in the Harvard study remembered only ______ per cent of the words.",
                "answer_text": "32",
                "answer_variants": ["32", "thirty-two", "thirty two", "32%"],
                "rationale": "Tests selective listening for one of two numbers (65 vs 32).",
            },
        ],
    },
]

# Stage 2 difficulty buckets — by Stage 1 anchor outcome.
# We only have 2 clips in v1 (Section 1 conv + Section 4 lecture), so:
#   C1 + B2 → academic lecture (harder)
#   B1 + A2 → booking conversation (easier)
LISTENING_BUCKETS = {
    "C1": ["L_S4_SLEEP_MEMORY"],
    "B2": ["L_S4_SLEEP_MEMORY"],
    "B1": ["L_S1_LANG_EXCHANGE"],
    "A2": ["L_S1_LANG_EXCHANGE"],
}


def get_clip(clip_id):
    for c in LISTENING_CLIPS:
        if c["id"] == clip_id:
            return c
    return None


def clip_for_difficulty(level):
    bucket = LISTENING_BUCKETS.get(level, [])
    if not bucket:
        return get_clip("L_S1_LANG_EXCHANGE")
    return get_clip(bucket[0])
