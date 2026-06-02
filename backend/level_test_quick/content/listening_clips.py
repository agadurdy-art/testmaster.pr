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
                    {"key": "A", "text": "within minutes of first falling asleep"},
                    {"key": "B", "text": "two to three hours after falling asleep", "correct": True},
                    {"key": "C", "text": "around eight hours after falling asleep"},
                    {"key": "D", "text": "mainly in children and young adults"},
                ],
                "rationale": (
                    "Distractors length-matched to the key. C is a number trap (8h = study "
                    "sleep duration, not slow-wave onset); D never stated; A contradicts the "
                    "'two to three hours' detail."
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
            {
                "qid": "L_S4_SLEEP_MEMORY_Q3",
                "type": "tfng",
                "skill_tag": "detail",
                "stem": "The lecturer says the brain shuts down and rests completely during sleep.",
                "answer": "FALSE",
                "rationale": "Opening: the brain 'will not switch off ... it'll work harder' — direct contradiction → FALSE (not NOT GIVEN; it is explicitly addressed).",
            },
            {
                "qid": "L_S4_SLEEP_MEMORY_Q4",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "What does slow-wave sleep mainly do for memory?",
                "options": [
                    {"key": "A", "text": "It erases unimportant details learned that day."},
                    {"key": "B", "text": "It keeps memories only in short-term storage."},
                    {"key": "C", "text": "It moves memories into longer-term storage.", "correct": True},
                    {"key": "D", "text": "It speeds up how quickly new facts are learned."},
                ],
                "rationale": (
                    "Key = C (short, not the longest option). Lecture: slow-wave 'moves "
                    "memories from short-term storage into long-term storage'. B = opposite; "
                    "A/D never claimed."
                ),
            },
            {
                "qid": "L_S4_SLEEP_MEMORY_Q5",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "Researchers first linked learning to brain activity in sleep in the ______ (decade).",
                "answer_text": "1960s",
                "answer_variants": ["1960s", "the 1960s", "nineteen sixties", "60s", "1960's", "sixties"],
                "rationale": "Lecture: 'known since the nineteen-sixties'. Tests decade transcription.",
            },
        ],
    },

    # ── Section 1 #2 (pool variety) — sports-centre booking @ B1 ───────
    {
        "id": "L_S1B_SPORTS",
        "level": "B1",
        "section": "section1",
        "voices": [("ALEX", "alice"), ("SAM", "charlie")],
        "transcript_for_tts": [
            ("ALEX", "Good morning, Riverside Sports Centre — Alex speaking. How can I help?"),
            ("SAM", "Hi there. I'd like to enrol in the adult swimming course, if there are still places."),
            ("ALEX", "There are, yes. Can I take your name?"),
            ("SAM", "Sure, it's Sam Price."),
            # Spelling on the NATIVE staff voice, high stability → crisp letters.
            ("ALEX", "Let me just confirm the surname — is that P - R - I - C - E?",
             {"stability": 0.9, "style": 0.0, "model": "eleven_multilingual_v2"}),
            ("SAM", "Yes, that's right."),
            ("ALEX", "Great. The course runs on Tuesday evenings, seven to eight, for eight weeks."),
            ("SAM", "Tuesday's perfect. And how much is it?"),
            ("ALEX", "It's forty-five pounds for the full course. There's also a ten-pound deposit for the locker key, which you get back at the end."),
            ("SAM", "Okay. Is there anything I need to bring?"),
            ("ALEX", "Just a swimming cap — they're compulsory in our pool. Goggles are optional."),
            ("SAM", "Got it. Thanks very much."),
        ],
        "audio_url": "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev/quick_assessment/L_S1B_SPORTS_el5.mp3",  # set by gen_quick_assessment_audio_elevenlabs.py
        "duration_estimate_sec": 70,
        "questions": [
            {
                "qid": "L_S1B_SPORTS_Q1",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "Caller's surname: ______",
                "answer_text": "Price",
                "answer_variants": ["price", "p-r-i-c-e", "price."],
                "rationale": "Spelling-from-speech; staff confirms P-R-I-C-E.",
            },
            {
                "qid": "L_S1B_SPORTS_Q2",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "Which evening does the swimming course run?",
                "options": [
                    {"key": "A", "text": "Tuesday evenings, for eight weeks", "correct": True},
                    {"key": "B", "text": "Monday evenings, for eight weeks"},
                    {"key": "C", "text": "Thursday evenings, for six weeks"},
                    {"key": "D", "text": "Saturday mornings, for eight weeks"},
                ],
                "rationale": "Audio: 'Tuesday evenings ... for eight weeks'. Length-matched distractors; day-trap.",
            },
            {
                "qid": "L_S1B_SPORTS_Q3",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "Cost of the full course: £______",
                "answer_text": "45",
                "answer_variants": ["45", "£45", "forty-five", "forty five", "45 pounds"],
                "rationale": "Number trap: 10 (deposit), 8 (weeks) are distractor numbers.",
            },
            {
                "qid": "L_S1B_SPORTS_Q4",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "What must the caller bring to the pool?",
                "options": [
                    {"key": "A", "text": "A pair of swimming goggles"},
                    {"key": "B", "text": "Their own locker padlock"},
                    {"key": "C", "text": "A compulsory swimming cap", "correct": True},
                    {"key": "D", "text": "A signed medical certificate"},
                ],
                "rationale": "Audio: 'Just a swimming cap — compulsory ... Goggles are optional.' A = optional trap; B/D never said.",
            },
        ],
    },

    # ── Section 3 (pool variety) — student discussion @ B2/C1 ─────────
    {
        "id": "L_S3_PROJECT",
        "level": "C1",
        "section": "section3",
        "voices": [("TUTOR", "daniel"), ("MAYA", "sarah"), ("LUCAS", "hernando")],
        "transcript_for_tts": [
            ("TUTOR", "So, Maya, Lucas — how's the presentation on urban heat islands coming along?"),
            ("MAYA", "Pretty well, I think. We've finished the introduction and the causes section."),
            ("LUCAS", "Yeah, but we're a bit stuck on the data. The city council figures only go back five years."),
            ("TUTOR", "That's a common problem. Have you tried the national weather service archive?"),
            ("MAYA", "Oh — no, we hadn't thought of that. That would give us thirty years, wouldn't it?"),
            ("TUTOR", "At least. I'd strongly recommend leading with that long-term data — it makes the trend far more convincing."),
            ("LUCAS", "Good idea. Should we cut the section on building materials, then? We're running over time."),
            ("TUTOR", "Keep it, but make it shorter — say two minutes instead of five. And remember the deadline is the fourteenth, not the twenty-first."),
            ("MAYA", "Right, the fourteenth. We'll get the slides to you by Friday."),
        ],
        "audio_url": "https://pub-fcd31e7869f94c4896d039253b8f1646.r2.dev/quick_assessment/L_S3_PROJECT_el5.mp3",
        "duration_estimate_sec": 75,
        "questions": [
            {
                "qid": "L_S3_PROJECT_Q1",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "What problem are the students having with their presentation?",
                "options": [
                    {"key": "A", "text": "Their introduction is still unfinished."},
                    {"key": "B", "text": "The council's data covers too few years.", "correct": True},
                    {"key": "C", "text": "They cannot agree on the main topic."},
                    {"key": "D", "text": "Their slides keep crashing the software."},
                ],
                "rationale": "Audio: 'stuck on the data ... only go back five years'. A is false (intro done); C/D never said.",
            },
            {
                "qid": "L_S3_PROJECT_Q2",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "What does the tutor recommend?",
                "options": [
                    {"key": "A", "text": "Removing the data section altogether"},
                    {"key": "B", "text": "Using only the council's recent figures"},
                    {"key": "C", "text": "Leading with long-term archive data", "correct": True},
                    {"key": "D", "text": "Delaying the whole presentation a week"},
                ],
                "rationale": "Audio: 'recommend leading with that long-term data'. A/B/D contradict the advice.",
            },
            {
                "qid": "L_S3_PROJECT_Q3",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "The presentation deadline is the ______ (date).",
                "answer_text": "14th",
                "answer_variants": ["14th", "14", "fourteenth", "the fourteenth", "14th."],
                "rationale": "Date trap: the twenty-first is the wrong date the tutor corrects.",
            },
            {
                "qid": "L_S3_PROJECT_Q4",
                "type": "mcq",
                "skill_tag": "detail",
                "stem": "What does the tutor say to do with the building-materials section?",
                "options": [
                    {"key": "A", "text": "Cut it from the talk completely"},
                    {"key": "B", "text": "Move it to the very beginning"},
                    {"key": "C", "text": "Expand it to five full minutes"},
                    {"key": "D", "text": "Shorten it to about two minutes", "correct": True},
                ],
                "rationale": "Audio: 'Keep it, but make it shorter — two minutes instead of five.' A = student's suggestion the tutor rejects; B/D contradict.",
            },
        ],
    },
]

