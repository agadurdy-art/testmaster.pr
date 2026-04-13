import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, TrendingUp, User } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { key: 'practice', label: 'Practice', path: '/question-bank', icon: BookOpen },
  { key: 'liz', label: 'Liz', path: '/liz', icon: null, isCenter: true },
  { key: 'progress', label: 'Progress', path: '/progress', icon: TrendingUp },
  { key: 'profile', label: 'Profile', path: '/profile', icon: User },
];

export default function MobileBottomNav({ currentPath }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-100 shadow-lg md:hidden">
      <div className="max-w-7xl mx-auto px-2 pb-safe flex justify-between items-end py-1">
        {NAV_ITEMS.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center flex-1 -mt-5"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition ${
                  isActive
                    ? 'bg-violet-700 shadow-violet-300'
                    : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200'
                }`}>
                  <img src="/liz-avatar.svg" alt="Liz" className="w-10 h-10 rounded-xl object-cover"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<span class="text-white font-bold text-lg">L</span>';
                    }} />
                </div>
                <span className="text-[10px] font-semibold text-violet-600 mt-1">Liz</span>
              </button>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center flex-1 py-1 mx-1 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? 'text-violet-700 bg-violet-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
