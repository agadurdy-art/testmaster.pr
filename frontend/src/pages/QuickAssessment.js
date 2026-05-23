import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Clock,
  ArrowRight,
  Sparkles,
  Trophy,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

/**
 * QuickAssessment — 15-18 min adaptive IELTS onboarding test.
 *
 * Spec: project_quick_assessment_spec (memory). Zero-LLM, zero-marginal
 * cost. 3 stages: Anchor (2R+2L) → Lock (2R+2L calibrated) → Productive
 * (1 writing 100w + 2-3 speaking 45s).
 *
 * Persists a UUID in localStorage so a guest can survive a reload and
 * have their result attached to their user on signup.
 */

const SESSION_KEY = 'quick_assessment_session_id';

// ── Visual tokens (kept inline to avoid scope leakage into v2 chrome) ──
const COLORS = {
  reading: '#2563eb',
  listening: '#7c3aed',
  writing: '#ea580c',
  speaking: '#16a34a',
  surfaceCard: '#ffffff',
  hairline: 'rgba(15, 23, 42, 0.08)',
  fg: '#0f172a',
  muted: '#64748b',
  primary: '#7c3aed',
};

export default function QuickAssessment({ user }) {
  const navigate = useNavigate();

  const [phase, setPhase] = useState('intro'); // intro|stage1|stage2|writing|speaking|finalising|results
  const [sessionId, setSessionId] = useState(null);

  // Intro
  const [examDate, setExamDate] = useState('');
  const [targetBand, setTargetBand] = useState('');

  // Stage 1 + 2 content
  const [stage1Passage, setStage1Passage] = useState(null);
  const [stage1Clip, setStage1Clip] = useState(null);
  const [stage1Answers, setStage1Answers] = useState({});
  const [stage1Partial, setStage1Partial] = useState(null);

  const [stage2Passage, setStage2Passage] = useState(null);
  const [stage2Clip, setStage2Clip] = useState(null);
  const [stage2Answers, setStage2Answers] = useState({});
  const [stage2Partial, setStage2Partial] = useState(null);

  // Productive
  const [writingPrompt, setWritingPrompt] = useState(null);
  const [writingText, setWritingText] = useState('');
  const [writingStartTs, setWritingStartTs] = useState(null);
  const [writingBand, setWritingBand] = useState(null);

  const [speakingPrompts, setSpeakingPrompts] = useState([]);
  const [currentSpeakingIdx, setCurrentSpeakingIdx] = useState(0);
  const [speakingBands, setSpeakingBands] = useState([]);

  // Results
  const [finalResult, setFinalResult] = useState(null);

  // ── Intro: start session ────────────────────────────────────────────
  async function startTest() {
    try {
      const res = await fetch(`${API_URL}/api/quick-assessment/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam_date: examDate || null,
          target_band: targetBand ? parseFloat(targetBand) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to start');
      setSessionId(data.session_id);
      try { localStorage.setItem(SESSION_KEY, data.session_id); } catch {}
      setStage1Passage(data.passage);
      setStage1Clip(data.clip);
      setPhase('stage1');
    } catch (e) {
      toast.error(`Could not start: ${e.message}`);
    }
  }

  // ── Stage 1 submit → Stage 2 content ────────────────────────────────
  async function submitStage1() {
    try {
      const res = await fetch(`${API_URL}/api/quick-assessment/stage1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          reading_answers: extractReadingAnswers(stage1Passage, stage1Answers),
          listening_answers: extractListeningAnswers(stage1Clip, stage1Answers),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Stage 1 failed');
      setStage1Partial(data.partial);
      setStage2Passage(data.passage);
      setStage2Clip(data.clip);
      setPhase('stage2');
    } catch (e) {
      toast.error(`Stage 1 error: ${e.message}`);
    }
  }

  // ── Stage 2 submit → Productive prompts ─────────────────────────────
  async function submitStage2() {
    try {
      const res = await fetch(`${API_URL}/api/quick-assessment/stage2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          reading_answers: extractReadingAnswers(stage2Passage, stage2Answers),
          listening_answers: extractListeningAnswers(stage2Clip, stage2Answers),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Stage 2 failed');
      setStage2Partial(data.partial);
      setWritingPrompt(data.writing_prompt);
      setSpeakingPrompts(data.speaking_prompts);
      setPhase('writing');
      setWritingStartTs(Date.now());
    } catch (e) {
      toast.error(`Stage 2 error: ${e.message}`);
    }
  }

  // ── Writing submit → first speaking prompt ──────────────────────────
  async function submitWriting() {
    try {
      const elapsed = (Date.now() - (writingStartTs || Date.now())) / 1000;
      const res = await fetch(`${API_URL}/api/quick-assessment/writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          prompt_id: writingPrompt.id,
          text: writingText,
          elapsed_sec: elapsed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Writing eval failed');
      setWritingBand(data.band);
      setPhase('speaking');
    } catch (e) {
      toast.error(`Writing error: ${e.message}`);
    }
  }

  // ── Speaking: one prompt at a time, Web Speech API → server ─────────
  async function submitSpeaking(transcript, durationSec) {
    try {
      const prompt = speakingPrompts[currentSpeakingIdx];
      const res = await fetch(`${API_URL}/api/quick-assessment/speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          prompt_id: prompt.id,
          transcript,
          duration_sec: durationSec,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Speaking eval failed');
      setSpeakingBands((prev) => [...prev, data.band]);

      if (currentSpeakingIdx + 1 < speakingPrompts.length) {
        setCurrentSpeakingIdx((i) => i + 1);
      } else {
        await finaliseTest();
      }
    } catch (e) {
      toast.error(`Speaking error: ${e.message}`);
    }
  }

  // ── Finalise → results ──────────────────────────────────────────────
  async function finaliseTest() {
    setPhase('finalising');
    try {
      const res = await fetch(`${API_URL}/api/quick-assessment/finalise`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Finalisation failed');
      setFinalResult(data);
      setPhase('results');
    } catch (e) {
      toast.error(`Finalisation error: ${e.message}`);
      setPhase('writing'); // fall back so the user can retry
    }
  }

  // ── Render ──────────────────────────────────────────────────────────

  if (phase === 'intro') {
    return (
      <IntroScreen
        examDate={examDate}
        setExamDate={setExamDate}
        targetBand={targetBand}
        setTargetBand={setTargetBand}
        onStart={startTest}
      />
    );
  }

  if (phase === 'stage1') {
    return (
      <StageScreen
        stageNumber={1}
        stageLabel="Stage 1 — Anchor"
        passage={stage1Passage}
        clip={stage1Clip}
        answers={stage1Answers}
        setAnswers={setStage1Answers}
        onSubmit={submitStage1}
        timerSec={5 * 60}
      />
    );
  }

  if (phase === 'stage2') {
    return (
      <StageScreen
        stageNumber={2}
        stageLabel="Stage 2 — Lock"
        passage={stage2Passage}
        clip={stage2Clip}
        answers={stage2Answers}
        setAnswers={setStage2Answers}
        partial={stage1Partial}
        onSubmit={submitStage2}
        timerSec={5 * 60}
      />
    );
  }

  if (phase === 'writing') {
    return (
      <WritingScreen
        prompt={writingPrompt}
        text={writingText}
        setText={setWritingText}
        onSubmit={submitWriting}
        partial={stage2Partial}
        timerSec={300}
      />
    );
  }

  if (phase === 'speaking') {
    const prompt = speakingPrompts[currentSpeakingIdx];
    return (
      <SpeakingScreen
        prompt={prompt}
        idx={currentSpeakingIdx}
        total={speakingPrompts.length}
        onSubmit={submitSpeaking}
      />
    );
  }

  if (phase === 'finalising') {
    return <FinalisingScreen />;
  }

  if (phase === 'results') {
    return (
      <ResultsScreen
        result={finalResult}
        user={user}
        onLogin={() => navigate('/login')}
        onSignup={() => navigate(`/signup?from=quick-assessment&session=${sessionId}`)}
        onDashboard={() => navigate('/dashboard')}
      />
    );
  }

  return null;
}

// Helpers to split combined answers state into reading + listening dicts.
function extractReadingAnswers(passage, answers) {
  if (!passage) return {};
  const out = {};
  for (const q of passage.questions || []) {
    if (answers[q.qid] !== undefined) out[q.qid] = answers[q.qid];
  }
  return out;
}
function extractListeningAnswers(clip, answers) {
  if (!clip) return {};
  const out = {};
  for (const q of clip.questions || []) {
    if (answers[q.qid] !== undefined) out[q.qid] = answers[q.qid];
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────
// Screen components
// ────────────────────────────────────────────────────────────────────────

function Shell({ children, eyebrow, title, subtitle, headerRight }) {
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <div className="max-w-[960px] mx-auto px-6 md:px-10 py-10">
        <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {eyebrow && (
              <div className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: COLORS.primary }}>
                {eyebrow}
              </div>
            )}
            <h1 className="font-display text-3xl md:text-4xl mt-1" style={{ color: COLORS.fg }}>
              {title}
            </h1>
            {subtitle && <p className="text-sm mt-1.5" style={{ color: COLORS.muted }}>{subtitle}</p>}
          </div>
          {headerRight}
        </header>
        {children}
      </div>
    </div>
  );
}

function Card({ children, className = '', style = {} }) {
  return (
    <section
      className={`rounded-2xl border ${className}`}
      style={{
        borderColor: COLORS.hairline,
        background: COLORS.surfaceCard,
        boxShadow: '0 1px 0 rgba(15,23,42,0.02)',
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function Timer({ totalSec, onExpire }) {
  const [remaining, setRemaining] = useState(totalSec);
  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onExpire]);
  const min = Math.floor(remaining / 60);
  const sec = (remaining % 60).toString().padStart(2, '0');
  const danger = remaining <= 30;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-mono"
      style={{ color: danger ? '#dc2626' : COLORS.fg }}
    >
      <Clock className="w-3.5 h-3.5" />
      {min}:{sec}
    </span>
  );
}

// ── Intro ──────────────────────────────────────────────────────────────

function IntroScreen({ examDate, setExamDate, targetBand, setTargetBand, onStart }) {
  return (
    <Shell
      eyebrow="Quick IELTS Assessment"
      title="15 minutes to your estimated band."
      subtitle="Reading + Listening + Writing + Speaking. Adaptive — the test calibrates to your level after the first four questions."
    >
      <Card className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
              Exam date (optional)
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: COLORS.hairline }}
            />
            <p className="text-xs mt-1.5" style={{ color: COLORS.muted }}>
              Used to personalise your milestone plan.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: COLORS.muted }}>
              Target band (optional)
            </label>
            <input
              type="number"
              min="4"
              max="9"
              step="0.5"
              placeholder="e.g. 6.5"
              value={targetBand}
              onChange={(e) => setTargetBand(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: COLORS.hairline }}
            />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { icon: <BookOpen className="w-4 h-4" />, label: 'Reading', tag: '~5 min', color: COLORS.reading },
            { icon: <Headphones className="w-4 h-4" />, label: 'Listening', tag: '~5 min', color: COLORS.listening },
            { icon: <PenTool className="w-4 h-4" />, label: 'Writing', tag: '~5 min', color: COLORS.writing },
            { icon: <Mic className="w-4 h-4" />, label: 'Speaking', tag: '~3 min', color: COLORS.speaking },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-xl border p-3 flex flex-col gap-1.5"
              style={{ borderColor: COLORS.hairline }}
            >
              <span style={{ color: row.color }}>{row.icon}</span>
              <div className="text-xs uppercase tracking-wider" style={{ color: COLORS.muted }}>{row.tag}</div>
              <div className="font-display text-base" style={{ color: COLORS.fg }}>{row.label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
          style={{ background: COLORS.primary }}
        >
          Start the test
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-xs mt-3" style={{ color: COLORS.muted }}>
          You can pause between sections. Results are saved automatically.
        </p>
      </Card>
    </Shell>
  );
}

// ── Stage 1 + 2 (reading + listening) ──────────────────────────────────

function StageScreen({ stageNumber, stageLabel, passage, clip, answers, setAnswers, partial, onSubmit, timerSec }) {
  const allQuestions = useMemo(() => {
    const r = (passage?.questions || []).map((q) => ({ ...q, _section: 'reading' }));
    const l = (clip?.questions || []).map((q) => ({ ...q, _section: 'listening' }));
    return [...r, ...l];
  }, [passage, clip]);

  const answeredCount = allQuestions.filter((q) => answers[q.qid] !== undefined && answers[q.qid] !== '').length;
  const canSubmit = answeredCount === allQuestions.length;

  return (
    <Shell
      eyebrow={stageLabel}
      title={stageNumber === 1 ? 'Anchor your level.' : 'Lock your band.'}
      subtitle="One short passage. One short audio clip. Answer all questions to continue."
      headerRight={<Timer totalSec={timerSec} onExpire={canSubmit ? onSubmit : undefined} />}
    >
      {partial && (
        <PartialBanner label="Stage 1 result" partial={partial} />
      )}

      {passage && (
        <Card className="p-6 md:p-8 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4" style={{ color: COLORS.reading }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.reading }}>
              Reading · {passage.level}
            </span>
          </div>
          <h2 className="font-display text-xl mb-4" style={{ color: COLORS.fg }}>{passage.title}</h2>
          <article className="prose prose-sm max-w-none mb-6" style={{ color: COLORS.fg, whiteSpace: 'pre-line' }}>
            {passage.body}
          </article>
          {passage.questions.map((q, i) => (
            <QuestionBlock
              key={q.qid}
              idx={i + 1}
              question={q}
              answer={answers[q.qid]}
              onAnswer={(val) => setAnswers((a) => ({ ...a, [q.qid]: val }))}
            />
          ))}
        </Card>
      )}

      {clip && (
        <Card className="p-6 md:p-8 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Headphones className="w-4 h-4" style={{ color: COLORS.listening }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.listening }}>
              Listening · {clip.section.replace('section', 'Section ')}
            </span>
          </div>
          {clip.audio_url ? (
            <audio controls src={clip.audio_url} className="w-full mb-6">
              Your browser does not support audio playback.
            </audio>
          ) : (
            <div
              className="mb-6 p-4 rounded-lg border text-sm flex items-start gap-2"
              style={{ borderColor: '#fcd34d', background: '#fffbeb' }}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#b45309' }} />
              <span style={{ color: '#78350f' }}>
                Audio not yet rendered. (Run gen_quick_assessment_audio.py to populate.)
              </span>
            </div>
          )}
          {clip.questions.map((q, i) => (
            <QuestionBlock
              key={q.qid}
              idx={i + 1}
              question={q}
              answer={answers[q.qid]}
              onAnswer={(val) => setAnswers((a) => ({ ...a, [q.qid]: val }))}
            />
          ))}
        </Card>
      )}

      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm" style={{ color: COLORS.muted }}>
          {answeredCount} of {allQuestions.length} answered
        </span>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-40"
          style={{ background: COLORS.primary }}
        >
          Submit {stageLabel.includes('1') ? 'Stage 1' : 'Stage 2'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </Shell>
  );
}

function PartialBanner({ label, partial }) {
  return (
    <Card className="p-4 flex items-center gap-3" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
      <Sparkles className="w-5 h-5" style={{ color: COLORS.primary }} />
      <div className="flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.primary }}>
          {label}
        </div>
        <div className="text-sm mt-0.5" style={{ color: COLORS.fg }}>
          {partial.reading != null && <>Reading <b>{partial.reading.toFixed(1)}</b>{' · '}</>}
          {partial.listening != null && <>Listening <b>{partial.listening.toFixed(1)}</b></>}
          {partial.label && <span className="ml-2 text-xs" style={{ color: COLORS.muted }}>{partial.label}</span>}
        </div>
      </div>
    </Card>
  );
}

function QuestionBlock({ idx, question, answer, onAnswer }) {
  if (question.type === 'mcq') {
    return (
      <div className="mb-5">
        <div className="font-semibold text-sm mb-2.5" style={{ color: COLORS.fg }}>
          {idx}. {question.stem}
        </div>
        <div className="space-y-2">
          {question.options.map((opt) => {
            const selected = answer === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onAnswer(opt.key)}
                className="w-full text-left rounded-lg border px-3 py-2.5 text-sm transition-colors"
                style={{
                  borderColor: selected ? COLORS.primary : COLORS.hairline,
                  background: selected ? '#f5f3ff' : '#ffffff',
                }}
              >
                <span className="font-mono mr-2" style={{ color: COLORS.muted }}>{opt.key})</span>
                <span style={{ color: COLORS.fg }}>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  if (question.type === 'tfng') {
    return (
      <div className="mb-5">
        <div className="font-semibold text-sm mb-2.5" style={{ color: COLORS.fg }}>
          {idx}. {question.stem}
        </div>
        <div className="flex gap-2">
          {['TRUE', 'FALSE', 'NOT GIVEN'].map((v) => {
            const selected = answer === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onAnswer(v)}
                className="px-3 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wider"
                style={{
                  borderColor: selected ? COLORS.primary : COLORS.hairline,
                  background: selected ? '#f5f3ff' : '#ffffff',
                  color: selected ? COLORS.primary : COLORS.muted,
                }}
              >
                {v}
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  // fill
  return (
    <div className="mb-5">
      <div className="font-semibold text-sm mb-2.5" style={{ color: COLORS.fg }}>
        {idx}. {question.stem}
      </div>
      <input
        type="text"
        value={answer || ''}
        onChange={(e) => onAnswer(e.target.value)}
        placeholder="Your answer"
        className="w-full md:w-80 px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: COLORS.hairline }}
      />
    </div>
  );
}

// ── Writing ────────────────────────────────────────────────────────────

function WritingScreen({ prompt, text, setText, onSubmit, partial, timerSec }) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const min = prompt?.expected_words?.[0] ?? 60;
  const canSubmit = wordCount >= Math.floor(min * 0.5);

  return (
    <Shell
      eyebrow="Stage 3 — Writing"
      title="Write a short paragraph."
      subtitle="Heuristic scoring — word count, vocabulary, cohesion, accuracy. Aim for a complete answer."
      headerRight={<Timer totalSec={timerSec} onExpire={canSubmit ? onSubmit : undefined} />}
    >
      {partial && <PartialBanner label="Stage 1 + 2 result" partial={partial} />}

      <Card className="p-6 md:p-8 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="w-4 h-4" style={{ color: COLORS.writing }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.writing }}>
            Writing · {prompt?.level}
          </span>
        </div>
        <p className="text-sm mb-6 whitespace-pre-line" style={{ color: COLORS.fg }}>
          {prompt?.stem}
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full px-3 py-3 rounded-lg border text-sm leading-relaxed"
          style={{ borderColor: COLORS.hairline, fontFamily: 'inherit' }}
          placeholder="Start typing your response..."
        />
        <div className="mt-2 flex items-center justify-between text-sm" style={{ color: COLORS.muted }}>
          <span>{wordCount} word{wordCount === 1 ? '' : 's'} · target {prompt?.expected_words?.[0]}-{prompt?.expected_words?.[1]}</span>
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-40"
            style={{ background: COLORS.primary }}
          >
            Submit writing
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </Shell>
  );
}

// ── Speaking (Web Speech API) ──────────────────────────────────────────

function SpeakingScreen({ prompt, idx, total, onSubmit }) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startedRef = useRef(null);
  const recognitionRef = useRef(null);
  const tickRef = useRef(null);

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Your browser does not support speech recognition. Use Chrome or Edge.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let accum = '';
    recognition.onresult = (event) => {
      let interimStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) accum += t + ' ';
        else interimStr += t;
      }
      setTranscript(accum.trim());
      setInterim(interimStr);
    };
    recognition.onerror = (e) => console.warn('Speech recognition error', e);
    recognition.start();
    recognitionRef.current = recognition;

    startedRef.current = Date.now();
    setRecording(true);
    tickRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedRef.current) / 1000));
    }, 250);
  }

  function stopAndSubmit() {
    try { recognitionRef.current?.stop(); } catch {}
    try { clearInterval(tickRef.current); } catch {}
    setRecording(false);
    const duration = startedRef.current ? (Date.now() - startedRef.current) / 1000 : 0;
    const finalTranscript = transcript || interim || '(no speech detected)';
    onSubmit(finalTranscript, duration);
    // reset for next prompt
    setTranscript('');
    setInterim('');
    setElapsed(0);
    startedRef.current = null;
  }

  return (
    <Shell
      eyebrow={`Stage 3 — Speaking ${idx + 1} of ${total}`}
      title={prompt?.part === 'part2' ? 'Describe — Part 2 style.' : 'Speak — Part 1 style.'}
      subtitle="Click the microphone, speak for the suggested duration, then submit. Web Speech recognises English directly in your browser."
    >
      <Card className="p-6 md:p-8 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-4 h-4" style={{ color: COLORS.speaking }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.speaking }}>
            Speaking · {prompt?.part}
          </span>
        </div>
        <p className="text-sm mb-6 whitespace-pre-line" style={{ color: COLORS.fg }}>
          {prompt?.stem}
        </p>

        <div className="rounded-xl border p-5 flex items-start gap-4" style={{ borderColor: COLORS.hairline, background: '#f8fafc' }}>
          <button
            onClick={recording ? stopAndSubmit : startRecording}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: recording ? '#dc2626' : COLORS.speaking }}
          >
            <Mic className="w-6 h-6" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold" style={{ color: COLORS.fg }}>
              {recording ? 'Recording…' : 'Tap to start recording'}
            </div>
            <div className="text-xs mt-1" style={{ color: COLORS.muted }}>
              Target {prompt?.duration_sec}s · Elapsed {elapsed}s
            </div>
            {(transcript || interim) && (
              <div className="mt-3 text-sm p-3 rounded bg-white border" style={{ borderColor: COLORS.hairline, color: COLORS.fg }}>
                {transcript} <span style={{ color: COLORS.muted }}>{interim}</span>
              </div>
            )}
          </div>
        </div>

        {recording && (
          <button
            onClick={stopAndSubmit}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white"
            style={{ background: COLORS.primary }}
          >
            Stop & submit
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </Card>
    </Shell>
  );
}

// ── Finalising ─────────────────────────────────────────────────────────

function FinalisingScreen() {
  return (
    <Shell
      eyebrow="Calculating"
      title="Building your estimated band…"
      subtitle="Heuristic scoring with Cambridge benchmark comparison. A few seconds."
    >
      <Card className="p-10 text-center">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#ddd6fe', borderTopColor: COLORS.primary }}
        />
        <p className="text-sm mt-4" style={{ color: COLORS.muted }}>
          Cambridge tables · type-token ratio · cohesion density · WPM · filler ratio…
        </p>
      </Card>
    </Shell>
  );
}

// ── Results — WOW page ─────────────────────────────────────────────────

function ResultsScreen({ result, user, onLogin, onSignup, onDashboard }) {
  if (!result) {
    return <Shell title="Result missing"><Card className="p-8">Something went wrong. <button onClick={onDashboard} className="underline">Back</button></Card></Shell>;
  }
  const overall = result.overall || {};
  const skills = result.skills || {};
  const comparisons = result.comparisons || [];
  const milestones = result.milestones || [];
  const target = result.target_band;

  return (
    <Shell
      eyebrow="Your assessment is ready"
      title={`Estimated IELTS band: ${overall.band?.toFixed(1) || '—'}`}
      subtitle={overall.confidence_low != null
        ? `Confidence range ${overall.confidence_low.toFixed(1)} – ${overall.confidence_high.toFixed(1)} · 4-skill heuristic`
        : '4-skill heuristic estimate'}
    >
      {/* Hero band card */}
      <Card className="p-6 md:p-8" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f0f9ff 100%)', borderColor: '#ddd6fe' }}>
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 items-center">
          <div className="font-display text-7xl md:text-8xl" style={{ color: COLORS.primary }}>
            {overall.band?.toFixed(1) || '—'}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: COLORS.muted }}>
              Estimated band
            </div>
            <div className="text-sm mt-2" style={{ color: COLORS.fg }}>
              You're <b>{interpretBand(overall.band)}</b>.{' '}
              {target && overall.band != null && overall.band < target && (
                <>Your target band is {target.toFixed(1)} — a gap of <b>{(target - overall.band).toFixed(1)}</b>.</>
              )}
            </div>
          </div>
        </div>

        {/* Skill tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <SkillTile label="Reading" band={skills.reading} color={COLORS.reading} icon={<BookOpen className="w-4 h-4" />} />
          <SkillTile label="Listening" band={skills.listening} color={COLORS.listening} icon={<Headphones className="w-4 h-4" />} />
          <SkillTile label="Writing" band={skills.writing} color={COLORS.writing} icon={<PenTool className="w-4 h-4" />} />
          <SkillTile label="Speaking" band={skills.speaking} color={COLORS.speaking} icon={<Mic className="w-4 h-4" />} />
        </div>
      </Card>

      {/* Conversion wall — sticky for guests */}
      {!user && (
        <Card className="p-6 mt-6" style={{ borderColor: '#ddd6fe', background: '#faf5ff' }}>
          <div className="flex items-start gap-4 flex-wrap">
            <Trophy className="w-6 h-6 flex-shrink-0" style={{ color: COLORS.primary }} />
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg" style={{ color: COLORS.fg }}>
                Save this result + unlock your full 12-week plan
              </div>
              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Sign up free to track progress, get Liz feedback on your writing, and re-take the test in 2 weeks to see your gain.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={onSignup} className="px-4 py-2 rounded-lg font-semibold text-white" style={{ background: COLORS.primary }}>
                Start free
              </button>
              <button onClick={onLogin} className="px-4 py-2 rounded-lg font-semibold border" style={{ borderColor: COLORS.hairline, color: COLORS.fg }}>
                Log in
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Cambridge cohort comparisons */}
      {comparisons.length > 0 && (
        <Card className="p-6 mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.primary }}>
            How you compare
          </div>
          <div className="space-y-3">
            {comparisons.map((c, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <ComparisonBadge verdict={c.verdict} />
                <div className="flex-1">
                  <div className="font-semibold" style={{ color: COLORS.fg }}>{c.label}</div>
                  <div style={{ color: COLORS.muted }}>
                    Expected: {c.expected} · Yours: <b>{c.actual}</b>
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: COLORS.muted, fontStyle: 'italic' }}>{c.source}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <Card className="p-6 mt-6">
          <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: COLORS.primary }}>
            {result.target_band ? `Plan to reach band ${result.target_band.toFixed(1)}` : 'Suggested milestones'}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {milestones.map((m, i) => (
              <div key={i} className="rounded-xl border p-4" style={{ borderColor: COLORS.hairline }}>
                <div className="text-xs uppercase tracking-wider" style={{ color: COLORS.muted }}>{m.label}</div>
                <div className="text-sm font-mono mt-0.5" style={{ color: COLORS.muted }}>{m.date}</div>
                <div className="font-display text-2xl mt-2" style={{ color: COLORS.primary }}>
                  Band {m.target_band?.toFixed(1)}
                </div>
                {m.is_exam_day && (
                  <div className="text-xs font-semibold mt-1" style={{ color: '#dc2626' }}>Exam day</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {(result.writing_strengths?.length > 0 || result.speaking_strengths?.length > 0) && (
          <Card className="p-6" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5" style={{ color: '#16a34a' }} />
              <div className="font-display text-base" style={{ color: '#166534' }}>What's working</div>
            </div>
            <ul className="space-y-1.5 text-sm" style={{ color: '#166534' }}>
              {[...result.writing_strengths, ...result.speaking_strengths].map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </Card>
        )}
        {(result.writing_weaknesses?.length > 0 || result.speaking_weaknesses?.length > 0) && (
          <Card className="p-6" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" style={{ color: '#ea580c' }} />
              <div className="font-display text-base" style={{ color: '#9a3412' }}>What's costing you points</div>
            </div>
            <ul className="space-y-1.5 text-sm" style={{ color: '#9a3412' }}>
              {[...result.writing_weaknesses, ...result.speaking_weaknesses].map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      {user && (
        <div className="mt-8">
          <button onClick={onDashboard} className="px-6 py-3 rounded-lg font-semibold text-white" style={{ background: COLORS.primary }}>
            Continue to dashboard
            <ArrowRight className="w-4 h-4 inline ml-2" />
          </button>
        </div>
      )}
    </Shell>
  );
}

function SkillTile({ label, band, color, icon }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: COLORS.hairline, background: '#ffffff' }}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color }}>
        {icon}
        {label}
      </div>
      <div className="font-display text-3xl mt-2" style={{ color: COLORS.fg }}>
        {band != null ? band.toFixed(1) : '—'}
      </div>
    </div>
  );
}

function ComparisonBadge({ verdict }) {
  const map = {
    above: { color: '#16a34a', bg: '#f0fdf4', icon: '↑' },
    on:    { color: '#0ea5e9', bg: '#ecfeff', icon: '=' },
    below: { color: '#ea580c', bg: '#fff7ed', icon: '↓' },
  };
  const s = map[verdict] || map.on;
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0"
      style={{ background: s.bg, color: s.color }}
    >
      {s.icon}
    </span>
  );
}

function interpretBand(band) {
  if (band == null) return 'estimated';
  if (band >= 7.5) return 'in the Advanced range';
  if (band >= 6.5) return 'Upper-Intermediate, close to test-ready';
  if (band >= 5.5) return 'Mid-Intermediate, growing fast';
  if (band >= 4.5) return 'Foundation — building blocks in place';
  return 'at the Beginner end — every step here pays off';
}
