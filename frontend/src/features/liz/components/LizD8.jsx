/**
 * LizD8
 * -----
 * D8 design port: 3-column "Today with Liz / canvas / Liz remembers" shell
 * with bottom composer that has a "Talk with Liz" button. The button opens a
 * VoiceOverlay backed by useElevenLabsLiz; on call end the transcript drops
 * back into the conversation as a Liz message.
 *
 * This is a presentational/shell component — all chat / homework / session
 * state is owned by LizTeacher.js (so the existing /api/liz/* integrations
 * keep working unchanged). LizTeacher passes that state in as props.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import useElevenLabsLiz from '../hooks/useElevenLabsLiz';
import VoiceOverlay from './VoiceOverlay';
import '../liz.css';

const LIZ_AVATAR_LETTER = 'L';

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

function PronWordsLine({ words }) {
  if (!Array.isArray(words) || !words.length) return null;
  return (
    <p className="turn-pron">
      {words.map((w, i) => {
        const cls = w.score == null ? '' : w.score < 70 ? 'pron pron-bad' : w.score < 85 ? 'pron pron-ok' : 'pron pron-good';
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
                {isLiz ? LIZ_AVATAR_LETTER : 'A'}
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
                : <p>{m.content}</p>
              }
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Composer({
  input, setInput, onSend, onTalk, sending, talkLocked, talkLockedReason,
}) {
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  return (
    <form className="composer" onSubmit={(e) => { e.preventDefault(); onSend(); }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ask Liz anything — or paste your essay for instant feedback…"
        rows={2}
        data-testid="liz-composer-input"
      />
      <div className="composer-row">
        <button type="button" className="liz-btn liz-btn-ghost" title="Attach (coming soon)" disabled>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 13l5-5a3 3 0 114 4l-7 7a5 5 0 01-7-7l8-8a1 1 0 011 1" />
          </svg>
          Attach
        </button>
        <span className="hint">Press <kbd>Enter</kbd> to send · <kbd>⇧ Enter</kbd> for new line</span>
        <button
          type="button"
          className="liz-btn liz-btn-voice"
          onClick={onTalk}
          disabled={talkLocked}
          title={talkLockedReason || 'Start a live conversation with Liz'}
          data-testid="liz-talk-btn"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <rect x="8" y="3" width="4" height="10" rx="2" />
            <path d="M5 10a5 5 0 0010 0M10 15v3" />
          </svg>
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

function TodayPanel({ user, lizStatus, sessions, onLoadSession, onNewSession }) {
  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const examDate = user?.exam_date ? new Date(user.exam_date) : null;
  const daysToExam = examDate ? Math.max(0, Math.ceil((examDate - today) / 86400000)) : null;

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
        <div className="kicker">Today's focus</div>
        <h3>{lizStatus?.today_focus || 'Open conversation'}</h3>
        <p>
          {lizStatus?.today_summary
            || "Ask Liz anything, paste an essay for instant feedback, or tap Talk with Liz for a live tutor session."}
        </p>
      </div>

      <div className="panel-section-head">
        <span>Recent sessions</span>
        <button type="button" className="liz-btn-link" onClick={onNewSession} data-testid="liz-new-session">New</button>
      </div>
      <ol className="lesson-steps" aria-label="Recent sessions">
        {(sessions || []).slice(0, 6).map((s) => (
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
        {!sessions?.length ? (
          <li className="lesson-step" data-state="todo">
            <span className="step-dot"></span>
            <div><div className="step-label">No previous sessions yet</div></div>
          </li>
        ) : null}
      </ol>
    </aside>
  );
}

function ContextPanel({ lizStatus, homework, onAssignHomework, voiceQuota }) {
  const pending = (homework || []).filter((h) => h.status === 'pending');
  const reviewed = (homework || []).filter((h) => h.status === 'reviewed').slice(0, 3);

  const minutesLeft = voiceQuota?.seconds_remaining != null
    ? Math.max(0, Math.floor(voiceQuota.seconds_remaining / 60))
    : null;

  return (
    <aside className="panel panel-right" aria-label="Liz remembers">
      <div className="panel-section-head"><span>Liz remembers</span></div>
      <ul className="memory-list">
        {(lizStatus?.memory_notes || []).slice(0, 4).map((note, i) => (
          <li key={i}>{note}</li>
        ))}
        {!lizStatus?.memory_notes?.length ? (
          <li className="memory-empty">Liz will start jotting notes as you work together.</li>
        ) : null}
      </ul>

      <div className="panel-section-head"><span>Homework</span>
        <button type="button" className="liz-btn-link" onClick={onAssignHomework}>Ask for one</button>
      </div>
      <div className="quick-grid">
        {pending.slice(0, 3).map((hw) => (
          <div key={hw.homework_id} className="quick-card" data-state="pending">
            <div className="qc-title">{hw.title}</div>
            <div className="qc-meta">{hw.type} · due {hw.due_date ? new Date(hw.due_date).toLocaleDateString() : 'soon'}</div>
          </div>
        ))}
        {reviewed.map((hw) => (
          <div key={hw.homework_id} className="quick-card" data-state="reviewed">
            <div className="qc-title">{hw.title}</div>
            <div className="qc-meta">Reviewed · band {hw.score ?? '—'}/10</div>
          </div>
        ))}
        {!pending.length && !reviewed.length ? (
          <div className="quick-empty">No homework yet — ask Liz for a focused drill.</div>
        ) : null}
      </div>

      <div className="plan-summary">
        <div className="plan-row">
          <span>Plan</span>
          <b>{lizStatus?.plan_label || lizStatus?.plan || 'Free'}</b>
        </div>
        <div className="plan-row">
          <span>Messages</span>
          <b>
            {lizStatus?.messages_used != null && lizStatus?.messages_quota != null
              ? `${lizStatus.messages_used}/${lizStatus.messages_quota}`
              : '—'}
          </b>
        </div>
        <div className="plan-row">
          <span>Live with Liz</span>
          <b>{minutesLeft != null ? `${minutesLeft} min` : '—'}</b>
        </div>
      </div>
    </aside>
  );
}

function LizD8Inner({
  user,
  messages,
  input,
  setInput,
  onSend,
  onSpeakMessage,
  sending,
  currentMode,
  sessions,
  lizStatus,
  homework,
  onLoadSession,
  onNewSession,
  onAssignHomework,
  onAppendLizMessage,
}) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const [voiceOpen, setVoiceOpen] = useState(false);
  const canvasEndRef = useRef(null);

  // Auto-scroll the conversation when messages change.
  useEffect(() => {
    canvasEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // After a live session ends with a transcript, drop it into the chat as
  // a Liz message so the user has a written record.
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

  const handleTalk = async () => {
    setVoiceOpen(true);
    await liz.start({ part: 'part1' });
  };

  const handleClose = () => {
    setVoiceOpen(false);
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

  const status = useMemo(() => {
    if (sending) return 'thinking';
    return 'idle';
  }, [sending]);

  return (
    <div className="liz-scope">
      <main className="liz-layout">
        <TodayPanel
          user={user}
          lizStatus={lizStatus}
          sessions={sessions}
          onLoadSession={onLoadSession}
          onNewSession={onNewSession}
        />

        <section className="canvas" data-mode={currentMode || 'default'}>
          <header className="canvas-head">
            <div className="liz-avatar-d8" aria-hidden="true">{LIZ_AVATAR_LETTER}</div>
            <div>
              <h1 className="liz-name">Liz</h1>
              <div className="liz-role">
                <span className="presence" data-status={status}></span>
                Your AI IELTS coach · here now
              </div>
            </div>
            <div className="head-actions">
              <button type="button" className="icon-btn" title="Start a fresh conversation" onClick={onNewSession}>＋</button>
            </div>
          </header>

          <ConversationStream messages={messages} onListen={onSpeakMessage} />
          <div ref={canvasEndRef} />

          <Composer
            input={input}
            setInput={setInput}
            onSend={onSend}
            onTalk={handleTalk}
            sending={sending}
            talkLocked={talkLocked}
            talkLockedReason={talkLockedReason}
          />

          {voiceOpen ? (
            <VoiceOverlay
              liz={liz}
              onClose={handleClose}
            />
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
          lizStatus={lizStatus}
          homework={homework}
          onAssignHomework={onAssignHomework}
          voiceQuota={liz.quota}
        />
      </main>
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
