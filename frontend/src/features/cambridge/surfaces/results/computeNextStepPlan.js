// ============ ONE NEXT STEP CTA: Decision Engine ============
// Extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// closure state converted to an explicit argument object.
export function computeNextStepPlan({
  results,
  questionResults,
  speakingEvaluations,
  fluencyInsights,
  computedOverall,
  bookId,
  testId,
  testData,
}) {
  // Results are stored directly (results.listening, results.reading) not under results.scores
  if (!results?.listening && !results?.reading) return null;

  const allWrong = [...(questionResults.listening || []), ...(questionResults.reading || [])].filter(q => !q.is_correct);

  // 1. Find lowest skill
  const skillScores = {
    listening: results.listening?.band || 9,
    reading: results.reading?.band || 9
  };

  // Add speaking if available
  if (Object.keys(speakingEvaluations).length > 0) {
    const speakingBands = Object.values(speakingEvaluations).map(e => e?.overall_band || 5);
    skillScores.speaking = speakingBands.reduce((a, b) => a + b, 0) / speakingBands.length;
  }

  const lowestSkill = Object.entries(skillScores).sort(([,a],[,b]) => a - b)[0];
  if (!lowestSkill) return null;

  const [weakSkill, weakBand] = lowestSkill;
  const targetBand = Math.ceil(weakBand + 0.5);

  // 2. Check speaking filler threshold
  if (weakSkill === 'speaking' && fluencyInsights?.available && fluencyInsights.filler_per_minute > 3) {
    return {
      title: `Reach Band ${targetBand} in Speaking`,
      subtitle: `Your filler word rate (${fluencyInsights.filler_per_minute}/min) is holding you back. A focused fluency drill can make a big difference.`,
      focus_area: 'Speaking Fluency',
      skill: 'speaking',
      reason: `You averaged ${fluencyInsights.filler_per_minute} filler words per minute — Band 7+ speakers use fewer than 2. Reducing fillers instantly improves your fluency impression.`,
      data_points: [
        `Filler rate: ${fluencyInsights.filler_per_minute}/min`,
        `Speaking band: ${weakBand}`,
        `Target: Band ${targetBand}`
      ],
      steps: [
        { title: 'Review your top filler words', detail: 'Notice which fillers you use most ("um", "like", etc.)', duration: '2 min' },
        { title: 'Shadowing drill', detail: 'Listen to a 1-min clip and repeat immediately — focus on flow, not perfection', duration: '5 min' },
        { title: 'Record yourself', detail: 'Answer a Part 2 question. Pause before speaking instead of using fillers.', duration: '8 min' }
      ],
      expected_outcome: `Reducing filler rate below 2/min can improve your Fluency & Coherence score by 0.5–1.0 band.`,
      action_type: 'drill',
      action_data: { returnPath: `/cambridge-test/${bookId}/${testId}/results` }
    };
  }

  // 3. Check TFNG confusion in reading
  const tfngWrong = allWrong.filter(q => q.reason_code === 'TFNG_CONFUSION' || q.reason_code === 'YNNG_CONFUSION');
  if ((weakSkill === 'reading' || tfngWrong.length >= 3) && tfngWrong.length > 0) {
    const wrongMap = {};
    tfngWrong.forEach(q => { wrongMap[`reading_${q.question_id}`] = true; });

    return {
      title: `Reach Band ${targetBand} in Reading`,
      subtitle: `You lost ${tfngWrong.length} marks on TRUE/FALSE/NOT GIVEN — the most fixable question type in IELTS.`,
      focus_area: 'T/F/NG Accuracy',
      skill: 'reading',
      reason: `T/F/NG questions test whether you can distinguish between what the text says, contradicts, or doesn't mention. You confused ${tfngWrong.length} answers — this is a pattern that targeted practice fixes quickly.`,
      data_points: [
        `${tfngWrong.length} T/F/NG errors`,
        `Reading band: ${results.reading?.band}`,
        `Target: Band ${targetBand}`
      ],
      steps: [
        { title: 'Review your wrong T/F/NG answers', detail: 'Look at the evidence text — what did the passage actually say?', duration: '3 min' },
        { title: 'Learn the decision framework', detail: 'TRUE = text says it. FALSE = text says opposite. NG = text says nothing about it.', duration: '2 min' },
        { title: 'Retry only T/F/NG questions', detail: `Practice the ${tfngWrong.length} questions you got wrong with the framework in mind.`, duration: '10 min' }
      ],
      expected_outcome: `Getting ${tfngWrong.length} more T/F/NG answers right would directly raise your Reading band.`,
      action_type: 'retry',
      action_data: { bookId, testId, wrongQuestions: wrongMap, testData }
    };
  }

  // 4. Largest reason code cluster
  if (allWrong.length > 0) {
    const reasonGroups = {};
    allWrong.forEach(q => {
      const r = q.reason_code || 'WRONG_ANSWER';
      if (!reasonGroups[r]) reasonGroups[r] = [];
      reasonGroups[r].push(q);
    });

    const topReason = Object.entries(reasonGroups).sort(([,a],[,b]) => b.length - a.length)[0];
    if (topReason) {
      const [reasonCode, items] = topReason;
      const wrongMap = {};
      items.forEach(q => {
        const section = (questionResults.listening || []).includes(q) ? 'listening' : 'reading';
        wrongMap[`${section}_${q.question_id}`] = true;
      });

      const reasonNames = {
        SPELLING_ERROR: 'Spelling Accuracy',
        DISTRACTOR_TRAP: 'Distractor Awareness',
        NEAR_MISS: 'Precision',
        UNANSWERED: 'Time Management',
        WRONG_ANSWER: `${weakSkill.charAt(0).toUpperCase() + weakSkill.slice(1)} Skills`
      };

      return {
        title: `Reach Band ${targetBand} in ${weakSkill.charAt(0).toUpperCase() + weakSkill.slice(1)}`,
        subtitle: `${items.length} of your mistakes share the same pattern. Fix the pattern, fix the score.`,
        focus_area: reasonNames[reasonCode] || reasonCode.replace(/_/g, ' '),
        skill: weakSkill,
        reason: `Your most common mistake type was "${reasonCode.replace(/_/g, ' ')}" with ${items.length} occurrences. Targeted practice on this pattern is the fastest way to improve.`,
        data_points: [
          `${items.length}x ${reasonCode.replace(/_/g, ' ')}`,
          `${weakSkill} band: ${weakBand}`,
          `Target: Band ${targetBand}`
        ],
        steps: [
          { title: 'Understand the pattern', detail: `Review why these ${items.length} answers were classified as "${reasonCode.replace(/_/g, ' ')}"`, duration: '3 min' },
          { title: 'Retry the questions', detail: `Practice only these ${items.length} questions with focused attention`, duration: '8 min' },
          { title: 'Check your improvement', detail: 'Compare your new answers — did the pattern break?', duration: '4 min' }
        ],
        expected_outcome: `Eliminating this pattern could recover up to ${items.length} marks and raise your band score.`,
        action_type: 'retry',
        action_data: { bookId, testId, wrongQuestions: wrongMap, testData }
      };
    }
  }

  // 5. Default: general improvement for lowest skill
  return {
    title: `Improve Your ${weakSkill.charAt(0).toUpperCase() + weakSkill.slice(1)}`,
    subtitle: `At Band ${weakBand}, focused practice on ${weakSkill} gives you the biggest overall score boost.`,
    focus_area: weakSkill.charAt(0).toUpperCase() + weakSkill.slice(1),
    skill: weakSkill,
    reason: `Your ${weakSkill} score (${weakBand}) is your lowest skill. Improving it has the highest impact on your overall band.`,
    data_points: [`${weakSkill} band: ${weakBand}`, `Overall: ${computedOverall}`],
    steps: [
      { title: 'Review your results', detail: `Look at the questions you got wrong in ${weakSkill}`, duration: '3 min' },
      { title: 'Practice weak areas', detail: 'Focus on the question types where you lost the most marks', duration: '10 min' },
      { title: 'Track progress', detail: 'Take another test and compare results', duration: '2 min' }
    ],
    expected_outcome: `Consistent practice can improve your ${weakSkill} band by 0.5–1.0 within a few weeks.`,
    action_type: 'retry',
    action_data: { bookId, testId, testData }
  };
}
