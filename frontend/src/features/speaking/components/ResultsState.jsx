import React from 'react';
import BandRadar from './BandRadar';
import LizCard from './LizCard';
import {
  TRANSCRIPT_TOKENS as FIXTURE_TOKENS,
  SCORES as FIXTURE_SCORES,
  FLUENCY as FIXTURE_FLUENCY,
} from '../constants';

function Transcript({ tokens }) {
  return (
    <p
      style={{
        fontSize: 18,
        lineHeight: 1.75,
        color: 'hsl(222 47% 11% / 0.9)',
        whiteSpace: 'pre-wrap',
      }}
    >
      {tokens.map((tok, i) => {
        if (tok.pron) {
          return (
            <span
              key={i}
              className={`sp-pron sp-pron-${tok.pron}`}
              title={tok.note || tok.ipa}
            >
              {tok.t}
            </span>
          );
        }
        return <React.Fragment key={i}>{tok.t}</React.Fragment>;
      })}
    </p>
  );
}

function CriterionBar({ name, abbr, value, orange }) {
  const pct = Math.round((value / 9) * 100);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 14 }}>
        <div>
          <span style={{ fontWeight: 500 }}>{name}</span>{' '}
          <span className="sp-font-mono" style={{ fontSize: 11, color: 'var(--sp-muted-fg)', letterSpacing: '0.05em' }}>{abbr}</span>
        </div>
        <div
          className="sp-font-display"
          style={{
            fontWeight: 700,
            color: orange ? 'var(--sp-warn-dark)' : 'var(--sp-primary-700)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value.toFixed(1)}
        </div>
      </div>
      <div style={{ marginTop: 6, height: 8, background: 'var(--sp-muted)', borderRadius: 9999, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: orange ? 'var(--sp-warn)' : 'var(--sp-primary)',
            borderRadius: 9999,
          }}
        />
      </div>
    </div>
  );
}

