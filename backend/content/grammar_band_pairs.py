"""
Advanced Mastery Course — grammar band-pair reference content.

Authored 2026-05-09 by Chris (senior IELTS teacher persona) to replace the
generic "technology in education" fallback that was leaking onto every
lesson regardless of topic. Every pair is hand-written so that:

  * Both sentences express the SAME core idea (so the student can see
    structural lift, not topic drift)
  * The Band 5.5 example is realistic for a low-to-mid B2 candidate —
    correct but plain, often a coordinated clause or a basic conditional
  * The Band 7.5+ example DEMONSTRATES the lesson's specific grammar
    feature on the module's specific topic. No off-topic, no off-feature
  * Chris's coach note explains in plain English what was lifted and why
    examiners reward it — one sentence, no jargon

Schema, per module:
    {
        "module_number": int,
        "band_55_example": str,
        "band_75_example": str,
        "coach_note": str,   # signed "— Chris" by the renderer
    }

The module index follows the existing 20-module ordering in
seed_advanced_mastery_complete.py, identified by `module_number`.
"""

GRAMMAR_BAND_PAIRS = [
    {
        "module_number": 1,
        # Topic: Technology & Ethics  |  Feature: Nominalisation & Cleft Sentences
        "band_55_example": (
            "Many people use AI in their jobs now, and this is changing the way we work. "
            "Some workers are losing their jobs because of it."
        ),
        "band_75_example": (
            "What is reshaping the modern workplace is the rapid integration of artificial "
            "intelligence; this widespread adoption has, in many sectors, precipitated "
            "significant occupational displacement."
        ),
        "coach_note": (
            "The 7.5+ sentence opens with a cleft — 'What is reshaping…' — then nominalises "
            "'use' and 'losing jobs' into 'integration' and 'displacement'. Two moves, one "
            "lift in lexical resource and grammatical range."
        ),
    },
    {
        "module_number": 2,
        # Topic: Environment  |  Feature: Conditional Complexity
        "band_55_example": (
            "If countries don't reduce pollution, the climate will get worse and many "
            "animals will die."
        ),
        "band_75_example": (
            "Were nations to disregard the mounting scientific evidence, the climate crisis "
            "would, in all probability, escalate to a point at which numerous species face "
            "imminent extinction."
        ),
        "coach_note": (
            "We've moved from a basic first conditional ('If countries don't…') to an "
            "inverted second conditional ('Were nations to…'). Same future hypothetical — "
            "but the inversion plus 'in all probability' signals exactly the structural "
            "range and hedging the Band 7+ rubric rewards."
        ),
    },
    {
        "module_number": 3,
        # Topic: Education  |  Feature: Complex Noun Phrases
        "band_55_example": (
            "Schools today teach students differently. Teachers don't only give information; "
            "they also help students think for themselves."
        ),
        "band_75_example": (
            "The contemporary shift in pedagogical practice — from the unilateral transmission "
            "of information to the cultivation of independent critical thought — has "
            "fundamentally redefined the role of the teacher."
        ),
        "coach_note": (
            "Three short sentences become one elegant sentence with two complex noun phrases "
            "and an em-dash apposition. Density is what separates 5.5 from 7.5 here, not "
            "long words."
        ),
    },
    {
        "module_number": 4,
        # Topic: Globalisation  |  Feature: Negative Inversion for Emphasis
        "band_55_example": (
            "Globalisation helps countries trade more, and people can also learn about other "
            "cultures more easily."
        ),
        "band_75_example": (
            "Not only has globalisation accelerated international trade, but it has also "
            "enabled an unprecedented cross-pollination of cultural ideas and values."
        ),
        "coach_note": (
            "'Not only has… but it has also…' is the textbook negative-inversion pattern. "
            "Use it once at a key turn in your argument and the examiner instantly hears "
            "Band 7+."
        ),
    },
    {
        "module_number": 5,
        # Topic: Health & Public Policy  |  Feature: Concessive Clauses & Subjunctive
        "band_55_example": (
            "Exercise is good for health, but many people are too busy to do it every day."
        ),
        "band_75_example": (
            "Notwithstanding the well-documented benefits of regular physical activity, "
            "public-health authorities continue to recommend that consistent exercise be "
            "integrated into the structured demands of contemporary working life."
        ),
        "coach_note": (
            "Two moves in one sentence: 'Notwithstanding' is a high-end concessive opener, "
            "and 'recommend that exercise be integrated' uses the present subjunctive — note "
            "the bare form 'be', not 'is'. Concessive + subjunctive in the same line is a "
            "reliable Band 7.5 signature."
        ),
    },
    {
        "module_number": 6,
        # Topic: Crime / Justice  |  Feature: Reduced Relative Clauses
        "band_55_example": (
            "Prisoners who are released from jail often have problems finding work, and this "
            "can lead them back to crime."
        ),
        "band_75_example": (
            "Offenders released from custody frequently encounter substantial barriers to "
            "employment — a circumstance widely acknowledged as a significant driver of "
            "recidivism."
        ),
        "coach_note": (
            "'Who are released' has been reduced to the participial phrase 'released from "
            "custody'. Same grammar work, fewer words, more academic feel — that's the "
            "essence of a reduced relative clause."
        ),
    },
    {
        "module_number": 7,
        # Topic: Media  |  Feature: Participle Clauses
        "band_55_example": (
            "Big media companies control the news, and because of this they can change what "
            "people think about important issues."
        ),
        "band_75_example": (
            "Controlled by a handful of multinational conglomerates, much of contemporary "
            "media wields the power to shape public discourse on issues of national and "
            "global importance."
        ),
        "coach_note": (
            "Starting with a past-participle clause — 'Controlled by…' — places the cause "
            "before the effect with no extra connectors. It's one of the most reliable "
            "ways to lift a flat sentence into Band 7+."
        ),
    },
    {
        "module_number": 8,
        # Topic: Government / Economy / Wealth  |  Feature: Agentless Passive
        "band_55_example": (
            "The government should make rich people pay more tax. This will help poor people "
            "have a better life."
        ),
        "band_75_example": (
            "It is widely argued that wealth ought to be redistributed through more "
            "progressive tax frameworks in order to alleviate entrenched socio-economic "
            "inequality."
        ),
        "coach_note": (
            "Agentless passive ('It is widely argued', 'wealth ought to be redistributed') "
            "depersonalises the claim and places focus on the action rather than the actor "
            "— exactly the academic register Task 2 rewards."
        ),
    },
    {
        "module_number": 9,
        # Topic: Urbanisation  |  Feature: Nominalization for Academic Precision
        "band_55_example": (
            "When cities grow too quickly, many social problems happen and the quality of "
            "life often gets worse."
        ),
        "band_75_example": (
            "The unchecked expansion of urban centres frequently precipitates a range of "
            "socio-economic complications and a marked deterioration in residents' quality "
            "of life."
        ),
        "coach_note": (
            "'Cities grow too quickly' has become 'unchecked expansion'; 'problems happen' "
            "has become 'precipitates complications'. Verbs turn into nouns — that's "
            "nominalisation, and it densifies your message without adding length."
        ),
    },
    {
        "module_number": 10,
        # Topic: Science / Biomedical Ethics  |  Feature: Advanced Modals & Hedging
        "band_55_example": (
            "Science will solve our health problems in the future, but only if we use it "
            "carefully."
        ),
        "band_75_example": (
            "It is conceivable that scientific innovation could, in the longer term, "
            "mitigate many of the public-health challenges currently confronting modern "
            "societies — provided that ethical safeguards are rigorously observed."
        ),
        "coach_note": (
            "'Will' is an absolute claim; 'It is conceivable that … could … in the longer "
            "term' is hedged. Examiners reward hedging because it shows nuanced thinking, "
            "not weakness."
        ),
    },
    {
        "module_number": 11,
        # Topic: Public Transport  |  Feature: Cleft Sentences for Emphasis
        "band_55_example": (
            "Governments need to spend money on trains. This will help to reduce pollution "
            "in cities."
        ),
        "band_75_example": (
            "It is sustained investment in rail infrastructure that will ultimately deliver "
            "meaningful reductions in urban carbon emissions."
        ),
        "coach_note": (
            "An 'It is X that Y' cleft puts the spotlight precisely on your strongest noun "
            "phrase. Use it once per essay to highlight your central claim — overuse and "
            "it becomes theatrical."
        ),
    },
    {
        "module_number": 12,
        # Topic: Work / Labor Market  |  Feature: Mixed Conditionals
        "band_55_example": (
            "If governments help people learn new skills, they will not lose their jobs to "
            "robots."
        ),
        "band_75_example": (
            "If governments had invested in vocational re-skilling a decade ago, the "
            "workforce would not be facing today's wave of automation-driven redundancies "
            "so unprepared."
        ),
        "coach_note": (
            "A mixed conditional — past 'if' clause ('had invested') paired with a present "
            "result ('would not be facing today') — says 'I can think across timeframes', "
            "and that's exactly what Band 7.5+ Task 2 demands."
        ),
    },
    {
        "module_number": 13,
        # Topic: Demographics / Generational Equity  |  Feature: Adverbial Inversion ('Only by…')
        "band_55_example": (
            "The government must spend more on care for old people, and they should also "
            "raise the retirement age."
        ),
        "band_75_example": (
            "Only by simultaneously expanding fiscal provision for elderly care and "
            "recalibrating the statutory retirement age can the state hope to absorb the "
            "demographic strain of an ageing population."
        ),
        "coach_note": (
            "'Only by + -ing… can S V' is an adverbial inversion that bundles two policy "
            "actions into one tight subject. Stack two parallel gerunds inside it — here "
            "'expanding' and 'recalibrating' — and you demonstrate range without overpacking "
            "the line."
        ),
    },
    {
        "module_number": 14,
        # Topic: Education / Pedagogy  |  Feature: Clausal Subjects & Parallelism
        "band_55_example": (
            "Students need to learn how to solve problems, not just remember facts."
        ),
        "band_75_example": (
            "That students should be equipped with critical problem-solving skills — rather "
            "than merely memorise prescribed content — is now widely regarded as the "
            "central tenet of progressive pedagogy."
        ),
        "coach_note": (
            "A clausal subject ('That students should be equipped…') puts a whole idea in "
            "the subject slot. The parallel verbs 'be equipped' / 'memorise' mirror each "
            "other, which is what makes the contrast click."
        ),
    },
    {
        "module_number": 15,
        # Topic: Globalisation / Cultural Homogenisation  |  Feature: Inverted Conditionals
        "band_55_example": (
            "If governments don't protect local cultures, traditions will disappear because "
            "of globalisation."
        ),
        "band_75_example": (
            "Should governments fail to enact protective cultural legislation, local "
            "traditions will, in all probability, succumb to the homogenising forces of "
            "global commerce."
        ),
        "coach_note": (
            "'Should governments fail…' is the inverted conditional — same meaning as 'If "
            "governments don't', more formal register. It's one of the highest-leverage "
            "single swaps you can make in an essay."
        ),
    },
    {
        "module_number": 16,
        # Topic: Environment / Ecology  |  Feature: Complex Prepositional Phrases
        "band_55_example": (
            "The environment is being destroyed because companies want to make as much "
            "money as possible."
        ),
        "band_75_example": (
            "In the relentless pursuit of short-term profit, many corporations have, at "
            "considerable ecological cost, prioritised expansion over environmental "
            "stewardship."
        ),
        "coach_note": (
            "Three precise prepositional phrases — 'In the pursuit of…', 'at considerable "
            "cost', 'over… stewardship' — turn a flat sentence into a textured one. Stack "
            "them, don't scatter them."
        ),
    },
    {
        "module_number": 17,
        # Topic: Crime / Justice / Reintegration  |  Feature: The Subjunctive Mood
        "band_55_example": (
            "It is important that prisons help criminals become better people, not just "
            "punish them."
        ),
        "band_75_example": (
            "It is imperative that the state ensure correctional facilities prioritise "
            "rehabilitation over mere retribution — the long-term cost of recidivism is "
            "borne by society as a whole."
        ),
        "coach_note": (
            "After 'It is imperative that…' the verb stays in the bare form ('the state "
            "ensure', not 'ensures'). That's the present subjunctive — quiet, but a "
            "reliable marker of advanced grammar."
        ),
    },
    {
        "module_number": 18,
        # Topic: Public Health  |  Feature: Advanced Concessive Clauses
        "band_55_example": (
            "Smoking is bad for health, but adults should be allowed to choose what they do."
        ),
        "band_75_example": (
            "Granted that smoking poses irrefutable risks to public health, many would "
            "nevertheless contend that the state ought not to infringe upon an individual's "
            "right to make autonomous lifestyle choices."
        ),
        "coach_note": (
            "'Granted that…' concedes the opposing view in a single phrase; pairing it with "
            "'nevertheless' inside the main clause sharpens the pivot to your own position. "
            "It's a more academic alternative to a flat 'Although' opener."
        ),
    },
    {
        "module_number": 19,
        # Topic: Media / Journalism  |  Feature: Fronting for Emphasis
        "band_55_example": (
            "Fake news is more dangerous now than it was before, especially during elections."
        ),
        "band_75_example": (
            "Never before has the threat of misinformation been so corrosive to the "
            "democratic process, particularly during periods of national election."
        ),
        "coach_note": (
            "Fronting a negative phrase ('Never before') forces inversion ('has the threat'), "
            "and the sentence carries new weight. Use it sparingly — once per essay is "
            "enough for impact."
        ),
    },
    {
        "module_number": 20,
        # Topic: Tourism / Cultural Heritage  |  Feature: Participle Clauses
        "band_55_example": (
            "Many tourists go to historical places, but they only take photos and don't "
            "learn about the history."
        ),
        "band_75_example": (
            "Drawn to historical sites by social-media imagery, many travellers focus "
            "narrowly on photography while neglecting any meaningful engagement with the "
            "cultural heritage of the location."
        ),
        "coach_note": (
            "An opening past-participle phrase ('Drawn to…') signals straight away that you "
            "can vary your sentence openings — a quiet but consistent Band 7+ marker, and "
            "easy to slot into Task 2 introductions."
        ),
    },
]


def get_pair_for_module(module_number: int):
    """Return the pair dict for a given module_number, or None if missing."""
    for pair in GRAMMAR_BAND_PAIRS:
        if pair["module_number"] == module_number:
            return pair
    return None
