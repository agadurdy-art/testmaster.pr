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
  Wand2,
  Loader2,
} from 'lucide-react';
import { getHelperContent } from './staticContent';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// WritingHelperPanel — floating "Liz coaching" panel that lives on top of the
// writing practice surface as a fixed-position overlay (does not push the
// existing prompt/textarea split).
//
// Six buttons in two groups:
//   STATIC (no LLM call):
//     - structure: Band 7+ paragraph scaffold for this essay subtype
//     - pitfall:   Common pitfalls examiners penalise on this subtype
//   DYNAMIC (Haiku-backed via /api/writing/helper):
//     - unpack:    Break down what the question is really asking
//     - ideas:     Two or three angles to explore
//     - phrases:   Useful phrases for the current draft
//     - polish:    Targeted upgrades for one selected sentence
//
// Behaviour:
//   - Desktop (lg+): default open, sticky on right edge.
//   - Mobile/tablet: default collapsed to a small "ASK LIZ" tab.
//   - Text-only across all tiers (no TTS) per locked margin policy.
//   - Session cache: same (kind, prompt[, selection]) is served from a
//     local Map without re-calling the LLM. So re-clicks are free and
//     instant.
//   - kind=polish requires the student to have selected text inside a
//     textarea on the page; we read selection at click time using the
//     `data-helper-target="essay"` selector convention.
//
// Props:
//   - taskType: 'task1_academic' | 'task1_general' | 'task2'
//   - subtype:  matches the page's subtype id (e.g. 'opinion', 'bar_graph')
//   - prompt:   the IELTS question text — required for dynamic kinds
//   - essay:    the student's current draft — used by phrases/polish
export default function WritingHelperPanel({
  taskType = 'task2',
  subtype,
  prompt = '',
  essay = '',
}) {
  const [open, setOpen] = useState(true);
  const [activeKey, setActiveKey] = useState(null);
  // Per-kind transient state. Keyed by static kind (structure/pitfall) or
  // dynamic kind (unpack/ideas/phrases/polish).
  const [responses, setResponses] = useState({});
  const [loadingKey, setLoadingKey] = useState(null);
  const [errorKey, setErrorKey] = useState(null);
  // Cache: key = `${kind}::${prompt}::${selection || ''}`. Reset whenever
  // the prompt changes so a new question doesn't show stale guidance.
  const [cache, setCache] = useState(() => new Map());

  // Default to closed on small screens so the writing area isn't covered.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
    setOpen(isDesktop);
  }, []);

  // When the prompt switches, drop dynamic responses + cache (static
  // content is subtype-keyed and re-derived on the fly so it is fine).
  useEffect(() => {
    setResponses({});
    setCache(new Map());
    setActiveKey(null);
    setErrorKey(null);
  }, [prompt]);

  const staticContent = useMemo(
    () => getHelperContent(taskType, subtype),
    [taskType, subtype],
  );

  const STATIC_KINDS = ['structure', 'pitfall'];
  const DYNAMIC_KINDS = ['unpack', 'ideas', 'phrases', 'polish'];

  const readSelectionFromPage = () => {
    if (typeof document === 'undefined') return '';
    const ta = document.querySelector('textarea[data-helper-target="essay"]');
    if (!ta) return '';
    const { selectionStart, selectionEnd, value } = ta;
    if (selectionStart == null || selectionStart === selectionEnd) return '';
    return value.slice(selectionStart, selectionEnd).trim();
  };

  const fetchDynamic = async (kind) => {
    if (!prompt || !prompt.trim()) {
      setErrorKey(kind);
      setResponses((r) => ({
        ...r,
        [kind]: 'Pick a question first — the coach needs the prompt to give specific guidance.',
      }));
      return;
    }
    let selection = '';
    if (kind === 'polish') {
      selection = readSelectionFromPage();
      if (!selection) {
        setErrorKey(kind);
        setResponses((r) => ({
          ...r,
          [kind]: 'Highlight one sentence from your essay first, then click Polish — I’ll suggest targeted upgrades.',
        }));
        return;
      }
    }
    const cacheKey = `${kind}::${prompt}::${selection}`;
    if (cache.has(cacheKey)) {
      setResponses((r) => ({ ...r, [kind]: cache.get(cacheKey) }));
      setErrorKey(null);
      return;
    }
    setLoadingKey(kind);
    setErrorKey(null);
    try {
      const res = await fetch(`${API_URL}/api/writing/helper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          task_type: taskType,
          subtype: subtype || null,
          prompt,
          essay: kind === 'phrases' || kind === 'polish' ? essay : null,
          selection: selection || null,
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
    // Toggle off if same kind clicked while already active.
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

  // Resolve content to render in the active area.
  let activeView = null;
  if (activeKey === 'structure' || activeKey === 'pitfall') {
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
              Your IELTS writing coach
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

      {/* Button grid: 6 buttons in two rows */}
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
          icon={<Wand2 className="w-3.5 h-3.5" />}
          label="Polish a sentence"
          colorActive="bg-rose-600 border-rose-600 text-white"
          colorIdle="hover:bg-rose-50 hover:border-rose-300"
          active={activeKey === 'polish'}
          loading={loadingKey === 'polish'}
          onClick={() => handleButtonClick('polish')}
        />
        <HelperButton
          icon={<Layers className="w-3.5 h-3.5" />}
          label="Band 7+ structure"
          colorActive="bg-violet-600 border-violet-600 text-white"
          colorIdle="hover:bg-violet-50 hover:border-violet-300"
          active={activeKey === 'structure'}
          onClick={() => handleButtonClick('structure')}
        />
        <HelperButton
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          label="Common pitfalls"
          colorActive="bg-orange-600 border-orange-600 text-white"
          colorIdle="hover:bg-orange-50 hover:border-orange-300"
          active={activeKey === 'pitfall'}
          onClick={() => handleButtonClick('pitfall')}
        />
      </div>

      {/* Active content area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!activeView && <PlaceholderCopy />}

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
        Liz · Text-only coaching · Highlight a sentence first to use Polish
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

function PlaceholderCopy() {
  return (
    <div className="text-sm text-gray-500 leading-relaxed">
      <p className="mb-2 font-medium text-gray-700">Pick a coaching mode above.</p>
      <ul className="space-y-1 text-xs text-gray-600 list-disc pl-4">
        <li><b>Unpack the question</b> — what is it really asking?</li>
        <li><b>Ideas to explore</b> — angles you could take.</li>
        <li><b>Phrases for now</b> — band-7+ language for your current draft.</li>
        <li><b>Polish a sentence</b> — highlight one sentence first, then click.</li>
        <li><b>Band 7+ structure</b> — paragraph scaffold for this essay type.</li>
        <li><b>Common pitfalls</b> — what examiners penalise here.</li>
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
    case 'phrases': return 'Phrases for your current draft';
    case 'polish': return 'Polishing your sentence';
    default: return kind;
  }
}
