import React from 'react';
import { ArrowLeft, Layers, Filter } from 'lucide-react';
import { T, FONT_DISPLAY } from '../constants';

export default function QuestionBankHeader({
  goBack,
  stats,
  completionStats,
  showCompletionDetail,
  setShowCompletionDetail,
  searchQuery,
  setSearchQuery,
  activeTab,
  showFilters,
  setShowFilters,
  selectedBand,
  selectedTopic,
}) {
  return (
    <>
      {/* Back */}
      <button
        onClick={goBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 0', marginBottom: 14,
          background: 'none', border: 0, cursor: 'pointer',
          color: `hsl(${T.muted})`, fontSize: 13, fontWeight: 500,
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} /> Back
      </button>

      {/* Page Head */}
      <header style={{ marginBottom: 22 }}>
        {/* Title row — icon + kicker/title left, smaller stat chips right (same line) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, flex: '0 0 56px',
              borderRadius: 16,
              background: `linear-gradient(135deg, hsl(${T.brand} / 0.18), hsl(${T.brand} / 0.08))`,
              border: `1px solid hsl(${T.brand} / 0.22)`,
              display: 'grid', placeItems: 'center',
              color: `hsl(${T.brandDark})`,
              boxShadow: `0 2px 6px hsl(${T.brand} / 0.10)`,
            }}>
              <Layers style={{ width: 26, height: 26 }} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: `hsl(${T.brandDark})`, fontWeight: 600 }}>
                Practice
              </div>
              <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 600, letterSpacing: '-0.01em', margin: '4px 0 0' }}>
                Question Bank
              </h1>
            </div>
          </div>

          {/* Stat chips — right side of title row, smaller iOS 26 style cool tint */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {[
              { label: 'Questions', value: stats?.total_questions || 0, testId: 'stat-total-questions' },
              { label: 'Full Tests', value: stats?.full_tests || 0, testId: 'stat-full-tests' },
              { label: 'Topics', value: stats?.topics_count || 0, testId: 'stat-topics' },
            ].map((chip) => (
              <div key={chip.label} data-testid={chip.testId} style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 14px', borderRadius: 12,
                background: 'hsl(210 70% 98%)',
                border: '1px solid hsl(210 60% 90%)',
                fontSize: 13,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 1px 2px hsl(210 30% 50% / 0.04)',
              }}>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: `hsl(${T.ink})`, fontSize: 13 }}>{chip.value}</span>
                <span style={{ color: `hsl(${T.muted})` }}>{chip.label}</span>
              </div>
            ))}
            {completionStats && (
              <button
                data-testid="stat-completion-rate"
                onClick={() => setShowCompletionDetail(!showCompletionDetail)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 14px', borderRadius: 12,
                  background: `hsl(${T.brand} / 0.08)`, border: `1px solid hsl(${T.brand} / 0.28)`,
                  fontSize: 13, cursor: 'pointer', color: `hsl(${T.brandDark})`,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: `hsl(${T.brand})`, boxShadow: `0 0 0 3px hsl(${T.brand} / 0.18)` }} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 13 }}>
                  {completionStats.total_full_completed}/{completionStats.total_full_available}
                </span>
                <span>completed</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <p style={{ margin: '8px 0 0', color: `hsl(${T.muted})`, maxWidth: 620, fontSize: 14 }}>
          Hand-picked IELTS prompts with instant Liz feedback. Filter by topic, difficulty, or band level.
        </p>

        {/* Search bar + Filters pill */}
        <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 999,
            background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})`,
            boxShadow: `0 1px 2px hsl(220 15% 20% / 0.04)`,
            minWidth: 280, maxWidth: 420, flex: '1 1 280px',
          }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 16, height: 16, color: `hsl(${T.muted})`, flex: '0 0 16px' }}>
              <circle cx="9" cy="9" r="6" />
              <path d="M14 14l4 4" />
            </svg>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics, keywords…"
              style={{ border: 0, outline: 0, width: '100%', background: 'transparent', fontSize: 14 }}
            />
          </div>
          {activeTab !== 'tests' && (
            <button
              onClick={() => setShowFilters(v => !v)}
              data-testid="qb-filters-toggle"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 999,
                background: (selectedBand || selectedTopic)
                  ? `hsl(${T.brand} / 0.08)`
                  : 'hsl(210 40% 97%)',
                border: `1px solid ${(selectedBand || selectedTopic) ? `hsl(${T.brand} / 0.32)` : 'hsl(210 30% 92%)'}`,
                fontSize: 13, fontWeight: 500,
                color: (selectedBand || selectedTopic) ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Filter style={{ width: 13, height: 13 }} />
              Filters
              {(selectedBand || selectedTopic) && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '1px 7px', borderRadius: 999,
                  background: `hsl(${T.brand})`, color: 'white',
                }}>
                  {(selectedBand ? 1 : 0) + (selectedTopic ? 1 : 0)}
                </span>
              )}
            </button>
          )}
        </div>
      </header>
    </>
  );
}
