// Shared constants + pure scoring helpers for the Cambridge results surface.
// Extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor).

export const API_URL = process.env.REACT_APP_BACKEND_URL;

// Read the current user.id from localStorage (matches FullTestInterface /
// CambridgeTestInterface pattern). Returns null when nobody is logged in
// — backend persist_attempt() skips silently in that case.
export const _getUserId = () => {
  try { return JSON.parse(localStorage.getItem('user'))?.id || null; } catch { return null; }
};

// iOS 26 design tokens — same vocabulary as D9 Question Bank so this page
// feels like the same surface, not a different one.
export const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  ink: '220 25% 12%',
  muted: '220 10% 45%',
  fainter: '220 10% 65%',
  surface: '0 0% 100%',
  border: '220 15% 90%',
};

export const compareAnswers = (userAns, correctAns) => {
  if (!userAns || !correctAns) return false;
  const normalize = (str) => String(str).toLowerCase().trim().replace(/[.,!?]/g, '');
  if (Array.isArray(correctAns)) {
    return correctAns.some(ans => normalize(ans) === normalize(userAns));
  }
  if (String(correctAns).includes('/')) {
    return correctAns.split('/').some(ans => normalize(ans) === normalize(userAns));
  }
  return normalize(userAns) === normalize(correctAns);
};

export const calculateBand = (percentage) => {
  if (percentage >= 90) return 9.0;
  if (percentage >= 82) return 8.5;
  if (percentage >= 75) return 8.0;
  if (percentage >= 68) return 7.5;
  if (percentage >= 60) return 7.0;
  if (percentage >= 52) return 6.5;
  if (percentage >= 45) return 6.0;
  if (percentage >= 38) return 5.5;
  if (percentage >= 30) return 5.0;
  if (percentage >= 22) return 4.5;
  return 4.0;
};

export const calculateSectionScore = (section, userAnswers, correctAnswers) => {
  if (!correctAnswers) {
    return { correct: 0, total: 0, band: 5.0, percentage: 0, details: [] };
  }

  let correct = 0;
  let total = Object.keys(correctAnswers).length;
  const details = [];

  Object.entries(correctAnswers).forEach(([key, correctAns]) => {
    const userAns = userAnswers[`${section}_${key}`];
    const isCorrect = compareAnswers(userAns, correctAns);

    if (isCorrect) correct++;

    details.push({
      question_id: key,
      user_answer: userAns || '-',
      correct_answer: correctAns,
      is_correct: isCorrect
    });
  });

  const percentage = total > 0 ? (correct / total) * 100 : 0;
  const band = calculateBand(percentage);

  return { correct, total, band, percentage, details };
};

export const getBandColorClass = (score) => score >= 7 ? 'text-green-600' : score >= 6 ? 'text-blue-600' : score >= 5 ? 'text-yellow-600' : 'text-red-600';
export const getBandBgClass = (score) => score >= 7 ? 'bg-green-500' : score >= 6 ? 'bg-blue-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500';
export const getBandLightBg = (score) => score >= 7 ? 'bg-green-100 text-green-700' : score >= 6 ? 'bg-blue-100 text-blue-700' : score >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
