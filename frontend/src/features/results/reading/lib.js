import {
  HelpCircle, ListChecks, Edit3, Shuffle, Heading, BookOpen,
} from 'lucide-react';

// =============================================================================
// HELPERS — passage stats, skill counts, fallback insights
// =============================================================================

const SKILL_LABELS = {
  tfng:    { name: 'T/F/NG · Y/N/NG',    icon: HelpCircle },
  mc:      { name: 'Multiple Choice',    icon: ListChecks },
  fill:    { name: 'Fill in the Blanks', icon: Edit3 },
  match:   { name: 'Matching',           icon: Shuffle },
  heading: { name: 'Headings',           icon: Heading },
  other:   { name: 'Other',              icon: BookOpen },
};

function categorizeSkill(question_type) {
  const t = String(question_type || '').toLowerCase();
  if (t.includes('true') || t.includes('false') || t.includes('yes_no') || t.includes('tfng') || t.includes('ynng') || t.includes('y_n_ng')) return 'tfng';
  if (t.includes('multiple') || t === 'mc' || t === 'mcq') return 'mc';
  if (t.includes('fill') || t.includes('blank') || t.includes('completion') || t.includes('summary') || t.includes('sentence_completion')) return 'fill';
  if (t.includes('match')) return 'match';
  if (t.includes('heading')) return 'heading';
  return 'other';
}

function bandTier(band) {
  const b = Number(band) || 0;
  if (b >= 9)   return 'Expert User';
  if (b >= 8)   return 'Very Good User';
  if (b >= 7)   return 'Good User';
  if (b >= 6)   return 'Competent User';
  if (b >= 5)   return 'Modest User';
  if (b >= 4)   return 'Limited User';
  return 'Extremely Limited';
}

function computePassageStats(question_results, passages) {
  const total = question_results.length;
  const groups = new Map();
  question_results.forEach((q) => {
    const k = resolvePassageNumber(q, passages, total);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(q);
  });
  const sortedKeys = [...groups.keys()].sort(
    (a, b) => (Number(a) || 99) - (Number(b) || 99)
  );
  return sortedKeys.map((k, idx) => {
    const items = groups.get(k);
    const correct = items.filter((q) => q.is_correct).length;
    const total = items.length;
    const skills = {};
    items.forEach((q) => {
      const sk = categorizeSkill(q.question_type);
      if (!skills[sk]) skills[sk] = { correct: 0, total: 0 };
      skills[sk].total += 1;
      if (q.is_correct) skills[sk].correct += 1;
    });
    return {
      n: k,
      idx,
      correct,
      total,
      percent: total ? Math.round((correct / total) * 100) : 0,
      skills,
    };
  });
}

function computeSkillCounts(question_results) {
  const counts = {};
  question_results.forEach((q) => {
    const k = categorizeSkill(q.question_type);
    if (!counts[k]) counts[k] = { correct: 0, wrong: 0, total: 0 };
    counts[k].total += 1;
    if (q.is_correct) counts[k].correct += 1;
    else counts[k].wrong += 1;
  });
  return counts;
}

function priorityFromCounts(skillCounts) {
  const sorted = Object.entries(skillCounts)
    .filter(([k]) => k !== 'other')
    .sort((a, b) => b[1].wrong - a[1].wrong);
  if (!sorted.length || sorted[0][1].wrong === 0) return null;
  const [key, c] = sorted[0];
  return { key, ...SKILL_LABELS[key], wrong: c.wrong, total: c.total };
}

// Heuristic +band lift if we collapse the priority skill's wrongs by 70%
function fastestGainEstimate(question_results, skillCounts, currentBand) {
  const priority = priorityFromCounts(skillCounts);
  if (!priority) return null;
  const wrong = priority.wrong;
  const recoverable = Math.max(1, Math.round(wrong * 0.7));
  const newCorrect = (question_results.filter((q) => q.is_correct).length) + recoverable;
  // Simple band approximation: 40 questions, +1 correct ≈ +0.1 band, capped between 4–9
  const lift = Math.min(2, Math.max(0.5, recoverable * 0.1));
  const projected = Math.min(9, Math.max(4, Number(currentBand || 6) + lift));
  return {
    skillName: priority.name,
    recoverable,
    projectedBand: Math.round(projected * 2) / 2, // round to .5
    newCorrect,
    totalQuestions: question_results.length,
  };
}

// Map a question_id (1..40) → passage number using the supplied passages
// metadata, or fall back to the standard IELTS Reading split (1-13 / 14-26 /
// 27-40). Returns 1 if nothing else fits.
function resolvePassageNumber(q, passages, total) {
  if (q.passage != null && !Number.isNaN(Number(q.passage))) return Number(q.passage);
  if (q.passage_number != null) return Number(q.passage_number);
  const qid = Number(q.question_id ?? q.question_number ?? 0);
  // If passages list has start/end metadata, prefer it
  if (Array.isArray(passages)) {
    for (const p of passages) {
      const start = Number(p.start_q ?? p.start_question ?? p.start ?? 0);
      const end = Number(p.end_q ?? p.end_question ?? p.end ?? 0);
      if (start && end && qid >= start && qid <= end) return Number(p.id ?? p.passage_number ?? 1);
    }
  }
  // Default IELTS split for 40-question reading tests
  const t = Number(total) || 40;
  const third = Math.ceil(t / 3);
  if (qid <= third) return 1;
  if (qid <= 2 * third) return 2;
  return 3;
}

export {
  SKILL_LABELS,
  categorizeSkill,
  bandTier,
  computePassageStats,
  computeSkillCounts,
  priorityFromCounts,
  fastestGainEstimate,
  resolvePassageNumber,
};
