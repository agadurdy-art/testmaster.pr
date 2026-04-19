/**
 * Band 5.0 · Task 2 · Technology & society — sample essay fixture.
 * Calibrated against Cambridge Band 5 descriptors:
 *   TA: addresses task only partially, position unclear, limited development
 *   CC: some connectives used but inaccurately or mechanically
 *   LR: limited range, noticeable spelling / word-form errors, little paraphrasing
 *   GRA: limited structures, frequent errors that can confuse the reader
 * Same prompt as band65Task2Technology.js so the three reports read as
 * a calibration set.
 */

export const SAMPLE_PROMPT =
  "Some people say that technology has made our lives easier, while others argue it has created more problems than it has solved. Discuss both views and give your opinion.";

export const SAMPLE_ESSAY = [
  "Nowadays, tecnology is very important in our live. Some peoples think that technology make life more easy, but other peoples they think technology bring a lot of problem. In this essay I will discuss this two sides.",
  "On one side, technology is good because we can do many thing with phone and computer. For exemple, we can talk with our family who live in other country, and we can buy food from internet without go to shop. Also, student can study online when the school is close, this is very helpfull for everyone.",
  "On other side, technology have bad effect too. Many young person spend too much times on social media and they don't talk with they family. Also some people lost they job because machine do the work now. This is a big problem for the society because this peoples can't find new job easy.",
  "In my opinion, I think technology is more good than bad because we can't live without it now. But government must to control the use of technology for protect the children and the worker.",
  "In conclusion, technology have good side and bad side, but we must to use it in correct way.",
].join("\n\n");

function makeAnn(id, original, suggested, category, severity, explanation, nth = 1) {
  let idx = -1;
  for (let i = 0; i < nth; i++) {
    idx = SAMPLE_ESSAY.indexOf(original, idx + 1);
    if (idx === -1) {
      throw new Error(
        `band50 fixture: could not find occurrence #${nth} of "${original}"`
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
    "tecnology",
    "technology",
    "LR",
    "major",
    'Spelling — this word appears throughout the prompt, so an examiner will notice the slip immediately. Proofread the first sentence twice.'
  ),
  makeAnn(
    "ann_2",
    "our live",
    "our lives",
    "GRA",
    "major",
    'Plural noun: "lives" (noun) — "live" is the verb. A recurring slip at Band 5.'
  ),
  makeAnn(
    "ann_3",
    "Some peoples",
    "Some people",
    "GRA",
    "major",
    '"People" is already plural — no "-s". This is one of the most common Band 5 markers.',
    1
  ),
  makeAnn(
    "ann_4",
    "technology make life more easy",
    "technology makes life easier",
    "GRA",
    "major",
    'Two errors in one clause: subject–verb agreement ("makes") and comparative form ("easier", not "more easy").'
  ),
  makeAnn(
    "ann_5",
    "other peoples they think",
    "others think",
    "GRA",
    "major",
    'Double subject ("peoples they") plus the plural-people error again. Drop the pronoun: "others think…".'
  ),
  makeAnn(
    "ann_6",
    "this two sides",
    "these two sides",
    "GRA",
    "major",
    'Demonstrative agreement: "sides" is plural, so "these", not "this".'
  ),
  makeAnn(
    "ann_7",
    "many thing",
    "many things",
    "GRA",
    "major",
    '"Many" requires a plural countable noun — "many things".'
  ),
  makeAnn(
    "ann_8",
    "without go to shop",
    "without going to the shop",
    "GRA",
    "major",
    'After "without" use the -ing form, and countable singular nouns need an article ("the shop").'
  ),
  makeAnn(
    "ann_9",
    "helpfull",
    "helpful",
    "LR",
    "minor",
    'Spelling — one "l" in "helpful".'
  ),
  makeAnn(
    "ann_10",
    "technology have",
    "technology has",
    "GRA",
    "major",
    'Subject–verb agreement: "technology" is singular → "has".'
  ),
  makeAnn(
    "ann_11",
    "they family",
    "their families",
    "GRA",
    "major",
    'Possessive pronoun ("their", not "they") and plural noun — this confusion appears twice in the paragraph.'
  ),
  makeAnn(
    "ann_12",
    "government must to control",
    "governments must control",
    "GRA",
    "major",
    'Modal verbs ("must", "can", "should") are followed by the bare infinitive — no "to". Also "governments" plural reads more naturally here.'
  ),
];

export const SAMPLE_RESULT = {
  overall_band: 5.0,
  word_count: 198,
  word_count_target: 250,
  task_type: "task2_discussion",
  criteria: {
    task_achievement: {
      band: 5.0,
      explanation:
        "Both views are mentioned but each is developed with only one or two generic points; under-length at 208 words will also be penalised.",
      strengths: [
        "Clear two-sided structure",
        "A position is offered in paragraph 4",
      ],
      weaknesses: [
        "Well under the 250-word minimum at 198 words (−0.5 on TA)",
        "Examples are generic — no concrete evidence or specific population",
        "Conclusion simply restates without synthesis",
      ],
    },
    coherence_cohesion: {
      band: 5.0,
      explanation:
        "Paragraphing is logical, but connectives are mechanical (\"On one side / On other side\") and referencing is often unclear.",
      strengths: ["Five clear paragraphs", "Discourse markers attempted"],
      weaknesses: [
        '"On other side" — missing article, should be "On the other hand"',
        "Pronoun reference is ambiguous (\"this peoples\", \"they family\")",
      ],
    },
    lexical_resource: {
      band: 4.5,
      explanation:
        "Vocabulary is limited to very basic items; spelling errors on high-frequency words reduce the band.",
      strengths: ["Task-relevant vocabulary present"],
      weaknesses: [
        'Spelling: "tecnology", "exemple", "helpfull"',
        "Almost no paraphrase of the prompt",
        'Repetitive phrasing: "good side / bad side" appears three times',
      ],
    },
    grammatical_range_accuracy: {
      band: 4.5,
      explanation:
        "Frequent errors in very basic structures — plurals, subject–verb agreement, articles, modal verb patterns — that occasionally strain the reader.",
      strengths: ["Attempts complex sentences with \"because\" and \"when\""],
      weaknesses: [
        'Plural errors: "peoples", "many thing", "our live"',
        'Subject–verb agreement: "technology make", "technology have"',
        'Modal pattern: "must to control"',
        'Possessive confusion: "they family", "they job"',
      ],
    },
  },
  inline_annotations: annotations,
  improved_version:
    "Nowadays, technology plays a central role in our lives. While some argue that it has made everyday tasks easier, others believe it has introduced new problems. This essay will discuss both sides before giving my view… (full Band 6+ rewrite truncated in fixture)",
  feedback_language: "en",
};

export const SAMPLE_LIZ_MESSAGE =
  "Your ideas are fine — the gap to Band 6 is almost entirely grammar and length. Fix plurals (\"people\", \"lives\", \"things\") and subject–verb agreement (\"technology has\", \"technology makes\") and you'll jump half a band. Then push to 260 words with one real example per body.";

export const SAMPLE_OG_QUOTE =
  "Ideas are there — grammar and length are holding you back.";
