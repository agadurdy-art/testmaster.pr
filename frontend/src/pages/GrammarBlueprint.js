import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Layers,
  Loader2,
  Sparkles,
  Target,
  Wrench,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const MODULE_ACCENTS = {
  1: {
    tint: 'from-emerald-50 to-emerald-100',
    ring: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    icon: <Wrench className="w-5 h-5 text-emerald-700" />,
  },
  2: {
    tint: 'from-sky-50 to-sky-100',
    ring: 'border-sky-200',
    badge: 'bg-sky-100 text-sky-800',
    icon: <Layers className="w-5 h-5 text-sky-700" />,
  },
  3: {
    tint: 'from-violet-50 to-violet-100',
    ring: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800',
    icon: <Sparkles className="w-5 h-5 text-violet-700" />,
  },
  0: {
    tint: 'from-amber-50 to-amber-100',
    ring: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    icon: <AlertTriangle className="w-5 h-5 text-amber-700" />,
  },
};

const MODE_LABEL = {
  error_detection: 'Find the Error',
  gap_fill: 'Fill the Gap',
  mcq: 'Multiple Choice',
  sentence_transformation: 'Sentence Transformation',
  band8_ranking: 'Which is Band 8?',
};

// ---------------------------------------------------------------------------
// Landing \u2014 3-module overview + topic grid
// ---------------------------------------------------------------------------

export default function GrammarBlueprint() {
  const { slug } = useParams();

  if (slug) {
    return <TopicView slug={slug} />;
  }
  return <LandingView />;
}

