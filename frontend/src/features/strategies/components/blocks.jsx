// Block dispatcher + embeddable slide bodies (factboard / icon grid).
// Extracted verbatim from StrategiesGuide.jsx (lines 129-363 and 650-803) during
// the monolith split. SlideFactBoard/SlideIconGrid live here (not slides.jsx)
// because Block renders them inline — keeping them together avoids an import cycle.
import React, { useState } from 'react';
import {
  HelpCircle, Check, X as XIcon, Edit3, CheckCircle2, XCircle,
  Quote, Lightbulb,
} from 'lucide-react';
import { ACCENTS, ICONS } from '../constants';
import { RichText, Eyebrow, AccentBar, CalloutBox } from './primitives';

// =============================================================================
// BLOCK DISPATCHER (used inside split_visual.blocks and photo_hero.body)
// =============================================================================

// Inline MCQ block — pick an option, then reveal feedback + explanation.
function BlockMCQ({ block, correctLetter, accent }) {
  const a = ACCENTS[accent];
  const [picked, setPicked] = useState(null);
  const options = block.options || [];
  return (
    <div className={`rounded-2xl border ${a.border} bg-white p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className={`w-4 h-4 ${a.text}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${a.softText}`}>Quick check</span>
      </div>
      {block.stem && <p className="text-base font-semibold text-gray-900 mb-3"><RichText text={block.stem} /></p>}
      <div className="space-y-2">
        {options.map((o, i) => {
          const letter = (o.letter || String.fromCharCode(65 + i)).toUpperCase();
          const isPicked = picked === letter;
          const isCorrect = letter === correctLetter;
          const showState = picked !== null;
          let stateCls = `border-gray-200 bg-white hover:bg-gray-50`;
          if (showState && isPicked && isCorrect) stateCls = 'border-emerald-300 bg-emerald-50';
          else if (showState && isPicked && !isCorrect) stateCls = 'border-rose-300 bg-rose-50';
          else if (showState && !isPicked && isCorrect) stateCls = 'border-emerald-200 bg-emerald-50/60';
          return (
            <button
              key={i}
              type="button"
              onClick={() => picked === null && setPicked(letter)}
              disabled={picked !== null}
              className={`w-full text-left rounded-xl border-2 px-4 py-2.5 text-sm transition ${stateCls}`}
            >
              <span className="font-semibold text-gray-700 mr-2">{letter}.</span>
              <RichText text={typeof o === 'string' ? o : o.text} />
              {showState && isCorrect && <Check className="w-4 h-4 text-emerald-600 inline-block ml-2" />}
              {showState && isPicked && !isCorrect && <XIcon className="w-4 h-4 text-rose-600 inline-block ml-2" />}
            </button>
          );
        })}
      </div>
      {picked && block.explanation && (
        <div className={`mt-3 rounded-xl ${a.bg} border ${a.border} p-3`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${a.softText} mb-1`}>Why</div>
          <p className="text-sm text-gray-800 leading-relaxed"><RichText text={block.explanation} /></p>
        </div>
      )}
    </div>
  );
}

// Inline single-input fill-in-the-blank block — type, submit, get feedback.
function BlockFillIn({ block, accent }) {
  const a = ACCENTS[accent];
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const accept = (block.accept || (block.answer ? [block.answer] : [])).map((s) => String(s).trim().toLowerCase());
  const correct = submitted && accept.includes(value.trim().toLowerCase());
  return (
    <div className={`rounded-2xl border ${a.border} bg-white p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <Edit3 className={`w-4 h-4 ${a.text}`} />
        <span className={`text-xs font-bold uppercase tracking-wider ${a.softText}`}>Fill in</span>
      </div>
      {block.stem && <p className="text-base font-semibold text-gray-900 mb-3"><RichText text={block.stem} /></p>}
      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setSubmitted(false); }}
          placeholder="Type your answer…"
          className={`flex-1 rounded-xl border-2 ${a.border} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${a.bg}`}
        />
        <button
          type="submit"
          className={`rounded-xl ${a.solid} text-white text-sm font-semibold px-4 py-2`}
        >
          Check
        </button>
      </form>
      {submitted && (
        <div className={`mt-3 rounded-xl border-2 ${correct ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'} p-3`}>
          <div className="flex items-center gap-2 mb-1">
            {correct
              ? <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              : <XCircle className="w-4 h-4 text-rose-700" />}
            <span className={`text-sm font-bold ${correct ? 'text-emerald-800' : 'text-rose-800'}`}>
              {correct ? 'Correct' : `Answer: ${block.answer}`}
            </span>
          </div>
          {block.explanation && <p className="text-sm text-gray-800 leading-relaxed"><RichText text={block.explanation} /></p>}
        </div>
      )}
    </div>
  );
}

