import React from 'react';
import { BookOpen, Headphones, PenTool, Mic } from 'lucide-react';

// Band Calculation Tooltip — per-section score → band breakdown panel.
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `{showBandTooltip && (...)}` guard stays in the orchestrator.

export default function BandBreakdown({ results, speakingEvaluations, computedOverall }) {
  return (
          <div
            data-testid="band-calculation-breakdown"
            className="mb-6 p-4 rounded-2xl border border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h4 className="font-semibold text-white text-sm mb-3">Band Score Breakdown</h4>
            <div className="space-y-3 text-sm">
              {results?.listening && (
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-white flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-blue-300" /> Listening
                  </span>
                  <span className="text-white">
                    {results.listening.correct}/{results.listening.total} ({Math.round(results.listening.percentage)}%)
                    <span className="font-bold text-blue-300 ml-2">Band {results.listening.band}</span>
                  </span>
                </div>
              )}
              {results?.reading && (
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-300" /> Reading
                  </span>
                  <span className="text-white">
                    {results.reading.correct}/{results.reading.total} ({Math.round(results.reading.percentage)}%)
                    <span className="font-bold text-green-300 ml-2">Band {results.reading.band}</span>
                  </span>
                </div>
              )}
              {results?.writing?.evaluated && results.writing.score && (
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-white flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-purple-300" /> Writing
                  </span>
                  <span className="font-bold text-purple-300">Band {results.writing.score}</span>
                </div>
              )}
              {Object.keys(speakingEvaluations).length > 0 && (
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                  <span className="text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-orange-300" /> Speaking
                  </span>
                  <span className="font-bold text-orange-300">
                    Band {Math.round((Object.values(speakingEvaluations).reduce((s, e) => s + (e?.overall_band || 0), 0) / Object.keys(speakingEvaluations).length) * 2) / 2}
                  </span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-white/20">
                <div className="flex justify-between items-center text-white font-medium">
                  <span>Overall Score (averaged)</span>
                  <span className="text-xl font-bold">Band {computedOverall ?? '-'}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-white/70 mt-3 text-center">
              Based on official IELTS band descriptors and scoring tables
            </p>
          </div>
  );
}
