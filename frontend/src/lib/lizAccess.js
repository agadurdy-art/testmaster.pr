import { normalizePlanName, planMeetsMinimum } from './planAccess';

export function canAccessLiz(user) {
  return planMeetsMinimum(normalizePlanName(user?.plan), 'learner');
}
