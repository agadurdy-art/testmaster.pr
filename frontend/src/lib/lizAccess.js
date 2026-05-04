import { planMeetsMinimum, isAdminUser } from './planAccess';

export function canAccessLiz(user) {
  if (!user) return false;
  if (isAdminUser(user)) return true;
  return planMeetsMinimum(user.plan, 'learner');
}
