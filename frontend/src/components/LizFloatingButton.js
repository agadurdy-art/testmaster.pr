import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock } from 'lucide-react';

const ALLOWED_PLANS = ['booster', 'pro'];

export default function LizFloatingButton({ user }) {
  const navigate = useNavigate();
  const hasAccess = user && ALLOWED_PLANS.includes(user.plan);

  return (
    <button
      onClick={() => navigate(hasAccess ? '/liz' : '/pricing')}
      className="fixed bottom-6 right-6 z-50 group"
      data-testid="liz-floating-btn"
    >
      <div className="relative">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all group-hover:scale-105 border-2 ${
          hasAccess
            ? 'bg-gradient-to-br from-teal-500 to-emerald-600 shadow-teal-200/50 group-hover:shadow-xl group-hover:shadow-teal-300/50 border-teal-400/30'
            : 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-200/50 border-slate-300/30'
        }`}>
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        {hasAccess ? (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        ) : (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-white" />
          </div>
        )}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {hasAccess ? 'Ask Liz' : 'Upgrade for Liz'}
        </div>
      </div>
    </button>
  );
}
