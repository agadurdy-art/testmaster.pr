import { planMeetsMinimum } from './planAccess';

export function canAccessLiz(user) {
  if (!user) return false;
  return planMeetsMinimum(user.plan, 'learner');
}
