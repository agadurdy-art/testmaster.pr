// Writing helper static content — pre-written pedagogical blurbs surfaced
// inside the floating Liz helper panel during writing practice.
//
// Two button kinds are static (zero LLM cost, served from this module):
//   - structure: "Band 7+ structure for X essays" — paragraph-by-paragraph
//     scaffold tuned to the IELTS Task Response descriptor.
//   - pitfall:   "Common pitfalls" — what examiners actually penalize at
//     band 6 vs reward at band 7+, written from a real IELTS examiner lens.
//
// Dynamic buttons (Unpack the question / Ideas to explore / Phrases for
// this moment / Polish this sentence) are NOT in this file — they hit a
// Haiku-backed endpoint added in Phase 2. Keeping static + dynamic split
// in separate places lets us ship the panel with zero LLM dependency.
//
// Taxonomy keys: `${taskType}_${subtype}`
//   taskType: 'task2'  (task1_academic + task1_general added in Phase 2)
//   subtype:  matches WritingTask2Practice essayTypes ids → opinion,
//             discussion, advantage_disadvantage, problem_solution, two_part

export const HELPER_CONTENT = {
  task2_opinion: {
    structure: {
      title: 'Band 7+ structure — Opinion essay',
      sections: [
        {
          heading: 'Introduction (~50 words)',
          body: 'Paraphrase the question in one sentence, then state your clear position in a second sentence. Do not list your reasons here — examiners want a thesis, not a roadmap.',
        },
        {
          heading: 'Body 1 (~100 words)',
          body: 'Lead with your strongest reason. Topic sentence → explanation → one specific example or piece of evidence → one sentence tying back to your thesis.',
        },
        {
          heading: 'Body 2 (~100 words)',
          body: 'Either a second supporting reason, OR — for a higher Coherence score — concede the opposing view briefly and then refute it. The concession move signals balanced thinking.',
        },
        {
          heading: 'Conclusion (~40 words)',
          body: 'Restate your position in fresh words and close with one forward-looking sentence. No new arguments. Aim for 280–310 words total; below 250 triggers an under-length penalty.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Opinion essay',
      items: [
        '“I partly agree and partly disagree.” Sitting on the fence costs you marks under Task Response — examiners need a clear stance.',
        'Listing three reasons with one sentence each. Two well-developed reasons score higher than three surface-level ones.',
        'Generic conclusions like “in conclusion this is a complex issue.” Examiners notice — say something specific.',
        'Memorised openers (“It is widely accepted that nowadays…”). In 2026 these phrases ceiling you at band 6.0.',
        'Using “I think / I believe” in every body paragraph. Keep first-person mostly in intro and conclusion; bodies are evidence-driven.',
      ],
    },
  },

  task2_discussion: {
    structure: {
      title: 'Band 7+ structure — Discussion essay (both views)',
      sections: [
        {
          heading: 'Introduction (~50 words)',
          body: 'Paraphrase the topic. Signal that you will discuss both views. Briefly indicate your own opinion — do not bury it for the conclusion only.',
        },
        {
          heading: 'Body 1 (~100 words)',
          body: 'Present the first view fully and fairly, even if it is not yours. Topic sentence + explanation + concrete example. Reasoning, not dismissal.',
        },
        {
          heading: 'Body 2 (~100 words)',
          body: 'Present the second view with equal depth. Imbalanced bodies (one developed, one half-baked) drop Task Response.',
        },
        {
          heading: 'Conclusion (~40 words)',
          body: 'State YOUR opinion clearly with brief reasoning. This essay type lives or dies by a committed conclusion. Aim 280–310 words.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Discussion essay',
      items: [
        'Forgetting to give your own opinion. The prompt always ends “…and give your own opinion” — missing it caps Task Response at band 5.',
        'Treating it like an opinion essay. Leading with your view in Body 1 unbalances the discussion.',
        'Strawmanning the view you disagree with. Present both fairly even if one is yours.',
        'Repeating “On the one hand… on the other hand…” twice. Vary cohesion devices or your Coherence band drops.',
        'Hedging in the conclusion to avoid commitment. Pick a side, even a partial one.',
      ],
    },
  },

  task2_advantage_disadvantage: {
    structure: {
      title: 'Band 7+ structure — Advantages/Disadvantages essay',
      sections: [
        {
          heading: 'Introduction (~50 words)',
          body: 'Paraphrase the topic. If the prompt asks whether advantages outweigh disadvantages, state your answer here — do not save it for the conclusion.',
        },
        {
          heading: 'Body 1 (~100 words)',
          body: 'One or two main advantages with full development. Quality beats quantity — one well-explained advantage with a concrete example outscores three listed in passing.',
        },
        {
          heading: 'Body 2 (~100 words)',
          body: 'One or two main disadvantages with the same depth. Use different examples than Body 1 — repeating the same domain looks thin.',
        },
        {
          heading: 'Conclusion (~40 words)',
          body: 'Direct answer to “do advantages outweigh disadvantages?” — never “it depends.” Restate the verdict and close. Aim 280–310 words.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Advantages/Disadvantages essay',
      items: [
        'Listing 4 advantages and 4 disadvantages, each in one sentence. Surface-level — examiners want depth, not bullet points.',
        'Forgetting which side outweighs in the conclusion when the prompt asks.',
        'Using the same example for advantages and disadvantages — repetition is noticed.',
        'Listing format: “the benefits are X, Y, Z and the drawbacks are A, B, C.” That is enumeration, not analysis.',
        'Treating an “advantages outweigh disadvantages” prompt as a balanced essay. Read the prompt twice — the verb matters.',
      ],
    },
  },

  task2_problem_solution: {
    structure: {
      title: 'Band 7+ structure — Problems/Solutions essay',
      sections: [
        {
          heading: 'Introduction (~50 words)',
          body: 'Paraphrase the problem area. Briefly signal that causes/problems and solutions follow. Do not list them here.',
        },
        {
          heading: 'Body 1 (~100 words)',
          body: 'Causes or specific problems. Be concrete: “Air pollution contributes to 200 million asthma cases globally” beats “pollution is bad for health.”',
        },
        {
          heading: 'Body 2 (~100 words)',
          body: 'Solutions, each matched to a problem you raised. Realistic and specific — who acts (government / individuals / industry) and how.',
        },
        {
          heading: 'Conclusion (~40 words)',
          body: 'Synthesize: these solutions are achievable but require sustained multi-stakeholder action, etc. No new ideas. Aim 280–310 words.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Problems/Solutions essay',
      items: [
        'Vague solutions: “people should be more aware.” Non-actionable answers tank Task Response.',
        'Mismatched pairs: solving a problem you never raised. Each solution should land on a problem from Body 1.',
        'Only one shallow solution to a multi-faceted problem. Examiners want depth and breadth together.',
        'Blaming everything on “the government.” Sophisticated essays distribute responsibility across actors.',
        'Skipping the problems half — assuming solutions are enough. The prompt has two halves; answer both.',
      ],
    },
  },

  task2_two_part: {
    structure: {
      title: 'Band 7+ structure — Two-part question essay',
      sections: [
        {
          heading: 'Introduction (~50 words)',
          body: 'Paraphrase. Acknowledge there are TWO questions and signal you will answer both. Brief preview, no answers yet.',
        },
        {
          heading: 'Body 1 (~100 words)',
          body: 'Answer Question 1 fully. Topic sentence + explanation + concrete example. Treat it as if it were the only question.',
        },
        {
          heading: 'Body 2 (~100 words)',
          body: 'Answer Question 2 with the same depth. Equal weight is essential — partial answers cap Task Response at 5.',
        },
        {
          heading: 'Conclusion (~40 words)',
          body: 'Synthesize the answers to both questions. Do not introduce new ideas. Aim 280–310 words.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Two-part question essay',
      items: [
        'Answering one question deeply and the other in passing — equal weight is required.',
        'Conflating the two questions so the bodies blur into each other.',
        'Missing the second question entirely, especially when phrased as “Why? And how can it be addressed?”',
        'Treating it as an opinion or discussion essay. The prompt’s two-question structure dictates the format.',
        'Restating the question instead of answering it. Each body must give a substantive position.',
      ],
    },
  },
};

// ─── Task 1 Academic — chart/diagram subtypes ─────────────────────────────
// Less verbose than the Task 2 entries above because Task 1 students need
// pattern-recognition cues, not philosophical guidance. Each section is one
// or two sentences. Subtype ids match WritingTask1Practice.visualTypes.

HELPER_CONTENT.task1_academic_line_graph = {
  structure: {
    title: 'Band 7+ structure — Line graph',
    sections: [
      {
        heading: 'Introduction (~25 words)',
        body: 'Paraphrase the chart caption: what is shown, where, between which years. Do not give numbers yet.',
      },
      {
        heading: 'Overview (~40 words)',
        body: 'Two or three sentences capturing the OVERALL trend. No specific data — just the big picture (rising / falling / fluctuating, which line is highest overall).',
      },
      {
        heading: 'Body 1 (~50 words)',
        body: 'Detailed description of the most prominent feature with specific numbers and timeframes.',
      },
      {
        heading: 'Body 2 (~45 words)',
        body: 'Detailed description of the second feature or contrasting line, with comparisons.',
      },
      {
        heading: 'Length',
        body: 'Aim 160–180 words. The Overview is non-negotiable — missing it caps Task Achievement at 5.',
      },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Line graph',
    items: [
      'Skipping the overview, or burying it inside body paragraphs. Examiners look for it explicitly.',
      'Describing every single data point. Selectivity is the skill — pick what matters.',
      'Generic vocabulary: "went up", "went down". Use band-7+ verbs: rose steadily, plummeted, plateaued, fluctuated.',
      'Confusing tense: chart shows past data → use past tense. Future projections → conditional or future.',
      'Personal opinion or causation ("this is because…"). Task 1 is description only.',
    ],
  },
};

HELPER_CONTENT.task1_academic_bar_chart = {
  structure: {
    title: 'Band 7+ structure — Bar chart',
    sections: [
      { heading: 'Introduction (~25 words)', body: 'Paraphrase the caption — what is compared, by which categories.' },
      { heading: 'Overview (~40 words)', body: 'Two or three sentences naming the highest, lowest, and any obvious patterns. No specific numbers yet.' },
      { heading: 'Body 1 (~50 words)', body: 'Detailed description of the largest categories or the dominant pattern with specific figures.' },
      { heading: 'Body 2 (~45 words)', body: 'Smaller categories, contrasts, or anomalies with figures.' },
      { heading: 'Length', body: 'Aim 160–180 words. Group similar bars together — do not march through them one by one.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Bar chart',
    items: [
      'Listing each bar in isolation: "X is 30%, Y is 25%, Z is 20%…" Group and compare.',
      'No overview, or an overview that is just a number list.',
      'Missing comparison language: "considerably higher", "nearly double", "roughly equal".',
      'Mixing units (percentages vs absolute numbers) without flagging it.',
      'Trying to explain why the differences exist. Task 1 is description only.',
    ],
  },
};

HELPER_CONTENT.task1_academic_pie_chart = {
  structure: {
    title: 'Band 7+ structure — Pie chart',
    sections: [
      { heading: 'Introduction (~25 words)', body: 'Paraphrase the caption — what proportions are shown.' },
      { heading: 'Overview (~40 words)', body: 'Largest segment, smallest segment, any obvious dominance or balance. No exact percentages here.' },
      { heading: 'Body 1 (~50 words)', body: 'Largest segments with specific percentages and comparisons. Group similar slices.' },
      { heading: 'Body 2 (~45 words)', body: 'Smaller segments, with fraction language (a quarter, a fifth, less than a tenth).' },
      { heading: 'Length', body: 'Aim 160–180 words. If two pie charts, compare across them in every body paragraph.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Pie chart',
    items: [
      'Reading every segment in order — not selective enough.',
      'Always saying "percent" — mix with fraction language ("just under a quarter", "approximately half").',
      'Missing the comparison when two pie charts are shown.',
      'Treating tiny segments as if they matter equally to the largest one.',
      'Forgetting that proportions must add to 100% — if your description implies otherwise, recheck.',
    ],
  },
};

HELPER_CONTENT.task1_academic_table = {
  structure: {
    title: 'Band 7+ structure — Table',
    sections: [
      { heading: 'Introduction (~25 words)', body: 'Paraphrase what the table compares, across which categories or years.' },
      { heading: 'Overview (~40 words)', body: 'Highest and lowest figures across rows AND columns, plus any obvious pattern.' },
      { heading: 'Body 1 (~50 words)', body: 'Row-based or column-based pattern with specific figures.' },
      { heading: 'Body 2 (~45 words)', body: 'A second pattern, contrast, or trend with figures.' },
      { heading: 'Length', body: 'Aim 160–180 words. Tables tempt you to list — resist; group and compare.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Table',
    items: [
      'Reading down each column or across each row in turn — looks like data dictation.',
      'Missing patterns that span both axes.',
      'Quoting every number. Be selective — pick the figures that drive the comparison.',
      'No overview, or an overview that is just one row.',
      'Incorrect rounding: "10%" when it is 9.7% — rounding is fine but be consistent.',
    ],
  },
};

HELPER_CONTENT.task1_academic_process = {
  structure: {
    title: 'Band 7+ structure — Process diagram',
    sections: [
      { heading: 'Introduction (~25 words)', body: 'Paraphrase what process is shown. State the number of stages.' },
      { heading: 'Overview (~40 words)', body: 'Where the process starts and ends, whether it is cyclical or linear, and the broad phases.' },
      { heading: 'Body 1 (~55 words)', body: 'First half of stages with sequencing words and passive voice ("the materials are collected, then…").' },
      { heading: 'Body 2 (~55 words)', body: 'Second half through to the end, with sequencing language and any branches.' },
      { heading: 'Length', body: 'Aim 170–190 words. Process essays tend to run shorter — flesh out each stage with one detail.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Process diagram',
    items: [
      'Active voice everywhere ("workers collect…"). Use passive: "the materials are collected".',
      'No sequencing words — "first / next / subsequently / finally" carry the structure.',
      'Skipping the overview (number of stages, start/end, cyclical?).',
      'Adding causation or opinion. Describe what happens, not why.',
      'Cramming all stages into one paragraph. Split into two body paragraphs.',
    ],
  },
};

HELPER_CONTENT.task1_academic_map = {
  structure: {
    title: 'Band 7+ structure — Map / change over time',
    sections: [
      { heading: 'Introduction (~25 words)', body: 'Paraphrase the caption: which area, which two time periods.' },
      { heading: 'Overview (~40 words)', body: 'Has the area become more developed/residential/industrial? Are there major additions or removals overall?' },
      { heading: 'Body 1 (~55 words)', body: 'Either chronological (then → now) or geographical (north → south) — pick one and stick with it.' },
      { heading: 'Body 2 (~55 words)', body: 'Continue with the contrasting half. Use directional language: "to the north of", "adjacent to", "in place of".' },
      { heading: 'Length', body: 'Aim 170–190 words. Compare the two maps in EVERY body paragraph, not just at the start.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Map essay',
    items: [
      'Describing one map fully, then the other. Compare in every paragraph.',
      'Using cardinal directions vaguely ("over there", "above"). Use "to the north", "in the south-east".',
      'Mixing tenses: past for the old map, present/past for the new — be deliberate.',
      'Listing every building. Be selective — focus on significant changes.',
      'Adding speculation about why things changed. Description only.',
    ],
  },
};

// ─── Task 1 General Training — letter subtypes ───────────────────────────

HELPER_CONTENT.task1_general_formal = {
  structure: {
    title: 'Band 7+ structure — Formal letter',
    sections: [
      { heading: 'Salutation', body: '"Dear Sir or Madam," (recipient unknown) or "Dear Mr/Ms [Surname],"' },
      { heading: 'Opening (~25 words)', body: 'Clear statement of purpose: "I am writing to apply for…" / "I am writing to express my concern about…"' },
      { heading: 'Body — three paragraphs', body: 'One per bullet point in the prompt. Specific, concise, formal register.' },
      { heading: 'Closing (~20 words)', body: 'Polite call to action: "I would appreciate a prompt response." Plus: "Yours faithfully" (if "Dear Sir/Madam") or "Yours sincerely" (if named).' },
      { heading: 'Length', body: 'Aim 160–180 words. All three bullet points must be addressed — missing one caps Task Achievement.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Formal letter',
    items: [
      'Mixing registers: "I am writing… and btw…". Stay formal throughout.',
      'Wrong sign-off pairing: "Dear Sir or Madam" + "Yours sincerely" is incorrect.',
      'Skipping a bullet point or addressing it in one sentence.',
      'Contractions ("I\'m", "don\'t"). In formal writing, write them out.',
      'Vague phrasing: "I had some issues." Be specific about what happened.',
    ],
  },
};

HELPER_CONTENT.task1_general_semi_formal = {
  structure: {
    title: 'Band 7+ structure — Semi-formal letter',
    sections: [
      { heading: 'Salutation', body: '"Dear [Title + Surname]," — e.g. "Dear Dr Roberts," or "Dear Mr Tan,"' },
      { heading: 'Opening (~25 words)', body: 'Friendly but professional: "I hope this letter finds you well. I am writing because…"' },
      { heading: 'Body — three paragraphs', body: 'Each bullet point covered. Tone: respectful, but a real person on the other side, not a department.' },
      { heading: 'Closing (~20 words)', body: 'Warm but polite: "Thank you for your understanding." Sign-off: "Kind regards," or "Best regards,"' },
      { heading: 'Length', body: 'Aim 160–180 words.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Semi-formal letter',
    items: [
      'Going too casual: "Hey Dr Roberts!" Stay respectful.',
      'Going too stiff: "Dear Sir or Madam" when you know the person.',
      'Ignoring the relationship signalled by the prompt (landlord, neighbour, manager).',
      'Skipping a bullet or breezing past it.',
      'Closing with "Yours faithfully" — that pairs with unknown recipients only.',
    ],
  },
};

HELPER_CONTENT.task1_general_informal = {
  structure: {
    title: 'Band 7+ structure — Informal letter',
    sections: [
      { heading: 'Salutation', body: '"Dear [First name]," or "Hi [First name]," — friend, family.' },
      { heading: 'Opening (~25 words)', body: 'Warm and natural: "It was great to hear from you!" or "How are you? It\'s been a while…"' },
      { heading: 'Body — three paragraphs', body: 'One per bullet, conversational tone. Contractions OK ("I\'ll", "you\'re"). Personal voice.' },
      { heading: 'Closing (~20 words)', body: '"Looking forward to hearing from you soon!" or "Take care!". Sign-off: "Love," / "Best wishes," / "Cheers,"' },
      { heading: 'Length', body: 'Aim 160–180 words. Informal does not mean unstructured — still cover all three bullets.' },
    ],
  },
  pitfall: {
    title: 'Common pitfalls — Informal letter',
    items: [
      'Sounding like a formal letter despite the prompt asking for a friend. Match the relationship.',
      'No contractions or natural phrasing — sounds robotic.',
      'Slang or text-speak: "lol", "u", "thx". Informal is not unprofessional.',
      'Skipping the warm opener and going straight to business.',
      'Skipping a bullet because it feels minor.',
    ],
  },
};

// ─── Subtype aliases — older pages use slightly different ids ───────────
// e.g. WritingPractice general surface uses 'agree_disagree' where the
// dropdown-driven WritingTask2Practice uses 'opinion'. Map them so both
// surfaces hit the same content blocks.
const SUBTYPE_ALIASES = {
  agree_disagree: 'opinion',
  advantages_disadvantages: 'advantage_disadvantage',
  bar_graph: 'bar_chart',
};

// Default fallback when subtype is missing or unrecognised — opinion is the
// most common Task 2 type, so it is the safest default.
const FALLBACK = HELPER_CONTENT.task2_opinion;

/**
 * Resolve helper content for a given task + subtype combination.
 *
 * @param {string} taskType  e.g. 'task2', 'task1_academic', 'task1_general'
 * @param {string} subtype   essay/chart/letter subtype id
 * @returns {{ structure: object, pitfall: object }}
 */
export function getHelperContent(taskType, subtype) {
  if (!taskType) return FALLBACK;
  if (!subtype) {
    // Reasonable defaults per task type so the panel still shows something
    // when the page hasn't yet picked a subtype.
    if (taskType === 'task1_academic') return HELPER_CONTENT.task1_academic_line_graph;
    if (taskType === 'task1_general') return HELPER_CONTENT.task1_general_formal;
    return FALLBACK;
  }
  const resolved = SUBTYPE_ALIASES[subtype] || subtype;
  return HELPER_CONTENT[`${taskType}_${resolved}`] || FALLBACK;
}
