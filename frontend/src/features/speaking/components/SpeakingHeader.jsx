import React from 'react';
import AppShellNav from '../../../components/appshell/AppShellNav';

/**
 * SpeakingHeader
 * --------------
 * Thin wrapper around the app-wide AppShellNav so the Speaking surfaces
 * (Smart Practice, Full Test, Premium) share the SAME sticky header as
 * Dashboard / Question Bank / Progress / Courses — real brand logo that
 * routes to /dashboard, working nav links, plan chip and a profile avatar.
 *
 * Previously this rendered a standalone prototype header with dead `href="#"`
 * links and a hardcoded "7-day streak / MT" badge, which made the page feel
 * like a disconnected landing page.
 */
export default function SpeakingHeader({ user }) {
  return <AppShellNav currentPage="practice" user={user} />;
}
