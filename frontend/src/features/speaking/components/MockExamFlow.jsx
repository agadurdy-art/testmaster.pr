import React, { useEffect, useRef, useState } from 'react';
import { ConversationProvider } from '@elevenlabs/react';
import { Clock, Ban, CreditCard, Volume2, Mic, CheckCircle2, AlertTriangle } from 'lucide-react';

import SpeakingHeader from './SpeakingHeader';
import ProcessingState from './ProcessingState';
import ResultsState from './ResultsState';
import ErrorState from './ErrorState';
import VoiceOverlay from '../../liz/components/VoiceOverlay';

import useElevenLabsLiz from '../../liz/hooks/useElevenLabsLiz';
import { mintClientRequestId } from '../../../lib/clientRequestId';
import { adaptSpeakingResult } from '../lib/adaptSpeakingResult';

/**
 * MockExamFlow — a COMPLETE IELTS Speaking mock exam in ONE continuous Liz
 * conversation (Parts 1-3, ~11-14 min). Liz (a dedicated ElevenLabs "examiner"
 * agent) runs the whole test and gives a brief spoken closing; when the call
 * ends we grade holistically from the transcript (POST /api/speaking/evaluate-exam,
 * Sonnet, no audio/Azure — too slow/expensive/fragile on a long recording).
 * Real per-word pronunciation belongs to the shorter Smart Practice flows.
 */
async function submitExamEval({ user, conversationId, clientRequestId }) {
  const base = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';
  const form = new FormData();
  form.append('user_id', user.id);
  form.append('conversation_id', conversationId);
  form.append('user_language', user.feedback_language || 'en');
  form.append('target_band', String(user.target_band || 7.0));
  form.append('context', 'exam');
  if (clientRequestId) form.append('client_request_id', clientRequestId);
  const resp = await fetch(`${base}/api/speaking/evaluate-exam`, { method: 'POST', body: form });
  if (!resp.ok) {
    let detail;
    try { detail = await resp.json(); } catch (_e) { detail = await resp.text(); }
    const msg = typeof detail === 'string' ? detail : (detail?.detail?.message || detail?.detail || `HTTP ${resp.status}`);
    throw new Error(msg);
  }
  return resp.json();
}

// Hard cost cap for one mock. A full IELTS Speaking test is ~14 minutes and the
// exam agent should end on its own before then; this is the worst-case backstop
// so a stuck / rambling session can't run up ElevenLabs conversation minutes —
// the dominant cost of a mock (~$0.08–0.10/min). A 15-minute ceiling pins the
// per-mock ElevenLabs spend at roughly $1.2–1.5, which is the cost we price the
// 1-credit (~$3) mock against.
const MAX_EXAM_SECONDS = 15 * 60;

