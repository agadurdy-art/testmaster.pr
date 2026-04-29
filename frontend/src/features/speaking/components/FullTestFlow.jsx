/**
 * FullTestFlow
 * ------------
 * Orchestrates a single 3-part IELTS Speaking session that threads one theme
 * through Part 1, Part 2 and Part 3, then submits all three recordings to
 * /api/speaking/evaluate-fulltest for a single holistic Sonnet pass.
 *
 * Flow (internal `phase` state):
 *   theme        — pick / confirm a theme bucket (Part 2 cue cards drawn here)
 *   part1-live   — Liz Live; agent gets theme as cue_card_topic + Part 1 brief
 *                  bullets, parallel mic recorder produces user-only WAV
 *   part2-prep   — 60 s preparation timer with the theme-bound cue card
 *   part2-rec    — 2 min monologue, MediaRecorder via useSpeakingFlow
 *   part3-live   — Liz Live; agent gets the Part 2 cue card prompt as
 *                  `part2_theme` + the cue-card transcript so the discussion
 *                  connects back to what the candidate said
 *   submitting   — ProcessingState while /evaluate-fulltest runs
 *   results      — ResultsState (fulltest adapter handles 3-part shape)
 *   error        — ErrorState (premium lock, network, etc.)
 *
 * Why a dedicated component instead of folding into useSpeakingFlow:
 *   the per-part flow assumes one part per session. Full Test needs a
 *   different state machine — Liz Live for parts 1/3, monologue for part 2,
 *   and a final POST that ships three audios + cards together. Keeping the
 *   orchestration here means useSpeakingFlow stays focused on single-part.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import SpeakingHeader from './SpeakingHeader';
import PreparationState from './PreparationState';
import RecordingState from './RecordingState';
import ProcessingState from './ProcessingState';
import ResultsState from './ResultsState';
import ErrorState from './ErrorState';
import VoiceOverlay from '../../liz/components/VoiceOverlay';

import useElevenLabsLiz from '../../liz/hooks/useElevenLabsLiz';
import { useSpeakingFlow } from '../hooks/useSpeakingFlow';
import { pickRandomCueCard } from '../lib/pickCueCard';
import {
  SPEAKING_THEMES,
  pickRandomTheme,
  part1BulletsForTheme,
  topicLabelForTheme,
} from '../lib/themes';

const API_BASE = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || '';

const PART2_PREP_SECS = 60;
const PART2_RECORD_SECS = 120;

// Theme picker — Aga can either let the system pick a random theme or choose
// from the 6 buckets explicitly. Tema değiştirilince Part 2 cue card yeniden
// çekilir.
function ThemePicker({ onConfirm, onExit }) {
  const [picked, setPicked] = useState(null);

  const start = (theme) => {
    onConfirm(theme);
  };

  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span
          className="sp-font-mono"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 26, height: 26, borderRadius: 9999,
            border: '1.5px solid var(--sp-foreground)', fontWeight: 700, fontSize: 12,
          }}
        >
          1
        </span>
        <span className="sp-mono-label">Full Test · Pick a theme</span>
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
        <h2
          className="sp-font-display"
          style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}
        >
          Choose a theme — it threads through all three parts.
        </h2>
        <p style={{ color: 'var(--sp-muted-fg)', marginTop: 8, maxWidth: 620 }}>
          Liz will keep Part 1, Part 2 and Part 3 on the same theme so your
          ideas build instead of resetting. You can also let her pick.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginTop: 28,
          }}
        >
          {SPEAKING_THEMES.map((theme) => {
            const selected = picked?.id === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setPicked(theme)}
                className={'sp-part-card' + (selected ? ' sp-part-card-selected' : '')}
                style={{ textAlign: 'left', cursor: 'pointer' }}
              >
                <div className="sp-mono-label" style={{ marginBottom: 6 }}>{theme.label}</div>
                <p style={{ fontSize: 14, color: 'var(--sp-muted-fg)', lineHeight: 1.45 }}>
                  {theme.description}
                </p>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="sp-btn-primary"
            onClick={() => start(picked || pickRandomTheme())}
            style={{ height: 48, padding: '0 24px' }}
          >
            {picked ? `Start Full Test · ${picked.label}` : 'Random theme & start'}
          </button>
          <button
            type="button"
            className="sp-btn-ghost"
            onClick={onExit}
            style={{ height: 48, padding: '0 18px' }}
          >
            Back
          </button>
        </div>
      </div>
    </section>
  );
}

// Inline upgrade panel for Free / Weekly users who clicked Full Test by
// mistake (the PartSelector lock should normally short-circuit before we
// reach Liz Live, but a 402 from the token endpoint can also land here).
function UpgradePanel({ message, onExit }) {
  return (
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 80px' }}>
      <div
        style={{
          background: 'var(--sp-card)',
          borderRadius: 'var(--sp-radius)',
          border: '1px solid var(--sp-border)',
          boxShadow: 'var(--sp-shadow-card)',
          padding: 48,
          textAlign: 'center',
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        <h2 className="sp-font-display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 12 }}>
          Full Test is a Premium feature
        </h2>
        <p style={{ color: 'var(--sp-muted-fg)', marginBottom: 24 }}>
          {message || 'Full Test runs on the Monthly and Exam Pack plans.'}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            className="sp-btn-primary"
            href="/pricing/v2"
            style={{ height: 44, padding: '0 22px', display: 'inline-flex', alignItems: 'center' }}
          >
            See plans
          </a>
          <button
            className="sp-btn-ghost"
            onClick={onExit}
            style={{ height: 44, padding: '0 18px' }}
          >
            Back
          </button>
        </div>
      </div>
    </section>
  );
}

async function submitFullTest({
  user,
  theme,
  cueCard,
  part1,
  part2,
  part3,
}) {
  const form = new FormData();
  form.append('user_id', user.id);
  form.append('user_language', user.feedback_language || 'en');
  form.append('target_band', String(user.target_band || 7.0));

  // Part 1 — Liz Live, user-only WAV
  form.append('part1_audio', part1.audioBlob, `liz-part1-${Date.now()}.wav`);
  form.append(
    'part1_cue_card_prompt',
    `IELTS Part 1 — familiar topics on the theme of ${theme.label}.`,
  );
  form.append(
    'part1_cue_card_bullets',
    (part1.transcript ? [part1.transcript] : part1BulletsForTheme(theme)).join('\n'),
  );
  form.append('part1_duration_seconds', String(part1.durationSecs || 0));

  // Part 2 — monologue, original cue card
  form.append('part2_audio', part2.audioBlob, `part2-${Date.now()}.webm`);
  form.append('part2_cue_card_prompt', cueCard.prompt);
  form.append('part2_cue_card_bullets', (cueCard.bullets || []).join('\n'));
  form.append('part2_duration_seconds', String(part2.durationSecs || 0));

  // Part 3 — Liz Live, user-only WAV, discussion grounded on the cue card
  form.append('part3_audio', part3.audioBlob, `liz-part3-${Date.now()}.wav`);
  form.append(
    'part3_cue_card_prompt',
    `IELTS Part 3 — abstract discussion connected to the Part 2 cue card "${cueCard.prompt}".`,
  );
  form.append(
    'part3_cue_card_bullets',
    (part3.transcript ? [part3.transcript] : []).join('\n'),
  );
  form.append('part3_duration_seconds', String(part3.durationSecs || 0));

  const resp = await fetch(`${API_BASE}/api/speaking/evaluate-fulltest`, {
    method: 'POST',
    body: form,
  });
  if (!resp.ok) {
    let detail;
    try { detail = await resp.json(); } catch (_e) { detail = await resp.text(); }
    const code = (typeof detail === 'object' && detail?.detail?.code) || null;
    const msg = typeof detail === 'string'
      ? detail
      : (detail?.detail?.message || detail?.detail || `HTTP ${resp.status}`);
    const err = new Error(msg);
    err.code = code;
    throw err;
  }
  return resp.json();
}

export default function FullTestFlow({ user, onExit }) {
  const liz = useElevenLabsLiz({ userId: user?.id });
  const flow = useSpeakingFlow({
    prepSeconds: PART2_PREP_SECS,
    recordSeconds: PART2_RECORD_SECS,
  });

  // theme | part1-live | part2-prep | part2-rec | part3-live | submitting | results | error | upgrade
  const [phase, setPhase] = useState('theme');
  const [theme, setTheme] = useState(null);
  const [cueCard, setCueCard] = useState(null);

  const [part1, setPart1] = useState(null);
  const [part2, setPart2] = useState(null);

  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);

  const part1CapturedRef = useRef(false);
  const part2CapturedRef = useRef(false);
  const part3CapturedRef = useRef(false);

  // Used to confirm theme + draw cue card + start Part 1 live session.
  const handleThemeConfirm = (chosenTheme) => {
    setTheme(chosenTheme);
    setCueCard(pickRandomCueCard({ theme: chosenTheme.id }));
    part1CapturedRef.current = false;
    part2CapturedRef.current = false;
    part3CapturedRef.current = false;
    setPhase('part1-live');
    liz.start({
      part: 'part1',
      cueCardTopic: topicLabelForTheme(chosenTheme),
      cueCardBullets: part1BulletsForTheme(chosenTheme),
    });
  };

  // Token mint surfaced fulltest_locked / liz_live_locked → upgrade screen.
  useEffect(() => {
    if (phase !== 'part1-live' && phase !== 'part3-live') return;
    if (!liz.isError) return;
    if (liz.errorCode === 'liz_live_locked' || liz.errorCode === 'fulltest_locked') {
      setPhase('upgrade');
    } else {
      setScoreError(liz.error || 'Could not start Liz.');
      setPhase('error');
    }
  }, [phase, liz.isError, liz.errorCode, liz.error]);

  // Part 1 Liz session ended → save audio + transcript, advance to Part 2 prep.
  useEffect(() => {
    if (phase !== 'part1-live' || !liz.isEnded || part1CapturedRef.current) return;
    part1CapturedRef.current = true;
    setPart1({
      audioBlob: liz.userAudioBlob,
      transcript: liz.userTranscript,
      durationSecs: liz.elapsedSeconds,
    });
    liz.reset();
    setPhase('part2-prep');
    flow.startPrep();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, liz.isEnded]);

  // Mirror flow.state → our phase for Part 2 (prep → rec). Once flow finishes
  // recording (state='processing' and audioReady), we save the blob and jump
  // to Part 3.
  useEffect(() => {
    if (phase !== 'part2-prep' && phase !== 'part2-rec') return;
    if (flow.state === 'recording' && phase !== 'part2-rec') {
      setPhase('part2-rec');
    }
  }, [phase, flow.state]);

  useEffect(() => {
    if (phase !== 'part2-rec') return;
    if (flow.state !== 'processing') return;
    if (!flow.audioReady || part2CapturedRef.current) return;
    part2CapturedRef.current = true;

    const recordedSecs = PART2_RECORD_SECS - (flow.recordRemaining ?? 0);
    setPart2({
      audioBlob: flow.audioBlob,
      durationSecs: Math.max(0, recordedSecs),
    });
    flow.reset();

    setPhase('part3-live');
    liz.start({
      part: 'part3',
      cueCardTopic: topicLabelForTheme(theme),
      cueCardBullets: part1BulletsForTheme(theme),
      part2Theme: cueCard?.prompt || theme?.label || '',
      // We don't have a transcript for the monologue (MediaRecorder doesn't
      // run STT); pass the cue card prompt as a coarse anchor so Part 3
      // discussion still connects to what the candidate just spoke about.
      part2Transcript: cueCard?.prompt || '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, flow.state, flow.audioReady]);

  // Part 3 ended → assemble all three parts and POST to /evaluate-fulltest.
  useEffect(() => {
    if (phase !== 'part3-live' || !liz.isEnded || part3CapturedRef.current) return;
    part3CapturedRef.current = true;

    const part3 = {
      audioBlob: liz.userAudioBlob,
      transcript: liz.userTranscript,
      durationSecs: liz.elapsedSeconds,
    };
    liz.reset();

    if (!part1?.audioBlob || !part2?.audioBlob || !part3.audioBlob) {
      setScoreError(
        'One of the three recordings did not capture audio. Please retry.',
      );
      setPhase('error');
      return;
    }

    setPhase('submitting');
    submitFullTest({ user, theme, cueCard, part1, part2, part3 })
      .then((data) => {
        setScoreResult(data);
        setPhase('results');
      })
      .catch((err) => {
        if (err?.code === 'fulltest_locked' || err?.code === 'liz_live_locked') {
          setPhase('upgrade');
        } else {
          setScoreError(err?.message || String(err));
          setPhase('error');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, liz.isEnded]);

  const handleClose = () => {
    try { liz.reset(); } catch (_e) {}
    try { flow.reset?.(); } catch (_e) {}
    onExit?.();
  };

  // Stage banner: tells the candidate which part of three they are on.
  const stageLabel = useMemo(() => {
    switch (phase) {
      case 'part1-live': return 'Stage 1 of 3 · Part 1 with Liz';
      case 'part2-prep': return 'Stage 2 of 3 · Part 2 preparation';
      case 'part2-rec':  return 'Stage 2 of 3 · Part 2 monologue';
      case 'part3-live': return 'Stage 3 of 3 · Part 3 with Liz';
      case 'submitting': return 'Final · Liz is reviewing your test';
      default: return '';
    }
  }, [phase]);

  if (phase === 'theme') {
    return (
      <>
        <SpeakingHeader />
        <ThemePicker onConfirm={handleThemeConfirm} onExit={handleClose} />
      </>
    );
  }

  if (phase === 'upgrade') {
    return (
      <>
        <SpeakingHeader />
        <UpgradePanel message={liz.error || scoreError} onExit={handleClose} />
      </>
    );
  }

  if (phase === 'submitting') {
    return (
      <>
        <SpeakingHeader />
        <ProcessingState audioBlob={part2?.audioBlob} />
      </>
    );
  }

  if (phase === 'results') {
    return (
      <>
        <SpeakingHeader />
        <ResultsState
          data={scoreResult}
          onRetryCard={handleClose}
          onNewCard={handleClose}
        />
      </>
    );
  }

  if (phase === 'error') {
    return (
      <>
        <SpeakingHeader />
        <ErrorState
          errorMessage={scoreError}
          onRetry={handleClose}
          onBack={handleClose}
        />
      </>
    );
  }

  if (phase === 'part1-live' || phase === 'part3-live') {
    return (
      <>
        <SpeakingHeader />
        <section style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 32px 0' }}>
          <span className="sp-mono-label">{stageLabel}</span>
        </section>
        <section style={{ maxWidth: 1320, margin: '0 auto', padding: '12px 32px 80px' }}>
          <div className="liz-scope">
            <VoiceOverlay liz={liz} onClose={async () => { await liz.stop(); }} />
          </div>
        </section>
      </>
    );
  }

  if (phase === 'part2-prep') {
    return (
      <>
        <SpeakingHeader />
        <section style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 32px 0' }}>
          <span className="sp-mono-label">{stageLabel}</span>
        </section>
        <PreparationState
          prepRemaining={flow.prepRemaining}
          prepTotal={PART2_PREP_SECS}
          onAddThirty={() => flow.addPrepTime(30)}
          onSkipPrep={flow.startRecording}
          onStartRecording={flow.startRecording}
          onExit={handleClose}
          onChangeCard={() => {
            // In Full Test theme is locked; redraw within the theme bucket.
            if (theme?.id) {
              setCueCard(pickRandomCueCard({ theme: theme.id, excludeId: cueCard?.id }));
              flow.startPrep();
            }
          }}
          cueCard={cueCard}
        />
      </>
    );
  }

  if (phase === 'part2-rec') {
    return (
      <>
        <SpeakingHeader />
        <section style={{ maxWidth: 1320, margin: '0 auto', padding: '24px 32px 0' }}>
          <span className="sp-mono-label">{stageLabel}</span>
        </section>
        <RecordingState
          recordRemaining={flow.recordRemaining}
          spokenWordCount={flow.spokenWordCount}
          onStopEarly={flow.startProcessing}
          cueCard={cueCard}
        />
      </>
    );
  }

  return null;
}