function FluencyStats({ fluency }) {
  const [pausesValue, ...pausesRest] = String(fluency.pauses || '').split(' · ');
  const [fillersValue, ...fillersRest] = String(fluency.fillers || '').split(' · ');
  const [uniqueValue, ...uniqueRest] = String(fluency.unique || '').split(' / ');
  const items = [
    { label: 'Speaking rate', value: fluency.wpm, unit: 'wpm' },
    { label: 'Pauses', value: pausesValue || '—', unit: pausesRest.length ? `· ${pausesRest.join(' · ')}` : '' },
    { label: 'Fillers', value: fillersValue || '—', unit: fillersRest.length ? `· ${fillersRest.join(' · ')}` : '' },
    { label: 'Unique words', value: uniqueValue || '—', unit: uniqueRest.length ? `/ ${uniqueRest.join(' / ')}` : '' },
  ];
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid var(--sp-border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 20,
        fontSize: 13,
      }}
    >
      {items.map(it => (
        <div key={it.label}>
          <div className="sp-mono-label">{it.label}</div>
          <div style={{ fontSize: 17, fontWeight: 500, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {it.value}{' '}
            <span style={{ color: 'var(--sp-muted-fg)', fontSize: 13, fontWeight: 400 }}>
              {it.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResultsState({ data, onRetryCard, onNewCard }) {
  const SCORES = data?.scores || FIXTURE_SCORES;
  const FLUENCY = data?.fluency || FIXTURE_FLUENCY;
  const TRANSCRIPT_TOKENS = data?.transcript_tokens || FIXTURE_TOKENS;
  const lizNote = data?.liz_note;
  return (
    <section style={{ background: 'white', borderTop: '1px solid var(--sp-border)', borderBottom: '1px solid var(--sp-border)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 32px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span
            className="sp-font-mono"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 26, height: 26, borderRadius: 9999,
              border: '1.5px solid var(--sp-foreground)',
              fontWeight: 700, fontSize: 12,
            }}
          >
            4
          </span>
          <span className="sp-mono-label">State · Results · two‑panel</span>
        </div>

        {/* Meta strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, fontSize: 13 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 9999,
                background: 'var(--sp-primary-50)',
                color: 'var(--sp-primary-700)',
                fontWeight: 500,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Scored
            </span>
            <span style={{ color: 'var(--sp-muted-fg)' }}>
              Part 2 · People · <span className="sp-font-mono">cc‑006</span>
            </span>
            <span style={{ color: 'var(--sp-muted-fg)' }}>·</span>
            <span style={{ color: 'var(--sp-muted-fg)' }}>{FLUENCY.duration} · {FLUENCY.words} words</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="sp-btn-secondary" style={{ height: 36, fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Save to journal
            </button>
            <button className="sp-btn-secondary" style={{ height: 36, fontSize: 13 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 6l-4-4-4 4M12 2v14M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Two-panel layout */}
        <div
          className="sp-results-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* LEFT */}
          <div
            style={{
              background: 'var(--sp-card)',
              borderRadius: 'var(--sp-radius)',
              border: '1px solid var(--sp-border)',
              boxShadow: 'var(--sp-shadow-card)',
              padding: 32,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="sp-mono-label">Your transcript</div>
                <h3 className="sp-font-display" style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>
                  Word‑level pronunciation
                </h3>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'var(--sp-muted)',
                  borderRadius: 9999,
                  padding: '4px 12px 4px 4px',
                  border: '1px solid var(--sp-border)',
                }}
              >
                <button
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9999,
                    background: 'var(--sp-primary)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 20 }}>
                  {[30, 60, 90, 55, 80, 40, 70, 45, 90, 65, 30, 55, 80, 40, 60, 75, 35, 50].map((h, i) => (
                    <span
                      key={i}
                      style={{
                        width: 2,
                        height: `${h}%`,
                        background: i < 6 ? 'var(--sp-primary)' : 'hsl(222 47% 11% / 0.25)',
                        borderRadius: 2,
                      }}
                    />
                  ))}
                </div>
                <span
                  className="sp-font-mono"
                  style={{ fontSize: 11, color: 'var(--sp-muted-fg)', fontVariantNumeric: 'tabular-nums' }}
                >
                  0:42 / {FLUENCY.duration.replace(/min|s|\s/g, '').replace('2', '2:')}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 16,
                fontSize: 12,
                color: 'var(--sp-muted-fg)',
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid var(--sp-border)',
              }}
            >
              <span className="sp-mono-label">Pronunciation</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 24, height: 3, borderRadius: 2, background: 'var(--sp-primary)' }} />
                Clear
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 24, height: 3, borderRadius: 2, background: 'var(--sp-warn)' }} />
                Minor issue
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 24,
                    height: 3,
                    borderRadius: 2,
                    background: 'repeating-linear-gradient(135deg, hsl(0 78% 55%) 0 2px, transparent 2px 4px)',
                  }}
                />
                Needs work
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 12 }}>Tap any word to hear it</span>
            </div>

            <Transcript tokens={TRANSCRIPT_TOKENS} />

            {/* Inline popover preview */}
            <div
              style={{
                marginTop: 24,
                display: 'inline-flex',
                alignItems: 'stretch',
                borderRadius: 12,
                border: '1px solid var(--sp-border)',
                background: 'hsl(210 40% 96% / 0.6)',
                overflow: 'hidden',
              }}
            >
              <div style={{ background: 'white', padding: '12px 16px' }}>
                <div className="sp-mono-label" style={{ marginBottom: 4 }}>Tapped · thoughtful</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sp-font-display" style={{ fontSize: 18 }}>thoughtful</span>
                  <span className="sp-font-mono" style={{ fontSize: 13, color: 'var(--sp-muted-fg)' }}>/ˈθɔːtfəl/</span>
                </div>
              </div>
              <div style={{ padding: '12px 16px', fontSize: 13, color: 'hsl(222 47% 11% / 0.8)', display: 'flex', alignItems: 'center', maxWidth: 360 }}>
                You said{' '}
                <span className="sp-font-mono" style={{ color: 'var(--sp-destructive)', marginLeft: 4 }}>
                  /ˈtɔːtfəl/
                </span>{' '}— the /θ/ sound came out as /t/.
              </div>
              <button
                style={{
                  padding: '0 16px',
                  background: 'var(--sp-primary)',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: 13,
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7L8 5z" /></svg>
                Hear it
              </button>
            </div>

            <FluencyStats fluency={FLUENCY} />
          </div>

          {/* RIGHT scorecard */}
          <aside
            className="sp-results-aside"
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            {/* Overall */}
            <div
              style={{
                background: 'var(--sp-card)',
                borderRadius: 'var(--sp-radius)',
                border: '1px solid var(--sp-border)',
                boxShadow: 'var(--sp-shadow-lift)',
                padding: 28,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: 'radial-gradient(600px 240px at 50% -20%, hsl(160 60% 92% / 0.8), transparent 60%)',
                }}
              />
              <div style={{ position: 'relative' }}>
                <div
                  className="sp-font-mono"
                  style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--sp-primary-700)' }}
                >
                  Overall Band
                </div>
                <div
                  className="sp-font-display"
                  style={{
                    fontWeight: 700,
                    fontSize: 120,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: 'var(--sp-primary-700)',
                    fontVariantNumeric: 'tabular-nums',
                    marginTop: 8,
                  }}
                >
                  {SCORES.overall.toFixed(1)}
                </div>
                <div style={{ fontSize: 16, marginTop: 8 }}>
                  Competent User ·{' '}
                  <span style={{ color: 'var(--sp-muted-fg)' }}>
                    you're {(SCORES.target - SCORES.overall).toFixed(1)} from your target of {SCORES.target.toFixed(1)}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  {[
                    { bg: 'var(--sp-primary-200)' },
                    { bg: 'var(--sp-primary-200)' },
                    { bg: 'var(--sp-primary)' },
                    { bg: 'var(--sp-muted)' },
                    { bg: 'var(--sp-muted)' },
                  ].map((s, i) => (
                    <span
                      key={i}
                      style={{
                        width: 48,
                        height: 6,
                        borderRadius: 9999,
                        background: s.bg,
                      }}
                    />
                  ))}
                </div>
                <div
                  className="sp-font-mono"
                  style={{
                    marginTop: 8,
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--sp-muted-fg)',
                  }}
                >
                  5.5&nbsp;&nbsp;6.0&nbsp;&nbsp;
                  <span style={{ color: 'var(--sp-primary-700)' }}>6.5</span>
                  &nbsp;&nbsp;7.0&nbsp;&nbsp;7.5
                </div>
              </div>
            </div>

            {/* Radar + bars */}
            <div
              style={{
                background: 'var(--sp-card)',
                borderRadius: 'var(--sp-radius)',
                border: '1px solid var(--sp-border)',
                padding: 24,
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div className="sp-mono-label">Four criteria</div>
                <div className="sp-font-display" style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
                  Where the points came from
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BandRadar fc={SCORES.fc} lr={SCORES.lr} gra={SCORES.gra} pr={SCORES.pr} />
              </div>

              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CriterionBar name="Fluency & Coherence" abbr="FC" value={SCORES.fc} />
                <CriterionBar name="Lexical Resource" abbr="LR" value={SCORES.lr} />
                <CriterionBar name="Grammatical Range & Accuracy" abbr="GRA" value={SCORES.gra} />
                <CriterionBar name="Pronunciation" abbr="PR" value={SCORES.pr} orange />
              </div>
            </div>
          </aside>
        </div>

        <LizCard
          variant="coach"
          actions={(
            <>
              <button className="sp-btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
                Practise /θ/ · 5‑minute drill
              </button>
              <button className="sp-btn-secondary" onClick={onRetryCard}>
                Try this cue card again
              </button>
              <button
                className="sp-btn-ghost"
                style={{ marginLeft: 'auto' }}
                onClick={onNewCard}
              >
                Draw a new cue card →
              </button>
            </>
          )}
        >
          {lizNote ? (
            lizNote
          ) : (
            <>
              Your pronunciation of{' '}
              <span
                className="sp-font-mono"
                style={{
                  fontSize: 19,
                  background: 'white',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid hsl(262 52% 55% / 0.2)',
                }}
              >
                /θ/
              </span>{' '}
              sounds like{' '}
              <span
                className="sp-font-mono"
                style={{
                  fontSize: 19,
                  background: 'white',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid hsl(262 52% 55% / 0.2)',
                }}
              >
                /t/
              </span>{' '}
              — a common pattern for Vietnamese speakers. The rest of your speech is smooth; fix this one sound and you jump to{' '}
              <span style={{ fontWeight: 700 }}>6.5 → 7.0</span> easily.
            </>
          )}
        </LizCard>

        {/* Examiner's rubric */}
        <details
          style={{
            marginTop: 24,
            background: 'hsl(210 40% 96% / 0.4)',
            border: '1px solid var(--sp-border)',
            borderRadius: 'var(--sp-radius)',
            padding: 20,
          }}
        >
          <summary
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              listStyle: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="sp-mono-label">Examiner's rubric</span>
              <span style={{ fontSize: 14 }}>Why Liz scored Pronunciation 6.0 and not 6.5</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div
            style={{
              marginTop: 16,
              fontSize: 14.5,
              color: 'hsl(222 47% 11% / 0.85)',
              lineHeight: 1.6,
              maxWidth: 780,
            }}
          >
            <p>
              Your word stress and intonation are natural (a 6.5 trait), but the consistent /θ/ → /t/ substitution is a phoneme‑level issue that Cambridge descriptors flag at Band 6. Lexical stress on multi‑syllable words (<em>in‑<strong>flu</strong>‑enced</em>) came through clearly — that's why FC and LR held their line.
            </p>
          </div>
        </details>

        <style>{`
          @media (min-width: 1024px) {
            .speaking-scope .sp-results-grid { grid-template-columns: 1fr 440px !important; }
            .speaking-scope .sp-results-aside { position: sticky; top: 96px; }
          }
          .speaking-scope details > summary::-webkit-details-marker { display: none; }
        `}</style>
      </div>
    </section>
  );
}
