import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Award, Mic, RotateCcw, CheckCircle } from 'lucide-react';

/**
 * Full-screen overlay shown during /api/speaking/submit.
 *
 * Why this exists: clicking Basic/Premium used to dismiss the tier modal and
 * leave the user on the (now-stale) Part 3 last-question screen until the
 * fetch resolved 30–60s later. Premium adds Azure word-level pronunciation
 * + Sonnet on top of base scoring, so timing can stretch toward a minute on
 * cold starts. Without an overlay, users assumed the click was lost and
 * navigated away before the result arrived.
 *
 * The overlay narrates progress (preparing → uploading → evaluating) so the
 * wait feels intentional, and surfaces errors inline with a Retry button so
 * users don't lose their answers — audioBlobsRef is preserved on error.
 */
export default function SubmittingOverlay({ tier, step, error, onRetry, onCancel }) {
  const isError = step === 'error';
  const isPremium = tier === 'premium';

  // Live elapsed counter — a moving number reassures the user the grade is
  // actually progressing during the otherwise-silent 30–60s wait.
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (isError) return undefined;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isError]);

  const stepCopy = {
    preparing: {
      title: 'Preparing your audio',
      detail: 'Encoding your responses for Azure pronunciation analysis…',
    },
    uploading: {
      title: 'Uploading to Liz',
      detail: 'Sending your answers to the evaluator…',
    },
    evaluating: {
      title: isPremium ? 'Liz is evaluating your speaking' : 'Liz is reviewing your answers',
      detail: isPremium
        ? 'Azure word-level pronunciation + Sonnet IELTS examiner. Usually 30–60 seconds.'
        : 'Sonnet IELTS examiner is scoring four criteria. Usually 15–25 seconds.',
    },
  };

  const copy = stepCopy[step] || stepCopy.evaluating;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <Card className="w-full max-w-md p-8 bg-white text-center">
        {isError ? (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <span className="text-3xl" role="img" aria-label="error">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <p className="text-xs text-gray-400 mb-6">
              Your recordings are safe — you can retry without re-recording.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Choose tier again
              </Button>
              <Button onClick={onRetry} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                <RotateCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Pulsing avatar — Liz "thinking". Two stacked rings for a soft
                radial glow rather than the harsh Loader2 spin we use in the
                rest of the app; the wait is long enough that a calmer
                animation feels less alarming. */}
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className={`absolute inset-0 rounded-full ${isPremium ? 'bg-purple-200' : 'bg-emerald-200'} animate-ping opacity-60`} />
              <div className={`absolute inset-2 rounded-full ${isPremium ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'} flex items-center justify-center`}>
                {isPremium ? (
                  <Award className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">{copy.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{copy.detail}</p>
            <p className="text-xs font-mono text-gray-400 mb-5">
              {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} elapsed · usually {isPremium ? '30–60s' : '15–25s'}
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <StepDot active={step === 'preparing'} done={step === 'uploading' || step === 'evaluating'} />
              {isPremium && (
                <>
                  <StepLine done={step === 'uploading' || step === 'evaluating'} />
                  <StepDot active={step === 'uploading'} done={step === 'evaluating'} />
                </>
              )}
              <StepLine done={step === 'evaluating'} />
              <StepDot active={step === 'evaluating'} done={false} />
            </div>

            <p className="text-xs text-gray-500">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline -mt-0.5 mr-1" />
              Your answers are saved on this device. If you need to leave, come back
              and tap <b>Get my result</b> — nothing is lost.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

function StepDot({ active, done }) {
  if (done) {
    return (
      <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
        <CheckCircle className="w-3 h-3 text-white" strokeWidth={3} />
      </span>
    );
  }
  if (active) {
    return <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />;
  }
  return <span className="w-3 h-3 rounded-full bg-gray-200" />;
}

function StepLine({ done }) {
  return <span className={`h-0.5 w-8 ${done ? 'bg-emerald-500' : 'bg-gray-200'}`} />;
}
