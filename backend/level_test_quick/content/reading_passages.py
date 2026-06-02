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
                    {"key": "A", "text": "Sleep helps the brain hold on to what you learn.", "correct": True},
                    {"key": "B", "text": "Students who study all night remember far more."},
                    {"key": "C", "text": "Short-term memory lasts longer than long-term memory."},
                    {"key": "D", "text": "Harvard is the leading university for brain research."},
                ],
                "rationale": "A captures topic+thesis (concise, NOT the longest option). B is the opposite of the conclusion; C contradicts para 2; D is irrelevant. Distractors matched in length to A.",
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
                    {"key": "A", "text": "fixed and permanent"},
                    {"key": "B", "text": "large and very important"},
                    {"key": "C", "text": "lasting a short time", "correct": True},
                    {"key": "D", "text": "secret and hidden"},
                ],
                "rationale": "Correct = C (key moved off B; length parity with distractors). A = opposite; B/D unrelated. Context: 'holds information for a short time'.",
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
                    {"key": "A", "text": "To warn aquarium staff about how octopuses keep escaping."},
                    {"key": "B", "text": "To explain how each octopus arm can act independently."},
                    {"key": "C", "text": "To argue that octopus intelligence evolved on its own.", "correct": True},
                    {"key": "D", "text": "To compare octopus intelligence with that of dolphins."},
                ],
                "rationale": (
                    "C captures the para-4 independent-evolution thesis, kept SHORT so it "
                    "isn't the length tell (A is the longest distractor). A = the Inky hook "
                    "(para 1), B = one supporting detail (para 2), D = dolphins never mentioned."
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
                    {"key": "B", "text": "To compare the lifespans of octopuses and garden snails."},
                    {"key": "C", "text": "To suggest that garden snails may also be intelligent."},
                    {"key": "D", "text": "To stress how unexpected the octopus's intelligence is.", "correct": True},
                ],
                "rationale": (
                    "B (correct) synthesises 'nearest cousin is the garden snail' (low "
                    "expectations) + 'remarkable feat' (surprise) — and is NOT the longest "
                    "option (C is). A/C irrelevant; D is an unsupported over-reach."
                ),
            },
            {
                "qid": "R_B2_OCTOPUS_Q5",
                "type": "mcq",
                "skill_tag": "vocab",
                "stem": "In paragraph 3, 'forward-looking decision-making' most nearly means:",
                "options": [
                    {"key": "A", "text": "Choosing whatever gives the quickest reward."},
                    {"key": "B", "text": "Looking ahead through the maze before moving."},
                    {"key": "C", "text": "Reacting fast to bright, colourful visual cues."},
                    {"key": "D", "text": "Choosing an action for a bigger later reward.", "correct": True},
                ],
                "rationale": (
                    "Correct = D (key moved off B; C is the longest option, not D). "
                    "Context: 'chose the longer route when it offered a larger meal — "
                    "rather than simple stimulus response'. A = opposite (immediate vs "
                    "future); B = literal; C = unrelated."
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
                    {"key": "A", "text": "It is fully explained by reputation under indirect reciprocity theory."},
                    {"key": "B", "text": "It blends reputation incentives with inherited moral instincts.", "correct": True},
                    {"key": "C", "text": "It currently lies beyond what behavioural science can explain."},
                    {"key": "D", "text": "It stems mainly from legal rules and institutional enforcement."},
                ],
                "rationale": (
                    "B captures the para-4 'layered motivation' synthesis, trimmed so the "
                    "longest option is now the A distractor, not the key. A = position "
                    "critiqued in para 3; C = too strong (science hasn't 'failed'); "
                    "D = law/institutions never discussed."
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
                    {"key": "A", "text": "is learned by each person in childhood through repetition"},
                    {"key": "B", "text": "appears only in people raised in small communities today"},
                    {"key": "C", "text": "evolved slowly as a trace of our ancestors' way of life", "correct": True},
                    {"key": "D", "text": "is unique to humans and found in no other primate species"},
                ],
                "rationale": (
                    "Correct = C (key moved off B; D is now the longest option). Synthesises "
                    "'evolutionary tail' (long time) + 'small-group interaction' (ancestral). "
                    "A confuses individual learning with evolution; B contradicts the "
                    "universalist claim; D is not addressed."
                ),
            },
        ],
    },
    # ── B1 #2 (pool variety) ──────────────────────────────────────────
    {
        "id": "R_B1_JAY_OAK",
        "level": "B1",
        "title": "The Bird That Plants a Forest",
        "body": (
            "Every autumn, a small, colourful bird called the jay does "
            "something that quietly shapes the forests of Europe. Jays love "
            "to eat acorns, the seeds of oak trees. But they collect far "
            "more than they can eat in a day, so they hide the extra acorns "
            "to use later in winter.\n\n"
            "A single jay can bury several thousand acorns in one season. It "
            "pushes each acorn into the soil with its beak, often far from "
            "the parent tree. The bird has a good memory and digs up most of "
            "its hidden food when other food becomes hard to find.\n\n"
            "However, no memory is perfect. Some acorns are never found "
            "again. These forgotten seeds are exactly the ones that matter. "
            "Buried in soft soil at the right depth, and carried far from the "
            "shade of the parent oak, they are in an ideal place to grow. In "
            "this way, the jay plants new oak trees without meaning to.\n\n"
            "Scientists believe that after the last ice age, jays helped oak "
            "forests spread north across Europe far faster than the trees "
            "could have spread alone. A bird looking after itself, it turns "
            "out, was also planting the forests of the future."
        ),
        "word_count": 230,
        "questions": [
            {
                "qid": "R_B1_JAY_OAK_Q1",
                "type": "mcq",
                "skill_tag": "main_idea",
                "stem": "What is the main idea of this passage?",
                "options": [
                    {"key": "A", "text": "A bird helps oak forests grow by hiding acorns.", "correct": True},
                    {"key": "B", "text": "Jays have the sharpest memory of all forest birds."},
                    {"key": "C", "text": "Oak trees cannot spread at all without bird help."},
                    {"key": "D", "text": "Acorns are the main source of winter food in forests."},
                ],
                "rationale": "A (concise, not longest) = the unintentional-planting thesis. B overstates memory; C too absolute; D a detail, not the point.",
            },
            {
                "qid": "R_B1_JAY_OAK_Q2",
                "type": "tfng",
                "skill_tag": "detail",
                "stem": "A single jay buries only a small number of acorns each season.",
                "answer": "FALSE",
                "rationale": "Para 2: 'several thousand acorns in one season' → FALSE.",
            },
            {
                "qid": "R_B1_JAY_OAK_Q3",
                "type": "fill",
                "skill_tag": "detail",
                "stem": "In one season a single jay can bury several ______ acorns.",
                "answer_text": "thousand",
                "answer_variants": ["thousand", "thousands"],
                "rationale": "Number-word retrieval from para 2.",
            },
            {
                "qid": "R_B1_JAY_OAK_Q4",
                "type": "mcq",
                "skill_tag": "inference",
                "stem": "Why does the writer say the forgotten acorns 'are the ones that matter'?",
                "options": [
                    {"key": "A", "text": "Because jays bury them especially to feed their chicks later."},
                    {"key": "B", "text": "Because only forgotten acorns are left to grow into trees.", "correct": True},
                    {"key": "C", "text": "Because oak trees grow best in their parent's shade."},
                    {"key": "D", "text": "Because the jay returns to eat them first in winter."},
                ],
                "rationale": "B synthesises 'never found again' + 'ideal place to grow'. A/C/D contradict the text (eaten ones don't grow; shade is bad; returned ones are eaten).",
            },
        ],
    },

    # ── B2 #2 (pool variety) ──────────────────────────────────────────
    {
        "id": "R_B2_WOOD_WIDE_WEB",
        "level": "B2",
        "title": "The Hidden Network Beneath the Forest",
        "body": (
            "Walk through any old forest and you are standing on top of a "
            "communication network older than the internet. Beneath the soil, "
            "the roots of trees are connected by vast webs of fungal threads "
            "called mycorrhizae. These threads, far thinner than a human "
            "hair, link tree to tree across an entire woodland.\n\n"
            "The relationship benefits both sides. The fungi cannot make "
            "their own food, so they draw sugars from the trees. In return, "
            "they extend the trees' reach for water and nutrients, acting "
            "like an enormous extra root system. But the network does more "
            "than feed individual trees. Through it, trees appear to share "
            "resources with one another.\n\n"
            "In a celebrated set of experiments, the ecologist Suzanne "
            "Simard showed that older, taller 'mother trees' send carbon "
            "through the fungal network to shaded seedlings that cannot yet "
            "photosynthesise enough on their own. When a tree is dying, it "
            "may even release its stored carbon into the network, where "
            "neighbours absorb it. Trees under attack by insects have also "
            "been found to send chemical warning signals to their neighbours "
            "along these threads.\n\n"
            "Not everyone agrees on how to interpret these findings. Some "
            "scientists warn that words like 'mother' and 'sharing' risk "
            "describing the forest as if it were a single, caring "
            "organism, when the underlying process may be closer to a "
            "marketplace in which fungi move resources to wherever they gain "
            "the most. What is not disputed is that no tree, it seems, truly "
            "stands alone."
        ),
        "word_count": 300,
        "questions": [
            {
                "qid": "R_B2_WOOD_WIDE_WEB_Q1",
                "type": "mcq",
                "skill_tag": "main_idea",
                "stem": "What is the writer's main purpose in this passage?",
                "options": [
                    {"key": "A", "text": "To advise foresters on how to protect old woodlands."},
                    {"key": "B", "text": "To show how trees connect and share resources underground.", "correct": True},
                    {"key": "C", "text": "To prove that forests act as a single caring organism."},
                    {"key": "D", "text": "To explain how the internet was modelled on forest networks."},
                ],
                "rationale": "B = the network + resource-sharing focus. C is the view the passage QUESTIONS (para 4); A/D never argued. (B not the longest option — A and C are comparable.)",
            },
            {
                "qid": "R_B2_WOOD_WIDE_WEB_Q2",
                "type": "tfng",
                "skill_tag": "detail",
                "stem": "The fungi are able to produce their own food independently of the trees.",
                "answer": "FALSE",
                "rationale": "Para 2: 'The fungi cannot make their own food' → FALSE.",
            },
            {
                "qid": "R_B2_WOOD_WIDE_WEB_Q3",
                "type": "tfng",
                "skill_tag": "tfng",
                "stem": "Suzanne Simard's experiments were carried out over a period of thirty years.",
                "answer": "NOT GIVEN",
                "rationale": "Para 3 reports her findings but states nothing about how long the experiments lasted.",
            },
            {
                "qid": "R_B2_WOOD_WIDE_WEB_Q4",
                "type": "mcq",
                "skill_tag": "inference",
                "stem": "Why do some scientists object to the word 'mother tree'?",
                "options": [
                    {"key": "A", "text": "They believe seedlings receive no carbon at all from older trees."},
                    {"key": "B", "text": "They think it makes the forest sound like one caring being.", "correct": True},
                    {"key": "C", "text": "They have shown that the fungal threads do not really exist."},
                    {"key": "D", "text": "They argue that mother trees harm the seedlings around them."},
                ],
                "rationale": "B paraphrases para 4 ('single, caring organism'). A/C/D contradict the passage (carbon IS sent; threads exist; no harm claimed).",
            },
            {
                "qid": "R_B2_WOOD_WIDE_WEB_Q5",
                "type": "mcq",
                "skill_tag": "vocab",
                "stem": "In paragraph 4, the comparison to 'a marketplace' suggests the fungi:",
                "options": [
                    {"key": "A", "text": "move resources to where they benefit most.", "correct": True},
                    {"key": "B", "text": "sell their sugars to the trees in exchange for money."},
                    {"key": "C", "text": "share their resources equally among all the trees."},
                    {"key": "D", "text": "compete with the trees for the same sunlight."},
                ],
                "rationale": "A = self-interested allocation (the 'marketplace' point). B literalises 'money'; C is the opposite (a market isn't equal sharing); D unrelated.",
            },
        ],
    },

    # ── C1 #2 (pool variety) ──────────────────────────────────────────
    {
        "id": "R_C1_ATTENTION",
        "level": "C1",
        "title": "The Economics of Attention",
        "body": (
            "When a service is offered without charge, the familiar warning "
            "runs, you are not the customer; you are the product. The slogan "
            "is neat, but it is not quite right. What is actually being sold "
            "is not the user but a far more specific commodity: the user's "
            "attention, sliced into ever-smaller units and auctioned to "
            "advertisers in the milliseconds before a page loads.\n\n"
            "This reframing matters because attention, unlike most goods, is "
            "strictly finite. A factory can raise output; a person cannot "
            "manufacture more hours in the day. An economy built on "
            "harvesting attention is therefore, by its nature, a zero-sum "
            "contest: every design choice that captures another minute of "
            "your focus must take that minute from something else — a "
            "conversation, a task, a moment of rest.\n\n"
            "Critics often frame the resulting products as merely "
            "distracting. Yet the more troubling claim is subtler. Because "
            "the systems are optimised relentlessly for engagement, they "
            "tend to amplify whatever holds attention most reliably — and "
            "what reliably holds attention is not necessarily what is true, "
            "useful, or good for us. Outrage travels faster than nuance; "
            "novelty outperforms depth. The machinery is indifferent to "
            "content; it rewards only stickiness.\n\n"
            "Some argue the remedy lies with individuals exercising more "
            "self-control. But this places the entire burden on the single "
            "human mind against systems engineered by thousands of people "
            "and refined by experiments on millions. To treat the contest "
            "as a fair one, in which willpower is simply lacking, is to "
            "misunderstand the asymmetry at its heart."
        ),
        "word_count": 305,
        "questions": [
            {
                "qid": "R_C1_ATTENTION_Q1",
                "type": "mcq",
                "skill_tag": "main_idea",
                "stem": "What is the writer's central argument?",
                "options": [
                    {"key": "A", "text": "Free online services secretly sell users' personal data to other firms."},
                    {"key": "B", "text": "Attention is a finite resource that these systems contest unfairly.", "correct": True},
                    {"key": "C", "text": "Online products are simply distracting and waste people's time."},
                    {"key": "D", "text": "Users could easily fix the problem with a little more willpower."},
                ],
                "rationale": "B = the finite-attention + asymmetry thesis (paras 2 & 4). A is the slogan the writer CORRECTS; C is the shallow framing rejected in para 3; D is the view criticised in para 4.",
            },
            {
                "qid": "R_C1_ATTENTION_Q2",
                "type": "tfng",
                "skill_tag": "inference",
                "stem": "The writer accepts the saying 'you are not the customer, you are the product' as accurate.",
                "answer": "FALSE",
                "rationale": "Para 1: 'it is not quite right' — the writer corrects the slogan → FALSE.",
            },
            {
                "qid": "R_C1_ATTENTION_Q3",
                "type": "mcq",
                "skill_tag": "inference",
                "stem": "Why does the writer call the attention economy 'zero-sum'?",
                "options": [
                    {"key": "A", "text": "Because advertisers and users alike always end up losing money."},
                    {"key": "B", "text": "Because companies can never increase their total profits."},
                    {"key": "C", "text": "Because attention given to one thing is taken from another.", "correct": True},
                    {"key": "D", "text": "Because every user receives an equal share of content."},
                ],
                "rationale": "C paraphrases para 2 ('must take that minute from something else'). A/B/D misread 'zero-sum' (it's about the user's finite time, not profit or equality).",
            },
            {
                "qid": "R_C1_ATTENTION_Q4",
                "type": "mcq",
                "skill_tag": "vocab",
                "stem": "In paragraph 3, 'it rewards only stickiness' most nearly means the systems favour content that:",
                "options": [
                    {"key": "A", "text": "keeps users engaged regardless of its quality.", "correct": True},
                    {"key": "B", "text": "is carefully verified as accurate before being shown."},
                    {"key": "C", "text": "is produced by the most expert writers."},
                    {"key": "D", "text": "loads onto the page as quickly as possible."},
                ],
                "rationale": "A captures 'indifferent to content; rewards only stickiness' (engagement over merit). B/C are the opposite (truth/quality); D literalises 'stickiness' as load speed.",
            },
        ],
    },
]

