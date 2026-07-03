import React from 'react';
import { Filter, X } from 'lucide-react';
import { T } from '../constants';

export default function OverviewFilterBar({
  bandLevels,
  topics,
  selectedBand,
  setSelectedBand,
  selectedTopic,
  setSelectedTopic,
  topicDropdownOpen,
  setTopicDropdownOpen,
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: `hsl(${T.fainter})`, fontWeight: 600, marginRight: 4 }}>
        Band
      </span>
      {bandLevels.map(band => {
        const active = selectedBand === band.id;
        return (
          <button
            key={band.id}
            onClick={() => { setSelectedBand(active ? null : band.id); setSelectedTopic(null); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 999,
              background: active ? `hsl(${T.brand} / 0.10)` : `hsl(${T.surface})`,
              border: `1px solid ${active ? `hsl(${T.brand} / 0.5)` : `hsl(${T.border})`}`,
              fontSize: 13, fontWeight: 500,
              color: active ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
              cursor: 'pointer', transition: 'all 150ms',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: band.color }} />
            {band.name}
          </button>
        );
      })}

      <span style={{ width: 8 }} />
      <span style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: `hsl(${T.fainter})`, fontWeight: 600, marginRight: 4 }}>
        Topic
      </span>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setTopicDropdownOpen((v) => !v)}
          data-testid="topic-filter-btn"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 999,
            background: selectedTopic ? `hsl(${T.brand} / 0.10)` : `hsl(${T.surface})`,
            border: `1px solid ${selectedTopic ? `hsl(${T.brand} / 0.5)` : `hsl(${T.border})`}`,
            fontSize: 13, fontWeight: 500,
            color: selectedTopic ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
            cursor: 'pointer',
          }}
        >
          {selectedTopic ? (topics.find(t => t.id === selectedTopic)?.name || 'Topic') : 'All Topics'}
          <Filter style={{ width: 12, height: 12 }} />
        </button>
        {topicDropdownOpen && (
          <>
            {/* outside-click backdrop */}
            <div
              onClick={() => setTopicDropdownOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            />
            <div data-testid="topic-dropdown" style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              width: 288, background: `hsl(${T.surface})`,
              borderRadius: 12, border: `1px solid hsl(${T.border})`,
              boxShadow: `0 12px 40px hsl(220 15% 20% / 0.12)`,
              zIndex: 50, padding: '8px 0', maxHeight: 256, overflowY: 'auto',
            }}>
              <button
                onClick={() => { setSelectedTopic(null); setTopicDropdownOpen(false); }}
                style={{
                  width: '100%', padding: '6px 12px', textAlign: 'left',
                  fontSize: 12, fontWeight: selectedTopic ? 500 : 600,
                  color: selectedTopic ? `hsl(${T.muted})` : `hsl(${T.brandDark})`,
                  background: selectedTopic ? 'none' : `hsl(${T.brand} / 0.08)`,
                  border: 0, cursor: 'pointer',
                }}
              >
                All Topics
              </button>
              <div style={{ borderTop: `1px solid hsl(${T.borderSoft})`, margin: '4px 0' }} />
              {topics.length === 0 && (
                <div style={{ padding: '8px 12px', fontSize: 12, color: `hsl(${T.fainter})` }}>
                  No topics for this band.
                </div>
              )}
              {topics.map(topic => {
                const isSel = selectedTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => { setSelectedTopic(topic.id); setTopicDropdownOpen(false); }}
                    style={{
                      width: '100%', padding: '6px 12px', textAlign: 'left',
                      fontSize: 12, color: isSel ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                      background: isSel ? `hsl(${T.brand} / 0.08)` : 'none',
                      fontWeight: isSel ? 600 : 400,
                      border: 0, cursor: 'pointer',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    <span style={{ marginRight: 6 }}>{topic.icon}</span>{topic.name}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {(selectedBand || selectedTopic) && (
        <button
          onClick={() => { setSelectedBand(null); setSelectedTopic(null); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, color: `hsl(${T.fainter})`,
            background: 'none', border: 0, cursor: 'pointer',
            marginLeft: 8,
          }}
        >
          <X style={{ width: 12, height: 12 }} /> Clear
        </button>
      )}
    </div>
  );
}
