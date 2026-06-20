import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import LizAvatar from '../features/landing/components/LizAvatar';
import { isAdminUser, normalizePlanName } from '../lib/planAccess';

// Plans that have Liz unlocked. Kept in sync with plan_access.py — any plan
// where `max_liz_messages > 0` should be listed here.
//   Legacy GE: learner / achiever / master
//   IELTS    : monthly + exam (weekly has Liz locked, free has a 5-msg preview)
const ALLOWED_PLANS = ['learner', 'achiever', 'master', 'monthly', 'exam', 'free'];

/**
 * Persistent Liz CTA, positioned bottom-center on every page (per 2026-04-19
 * product decision — previously bottom-right floating). On mobile the button
 * sits just above the MobileBottomNav so it doesn't overlap the nav tabs.
 */
export default function LizFloatingButton({ user }) {
  const navigate = useNavigate();
  const hasAccess =
    !!user && (isAdminUser(user) || ALLOWED_PLANS.includes(normalizePlanName(user.plan)));

  return (
    // Hidden on mobile: MobileBottomNav / DashboardBottomNav already surface
    // Liz as the raised center tab, so rendering this FAB too would stack two
    // Liz entry points on top of each other. Desktop keeps the FAB — no
    // bottom nav there.
    <button
      onClick={() => navigate(hasAccess ? '/liz' : '/pricing')}
      /* Centred in the CONTENT area, not the viewport: the 264px left rail shifts
         the true centre right, so without this the button sat left-of-centre over
         the dashboard cards. +132px = half the rail width (lg only). */
      className="hidden md:block fixed left-1/2 -translate-x-1/2 lg:left-[calc(50%+132px)] md:bottom-6 z-50 group"
      data-testid="liz-floating-btn"
      aria-label={hasAccess ? 'Ask Liz' : 'Upgrade to unlock Liz'}
    >
      <div className="relative">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-105 border-2 ${
          hasAccess
            ? 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-200/50 group-hover:shadow-xl group-hover:shadow-teal-300/50 border-teal-400/30'
            : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-200/50 border-slate-300/30'
        }`}>
          <LizAvatar size={44} alt={hasAccess ? 'Ask Liz' : 'Upgrade to unlock Liz'} />
        </div>
        {hasAccess ? (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        ) : (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {hasAccess ? 'Ask Liz' : 'Upgrade for Liz'}
        </div>
      </div>
    </button>
  );
}
