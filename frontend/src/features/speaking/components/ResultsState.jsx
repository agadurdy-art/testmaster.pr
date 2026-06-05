import React, { useEffect, useRef, useState } from 'react';
import BandRadar from './BandRadar';
import LizCard from './LizCard';
import PremiumPronunciationDrawer from './PremiumPronunciationDrawer';
import {
  TRANSCRIPT_TOKENS as FIXTURE_TOKENS,
  SCORES as FIXTURE_SCORES,
  FLUENCY as FIXTURE_FLUENCY,
} from '../constants';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

function resolveAudioSrc(audioUrl) {
  if (!audioUrl) return null;
  if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
  // Relative paths come back as `/static/recordings/...` from the backend.
  return `${API_BASE}${audioUrl}`;
}

function fmtMMSS(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

const PLAYER_SPEEDS = [0.75, 1, 1.5];

function AudioPlayer({ src, fallbackDurationLabel }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1); // default 1x

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return undefined;
    const onTime = () => setCurrent(a.currentTime || 0);
    const onMeta = () => setTotal(Number.isFinite(a.duration) ? a.duration : 0);
    const onEnd = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('ended', onEnd);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('ended', onEnd);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [src]);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = PLAYER_SPEEDS[speedIdx];
  }, [speedIdx, src]);

  if (!src) {
    return (
      <span
        className="sp-font-mono"
        style={{ fontSize: 11, color: 'var(--sp-muted-fg)' }}
      >
        Audio not available
      </span>
    );
  }

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play();
    else a.pause();
  };

  const seek = (delta) => {
    const a = audioRef.current;
    if (!a || !total) return;
    a.currentTime = Math.max(0, Math.min(total, (a.currentTime || 0) + delta));
  };

  const pct = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const totalLabel = total > 0 ? fmtMMSS(total) : (fallbackDurationLabel || '—');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'var(--sp-muted)',
        borderRadius: 9999,
        padding: '4px 12px 4px 4px',
        border: '1px solid var(--sp-border)',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" style={{ display: 'none' }} />
      <button
        onClick={toggle}
        aria-label={playing ? 'Pause recording' : 'Play recording'}
        style={{
          width: 28,
          height: 28,
          borderRadius: 9999,
          background: 'var(--sp-primary)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        {playing ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        )}
      </button>
      <button
        onClick={() => seek(-5)}
        title="Back 5 seconds"
        aria-label="Back 5 seconds"
        style={{
          width: 24, height: 24, borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 9, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        −5
      </button>
      <button
        onClick={() => seek(5)}
        title="Forward 5 seconds"
        aria-label="Forward 5 seconds"
        style={{
          width: 24, height: 24, borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 9, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        +5
      </button>
      <div
        onClick={(e) => {
          const a = audioRef.current;
          if (!a || !total) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          a.currentTime = Math.max(0, Math.min(total, ratio * total));
        }}
        style={{
          width: 120,
          height: 4,
          background: 'hsl(222 47% 11% / 0.18)',
          borderRadius: 9999,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            background: 'var(--sp-primary)',
            borderRadius: 9999,
          }}
        />
      </div>
      <span
        className="sp-font-mono"
        style={{ fontSize: 11, color: 'var(--sp-muted-fg)', fontVariantNumeric: 'tabular-nums', minWidth: 64, textAlign: 'right' }}
      >
        {fmtMMSS(current)} / {totalLabel}
      </span>
      <button
        onClick={() => setSpeedIdx((i) => (i + 1) % PLAYER_SPEEDS.length)}
        title="Playback speed"
        aria-label={`Playback speed ${PLAYER_SPEEDS[speedIdx]}x`}
        className="sp-font-mono"
        style={{
          padding: '3px 8px', borderRadius: 9999,
          background: 'transparent',
          border: '1px solid var(--sp-border)',
          color: 'var(--sp-foreground)',
          fontSize: 11,
          cursor: 'pointer',
          minWidth: 38,
        }}
      >
        {PLAYER_SPEEDS[speedIdx]}×
      </button>
    </div>
  );
}

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

// Split the flat user-only transcript tokens (in order) across the candidate's
// conversation turns, so each answer can be rendered with its own word-level
// pronunciation colouring. Greedy: consume tokens for a turn until their
// concatenated text covers the turn's text (compared on letters/digits only,
// so spacing/punctuation differences don't break alignment).
function splitTokensByTurns(tokens, userMessages) {
  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const slices = [];
  let ti = 0;
  for (let m = 0; m < userMessages.length; m++) {
    const targetLen = norm(userMessages[m]).length;
    const slice = [];
    let accLen = 0;
    const isLast = m === userMessages.length - 1;
    while (ti < tokens.length && (accLen < targetLen || isLast)) {
      slice.push(tokens[ti]);
      accLen += norm(tokens[ti].t).length;
      ti += 1;
      if (!isLast && accLen >= targetLen) break;
    }
    slices.push(slice);
  }
  return slices;
}

// Render a token slice with the same pronunciation colouring as <Transcript>.
function ColoredTokens({ tokens }) {
  return (
    <>
      {tokens.map((tok, i) =>
        tok.pron ? (
          <span key={i} className={`sp-pron sp-pron-${tok.pron}`} title={tok.note || tok.ipa}>{tok.t}</span>
        ) : (
          <React.Fragment key={i}>{tok.t}</React.Fragment>
        ),
      )}
    </>
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

/**
 * CEFR vocabulary distribution (task #137). Renders a stacked horizontal
 * bar of A1→C2 percentages plus chips of B2 / C1+ example words from the
 * candidate's transcript. Returns null when the LLM declined to estimate
 * (all-zero profile or undefined) so we don't show an empty bar.
 */
function VocabularyProfileBar({ profile }) {
  if (!profile) return null;
  const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
  const total = levels.reduce((s, k) => s + (Number(profile[k]) || 0), 0);
  if (total <= 0) return null;
  const colors = {
    a1: 'hsl(200 70% 70%)',
    a2: 'hsl(200 70% 60%)',
    b1: 'hsl(160 55% 50%)',
    b2: 'hsl(140 60% 45%)',
    c1: 'hsl(40 90% 55%)',
    c2: 'hsl(20 85% 55%)',
  };
  const b2Examples = Array.isArray(profile.b2_examples) ? profile.b2_examples : [];
  const cExamples = Array.isArray(profile.c1_c2_examples) ? profile.c1_c2_examples : [];
  return (
    <div
      style={{
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid var(--sp-border)',
      }}
    >
      <div className="sp-mono-label" style={{ marginBottom: 8 }}>
        Vocabulary range (CEFR)
      </div>
      <div
        role="img"
        aria-label={`Vocabulary distribution: ${levels
          .map((k) => `${k.toUpperCase()} ${Math.round(profile[k] || 0)}%`)
          .join(', ')}`}
        style={{
          display: 'flex',
          height: 14,
          borderRadius: 7,
          overflow: 'hidden',
          border: '1px solid var(--sp-border)',
          background: 'var(--sp-muted-bg, #f4f4f5)',
        }}
      >
        {levels.map((k) => {
          const pct = Math.max(0, Number(profile[k]) || 0);
          if (pct <= 0) return null;
          return (
            <div
              key={k}
              title={`${k.toUpperCase()} ${Math.round(pct)}%`}
              style={{ width: `${(pct / total) * 100}%`, background: colors[k] }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 8,
          fontSize: 12,
          color: 'var(--sp-muted-fg)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {levels.map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: colors[k],
                display: 'inline-block',
              }}
            />
            {k.toUpperCase()} {Math.round(profile[k] || 0)}%
          </span>
        ))}
      </div>
      {(b2Examples.length > 0 || cExamples.length > 0) && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {b2Examples.map((w) => (
            <span
              key={`b2-${w}`}
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'hsl(140 60% 95%)',
                color: 'hsl(140 60% 28%)',
                border: '1px solid hsl(140 60% 80%)',
              }}
            >
              B2 · {w}
            </span>
          ))}
          {cExamples.map((w) => (
            <span
              key={`c-${w}`}
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'hsl(30 90% 95%)',
                color: 'hsl(20 85% 30%)',
                border: '1px solid hsl(30 90% 80%)',
              }}
            >
              C1/C2 · {w}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

const PART_LABEL = { '1': 'Part 1', '2': 'Part 2', '3': 'Part 3' };

function buildContextLine(data, fluency) {
  const part = data?.part ? PART_LABEL[String(data.part)] || `Part ${data.part}` : null;
  const cardId = data?.question_id || data?.card_id;
  const head = [part, cardId ? null : data?.cue_card_prompt].filter(Boolean).join(' · ');
  const tail = [fluency.duration, fluency.words ? `${fluency.words} words` : null]
    .filter(Boolean)
    .join(' · ');
  return { head: head || (cardId ? part : 'Speaking attempt'), cardId, tail };
}

export default function ResultsState({ data, onRetryCard, onNewCard }) {
  // Guard against missing evaluation data. Pre-launch audit (2026-05-16)
  // flagged that the previous `data?.scores || FIXTURE_SCORES` fallback was
  // rendering hardcoded "Aunt Mai" demo scores (see ../constants.js) whenever
  // the speaking evaluator returned null — which looked like a real result
  // to the user. Render an error UI instead so the caller can retry.
  if (!data?.scores || !data?.fluency) {
    return (
      <section style={{ background: 'white', borderTop: '1px solid var(--sp-border)', borderBottom: '1px solid var(--sp-border)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 32px 80px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>We couldn't load your results.</div>
          <div style={{ fontSize: 14, color: 'var(--sp-muted)', marginBottom: 24 }}>
            The evaluator didn't return scores for this attempt. Please try recording again.
          </div>
          {onRetryCard && (
            <button
              type="button"
              onClick={onRetryCard}
              style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--sp-border)', background: 'white', cursor: 'pointer' }}
            >
              Try this card again
            </button>
          )}
        </div>
      </section>
    );
  }
  const SCORES = data.scores;
  const FLUENCY = data.fluency;
  // Empty array when transcript missing rather than the FIXTURE Vietnamese
  // demo tokens (constants.js:77) that previously leaked in as "real" data.
  const TRANSCRIPT_TOKENS = Array.isArray(data?.transcript_tokens) ? data.transcript_tokens : [];
  // Full back-and-forth from a Liz Live conversation (Part 1/3): [{role,message}].
  // Display-only — grading uses the user-only transcript.
  const CONVERSATION_TURNS = (Array.isArray(data?.conversation_turns) ? data.conversation_turns : [])
    .filter((t) => t && (t.message || '').trim());
  const lizNote = data?.liz_note;
  const audioSrc = resolveAudioSrc(data?.audio_url);
  // Word-level pronunciation only carries real signal when there's audio /
  // per-token pron data. For a Liz Live conversation graded from the transcript
  // (no audio), the "transcript" block is just the candidate's words again —
  // identical to what the conversation panel already shows — so suppress that
  // redundant text and let the conversation BE the transcript (keep the
  // delivery stats + vocabulary, which aren't shown anywhere else).
  const hasPron = TRANSCRIPT_TOKENS.some((t) => t && t.pron);
  // When there's a conversation, it BECOMES the transcript — the candidate's
  // answers are shown there (with word-level pronunciation colouring mapped
  // onto each turn), so the separate transcript block collapses to delivery
  // stats only. Without a conversation (Part 2 cue card), keep the classic
  // word-level transcript panel.
  const redundantTranscript = CONVERSATION_TURNS.length > 0;
  const USER_TURN_SLICES = (hasPron && CONVERSATION_TURNS.length > 0)
    ? splitTokensByTurns(
        TRANSCRIPT_TOKENS,
        CONVERSATION_TURNS.filter((t) => t.role === 'user').map((t) => t.message),
      )
    : [];
  const meta = buildContextLine(data, FLUENCY);
  // Premium QB submit returns Azure pronunciation detail + Liz's practice
  // plan. When present we surface them in a dedicated drawer and hide the
  // fixture-band rubric block (it shows hardcoded "Pronunciation 6.0" text
  // that's misleading next to the real numbers).
  const hasPremiumDetail = Boolean(
    data?.pronunciation_analysis?.azure_scores ||
      (Array.isArray(data?.word_level_results) && data.word_level_results.length > 0) ||
      (Array.isArray(data?.practice_focus) && data.practice_focus.length > 0) ||
      (Array.isArray(data?.try_this_next) && data.try_this_next.length > 0),
  );
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
              {meta.head}
              {meta.cardId && (
                <>
                  {' · '}
                  <span className="sp-font-mono">{meta.cardId}</span>
                </>
              )}
            </span>
            {meta.tail && (
              <>
                <span style={{ color: 'var(--sp-muted-fg)' }}>·</span>
                <span style={{ color: 'var(--sp-muted-fg)' }}>{meta.tail}</span>
              </>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="sp-btn-secondary"
              style={{ height: 36, fontSize: 13 }}
              title="Your attempts are saved automatically — view your speaking history in Progress"
              onClick={() => { window.location.href = '/progress'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              View in Progress
            </button>
            <button
              type="button"
              className="sp-btn-secondary"
              style={{ height: 36, fontSize: 13 }}
              onClick={(e) => {
                const s = `My IELTS Speaking ${(data?.part || '').replace('part', 'Part ')} result on testmaster.pro — Band ${SCORES?.overall ?? '-'} (Fluency ${SCORES?.fc ?? '-'}, Lexical ${SCORES?.lr ?? '-'}, Grammar ${SCORES?.gra ?? '-'}, Pronunciation ${SCORES?.pr ?? '-'}).`;
                const btn = e.currentTarget;
                const restore = btn.lastChild?.textContent;
                try {
                  navigator.clipboard?.writeText(s);
                  if (btn.lastChild) {
                    btn.lastChild.textContent = ' Copied!';
                    setTimeout(() => { if (btn.lastChild) btn.lastChild.textContent = restore; }, 1500);
                  }
                } catch (_e) { /* clipboard unavailable */ }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 6l-4-4-4 4M12 2v14M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
              </svg>
              Share
            </button>
          </div>
        </div>

        {/* Full conversation with Liz (Part 1/3 live) — examiner questions +
            the candidate's answers. Collapsed by default (it's long); native
            <details> keeps it hook-free below the early return above. */}
        {CONVERSATION_TURNS.length > 0 && (
          <details
            style={{
              background: 'var(--sp-card)',
              borderRadius: 'var(--sp-radius)',
              border: '1px solid var(--sp-border)',
              boxShadow: 'var(--sp-shadow-card)',
              padding: '20px 32px',
              marginBottom: 32,
            }}
          >
            <summary style={{ cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span>
                <span className="sp-mono-label" style={{ display: 'block', marginBottom: 2 }}>Conversation with Liz</span>
                <span className="sp-font-display" style={{ fontSize: 20, fontWeight: 600 }}>
                  Full exchange
                </span>
              </span>
              <span className="sp-mono-label" style={{ color: 'var(--sp-primary)' }}>
                {CONVERSATION_TURNS.filter((t) => t.role === 'user').length} answers · tap to expand
              </span>
            </summary>
            {USER_TURN_SLICES.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, marginTop: 14, fontSize: 12, color: 'var(--sp-muted-fg)' }}>
                <span className="sp-mono-label">Pronunciation</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 20, height: 3, borderRadius: 2, background: 'var(--sp-primary)' }} /> Clear
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 20, height: 3, borderRadius: 2, background: 'var(--sp-warn)' }} /> Minor
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', width: 20, height: 3, borderRadius: 2, background: 'repeating-linear-gradient(135deg, hsl(0 78% 55%) 0 2px, transparent 2px 4px)' }} /> Needs work
                </span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              {CONVERSATION_TURNS.map((t, i) => {
                const isLiz = t.role === 'agent';
                const userIdx = isLiz ? -1 : CONVERSATION_TURNS.slice(0, i).filter((x) => x.role === 'user').length;
                const slice = (!isLiz && USER_TURN_SLICES[userIdx]) || null;
                return (
                  <div
                    key={i}
                    style={{
                      alignSelf: isLiz ? 'flex-start' : 'flex-end',
                      maxWidth: '80%',
                      background: isLiz ? 'var(--sp-muted)' : 'var(--sp-primary-50)',
                      border: '1px solid var(--sp-border)',
                      borderRadius: 14,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      className="sp-mono-label"
                      style={{ fontSize: 10, marginBottom: 4, color: isLiz ? 'var(--sp-muted-fg)' : 'var(--sp-primary)' }}
                    >
                      {isLiz ? 'Liz' : 'You'}
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--sp-foreground)' }}>
                      {slice && slice.length ? <ColoredTokens tokens={slice} /> : t.message}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}

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
                <div className="sp-mono-label">{redundantTranscript ? 'Delivery' : 'Your transcript'}</div>
                <h3 className="sp-font-display" style={{ fontSize: 22, fontWeight: 600, marginTop: 2 }}>
                  {redundantTranscript ? 'Your speaking, measured' : 'Word‑level pronunciation'}
                </h3>
              </div>
              {!redundantTranscript && <AudioPlayer src={audioSrc} fallbackDurationLabel={FLUENCY.duration} />}
            </div>

            {redundantTranscript ? (
              <p style={{ fontSize: 13, color: 'var(--sp-muted-fg)', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--sp-border)' }}>
                Your full answers are shown in the conversation above. Here's how your delivery measured up.
              </p>
            ) : (
              <>
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
              </>
            )}

            <FluencyStats fluency={FLUENCY} />
            <VocabularyProfileBar profile={data?.vocabulary_profile} />
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

        {hasPremiumDetail && (
          <PremiumPronunciationDrawer
            pronunciationAnalysis={data.pronunciation_analysis}
            wordLevelResults={data.word_level_results}
            practiceFocus={data.practice_focus}
            tryThisNext={data.try_this_next}
            strengths={data.strengths}
            weaknesses={data.weaknesses}
          />
        )}

        {/* Examiner's rubric — hidden when premium detail is present (the
            static copy below is fixture-band leftover that conflicts with
            real numbers from the premium endpoint). */}
        {!hasPremiumDetail && (
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
        )}

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
