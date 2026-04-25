/**
 * Band 8.0 · Task 2 · Technology & society — sample essay fixture.
 * Calibrated against Cambridge Band 8 descriptors:
 *   TA: sufficiently addresses all parts; well-developed, clear position throughout
 *   CC: logical sequencing; paragraphing managed skillfully; cohesion used well
 *   LR: wide range; skilful use of uncommon items; rare spelling / word-form errors
 *   GRA: wide range; majority of sentences error-free; only occasional inappropriacy
 * Same prompt as band50 + band65 fixtures so the three reports read as a
 * calibration set. Annotations at this band are refinements, not corrections.
 */

export const SAMPLE_PROMPT =
  "Some people say that technology has made our lives easier, while others argue it has created more problems than it has solved. Discuss both views and give your opinion.";

export const SAMPLE_ESSAY = [
  "Few forces have reshaped modern life as thoroughly as digital technology, and commentators remain sharply divided over whether it has lightened our load or quietly doubled it. This essay will examine both positions before arguing that, on balance, the gains are real but deeply uneven — and it is that unevenness, rather than technology itself, that deserves our attention.",
  "Proponents point, rightly, to the sheer compression of effort that connected devices have delivered. A generation ago, applying for a passport, transferring money across borders, or consulting a specialist across the country each demanded days of paperwork and travel; today, any of these can be completed from a handset in minutes. During the pandemic, this same infrastructure allowed education, healthcare and entire supply chains to continue functioning when physical movement collapsed — a stress test that quietly validated decades of digital investment.",
  "The sceptics, however, are not wrong that the convenience has arrived with a bill attached. Constant connectivity has blurred the boundary between work and rest, a phenomenon occupational health researchers now label \"techno-stress\". Algorithmically curated feeds have been linked, in peer-reviewed studies, to rising rates of adolescent anxiety, while automation in logistics and retail has displaced precisely the mid-skill jobs that once provided a route into the middle class.",
  "What this debate tends to obscure is that technology's costs and benefits rarely fall on the same people. The remote worker gaining an hour back is seldom the warehouse employee losing shifts to a robot. A more honest verdict, therefore, is that digital tools have made life easier in aggregate while making it materially harder for specific groups — and it is the policy response, not the technology, that will decide whether that imbalance narrows or widens.",
].join("\n\n");

function makeAnn(id, original, suggested, category, severity, explanation, nth = 1) {
  let idx = -1;
  for (let i = 0; i < nth; i++) {
    idx = SAMPLE_ESSAY.indexOf(original, idx + 1);
    if (idx === -1) {
      throw new Error(
        `band80 fixture: could not find occurrence #${nth} of "${original}"`
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
    "quietly doubled it",
    "quietly doubled the load",
    "CC",
    "minor",
    'Pronoun reference is technically fine, but at Band 8+ examiners notice elegance. Replacing "it" with "the load" tightens the cohesion across the two clauses.'
  ),
  makeAnn(
    "ann_2",
    "in peer-reviewed studies",
    "in several peer-reviewed studies",
    "TA",
    "minor",
    'Specificity lift — quantifying evidence (even vaguely: "several", "multiple longitudinal") is what separates strong Band 8 from Band 9 on Task Achievement.'
  ),
  makeAnn(
    "ann_3",
    "in aggregate",
    "on aggregate",
    "LR",
    "minor",
    'Both collocations exist, but "on aggregate" is the more standard academic collocation in British English. A Band 9 marker of register awareness.'
  ),
  makeAnn(
    "ann_4",
    "will decide whether that imbalance narrows or widens",
    "will determine whether that imbalance narrows or widens",
    "LR",
    "minor",
    '"Decide" is correct but slightly informal for a concluding sentence; "determine" matches the analytical register of the rest of the paragraph.'
  ),
];

export const SAMPLE_RESULT = {
  overall_band: 8.0,
  word_count: 287,
  word_count_target: 250,
  task_type: "task2_discussion",
  criteria: {
    task_achievement: {
      band: 8.0,
      explanation:
        "Both views are fully developed with specific, plausible evidence; the position is nuanced and sustained throughout, going beyond a simple for/against verdict.",
      strengths: [
        "Nuanced position: technology is net-positive but distributionally uneven",
        "Concrete, plausible examples (pandemic infrastructure, warehouse displacement)",
        "Conclusion reframes the debate rather than restating it",
      ],
      weaknesses: [
        'Evidence could be even more specific ("peer-reviewed studies" → name a field or institution)',
      ],
    },
    coherence_cohesion: {
      band: 8.0,
      explanation:
        "Paragraphing is skilfully managed; each paragraph has a clear role (hook → pro → con → synthesis). Referencing and substitution are handled naturally without over-signposting.",
      strengths: [
        "Skilful paragraph roles — synthesis paragraph, not a restatement conclusion",
        "Cohesion feels natural, not mechanical",
      ],
      weaknesses: [
        "One slightly ambiguous pronoun (\"doubled it\") that would be tightened at Band 9",
      ],
    },
    lexical_resource: {
      band: 8.0,
      explanation:
        "Wide range with confident use of less common items (\"compression of effort\", \"algorithmically curated\", \"techno-stress\", \"stress test\"). Register is consistently academic.",
      strengths: [
        "Uncommon collocations used naturally",
        "Metaphor controlled, not overused (\"stress test\", \"bill attached\")",
      ],
      weaknesses: [
        '"in aggregate" vs. "on aggregate" — a Band 9 register refinement',
        '"will decide" → "will determine" in the final clause',
      ],
    },
    grammatical_range_accuracy: {
      band: 8.0,
      explanation:
        "Wide range of structures including dashes for parenthetical elaboration, inversion, and complex subordination. Errors are essentially absent.",
      strengths: [
        "Confident punctuation (em-dashes, semicolons implied by rhythm)",
        "Complex noun phrases (\"algorithmically curated feeds\", \"mid-skill jobs\")",
        "Varied sentence openings",
      ],
      weaknesses: [
        "None that affect the band — essay is effectively error-free",
      ],
    },
  },
  inline_annotations: annotations,
  improved_version:
    "Few forces have reshaped modern life as thoroughly as digital technology… (already at Band 8; a Band 9 rewrite would mainly tighten the four annotated refinements).",
  feedback_language: "en",
};

export const SAMPLE_LIZ_MESSAGE =
  "This is already a strong Band 8. The four notes I've left are refinements, not corrections — they're the difference between 8.0 and 8.5/9.0: slightly tighter pronoun reference, a quantified source, and two register upgrades in the final paragraph. The underlying argument — that the issue is distributional, not technological — is exactly the kind of synthesis examiners reward.";

export const SAMPLE_OG_QUOTE =
  "Nuanced, evidenced, and distributionally aware.";
