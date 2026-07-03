import React from 'react';
import { Award, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';

// Navigation Tabs (SceneBar) — overview/reading/listening/writing/speaking.
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor);
// the `{fullMode && (...)}` guard stays in the orchestrator.

export default function ResultsTabs({ activeTab, setActiveTab }) {
  return (
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex gap-1 p-1 rounded-2xl border border-white/20"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            >
              {[
                { id: 'overview', label: 'Overview', icon: Award },
                { id: 'reading', label: 'Reading', icon: BookOpen },
                { id: 'listening', label: 'Listening', icon: Headphones },
                { id: 'writing', label: 'Writing', icon: PenTool },
                { id: 'speaking', label: 'Speaking', icon: Mic },
              ].map((tab) => {
                const Icon = tab.icon;
                const selected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    data-testid={`results-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                      selected
                        ? 'text-purple-900 bg-white shadow-lg'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    style={{
                      transform: selected ? 'translateY(-1px)' : 'translateY(0)',
                    }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={selected ? 2.5 : 2} />
                    {tab.label}
                    {selected && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
  );
}
