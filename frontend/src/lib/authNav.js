/**
 * Shared helpers for the public-marketing navs (LandingNav, PricingNav,
 * PublicNav). These pages live at /pricing, /about, /samples/*, /score-my-essay
 * and are reachable both from logged-out visitors and from authenticated
 * users (the dashboard TopBar links to /pricing; users clicking About in
 * the drawer; sample report links pasted into chat etc.).
 *
 * Before 2026-05-23 each nav unconditionally rendered "Log in" + "Start
 * free" CTAs, making the page feel like the user had been kicked back to
 * the marketing site. Aga: "dashboard icinde pricing tiklaninca disari
 * landpage benzeri yerlere atiyor ... login olduktan sonra landpage degil
 * icerde islerini halledebilmeli". These helpers let each nav swap to
 * dashboard-flavoured chrome when an authenticated user is detected.
 */

import { isIeltsMode } from './learningMode';

export function readAuthUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

export function dashboardPathFor(user) {
  // GE users get the magical-library dashboard; everyone else (IELTS or
  // mode-less) gets the IELTS dashboard. Mirrors the routing in App.js for
  // /dashboard so "Back to dashboard" lands users where they expect.
  if (!user) return '/dashboard';
  return isIeltsMode(user) ? '/dashboard' : '/ge/dashboard';
}

export function initialsFor(user) {
  if (!user) return '?';
  if (user.initials) return user.initials;
  const name = user.firstName || user.name || user.email || '';
  return (name[0] || '?').toUpperCase();
}

export function firstNameFor(user) {
  if (!user) return '';
  if (user.firstName) return user.firstName;
  const name = user.name || '';
  return name.split(' ')[0] || '';
}
