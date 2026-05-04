/**
 * LizD8
 * -----
 * D8 design port — rebuilt 2026-04-30 as a near 1:1 React mirror of
 * /Users/aga/Desktop/design-handoffs/D8-liz-tutor.html. Feature handlers
 * and data come in as props from LizTeacher.js and are slotted into the
 * handoff's structure (rather than the prior approach of layering handoff
 * styling on top of the old DOM).
 *
 * Layout (matches handoff verbatim):
 *   LEFT  panel : today-head → focus-card (liz-note) → ol.lesson-steps
 *                 → streak-chip (BOTTOM) → recent sessions
 *   CENTER      : canvas-head (avatar+name+presence+head-actions)
 *                 → listen-cta header
 *                 → .conversation (turns)
 *                 → composer (Attach + hint + Talk + Send)
 *                 → voice-overlay (absolute, when live)
 *                 → welcome-overlay (absolute, when isEmpty)
 *   RIGHT panel : plan-summary (TOP) → "Liz remembers" rich memos
 *                 → "Quick actions" 2x2 → Homework card
 *
 * Features slotted in: mic STT (handleMicClick), auto-voice toggle,
 * stop-speaking pill, voice insight pill, lesson-mode chips inside the
 * welcome overlay, expandable HomeworkCard/HomeworkModal, homework badge
 * + request gating, ElevenLabs Live via useElevenLabsLiz + VoiceOverlay,
 * MarkdownBlock with callouts/blockquote/headings, pronunciation
 * underlines. All data-testids preserved.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import { useNavigate } from 'react-router-dom';
import useElevenLabsLiz from '../hooks/useElevenLabsLiz';
import VoiceOverlay from './VoiceOverlay';
import { LIZ_AVATAR_URL } from '../../../lib/brand';
import '../liz.css';

function LizAvatarImg({ size = 'cover', alt = 'Liz' }) {
  // Renders as <img> filling the parent .liz-avatar / .mini-avatar / .voice-orb
  // — relies on CSS rules in liz.css that pin width/height/border-radius.
  return <img src={LIZ_AVATAR_URL} alt={alt} className="liz-avatar-img" loading="lazy" draggable={false} />;
}

function formatRelativeTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

/**
 * Tiny markdown renderer for Liz chat output.
 * Handles: paragraphs, **bold**, *italic*, `code`, ATX headings,
 * lists, `---` HR, `> blockquote`, and **Word:** callouts.
 */
function inlineMd(text) {
  let s = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  // [label](url) — internal /paths or http(s) only, escape quotes
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    if (!/^(\/[^\s]*|https?:\/\/[^\s]+)$/.test(url)) return `${label}`;
    const safeUrl = url.replace(/"/g, '&quot;');
    return `<a href="${safeUrl}" class="md-link">${label}</a>`;
  });
  return s;
}

const CALLOUT_KINDS = {
  tip: 'tip',
  why: 'why',
  difficulty: 'difficulty',
  note: 'note',
  example: 'example',
  important: 'important',
  warning: 'important',
  remember: 'note',
  hint: 'tip',
};

function detectCallout(rawPara) {
  const m = rawPara.match(/^\*\*([A-Za-z]+):\*\*\s*([\s\S]*)$/);
  if (!m) return null;
  const key = m[1].toLowerCase();
  const variant = CALLOUT_KINDS[key];
  if (!variant) return null;
  return { variant, label: m[1], body: m[2] };
}

