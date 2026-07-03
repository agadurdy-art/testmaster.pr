import React from 'react';
import { EyeOff } from 'lucide-react';

// Screen Hidden Overlay
export default function ScreenHiddenOverlay({ setScreenHidden }) {
  return (
    <div className="fixed inset-0 bg-slate-600 flex items-center justify-center z-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            <EyeOff className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">Screen hidden</span>
          <button
            onClick={() => setScreenHidden(false)}
            className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-50">
          <div className="space-y-4 text-slate-700">
            <p>Your answers have been stored.</p>
            <p>Please note that the clock is still running. The time has not been paused.</p>
            <p>If you wish to leave the room, please tell your invigilator.</p>
            <p>Click the button below to go back to your test.</p>
          </div>

          {/* Resume Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setScreenHidden(false)}
              className="px-8 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
            >
              Resume test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
