import React from 'react';
import { BookOpen, Headphones, PenTool, Mic, Info, ChevronRight } from 'lucide-react';

// Hero Section - Glassmorphism Design (band showcase + clickable skills grid).
// JSX extracted verbatim from pages/CambridgeTestResults.js (Faz2 refactor).

export default function ResultsHero({
  computedOverall,
  results,
  testData,
  bookId,
  testId,
  fullMode,
  activeTab,
  setActiveTab,
  showBandTooltip,
  setShowBandTooltip,
}) {
  return (
        <div
          className="relative mb-6 p-8 rounded-3xl border border-white/20 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-1/3 -left-8 w-16 h-16 bg-purple-300/20 rounded-full animate-bounce"></div>
            <div className="absolute bottom-4 right-1/4 w-12 h-12 bg-blue-300/20 rounded-full animate-ping"></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Your IELTS Results</h1>
              <p className="text-white/80">{testData.title || `Cambridge IELTS ${bookId?.toUpperCase()} - ${testId}`}</p>
            </div>

            {/* Band Score Showcase */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    background: computedOverall >= 7 ? 'linear-gradient(135deg, #10b981, #059669)' :
                               computedOverall >= 6 ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' :
                               computedOverall >= 5 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                               'linear-gradient(135deg, #ef4444, #dc2626)',
                    boxShadow: '0 0 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    animation: 'glow 3s ease-in-out infinite alternate'
                  }}
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">{computedOverall ?? '-'}</div>
                    <div className="text-sm text-white/90 font-medium">BAND SCORE</div>
                  </div>
                </div>
                <button
                  data-testid="band-transparency-toggle"
                  onClick={() => setShowBandTooltip(!showBandTooltip)}
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-xs text-white hover:bg-white/30 transition-all duration-300"
                >
                  <Info className="w-3 h-3 inline mr-1" /> How calculated?
                </button>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'listening', label: 'Listening', band: results?.listening?.band, pct: results?.listening?.percentage, icon: Headphones, color: '#3b82f6', correct: results?.listening?.correct, total: results?.listening?.total },
                { id: 'reading', label: 'Reading', band: results?.reading?.band, pct: results?.reading?.percentage, icon: BookOpen, color: '#10b981', correct: results?.reading?.correct, total: results?.reading?.total },
                { id: 'writing', label: 'Writing', band: results?.writing?.score, pct: null, icon: PenTool, color: '#8b5cf6' },
                { id: 'speaking', label: 'Speaking', band: results?.speaking?.score, pct: null, icon: Mic, color: '#f59e0b' },
              ].map((s, index) => {
                const Icon = s.icon;
                const clickable = fullMode;
                const isActive = activeTab === s.id;
                const Wrapper = clickable ? 'button' : 'div';
                return (
                  <Wrapper
                    key={s.label}
                    onClick={clickable ? () => setActiveTab(s.id) : undefined}
                    data-testid={clickable ? `hero-skill-${s.id}` : undefined}
                    className={`relative p-4 rounded-2xl border border-white/20 backdrop-blur-md transition-all duration-500 ${
                      clickable ? 'cursor-pointer hover:scale-105 hover:bg-white/25' : ''
                    } ${isActive ? 'bg-white/30 scale-105' : 'bg-white/15'}`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: 'slideUp 600ms ease-out forwards'
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                        style={{
                          background: s.color,
                          boxShadow: `0 4px 20px ${s.color}40`
                        }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-white font-medium text-sm mb-1">{s.label}</div>
                      <div className="text-2xl font-bold text-white mb-2">{s.band || '-'}</div>
                      {s.pct != null ? (
                        <>
                          <div className="w-full h-2 bg-white/20 rounded-full mb-1 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 delay-500"
                              style={{
                                width: `${Math.round(s.pct)}%`,
                                background: s.color
                              }}
                            />
                          </div>
                          <div className="text-xs text-white/80">{s.correct}/{s.total}</div>
                        </>
                      ) : (
                        <div className="text-xs text-white/60">Not scored</div>
                      )}
                      {clickable && (
                        <div className="text-xs text-white/80 mt-2 flex items-center justify-center gap-1">
                          View Details <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </div>

          <style jsx>{`
            @keyframes glow {
              0%, 100% { box-shadow: 0 0 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
              50% { box-shadow: 0 0 80px rgba(0,0,0,0.4), 0 0 40px currentColor, inset 0 1px 0 rgba(255,255,255,0.3); }
            }
            @keyframes slideUp {
              0% { opacity: 0; transform: translateY(20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
  );
}
