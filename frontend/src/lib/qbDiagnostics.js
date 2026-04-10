export function buildReadingPracticeDiagnostics({ percentage = 0, estimatedBand = 0, questionResults = [], moduleContent = null }) {
  const rootCauseMap = {
    inference: {
      label: 'Inference Gaps',
      explanation: 'You are missing implied meaning and choosing answers based on surface words.'
    },
    'main idea': {
      label: 'Main Idea Control',
      explanation: 'You need stronger paragraph-level understanding before choosing an answer.'
    },
    vocabulary: {
      label: 'Vocabulary Precision',
      explanation: 'Topic words and paraphrases are blocking accurate comprehension.'
    },
    headings: {
      label: 'Heading Matching',
      explanation: 'You need to identify paragraph purpose faster instead of matching keywords only.'
    },
    'specific information': {
      label: 'Detail Location',
      explanation: 'You are not locating exact evidence reliably enough.'
    },
    'true/false/not given': {
      label: 'Evidence Discipline',
      explanation: 'You need to separate contradiction, support, and missing information more carefully.'
    }
  };

  const wrongQuestions = questionResults.filter((result) => !result.isCorrect);
  const skillCounts = {};

  wrongQuestions.forEach((result) => {
    const skills = Array.isArray(result.skillTested) ? result.skillTested : [];
    const normalizedSkills = skills.length ? skills : ['specific information'];
    normalizedSkills.forEach((skill) => {
      const key = String(skill).toLowerCase();
      skillCounts[key] = (skillCounts[key] || 0) + 1;
    });
  });

  const rootCauseAnalysis = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([key, count]) => {
      const meta = rootCauseMap[key] || {
        label: key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
        explanation: 'This question type needs more targeted reading practice and evidence checking.'
      };
      return {
        code: key,
        label: meta.label,
        count,
        impact: count >= 3 ? 'high' : count === 2 ? 'medium' : 'targeted',
        explanation: meta.explanation
      };
    });

  const lessonNumber = moduleContent?.module_number || moduleContent?.lesson_number || null;
  const recommendation = lessonNumber
    ? {
        title: moduleContent?.module_title || moduleContent?.title || 'Related Reading Lesson',
        route: `/advanced-mastery?lesson=${lessonNumber}`,
        reason: 'This lesson matches the exact reading theme and skill mix from the practice you just completed.'
      }
    : {
        title: 'Advanced Mastery Reading',
        route: '/advanced-mastery',
        reason: 'Review the matching reading unit before you retry this passage.'
      };

  const targetBand = Math.min(9, Math.max(estimatedBand, estimatedBand < 6.5 ? estimatedBand + 0.5 : estimatedBand + 1)).toFixed(1);
  const topCause = rootCauseAnalysis[0];
  const topCauseLabel = topCause?.label || 'evidence control';
  const focusLabel = topCause?.label || 'Reading precision';

  const studyPlan = {
    target_band: targetBand,
    priority_skill: focusLabel,
    roadmap_steps: [
      {
        title: 'Review the linked lesson',
        why_now: `Start with ${recommendation.title} to rebuild the exact reading skill that broke down here.`,
        route: recommendation.route
      },
      {
        title: 'Rework every wrong question',
        why_now: `Focus on ${topCauseLabel.toLowerCase()} and force yourself to point to textual evidence before choosing an answer.`
      },
      {
        title: 'Retake under time pressure',
        why_now: 'Do one timed re-attempt after review to check whether the accuracy gain is stable.'
      }
    ],
    three_day_plan: [
      `Day 1: Review ${recommendation.title} and note the 3 patterns behind your mistakes.`,
      `Day 2: Re-solve the wrong questions and write one-line evidence for each answer.`,
      'Day 3: Retake a fresh passage under timing and compare your accuracy by question type.'
    ],
    retest_strategy: percentage < 70
      ? 'Study first, then retry a comparable passage. Do not rely on immediate repetition only.'
      : 'You can retake soon, but only after reviewing the exact evidence behind each wrong answer.'
  };

  return {
    weakSkills: rootCauseAnalysis.map((item) => item.code),
    rootCauseAnalysis,
    studyPlan,
    recommendedLessons: [recommendation]
  };
}
