export const PLAN_TIERS = {
  free: 0,
  explorer: 1,
  learner: 2,
  achiever: 3,
  master: 4,
};

export const LEGACY_PLAN_ALIASES = {
  starter: 'learner',
  booster: 'achiever',
  pro: 'master',
};

export function normalizePlanName(plan) {
  const normalized = (plan || 'free').toString().trim().toLowerCase();
  return LEGACY_PLAN_ALIASES[normalized] || normalized || 'free';
}

export function getPlanTier(plan) {
  return PLAN_TIERS[normalizePlanName(plan)] || 0;
}

export function planMeetsMinimum(userPlan, minimumPlan) {
  return getPlanTier(userPlan) >= getPlanTier(minimumPlan);
}

export function canAccessPremiumTests(user) {
  return planMeetsMinimum(user?.plan, 'learner') || (user?.examCredits ?? 0) > 0;
}

export function getPlanLabel(plan) {
  const normalized = normalizePlanName(plan);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function canAccessCourse(user, requiredPlan) {
  return planMeetsMinimum(user?.plan, requiredPlan);
}

export function canAccessCourseLesson(user, requiredPlan, lessonNumber) {
  if (canAccessCourse(user, requiredPlan)) return true;
  return Number(lessonNumber) === 1;
}
