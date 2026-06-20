import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mic, Clock, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import StructuredResultsLayout from '../features/speaking/components/StructuredResultsLayout';
import { ResultsState as SpeakingResultsState, adaptSpeakingResult } from '../features/speaking';
import '../features/speaking/speaking.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PART_LABEL = { part1: 'Part 1', part2: 'Part 2', part3: 'Part 3' };

// History of the user's speaking evaluations — including ones that finished
// server-side AFTER they left the page (durable job queue, v2). Each row links
// to the full feedback. "processing" rows auto-refresh until graded.
export default function MyResults({ user }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [attempts, setAttempts] = useState(null); // null = loading
  const [openJob, setOpenJob] = useState(null);     // { id, result } | null
  const [openLoading, setOpenLoading] = useState(false);

  const fetchAttempts = useCallback(async () => {
    if (!user?.id) return [];
    try {
      const r = await fetch(`${API_URL}/api/speaking-practice/attempts?user_id=${encodeURIComponent(user.id)}`);
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data.attempts) ? data.attempts : [];
    } catch (_) {
      return [];
    }
  }, [user]);

  const openResult = useCallback(async (jobId) => {
    setOpenLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/speaking-practice/jobs/${jobId}`);
      if (r.ok) {
        const j = await r.json();
        if (j.status === 'completed' && j.result) setOpenJob({ id: jobId, result: j.result });
      }
    } catch (_) { /* ignore */ }
    setOpenLoading(false);
  }, []);

  // Initial load + auto-open a job from the email deep link (?job=...).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchAttempts();
      if (cancelled) return;
      setAttempts(list);
      const deep = params.get('job');
      if (deep && list.some((a) => a.job_id === deep && a.status === 'completed')) {
        openResult(deep);
      }
    })();
    return () => { cancelled = true; };
  }, [fetchAttempts, openResult, params]);

  // Poll while anything is still grading.
  useEffect(() => {
    if (!attempts || !attempts.some((a) => a.status === 'queued' || a.status === 'processing')) return undefined;
    const id = setInterval(async () => {
      const list = await fetchAttempts();
      setAttempts(list);
    }, 5000);
    return () => clearInterval(id);
  }, [attempts, fetchAttempts]);

  // ── Detail view ──
  if (openJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => setOpenJob(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> All results
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {Array.isArray(openJob.result?.questions) && openJob.result.questions.length > 0 ? (
            <div className="speaking-scope">
              <StructuredResultsLayout
                feedback={openJob.result}
                onPracticeAnother={() => navigate('/question-bank/speaking')}
                onTryAgain={() => navigate('/question-bank/speaking')}
              />
            </div>
          ) : (() => {
            // Part 2 (cue-card) result — the unified SpeakingEvaluationResult shape.
            const adapted = adaptSpeakingResult(openJob.result, {
              durationSeconds: openJob.result?.metrics?.total_duration,
            });
            return adapted ? (
              <div className="speaking-scope rounded-2xl overflow-hidden border border-indigo-100 shadow-sm">
                <SpeakingResultsState data={adapted} onContinue={() => navigate('/question-bank/speaking')} />
              </div>
            ) : (
              <Card className="p-6 text-sm text-gray-600">This result can’t be displayed here yet.</Card>
            );
          })()}
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Mic className="w-5 h-5 text-emerald-600" /> My speaking results
            </h1>
            <p className="text-xs text-gray-500">Every evaluation — including ones graded after you left.</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {attempts === null && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {attempts && attempts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-600 mb-4">No speaking results yet.</p>
            <Button onClick={() => navigate('/question-bank/speaking')} className="bg-emerald-600 hover:bg-emerald-700">
              Start a speaking practice
            </Button>
          </Card>
        )}

        {attempts && attempts.map((a) => {
          const done = a.status === 'completed';
          const failed = a.status === 'failed';
          const pending = a.status === 'queued' || a.status === 'processing';
          return (
            <Card
              key={a.job_id}
              className={`p-4 flex items-center gap-4 ${done ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              onClick={done ? () => openResult(a.job_id) : undefined}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-emerald-50' : failed ? 'bg-rose-50' : 'bg-amber-50'}`}>
                {done ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                  : failed ? <AlertCircle className="w-5 h-5 text-rose-500" />
                  : <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-100 text-indigo-700 text-xs">{PART_LABEL[a.part] || 'Speaking'}</Badge>
                  {pending && <span className="text-xs text-amber-600 font-medium">Grading…</span>}
                  {failed && <span className="text-xs text-rose-600 font-medium">Failed</span>}
                </div>
                <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{a.topic || 'Speaking practice'}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" /> {formatWhen(a.created_at)}
                </p>
              </div>
              {done && (
                <div className="flex items-center gap-2 shrink-0">
                  {a.overall_band != null && (
                    <span className="text-2xl font-bold text-emerald-700">{Number(a.overall_band).toFixed(1)}</span>
                  )}
                  {openLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-300" />}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}