function MockExamFlowInner({ user, onExit }) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState('live'); // live | submitting | results | error
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);
  const submittedRef = useRef(false);
  const clientRequestIdRef = useRef(null);

  // No auto-start: the candidate must pass the pre-flight (warnings + mic check)
  // first. Starting is what mints the session and spends the credit, so it must
  // be a deliberate action.
  const beginExam = () => {
    if (started || !user?.id) return;
    setStarted(true);
    liz.start({ part: 'part1', kind: 'exam' });
  };

  // Liz session ended → grade the whole exam from the transcript.
  useEffect(() => {
    if (!liz.isEnded || submittedRef.current) return;
    submittedRef.current = true;
    const conversationId = liz.conversationId;
    if (!conversationId) {
      onExit?.();
      liz.reset();
      return;
    }
    setPhase('submitting');
    if (!clientRequestIdRef.current) clientRequestIdRef.current = mintClientRequestId();
    submitExamEval({ user, conversationId, clientRequestId: clientRequestIdRef.current })
      .then((data) => {
        setScoreResult(data);
        clientRequestIdRef.current = null;
        setPhase('results');
      })
      .catch((err) => {
        setScoreError(err?.message || String(err));
        setPhase('error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liz.isEnded]);

  // Cost-cap backstop: once the exam is live, force-end it after MAX_EXAM_SECONDS
  // so a runaway session can't keep billing ElevenLabs minutes. stop() flows into
  // the same isEnded → grade path as a natural finish.
  useEffect(() => {
    if (!liz.isLive) return undefined;
    const id = setTimeout(() => {
      try { liz.stop(); } catch (_) { /* already ending */ }
    }, MAX_EXAM_SECONDS * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liz.isLive]);

  const handleClose = () => {
    onExit?.();
    liz.reset();
  };

  if (phase === 'submitting') {
    return (
      <>
        <SpeakingHeader user={user} />
        <ProcessingState />
      </>
    );
  }

  if (phase === 'results') {
    const adapted = adaptSpeakingResult(scoreResult, {
      targetBand: user?.target_band,
      durationSeconds: scoreResult?.metrics?.total_duration,
    }) || scoreResult;
    const withConversation = { ...adapted, conversation_turns: liz.transcriptTurns || scoreResult?.conversation_turns || [] };
    return (
      <>
        <SpeakingHeader user={user} />
        <ResultsState data={withConversation} onRetryCard={handleClose} onNewCard={handleClose} />
      </>
    );
  }

  if (phase === 'error') {
    return (
      <>
        <SpeakingHeader user={user} />
        <ErrorState
          errorMessage={scoreError}
          retryLabel="Start a new exam"
          onRetry={handleClose}
          onBack={handleClose}
        />
      </>
    );
  }

  if (liz.isError && (liz.errorCode === 'liz_live_locked' || liz.errorCode === 'no_mock_credits')) {
    const noCredits = liz.errorCode === 'no_mock_credits';
    return (
      <>
        <SpeakingHeader user={user} />
        <section style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 32px 80px' }}>
          <div style={{ background: 'var(--sp-card)', borderRadius: 'var(--sp-radius)', border: '1px solid var(--sp-border)', boxShadow: 'var(--sp-shadow-card)', padding: 48, textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <h2 className="sp-font-display" style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>{noCredits ? 'You need a Full Mock credit' : 'The mock exam is a Premium feature'}</h2>
            <p style={{ color: 'var(--sp-muted-fg)', marginBottom: 24 }}>{liz.error || (noCredits ? 'Each full mock is one $3 credit. Buy credits to start.' : 'Upgrade your plan to take a full live mock exam with Liz.')}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="sp-btn-primary" href={noCredits ? '/full-mock' : '/pricing/v2'} style={{ height: 44, padding: '0 22px', display: 'inline-flex', alignItems: 'center' }}>{noCredits ? 'Buy credits' : 'See plans'}</a>
              <button className="sp-btn-ghost" onClick={handleClose} style={{ height: 44, padding: '0 18px' }}>Back</button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Pre-flight — shown until the candidate deliberately starts. Sets expectations
  // (length, no pausing, credit is spent even if ended early) and verifies the
  // mic before a single credit is spent.
  if (!started) {
    return (
      <>
        <SpeakingHeader user={user} />
        <ExamPreflight onStart={beginExam} onCancel={handleClose} />
      </>
    );
  }

  return (
    <>
      <SpeakingHeader user={user} />
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 32px 0' }}>
        <span className="sp-mono-label">Mock Exam · Full IELTS Speaking with Liz (~12 min)</span>
      </section>
      <section style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 32px 80px' }}>
        <div className="liz-scope">
          <VoiceOverlay liz={liz} onClose={async () => { try { await liz.stop(); } catch (_e) { handleClose(); } }} />
        </div>
      </section>
    </>
  );
}

// useElevenLabsLiz → useConversation() must run inside a ConversationProvider
// (required by @elevenlabs/react ≥1.2). Mirror SpeakingPractice/LizD8: keep the
// hook in an Inner component and wrap the export. Without this the whole
// /full-mock route throws "useRegisterCallbacks must be used within a
// ConversationProvider" → the error-boundary "Something went wrong" screen.
export default function MockExamFlow(props) {
  return (
    <ConversationProvider>
      <MockExamFlowInner {...props} />
    </ConversationProvider>
  );
}

// Pre-flight gate: expectations + a real mic check before the exam (and the
// credit) starts.
function ExamPreflight({ onStart, onCancel }) {
  const [micOk, setMicOk] = useState(false);

  const RULES = [
    { icon: Clock, title: 'About 12–14 minutes', body: 'All three parts run back-to-back, just like the real test.' },
    { icon: Ban, title: 'No pausing or restarting', body: 'Once it starts you can’t stop and resume — set aside the full time.' },
    { icon: CreditCard, title: 'One credit, spent on start', body: 'Ending early still uses your credit, so begin only when you’re ready.' },
    { icon: Volume2, title: 'Find a quiet room', body: 'Use a headset if you can, and speak naturally at a normal pace.' },
  ];

  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 80px' }}>
      <div style={{ background: 'var(--sp-card)', borderRadius: 'var(--sp-radius)', border: '1px solid var(--sp-border)', boxShadow: 'var(--sp-shadow-card)', padding: 32 }}>
        <h2 className="sp-font-display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>Before you start</h2>
        <p style={{ color: 'var(--sp-muted-fg)', marginBottom: 22, fontSize: 14 }}>A full IELTS Speaking mock with Liz. Please read this first.</p>

        <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
          {RULES.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--sp-bg, #fafafa)', border: '1px solid var(--sp-border)', borderRadius: 14, padding: '12px 14px' }}>
                <span style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'hsl(160 60% 94%)', color: 'hsl(160 70% 30%)' }}>
                  <Icon style={{ width: 17, height: 17 }} />
                </span>
                <span>
                  <b style={{ display: 'block', fontSize: 14.5, color: 'var(--sp-foreground)' }}>{r.title}</b>
                  <small style={{ color: 'var(--sp-muted-fg)', fontSize: 13 }}>{r.body}</small>
                </span>
              </div>
            );
          })}
        </div>

        <MicCheck onResult={setMicOk} />

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24, flexWrap: 'wrap' }}>
          <button className="sp-btn-ghost" onClick={onCancel} style={{ height: 46, padding: '0 20px' }}>Back</button>
          <button
            className="sp-btn-primary"
            onClick={onStart}
            disabled={!micOk}
            style={{ height: 46, padding: '0 26px', opacity: micOk ? 1 : 0.5, cursor: micOk ? 'pointer' : 'not-allowed' }}
          >
            {micOk ? 'Start exam →' : 'Check your mic first'}
          </button>
        </div>
      </div>
    </section>
  );
}

function MicCheck({ onResult }) {
  const [state, setState] = useState('idle'); // idle | checking | ok | denied
  const [level, setLevel] = useState(0);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch (_) { /* ignore */ }
    try { ctxRef.current?.close(); } catch (_) { /* ignore */ }
    streamRef.current = null;
    ctxRef.current = null;
  };

  useEffect(() => cleanup, []);

  const start = async () => {
    setState('checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (let i = 0; i < data.length; i += 1) { const v = Math.abs(data[i] - 128); if (v > peak) peak = v; }
        const lvl = Math.min(1, peak / 40);
        setLevel(lvl);
        if (lvl > 0.15) { setState('ok'); onResult?.(true); }
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (_) {
      setState('denied');
      onResult?.(false);
    }
  };

  return (
    <div style={{ border: '1px solid var(--sp-border)', borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Mic style={{ width: 17, height: 17, color: 'var(--sp-muted-fg)' }} />
        <b style={{ fontSize: 14, color: 'var(--sp-foreground)' }}>Microphone check</b>
        {state === 'ok' && <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, color: 'hsl(160 70% 32%)', fontSize: 13, fontWeight: 600 }}><CheckCircle2 style={{ width: 15, height: 15 }} /> Working</span>}
        {state === 'denied' && <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, color: 'hsl(0 70% 45%)', fontSize: 13, fontWeight: 600 }}><AlertTriangle style={{ width: 15, height: 15 }} /> Blocked</span>}
      </div>

      {state === 'idle' && (
        <button className="sp-btn-ghost" onClick={start} style={{ height: 40, padding: '0 16px' }}>Test microphone</button>
      )}

      {(state === 'checking' || state === 'ok') && (
        <>
          <div style={{ height: 10, borderRadius: 999, background: 'var(--sp-border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round(level * 100)}%`, background: state === 'ok' ? 'hsl(160 70% 42%)' : 'hsl(199 89% 55%)', transition: 'width 80ms linear' }} />
          </div>
          <small style={{ display: 'block', marginTop: 8, color: 'var(--sp-muted-fg)', fontSize: 12.5 }}>
            {state === 'ok' ? 'Great — your mic is picking up sound.' : 'Say something out loud to test your mic…'}
          </small>
        </>
      )}

      {state === 'denied' && (
        <small style={{ display: 'block', color: 'var(--sp-muted-fg)', fontSize: 12.5 }}>
          Mic access was blocked. Click the lock icon in the address bar → Microphone → Allow, then{' '}
          <button onClick={start} style={{ background: 'none', border: 'none', color: 'hsl(160 70% 32%)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 12.5 }}>try again</button>.
        </small>
      )}
    </div>
  );
}