function Block({ block, accent }) {
  if (!block) return null;
  const a = ACCENTS[accent];

  switch (block.kind) {
    case 'paragraph':
      return <p className="text-base text-gray-700 leading-relaxed"><RichText text={block.body || block.text} /></p>;

    case 'accent_quote':
      return (
        <AccentBar accent={accent}>
          <p className="text-base font-semibold text-gray-900"><RichText text={block.body || block.text} /></p>
        </AccentBar>
      );

    case 'quote':
      return (
        <blockquote className={`relative rounded-2xl bg-white border-l-4 ${a.borderStrong} ring-1 ring-black/5 px-5 py-4`}>
          <Quote className={`absolute -top-2 left-4 w-5 h-5 ${a.text} bg-white px-0.5`} aria-hidden="true" />
          <p className="text-[15px] italic text-gray-800 leading-relaxed"><RichText text={block.body || block.text} /></p>
          {block.attribution && <footer className="mt-2 text-xs text-gray-500">— {block.attribution}</footer>}
        </blockquote>
      );

    case 'mcq': {
      const correctLetter = (block.answer || '').toUpperCase();
      return (
        <BlockMCQ block={block} correctLetter={correctLetter} accent={accent} />
      );
    }

    case 'fill_in':
      return <BlockFillIn block={block} accent={accent} />;

    case 'accent_quote_titled':
      return (
        <AccentBar accent={accent} className="space-y-1">
          <p className={`text-base font-bold ${a.text}`}><RichText text={block.title} /></p>
          <p className="text-sm text-gray-700 leading-relaxed"><RichText text={block.body} /></p>
        </AccentBar>
      );

    case 'card_list': {
      const marker = block.marker;
      return (
        <div className="space-y-2.5">
          {block.label && <div className="text-base font-semibold text-gray-900 mb-1">{block.label}</div>}
          {(block.cards || []).map((c, i) => (
            <div key={i} className={`rounded-xl border-2 ${a.border} bg-white px-4 py-3`}>
              <div className="flex items-start gap-2">
                {marker === 'x' && <XIcon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
                {marker === 'check' && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900"><RichText text={c.title} /></div>
                  {(c.body || c.text) && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={c.body || c.text} /></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'bullets':
      return (
        <div>
          {block.label && <div className="text-base font-semibold text-gray-900 mb-2">{block.label}</div>}
          <ul className="space-y-1.5 list-disc list-inside marker:text-gray-400">
            {(block.items || []).map((it, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed">
                <RichText text={typeof it === 'string' ? it : it.title} />
              </li>
            ))}
          </ul>
        </div>
      );

    case 'two_col_bullets':
      return (
        <div className="grid grid-cols-2 gap-6">
          {(block.columns || []).map((col, i) => (
            <div key={i}>
              <div className="text-base font-semibold text-gray-900 mb-2">{col.label}</div>
              <ul className="space-y-1.5 list-disc list-inside marker:text-gray-400">
                {(col.items || []).map((it, j) => (
                  <li key={j} className="text-sm text-gray-700 leading-relaxed"><RichText text={it} /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'chevron_steps':
      return (
        <ol className="space-y-3">
          {(block.steps || []).map((s, i) => {
            const Icon = s.icon ? ICONS[s.icon] : null;
            return (
              <li key={i} className="flex items-center gap-3">
                <div className={`relative w-12 h-14 flex items-center justify-center flex-shrink-0`}>
                  <div className={`absolute inset-0 border-2 ${a.borderStrong} rounded-t-lg rounded-b-[14px] [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)] bg-white`} />
                  <span className={`relative z-10 font-bold ${a.text} text-base`}>{s.number}</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className={`w-4 h-4 ${a.text}`} />}
                    <div className="font-semibold text-gray-900">{s.title}</div>
                  </div>
                  {s.body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed">{s.body}</div>}
                </div>
              </li>
            );
          })}
        </ol>
      );

    case 'callout':
      return <CalloutBox tone={block.tone} title={block.title} body={block.body} accent={accent} />;

    case 'icon_grid_inline':
      return <SlideIconGrid slide={{ ...block, type: 'icon_grid' }} accent={accent} embedded />;

    case 'factboard_inline':
      return <SlideFactBoard slide={{ ...block, type: 'factboard' }} accent={accent} embedded />;

    default:
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-900">
          Unknown block kind: <code>{block.kind}</code>
        </div>
      );
  }
}

function SlideFactBoard({ slide, accent, embedded = false }) {
  const a = ACCENTS[accent];
  const variant = slide.variant || 'label_value';

  const inner = variant === 'big_number' ? (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(slide.facts || []).map((f, i) => (
        <div key={i} className="text-center md:text-left">
          <div className={`text-5xl md:text-6xl font-bold ${a.text} leading-none`}>{f.value}</div>
          <div className="mt-2 text-base font-semibold text-gray-900">{f.label}</div>
          {f.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed">{f.body}</div>}
        </div>
      ))}
    </div>
  ) : (
    <div className="grid sm:grid-cols-2 gap-4">
      {(slide.facts || []).map((f, i) => (
        <div key={i} className={`rounded-xl ${a.bg} border ${a.border} p-5`}>
          <div className={`text-xs font-bold uppercase tracking-wider ${a.text} mb-2`}>{f.label}</div>
          <div className="text-base text-gray-800 leading-relaxed">{f.value}</div>
        </div>
      ))}
    </div>
  );

  if (embedded) return <div className="space-y-4">{slide.title && <h3 className="text-lg font-bold text-gray-900">{slide.title}</h3>}{inner}{slide.footer && <p className="text-sm text-gray-600 leading-relaxed pt-2"><RichText text={slide.footer} /></p>}</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
      {slide.title && <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">{slide.title}</h2>}
      {inner}
      {slide.footer && <p className="text-sm text-gray-600 leading-relaxed mt-5 pt-5 border-t border-gray-100"><RichText text={slide.footer} /></p>}
    </div>
  );
}

function SlideIconGrid({ slide, accent, embedded = false }) {
  const a = ACCENTS[accent];
  const variant = slide.variant || 'outline';
  const cols = slide.columns || (slide.cards?.length === 5 || slide.cards?.length === 6 ? 3 : 2);
  const colClass = cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

  // Title → tone map for the checklist variant. Authors can override via card.tone.
  const TONES = {
    sky:     { bg: 'bg-sky-50',     border: 'border-sky-200',     headerBg: 'bg-sky-100',     headerText: 'text-sky-900',     iconText: 'text-sky-600',     check: 'text-sky-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', headerBg: 'bg-emerald-100', headerText: 'text-emerald-900', iconText: 'text-emerald-600', check: 'text-emerald-500' },
    amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   headerBg: 'bg-amber-100',   headerText: 'text-amber-900',   iconText: 'text-amber-700',   check: 'text-amber-500' },
    rose:    { bg: 'bg-rose-50',    border: 'border-rose-200',    headerBg: 'bg-rose-100',    headerText: 'text-rose-900',    iconText: 'text-rose-600',    check: 'text-rose-500' },
    violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  headerBg: 'bg-violet-100',  headerText: 'text-violet-900',  iconText: 'text-violet-600',  check: 'text-violet-500' },
  };
  const TONE_BY_TITLE = {
    Planning: 'sky', Plan: 'sky', Prewriting: 'sky',
    Writing: 'emerald', Drafting: 'emerald', Write: 'emerald',
    Checking: 'amber', Check: 'amber', Polishing: 'amber', Polish: 'amber', Review: 'amber',
  };
  const splitBullets = (body) => {
    if (!body) return [];
    return String(body)
      .split(/\n+/)
      .map(line => line.replace(/^\s*[•*\-]\s*/, '').trim())
      .filter(Boolean);
  };

  const renderCard = (c, i) => {
    const Icon = c.icon ? (ICONS[c.icon] || Lightbulb) : null;

    if (variant === 'checklist') {
      const tone = TONES[c.tone || TONE_BY_TITLE[c.title] || 'sky'];
      const items = splitBullets(c.body);
      return (
        <div key={i} className={`rounded-2xl border-2 ${tone.border} ${tone.bg} overflow-hidden flex flex-col`}>
          <div className={`flex items-center gap-2 px-5 py-3 ${tone.headerBg}`}>
            {Icon && <Icon className={`w-5 h-5 ${tone.iconText}`} strokeWidth={2} />}
            {c.title && <div className={`font-bold text-base ${tone.headerText}`}>{c.title}</div>}
          </div>
          <ul className="p-4 space-y-2.5">
            {items.map((it, k) => (
              <li key={k} className="flex items-start gap-2.5 text-sm text-gray-800 leading-snug">
                <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tone.check}`} strokeWidth={2} />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (variant === 'circular_badge') {
      return (
        <div key={i} className={`rounded-xl border-2 ${a.border} bg-white p-5`}>
          {Icon && (
            <div className={`w-11 h-11 rounded-full ${a.solidBg} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
          )}
          {c.title && <div className="font-semibold text-gray-900 text-base"><RichText text={c.title} /></div>}
          {c.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line"><RichText text={c.body} /></div>}
        </div>
      );
    }

    if (variant === 'topline_icon') {
      return (
        <div key={i}>
          <div className={`border-t-2 ${a.borderStrong} pt-3`}>
            {Icon && <Icon className={`w-5 h-5 ${a.text} mb-2`} strokeWidth={1.5} />}
            {c.title && <div className="font-semibold text-gray-900"><RichText text={c.title} /></div>}
            {c.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line"><RichText text={c.body} /></div>}
          </div>
        </div>
      );
    }

    // outline (default)
    return (
      <div key={i} className="flex flex-col items-start">
        {Icon && (
          <div className={`w-12 h-12 rounded-xl border-2 ${a.borderStrong} flex items-center justify-center mb-3`}>
            <Icon className={`w-6 h-6 ${a.text}`} strokeWidth={1.5} />
          </div>
        )}
        {c.title && <div className="font-semibold text-gray-900 text-base"><RichText text={c.title} /></div>}
        {c.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed"><RichText text={c.body} /></div>}
      </div>
    );
  };

  const inner = (
    <>
      {slide.intro && !embedded && <p className="text-sm text-gray-600 mb-6"><RichText text={slide.intro} /></p>}
      <div className={`grid grid-cols-1 ${colClass} gap-x-6 gap-y-6`}>
        {(slide.cards || []).map(renderCard)}
      </div>
      {slide.footer && !embedded && (
        <p className="text-sm text-gray-600 leading-relaxed mt-6 pt-6 border-t border-gray-100"><RichText text={slide.footer} /></p>
      )}
      {slide.callout && !embedded && (
        <div className="mt-6">
          <CalloutBox tone={slide.callout.tone} title={slide.callout.title} body={slide.callout.body} accent={accent} />
        </div>
      )}
    </>
  );

  if (embedded) return inner;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10">
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-2">{slide.title}</h2>}
      {inner}
    </div>
  );
}

export { BlockMCQ, BlockFillIn, Block, SlideFactBoard, SlideIconGrid };
