// Left panel + center-canvas building blocks for the Liz D8 tutor UI
// (TodayPanel, ConversationStream, CanvasHead, ListenCta, Composer + svg icons).
// Extracted verbatim from LizD8.jsx (lines 184-551) during the monolith split.
import React from 'react';
import {
  LizAvatarImg, formatRelativeTime, MarkdownBlock, PronWordsLine,
} from './markdown';

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

export {
  TodayPanel, ConversationStream, CanvasHead, ListenCta, Composer,
  MicSvg, VolumeOnSvg, VolumeOffSvg, StopSvg, PlaySvg, AttachSvg,
};
