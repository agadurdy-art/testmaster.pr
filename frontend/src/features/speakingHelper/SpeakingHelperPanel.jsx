import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Layers,
  AlertTriangle,
  Sparkles,
  Lightbulb,
  HelpCircle,
  Type,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import { getHelperContent } from './staticContent';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// SpeakingHelperPanel — floating "Liz coaching" panel that lives on top of
// the speaking practice surface as a fixed-position overlay (does not push
// the existing question + recorder layout).
//
// Six buttons in two groups:
//   STATIC (no LLM call):
//     - structure: Band 7+ scaffold for this Part (1 / 2 / 3)
//     - pitfall:   Common pitfalls examiners penalise on this Part
//   DYNAMIC (Haiku-backed via /api/speaking/helper):
//     - unpack:    What is the question / cue card really asking?
//     - ideas:     Two or three angles to talk about
//     - phrases:   Band 7+ collocations & connectors for this question
//     - opener:    A confident first sentence template (so they don't freeze)
//
// Behaviour:
//   - Desktop (lg+): default open, sticky on right edge.
//   - Mobile/tablet: default collapsed to a small "ASK LIZ" tab.
//   - Text-only across all tiers (no TTS) per locked margin policy.
//   - Session cache: same (kind, question) is served from local Map without
//     re-calling LLM — re-clicks are free.
//   - Replaced "polish" (writing-only — needs draft) with "opener" because
//     speaking has no transcript to highlight.
//
// Props:
//   - part:     1 | 2 | 3 — the current speaking part
//   - question: the question text (Part 1/3) or cue-card topic (Part 2)
//   - cueCard:  optional object with bullets — used as extra context for Part 2
//   - topic:    optional broader theme/topic for context
export default function SpeakingHelperPanel({
  part = 1,
  question = '',
  cueCard = null,
  topic = '',
}) {
  const [open, setOpen] = useState(true);
  const [activeKey, setActiveKey] = useState(null);
  const [responses, setResponses] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);
  const [errorKey, setErrorKey] = useState(null);
  const [cache, setCache] = useState(() => new Map());

  // Default closed on small screens so the recorder isn't covered.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    setOpen(isDesktop);
  }, []);

  // Compose a stable identity for the current question — when this changes,
  // dynamic responses & cache are dropped so a new question doesn't show
  // stale guidance from the previous one.
  const questionKey = useMemo(() => {
    if (part === 2 && cueCard) {
      return `p2::${cueCard.topic || ''}::${(cueCard.bullets || []).join('|')}`;
    }
    return `p${part}::${question || ''}`;
  }, [part, question, cueCard]);

  useEffect(() => {
    setResponses({});
    setCache(new Map());
    setActiveKey(null);
    setErrorKey(null);
  }, [questionKey]);

  const staticContent = useMemo(() => getHelperContent(part), [part]);

  const STATIC_KINDS = ['structure', 'pitfall'];
  const DYNAMIC_KINDS = ['unpack', 'ideas', 'phrases', 'opener'];

  // Build a single textual representation of the current question for the LLM.
  const composedPrompt = useMemo(() => {
    if (part === 2 && cueCard) {
      const bullets = (cueCard.bullets || []).map((b) => `- ${b}`).join('\n');
      return [
        cueCard.topic ? `Topic: ${cueCard.topic}` : '',
        bullets ? `Bullets:\n${bullets}` : '',
      ].filter(Boolean).join('\n\n');
    }
    return question || '';
  }, [part, question, cueCard]);

  const fetchDynamic = async (kind) => {
    if (!composedPrompt || !composedPrompt.trim()) {
      setErrorKey(kind);
      setResponses((r) => ({
        ...r,
        [kind]: 'Pick a question first — the coach needs the prompt to give specific guidance.',
      }));
      return;
    }
    const cacheKey = `${kind}::${questionKey}`;
    if (cache.has(cacheKey)) {
      setResponses((r) => ({ ...r, [kind]: cache.get(cacheKey) }));
      setErrorKey(null);
      return;
    }
    setLoadingKey(kind);
    setErrorKey(null);
    try {
      const res = await fetch(`${API_URL}/api/speaking/helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          part: String(part),
          question: composedPrompt,
          topic: topic || null,
        }),
      });
      if (!res.ok) {
        throw new Error(`Helper request failed (${res.status})`);
      }
      const data = await res.json();
      const text = (data && data.text) || '';
      setResponses((r) => ({ ...r, [kind]: text }));
      setCache((m) => {
        const next = new Map(m);
        next.set(cacheKey, text);
        return next;
      });
    } catch (err) {
      setErrorKey(kind);
      setResponses((r) => ({
        ...r,
        [kind]: 'Couldn’t reach Liz right now. Try again in a moment.',
      }));
    } finally {
      setLoadingKey(null);
    }
  };

  const handleButtonClick = (kind) => {
    if (activeKey === kind && !loadingKey) {
      setActiveKey(null);
      return;
    }
    setActiveKey(kind);
    if (DYNAMIC_KINDS.includes(kind) && responses[kind] === undefined) {
      fetchDynamic(kind);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Liz coaching panel"
        className="fixed right-3 bottom-20 lg:top-24 lg:bottom-auto z-40 flex flex-col items-center gap-2 px-2 py-3 rounded-l-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <Sparkles className="w-5 h-5" />
        <span
          className="text-[11px] font-bold tracking-wide"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          ASK LIZ
        </span>
        <ChevronLeft className="w-4 h-4" />
      </button>
    );
  }

  let activeView = null;
  if (STATIC_KINDS.includes(activeKey)) {
    activeView = { mode: 'static', payload: staticContent[activeKey] };
  } else if (activeKey && DYNAMIC_KINDS.includes(activeKey)) {
    activeView = { mode: 'dynamic', kind: activeKey };
  }

  return (
    <div className="fixed right-3 bottom-3 lg:top-24 lg:bottom-auto z-40 w-[min(380px,calc(100vw-1.5rem))] max-h-[calc(100vh-2rem)] flex flex-col bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 leading-tight">Liz</div>
            <div className="text-[11px] text-gray-500 leading-tight truncate">
              Speaking coach · Part {part}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Collapse coaching panel"
          className="p-1.5 rounded-lg text-gray-500 hover:bg-white/60"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Button grid: 6 buttons in two columns */}
      <div className="grid grid-cols-2 gap-2 p-3 border-b border-gray-100">
        <HelperButton
          icon={<HelpCircle className="w-3.5 h-3.5" />}
          label="Unpack the question"
          colorActive="bg-sky-600 border-sky-600 text-white"
          colorIdle="hover:bg-sky-50 hover:border-sky-300"
          active={activeKey === 'unpack'}
          loading={loadingKey === 'unpack'}
          onClick={() => handleButtonClick('unpack')}
        />
        <HelperButton
          icon={<Lightbulb className="w-3.5 h-3.5" />}
          label="Ideas to explore"
          colorActive="bg-amber-500 border-amber-500 text-white"
          colorIdle="hover:bg-amber-50 hover:border-amber-300"
          active={activeKey === 'ideas'}
          loading={loadingKey === 'ideas'}
          onClick={() => handleButtonClick('ideas')}
        />
        <HelperButton
          icon={<Type className="w-3.5 h-3.5" />}
          label="Phrases for now"
          colorActive="bg-emerald-600 border-emerald-600 text-white"
          colorIdle="hover:bg-emerald-50 hover:border-emerald-300"
          active={activeKey === 'phrases'}
          loading={loadingKey === 'phrases'}
          onClick={() => handleButtonClick('phrases')}
        />
        <HelperButton
          icon={<PlayCircle className="w-3.5 h-3.5" />}
          label="Confident opener"
          colorActive="bg-rose-600 border-rose-600 text-white"
          colorIdle="hover:bg-rose-50 hover:border-rose-300"
          active={activeKey === 'opener'}
          loading={loadingKey === 'opener'}
          onClick={() => handleButtonClick('opener')}
        />
        <HelperButton
          icon={<Layers className="w-3.5 h-3.5" />}
          label={`Part ${part} structure`}
          colorActive="bg-violet-600 border-violet-600 text-white"
          colorIdle="hover:bg-violet-50 hover:border-violet-300"
          active={activeKey === 'structure'}
          onClick={() => handleButtonClick('structure')}
        />
        <HelperButton
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          label={`Part ${part} pitfalls`}
          colorActive="bg-orange-600 border-orange-600 text-white"
          colorIdle="hover:bg-orange-50 hover:border-orange-300"
          active={activeKey === 'pitfall'}
          onClick={() => handleButtonClick('pitfall')}
        />
      </div>

      {/* Active content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!activeView && <PlaceholderCopy part={part} />}

        {activeView?.mode === 'static' && activeView.payload?.sections && (
          <StaticSections title={activeView.payload.title} sections={activeView.payload.sections} />
        )}

        {activeView?.mode === 'static' && activeView.payload?.items && (
          <StaticBullets title={activeView.payload.title} items={activeView.payload.items} />
        )}

        {activeView?.mode === 'dynamic' && (
          <DynamicView
            kind={activeView.kind}
            loading={loadingKey === activeView.kind}
            text={responses[activeView.kind]}
            errored={errorKey === activeView.kind}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 text-center">
        Liz · Text-only coaching · Use during prep, not while recording
      </div>
    </div>
  );
}

function HelperButton({ icon, label, colorActive, colorIdle, active, loading, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
        active ? colorActive : `bg-white text-gray-700 border-gray-200 ${colorIdle}`
      } disabled:opacity-70`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" /> : icon}
      <span className="truncate text-left">{label}</span>
    </button>
  );
}

function PlaceholderCopy({ part }) {
  return (
    <div className="text-sm text-gray-500 leading-relaxed">
      <p className="mb-2 font-medium text-gray-700">Pick a coaching mode above.</p>
      <ul className="space-y-1 text-xs text-gray-600 list-disc pl-4">
        <li><b>Unpack the question</b> — what is it really asking?</li>
        <li><b>Ideas to explore</b> — angles you could take.</li>
        <li><b>Phrases for now</b> — band-7+ language for this question.</li>
        <li><b>Confident opener</b> — a first sentence so you don&rsquo;t freeze.</li>
        <li><b>Part {part} structure</b> — answer scaffold for this Part.</li>
        <li><b>Part {part} pitfalls</b> — what examiners penalise here.</li>
      </ul>
    </div>
  );
}

function StaticSections({ title, sections }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-900 mb-3">{title}</h4>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={i}>
            <div className="text-[11px] uppercase tracking-wide font-semibold text-violet-700 mb-1">
              {s.heading}
            </div>
            <p className="text-xs leading-relaxed text-gray-700">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaticBullets({ title, items }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-900 mb-3">{title}</h4>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-xs leading-relaxed text-gray-700 flex gap-2">
            <span className="text-amber-500 flex-shrink-0">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DynamicView({ kind, loading, text, errored }) {
  if (loading) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Liz is thinking…
      </div>
    );
  }
  if (text === undefined) return null;
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 mb-2">
        {kindLabel(kind)}
      </div>
      <p className={`text-xs leading-relaxed whitespace-pre-wrap ${errored ? 'text-red-700' : 'text-gray-800'}`}>
        {text}
      </p>
    </div>
  );
}

function kindLabel(kind) {
  switch (kind) {
    case 'unpack': return 'Unpacking the question';
    case 'ideas': return 'Angles to explore';
    case 'phrases': return 'Phrases for this question';
    case 'opener': return 'A confident opener';
    default: return kind;
  }
}
