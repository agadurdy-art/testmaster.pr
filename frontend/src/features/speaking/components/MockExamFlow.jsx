import React, { useEffect, useRef, useState } from 'react';

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

export default function MockExamFlow({ user, onExit }) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState('live'); // live | submitting | results | error
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);
  const submittedRef = useRef(false);
  const clientRequestIdRef = useRef(null);

  useEffect(() => {
    if (started || !user?.id) return;
    setStarted(true);
    liz.start({ part: 'part1', kind: 'exam' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, user?.id]);

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

  if (liz.isError && liz.errorCode === 'liz_live_locked') {
    return (
      <>
        <SpeakingHeader user={user} />
        <section style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 32px 80px' }}>
          <div style={{ background: 'var(--sp-card)', borderRadius: 'var(--sp-radius)', border: '1px solid var(--sp-border)', boxShadow: 'var(--sp-shadow-card)', padding: 48, textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
            <h2 className="sp-font-display" style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>The mock exam is a Premium feature</h2>
            <p style={{ color: 'var(--sp-muted-fg)', marginBottom: 24 }}>{liz.error || 'Upgrade your plan to take a full live mock exam with Liz.'}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a className="sp-btn-primary" href="/pricing/v2" style={{ height: 44, padding: '0 22px', display: 'inline-flex', alignItems: 'center' }}>See plans</a>
              <button className="sp-btn-ghost" onClick={handleClose} style={{ height: 44, padding: '0 18px' }}>Back</button>
            </div>
          </div>
        </section>
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
