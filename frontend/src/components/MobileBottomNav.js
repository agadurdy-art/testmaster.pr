import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ClipboardList, GraduationCap, BookOpen, User } from 'lucide-react';

/**
 * App-level mobile bottom nav, shown on every authenticated page except
 * /dashboard* (DashboardLayout renders its own DashboardBottomNav inside
 * the dashboard-scope stylesheet). Visual parity with DashboardBottomNav:
 * 5 tabs with Liz raised in the middle as the one-tap coach entry point.
 *
 * Styles are self-contained (Tailwind + inline) so this component does not
 * need to live inside `.dashboard-scope`.
 */
const TABS = [
  { key: 'home', label: 'Home', path: '/dashboard', Icon: Home, matchPrefix: ['/dashboard'] },
  { key: 'practice', label: 'Practice', path: '/question-bank', Icon: ClipboardList, matchPrefix: ['/question-bank', '/practice-test', '/test'] },
  { key: 'liz', label: 'Liz', path: '/liz', Icon: GraduationCap, matchPrefix: ['/liz'], center: true },
  { key: 'courses', label: 'Courses', path: '/courses', Icon: BookOpen, matchPrefix: ['/courses', '/beginner-course', '/mastery-course', '/advanced-mastery'] },
  { key: 'profile', label: 'Profile', path: '/profile', Icon: User, matchPrefix: ['/profile', '/settings'] },
];

function isActive(currentPath, prefixes) {
  return prefixes.some((p) => currentPath === p || currentPath.startsWith(p + '/'));
}

export default function MobileBottomNav({ currentPath = '' }) {
  const navigate = useNavigate();

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
                className="relative -mt-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  boxShadow: '0 8px 20px -4px rgba(20,184,166,0.45)',
                }}
              >
                <Icon className="w-6 h-6" />
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
