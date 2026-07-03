import React from 'react';
import { Clock, Settings, HelpCircle, EyeOff } from 'lucide-react';
import { formatTime } from '../lib/format';

// ============ IELTS-STYLE HEADER ============
export default function TestHeader({ timeRemaining, setShowSettings, setShowHelp, setScreenHidden }) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">IELTS</span>
          </div>
          <span className="text-sm text-slate-300">Computer-Delivered Test</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Timer */}
        <div className="flex items-center gap-2 bg-slate-600/50 px-3 py-1 rounded">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{formatTime(timeRemaining)}</span>
        </div>

        {/* Control Buttons */}
        <button
          onClick={() => setShowSettings(true)}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-1"
        >
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button
          onClick={() => setShowHelp(true)}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-1"
        >
          <HelpCircle className="w-4 h-4" /> Help
        </button>
        <button
          onClick={() => setScreenHidden(true)}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm flex items-center gap-1"
        >
          <EyeOff className="w-4 h-4" /> Hide
        </button>
      </div>
    </header>
  );
}