function LandingView() {
  const navigate = useNavigate();
  const [meta, setMeta] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [modulesRes, topicsRes] = await Promise.all([
          fetch(`${API_URL}/api/grammar-blueprint/modules`),
          fetch(`${API_URL}/api/grammar-blueprint/topics`),
        ]);
        if (!modulesRes.ok || !topicsRes.ok) {
          throw new Error('Unable to load Grammar Blueprint content.');
        }
        const metaJson = await modulesRes.json();
        const topicsJson = await topicsRes.json();
        if (!cancelled) {
          setMeta(metaJson);
          setTopics(topicsJson.topics || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Grammar Blueprint unavailable</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const topicsByModule = topics.reduce((acc, topic) => {
    const m = topic.module || 0;
    if (!acc[m]) acc[m] = [];
    acc[m].push(topic);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Band 4 \u2192 Band 9 Roadmap
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold text-slate-900">
            {meta?.course_title || 'The IELTS 8 Grammar Blueprint'}
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            {meta?.course_subtitle}
          </p>
          {meta?.pedagogical_note && (
            <p className="text-sm text-slate-500 mt-3 max-w-3xl italic border-l-2 border-slate-200 pl-3">
              {meta.pedagogical_note}
            </p>
          )}
        </div>

        {/* Three modules */}
        <div className="space-y-10">
          {(meta?.modules || []).map((mod) => {
            const accent = MODULE_ACCENTS[mod.number] || MODULE_ACCENTS[1];
            const moduleTopics = topicsByModule[mod.number] || [];
            return (
              <section key={mod.id}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {accent.icon}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge}`}>
                        Module {mod.number} \u2014 {mod.band_target}
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif font-semibold text-slate-900">{mod.title}</h2>
                    <p className="text-sm text-slate-600 max-w-2xl mt-1">{mod.focus}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {moduleTopics.map((topic) => (
                    <button
                      key={topic.slug}
                      onClick={() => navigate(`/grammar/${topic.slug}`)}
                      className={`group text-left p-4 bg-gradient-to-br ${accent.tint} border ${accent.ring} rounded-2xl hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{topic.title}</h3>
                          <p className="text-xs text-slate-600 mt-1">{topic.subtitle}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors mt-1" />
                      </div>
                      <div className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">
                        {topic.target_band}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Cross-cutting Common Errors */}
          {meta?.cross_cutting && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Cross-cutting reference
                </span>
              </div>
              <button
                onClick={() => navigate(`/grammar/${meta.cross_cutting.slug}`)}
                className="group w-full text-left p-5 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{meta.cross_cutting.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{meta.cross_cutting.note}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-amber-700 group-hover:translate-x-0.5 transition-transform mt-1" />
                </div>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Topic detail + practice runner
// ---------------------------------------------------------------------------

function TopicView({ slug }) {
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePractice, setActivePractice] = useState(null); // mode string

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/grammar-blueprint/topics/${slug}`);
        if (!res.ok) throw new Error('Topic not found');
        const data = await res.json();
        if (!cancelled) setTopic(data);
      } catch (err) {
        if (!cancelled) setError(err.message || String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }
  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Topic unavailable</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/grammar')}>Back to Grammar Blueprint</Button>
        </div>
      </div>
    );
  }

  const accent = MODULE_ACCENTS[topic.module] || MODULE_ACCENTS[1];

  if (activePractice) {
    const block = (topic.practice || []).find((b) => b.mode === activePractice);
    if (block) {
      return (
        <PracticeRunner
          slug={topic.slug}
          block={block}
          onExit={() => setActivePractice(null)}
          topicTitle={topic.title}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/grammar')}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Grammar Blueprint
        </button>

        <div className={`mb-8 p-5 rounded-2xl bg-gradient-to-br ${accent.tint} border ${accent.ring}`}>
          <div className="flex items-center gap-2 mb-2">
            {accent.icon}
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accent.badge}`}>
              Target: {topic.target_band}
            </span>
          </div>
          <h1 className="text-3xl font-serif font-semibold text-slate-900">{topic.title}</h1>
          <p className="text-sm text-slate-600 mt-1">{topic.subtitle}</p>
        </div>

        {/* Intro */}
        <Section title="Why this matters">
          <p className="text-slate-700 leading-relaxed">{topic.intro}</p>
        </Section>

        {/* Rules */}
        <Section title="Core rules">
          <div className="space-y-3">
            {(topic.rules || []).map((rule, i) => (
              <div key={i} className="p-4 bg-white rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">{rule.heading}</div>
                <div className="text-sm text-slate-700 leading-relaxed">{rule.body}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Examples */}
        <Section title="IELTS-contextual examples">
          <div className="space-y-2">
            {(topic.examples || []).map((ex, i) => (
              <div key={i} className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                  {ex.context}
                </div>
                <div className="text-slate-900 italic">\u201c{ex.sentence}\u201d</div>
                {ex.note && (
                  <div className="text-xs text-slate-500 mt-1">{ex.note}</div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Band 8 marker */}
        {topic.band8_marker && (
          <Section title="The Band 8 Marker" tint="violet">
            <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl text-slate-800 leading-relaxed text-sm">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-violet-700" />
                <span className="font-semibold text-violet-900">What examiners notice</span>
              </div>
              {topic.band8_marker}
            </div>
          </Section>
        )}

        {/* Common Errors */}
        {topic.common_errors && topic.common_errors.length > 0 && (
          <Section title="Bug Report \u2014 errors to eliminate" tint="amber">
            <div className="space-y-2">
              {topic.common_errors.map((err, i) => (
                <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-slate-900">{err.error}</div>
                      <div className="text-emerald-800 mt-1 flex items-start gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{err.fix}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Practice */}
        {topic.practice && topic.practice.length > 0 && (
          <Section title="Practice">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topic.practice.map((block) => (
                <button
                  key={block.mode}
                  onClick={() => setActivePractice(block.mode)}
                  className="p-4 bg-white border border-slate-200 rounded-xl text-left hover:shadow-md transition-shadow group"
                >
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                    {MODE_LABEL[block.mode] || block.mode}
                  </div>
                  <div className="font-semibold text-slate-900">{block.title}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {(block.items || []).length} items
                  </div>
                  <div className="mt-3 inline-flex items-center text-sm text-emerald-700 font-medium">
                    Start practice <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children, tint }) {
  return (
    <section className="mb-8">
      <h2 className={`text-xs uppercase tracking-wide font-semibold mb-3 ${
        tint === 'violet' ? 'text-violet-800' : tint === 'amber' ? 'text-amber-800' : 'text-slate-600'
      }`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Practice runner (stateless, one block at a time)
// ---------------------------------------------------------------------------

function PracticeRunner({ slug, block, onExit, topicTitle }) {
  const items = block.items || [];
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const mode = block.mode;

  const setAnswer = (index, value) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        mode,
        answers: Object.entries(answers).map(([index, value]) => ({
          index: Number(index),
          value,
        })),
      };
      const res = await fetch(
        `${API_URL}/api/grammar-blueprint/topics/${slug}/practice/score`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error('Scoring failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert(err.message || 'Could not submit practice.');
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = items.every(
    (_, idx) => answers[idx] !== undefined && answers[idx] !== null && answers[idx] !== '',
  );

  const resultByIndex = useMemo(() => {
    if (!result) return {};
    return (result.items || []).reduce((acc, r) => {
      acc[r.index] = r;
      return acc;
    }, {});
  }, [result]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {topicTitle}
        </button>

        <div className="mb-6">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
            {MODE_LABEL[mode] || mode}
          </div>
          <h1 className="text-2xl font-serif font-semibold text-slate-900">{block.title}</h1>
          {block.instruction && (
            <p className="text-sm text-slate-600 mt-2">{block.instruction}</p>
          )}
        </div>

        {result && (
          <div className={`mb-6 p-4 rounded-xl border ${
            result.score_pct >= 80
              ? 'bg-emerald-50 border-emerald-200'
              : result.score_pct >= 50
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {result.score_pct >= 80 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              ) : (
                <BookOpen className="w-5 h-5 text-amber-700" />
              )}
              <span className="font-semibold text-slate-900">
                Score: {result.correct} / {result.total} ({result.score_pct}%)
              </span>
            </div>
            <p className="text-sm text-slate-700">
              {result.score_pct >= 80
                ? 'Excellent accuracy. Review any red items and move on.'
                : result.score_pct >= 50
                ? 'Solid start. Review explanations, then re-attempt.'
                : 'Focus on the rules section \u2014 then retry this block.'}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {items.map((item, idx) => (
            <ItemCard
              key={idx}
              item={item}
              index={idx}
              mode={mode}
              value={answers[idx]}
              onChange={(v) => setAnswer(idx, v)}
              scored={resultByIndex[idx]}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center">
          <Button variant="ghost" onClick={onExit}>Exit</Button>
          {result ? (
            <Button onClick={() => { setAnswers({}); setResult(null); }}>
              Retry
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!allAnswered || submitting}>
              {submitting ? 'Scoring\u2026' : 'Submit answers'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual item renderer \u2014 switches UI based on mode.
function ItemCard({ item, index, mode, value, onChange, scored }) {
  const border = scored
    ? scored.correct
      ? 'border-emerald-300 bg-emerald-50/40'
      : 'border-red-300 bg-red-50/40'
    : 'border-slate-200 bg-white';

  return (
    <Card className={`p-4 rounded-xl border ${border}`}>
      <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
        Item {index + 1}
      </div>

      {(mode === 'mcq' || mode === 'band8_ranking') && (
        <>
          <div className="text-slate-900 mb-3">{item.prompt}</div>
          <div className="space-y-2">
            {(item.options || []).map((opt, i) => (
              <button
                key={i}
                disabled={Boolean(scored)}
                onClick={() => onChange(i)}
                className={`w-full text-left p-2 rounded-lg border text-sm transition-colors ${
                  value === i
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {mode === 'error_detection' && (
        <>
          <div className="text-slate-900 mb-3" dangerouslySetInnerHTML={{
            __html: renderErrorPrompt(item.prompt),
          }} />
          <div className="flex flex-wrap gap-2">
            {['A', 'B', 'C', 'D', 'NONE'].map((label) => {
              const isVisible = label === 'NONE' || item.prompt.includes(`[${label}:`);
              if (!isVisible) return null;
              return (
                <button
                  key={label}
                  disabled={Boolean(scored)}
                  onClick={() => onChange(label === 'NONE' ? 'NONE' : label)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    value === (label === 'NONE' ? 'NONE' : label)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {label === 'NONE' ? 'No error' : label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {(mode === 'gap_fill' || mode === 'sentence_transformation') && (
        <>
          <div className="text-slate-900 mb-3">{item.prompt}</div>
          <input
            type="text"
            disabled={Boolean(scored)}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer\u2026"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 focus:outline-none text-sm"
          />
        </>
      )}

      {scored && (
        <div className="mt-3 text-sm">
          {scored.correct ? (
            <div className="flex items-start gap-2 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{scored.explanation || 'Correct.'}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-start gap-2 text-red-800">
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Expected: <strong>{formatExpected(scored.expected, mode)}</strong>
                </span>
              </div>
              {scored.explanation && (
                <div className="text-slate-700 ml-6">{scored.explanation}</div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Convert "[A:text] rest [B:text]" into HTML with styled markers.
function renderErrorPrompt(prompt) {
  if (!prompt) return '';
  return String(prompt).replace(/\[([ABCD]):([^\]]+)\]/g, (_, letter, text) => {
    return `<span class="inline-block px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 mx-0.5"><span class="font-bold text-emerald-700 mr-1">${letter}</span>${escapeHtml(text.trim())}</span>`;
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatExpected(expected, mode) {
  if (expected === null || expected === undefined) return 'No error';
  if (mode === 'mcq' || mode === 'band8_ranking') {
    return `Option ${String.fromCharCode(65 + Number(expected))}`;
  }
  return String(expected);
}
