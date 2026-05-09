// Writing Learn — kademeli (graduated) micro-lessons surfaced inside the
// writing practice flow (NOT inside Strategies). The user starts at Lesson 1
// and works through; each lesson is ~150 words + one before/after example +
// one self-check. Designed to be read in 60–90 seconds so it does not break
// the writing momentum.
//
// Why inside the writing flow (vs Strategies tab):
//   The student is already on the writing surface, mid-task. Sending them
//   to /tips makes them context-switch and most never come back. A Learn
//   drawer next to the prompt keeps the lesson and the actual practice in
//   the same screen.
//
// Stored client-side as static data — zero backend cost, instant load.

export const WRITING_LESSONS = [
  {
    id: 'l01_anatomy',
    title: 'Anatomy of a Task 2 question',
    minutes: 1,
    chapter: 1,
    summary:
      'Every Task 2 prompt has 3 parts: the statement, the instruction verb, and the scope. Mistaking which is which is the #1 cause of off-topic answers — and the largest single penalty under Task Response.',
    body:
      'Treat each prompt like a tiny contract. Underline the statement (what is being claimed), circle the instruction verb (discuss / agree / suggest causes), and bracket the scope (which group, which place, which time-frame). If your essay does not directly answer the verb on the bracketed scope, the band ceiling is 6.0 — even with band-8 grammar.',
    example: {
      before:
        '"Some people think technology has improved education." Student writes: "Technology is everywhere in our lives today, from phones to cars…"',
      after:
        '"Some people think technology has improved education." Student writes: "I largely agree that technology has improved education, though its benefits depend heavily on how it is integrated…"',
    },
    selfCheck:
      'Read the prompt twice before writing one word. Can you state the verb out loud? If not, you are about to drift.',
  },
  {
    id: 'l02_paraphrase',
    title: 'Paraphrase the prompt without breaking it',
    minutes: 1,
    chapter: 2,
    summary:
      'Paraphrasing is judged under Lexical Resource. Copy-pasting the prompt is band 5; reckless synonyms ("believe" → "ascertain") is band 5.5. Controlled paraphrase — same meaning, two or three lexical swaps — is band-7 territory.',
    body:
      'Swap nouns and verbs, not function words. Keep "however / many / some" — they are too small to penalise and too risky to swap. Replace high-frequency content words ("technology" → "digital tools", "improve" → "enhance"). Keep your version shorter than the original; bloat signals memorised filler.',
    example: {
      before:
        '"Some people believe that technology has greatly improved the way we learn."',
      after:
        '"Many argue that digital tools have markedly enhanced the way we learn."',
    },
    selfCheck:
      'Highlight the nouns and main verb in the original. If you swapped 2 of them and kept the meaning, you paraphrased correctly.',
  },
  {
    id: 'l03_thesis',
    title: 'A thesis, not a roadmap',
    minutes: 1,
    chapter: 3,
    summary:
      'The introduction is judged on whether you took a clear position. "I will discuss both sides" is a roadmap, not a thesis — and it caps you at 6.0 under Task Response.',
    body:
      'A thesis answers the question. "I largely agree that X, mainly because Y." Do not list your reasons here — that belongs in body paragraphs. The examiner is looking for one sentence that locks your position. Wishy-washy hedges ("partly agree, partly disagree") are evaluated as evasion, not nuance.',
    example: {
      before:
        '"In this essay, I will discuss both views and give my opinion at the end."',
      after:
        '"While there are clear advantages to remote work, I would argue its long-term costs to collaboration outweigh them."',
    },
    selfCheck:
      'Cover the body paragraphs and reread your intro. Could a stranger predict your essay\u2019s position from the intro alone? If not, fix it.',
  },
  {
    id: 'l04_topic_sentence',
    title: 'Topic sentences examiners reward',
    minutes: 1,
    chapter: 4,
    summary:
      'A topic sentence states a claim, not a fact. "Many people use phones" is a fact. "Phone overuse is eroding focused study time in adolescents" is a claim — and a claim is what Coherence rewards.',
    body:
      'Open every body paragraph with one declarative sentence that takes a position. The rest of the paragraph defends it. Avoid "Firstly / Secondly / Lastly" as openers — they are dead weight under Coherence. Lead with the idea; signposting belongs inside the paragraph if at all.',
    example: {
      before: 'Firstly, technology helps students learn many things.',
      after:
        'The most overlooked benefit of classroom technology is the way it personalises pacing for slower learners.',
    },
    selfCheck:
      'Read your topic sentence on its own. Does it stake a position you can defend? Or is it just a heading?',
  },
  {
    id: 'l05_peel',
    title: 'PEEL — Point, Evidence, Explain, Link',
    minutes: 1,
    chapter: 5,
    summary:
      'Examiners notice when a paragraph asserts ("X is bad") without backing it. PEEL is the simplest scaffold: Point → Evidence → Explain → Link.',
    body:
      'Point: the claim (your topic sentence). Evidence: a specific example, study, or scenario — vague "in many countries" does not count. Explain: connect the evidence back to the point in your own words. Link: one sentence that ties to your thesis or transitions out. Three sentences minimum, eight maximum.',
    example: {
      before:
        'Working from home is bad for collaboration. People feel isolated. Companies should think about this.',
      after:
        'Remote work erodes spontaneous collaboration. A 2023 Microsoft study of 60,000 employees found cross-team interactions fell 25% within a year of switching to fully remote work. This matters because the casual hallway conversations that drive innovation are precisely what video calls cannot replicate. The cost, then, is not isolation in the abstract — it is a measurable drop in the kind of work hybrid models are supposed to enable.',
    },
    selfCheck:
      'Mark each sentence in your paragraph as P / E / Ex / L. Missing one of the four? That is your weakest paragraph.',
  },
  {
    id: 'l06_cohesion',
    title: 'Cohesion devices — band 6 vs band 7+',
    minutes: 1,
    chapter: 6,
    summary:
      'Stacking "Moreover, Furthermore, In addition" is a band-6 marker. Band-7+ writing uses fewer connectors and lets sentence structure carry the link.',
    body:
      'Replace 60% of your discourse markers with referential cohesion: "this trend", "such effects", "the same logic". Reserve "However" and "Therefore" for genuine pivots. The band-7 descriptor specifically penalises "overuse of cohesive devices" — examiners count them.',
    example: {
      before:
        'Moreover, technology helps students. Furthermore, it saves time. In addition, it makes lessons fun.',
      after:
        'Technology helps students learn faster, and the same tools also free up teacher time for one-on-one feedback. Lessons become more engaging as a result.',
    },
    selfCheck:
      'Count your "Moreover / Furthermore / In addition / Firstly / Secondly". More than 3 in a 250-word essay? Cut half.',
  },
  {
    id: 'l07_lexical',
    title: 'Lexical resource — precision beats impressiveness',
    minutes: 1,
    chapter: 7,
    summary:
      'Examiners reward precise common words over rare and misused ones. "Help" used precisely outscores "facilitate" used clumsily. Memorised "advanced" vocab is the fastest way to ceiling at 6.0.',
    body:
      'Aim for collocations that native speakers actually use: "raise concerns", "address the issue", "draw a distinction". Avoid thesaurus-grab synonyms — examiners can tell. Five precise mid-frequency words beat one mis-used flashy word.',
    example: {
      before:
        'Society should ameliorate the deleterious effects of pollution to engender a salubrious environment.',
      after:
        'Society should reduce the harmful effects of pollution to create a healthier environment.',
    },
    selfCheck:
      'For each unusual word in your essay: is it one you would say out loud in conversation? If not, you risked Lexical Resource for nothing.',
  },
  {
    id: 'l08_conclusion',
    title: 'A conclusion that does not just summarise',
    minutes: 1,
    chapter: 8,
    summary:
      'Recapping your three body paragraphs is band-6 work. A band-7+ conclusion restates your position in fresh words and adds one forward-looking sentence.',
    body:
      'Two sentences is enough. Sentence 1: restate your thesis using different lexis. Sentence 2: a "so what" — a recommendation, a prediction, or a reframing. Do NOT introduce new arguments — that breaks Task Response. Aim 30–45 words.',
    example: {
      before:
        'In conclusion, as I discussed above, technology has many advantages and disadvantages, and people should think carefully.',
      after:
        'Digital tools, then, have unmistakably reshaped learning — but the gains belong to schools that integrate them deliberately, not those that simply own them. The next decade will reward design over deployment.',
    },
    selfCheck:
      'Cut the words "In conclusion, to summarise". If your last paragraph still works without them, your closer is doing real work.',
  },
];

export function getLessonById(id) {
  return WRITING_LESSONS.find((l) => l.id === id) || null;
}
