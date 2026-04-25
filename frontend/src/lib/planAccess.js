export const PLAN_TIERS = {
  free: 0,
  explorer: 1,
  learner: 2,
  achiever: 3,
  master: 4,
  // New IELTS-Ace tiers — mapped to legacy tier ranks so existing
  // planMeetsMinimum() gates keep working without touching callsites.
  weekly: 2,
  monthly: 4,
  exam: 3,
};

export const LEGACY_PLAN_ALIASES = {
  starter: 'learner',
  booster: 'achiever',
  pro: 'master',
};

// Keep in sync with backend/plan_access.py ADMIN_EMAILS_FOR_BYPASS.
const ADMIN_EMAILS = ['aga.durdy@gmail.com'];

export function isAdminUser(user) {
  const email = (user?.email || '').toString().trim().toLowerCase();
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}

// New-tier names the app ships to customers today. Used by UI to decide
// whether a user is on one of the current paid plans.
export const NEW_PAID_PLANS = ['weekly', 'monthly', 'exam'];

export function isOnNewPaidPlan(user) {
  const plan = normalizePlanName(user?.plan);
  return NEW_PAID_PLANS.includes(plan);
}

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
  if (isAdminUser(user)) return true;
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
