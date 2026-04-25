import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import '../features/dashboard/dashboard.css';
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

// XHR-based JSON helpers — bypasses any fetch interceptor (Microsoft Clarity,
// browser extensions, stale service workers) that wraps window.fetch and
// double-reads the Response body. Symptom we saw on /grammar:
// "Failed to execute 'clone' on 'Response': Response body is already used".
function xhrGetJson(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send();
  });
}

function xhrPostJson(url, body) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(JSON.stringify(body));
  });
}

// Editorial accent system — every accent maps to one of the dashboard tokens
// (--primary, --sky, --liz, --gold) so the page reads as part of the same
// design language as the rebuilt dashboard. `inkColor` is the readable text
// shade, `surface` the soft pastel wash, `ring` the hairline border.
const MODULE_ACCENTS = {
  1: {
    inkColor: 'hsl(var(--primary-ink))',
    surface: 'linear-gradient(135deg, hsl(var(--primary) / .10) 0%, hsl(var(--primary) / .04) 100%)',
    ring: '1px solid hsl(var(--primary) / .28)',
    chip: { background: 'hsl(var(--primary) / .14)', color: 'hsl(var(--primary-ink))', border: '1px solid hsl(var(--primary) / .28)' },
    icon: <Wrench className="w-5 h-5" style={{ color: 'hsl(var(--primary-ink))' }} />,
  },
  2: {
    inkColor: 'hsl(199 60% 32%)',
    surface: 'linear-gradient(135deg, hsl(var(--sky) / .12) 0%, hsl(var(--sky) / .04) 100%)',
    ring: '1px solid hsl(var(--sky) / .32)',
    chip: { background: 'hsl(var(--sky) / .16)', color: 'hsl(199 60% 32%)', border: '1px solid hsl(var(--sky) / .32)' },
    icon: <Layers className="w-5 h-5" style={{ color: 'hsl(199 60% 32%)' }} />,
  },
  3: {
    inkColor: 'hsl(var(--liz-ink))',
    surface: 'linear-gradient(135deg, hsl(var(--liz) / .12) 0%, hsl(var(--liz) / .04) 100%)',
    ring: '1px solid hsl(var(--liz) / .30)',
    chip: { background: 'hsl(var(--liz) / .14)', color: 'hsl(var(--liz-ink))', border: '1px solid hsl(var(--liz) / .30)' },
    icon: <Sparkles className="w-5 h-5" style={{ color: 'hsl(var(--liz-ink))' }} />,
  },
  0: {
    inkColor: 'hsl(var(--gold-ink))',
    surface: 'linear-gradient(135deg, hsl(var(--gold) / .14) 0%, hsl(var(--gold) / .04) 100%)',
    ring: '1px solid hsl(var(--gold) / .36)',
    chip: { background: 'hsl(var(--gold) / .18)', color: 'hsl(var(--gold-ink))', border: '1px solid hsl(var(--gold) / .36)' },
    icon: <AlertTriangle className="w-5 h-5" style={{ color: 'hsl(var(--gold-ink))' }} />,
  },
};