# Stage 2 difficulty buckets — lists per level (≥2 where possible) so Stage 2
# RANDOMLY picks one — repeat-takers don't memorise a single clip.
LISTENING_BUCKETS = {
    "C1": ["L_S4_SLEEP_MEMORY", "L_S3_PROJECT"],
    "B2": ["L_S4_SLEEP_MEMORY", "L_S3_PROJECT"],
    "B1": ["L_S1_LANG_EXCHANGE", "L_S1B_SPORTS"],
    "A2": ["L_S1_LANG_EXCHANGE", "L_S1B_SPORTS"],
}

# Section-1 clips usable as the Stage 1 anchor (random per session).
ANCHOR_CLIPS = ["L_S1_LANG_EXCHANGE", "L_S1B_SPORTS"]


def get_clip(clip_id):
    for c in LISTENING_CLIPS:
        if c["id"] == clip_id:
            return c
    return None


def clip_for_difficulty(level):
    """Pick a RANDOM clip matching the requested CEFR level (pool variety)."""
    import random
    bucket = LISTENING_BUCKETS.get(level, [])
    if not bucket:
        bucket = LISTENING_BUCKETS["B1"]
    return get_clip(random.choice(bucket))


def anchor_clip():
    """Random Section-1 clip for the Stage 1 anchor (different per session)."""
    import random
    return get_clip(random.choice(ANCHOR_CLIPS))
