/**
 * Sample essay + evaluation result for previewing the Writing Evaluator V4 UI.
 * Shape matches WritingEvaluationResult (see schemas/writingResult.js).
 * Offsets are UTF-16 code units; the essay text below is the single source
 * of truth they index into.
 */

export const SAMPLE_PROMPT =
  "Some people believe that university students should be required to attend classes. Others believe that going to classes should be optional. Discuss both views and give your opinion.";

// A single contiguous string. Paragraphs separated by a blank line so the
// annotator splits them correctly. Annotation offsets are computed below
// from substring searches to stay in sync with any text edits.
export const SAMPLE_ESSAY = [
  "In recent years, whether students at university level should be obliged to attend every lecture has become a hotly debate topic. While some argue that compulsory attendance guarantees discipline, others insist that peoples thinks that flexibility is more valuable. In my view, attendance should remain optional for most courses.",
  "On the one hand, supporters of mandatory attendance claim that young adults are needing the structure of a fixed timetable. Moreover, face-to-face lectures allow students to engage in a lot of discussion with their professors, which can deepen understanding. For example, a medical student who skips anatomy classes may lose critical demonstrations that cannot easily be replicated at home.",
  "On the other hand, opponents point out that the university students are adults who should take responsibility for their own learning. This is particularly important for those who work part-time or care for family members. In addition, recorded lectures and online materials now make self-study very easy.",
  "In my opinion, compulsory attendance is an out-dated approach. Universities should focus on the quality of teaching rather than policing the presence of students. If a lecture is truly valuable, students will choose to attend it. Only in practical subjects such as laboratory work or clinical training should attendance be enforced.",
  "To conclude, although mandatory classes have some benefits, the freedom to choose reflects the adult nature of higher education. Therefore, universities should make attendance optional.",
].join("\n\n");

/** Build an annotation from a substring match so the fixture stays robust. */
function makeAnn(id, original, suggested, category, severity, explanation, nth = 1) {
  // Find the nth occurrence of `original` in SAMPLE_ESSAY.
  let idx = -1;
  for (let i = 0; i < nth; i++) {
    idx = SAMPLE_ESSAY.indexOf(original, idx + 1);
    if (idx === -1) {
      throw new Error(
        `Sample fixture: could not find occurrence #${nth} of "${original}"`
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
    "hotly debate",
    "hotly debated",
    "GRA",
    "minor",
    "Adjective form — use the past participle to describe the topic."
  ),
  makeAnn(
    "ann_2",
    "peoples thinks that",
    "people think that",
    "GRA",
    "major",
    '"People" is already plural; the verb should be "think".'
  ),
  makeAnn(
    "ann_3",
    "are needing",
    "need",
    "GRA",
    "minor",
    "Stative verb — use simple present, not continuous."
  ),
  makeAnn(
    "ann_4",
    "Moreover",
    "Furthermore",
    "CC",
    "minor",
    '"Moreover" appears several times — vary your connectors for cohesion.'
  ),
  makeAnn(
    "ann_5",
    "a lot of",
    "substantial",
    "LR",
    "minor",
    "Informal phrasing — prefer academic alternatives in Task 2."
  ),
  makeAnn(
    "ann_6",
    "lose",
    "miss",
    "LR",
    "minor",
    'Collocation — you "miss" a class, not "lose" one.'
  ),
  makeAnn(
    "ann_7",
    "the university students",
    "university students",
    "GRA",
    "minor",
    "Abstract general reference — drop the definite article."
  ),
  makeAnn(
    "ann_8",
    "very easy",
    "highly accessible",
    "LR",
    "minor",
    "Vague intensifier — use more precise academic diction."
  ),
  makeAnn(
    "ann_9",
    "out-dated",
    "outdated",
    "LR",
    "minor",
    "Hyphenation — one word in modern usage."
  ),
  makeAnn(
    "ann_10",
    "Therefore, universities should make attendance optional.",
    "Therefore, compulsory attendance should give way to student-driven engagement across all non-practical subjects.",
    "TA",
    "major",
    "Conclusion is a bare restatement — Band 7 conclusions add a nuanced synthesis."
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
        "You state a clear opinion but the second body paragraph is underdeveloped — it lacks a concrete example to support your claim.",
      strengths: ["Clear thesis in the introduction", "Both views addressed"],
      weaknesses: [
        "Body 2 lacks a concrete example",
        "Conclusion only restates — no synthesis",
      ],
    },
    coherence_cohesion: {
      band: 7.0,
      explanation:
        "Strong paragraphing and topic sentences; a few connectors feel repetitive which mildly weakens cohesion.",
      strengths: ["Logical progression", "Topic sentences are explicit"],
      weaknesses: [
        'Overuse of "Moreover" as a connector',
        "Pronoun reference unclear in paragraph 3",
      ],
    },
    lexical_resource: {
      band: 6.5,
      explanation:
        "Adequate range with some attempts at less common vocabulary; several collocation and register slips bring this down from Band 7.",
      strengths: ["Attempts less common vocabulary", "Paraphrases the prompt"],
      weaknesses: [
        '"A lot of" is informal for academic writing',
        "Occasional wrong collocation (e.g. \"lose a class\")",
      ],
    },
    grammatical_range_accuracy: {
      band: 6.5,
      explanation:
        "Mix of simple and complex structures; subject–verb agreement and article errors recur and prevent a Band 7.",
      strengths: [
        "Uses conditional and relative clauses",
        "Punctuation mostly accurate",
      ],
      weaknesses: [
        'Plural -s missing on "peoples"',
        "Article errors before abstract nouns",
      ],
    },
  },
  inline_annotations: annotations,
  improved_version:
    "In recent years, whether university students should be compelled to attend every lecture has become a widely debated topic… (full rewrite truncated in fixture)",
  feedback_language: "en",
};

export const SAMPLE_LIZ_MESSAGE =
  "You have a clear opinion and solid structure. Your weak spot is body paragraph 2 — add one concrete example and you're at Band 7. Want to try?";
