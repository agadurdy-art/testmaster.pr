import React from 'react';
import { PARTS, TOPICS } from '../constants';
import LizCard from './LizCard';

const ICON_SIZE = 28;

function PartIcon({ partId }) {
  if (partId === 'fulltest') {
    return (
      <div
        className="sp-part-icon"
        style={{
          background: 'var(--sp-primary-50, #ecfdf5)',
          border: '1px solid var(--sp-primary-200, #a7f3d0)',
        }}
      >
        <svg viewBox="0 0 32 32" width={ICON_SIZE} height={ICON_SIZE} fill="none"
             stroke="hsl(160 82% 27%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9h20" />
          <path d="M6 16h20" />
          <path d="M6 23h20" />
          <circle cx="9" cy="9" r="1.6" fill="hsl(160 82% 27%)" />
          <circle cx="16" cy="16" r="1.6" fill="hsl(160 82% 27%)" />
          <circle cx="23" cy="23" r="1.6" fill="hsl(160 82% 27%)" />
        </svg>
      </div>
    );
  }
  if (partId === 'part1') {
    return (
      <div
        className="sp-part-icon"
        style={{
          background: 'var(--sp-secondary-50)',
          borderColor: 'hsl(199 90% 90%)',
          border: '1px solid hsl(199 90% 90%)',
        }}
      >
        <svg viewBox="0 0 32 32" width={ICON_SIZE} height={ICON_SIZE} fill="none"
             stroke="hsl(199 89% 40%)" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="16" cy="16" r="4" />
          <circle cx="16" cy="16" r="9" />
          <circle cx="16" cy="16" r="13.5" strokeDasharray="2 3" />
        </svg>
      </div>
    );
  }
  if (partId === 'part2') {
    return (
      <div
        className="sp-part-icon"
        style={{
          background: 'white',
          border: '1px solid var(--sp-primary-200)',
        }}
      >
        <svg viewBox="0 0 32 32" width={ICON_SIZE} height={ICON_SIZE} fill="none"
             stroke="hsl(160 82% 27%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="7" width="22" height="18" rx="2" transform="rotate(-3 16 16)" />
          <path d="M10 14 h12 M10 18 h9 M10 22 h7" transform="rotate(-3 16 16)" />
        </svg>
      </div>
    );
  }
  return (
    <div
      className="sp-part-icon"
      style={{
        background: 'var(--sp-accent-50)',
        border: '1px solid var(--sp-accent-100)',
      }}
    >
      <svg viewBox="0 0 32 32" width={ICON_SIZE} height={ICON_SIZE} fill="none"
           stroke="hsl(38 92% 40%)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10 L25 22" />
        <path d="M25 10 L7 22" />
        <circle cx="16" cy="16" r="2.4" fill="hsl(38 92% 40%)" />
      </svg>
    </div>
  );
}

function PartCard({ part, selected, onSelect, onStart, locked }) {
  const cls = 'sp-part-card'
    + (selected ? ' sp-part-card-selected' : '')
    + (locked ? ' sp-part-card-locked' : '');
  return (
    <article className={cls} onClick={onSelect}>
      {locked && (
        <div
          className="sp-part-card-tag"
          style={{ background: 'hsl(38 92% 92%)', color: 'hsl(38 92% 30%)' }}
        >
          Premium · Monthly & Exam Pack
        </div>
      )}
      {!locked && selected && <div className="sp-part-card-tag">Recommended for you</div>}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <PartIcon partId={part.id} />
        <span
          className="sp-font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: selected ? 'var(--sp-primary-700)' : 'var(--sp-muted-fg)',
          }}
        >
          {part.duration}
        </span>
      </div>

      <div style={{ marginTop: 20 }}>
        <div
          className="sp-font-mono"
          style={{
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: selected ? 'var(--sp-primary-700)' : 'var(--sp-muted-fg)',
          }}
        >
          {part.label}
        </div>
        <h3
          className="sp-font-display"
          style={{ fontSize: 24, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}
        >
          {part.title}
        </h3>
        <p
          style={{
            fontSize: 14.5,
            marginTop: 8,
            lineHeight: 1.55,
            color: selected ? 'hsl(222 47% 22%)' : 'var(--sp-muted-fg)',
          }}
        >
          {part.description}
        </p>
      </div>

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--sp-muted-fg)' }}>
          {part.id === 'part2' ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--sp-primary-700)',
                fontWeight: 500,
                fontSize: 12,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              6 topics unlocked
            </span>
          ) : (
            <>
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  background: part.tone === 'secondary' ? 'var(--sp-secondary)' : 'var(--sp-accent)',
                }}
              />
              {part.id === 'part3' ? 'Advanced vocabulary' : 'Short & friendly'}
            </>
          )}
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--sp-muted-fg)' }}>
          Avg · <span style={{ color: 'var(--sp-foreground)', fontWeight: 500 }}>{part.avgTime}</span>
        </span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onStart(); }}
        className={selected ? 'sp-btn-primary' : 'sp-btn-secondary'}
        style={{ width: '100%', marginTop: 24 }}
      >
        {locked
          ? `Unlock ${part.label}`
          : (selected ? `Start ${part.label} →` : `Start ${part.label}`)}
      </button>
    </article>
  );
}

