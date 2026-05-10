import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, Play, Pause, Award, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

function resolveAudioSrc(audioUrl) {
  if (!audioUrl) return null;
  if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
  return `${API_BASE}${audioUrl}`;
}

function fmtMMSS(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function bandTone(band) {
  if (band >= 7) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (band >= 6) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (band >= 5) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-rose-100 text-rose-700 border-rose-200';
}

function MiniAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);

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

  if (!src) return null;
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause(); else a.play();
  };

  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
      <button
        type="button"
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-sm"
        aria-label={playing ? 'Pause' : 'Play recording'}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
          <span>{fmtMMSS(current)}</span>
          <span>{fmtMMSS(total)}</span>
        </div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
}

const CRITERIA = [
  { key: 'fc', label: 'Fluency & Coherence' },
  { key: 'lr', label: 'Lexical Resource' },
  { key: 'gra', label: 'Grammar' },
  { key: 'pr', label: 'Pronunciation' },
];

function CriterionCard({ label, detail }) {
  if (!detail) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-slate-800 text-sm">{label}</h4>
        <span className={`px-2.5 py-1 rounded-lg text-sm font-bold border ${bandTone(detail.band)}`}>
          {detail.band?.toFixed?.(1) ?? detail.band}
        </span>
      </div>
      {detail.explanation && (
        <p className="text-xs text-slate-600 leading-relaxed mb-2">{detail.explanation}</p>
      )}
      {detail.strengths?.length > 0 && (
        <div className="mb-1.5">
          <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide mb-0.5">Strengths</div>
          <ul className="space-y-0.5">
            {detail.strengths.map((s, i) => (
              <li key={i} className="text-xs text-slate-700 flex gap-1.5"><span className="text-emerald-500">•</span>{s}</li>
            ))}
          </ul>
        </div>
      )}
      {detail.weaknesses?.length > 0 && (
        <div>
          <div className="text-[11px] font-medium text-amber-700 uppercase tracking-wide mb-0.5">Weaknesses</div>
          <ul className="space-y-0.5">
            {detail.weaknesses.map((s, i) => (
              <li key={i} className="text-xs text-slate-700 flex gap-1.5"><span className="text-amber-500">•</span>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * StructuredResultsLayout — Cathoven-style per-question switcher.
 *
 * Renders the response shape returned by
 * POST /api/speaking-practice/evaluate-structured:
 *   { scores, criteria, liz_note, questions: [...], aggregate_fluency, ... }
 *
 * Tab switcher at the top picks 1..N for per-question audio + transcript +
 * indicative band + observation. Below the tabs, an overall band card and the
 * 4-criterion breakdown.
 */
export default function StructuredResultsLayout({ feedback, onPracticeAnother, onTryAgain }) {
  const questions = useMemo(() => feedback?.questions || [], [feedback]);
  const [activeQ, setActiveQ] = useState(0);
  const scores = feedback?.scores || {};
  const criteria = feedback?.criteria || {};

  if (!feedback) return null;
  const q = questions[activeQ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Overall band hero */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 mb-6 shadow-xl shadow-emerald-200/40">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-100">Estimated band</div>
                <div className="text-3xl font-bold">
                  {scores.overall?.toFixed?.(1) ?? scores.overall ?? '—'}
                </div>
                {scores.target ? (
                  <div className="text-xs text-emerald-100 mt-0.5">Target: {scores.target}</div>
                ) : null}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center">
              {CRITERIA.map(({ key, label }) => (
                <div key={key} className="px-3 py-2 rounded-xl bg-white/15 backdrop-blur min-w-[64px]">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-100">{label.split(' ')[0]}</div>
                  <div className="text-lg font-bold">
                    {scores[key]?.toFixed?.(1) ?? scores[key] ?? '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-question switcher tabs */}
        {questions.length > 1 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveQ(i)}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeQ === i
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                }`}
              >
                Q{i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Active question card */}
        {q && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  Question {q.index ?? activeQ + 1}
                </div>
                <p className="text-slate-800 font-medium leading-snug">{q.question}</p>
              </div>
              {Number.isFinite(q.indicative_band) && (
                <span className={`px-3 py-1 rounded-lg text-sm font-bold border whitespace-nowrap ${bandTone(q.indicative_band)}`}>
                  Band {q.indicative_band.toFixed(1)}
                </span>
              )}
            </div>

            <div className="mb-3">
              <MiniAudioPlayer src={resolveAudioSrc(q.audio_url)} />
            </div>

            {q.transcript && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-3">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Your response</div>
                <p className="text-sm text-slate-700 leading-relaxed">{q.transcript}</p>
              </div>
            )}

            {q.observation && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 mb-3">
                <div className="text-[11px] uppercase tracking-wider text-emerald-700 mb-1">Observation</div>
                <p className="text-sm text-slate-700 leading-relaxed">{q.observation}</p>
              </div>
            )}

            {q.fluency && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[
                  ['WPM', q.fluency.wpm],
                  ['Words', q.fluency.words],
                  ['Pauses', q.fluency.pauses],
                  ['Fillers', q.fluency.fillers],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                    <div className="text-sm font-semibold text-slate-800 truncate">{v ?? '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Criteria breakdown */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {CRITERIA.map(({ key, label }) => (
            <CriterionCard key={key} label={label} detail={criteria[key]} />
          ))}
        </div>

        {/* Liz coach note */}
        {feedback.liz_note && (
          <div className="rounded-2xl bg-violet-50 border border-violet-200 p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-violet-600" />
              <h3 className="font-semibold text-violet-800 text-sm">Coach note from Liz</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{feedback.liz_note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {onPracticeAnother && (
            <button
              type="button"
              onClick={onPracticeAnother}
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Practice another
            </button>
          )}
          {onTryAgain && (
            <button
              type="button"
              onClick={onTryAgain}
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-200"
            >
              <Mic className="w-4 h-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