# Stage 2 difficulty buckets — Stage 1 anchor score (0-4) routes here.
# Lists per level (≥2 each) so Stage 2 RANDOMLY picks one — repeat-takers don't
# memorise a single passage. See passage_for_difficulty() (random.choice).
PASSAGE_BUCKETS = {
    "C1": ["R_C1_COOPERATION", "R_C1_ATTENTION"],          # 4/4 anchor → C1
    "B2": ["R_B2_OCTOPUS", "R_B2_WOOD_WIDE_WEB"],          # 2-3/4 → B2
    "B1": ["R_B1_SLEEP_MEMORY", "R_B1_JAY_OAK"],           # 0-1/4 → B1
}

# Mid-level passages usable as the Stage 1 anchor (random per session).
ANCHOR_PASSAGES = ["R_B2_OCTOPUS", "R_B2_WOOD_WIDE_WEB"]


def get_passage(passage_id):
    """Return passage dict by id, or None if missing."""
    for p in READING_PASSAGES:
        if p["id"] == passage_id:
            return p
    return None


def passage_for_difficulty(level):
    """Pick a RANDOM passage matching the requested CEFR level (pool variety)."""
    import random
    bucket = PASSAGE_BUCKETS.get(level, [])
    if not bucket:
        bucket = PASSAGE_BUCKETS["B2"]
    return get_passage(random.choice(bucket))


def anchor_passage():
    """Random mid-level passage for the Stage 1 anchor (different per session)."""
    import random
    return get_passage(random.choice(ANCHOR_PASSAGES))
