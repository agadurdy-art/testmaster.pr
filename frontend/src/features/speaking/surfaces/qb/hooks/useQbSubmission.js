import { useState, useEffect } from 'react';
import { mintClientRequestId } from '../../../../../lib/clientRequestId';
import { savePendingSpeaking, getPendingSpeaking, clearPendingSpeaking, attachJobToPending, FREE_RESUME_MS } from '../../../../../lib/pendingSpeaking';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Submission pipeline for the QB Speaking page: crash-safe persistence
 * (IndexedDB via pendingSpeaking), the durable async evaluate job queue
 * (structured Part 1/3 + cue-card Part 2), idempotent resume after a
 * page-leave, and the overlay's tier/step/error state.
 *
 * The page keeps ownership of the shared refs (audioBlobsRef,
 * clientRequestIdRef) and of the answers/module state — they're passed in
 * so the recording loop and this pipeline stay in sync without duplicating
 * state.
 */
export function useQbSubmission({
  user,
  currentPart,
  selectedModule,
  moduleContent,
  answers,
  audioBlobsRef,
  clientRequestIdRef,
  setResults,
  setShowTierModal,
}) {
  // Submission overlay: covers the screen while /api/speaking/submit is in flight.
  // Without this, clicking Basic/Premium just dismisses the modal and the user
  // sees the stale Part 3 question for ~30–60s — they assume it's broken and leave.
  // submittingTier=null means idle; 'free'|'premium' means an overlay is showing.
  // submitStep narrates progress so users know we're working: 'preparing' (base64
  // encode for premium), 'uploading' (HTTP request in flight), 'evaluating'
  // (server is scoring). 'error' shows a retry path without bouncing the user.
  const [submittingTier, setSubmittingTier] = useState(null);
  const [submitStep, setSubmitStep] = useState('idle');
  const [submitError, setSubmitError] = useState(null);
  // A crash-saved submission found in IndexedDB on load (page-leave recovery).
  // null = none; otherwise the persisted record + whether it's still in the
  // free idempotency window.
  const [pendingResume, setPendingResume] = useState(null);

  // Page-leave recovery: on first load, surface any crash-saved submission so
  // the user can finish grading instead of silently losing the test. We only
  // offer it when not already mid-submit.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rec = await getPendingSpeaking();
      if (cancelled || !rec || !rec.blobs || Object.keys(rec.blobs).length === 0) return;
      const ageMs = Date.now() - (rec.createdAt || 0);
      // Drop records older than 24h — far past any usefulness, and the audio
      // shouldn't linger on disk indefinitely.
      if (ageMs > 24 * 60 * 60 * 1000) { clearPendingSpeaking(); return; }
      setPendingResume({ record: rec, free: ageMs < FREE_RESUME_MS });
    })();
    return () => { cancelled = true; };
  }, []);

  // While a grade is actively in flight, nudge before an accidental tab close.
  // The answers are already crash-saved to IndexedDB so nothing is truly lost,
  // but finishing here avoids a needless re-grade round-trip.
  useEffect(() => {
    const active = submittingTier && submitStep !== 'error' && submitStep !== 'idle';
    if (!active) return undefined;
    const onBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [submittingTier, submitStep]);

  // Re-fire a recovered submission. Idempotent within the backend's 10-min
  // window (free); past it the user already consented to a fresh evaluation
  // via the banner copy.
  const resumePendingSubmission = async () => {
    if (!pendingResume?.record) return;
    const rec = pendingResume.record;
    setPendingResume(null);
    // If the async submit already enqueued a server job, reconnect to it (no
    // re-upload) — the server graded it whether we stayed or not.
    if (rec.jobId) {
      setSubmittingTier(rec.tier || 'free');
      setSubmitError(null);
      setSubmitStep('evaluating');
      const polled = await pollStructuredJob(rec.jobId);
      if (polled.error) { setSubmitError(polled.error); setSubmitStep('error'); return; }
      finishStructured(polled.result);
      return;
    }
    // No job yet (the upload never completed) → re-submit idempotently.
    submitTest(rec.tier || 'free', {
      clientRequestId: rec.clientRequestId,
      part: rec.part,
      setId: rec.setId,
      topic: rec.topic,
      cueCard: rec.cueCard,
      answers: rec.answers || [],
      blobs: rec.blobs || {},
    });
  };

  const dismissPendingResume = () => {
    clearPendingSpeaking();
    setPendingResume(null);
  };

  // Common success sink for the structured (Part 1/3) async path.
  const finishStructured = (result) => {
    setResults(result);
    clearPendingSpeaking();          // graded → nothing left to recover
    audioBlobsRef.current = {};
    clientRequestIdRef.current = null;
    setSubmittingTier(null);
    setSubmitStep('idle');
  };

  // Poll a durable speaking job until it finishes. The server grades it
  // independent of this connection, so even if the user left and came back this
  // resolves the SAME job. Returns {result} or {error}.
  const pollStructuredJob = async (jobId, { maxMs = 6 * 60 * 1000, intervalMs = 2500 } = {}) => {
    const deadline = Date.now() + maxMs;
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`${API_URL}/api/speaking-practice/jobs/${jobId}`);
        if (r.ok) {
          const j = await r.json();
          if (j.status === 'completed' && j.result) return { result: j.result };
          if (j.status === 'failed') return { error: j.error || 'Grading failed. Please try again.' };
        }
        // 404 right after enqueue can happen on a read replica — keep polling.
      } catch (_) { /* transient network — keep polling */ }
      await new Promise((res) => setTimeout(res, intervalMs));
    }
    return { error: 'Grading is taking longer than expected. Your answers are saved — check "My results" in a minute.' };
  };

  // Convert blob to base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const submitTest = async (tier = 'free', resumeData = null) => {
    // Per-part submission. Routes to the unified Sonnet-backed
    // /api/speaking/evaluate endpoint (same path Smart Practice/Cambridge use).
    // The legacy /api/speaking/submit required EMERGENT_LLM_KEY and silently
    // returned `success:true, error:"Evaluation service not configured"` when
    // the key was missing — which surfaced as "No evaluation data returned"
    // in the UI. The unified endpoint uses ANTHROPIC_API_KEY (Sonnet)
    // and auto-tiers from the user's plan instead of free/premium toggle.
    //
    // `resumeData` (optional) lets a recovered submission re-run WITHOUT relying
    // on component state — it carries the part, answers, blobs and (crucially)
    // the original client_request_id, so a resume after a page-leave is
    // idempotent (free within the backend's 10-min window).
    setShowTierModal(false);
    setSubmittingTier(tier);
    setSubmitError(null);
    setSubmitStep('uploading');

    try {
      // Resolve the submission payload from resumeData when resuming, otherwise
      // from live component state.
      const part = resumeData ? resumeData.part : currentPart;
      const setId = resumeData ? resumeData.setId : selectedModule;
      const partAnswers = resumeData
        ? resumeData.answers
        : answers.filter(a => a.part === String(currentPart));
      const blobFor = (qid) => (resumeData ? resumeData.blobs?.[qid] : audioBlobsRef.current[qid]);
      const partBlobs = partAnswers.map(a => blobFor(a.question_id)).filter(Boolean);

      if (partBlobs.length === 0) {
        setSubmitError('No audio captured for this part. Re-record your answers and try again.');
        setSubmitStep('error');
        return;
      }

      // Mint once and reuse on transient retry / page-leave resume so the
      // backend idempotency cache short-circuits without re-running Azure +
      // Sonnet (and without charging a second evaluation).
      if (resumeData?.clientRequestId) {
        clientRequestIdRef.current = resumeData.clientRequestId;
      } else if (!clientRequestIdRef.current) {
        clientRequestIdRef.current = mintClientRequestId();
      }

      // Crash-safe persistence: before the (long) request goes out, stash
      // everything needed to re-run it so closing the tab can't lose the test.
      // Skipped when we're already resuming (the record is already on disk).
      if (!resumeData) {
        const topic = moduleContent?.title || (part === 1 ? 'Part 1 — Introduction' : part === 3 ? 'Part 3 — Discussion' : 'Part 2 — Long Turn');
        const blobs = {};
        partAnswers.forEach((a) => { const b = blobFor(a.question_id); if (b) blobs[a.question_id] = b; });
        savePendingSpeaking({
          clientRequestId: clientRequestIdRef.current,
          tier,
          part,
          setId: setId || null,
          topic,
          cueCard: part === 2 ? {
            prompt: moduleContent?.part2?.cue_card?.topic || 'Cue card monologue',
            bullets: moduleContent?.part2?.cue_card?.bullets || [],
          } : null,
          answers: partAnswers.map(a => ({ question_id: a.question_id, part: a.part, question: a.question, duration: a.duration })),
          blobs,
          createdAt: Date.now(),
        });
        setPendingResume(null); // hide any stale resume banner now that we're live
      }

      // Multi-question parts (Part 1 interview, Part 3 discussion) route to the
      // structured per-question pipeline so EACH answer is transcribed +
      // evaluated independently (Azure×N premium / Whisper×N basic + Sonnet×1),
      // counted as ONE eval. The legacy single-blob path concatenated every
      // answer into one webm and ran Azure recognize_once(), which stopped at
      // the first pause — so only the first question was ever evaluated.
      if (part === 1 || part === 3) {
        const form = new FormData();
        form.append('user_id', user?.id || '');
        form.append('part', `part${part}`);
        form.append('topic', (resumeData ? resumeData.topic : moduleContent?.title) || (part === 1 ? 'Part 1 — Introduction' : 'Part 3 — Discussion'));
        form.append('user_language', user?.feedback_language || user?.preferred_language || 'en');
        form.append('target_band', String(user?.target_band ?? 7.0));
        form.append('client_request_id', clientRequestIdRef.current);
        if (setId) form.append('set_id', setId);

        // One contiguous question_q{i}/audio_q{i}/duration_q{i} triple per answer.
        let idx = 0;
        partAnswers.forEach((a) => {
          const blob = blobFor(a.question_id);
          if (!blob) return; // skip any answer without captured audio
          idx += 1;
          form.append(`question_q${idx}`, a.question || '');
          form.append(`audio_q${idx}`, blob, `qb-part${part}-q${idx}-${Date.now()}.webm`);
          form.append(`duration_q${idx}`, String(a.duration || 0));
        });

        // Leave-safe async submit: the server enqueues a durable job, grades it
        // independent of this connection, and we poll for the result. Closing
        // the tab no longer drops the test — the job still finishes server-side
        // (and emails the result), and "My results" lists it.
        const res = await fetch(`${API_URL}/api/speaking-practice/evaluate-structured-async`, {
          method: 'POST',
          body: form,
        });
        setSubmitStep('evaluating');

        if (!res.ok) {
          let detail;
          try { detail = await res.json(); } catch (_) { detail = await res.text(); }
          const code = (typeof detail === 'object' && detail?.detail?.code) || '';
          const rawError = (typeof detail === 'object' && (detail?.detail?.message || detail?.detail)) || (typeof detail === 'string' ? detail : `HTTP ${res.status}`);
          const combined = `${code} ${rawError}`;
          const isNoMatch = /NoMatch|no\s*match|no_speech|no\s*speech/i.test(combined);
          const isTooShort = /audio_too_short|audio_too_small|too\s*short|too_short|min_seconds|min_bytes/i.test(combined);
          let message;
          if (code === 'quota_exhausted') {
            message = rawError || 'You\'ve used all evaluations for this period.';
          } else if (isTooShort) {
            message = "One of your recordings was shorter than the minimum. Re-record speaking in full sentences for at least 10–15 seconds, then submit again.";
          } else if (isNoMatch) {
            message = "We couldn't pick up clear speech from your microphone. Check the lock icon in the URL bar → Microphone = Allow, then re-record speaking in full sentences for 10–15 seconds.";
          } else {
            message = rawError;
          }
          setSubmitError(message);
          setSubmitStep('error');
          return;
        }

        const data = await res.json();
        // A cached replay (same client_request_id) returns already-completed.
        if (data.status === 'completed' && data.result) {
          finishStructured(data.result);
          return;
        }
        const jobId = data.job_id;
        if (!jobId) {
          setSubmitError('Could not start grading. Please try again.');
          setSubmitStep('error');
          return;
        }
        // Pin the job to the crash-saved record so a leave/return reconnects to
        // the same grade instead of re-uploading.
        attachJobToPending(jobId);
        const polled = await pollStructuredJob(jobId);
        if (polled.error) {
          setSubmitError(polled.error);
          setSubmitStep('error');
          return;
        }
        finishStructured(polled.result);
        return;
      }

      // ── Part 2 (cue card, single long-turn answer) — leave-safe async path ──
      // Same durable job queue as Part 1/3, just a single-blob 'cuecard' job.
      const combinedBlob = partBlobs.length === 1
        ? partBlobs[0]
        : new Blob(partBlobs, { type: 'audio/webm' });

      const cueCardPrompt = (resumeData ? resumeData.cueCard?.prompt : moduleContent?.part2?.cue_card?.topic) || 'Cue card monologue';
      const cueCardBullets = ((resumeData ? resumeData.cueCard?.bullets : moduleContent?.part2?.cue_card?.bullets) || []).join('\n');

      const totalDuration = partAnswers.reduce((s, a) => s + (a.duration || 0), 0);

      const form = new FormData();
      form.append('audio', combinedBlob, `qb-part${part}-${Date.now()}.webm`);
      form.append('user_id', user?.id || '');
      form.append('part', `part${part}`);
      form.append('cue_card_prompt', cueCardPrompt);
      form.append('cue_card_bullets', cueCardBullets);
      form.append('user_language', user?.feedback_language || 'en');
      form.append('target_band', String(user?.target_band ?? 7.0));
      form.append('duration_seconds', String(totalDuration || 0));
      form.append('topic', moduleContent?.title || cueCardPrompt);
      if (setId) form.append('set_id', setId);
      form.append('client_request_id', clientRequestIdRef.current);

      const res = await fetch(`${API_URL}/api/speaking-practice/evaluate-cuecard-async`, {
        method: 'POST',
        body: form,
      });
      setSubmitStep('evaluating');

      if (!res.ok) {
        let detail;
        try { detail = await res.json(); } catch (_) { detail = await res.text(); }
        const code = (typeof detail === 'object' && detail?.detail?.code) || '';
        const rawError = (typeof detail === 'object' && (detail?.detail?.message || detail?.detail)) || (typeof detail === 'string' ? detail : `HTTP ${res.status}`);
        const combined = `${code} ${rawError}`;
        const isNoMatch = /NoMatch|no\s*match|no_speech|no\s*speech/i.test(combined);
        const isTooShort = /audio_too_short|audio_too_small|too\s*short|too_short|min_seconds|min_bytes/i.test(combined);
        let message;
        if (code === 'quota_exhausted') {
          message = rawError || 'You\'ve used all evaluations for this period.';
        } else if (isTooShort) {
          message = "Your recording was shorter than the minimum. Re-record speaking in full sentences for at least 10–15 seconds, then submit again.";
        } else if (isNoMatch) {
          message = "We couldn't pick up clear speech from your microphone. Check the lock icon in the URL bar → Microphone = Allow, then re-record speaking in full sentences for 10–15 seconds.";
        } else {
          message = rawError;
        }
        setSubmitError(message);
        setSubmitStep('error');
        return;
      }

      const data = await res.json();
      if (data.status === 'completed' && data.result) {
        finishStructured(data.result);
        return;
      }
      const jobId = data.job_id;
      if (!jobId) {
        setSubmitError('Could not start grading. Please try again.');
        setSubmitStep('error');
        return;
      }
      attachJobToPending(jobId);
      const polled = await pollStructuredJob(jobId);
      if (polled.error) {
        setSubmitError(polled.error);
        setSubmitStep('error');
        return;
      }
      finishStructured(polled.result);
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError('Could not reach the evaluation server. Check your connection and try again.');
      setSubmitStep('error');
    }
  };

  return {
    pendingResume,
    submittingTier,
    submitStep,
    submitError,
    submitTest,
    resumePendingSubmission,
    dismissPendingResume,
    // Raw setters exposed so the page's overlay cancel handler can reset the
    // pipeline exactly the way the inline code used to.
    setSubmittingTier,
    setSubmitStep,
    setSubmitError,
  };
}
