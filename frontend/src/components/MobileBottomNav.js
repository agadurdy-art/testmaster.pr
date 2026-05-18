import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ClipboardList, GraduationCap, BookOpen, User, Gamepad2, Repeat } from 'lucide-react';
import { LIZ_AVATAR_URL, RAY_AVATAR_URL } from '../lib/brand';

/**
 * App-level mobile bottom nav, shown on every authenticated page except
 * /dashboard*, /onboarding*, and a small allow-list (see MobileNavWrapper
 * in App.js).
 *
 * GE-aware: when `mode === 'general'` the center tab swaps Liz → Ray and
 * the IELTS-only tabs (Practice = question-bank, Courses = /courses) are
 * replaced with GE equivalents (Games → /game-bank, Stages → /unified) so
 * a kid never lands on an IELTS Question Bank or mastery course list.
 */
const IELTS_TABS = [
  { key: 'home', label: 'Home', path: '/dashboard', Icon: Home, matchPrefix: ['/dashboard'] },
  { key: 'practice', label: 'Practice', path: '/question-bank', Icon: ClipboardList, matchPrefix: ['/question-bank', '/practice-test', '/test'] },
  { key: 'coach', label: 'Liz', path: '/liz', Icon: GraduationCap, matchPrefix: ['/liz'], center: true, avatar: LIZ_AVATAR_URL },
  { key: 'courses', label: 'Courses', path: '/courses', Icon: BookOpen, matchPrefix: ['/courses', '/beginner-course', '/mastery-course', '/advanced-mastery'] },
  { key: 'profile', label: 'Profile', path: '/profile', Icon: User, matchPrefix: ['/profile', '/settings'] },
];

const GE_TABS = [
  { key: 'home', label: 'Home', path: '/dashboard', Icon: Home, matchPrefix: ['/dashboard', '/ge/dashboard'] },
  { key: 'review', label: 'Review', path: '/daily-practice', Icon: Repeat, matchPrefix: ['/daily-practice'] },
  { key: 'coach', label: 'Ray', path: '/landing/ge', Icon: GraduationCap, matchPrefix: ['/landing/ge'], center: true, avatar: RAY_AVATAR_URL },
  { key: 'stages', label: 'Stages', path: '/unified', Icon: BookOpen, matchPrefix: ['/unified', '/game-bank'] },
  { key: 'profile', label: 'Profile', path: '/profile', Icon: User, matchPrefix: ['/profile', '/settings'] },
];
// `games` icon kept on import in case a tier shows a Games tab later.
void Gamepad2;

function isActive(currentPath, prefixes) {
  return prefixes.some((p) => currentPath === p || currentPath.startsWith(p + '/'));
}

// Detect GE mode from (a) explicit `mode` prop, (b) user.learning_mode in
// localStorage, (c) current URL path. Any signal pointing to general
// English flips the nav.
function detectGEMode(mode, currentPath) {
  if (mode === 'general' || mode === 'general_english') return true;
  if (mode === 'ielts') return false;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.learning_mode === 'general_english') return true;
    if (user?.learning_mode === 'ielts') return false;
  } catch (_) { /* non-fatal */ }
  if (typeof currentPath === 'string') {
    if (currentPath.startsWith('/landing/ge') || currentPath.startsWith('/ge/') || currentPath.startsWith('/unified')) return true;
  }
  return false;
}

export default function MobileBottomNav({ currentPath = '', mode }) {
  const navigate = useNavigate();
  const isGE = detectGEMode(mode, currentPath);
  const TABS = isGE ? GE_TABS : IELTS_TABS;
  const coachGradient = isGE
    ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
    : 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)';
  const coachShadow = isGE
    ? '0 8px 20px -4px rgba(234, 88, 12, 0.45)'
    : '0 8px 20px -4px rgba(20,184,166,0.45)';

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t md:hidden"
      style={{
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        borderColor: 'rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex items-end justify-around max-w-[520px] mx-auto px-2 pb-2 pt-1.5 relative">
        {TABS.map((tab) => {
          const active = isActive(currentPath, tab.matchPrefix);
          const Icon = tab.Icon;
          if (tab.center) {
            return (
              <button
                key={tab.key}
                type="button"
                aria-label={tab.label}
                onClick={() => navigate(tab.path)}
                className="relative -mt-5 w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-lg transition-transform active:scale-95"
                style={{
                  background: coachGradient,
                  boxShadow: coachShadow,
                }}
              >
                <img
                  src={tab.avatar}
                  alt=""
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          }
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-0.5 py-2 px-3 transition-colors"
              style={{ color: active ? '#0f172a' : '#64748b' }}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2 : 1.6} />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-medium' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
