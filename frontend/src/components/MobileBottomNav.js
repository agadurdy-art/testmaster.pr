import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Headphones, BookOpen, PenTool, Mic, BookMarked } from 'lucide-react';

const NAV_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    key: 'listening',
    label: 'Listening',
    path: '/test/listening',
    icon: Headphones,
  },
  {
    key: 'tips',
    label: 'Tips',
    path: '/tips',
    icon: BookMarked,
  },
  {
    key: 'reading',
    label: 'Reading',
    path: '/test/reading',
    icon: BookOpen,
  },
  {
    key: 'writing',
    label: 'Writing',
    path: '/test/writing',
    icon: PenTool,
  },
  {
    key: 'speaking',
    label: 'Speaking',
    path: '/test/speaking',
    icon: Mic,
  },
];

export default function MobileBottomNav({ currentPath }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-sm md:hidden">
      <div className="max-w-7xl mx-auto px-2 py-1 flex justify-between">
        {NAV_ITEMS.map((item) => {
          const isActive =
            currentPath === item.path ||
            currentPath.startsWith(item.path) ||
            (item.key === 'dashboard' && currentPath === '/dashboard') ||
            (item.key !== 'dashboard' && currentPath.startsWith(`/test/${item.key}`));

          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center flex-1 py-1 mx-1 rounded-md text-[10px] font-medium transition-colors ${
                isActive ? 'bg-sky-50 text-sky-700' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-sky-600' : 'text-gray-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
