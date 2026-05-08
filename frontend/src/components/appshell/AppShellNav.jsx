/**
 * AppShellNav
 * -----------
 * Sticky top header shared by the D8-D11 handoff surfaces (Liz, Question Bank,
 * Progress, Courses). Renders the brand mark, primary nav links, plan chip
 * (with usage meter), and the user avatar — exactly matching the static
 * design handoffs at ~/Desktop/design-handoffs/D8-liz-tutor.html.
 *
 * The component is presentational: pass the active page id, the user, and
 * (optionally) a precomputed plan chip label. It does not own any data.
 *
 * Wrap a page in <div className="appshell-page"> and put <AppShellNav .../>
 * at the top to get the page background tone + sticky header in one shot.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher';
import BrandLogo from '../BrandLogo';
import './appshell.css';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard' },
  { id: 'practice',  label: 'Practice',  to: '/question-bank' },
  { id: 'courses',   label: 'Courses',   to: '/courses' },
  { id: 'liz',       label: 'Liz',       to: '/liz' },
  { id: 'progress',  label: 'Progress',  to: '/progress' },
];

function planLabel(user) {
  if (!user) return 'Free';
  // Map internal plan IDs to user-facing labels (matches IELTS Ace tier names).
  // Backend tier IDs (see plan_access.PLAN_TIERS): free / weekly / monthly / exam.
  // Legacy GE aliases (learner/pro/master/achiever/explorer) are kept so users
  // mid-migration don't see "Free" on the chip when their account is paid.
  const map = {
    free: 'Free',
    weekly: 'Weekly',
    monthly: 'Monthly',
    exam: 'Exam Pack',
    exam_pack: 'Exam Pack', // tolerate legacy spelling on user records
    // Legacy GE plan IDs surface to V2 names so the chip never reads "Master"
    // (V1-only label) on IELTS Ace pages. Mid-migration users see the closest
    // V2 equivalent of what they paid for.
    explorer: 'Free',
    learner: 'Weekly',
    achiever: 'Monthly',
    master: 'Monthly',
    pro: 'Monthly',
  };
  return map[user.plan] || user.plan_label || 'Free';
}

function meterText(lizStatus) {
  if (!lizStatus) return null;
  if (lizStatus.messages_used != null && lizStatus.messages_quota != null) {
    return `${lizStatus.messages_used}/${lizStatus.messages_quota} msgs`;
  }
  return null;
}

function avatarLetter(user) {
  const src = user?.full_name || user?.name || user?.email || 'A';
  return String(src).trim().charAt(0).toUpperCase() || 'A';
}

export default function AppShellNav({ currentPage, user, lizStatus }) {
  const navigate = useNavigate();
  const meter = meterText(lizStatus);
  return (
    <header className="appshell-nav" data-testid="appshell-nav">
      <BrandLogo size="sm" href="/dashboard" />


      <nav className="as-nav-links" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.to}
            className="as-nav-link"
            aria-current={currentPage === item.id ? 'page' : undefined}
            data-testid={`appshell-nav-${item.id}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="as-nav-spacer" />

      <Link to="/pricing/v2" className="as-plan-chip" title="Your IELTS Ace plan">
        <span className="as-dot" />
        <b>{planLabel(user)}</b>
        {meter ? <span className="as-meter">{meter}</span> : null}
      </Link>

      <LanguageSwitcher iconOnly />

      <button
        type="button"
        className="as-avatar-me"
        aria-label="Account"
        onClick={() => navigate('/profile')}
        data-testid="appshell-avatar"
      >
        {avatarLetter(user)}
      </button>
    </header>
  );
}