// Hook: returns the `dashboard-scope theme-X` class so non-DashboardLayout
// pages still pick up the editorial tokens + theme reactivity.
function useScopeClass() {
  const { activeTheme } = useTheme();
  const themeClass =
    activeTheme === THEME_MODES.DARK
      ? 'theme-dark'
      : activeTheme === THEME_MODES.NIGHT_SHIFT
      ? 'theme-night'
      : '';
  return `dashboard-scope ${themeClass}`.trim();
}

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
  const scopeClass = useScopeClass();
  const [meta, setMeta] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [metaJson, topicsJson] = await Promise.all([
          xhrGetJson(`${API_URL}/api/grammar-blueprint/modules`),
          xhrGetJson(`${API_URL}/api/grammar-blueprint/topics`),
        ]);
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
      <div className={`${scopeClass} min-h-screen flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${scopeClass} min-h-screen flex items-center justify-center p-8 text-center`}>
        <div>
          <h2 className="display-m text-2xl mb-2">Grammar Blueprint unavailable</h2>
          <p className="text-muted mb-4">{error}</p>
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
  const cross = MODULE_ACCENTS[0];

  return (
    <div className={`${scopeClass} min-h-screen`}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm flex items-center gap-1 mb-6 transition-colors"
          style={{ color: 'hsl(var(--muted-fg))' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--fg))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'hsl(var(--muted-fg))'; }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
            style={MODULE_ACCENTS[1].chip}
          >
            <Sparkles className="w-3.5 h-3.5" /> Band 4 → Band 9 Roadmap
          </div>
          <h1 className="display-xxl text-[40px] md:text-[52px]">
            {meta?.course_title || 'The IELTS 8 Grammar Blueprint'}
          </h1>
          <p className="text-muted mt-2 max-w-2xl">
            {meta?.course_subtitle}
          </p>
          {meta?.pedagogical_note && (
            <p
              className="text-sm mt-3 max-w-3xl italic pl-3"
              style={{ color: 'hsl(var(--muted-fg))', borderLeft: '2px solid hsl(var(--rule))' }}
            >
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
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={accent.chip}
                      >
                        Module {mod.number} — {mod.band_target}
                      </span>
                    </div>
                    <h2 className="display-m text-[26px]">{mod.title}</h2>
                    <p className="text-sm text-muted max-w-2xl mt-1">{mod.focus}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {moduleTopics.map((topic) => (
                    <button
                      key={topic.slug}
                      onClick={() => navigate(`/grammar/${topic.slug}`)}
                      className="group text-left p-4 rounded-2xl transition-shadow hover:shadow-md"
                      style={{ background: accent.surface, border: accent.ring }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="display-m text-[16px]" style={{ color: 'hsl(var(--fg))' }}>{topic.title}</h3>
                          <p className="text-xs text-muted mt-1">{topic.subtitle}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 mt-1 transition-colors" style={{ color: accent.inkColor, opacity: 0.6 }} />
                      </div>
                      <div className="mt-3 eyebrow">
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
                <AlertTriangle className="w-5 h-5" style={{ color: cross.inkColor }} />
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={cross.chip}
                >
                  Cross-cutting reference
                </span>
              </div>
              <button
                onClick={() => navigate(`/grammar/${meta.cross_cutting.slug}`)}
                className="group w-full text-left p-5 rounded-2xl transition-shadow hover:shadow-md"
                style={{ background: cross.surface, border: cross.ring }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="display-m text-[18px]" style={{ color: 'hsl(var(--fg))' }}>{meta.cross_cutting.title}</h3>
                    <p className="text-sm text-muted mt-1">{meta.cross_cutting.note}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 mt-1 group-hover:translate-x-0.5 transition-transform" style={{ color: cross.inkColor }} />
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
  const scopeClass = useScopeClass();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePractice, setActivePractice] = useState(null); // mode string

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await xhrGetJson(`${API_URL}/api/grammar-blueprint/topics/${slug}`);
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
      <div className={`${scopeClass} min-h-screen flex items-center justify-center`}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
      </div>
    );
  }
  if (error || !topic) {
    return (
      <div className={`${scopeClass} min-h-screen flex items-center justify-center p-8 text-center`}>
        <div>
          <h2 className="display-m text-2xl mb-2">Topic unavailable</h2>
          <p className="text-muted mb-4">{error}</p>
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
    <div className={`${scopeClass} min-h-screen`}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/grammar')}
          className="text-sm flex items-center gap-1 mb-6 transition-colors"
          style={{ color: 'hsl(var(--muted-fg))' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--fg))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'hsl(var(--muted-fg))'; }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Grammar Blueprint
        </button>

        <div
          className="mb-8 p-5 rounded-2xl"
          style={{ background: accent.surface, border: accent.ring }}
        >
          <div className="flex items-center gap-2 mb-2">
            {accent.icon}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={accent.chip}>
              Target: {topic.target_band}
            </span>
          </div>
          <h1 className="display-xxl text-[32px] md:text-[40px]">{topic.title}</h1>
          <p className="text-sm text-muted mt-1">{topic.subtitle}</p>
        </div>

        {/* Intro */}
        <Section title="Why this matters">
          <p className="leading-relaxed" style={{ color: 'hsl(var(--fg) / .85)' }}>{topic.intro}</p>
        </Section>

        {/* Rules */}
        <Section title="Core rules">
          <div className="space-y-3">
            {(topic.rules || []).map((rule, i) => (
              <div
                key={i}
                className="p-4 rounded-xl"
                style={{ background: 'hsl(var(--surface) / .85)', border: '1px solid hsl(var(--rule))' }}
              >
                <div className="font-semibold mb-1" style={{ color: 'hsl(var(--fg))' }}>{rule.heading}</div>
                <div className="text-sm leading-relaxed" style={{ color: 'hsl(var(--fg) / .8)' }}>{rule.body}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Examples */}
        <Section title="IELTS-contextual examples">
          <div className="space-y-2">
            {(topic.examples || []).map((ex, i) => (
              <div
                key={i}
                className="p-3 rounded-xl"
                style={{ background: 'hsl(var(--surface) / .85)', border: '1px solid hsl(var(--rule))' }}
              >
                <div className="eyebrow mb-1">{ex.context}</div>
                <div className="italic" style={{ color: 'hsl(var(--fg))' }}>“{ex.sentence}”</div>
                {ex.note && (
                  <div className="text-xs text-muted mt-1">{ex.note}</div>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* Band 8 marker */}
        {topic.band8_marker && (
          <Section title="The Band 8 Marker" tint="liz">
            <div
              className="p-4 rounded-xl leading-relaxed text-sm"
              style={{
                background: 'hsl(var(--liz-bg))',
                border: '1px solid hsl(var(--liz) / .30)',
                color: 'hsl(var(--liz-ink))',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: 'hsl(var(--liz-ink))' }} />
                <span className="font-semibold" style={{ color: 'hsl(var(--liz-ink))' }}>What examiners notice</span>
              </div>
              {topic.band8_marker}
            </div>
          </Section>
        )}

        {/* Common Errors */}
        {topic.common_errors && topic.common_errors.length > 0 && (
          <Section title="Bug Report \u2014 errors to eliminate" tint="gold">
            <div className="space-y-2">
              {topic.common_errors.map((err, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl text-sm"
                  style={{ background: 'hsl(var(--gold) / .08)', border: '1px solid hsl(var(--gold) / .36)' }}
                >
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--destruct))' }} />
                    <div>
                      <div style={{ color: 'hsl(var(--fg))' }}>{err.error}</div>
                      <div className="mt-1 flex items-start gap-1" style={{ color: 'hsl(var(--primary-ink))' }}>
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
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
                  className="p-4 rounded-xl text-left transition-shadow hover:shadow-md group"
                  style={{ background: 'hsl(var(--surface) / .9)', border: '1px solid hsl(var(--rule))' }}
                >
                  <div className="eyebrow mb-1">
                    {MODE_LABEL[block.mode] || block.mode}
                  </div>
                  <div className="display-m text-[16px]" style={{ color: 'hsl(var(--fg))' }}>{block.title}</div>
                  <div className="text-xs text-muted mt-1">
                    {(block.items || []).length} items
                  </div>
                  <div className="mt-3 inline-flex items-center text-sm font-medium" style={{ color: 'hsl(var(--primary-ink))' }}>
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
  const tintColor =
    tint === 'liz' ? 'hsl(var(--liz-ink))'
    : tint === 'gold' ? 'hsl(var(--gold-ink))'
    : 'hsl(var(--muted-fg))';
  return (
    <section className="mb-8">
      <h2
        className="text-xs uppercase tracking-wide font-semibold mb-3"
        style={{ color: tintColor, letterSpacing: '0.14em' }}
      >
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
  const scopeClass = useScopeClass();
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
      const data = await xhrPostJson(
        `${API_URL}/api/grammar-blueprint/topics/${slug}/practice/score`,
        payload,
      );
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

  // Score banner uses semantic feedback colors (emerald/gold/destruct) but
  // pulled from tokens so dark/night themes stay coherent.
  const scoreStyle = !result ? null
    : result.score_pct >= 80
      ? { background: 'hsl(var(--primary) / .10)', border: '1px solid hsl(var(--primary) / .30)' }
      : result.score_pct >= 50
      ? { background: 'hsl(var(--gold) / .10)', border: '1px solid hsl(var(--gold) / .36)' }
      : { background: 'hsl(var(--destruct) / .08)', border: '1px solid hsl(var(--destruct) / .30)' };

  return (
    <div className={`${scopeClass} min-h-screen`}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={onExit}
          className="text-sm flex items-center gap-1 mb-6 transition-colors"
          style={{ color: 'hsl(var(--muted-fg))' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'hsl(var(--fg))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'hsl(var(--muted-fg))'; }}
        >
          <ArrowLeft className="w-4 h-4" /> Back to {topicTitle}
        </button>

        <div className="mb-6">
          <div className="eyebrow mb-1">
            {MODE_LABEL[mode] || mode}
          </div>
          <h1 className="display-xxl text-[28px] md:text-[32px]">{block.title}</h1>
          {block.instruction && (
            <p className="text-sm text-muted mt-2">{block.instruction}</p>
          )}
        </div>

        {result && (
          <div className="mb-6 p-4 rounded-xl" style={scoreStyle}>
            <div className="flex items-center gap-2 mb-1">
              {result.score_pct >= 80 ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
              ) : (
                <BookOpen className="w-5 h-5" style={{ color: 'hsl(var(--gold-ink))' }} />
              )}
              <span className="font-semibold" style={{ color: 'hsl(var(--fg))' }}>
                Score: {result.correct} / {result.total} ({result.score_pct}%)
              </span>
            </div>
            <p className="text-sm" style={{ color: 'hsl(var(--fg) / .8)' }}>
              {result.score_pct >= 80
                ? 'Excellent accuracy. Review any red items and move on.'
                : result.score_pct >= 50
                ? 'Solid start. Review explanations, then re-attempt.'
                : 'Focus on the rules section — then retry this block.'}
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
              {submitting ? 'Scoring…' : 'Submit answers'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Individual item renderer — switches UI based on mode.
function ItemCard({ item, index, mode, value, onChange, scored }) {
  const cardStyle = scored
    ? scored.correct
      ? { background: 'hsl(var(--primary) / .07)', border: '1px solid hsl(var(--primary) / .30)' }
      : { background: 'hsl(var(--destruct) / .06)', border: '1px solid hsl(var(--destruct) / .30)' }
    : { background: 'hsl(var(--surface) / .92)', border: '1px solid hsl(var(--rule))' };

  const optionDefault = { border: '1px solid hsl(var(--rule))', background: 'transparent', color: 'hsl(var(--fg))' };
  const optionSelected = { border: '1px solid hsl(var(--primary) / .55)', background: 'hsl(var(--primary) / .10)', color: 'hsl(var(--primary-ink))' };

  return (
    <Card className="p-4 rounded-xl" style={cardStyle}>
      <div className="eyebrow mb-1">Item {index + 1}</div>

      {(mode === 'mcq' || mode === 'band8_ranking') && (
        <>
          <div className="mb-3" style={{ color: 'hsl(var(--fg))' }}>{item.prompt}</div>
          <div className="space-y-2">
            {(item.options || []).map((opt, i) => (
              <button
                key={i}
                disabled={Boolean(scored)}
                onClick={() => onChange(i)}
                className="w-full text-left p-2 rounded-lg text-sm transition-colors"
                style={value === i ? optionSelected : optionDefault}
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            ))}
          </div>
        </>
      )}

      {mode === 'error_detection' && (
        <>
          <div className="mb-3" style={{ color: 'hsl(var(--fg))' }} dangerouslySetInnerHTML={{
            __html: renderErrorPrompt(item.prompt),
          }} />
          <div className="flex flex-wrap gap-2">
            {['A', 'B', 'C', 'D', 'NONE'].map((label) => {
              const isVisible = label === 'NONE' || item.prompt.includes(`[${label}:`);
              if (!isVisible) return null;
              const selected = value === (label === 'NONE' ? 'NONE' : label);
              return (
                <button
                  key={label}
                  disabled={Boolean(scored)}
                  onClick={() => onChange(label === 'NONE' ? 'NONE' : label)}
                  className="px-3 py-1.5 rounded-full text-sm transition-colors"
                  style={selected ? optionSelected : optionDefault}
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
          <div className="mb-3" style={{ color: 'hsl(var(--fg))' }}>{item.prompt}</div>
          <input
            type="text"
            disabled={Boolean(scored)}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type your answer…"
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--rule))',
              color: 'hsl(var(--fg))',
            }}
          />
        </>
      )}

      {scored && (
        <div className="mt-3 text-sm">
          {scored.correct ? (
            <div className="flex items-start gap-2" style={{ color: 'hsl(var(--primary-ink))' }}>
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
              <span>{scored.explanation || 'Correct.'}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-start gap-2" style={{ color: 'hsl(var(--destruct))' }}>
                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Expected: <strong>{formatExpected(scored.expected, mode)}</strong>
                </span>
              </div>
              {scored.explanation && (
                <div className="ml-6" style={{ color: 'hsl(var(--fg) / .8)' }}>{scored.explanation}</div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Convert "[A:text] rest [B:text]" into HTML with token-styled markers so the
// inline letter chips read correctly in light/dark/night themes.
function renderErrorPrompt(prompt) {
  if (!prompt) return '';
  const chipStyle = "display:inline-block;padding:2px 6px;border-radius:4px;background:hsl(var(--surface));border:1px solid hsl(var(--rule));color:hsl(var(--fg));margin:0 2px;";
  const letterStyle = "font-weight:700;color:hsl(var(--primary-ink));margin-right:4px;";
  return String(prompt).replace(/\[([ABCD]):([^\]]+)\]/g, (_, letter, text) => {
    return `<span style="${chipStyle}"><span style="${letterStyle}">${letter}</span>${escapeHtml(text.trim())}</span>`;
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
