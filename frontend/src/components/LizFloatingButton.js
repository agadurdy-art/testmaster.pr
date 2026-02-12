import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function LizFloatingButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/liz')}
      className="fixed bottom-6 right-6 z-50 group"
      data-testid="liz-floating-btn"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:shadow-xl group-hover:shadow-teal-300/50 transition-all group-hover:scale-105 border-2 border-teal-400/30">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Ask Liz
        </div>
      </div>
    </button>
  );
}
