/**
 * Band 6.5 · Task 2 · Technology & society — sample essay fixture.
 * Shape matches WritingEvaluationResult (features/evaluator/schemas/writingResult.js).
 * Offsets are computed from substring matches against SAMPLE_ESSAY below.
 */

export const SAMPLE_PROMPT =
  "Some people say that technology has made our lives easier, while others argue it has created more problems than it has solved. Discuss both views and give your opinion.";

export const SAMPLE_ESSAY = [
  "In today's fast-paced world, a lot of people argue that modern technology has simplified daily life, while others contend that it bring new difficulties. In my view, although certain drawbacks exist, the advantages clearly outweigh them.",
  "On the one hand, supporters of technology claim that inventions such as smartphones and the internet make things very easy. Moreover, people can now work remotely, pay bills online, and keep in touch with family members living abroad. This benefits are undeniable, particularly during the pandemic, when digital tools kept entire economies running.",
  "On the other hand, critics point out that an over-reliance on devices has caused serious social issues. This is particularly visible among teenagers, many of whom spend more time on social media than with their peers. Some studies show health problems as well. In addition, jobs traditionally done by humans is being replace by automation, which threatens the livelihoods of workers in manufacturing.",
  "In my opinion, the problems mentioned above are real but not so big. Governments and schools can teach digital literacy, and companies can design tools that protect users' wellbeing. Moreover, when used responsibly, technology allows a single parent to attend university remotely, or a rural patient to consult a city specialist — outcomes that were impossible for before.",
  "To conclude, technology has both good and bad sides, but I think the good ones are bigger.",
].join("\n\n");

function makeAnn(id, original, suggested, category, severity, explanation, nth = 1) {
  let idx = -1;
  for (let i = 0; i < nth; i++) {
    idx = SAMPLE_ESSAY.indexOf(original, idx + 1);
    if (idx === -1) {
      throw new Error(
        `band65 fixture: could not find occurrence #${nth} of "${original}"`
      );
    }
  }
  return {
    id,
    start_offset: idx,
    end_offset: idx + original.length,
    original_text: original,
    suggested_text: suggested,
    category,
    severity,
    explanation,
  };
}

const annotations = [
  makeAnn(
    "ann_1",
    "a lot of people",
    "many people",
    "LR",
    "minor",
    '"A lot of" is informal — Task 2 rewards a more academic register. Swap in "many" or "a considerable number of".'
  ),
  makeAnn(
    "ann_2",
    "it bring",
    "it brings",
    "GRA",
    "major",
    'Subject–verb agreement: the subject "it" is singular and needs "brings".'
  ),
  makeAnn(
    "ann_3",
    "make things very easy",
    "streamline everyday tasks",
    "LR",
    "minor",
    'Vague and overused. Prefer precise verbs like "streamline", "accelerate", or "automate".'
  ),
  makeAnn(
    "ann_4",
    "Moreover",
    "For instance",
    "CC",
    "minor",
    '"Moreover" appears in three paragraphs. Vary your connectors — here, an exemplifier fits better than an additive.',
    1
  ),
  makeAnn(
    "ann_5",
    "This benefits are",
    "These benefits are",
    "GRA",
    "major",
    'Demonstrative agreement: "benefits" is plural, so use "these", not "this".'
  ),
  makeAnn(
    "ann_6",
    "This is particularly visible among teenagers",
    "This dependence is particularly visible among teenagers",
    "CC",
    "minor",
    'Ambiguous reference — specify what "this" points to so your paragraph locks onto one idea.'
  ),
  makeAnn(
    "ann_7",
    "Some studies show health problems as well.",
    "A 2023 Oxford study, for example, linked heavy smartphone use to rising teenage anxiety.",
    "TA",
    "major",
    'This is the weakest sentence in the essay. A concrete source is what lifts body 2 from 6.0 to 7.0 on Task Achievement.'
  ),
  makeAnn(
    "ann_8",
    "is being replace",
    "are being replaced",
    "GRA",
    "major",
    'Passive voice + plural subject: "jobs… are being replaced".'
  ),
  makeAnn(
    "ann_9",
    "not so big",
    "not insurmountable",
    "LR",
    "minor",
    "Conversational register — Task 2 conclusions benefit from more formal adjectives."
  ),
  makeAnn(
    "ann_10",
    "Moreover,",
    "Furthermore,",
    "CC",
    "minor",
    'Third "Moreover" in the essay — try "Furthermore", "In addition", or "What is more" for variety.',
    2
  ),
  makeAnn(
    "ann_11",
    "impossible for before",
    "previously impossible",
    "GRA",
    "minor",
    'Redundant preposition; "previously impossible" is idiomatic.'
  ),
  makeAnn(
    "ann_12",
    "To conclude, technology has both good and bad sides, but I think the good ones are bigger.",
    "Technology's drawbacks are a design problem, not an inherent one; handled well, the net gain is substantial.",
    "TA",
    "major",
    "A Band 7 conclusion doesn't just repeat — it nuances. Synthesise the two views rather than restating them."
  ),
];

export const SAMPLE_RESULT = {
  overall_band: 6.5,
  word_count: 268,
  word_count_target: 250,
  task_type: "task2_discussion",
  criteria: {
    task_achievement: {
      band: 6.0,
      explanation:
        "Clear opinion, but body 2 lacks evidence and the conclusion just restates.",
      strengths: ["Clear thesis", "Both views discussed"],
      weaknesses: [
        "Body 2 has no concrete example or source",
        "Conclusion restates rather than synthesises",
      ],
    },
    coherence_cohesion: {
      band: 7.0,
      explanation:
        "Logical flow and strong topic sentences; connectors are repetitive.",
      strengths: ["Explicit topic sentences", "Clear paragraphing"],
      weaknesses: ['"Moreover" used three times', "Ambiguous pronoun reference"],
    },
    lexical_resource: {
      band: 6.5,
      explanation:
        "Adequate range; some informal phrases hold you back from Band 7.",
      strengths: ["Some less common vocabulary", "Paraphrases the prompt"],
      weaknesses: [
        '"A lot of" and "very easy" are informal',
        'Vague diction in the conclusion ("not so big")',
      ],
    },
    grammatical_range_accuracy: {
      band: 6.5,
      explanation:
        "Complex structures attempted; subject-verb agreement slips recur.",
      strengths: ["Uses subordinate clauses", "Mostly accurate punctuation"],
      weaknesses: [
        'Subject–verb agreement: "it bring", "jobs is being replace"',
        'Demonstrative agreement: "This benefits"',
      ],
    },
  },
  inline_annotations: annotations,
  improved_version:
    "In today's fast-paced world, many people argue that modern technology has simplified daily life… (full Band 7+ rewrite truncated in fixture)",
  feedback_language: "en",
};

export const SAMPLE_LIZ_MESSAGE =
  "Strong opinion and clear structure. Your ceiling right now is body paragraph 2 — it argues without illustrating. Add one concrete example and you're at Band 7. The grammar slips are mostly subject–verb agreement — fixable in an afternoon.";

export const SAMPLE_OG_QUOTE =
  "A clear opinion, let down by a thin second body.";