export default function PartSelector({
  selectedPart,
  onSelectPart,
  onStart,
  topics,
  onToggleTopic,
  onClearTopics,
  lockedParts,
}) {
  const lockedSet = lockedParts instanceof Set
    ? lockedParts
    : new Set(lockedParts || []);
  return (
    <section
      style={{
        maxWidth: 1320,
        margin: '0 auto',
        padding: '40px 32px 80px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <span
          className="sp-font-mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 26,
            height: 26,
            borderRadius: 9999,
            border: '1.5px solid var(--sp-foreground)',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          1
        </span>
        <span className="sp-mono-label">State · Part selector · entry</span>
      </div>

      <div
        style={{
          background: 'var(--sp-card)',
          borderRadius: 'var(--sp-radius-lg)',
          border: '1px solid var(--sp-border)',
          boxShadow: 'var(--sp-shadow-card)',
          padding: '40px 48px',
        }}
      >
        <div className="sp-font-mono" style={{ fontSize: 13, color: 'var(--sp-muted-fg)', display: 'flex', gap: 8 }}>
          <span>Speaking</span>
          <span>›</span>
          <span style={{ color: 'var(--sp-foreground)' }}>Choose a part</span>
        </div>

        <div
          style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <h2
              className="sp-font-display"
              style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}
            >
              Which part do you want to practise today?
            </h2>
            <p
              style={{
                color: 'var(--sp-muted-fg)',
                marginTop: 8,
                maxWidth: 560,
                fontSize: 15,
                lineHeight: 1.55,
              }}
            >
              Most Vietnamese test‑takers find Part 2 the hardest — the 1‑minute prep panic is real. You can always stop early.
            </p>
          </div>
          <LizCard>
            You skipped Part 2 last time. Want to try it today? I'll stay with you.
          </LizCard>
        </div>

        {/* Part cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
            marginTop: 40,
          }}
        >
          {PARTS.map(part => (
            <PartCard
              key={part.id}
              part={part}
              locked={lockedSet.has(part.id)}
              selected={selectedPart === part.id}
              onSelect={() => onSelectPart(part.id)}
              onStart={() => { onSelectPart(part.id); onStart(part.id); }}
            />
          ))}
        </div>

        {/* Topic filter */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 32,
            borderTop: '1px solid var(--sp-border)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div>
              <div className="sp-mono-label">Filter by topic</div>
              <div style={{ fontSize: 15, marginTop: 4 }}>
                Picking a topic biases the cue card pool.{' '}
                <span style={{ color: 'var(--sp-muted-fg)' }}>Leave all off for a random draw.</span>
              </div>
            </div>
            <button className="sp-btn-ghost" onClick={onClearTopics}>Clear</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TOPICS.map(topic => {
              const on = topics.has(topic);
              return (
                <button
                  key={topic}
                  className={on ? 'sp-chip sp-chip-on' : 'sp-chip'}
                  onClick={() => onToggleTopic(topic)}
                >
                  {on && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                  {topic}
                </button>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 13,
              color: 'var(--sp-muted-fg)',
              flexWrap: 'wrap',
            }}
          >
            <span className="sp-mono-label">Pool</span>
            <span>214 cue cards · {topics.size} filter{topics.size === 1 ? '' : 's'} active</span>
            <span style={{ color: 'var(--sp-foreground)', opacity: 0.7 }}>·</span>
            <button
              onClick={onStart}
              className="sp-btn-ghost"
              style={{ color: 'var(--sp-primary)', fontWeight: 500, padding: 0 }}
            >
              Draw a random card →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