function MarkdownBlock({ text }) {
  if (!text) return null;
  const lines = String(text).split('\n');
  const blocks = [];
  let para = [];
  let list = null;
  let quote = null;
  const flushPara = () => {
    if (!para.length) return;
    const joined = para.join(' ');
    const cal = detectCallout(joined);
    if (cal) {
      blocks.push({ kind: 'callout', variant: cal.variant, label: cal.label, html: inlineMd(cal.body) });
    } else {
      blocks.push({ kind: 'p', html: inlineMd(joined) });
    }
    para = [];
  };
  const flushList = () => {
    if (list) { blocks.push({ kind: list.type, items: list.items.map(inlineMd) }); list = null; }
  };
  const flushQuote = () => {
    if (quote && quote.length) { blocks.push({ kind: 'quote', html: inlineMd(quote.join(' ')) }); quote = null; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flushPara(); flushList(); flushQuote(); continue; }
    if (/^---+$/.test(line)) { flushPara(); flushList(); flushQuote(); blocks.push({ kind: 'hr' }); continue; }
    const bq = line.match(/^>\s?(.*)$/);
    if (bq) { flushPara(); flushList(); if (!quote) quote = []; quote.push(bq[1]); continue; }
    const h = line.match(/^(#{1,3})\s+(.+)$/);
    if (h) { flushPara(); flushList(); flushQuote(); blocks.push({ kind: 'h', level: h[1].length, html: inlineMd(h[2]) }); continue; }
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) { flushPara(); flushQuote(); if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; } list.items.push(ul[1]); continue; }
    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) { flushPara(); flushQuote(); if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; } list.items.push(ol[1]); continue; }
    flushList(); flushQuote();
    para.push(line);
  }
  flushPara(); flushList(); flushQuote();
  return (
    <div className="md-block">
      {blocks.map((b, i) => {
        if (b.kind === 'p')  return <p key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
        if (b.kind === 'hr') return <hr key={i} />;
        if (b.kind === 'h')  {
          const Tag = `h${Math.min(4, b.level + 2)}`;
          return <Tag key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
        }
        if (b.kind === 'ul') return <ul key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}</ul>;
        if (b.kind === 'ol') return <ol key={i}>{b.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }} />)}</ol>;
        if (b.kind === 'quote') return <blockquote key={i} dangerouslySetInnerHTML={{ __html: b.html }} />;
        if (b.kind === 'callout') {
          return (
            <div key={i} className={`callout callout-${b.variant}`} data-variant={b.variant}>
              <span className="callout-label">{b.label}</span>
              <span className="callout-body" dangerouslySetInnerHTML={{ __html: b.html }} />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function PronWordsLine({ words }) {
  if (!Array.isArray(words) || !words.length) return null;
  return (
    <p className="turn-pron">
      {words.map((w, i) => {
        const cls = w.score == null
          ? ''
          : w.score < 70 ? 'pron pron-bad'
          : w.score < 85 ? 'pron pron-ok'
          : 'pron pron-good';
        return (
          <React.Fragment key={i}>
            <span className={cls} title={w.tip || (w.score != null ? `Score ${w.score}/100` : '')}>{w.word}</span>
            {i < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </p>
  );
}

/* ---------- LEFT PANEL ---------- */

function TodayPanel({ user, lizStatus, sessions, onLoadSession, onNewSession, onOpenStudyPlan }) {
  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const examDate = user?.exam_date ? new Date(user.exam_date) : null;
  const daysToExam = examDate ? Math.max(0, Math.ceil((examDate - today) / 86400000)) : null;
  const streak = Number(user?.streak_days || lizStatus?.streak_days || 0);
  const focusSteps = Array.isArray(lizStatus?.focus_steps) ? lizStatus.focus_steps : [];
  const focusNote = lizStatus?.focus_note || lizStatus?.liz_note;
  const focusKicker = lizStatus?.focus_kicker || "Today's focus";
  const focusTitle = lizStatus?.today_focus || 'Open conversation';
  const focusBody = lizStatus?.today_summary
    || 'Ask Liz anything, paste an essay for instant feedback, or tap Talk with Liz for a live tutor session.';
  // Day X of Y header — backend can supply plan_day + plan_days; otherwise we
  // skip the chip so empty data never shows "Day NaN".
  const planDays = lizStatus?.plan_days || null;
  const planDay  = lizStatus?.plan_day  || null;

  return (
    <aside className="panel panel-left" aria-label="Today with Liz">
      <div className="today-head">
        <div>
          <div className="label">Today with Liz</div>
          <div className="date">{dateLabel}</div>
        </div>
        {daysToExam != null ? (
          <div className="exam-left"><b>{daysToExam} days</b> to exam</div>
        ) : null}
      </div>

      <div className="focus-card">
        <div className="focus-card-head">
          <div className="kicker">{focusKicker}</div>
          {planDay && planDays ? (
            <div className="focus-day-chip" data-testid="liz-plan-day">Day {planDay} of {planDays}</div>
          ) : null}
        </div>
        <h3>{focusTitle}</h3>
        <p>{focusBody}</p>
        {focusNote ? (
          <div className="liz-note">{focusNote}</div>
        ) : null}
      </div>

      {focusSteps.length ? (
        <ol className="lesson-steps" aria-label="Today's lesson steps">
          {focusSteps.map((s, i) => {
            const state = s.state || s.status || (s.done ? 'done' : s.active ? 'active' : 'todo');
            const label = typeof s === 'string' ? s : (s.label || s.title || s.text || '');
            const meta = typeof s === 'string' ? null : (s.meta || s.duration || null);
            return (
              <li key={i} className="lesson-step" data-state={state}>
                <span className="step-dot"></span>
                <div>
                  <div className="step-label">{label}</div>
                  {meta ? <div className="step-meta">{meta}</div> : null}
                </div>
              </li>
            );
          })}
        </ol>
      ) : null}

      <button
        type="button"
        className="study-plan-link"
        onClick={() => onOpenStudyPlan?.()}
        data-testid="liz-open-study-plan"
      >
        View full study plan →
      </button>

      {streak > 0 ? (
        <div
          className="streak-chip"
          data-testid="liz-streak-chip"
          aria-label={`${streak} day streak`}
          style={{ marginTop: 14 }}
        >
          <span className="flame" aria-hidden="true">🔥</span>
          <div><b>{streak}-day streak</b> · don't lose it</div>
        </div>
      ) : null}

      {sessions && sessions.length ? (
        <>
          <div className="panel-section-head" style={{ marginTop: 16 }}>
            <span>Recent sessions</span>
            <button
              type="button"
              className="liz-btn-link"
              onClick={onNewSession}
              data-testid="new-session-btn"
            >New</button>
          </div>
          <ol className="lesson-steps" aria-label="Recent sessions">
            {sessions.slice(0, 6).map((s) => (
              <li
                key={s.session_id || s.id}
                className="lesson-step"
                data-state="todo"
                onClick={() => onLoadSession?.(s.session_id || s.id)}
                role="button"
              >
                <span className="step-dot"></span>
                <div>
                  <div className="step-label">{s.title || s.summary || 'Conversation'}</div>
                  <div className="step-meta">{formatRelativeTime(s.updated_at || s.created_at)}</div>
                </div>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <button
          type="button"
          className="liz-btn-link"
          onClick={onNewSession}
          data-testid="new-session-btn"
          style={{ marginTop: 12, alignSelf: 'flex-start' }}
        >+ New session</button>
      )}
    </aside>
  );
}

/* ---------- CENTER ---------- */

function ConversationStream({ messages, onListen }) {
  return (
    <div className="conversation" id="liz-conversation">
      {messages.map((m, idx) => {
        const isLiz = m.role === 'assistant';
        return (
          <article
            key={`${idx}-${m.timestamp || idx}`}
            className="turn"
            data-speaker={isLiz ? 'liz' : 'student'}
          >
            <div className="turn-meta">
              <span className={`mini-avatar ${isLiz ? '' : 'mini-avatar-me'}`}>
                {isLiz ? <LizAvatarImg alt="Liz" /> : 'A'}
              </span>
              <span className="who">{isLiz ? 'Liz' : 'You'}</span>
              <span>· {formatRelativeTime(m.timestamp)}</span>
              {isLiz && onListen ? (
                <button
                  type="button"
                  className="listen-inline"
                  onClick={() => onListen(m)}
                  aria-label="Play this message"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l10 6-10 6V4z" /></svg>
                  Listen
                </button>
              ) : null}
            </div>
            <div className="turn-body">
              {Array.isArray(m.pronunciation_words) && m.pronunciation_words.length
                ? <PronWordsLine words={m.pronunciation_words} />
                : isLiz
                  ? <MarkdownBlock text={m.content} />
                  : <p>{m.content}</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MicSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="3" width="4" height="10" rx="2" />
      <path d="M5 10a5 5 0 0010 0M10 15v3" />
    </svg>
  );
}

function VolumeOnSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8v4h3l4 3V5L6 8H3z" />
      <path d="M14 7a4 4 0 010 6M16 5a7 7 0 010 10" />
    </svg>
  );
}

function VolumeOffSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8v4h3l4 3V5L6 8H3z" />
      <path d="M14 7l4 6M18 7l-4 6" />
    </svg>
  );
}

function StopSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor"><rect x="5" y="5" width="10" height="10" rx="1" /></svg>
  );
}

function PlaySvg() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6 4l10 6-10 6V4z" /></svg>
  );
}

function CanvasHead({
  effectiveStatus,
  isSpeaking,
  autoVoice,
  onToggleAutoVoice,
  onStopSpeaking,
  onNewSession,
}) {
  return (
    <header className="canvas-head">
      <div
        className={`liz-avatar liz-avatar-d8${isSpeaking ? ' is-speaking' : ''}`}
        data-status={effectiveStatus}
      >
        <LizAvatarImg alt="Liz" />
      </div>
      <div>
        <h1 className="liz-name">Liz</h1>
        <div className="liz-role">
          <span className="presence" data-status={effectiveStatus}></span>
          {effectiveStatus === 'thinking' ? 'Thinking…'
            : effectiveStatus === 'listening' ? 'Listening…'
            : effectiveStatus === 'transcribing' ? 'Transcribing…'
            : effectiveStatus === 'speaking' ? 'Speaking…'
            : 'Your AI IELTS coach · here now'}
        </div>
      </div>
      <div className="head-actions">
        {isSpeaking && onStopSpeaking ? (
          <button
            type="button"
            className="icon-btn stop-speaking-btn"
            onClick={onStopSpeaking}
            title="Stop Liz from speaking"
            aria-label="Stop speaking"
            data-testid="stop-speaking-btn"
          >
            <StopSvg />
          </button>
        ) : null}
        {onToggleAutoVoice ? (
          <button
            type="button"
            className={`icon-btn auto-voice-toggle${autoVoice ? ' is-on' : ''}`}
            onClick={onToggleAutoVoice}
            title={autoVoice ? 'Auto-voice on — tap to mute' : 'Auto-voice off — tap to enable'}
            aria-label={autoVoice ? 'Disable auto voice' : 'Enable auto voice'}
            aria-pressed={!!autoVoice}
            data-testid="auto-voice-toggle"
          >
            {autoVoice ? <VolumeOnSvg /> : <VolumeOffSvg />}
          </button>
        ) : null}
        <button
          type="button"
          className="icon-btn"
          title="Start a fresh conversation"
          onClick={onNewSession}
          aria-label="Start a fresh conversation"
        >＋</button>
      </div>
    </header>
  );
}

function ListenCta({ onClick, busy }) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      className="listen-cta"
      onClick={onClick}
      title="Liz won't speak unless you ask"
      disabled={busy}
    >
      {busy ? (
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <rect x="5" y="4" width="4" height="12" /><rect x="11" y="4" width="4" height="12" />
        </svg>
      ) : <PlaySvg />}
      {busy ? 'Speaking…' : 'Listen to Liz (5 sec)'}
    </button>
  );
}

function AttachSvg() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 13l5-5a3 3 0 114 4l-7 7a5 5 0 01-7-7l8-8a1 1 0 011 1" />
    </svg>
  );
}

function Composer({
  input, setInput, onSend, onTalk, sending, talkLocked, talkLockedReason,
  onMicClick, status,
}) {
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  const isListening = status === 'listening';
  const isTranscribing = status === 'transcribing';
  return (
    <form className="composer" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={isListening ? 'Listening…' : isTranscribing ? 'Transcribing…' : 'Ask Liz anything — or paste your essay for instant feedback…'}
        rows={2}
        data-testid="liz-input"
      />
      <div className="composer-row">
        {onMicClick ? (
          <button
            type="button"
            className={`liz-btn liz-btn-ghost liz-mic-btn${isListening ? ' is-listening' : ''}${isTranscribing ? ' is-transcribing' : ''}`}
            onClick={onMicClick}
            disabled={isTranscribing || sending}
            title={isListening ? 'Stop recording' : 'Record a voice message'}
            aria-label={isListening ? 'Stop recording' : 'Record a voice message'}
            data-testid="mic-btn"
          >
            <MicSvg />
            {isListening ? 'Stop' : isTranscribing ? '…' : 'Speak'}
          </button>
        ) : null}
        <span className="hint">Press <kbd>Enter</kbd> to send · <kbd>⇧ Enter</kbd> for new line</span>
        <button
          type="button"
          className="liz-btn liz-btn-voice"
          onClick={onTalk}
          disabled={talkLocked}
          title={talkLockedReason || 'Start a live conversation with Liz'}
          data-testid="liz-talk-btn"
        >
          <MicSvg />
          Talk with Liz
        </button>
        <button
          type="submit"
          className="liz-btn liz-btn-primary"
          disabled={sending || !input.trim()}
          data-testid="liz-send-btn"
        >
          Send
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 10h12M11 5l5 5-5 5" />
          </svg>
        </button>
      </div>
    </form>
  );
}


/* ---------- RIGHT PANEL ---------- */

function PlanSummaryCard({ lizStatus, voiceQuota }) {
  const planLabel = lizStatus?.plan_label || lizStatus?.plan || 'Free';
  const targetBand = lizStatus?.target_band;
  const baseBand = lizStatus?.current_band || lizStatus?.starting_band;
  const planDays = lizStatus?.plan_days;
  const messagesUsed = lizStatus?.messages_used;
  const messagesQuota = lizStatus?.messages_quota;
  const minutesLeft = voiceQuota?.seconds_remaining != null
    ? Math.max(0, Math.floor(voiceQuota.seconds_remaining / 60))
    : null;

  const headline = (baseBand && targetBand)
    ? `From Band ${baseBand} → ${targetBand}`
    : targetBand
      ? `Target Band ${targetBand}`
      : `Your ${planLabel} plan`;

  const summaryBits = [];
  if (messagesUsed != null && messagesQuota != null) {
    summaryBits.push(`${messagesUsed}/${messagesQuota} msgs`);
  }
  if (minutesLeft != null) summaryBits.push(`${minutesLeft} min Live`);
  if (planDays) summaryBits.push(`${planDays}-day plan`);
  const summary = summaryBits.join(' · ') || 'Stay consistent — Liz tracks your wins as you go.';

  return (
    <div className="plan-summary">
      <div className="ps-kicker">{planDays ? `Your ${planDays}-day plan` : `Your ${planLabel} plan`}</div>
      <h4>{headline}</h4>
      <p>{summary}</p>
    </div>
  );
}

function MemoryIcon({ type }) {
  const glyph = type === 'gap' ? '!' : type === 'habit' ? '◷' : '✓';
  return <span className="memo-icon" data-type={type || 'win'}>{glyph}</span>;
}

function deriveMemos(lizStatus, user, homework, currentMode, messagesCount) {
  const raw = Array.isArray(lizStatus?.memory_notes) ? lizStatus.memory_notes : [];
  const memos = raw.map((note) => {
    if (typeof note === 'string') {
      return { type: 'win', body: note, since: null };
    }
    return {
      type: note.type || note.kind || 'win',
      title: note.title || note.headline || null,
      body: note.body || note.text || note.note || '',
      since: note.since || note.timeframe || null,
    };
  });

  // Always include core facts so the panel never feels empty.
  const targetBand = user?.target_band || lizStatus?.target_band;
  if (targetBand && !memos.some((m) => /target/i.test(m.body || m.title || ''))) {
    memos.push({
      type: 'habit',
      title: 'Target band',
      body: `Aiming for ${targetBand}.`,
      since: null,
    });
  }
  const pending = (homework || []).filter((h) => h.status === 'pending').length;
  if (pending > 0) {
    memos.push({
      type: 'gap',
      title: 'Homework waiting',
      body: `${pending} task${pending === 1 ? '' : 's'} to submit.`,
      since: null,
    });
  }
  if (currentMode && currentMode !== 'default') {
    memos.push({
      type: 'habit',
      title: `${currentMode[0].toUpperCase()}${currentMode.slice(1)} mode`,
      body: `Liz is in ${currentMode} mode.`,
      since: null,
    });
  }
  if (messagesCount > 0 && !memos.some((m) => /messages/i.test(m.body || m.title || ''))) {
    memos.push({
      type: 'win',
      title: 'Today\'s session',
      body: `${messagesCount} message${messagesCount === 1 ? '' : 's'} so far.`,
      since: null,
    });
  }
  return memos.slice(0, 6);
}

function MemoryCard({ lizStatus, user, homework, currentMode, messagesCount }) {
  const memos = deriveMemos(lizStatus, user, homework, currentMode, messagesCount);
  return (
    <div className="liz-card">
      <h4>Liz remembers</h4>
      {memos.length ? (
        <ul className="memory-list">
          {memos.map((m, i) => (
            <li key={i}>
              <MemoryIcon type={m.type} />
              <div className="memo-body">
                {m.title ? <><b>{m.title}</b> — {m.body}</> : m.body}
                {m.since ? <div className="since">{m.since}</div> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="memory-empty">Liz will start jotting notes as you work together.</div>
      )}
    </div>
  );
}

function QuickActionsCard({
  onPick,
  onChatPrompt,
  onOpenStudyPlan,
  recommendedCourse,
  lessonModes,
}) {
  const navigate = useNavigate();
  const go = (target) => {
    if (typeof onPick === 'function' && onPick(target) === true) return;
    navigate(target);
  };
  // Resolve grammar/vocab prompts from LESSON_MODES (LizTeacher) so Liz starts
  // a structured lesson when the tile is tapped — same prompt the old
  // welcome chips used.
  const grammarPrompt = lessonModes?.find((m) => m.testId === 'lesson-grammar')?.prompt;
  const vocabPrompt   = lessonModes?.find((m) => m.testId === 'lesson-vocab')?.prompt;
  const courseHref    = recommendedCourse?.href || '/courses';
  const courseLabel   = recommendedCourse?.short_label || recommendedCourse?.level
    ? `${(recommendedCourse?.short_label || recommendedCourse?.level || '').toString().replace(/^./, (c) => c.toUpperCase())}`
    : 'Courses';
  const courseSub = recommendedCourse?.sub
    || (recommendedCourse?.level ? `Liz · ${recommendedCourse.level}` : 'All courses');
  const courseInitial = (recommendedCourse?.level || 'C').charAt(0).toUpperCase();
  return (
    <div className="liz-card">
      <h4>Quick actions</h4>
      <div className="quick-section-head">Practice</div>
      <div className="quick-grid">
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?writing=1')}
          data-testid="quick-writing-drill"
        >
          <span className="qt-icon">W</span>
          <span className="qt-title">Writing</span>
          <span className="qt-sub">Task 1 & 2 prompts</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?reading=1')}
          data-testid="quick-reading-drill"
        >
          <span className="qt-icon">R</span>
          <span className="qt-title">Reading</span>
          <span className="qt-sub">Passages & questions</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?speaking=1')}
          data-testid="quick-speaking-drill"
        >
          <span className="qt-icon">S</span>
          <span className="qt-title">Speaking</span>
          <span className="qt-sub">Part 1 · 2 · 3</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go('/question-bank?listening=1')}
          data-testid="quick-listening-drill"
        >
          <span className="qt-icon">L</span>
          <span className="qt-title">Listening</span>
          <span className="qt-sub">Sections 1–4</span>
        </button>
      </div>
      <div className="quick-section-head">Learn</div>
      <div className="quick-grid">
        <button
          type="button"
          className="quick-tile"
          onClick={() => grammarPrompt && onChatPrompt?.(grammarPrompt)}
          disabled={!grammarPrompt}
          data-testid="quick-grammar"
        >
          <span className="qt-icon">G</span>
          <span className="qt-title">Grammar</span>
          <span className="qt-sub">Liz-led lesson</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => vocabPrompt && onChatPrompt?.(vocabPrompt)}
          disabled={!vocabPrompt}
          data-testid="quick-vocabulary"
        >
          <span className="qt-icon">V</span>
          <span className="qt-title">Vocabulary</span>
          <span className="qt-sub">IELTS word lists</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => onOpenStudyPlan?.()}
          data-testid="quick-study-plan"
        >
          <span className="qt-icon">P</span>
          <span className="qt-title">Study plan</span>
          <span className="qt-sub">View week →</span>
        </button>
        <button
          type="button"
          className="quick-tile"
          onClick={() => go(courseHref)}
          data-testid="quick-course"
        >
          <span className="qt-icon">{courseInitial}</span>
          <span className="qt-title">Course</span>
          <span className="qt-sub">{courseSub}</span>
        </button>
      </div>
    </div>
  );
}

function HomeworkCard({ hw, hwIcons, onOpen, onDelete }) {
  const Icon = hwIcons?.[hw.type] || hwIcons?.default;
  const isPending = hw.status === 'pending';
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(hw.homework_id);
  };
  return (
    <button
      type="button"
      className="quick-card hw-card"
      data-state={hw.status || 'pending'}
      data-testid={`hw-card-${hw.homework_id}`}
      onClick={() => onOpen?.(hw)}
    >
      <div className="hw-card-head">
        {Icon ? <Icon className="hw-icon" /> : null}
        <div className="hw-card-text">
          <div className="qc-title">{hw.title}</div>
          <div className="qc-meta">
            {isPending
              ? `${hw.type} · due ${hw.due_date ? new Date(hw.due_date).toLocaleDateString() : 'soon'}`
              : `Reviewed · band ${hw.score ?? '—'}/10`}
          </div>
        </div>
        {isPending && onDelete ? (
          <span
            role="button"
            tabIndex={0}
            className="hw-delete"
            onClick={handleDelete}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(e); }}
            aria-label="Delete homework"
            data-testid={`hw-delete-${hw.homework_id}`}
          >×</span>
        ) : null}
      </div>
    </button>
  );
}

function HomeworkModal({ hw, hwIcons, onClose, onSubmit, submitting }) {
  const [answer, setAnswer] = useState('');
  useEffect(() => {
    setAnswer('');
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [hw?.homework_id, onClose]);
  if (!hw) return null;
  const Icon = hwIcons?.[hw.type] || hwIcons?.default;
  const isPending = hw.status === 'pending';
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    await onSubmit?.(hw.homework_id, answer);
    onClose?.();
  };
  return (
    <div className="hw-modal-backdrop" onClick={onClose} data-testid="hw-modal">
      <div className="hw-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="hw-modal-title">
        <header className="hw-modal-head">
          <div className="hw-modal-icon">{Icon ? <Icon /> : null}</div>
          <div className="hw-modal-title-wrap">
            <h2 id="hw-modal-title" className="hw-modal-title">{hw.title}</h2>
            <div className="hw-modal-meta">
              <span className="hw-modal-type">{hw.type}</span>
              {hw.due_date ? <span>· due {new Date(hw.due_date).toLocaleDateString()}</span> : null}
              {!isPending ? <span>· band {hw.score ?? '—'}/10</span> : null}
            </div>
          </div>
          <button
            type="button"
            className="hw-modal-close"
            onClick={onClose}
            aria-label="Close"
            data-testid="hw-modal-close"
          >×</button>
        </header>

        <section className="hw-modal-body">
          <div className="hw-modal-section-head">Task</div>
          <MarkdownBlock text={hw.task || hw.prompt || hw.description || 'No task instructions provided.'} />
          {!isPending && hw.feedback ? (
            <>
              <div className="hw-modal-section-head">Liz's feedback</div>
              <MarkdownBlock text={hw.feedback} />
            </>
          ) : null}
          {!isPending && hw.student_answer ? (
            <>
              <div className="hw-modal-section-head">Your answer</div>
              <div className="hw-modal-answer-readonly">{hw.student_answer}</div>
            </>
          ) : null}
        </section>

        {isPending ? (
          <footer className="hw-modal-foot">
            <textarea
              className="hw-modal-answer"
              placeholder="Type your answer here…"
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              data-testid="hw-modal-answer"
            />
            <div className="hw-modal-actions">
              <button type="button" className="liz-btn liz-btn-ghost" onClick={onClose}>Cancel</button>
              <button
                type="button"
                className="liz-btn liz-btn-primary"
                onClick={handleSubmit}
                disabled={submitting || !answer.trim()}
                data-testid="hw-modal-submit"
              >
                {submitting ? 'Submitting…' : 'Submit for review'}
              </button>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}

function HomeworkCardWrap({
  homework, hwIcons, onAssignHomework, onSubmitHomework, onDeleteHomework,
  submittingHw, messagesCount,
}) {
  const pending = (homework || []).filter((h) => h.status === 'pending');
  const reviewed = (homework || []).filter((h) => h.status === 'reviewed').slice(0, 3);
  const pendingCount = pending.length;
  const canRequestHomework = (messagesCount || 0) > 2;
  const [openHwId, setOpenHwId] = useState(null);
  const openHw = (homework || []).find((h) => h.homework_id === openHwId) || null;

  return (
    <div className="liz-card">
      <div className="panel-section-head" style={{ marginBottom: 10 }}>
        <h4 style={{ margin: 0 }}>
          Homework
          {pendingCount > 0 ? (
            <span className="homework-badge" data-testid="homework-badge">{pendingCount}</span>
          ) : null}
        </h4>
        {canRequestHomework ? (
          <button
            type="button"
            className="liz-btn-link"
            onClick={onAssignHomework}
            data-testid="request-homework-btn"
          >Ask for one</button>
        ) : (
          <span className="liz-btn-link liz-btn-link-muted" title="Chat a bit first so Liz knows what to assign">
            Chat first
          </span>
        )}
      </div>
      <div className="quick-grid">
        {pending.slice(0, 3).map((hw) => (
          <HomeworkCard
            key={hw.homework_id}
            hw={hw}
            hwIcons={hwIcons}
            onOpen={() => setOpenHwId(hw.homework_id)}
            onDelete={onDeleteHomework}
          />
        ))}
        {reviewed.map((hw) => (
          <HomeworkCard
            key={hw.homework_id}
            hw={hw}
            hwIcons={hwIcons}
            onOpen={() => setOpenHwId(hw.homework_id)}
            onDelete={onDeleteHomework}
          />
        ))}
        {!pending.length && !reviewed.length ? (
          <div className="quick-empty">No homework yet — ask Liz for a focused drill.</div>
        ) : null}
      </div>

      {openHw ? (
        <HomeworkModal
          hw={openHw}
          hwIcons={hwIcons}
          onClose={() => setOpenHwId(null)}
          onSubmit={onSubmitHomework}
          submitting={submittingHw === openHw.homework_id}
        />
      ) : null}
    </div>
  );
}

function ContextPanel({
  user, lizStatus, homework, onAssignHomework, onSubmitHomework, onDeleteHomework,
  submittingHw, hwIcons, voiceQuota, currentMode, messagesCount,
  onChatPrompt, onOpenStudyPlan, recommendedCourse, lessonModes,
}) {
  return (
    <aside className="panel panel-right" aria-label="Context" data-testid="homework-panel">
      <PlanSummaryCard lizStatus={lizStatus} voiceQuota={voiceQuota} />
      <MemoryCard
        lizStatus={lizStatus}
        user={user}
        homework={homework}
        currentMode={currentMode}
        messagesCount={messagesCount}
      />
      <QuickActionsCard
        onChatPrompt={onChatPrompt}
        onOpenStudyPlan={onOpenStudyPlan}
        recommendedCourse={recommendedCourse}
        lessonModes={lessonModes}
      />
      <HomeworkCardWrap
        homework={homework}
        hwIcons={hwIcons}
        onAssignHomework={onAssignHomework}
        onSubmitHomework={onSubmitHomework}
        onDeleteHomework={onDeleteHomework}
        submittingHw={submittingHw}
        messagesCount={messagesCount}
      />
    </aside>
  );
}

/* ---------- LIZ SUGGEST STRIP ---------- */

const STATIC_SUGGESTIONS = [
  { id: 'cue',   kind: 'default', icon: '🎤', title: 'Try a Part 2 cue card', meta: '4 min', action: 'cue' },
  { id: 'essay', kind: 'essay',   icon: '✍︎', title: 'Paste your essay',      meta: 'Task 1 / 2 review', action: 'essay' },
  { id: 'drill', kind: 'drill',   icon: '🔊', title: 'Run a /θ/ drill',        meta: '90 sec', action: 'drill' },
];

function LizSuggestStrip({ suggestions, onPick }) {
  const items = (suggestions && suggestions.length) ? suggestions : STATIC_SUGGESTIONS;
  return (
    <div className="liz-suggest-strip" role="toolbar" aria-label="Liz suggests">
      {items.map((s) => (
        <button
          key={s.id}
          type="button"
          className="liz-suggest-chip"
          data-kind={s.kind || 'default'}
          onClick={() => onPick(s)}
          data-testid={`liz-suggest-${s.id}`}
        >
          <span className="lsc-icon">{s.icon || '✦'}</span>
          <span className="lsc-body">
            <span className="lsc-title">{s.title}</span>
            {s.meta ? <span className="lsc-meta">· {s.meta}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- TALK PRACTISE MODAL ---------- */

function detectPronGap(lizStatus, user) {
  const notes = Array.isArray(lizStatus?.memory_notes) ? lizStatus.memory_notes : [];
  if (Array.isArray(user?.pron_gaps) && user.pron_gaps.length) return true;
  if (Array.isArray(lizStatus?.pron_gaps) && lizStatus.pron_gaps.length) return true;
  return notes.some((n) => {
    if (typeof n === 'string') return /pron|θ|sound|accent/i.test(n);
    return n?.type === 'pron_gap'
      || /pron|θ|sound|accent/i.test(`${n?.title || ''} ${n?.body || n?.text || ''}`);
  });
}

function TalkPracticeModal({ smartDefault, onPick, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const modes = [
    {
      id: 'convo',
      icon: 'C',
      title: 'Free conversation',
      desc: 'Open Part 1 / 3 chat — Liz follows where you take it.',
      part: 'part1',
    },
    {
      id: 'drill',
      icon: 'D',
      title: 'Pronunciation drill',
      desc: 'Targeted /θ/, /ð/, /r/ minimum pairs with live underline feedback.',
      part: 'part1',
      mode: 'pronunciation',
    },
    {
      id: 'cue',
      icon: 'P2',
      title: 'Part 2 cue card',
      desc: '1 min prep · 2 min response · then Part 3 follow-ups.',
      part: 'part2',
    },
  ];
  return (
    <div className="talk-modal-backdrop" onClick={onClose} data-testid="liz-talk-modal">
      <div className="talk-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="talk-modal-title">
        <div className="talk-modal-head">
          <h3 id="talk-modal-title">What to practise?</h3>
          <p>Liz adapts to whichever you pick. You can change it any time.</p>
        </div>
        <div className="talk-modes">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              className="talk-mode"
              data-kind={m.id}
              data-default={smartDefault === m.id}
              onClick={() => onPick(m)}
              data-testid={`liz-talk-mode-${m.id}`}
            >
              <span className="tm-icon">{m.icon}</span>
              <span className="tm-body">
                <span className="tm-title">
                  {m.title}
                  {smartDefault === m.id ? <span className="tm-badge">Liz suggests</span> : null}
                </span>
                <span className="tm-desc">{m.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="talk-modal-foot">
          <button type="button" className="liz-btn liz-btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- SCENE BAR (dev preview helper) ---------- */

const SCENES = [
  { id: 'default',  label: 'Default' },
  { id: 'voice',    label: 'Voice active' },
  { id: 'speaking', label: 'Speaking review' },
  { id: 'writing',  label: 'Writing review' },
];

function SceneBar({ scene, onChange }) {
  return (
    <div className="liz-scene-bar" role="toolbar" aria-label="Preview scenes">
      <span>Scene</span>
      {SCENES.map((s) => (
        <button
          key={s.id}
          type="button"
          data-active={scene === s.id}
          onClick={() => onChange(s.id)}
        >{s.label}</button>
      ))}
    </div>
  );
}

/* ---------- REVIEW MESSAGE FORMATTERS (real attempts → Liz markdown) ---------- */

function attemptDateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function pickLatest(attempts, type) {
  if (!Array.isArray(attempts)) return null;
  return attempts
    .filter((a) => a && a.test_type === type)
    .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))[0] || null;
}

// Truncate a feedback paragraph to roughly one sentence / ~180 chars
function snippet(text, max = 180) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const last = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (last > 60 ? cut.slice(0, last + 1) : cut) + '…';
}

function formatSpeakingReview(att) {
  if (!att) return '';
  const when = attemptDateLabel(att.completed_at);
  const band = att.band_score != null ? Number(att.band_score).toFixed(1) : null;
  const fb = att.feedback || {};
  // Try several shapes returned by speaking evaluator
  const partsBlock = fb.speaking_feedback || fb.parts || null;
  let topComment = '';
  if (partsBlock && typeof partsBlock === 'object') {
    const firstKey = Object.keys(partsBlock)[0];
    const partFb = firstKey ? partsBlock[firstKey] : null;
    topComment = snippet(partFb?.feedback || partFb?.overall || '');
  }
  if (!topComment) topComment = snippet(fb.overall_feedback || fb.summary || '');
  const tip = fb.top_issue || fb.priority_fix || (Array.isArray(fb.weaknesses) ? fb.weaknesses[0] : null);
  const reviewUrl = att.id ? `/result/${att.id}` : null;

  const out = [];
  out.push(`Here's your most recent **Speaking** session — ${when || 'just now'}.`);
  if (band) out.push(`**Estimated band: ${band}**`);
  if (topComment) out.push(topComment);
  if (tip) out.push(`> **Note:** ${snippet(typeof tip === 'string' ? tip : tip.text || tip.body || '', 220)}`);
  if (reviewUrl) out.push(`[Open the full review →](${reviewUrl})`);
  return out.filter(Boolean).join('\n\n');
}

function formatWritingReview(att) {
  if (!att) return '';
  const when = attemptDateLabel(att.completed_at);
  const band = att.band_score != null ? Number(att.band_score).toFixed(1) : null;
  const fb = att.feedback || {};
  const t1 = fb.task1 || fb.task_1 || null;
  const t2 = fb.task2 || fb.task_2 || null;
  const t1Band = t1?.band_score != null ? Number(t1.band_score).toFixed(1) : null;
  const t2Band = t2?.band_score != null ? Number(t2.band_score).toFixed(1) : null;
  const taskLabel = t2 ? 'Task 2' : (t1 ? 'Task 1' : 'Essay');
  const overall = snippet(t2?.overall_feedback || t1?.overall_feedback || fb.overall_feedback || '');
  const fix = t2?.top_issue || t1?.top_issue || fb.priority_fix
    || (Array.isArray(t2?.weaknesses) && t2.weaknesses[0])
    || (Array.isArray(t1?.weaknesses) && t1.weaknesses[0])
    || null;
  const reviewUrl = att.id ? `/result/${att.id}` : null;

  const out = [];
  out.push(`Here's your most recent **Writing** essay — ${taskLabel}, ${when || 'just now'}.`);
  if (band || t1Band || t2Band) {
    const parts = [band ? `**Estimated band: ${band}**` : null];
    if (t1Band) parts.push(`Task 1 · ${t1Band}`);
    if (t2Band) parts.push(`Task 2 · ${t2Band}`);
    out.push(parts.filter(Boolean).join(' · '));
  }
  if (overall) out.push(overall);
  if (fix) out.push(`> **Important:** ${snippet(typeof fix === 'string' ? fix : fix.text || fix.body || '', 220)}`);
  if (reviewUrl) out.push(`[Open the full review →](${reviewUrl})`);
  return out.filter(Boolean).join('\n\n');
}

const EMPTY_SPEAKING_REVIEW =
  "You haven't done any **speaking** practice yet.\n\n" +
  "When you finish your first attempt, I'll walk you through what worked and what to fix — right here in this conversation.\n\n" +
  '[Try a Part 2 cue card →](/test/speaking)';

const EMPTY_WRITING_REVIEW =
  "No **writing** essays yet.\n\n" +
  "Submit a Task 1 or Task 2 essay and I'll give you concrete, examiner-style feedback right here.\n\n" +
  '[Start a writing drill →](/test/writing)';

/* ---------- STUDY PLAN ---------- */

// Defensive fallback when backend hasn't populated lizStatus.week_plan yet.
// Builds a 7-day rolling skeleton from today, mapping skill rotations to the
// existing /question-bank deep-links so each task is clickable.
function deriveWeekPlan() {
  const skills = [
    { key: 'writing',   label: 'Writing — Task 2 essay',         href: '/question-bank?writing=1',   meta: '40 min' },
    { key: 'reading',   label: 'Reading — full passage drill',   href: '/question-bank?reading=1',   meta: '30 min' },
    { key: 'listening', label: 'Listening — Sections 1–4',        href: '/question-bank?listening=1', meta: '30 min' },
    { key: 'speaking',  label: 'Speaking — Part 1·2·3 set',      href: '/question-bank?speaking=1',  meta: '15 min' },
    { key: 'writing',   label: 'Writing — Task 1 graph drill',   href: '/question-bank?writing=1',   meta: '20 min' },
    { key: 'speaking',  label: 'Speaking — Part 2 cue card',     href: '/question-bank?speaking=1',  meta: '7 min'  },
    { key: 'reading',   label: 'Reading — vocabulary review',    href: '/question-bank?reading=1',   meta: '20 min' },
  ];
  const out = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const task = skills[i % skills.length];
    out.push({
      day: dayLabel,
      is_today: i === 0,
      tasks: [
        { id: `${i}-main`,  label: task.label, href: task.href, meta: task.meta },
        { id: `${i}-vocab`, label: '10 new vocabulary cards',   href: '/courses', meta: '10 min' },
      ],
    });
  }
  return out;
}

function StudyPlanDrawer({ lizStatus, user, onClose }) {
  const navigate = useNavigate();
  // Lock body scroll while drawer is open + ESC closes.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const planDays = lizStatus?.plan_days || null;
  const planDay  = lizStatus?.plan_day  || null;
  const examDate = user?.exam_date ? new Date(user.exam_date) : null;
  const daysToExam = examDate ? Math.max(0, Math.ceil((examDate - new Date()) / 86400000)) : null;
  const targetBand = user?.target_band || lizStatus?.target_band;
  const baseBand   = lizStatus?.current_band || lizStatus?.starting_band;
  const headline = (baseBand && targetBand)
    ? `From Band ${baseBand} → ${targetBand}`
    : targetBand
      ? `Target Band ${targetBand}`
      : 'Your study plan';
  const week = Array.isArray(lizStatus?.week_plan) && lizStatus.week_plan.length
    ? lizStatus.week_plan
    : deriveWeekPlan();
  const isFallback = !Array.isArray(lizStatus?.week_plan) || !lizStatus.week_plan.length;

  const handleTask = (t) => {
    if (t?.href) {
      navigate(t.href);
      onClose?.();
    }
  };

  const progressPct = planDay && planDays ? Math.min(100, Math.round((planDay / planDays) * 100)) : null;

  return (
    <div className="study-plan-overlay" role="dialog" aria-modal="true" aria-label="Study plan" data-testid="liz-study-plan-drawer">
      <div className="study-plan-backdrop" onClick={onClose} />
      <div className="study-plan-drawer">
        <header className="study-plan-head">
          <div>
            <div className="kicker">Study plan</div>
            <h2>{headline}</h2>
            <p className="study-plan-meta">
              {planDays ? `${planDays}-day plan` : 'Rolling week'}
              {planDay && planDays ? ` · Day ${planDay} of ${planDays}` : ''}
              {daysToExam != null ? ` · ${daysToExam} days to exam` : ''}
            </p>
          </div>
          <button
            type="button"
            className="study-plan-close"
            onClick={onClose}
            aria-label="Close study plan"
            data-testid="liz-close-study-plan"
          >×</button>
        </header>

        {progressPct != null ? (
          <div className="study-plan-progress" aria-label={`${progressPct}% through plan`}>
            <div className="study-plan-progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
        ) : null}

        {isFallback ? (
          <div className="study-plan-hint">
            Liz hasn't generated a personalised plan yet — this is a starter rotation.
            Once you set your target band and exam date, your plan adapts automatically.
          </div>
        ) : null}

        <ol className="study-plan-week">
          {week.map((d, i) => {
            const dayLabel = d.day || d.date_label || `Day ${i + 1}`;
            const isToday = !!d.is_today;
            return (
              <li key={i} className="study-plan-day" data-today={isToday || undefined}>
                <div className="study-plan-day-head">
                  <span className="study-plan-day-label">{dayLabel}</span>
                  {isToday ? <span className="study-plan-today-pill">Today</span> : null}
                </div>
                <ul className="study-plan-tasks">
                  {(d.tasks || []).map((t, j) => {
                    const tLabel = typeof t === 'string' ? t : (t.label || t.title || '');
                    const tMeta  = typeof t === 'string' ? null : (t.meta || t.duration || null);
                    const tDone  = typeof t === 'object' && (t.done || t.completed);
                    const clickable = typeof t === 'object' && t.href;
                    return (
                      <li
                        key={t.id || j}
                        className="study-plan-task"
                        data-state={tDone ? 'done' : 'todo'}
                        data-clickable={clickable || undefined}
                        onClick={clickable ? () => handleTask(t) : undefined}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onKeyDown={clickable ? (e) => { if (e.key === 'Enter') handleTask(t); } : undefined}
                      >
                        <span className="step-dot" />
                        <div>
                          <div className="step-label">{tLabel}</div>
                          {tMeta ? <div className="step-meta">{tMeta}</div> : null}
                        </div>
                        {clickable ? <span className="study-plan-task-arrow">→</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// Map a candidate's average band to the recommended course tier. Mirrors the
// CoursesPage levels (beginner / mastery / advanced). Backend can override
// via lizStatus.recommended_course; this is the fallback derivation.
function deriveRecommendedCourse(lizStatus, user) {
  if (lizStatus?.recommended_course) return lizStatus.recommended_course;
  const band = Number(
    lizStatus?.current_band
    || lizStatus?.starting_band
    || user?.current_band
    || user?.starting_band
    || 0,
  );
  if (band >= 7) {
    return { level: 'advanced', short_label: 'Advanced',  href: '/advanced-mastery', sub: 'Liz · Band 7+ polish' };
  }
  if (band >= 5.5) {
    return { level: 'mastery',  short_label: 'Mastery',   href: '/mastery-course',   sub: 'Liz · Band 5.5–7 build' };
  }
  if (band > 0) {
    return { level: 'beginner', short_label: 'Beginner',  href: '/beginner-course',  sub: 'Liz · Band <5.5 base'  };
  }
  // Unknown → safe default landing
  return { level: 'mastery', short_label: 'Mastery', href: '/mastery-course', sub: 'Most students start here' };
}

function StaticVoiceOverlay({ onClose }) {
  return (
    <div className="voice-overlay" role="dialog" aria-modal="true">
      <div className="voice-orb" data-state="speaking">
        <LizAvatarImg alt="Liz" />
      </div>
      <div className="voice-bars" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <p className="voice-transcript">
        "Let's practise <em>/θ/</em>. Repeat after me: <b>think · three · nothing</b>"<span className="caret"></span>
      </p>
      <div className="voice-live-pron">
        You: "<span className="pron pron-good">think</span>" ·
        " <span className="pron pron-bad" title="closer to 'tree'">three</span>" ·
        " <span className="pron pron-ok">nothing</span>"
      </div>
      <div className="voice-controls">
        <button type="button" className="liz-btn liz-btn-ghost">Mute mic</button>
        <button type="button" className="liz-btn liz-btn-ghost">Pause</button>
        <button type="button" className="liz-btn liz-btn-primary" onClick={onClose}>End session</button>
      </div>
    </div>
  );
}

/* ---------- ROOT ---------- */

function LizD8Inner({
  user,
  messages,
  input,
  setInput,
  onSend,
  onSpeakMessage,
  sending,
  status,
  currentMode,
  sessions,
  lizStatus,
  homework,
  onLoadSession,
  onNewSession,
  onAssignHomework,
  onAppendLizMessage,
  onDeleteHomework,
  onSubmitHomework,
  submittingHw,
  onMicClick,
  autoVoice,
  onToggleAutoVoice,
  onStopSpeaking,
  voiceInsight,
  lessonModes,
  onPickLesson,
  hwIcons,
  recentAttempts,
}) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [listenBusy, setListenBusy] = useState(false);
  const [previewScene, setPreviewScene] = useState('default');
  const [talkPickerOpen, setTalkPickerOpen] = useState(false);
  const [studyPlanOpen, setStudyPlanOpen] = useState(false);
  // Mobile-only tab state (hidden on >1180px). Default 'chat' so the
  // conversation surface is the primary view on phones; Today / Tools
  // panels are reachable by tapping the segmented control.
  const [mobileTab, setMobileTab] = useState('chat');

  const recommendedCourse = useMemo(
    () => deriveRecommendedCourse(lizStatus, user),
    [lizStatus, user],
  );

  // Scene-driven derived data: pull the user's most recent attempt of the
  // type the scene preview is showing. Falls back to empty-state copy when
  // the user has no attempts yet.
  const latestSpeaking = useMemo(() => pickLatest(recentAttempts, 'speaking'), [recentAttempts]);
  const latestWriting  = useMemo(() => pickLatest(recentAttempts, 'writing'),  [recentAttempts]);

  const canvasEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    canvasEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!liz.isEnded || !liz.transcript) return;
    onAppendLizMessage?.({
      role: 'assistant',
      content: `Live conversation transcript (${Math.round((liz.elapsedSeconds || 0) / 60)} min):\n\n${liz.transcript}`,
      mode: 'reviewing',
      timestamp: new Date().toISOString(),
    });
    liz.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liz.isEnded, liz.transcript]);

  const handleTalk = () => {
    // Open picker first; selection in TalkPracticeModal calls handleTalkStart.
    setTalkPickerOpen(true);
  };

  const handleTalkStart = async (mode) => {
    setTalkPickerOpen(false);
    setVoiceOpen(true);
    const startArgs = { part: mode.part || 'part1' };
    if (mode.mode) startArgs.mode = mode.mode;
    await liz.start(startArgs);
  };

  const handleClose = () => setVoiceOpen(false);

  const smartTalkDefault = useMemo(() => {
    return detectPronGap(lizStatus, user) ? 'drill' : 'convo';
  }, [lizStatus, user]);

  const handleSuggestPick = (s) => {
    if (s.action === 'cue') {
      navigate('/test/speaking?part=2');
    } else if (s.action === 'essay') {
      const ta = document.querySelector('[data-testid="liz-input"]');
      if (ta) {
        ta.focus();
        if (!input) setInput('Here is my essay — please review it for me:\n\n');
      }
    } else if (s.action === 'drill') {
      handleTalkStart({ part: 'part1', mode: 'pronunciation' });
    } else if (s.action === 'homework') {
      onAssignHomework?.();
    } else if (s.url) {
      navigate(s.url);
    }
  };

  const talkLocked = !user?.id || liz.isConnecting || liz.isLive || liz.isFinalizing;
  const talkLockedReason = !user?.id
    ? 'Sign in to talk with Liz'
    : liz.isConnecting
      ? 'Connecting…'
      : liz.isLive
        ? 'Already live'
        : null;

  const showVoiceUpgrade = liz.isError && liz.errorCode === 'liz_live_locked';

  const effectiveStatus = useMemo(() => {
    if (status) return status;
    if (sending) return 'thinking';
    return 'idle';
  }, [status, sending]);

  const isSpeaking = effectiveStatus === 'speaking';

  // Scene bar overrides — speaking/writing scenes inject a synthetic Liz
  // turn built from the user's REAL most recent attempt (or an empty-state
  // message when the user has no attempts yet). Real `messages` are never
  // mutated, only the rendered list is augmented for preview.
  const displayMessages = useMemo(() => {
    if (previewScene === 'speaking') {
      const content = latestSpeaking ? formatSpeakingReview(latestSpeaking) : EMPTY_SPEAKING_REVIEW;
      return [...messages, {
        role: 'assistant',
        content,
        mode: 'reviewing',
        timestamp: new Date().toISOString(),
      }];
    }
    if (previewScene === 'writing') {
      const content = latestWriting ? formatWritingReview(latestWriting) : EMPTY_WRITING_REVIEW;
      return [...messages, {
        role: 'assistant',
        content,
        mode: 'reviewing',
        timestamp: new Date().toISOString(),
      }];
    }
    return messages;
  }, [messages, previewScene, latestSpeaking, latestWriting]);
  const isEmpty = !displayMessages || displayMessages.length === 0;
  const showStaticVoice = previewScene === 'voice';

  // Listen-CTA: replay first Liz message via parent's onSpeakMessage handler.
  const firstLizMessage = displayMessages.find((m) => m.role === 'assistant');
  const handleListenCta = firstLizMessage && onSpeakMessage ? async () => {
    setListenBusy(true);
    try { await onSpeakMessage(firstLizMessage); } finally {
      setTimeout(() => setListenBusy(false), 3000);
    }
  } : null;

  const pendingHwCount = Array.isArray(homework)
    ? homework.filter((h) => h.status === 'pending').length
    : 0;

  return (
    <div className="liz-scope" data-testid="liz-teacher-page">
      <SceneBar scene={previewScene} onChange={setPreviewScene} />
      <div className="liz-mobile-tabs" role="tablist" aria-label="Liz sections">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'today'}
          data-active={mobileTab === 'today'}
          onClick={() => setMobileTab('today')}
          data-testid="liz-mobile-tab-today"
        >Today</button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'chat'}
          data-active={mobileTab === 'chat'}
          onClick={() => setMobileTab('chat')}
          data-testid="liz-mobile-tab-chat"
        >Chat</button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'tools'}
          data-active={mobileTab === 'tools'}
          onClick={() => setMobileTab('tools')}
          data-testid="liz-mobile-tab-tools"
        >
          Tools
          {pendingHwCount > 0 ? (
            <span className="liz-mobile-tab-badge" aria-label={`${pendingHwCount} homework pending`}>{pendingHwCount}</span>
          ) : null}
        </button>
      </div>
      <main className="liz-layout" data-mobile-tab={mobileTab}>
        <TodayPanel
          user={user}
          lizStatus={lizStatus}
          sessions={sessions}
          onLoadSession={onLoadSession}
          onNewSession={onNewSession}
          onOpenStudyPlan={() => setStudyPlanOpen(true)}
        />

        <section className="canvas" data-mode={currentMode || 'teaching'}>
          <CanvasHead
            effectiveStatus={effectiveStatus}
            isSpeaking={isSpeaking}
            autoVoice={autoVoice}
            onToggleAutoVoice={onToggleAutoVoice}
            onStopSpeaking={onStopSpeaking}
            onNewSession={onNewSession}
          />

          {!isEmpty && handleListenCta ? (
            <ListenCta onClick={handleListenCta} busy={listenBusy} />
          ) : null}

          {!isEmpty ? (
            <ConversationStream messages={displayMessages} onListen={onSpeakMessage} />
          ) : (
            <div className="conversation" id="liz-conversation" />
          )}

          {!isEmpty && !showStaticVoice && displayMessages.length <= 2 && !input?.trim() ? (
            <LizSuggestStrip
              suggestions={lizStatus?.suggestions}
              onPick={handleSuggestPick}
            />
          ) : null}

          {voiceInsight && !isEmpty ? (
            <div className="voice-insight" data-testid="liz-voice-insight">
              <span className="voice-insight-label">Voice insight</span>
              <span className="voice-insight-text">{voiceInsight}</span>
            </div>
          ) : null}

          <div ref={canvasEndRef} />

          <Composer
            input={input}
            setInput={setInput}
            onSend={onSend}
            onTalk={handleTalk}
            sending={sending}
            talkLocked={talkLocked}
            talkLockedReason={talkLockedReason}
            onMicClick={onMicClick}
            status={effectiveStatus}
          />

          {talkPickerOpen ? (
            <TalkPracticeModal
              smartDefault={smartTalkDefault}
              onPick={handleTalkStart}
              onClose={() => setTalkPickerOpen(false)}
            />
          ) : null}

          {voiceOpen ? (
            <VoiceOverlay liz={liz} onClose={handleClose} />
          ) : null}

          {showStaticVoice ? (
            <StaticVoiceOverlay onClose={() => setPreviewScene('default')} />
          ) : null}


          {showVoiceUpgrade ? (
            <div className="voice-upgrade" role="alert">
              <p><b>Live with Liz</b> is on Premium plans only.</p>
              <a className="liz-btn liz-btn-primary" href="/pricing/v2">See plans</a>
              <button type="button" className="liz-btn liz-btn-ghost" onClick={liz.reset}>Dismiss</button>
            </div>
          ) : null}
        </section>

        <ContextPanel
          user={user}
          lizStatus={lizStatus}
          homework={homework}
          onAssignHomework={onAssignHomework}
          onSubmitHomework={onSubmitHomework}
          onDeleteHomework={onDeleteHomework}
          submittingHw={submittingHw}
          hwIcons={hwIcons}
          voiceQuota={liz.quota}
          currentMode={currentMode}
          messagesCount={messages?.length || 0}
          onChatPrompt={onPickLesson}
          onOpenStudyPlan={() => setStudyPlanOpen(true)}
          recommendedCourse={recommendedCourse}
          lessonModes={lessonModes}
        />
      </main>

      {studyPlanOpen ? (
        <StudyPlanDrawer
          lizStatus={lizStatus}
          user={user}
          onClose={() => setStudyPlanOpen(false)}
        />
      ) : null}
    </div>
  );
}

export default function LizD8(props) {
  return (
    <ConversationProvider>
      <LizD8Inner {...props} />
    </ConversationProvider>
  );
}
