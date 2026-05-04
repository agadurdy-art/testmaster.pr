import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Headphones, PenTool, Mic,
  Sparkles, Check, ChevronRight, ChevronLeft, ListChecks,
  Lightbulb, Clock, Repeat, X as XIcon, BarChart, Hash,
  Newspaper, Presentation, Brain, Radio, Youtube, Tv,
  Globe, Search, Type, MessageSquare, AlignLeft, Image as ImageIcon,
  SpellCheck, Map as MapIcon, Award, Target, FileText, Eye, Ear,
  Pencil, Users, UserCheck, Star, FileEdit, Wand2, BookA, User,
  Grid3x3, Inbox, FastForward, TrendingUp, AlertTriangle, ShieldAlert,
  HelpCircle, CheckCircle2, XCircle, Quote, Edit3,
} from 'lucide-react';
import axios from 'axios';
import AppShellNav from '../../components/appshell/AppShellNav';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STATIC_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Resolve a slide image path. Backend returns "/static/strategies/..." — prefix with backend URL.
// v=2 cache-bust after essay-structure diagram crops (2026-05-04).
const imgUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${STATIC_BASE}${path}${sep}v=2`;
};

// Icon name → component map. Add new lucide icons here as content references them.
const ICONS = {
  Headphones, SpellCheck, Clock, Lightbulb, X: XIcon, BookOpen,
  BarChart, Repeat, Hash, Newspaper, Presentation, Brain, Radio,
  Youtube, Tv, Globe, Search, Type, MessageSquare, AlignLeft,
  Image: ImageIcon, ListChecks, Mic, FileText, Eye, Ear, Pencil,
  Users, UserCheck, Star, FileEdit, Map: MapIcon, Wand2, BookA,
  User, Grid3x3, Inbox, FastForward, TrendingUp, AlertTriangle,
};

const SKILL_META = {
  listening: { name: 'Listening', icon: Headphones, accent: 'emerald' },
  reading:   { name: 'Reading',   icon: BookOpen,   accent: 'sky' },
  speaking:  { name: 'Speaking',  icon: Mic,        accent: 'violet' },
  writing:   { name: 'Writing',   icon: PenTool,    accent: 'amber' },
  vocabulary:{ name: 'Vocabulary',icon: Sparkles,   accent: 'rose' },
};

const ACCENTS = {
  emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-50', bgLight: 'bg-emerald-50/60', border: 'border-emerald-200', borderStrong: 'border-emerald-400', text: 'text-emerald-700', textDeep: 'text-emerald-900', solid: 'bg-emerald-600 hover:bg-emerald-700', solidBg: 'bg-emerald-600', soft: 'bg-emerald-100', softText: 'text-emerald-800', barBg: 'bg-emerald-500' },
  sky:     { ring: 'ring-sky-500',     bg: 'bg-sky-50',     bgLight: 'bg-sky-50/60',     border: 'border-sky-200',     borderStrong: 'border-sky-400',     text: 'text-sky-700',     textDeep: 'text-sky-900',     solid: 'bg-sky-600 hover:bg-sky-700',         solidBg: 'bg-sky-600',     soft: 'bg-sky-100',     softText: 'text-sky-800',     barBg: 'bg-sky-500' },
  violet:  { ring: 'ring-violet-500',  bg: 'bg-violet-50',  bgLight: 'bg-violet-50/60',  border: 'border-violet-200',  borderStrong: 'border-violet-400',  text: 'text-violet-700',  textDeep: 'text-violet-900',  solid: 'bg-violet-600 hover:bg-violet-700',   solidBg: 'bg-violet-600',  soft: 'bg-violet-100',  softText: 'text-violet-800',  barBg: 'bg-violet-500' },
  amber:   { ring: 'ring-amber-500',   bg: 'bg-amber-50',   bgLight: 'bg-amber-50/60',   border: 'border-amber-200',   borderStrong: 'border-amber-400',   text: 'text-amber-700',   textDeep: 'text-amber-900',   solid: 'bg-amber-600 hover:bg-amber-700',     solidBg: 'bg-amber-600',   soft: 'bg-amber-100',   softText: 'text-amber-800',   barBg: 'bg-amber-500' },
  rose:    { ring: 'ring-rose-500',    bg: 'bg-rose-50',    bgLight: 'bg-rose-50/60',    border: 'border-rose-200',    borderStrong: 'border-rose-400',    text: 'text-rose-700',    textDeep: 'text-rose-900',    solid: 'bg-rose-600 hover:bg-rose-700',       solidBg: 'bg-rose-600',    soft: 'bg-rose-100',    softText: 'text-rose-800',    barBg: 'bg-rose-500' },
};

// =============================================================================
// SHARED PRIMITIVES
// =============================================================================

// Inline markdown — renders **bold** and *italic* only. Preserves line breaks.
// Safety net: any orphan **/* that don't pair up are stripped, so AI-style
// markdown artifacts never leak into the rendered text.
function RichText({ text, className = '' }) {
  if (!text) return null;
  const parts = [];
  let key = 0;
  const regex = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g;
  let lastIdx = 0;
  let m;
  const stripOrphans = (s) => s.replace(/\*+/g, '');
  while ((m = regex.exec(text)) !== null) {
    if (m.index > lastIdx) parts.push(stripOrphans(text.slice(lastIdx, m.index)));
    const tok = m[0];
    if (tok.startsWith('**')) parts.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    else parts.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    lastIdx = m.index + tok.length;
  }
  if (lastIdx < text.length) parts.push(stripOrphans(text.slice(lastIdx)));
  return <span className={className} style={{ whiteSpace: 'pre-line' }}>{parts}</span>;
}

function Eyebrow({ label, tone = 'default', accent }) {
  if (!label) return null;
  const a = ACCENTS[accent];
  const styles = {
    default:  `${a.soft} ${a.softText}`,
    outlined: `bg-white border ${a.borderStrong} ${a.text}`,
    warning:  'bg-amber-100 text-amber-800',
    critical: 'bg-rose-100 text-rose-800',
    numbered: `bg-white border ${a.borderStrong} ${a.text}`,
  }[tone] || `${a.soft} ${a.softText}`;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles}`}>
      {label}
    </span>
  );
}

function AccentBar({ children, accent, className = '' }) {
  const a = ACCENTS[accent];
  return (
    <div className={`border-l-2 ${a.borderStrong} pl-4 ${className}`}>
      {children}
    </div>
  );
}

function CalloutBox({ tone = 'info', title, body, accent }) {
  const a = ACCENTS[accent];
  const toneMap = {
    info:     `${a.bg} border ${a.border} ${a.textDeep}`,
    warning:  'bg-amber-50 border border-amber-200 text-amber-900',
    critical: 'bg-rose-50 border border-rose-300 text-rose-900',
    success:  'bg-emerald-50 border border-emerald-200 text-emerald-900',
    tip:      'bg-violet-50 border border-violet-200 text-violet-900',
  };
  const tones = toneMap[tone] || toneMap.info;
  const Icon = tone === 'critical' ? ShieldAlert : tone === 'warning' ? AlertTriangle : Lightbulb;
  return (
    <div className={`rounded-xl ${tones} px-4 py-3 flex gap-3`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <div className="font-bold text-sm mb-1"><RichText text={title} /></div>}
        {body && <div className="text-sm leading-relaxed"><RichText text={body} /></div>}
      </div>
    </div>
  );
}

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

// =============================================================================
// SLIDE RENDERERS
// =============================================================================

function SlideHero({ slide, accent }) {
  const a = ACCENTS[accent];
  const layout = slide.image_layout || (slide.images || slide.image ? 'split_left' : 'none');
  const imgs = slide.images || (slide.image ? [slide.image] : []);

  if (layout === 'stacked' && imgs.length > 0) {
    return (
      <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white grid md:grid-cols-2`}>
        <div className="grid grid-rows-2 gap-1 bg-gray-100">
          {imgs.slice(0, 2).map((src, i) => (
            <img key={i} src={imgUrl(src)} alt="" className="w-full h-full object-cover aspect-[3/2]" />
          ))}
        </div>
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mt-3">{slide.title}</h1>
          {slide.subtitle && <p className="mt-4 text-base md:text-lg text-gray-600 leading-relaxed"><RichText text={slide.subtitle} /></p>}
        </div>
      </div>
    );
  }

  // fullbleed_top / split_left / split_right / none
  if (layout === 'fullbleed_top' && imgs[0]) {
    return (
      <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white`}>
        <img src={imgUrl(imgs[0])} alt="" className="w-full h-56 md:h-72 object-cover" />
        <div className="p-8 md:p-12">
          <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mt-3">{slide.title}</h1>
          {slide.subtitle && <p className="mt-4 text-lg text-gray-600"><RichText text={slide.subtitle} /></p>}
        </div>
      </div>
    );
  }

  // text-only fallback
  return (
    <div className={`rounded-3xl ${a.bg} border-2 ${a.border} p-12 md:p-16 text-center`}>
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mt-4">{slide.title}</h1>
      {slide.subtitle && <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"><RichText text={slide.subtitle} /></p>}
    </div>
  );
}

function SlidePhotoHero({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white`}>
      {slide.image ? (
        <img src={imgUrl(slide.image)} alt="" className="w-full h-48 md:h-64 object-cover" />
      ) : (
        <div className={`w-full h-2 ${a.barBg}`} />
      )}
      <div className="p-6 md:p-10 space-y-5">
        <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
        {slide.intro && (
          <AccentBar accent={accent}>
            <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>
          </AccentBar>
        )}
        {(slide.body || []).map((b, i) => <Block key={i} block={b} accent={accent} />)}
        {slide.footer && (
          <p className="text-sm text-gray-600 leading-relaxed pt-2 border-t border-gray-100"><RichText text={slide.footer} /></p>
        )}
      </div>
    </div>
  );
}

function SlideSplitVisual({ slide, accent }) {
  const a = ACCENTS[accent];
  const imageRight = slide.image_position === 'right';
  const imgEl = slide.image && (
    <div className="md:w-2/5 lg:w-[42%] flex-shrink-0">
      <img src={imgUrl(slide.image)} alt="" className="w-full h-64 md:h-full object-cover md:min-h-[480px]" />
    </div>
  );
  const contentEl = (
    <div className="flex-1 p-6 md:p-10 space-y-4">
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{slide.title}</h2>}
      {slide.subtitle && <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.subtitle} /></p>}
      {(slide.blocks || []).map((b, i) => <Block key={i} block={b} accent={accent} />)}
    </div>
  );
  return (
    <div className={`rounded-3xl overflow-hidden border-2 ${a.border} bg-white flex flex-col md:flex-row`}>
      {imageRight ? (<>{contentEl}{imgEl}</>) : (<>{imgEl}{contentEl}</>)}
    </div>
  );
}

function SlideAnalogy3up({ slide, accent }) {
  const a = ACCENTS[accent];
  // CSS-based decorative circle when no image — gradient + initial letter
  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-sky-400 to-indigo-500',
    'from-rose-400 to-orange-500',
    'from-violet-400 to-fuchsia-500',
    'from-amber-400 to-yellow-500',
  ];
  return (
    <div className={`rounded-3xl border-2 ${a.border} bg-white p-6 md:p-10`}>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{slide.title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {(slide.items || []).map((it, i) => (
          <div key={i} className="text-center">
            {it.image ? (
              <div className={`w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border-4 ${a.border} mb-4`}>
                <img src={imgUrl(it.image)} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className={`w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center mb-4 shadow-lg`}>
                <span className="text-5xl md:text-6xl font-bold text-white drop-shadow-sm">
                  {(it.title || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="text-lg font-semibold text-gray-900"><RichText text={it.title} /></div>
            {it.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed"><RichText text={it.body} /></div>}
          </div>
        ))}
      </div>
      {slide.footer && (
        <AccentBar accent={accent}>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line"><RichText text={slide.footer} /></p>
        </AccentBar>
      )}
    </div>
  );
}

function SlideBigTypography({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className="rounded-3xl bg-white border-2 border-gray-100 p-8 md:p-14">
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      <h2 className="mt-6 text-4xl md:text-6xl font-bold text-gray-900 leading-[1.05] tracking-tight">
        {slide.title}
      </h2>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {(slide.items || []).map((it, i) => (
          <div key={i} className={`pt-3 border-t-2 ${a.borderStrong}`}>
            <div className="text-sm font-mono text-gray-500 mb-2">{it.number}</div>
            <div className="text-lg md:text-xl font-semibold text-gray-900 leading-snug"><RichText text={it.title} /></div>
            {it.body && <div className="text-sm text-gray-600 mt-2 leading-relaxed"><RichText text={it.body} /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideTimelineZigzag({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-3xl border-2 ${a.border} bg-white p-6 md:p-10`}>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{slide.title}</h2>}
      {slide.intro && (
        <AccentBar accent={accent} className="mb-8">
          <p className="text-base text-gray-700"><RichText text={slide.intro} /></p>
        </AccentBar>
      )}
      <div className="relative max-w-3xl mx-auto py-4">
        <div className={`absolute left-1/2 top-0 bottom-0 w-px ${a.borderStrong} border-l-2 -translate-x-1/2`} />
        <ol className="space-y-8">
          {(slide.nodes || []).map((n, i) => {
            const left = n.side === 'left';
            return (
              <li key={i} className="relative grid grid-cols-2 gap-8 items-center">
                <div className={`${left ? 'text-right' : 'invisible'}`}>
                  {left && (
                    <>
                      <div className="text-base font-semibold text-gray-900">{n.title}</div>
                      {n.body && <div className="text-sm text-gray-600 mt-0.5">{n.body}</div>}
                    </>
                  )}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-10 h-10 rounded-md bg-white border-2 ${a.borderStrong} flex items-center justify-center font-bold ${a.text}`}>
                    {n.number}
                  </div>
                </div>
                <div className={`${left ? 'invisible' : ''}`}>
                  {!left && (
                    <>
                      <div className="text-base font-semibold text-gray-900">{n.title}</div>
                      {n.body && <div className="text-sm text-gray-600 mt-0.5">{n.body}</div>}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      {slide.footer && (
        <p className="text-sm text-gray-600 leading-relaxed mt-6 pt-6 border-t border-gray-100"><RichText text={slide.footer} /></p>
      )}
    </div>
  );
}

function SlideNarrative({ slide, accent }) {
  const a = ACCENTS[accent] || ACCENTS.sky;
  return (
    <div className={`relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] overflow-hidden`}>
      {/* subtle accent glow at top edge */}
      <div className={`absolute inset-x-0 top-0 h-px ${a.solidBg} opacity-30`} />
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full ${a.bg} opacity-50 blur-2xl pointer-events-none`} />
      <div className="relative p-6 md:p-8">
        {slide.title && (
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-2xl ${a.bg} ring-1 ring-inset ${a.border} flex items-center justify-center flex-shrink-0`}>
              <BookOpen className={`w-5 h-5 ${a.text}`} strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
          </div>
        )}
        {slide.subtitle && <p className="text-lg text-gray-700 mb-4 font-medium"><RichText text={slide.subtitle} /></p>}
        <div className="space-y-4">
          {(slide.paragraphs || []).map((p, i) => (
            <p key={i} className="text-base text-gray-700 leading-relaxed"><RichText text={p} /></p>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideChecklist({ slide, accent }) {
  const a = ACCENTS[accent];
  const variant = slide.variant || 'simple';
  return (
    <div className={`bg-white rounded-2xl border-2 ${a.border} p-6 md:p-10`}>
      <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-6">{slide.title}</h2>}
      <ul className="space-y-4">
        {(slide.items || []).map((item, i) => {
          const isObj = typeof item === 'object';
          const title = isObj ? item.title : item;
          const body = isObj ? item.body : null;
          if (variant === 'outline_box') {
            return (
              <li key={i} className="flex items-start gap-4">
                <div className={`mt-0.5 w-7 h-7 rounded-md border-2 ${a.borderStrong} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="text-base font-semibold text-gray-900"><RichText text={title} /></div>
                  {body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={body} /></div>}
                </div>
              </li>
            );
          }
          return (
            <li key={i} className="flex items-start gap-3">
              <div className={`mt-1 w-6 h-6 rounded-lg ${a.soft} flex items-center justify-center flex-shrink-0`}>
                <Check className={`w-3.5 h-3.5 ${a.text}`} />
              </div>
              <div className="flex-1">
                <div className="text-base text-gray-900 font-medium"><RichText text={title} /></div>
                {body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={body} /></div>}
              </div>
            </li>
          );
        })}
      </ul>
      {slide.footer && (
        <div className="mt-6">
          <AccentBar accent={accent}>
            <p className={`text-base font-semibold ${a.text}`}><RichText text={slide.footer} /></p>
          </AccentBar>
        </div>
      )}
    </div>
  );
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

function SlideStrategySteps({ slide, accent }) {
  const a = ACCENTS[accent];
  const variant = slide.variant || 'chevron';

  const renderStep = (s, i) => {
    const num = s.number ?? i + 1;
    const Icon = s.icon ? (ICONS[s.icon] || Lightbulb) : null;

    if (variant === 'icon_circle') {
      return (
        <li key={i} className="flex items-start gap-4">
          <div className="relative flex-shrink-0 w-14 h-14">
            <div className={`absolute inset-0 rounded-full ${a.solidBg} flex items-center justify-center`}>
              {Icon ? <Icon className="w-6 h-6 text-white" strokeWidth={1.75} /> : <span className="text-white font-bold">{num}</span>}
            </div>
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${a.solidBg} text-white text-xs font-bold flex items-center justify-center border-2 border-white`}>
              {num}
            </div>
          </div>
          <div className="flex-1 pt-1.5">
            <div className="font-semibold text-gray-900 text-base"><RichText text={s.title} /></div>
            {s.body && <div className="text-sm text-gray-600 mt-1 leading-relaxed"><RichText text={s.body} /></div>}
          </div>
        </li>
      );
    }

    if (variant === 'numbered_card') {
      return (
        <li key={i} className={`rounded-xl border-2 ${a.border} bg-white px-4 py-3 flex items-start gap-4`}>
          <div className={`text-2xl font-bold ${a.text} flex-shrink-0 w-6 text-center`}>{num}</div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-base"><RichText text={s.title} /></div>
            {s.body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={s.body} /></div>}
          </div>
        </li>
      );
    }

    // chevron (default)
    return (
      <li key={i} className="flex items-center gap-4">
        <div className="relative w-12 h-14 flex items-center justify-center flex-shrink-0">
          <div className={`absolute inset-0 border-2 ${a.borderStrong} rounded-t-lg [clip-path:polygon(0_0,100%_0,100%_70%,50%_100%,0_70%)] bg-white`} />
          <span className={`relative z-10 font-bold ${a.text}`}>{num}</span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-base"><RichText text={s.title} /></div>
          {s.body && <div className="text-sm text-gray-600 mt-0.5 leading-relaxed"><RichText text={s.body} /></div>}
        </div>
      </li>
    );
  };

  // Glass + connected timeline default (when variant is chevron or unspecified)
  const useTimeline = variant === 'chevron' || !variant;
  const steps = slide.steps || [];

  const renderTimelineStep = (s, i) => {
    const num = s.number ?? i + 1;
    const Icon = s.icon ? (ICONS[s.icon] || Lightbulb) : null;
    const isLast = i === steps.length - 1;
    return (
      <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
        {!isLast && (
          <span className={`absolute left-5 top-12 bottom-0 w-px ${a.borderStrong} opacity-40`} aria-hidden="true" />
        )}
        <div className="relative flex-shrink-0 w-10 h-10">
          <div className={`absolute inset-0 rounded-2xl ${a.bg} ring-1 ring-inset ${a.borderStrong} backdrop-blur-md flex items-center justify-center`}>
            {Icon ? <Icon className={`w-5 h-5 ${a.text}`} strokeWidth={2} /> : <span className={`text-base font-bold ${a.textDeep}`}>{num}</span>}
          </div>
          {Icon && (
            <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full ${a.solidBg} text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white`}>
              {num}
            </div>
          )}
        </div>
        <div className={`flex-1 rounded-2xl ${a.bgLight} border ${a.border} ring-1 ring-white/70 p-4 backdrop-blur-md`}>
          <div className={`font-semibold text-gray-900 text-base`}><RichText text={s.title} /></div>
          {s.body && <div className="text-sm text-gray-700 mt-1 leading-relaxed"><RichText text={s.body} /></div>}
        </div>
      </li>
    );
  };

  return (
    <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px ${a.solidBg} opacity-30`} />
      <div className={`absolute -top-24 -right-24 w-52 h-52 rounded-full ${a.bg} opacity-50 blur-2xl pointer-events-none`} />
      <div className="relative p-6 md:p-10">
        {slide.title && (
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl ${a.bg} ring-1 ring-inset ${a.border} flex items-center justify-center flex-shrink-0`}>
              <Target className={`w-5 h-5 ${a.text}`} strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
          </div>
        )}
        {slide.intro && (
          <AccentBar accent={accent} className="mb-6">
            <p className="text-base text-gray-700"><RichText text={slide.intro} /></p>
          </AccentBar>
        )}
        <ol className={useTimeline ? '' : 'space-y-4'}>
          {steps.map(useTimeline ? renderTimelineStep : renderStep)}
        </ol>
      </div>
    </div>
  );
}

function SlideExample({ slide, accent }) {
  const a = ACCENTS[accent];
  // Support both legacy (single question/options) and new (questions[]) shapes
  const questions = slide.questions || (slide.question ? [{ prompt: slide.question, options: slide.options }] : []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 space-y-5">
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>}
      {slide.intro && <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}
      {slide.passage && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 whitespace-pre-line text-base text-gray-800 font-mono">
          {slide.passage}
        </div>
      )}
      {questions.length > 0 && (
        <div className={`grid grid-cols-1 ${questions.length > 1 ? 'md:grid-cols-2' : ''} gap-4`}>
          {questions.map((q, i) => (
            <div key={i} className={`rounded-xl border-2 ${a.border} bg-white p-5`}>
              <div className="font-semibold text-gray-900 mb-3">{q.prompt}</div>
              {q.options && (
                <ul className="space-y-1.5">
                  {q.options.map((o, j) => <li key={j} className="text-sm text-gray-700">{o}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
      {slide.answer && <div className="text-sm font-semibold text-gray-900">Answer: {slide.answer}</div>}
      {slide.explanation && <p className="text-sm text-gray-700 leading-relaxed"><RichText text={slide.explanation} /></p>}
      {slide.callout && <CalloutBox tone={slide.callout.tone} title={slide.callout.title} body={slide.callout.body} accent={accent} />}
    </div>
  );
}

function SlideComparison({ slide, accent }) {
  const a = ACCENTS[accent];
  const hasImages = (slide.columns || []).some((c) => c.image);

  // Column styling per tone — glassy, tinted
  const columnStyle = (tone) => {
    if (tone === 'positive') return {
      cardBg: 'bg-emerald-50/70', cardBorder: 'border-emerald-200/70', ringColor: 'ring-emerald-100',
      iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700', dotColor: 'bg-emerald-500',
      labelColor: 'text-emerald-900', Icon: CheckCircle2,
    };
    if (tone === 'negative' || tone === 'warning') return {
      cardBg: 'bg-rose-50/70', cardBorder: 'border-rose-200/70', ringColor: 'ring-rose-100',
      iconBg: 'bg-rose-100', iconColor: 'text-rose-700', dotColor: 'bg-rose-500',
      labelColor: 'text-rose-900', Icon: AlertTriangle,
    };
    // info / default
    return {
      cardBg: a.bgLight, cardBorder: a.border, ringColor: a.bg,
      iconBg: a.soft, iconColor: a.text, dotColor: a.solidBg,
      labelColor: a.textDeep, Icon: ListChecks,
    };
  };

  return (
    <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 ring-1 ring-black/5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px ${a.solidBg} opacity-30`} />
      <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full ${a.bg} opacity-50 blur-2xl pointer-events-none`} />
      <div className="relative p-6 md:p-10 space-y-5">
        <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
        {slide.title && (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${a.bg} ring-1 ring-inset ${a.border} flex items-center justify-center flex-shrink-0`}>
              <BarChart className={`w-5 h-5 ${a.text}`} strokeWidth={2} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{slide.title}</h2>
          </div>
        )}
        {slide.intro && <p className="text-base text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(slide.columns || []).map((col, i) => {
            const s = columnStyle(col.tone);
            const Marker = col.marker === 'check' ? Check : col.marker === 'x' ? XIcon : null;
            return (
              <div
                key={i}
                className={`relative rounded-2xl ${s.cardBg} backdrop-blur-md border ${s.cardBorder} ring-1 ${s.ringColor} p-5 space-y-4`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <s.Icon className={`w-5 h-5 ${s.iconColor}`} strokeWidth={2} />
                  </div>
                  <div className={`text-lg font-bold ${s.labelColor}`}>{col.label}</div>
                  {Marker && <Marker className={`w-5 h-5 ${s.iconColor} ml-auto`} strokeWidth={3} />}
                </div>
                {(col.items || []).length > 0 && (
                  <ul className="space-y-2.5">
                    {col.items.map((it, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <span className={`mt-2 w-1.5 h-1.5 rounded-full ${s.dotColor} flex-shrink-0`} />
                        <span className="text-sm text-gray-800 leading-relaxed flex-1">
                          <RichText text={typeof it === 'string' ? it : it.title} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {col.image && (
                  <div className={`rounded-xl overflow-hidden border ${s.cardBorder}`}>
                    <img src={imgUrl(col.image)} alt="" className={`w-full ${hasImages ? 'aspect-square' : ''} object-cover`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {slide.callout && <CalloutBox tone={slide.callout.tone} title={slide.callout.title} body={slide.callout.body} accent={accent} />}
      </div>
    </div>
  );
}

function SlideCallout({ slide, accent }) {
  return <CalloutBox tone={slide.tone} title={slide.title} body={slide.body} accent={accent} />;
}

function SlideQuoteBlock({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <blockquote className={`bg-white rounded-2xl border-l-4 ${a.borderStrong} border-y border-r border-gray-200 p-6 md:p-8`}>
      <p className="text-lg italic text-gray-800 leading-relaxed">&ldquo;{slide.quote}&rdquo;</p>
      {slide.attribution && <footer className="mt-3 text-sm text-gray-500">— {slide.attribution}</footer>}
    </blockquote>
  );
}

// =============================================================================
// V3 ENHANCEMENT LAYER — student-mode slides
// =============================================================================

function SlideWorkedExample({ slide, accent }) {
  const a = ACCENTS[accent];
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white p-6 md:p-8`}>
      <Eyebrow label={slide.eyebrow || 'WORKED EXAMPLE'} tone="default" accent={accent} />
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3"><RichText text={slide.title} /></h2>}
      {slide.intro && <p className="mt-3 text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}

      {slide.stimulus && (
        <div className="mt-5 rounded-xl bg-gray-50 border border-gray-200 p-4">
          {slide.stimulus.label && (
            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{slide.stimulus.label}</div>
          )}
          {(slide.stimulus.body || slide.stimulus.text) && (
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              <RichText text={slide.stimulus.body || slide.stimulus.text} />
            </div>
          )}
          {Array.isArray(slide.stimulus.items) && slide.stimulus.items.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-gray-800 leading-relaxed">
              {slide.stimulus.items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span><RichText text={typeof it === 'string' ? it : (it.stem || it.text || it.label || '')} /></span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {slide.question && (
        <div className={`mt-5 rounded-xl ${a.bg} border ${a.border} p-4`}>
          {slide.question.label && (
            <div className={`text-xs uppercase tracking-wider font-semibold ${a.softText} mb-1`}>{slide.question.label}</div>
          )}
          {slide.question.prompt && (
            <div className={`text-sm font-semibold ${a.softText} mb-1`}>{slide.question.prompt}</div>
          )}
          {slide.question.stem && (
            <div className="text-base text-gray-900 leading-relaxed mt-1"><RichText text={slide.question.stem} /></div>
          )}
          {slide.question.blank_text && (
            <div className="text-base text-gray-900 leading-relaxed">{slide.question.blank_text}</div>
          )}
          {Array.isArray(slide.question.options) && slide.question.options.length > 0 && (
            <ol className="mt-3 space-y-1.5 text-gray-900">
              {slide.question.options.map((o, i) => {
                const letter = String.fromCharCode(65 + i);
                const text = typeof o === 'string' ? o : (o.text || o.label || '');
                return (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed">
                    <span className="font-semibold text-gray-700">{letter}.</span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {Array.isArray(slide.question.items) && slide.question.items.length > 0 && (
            <ol className="mt-3 space-y-1.5 text-gray-900">
              {slide.question.items.map((it, i) => {
                const isStr = typeof it === 'string';
                const num = isStr ? i + 1 : (it.n ?? i + 1);
                const text = isStr ? it : (it.stem || it.text || it.label || '');
                return (
                  <li key={i} className="text-sm leading-relaxed flex gap-2">
                    <span className="font-semibold text-gray-700">{num}.</span>
                    <span>{text}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {slide.question.table && Array.isArray(slide.question.table.rows) && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm text-left">
                {Array.isArray(slide.question.table.headers) && (
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-gray-500">
                      {slide.question.table.headers.map((h, i) => (
                        <th key={i} className="px-2 py-1 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {slide.question.table.rows.map((row, r) => (
                    <tr key={r} className="border-t border-gray-200">
                      {(Array.isArray(row) ? row : []).map((cell, c) => (
                        <td key={c} className="px-2 py-1 text-gray-800">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {Array.isArray(slide.thinking_steps) && slide.thinking_steps.length > 0 && (
        <ol className="mt-6 space-y-3">
          {slide.thinking_steps.map((s, i) => {
            const isStr = typeof s === 'string';
            const stepNum = isStr ? i + 1 : (s.step ?? i + 1);
            const title = isStr ? null : s.title;
            const body = isStr ? s : s.body;
            return (
              <li key={i} className="flex gap-3">
                <div className={`flex-shrink-0 w-7 h-7 rounded-full ${a.solidBg} text-white text-sm font-bold flex items-center justify-center`}>
                  {stepNum}
                </div>
                <div className="flex-1">
                  {title && <div className="font-semibold text-gray-900"><RichText text={title} /></div>}
                  {body && <div className="text-sm text-gray-700 leading-relaxed mt-0.5"><RichText text={body} /></div>}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {slide.answer && (
        <div className="mt-6">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${a.solid} text-white text-sm font-semibold`}
            >
              Reveal answer
            </button>
          ) : (
            <div className={`rounded-xl border-2 ${a.borderStrong} ${a.bg} p-4`}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-5 h-5 ${a.text}`} />
                <span className={`font-bold ${a.textDeep}`}>Answer: {slide.answer.value}</span>
              </div>
              {(slide.answer.rationale || slide.answer.explanation) && (
                <p className="text-sm text-gray-700 mt-2 leading-relaxed"><RichText text={slide.answer.rationale || slide.answer.explanation} /></p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Normalise a quiz item to a single internal shape regardless of which schema
// the content authors used. Supports two flavours:
//   A. choices: [{key,text}], answer_key: "A", accepts: [...]   (legacy)
//   B. options: ["..."],       answer_index: 1,  acceptable_answers/answer  (current)
function normaliseQuizItem(item, idx) {
  const id = item.id || `q${idx}`;
  if (item.kind === 'mcq') {
    if (Array.isArray(item.choices) && item.answer_key) {
      return { ...item, id, choices: item.choices, answer_key: item.answer_key };
    }
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    // options can be ["string", ...] OR [{letter, text}, ...] OR [{key, text}, ...] OR [{label, text}, ...]
    const choices = (item.options || []).map((opt, i) => {
      if (typeof opt === 'string') return { key: letters[i], text: opt };
      const key = opt.letter || opt.key || letters[i];
      const text = opt.text || opt.label || '';
      return { key, text };
    });
    const answerKey = letters[item.answer_index ?? -1] || item.answer_key || '';
    return { ...item, id, choices, answer_key: answerKey };
  }
  // fill_in
  const answerKey = item.answer_key || item.answer || '';
  const accepts = item.accepts || item.acceptable_answers || (answerKey ? [answerKey] : []);
  return { ...item, id, answer_key: answerKey, accepts };
}

function SlideQuiz({ slide, accent }) {
  const a = ACCENTS[accent];
  const [answers, setAnswers] = useState({}); // id → user's choice/text
  const [submitted, setSubmitted] = useState({}); // id → bool

  const items = (slide.items || []).map(normaliseQuizItem);

  const isCorrect = (item) => {
    const given = (answers[item.id] || '').toString().trim().toLowerCase();
    if (item.kind === 'mcq') return given === (item.answer_key || '').toLowerCase();
    const accepts = (item.accepts || []).map((s) => String(s).toLowerCase());
    return accepts.includes(given);
  };

  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white p-6 md:p-8`}>
      <div className="flex items-center gap-2">
        <HelpCircle className={`w-5 h-5 ${a.text}`} />
        <Eyebrow label={slide.eyebrow || 'CHECK YOURSELF'} tone="default" accent={accent} />
      </div>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">{slide.title}</h2>}
      {slide.intro && <p className="mt-3 text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}

      <div className="mt-6 space-y-6">
        {items.map((item, idx) => {
          const wasSubmitted = submitted[item.id];
          const correct = wasSubmitted && isCorrect(item);
          return (
            <div key={item.id} className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-500 mb-2">Question {idx + 1}</div>
              <div className="text-gray-900 leading-relaxed font-medium">{item.prompt}</div>

              {item.kind === 'mcq' ? (
                <div className="mt-3 space-y-2">
                  {(item.choices || []).map((c) => {
                    const picked = answers[item.id] === c.key;
                    const showCorrect = wasSubmitted && c.key === item.answer_key;
                    const showWrong = wasSubmitted && picked && c.key !== item.answer_key;
                    return (
                      <label
                        key={c.key}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
                          ${showCorrect ? 'border-emerald-400 bg-emerald-50' : ''}
                          ${showWrong ? 'border-rose-400 bg-rose-50' : ''}
                          ${!wasSubmitted && picked ? `${a.borderStrong} ${a.bg}` : ''}
                          ${!wasSubmitted && !picked ? 'border-gray-200 hover:bg-gray-100' : ''}
                        `}
                      >
                        <input
                          type="radio"
                          name={item.id}
                          value={c.key}
                          checked={picked}
                          disabled={wasSubmitted}
                          onChange={() => setAnswers((prev) => ({ ...prev, [item.id]: c.key }))}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-gray-800">
                          <span className="font-semibold mr-1">{c.key}.</span>
                          {c.text}
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  value={answers[item.id] || ''}
                  disabled={wasSubmitted}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  placeholder="Type your answer…"
                  className="mt-3 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300 text-sm"
                />
              )}

              {!wasSubmitted ? (
                <button
                  type="button"
                  onClick={() => setSubmitted((p) => ({ ...p, [item.id]: true }))}
                  disabled={answers[item.id] == null || answers[item.id] === ''}
                  className={`mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg ${a.solid} text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Check
                </button>
              ) : (
                <div className={`mt-3 rounded-lg p-3 text-sm flex gap-2
                  ${correct ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-rose-50 border border-rose-200 text-rose-900'}`}
                >
                  {correct ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-semibold">{correct ? 'Correct.' : `Not quite — answer: ${item.answer_key}`}</div>
                    {item.explanation && <div className="mt-1 leading-relaxed">{item.explanation}</div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideCommonMistakes({ slide, accent }) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white p-6 md:p-8`}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-rose-500" />
        <Eyebrow label={slide.eyebrow || 'WATCH OUT'} tone="critical" accent={accent} />
      </div>
      {slide.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">{slide.title}</h2>}
      {slide.intro && <p className="mt-3 text-gray-700 leading-relaxed"><RichText text={slide.intro} /></p>}

      <div className="mt-6 space-y-4">
        {(slide.mistakes || slide.pairs || []).map((m, i) => (
          <div key={i} className="grid md:grid-cols-2 gap-3">
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
                <XCircle className="w-4 h-4" />
                What students do wrong
              </div>
              <p className="mt-2 text-sm text-rose-900 leading-relaxed"><RichText text={m.wrong} /></p>
            </div>
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                What to do instead
              </div>
              <p className="mt-2 text-sm text-emerald-900 leading-relaxed"><RichText text={m.right} /></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full-bleed PDF-style figure: a single image with stage eyebrow + caption.
// Used for ported visual diagrams (essay-structure pages, etc.) where the diagram
// itself carries the pedagogy and we don't want to redraw it natively.
function SlideFigure({ slide, accent }) {
  const a = ACCENTS[accent];
  const stages = slide.stages || null; // optional ["Blank","Populated","Flowchart","Checklist"]
  const activeIdx = typeof slide.stage_index === 'number' ? slide.stage_index : -1;
  return (
    <div className={`rounded-2xl border-2 ${a.border} bg-white overflow-hidden`}>
      {/* Hide chrome when the image already bakes in title + stage pills (e.g., the
          essay-structure diagrams) — avoids duplicate headers above and inside the image. */}
      {!slide.image_has_header && (
        <div className="px-6 md:px-8 pt-6 md:pt-8">
          <Eyebrow label={slide.eyebrow} tone={slide.eyebrow_tone} accent={accent} />
          {slide.title && (
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2"><RichText text={slide.title} /></h2>
          )}
          {stages && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs md:text-sm">
              {stages.map((s, i) => (
                <React.Fragment key={i}>
                  <span
                    className={
                      i === activeIdx
                        ? `px-2 py-1 rounded-md ${a.barBg} text-white font-semibold`
                        : 'px-2 py-1 rounded-md bg-gray-100 text-gray-500'
                    }
                  >
                    {s}
                  </span>
                  {i < stages.length - 1 && <span className="text-gray-300">›</span>}
                </React.Fragment>
              ))}
            </div>
          )}
          {slide.intro && (
            <p className="mt-3 text-sm md:text-base text-gray-700 leading-relaxed">
              <RichText text={slide.intro} />
            </p>
          )}
        </div>
      )}
      {slide.image && (
        <div className={`${slide.image_has_header ? '' : 'mt-5 border-t border-gray-100'} bg-gray-50`}>
          <img
            src={imgUrl(slide.image)}
            alt={slide.alt || slide.title || ''}
            className="w-full h-auto object-contain max-h-[1100px] mx-auto"
          />
        </div>
      )}
      {slide.caption && (
        <div className="px-6 md:px-8 py-4 border-t border-gray-100 text-sm text-gray-600 leading-relaxed">
          <RichText text={slide.caption} />
        </div>
      )}
    </div>
  );
}

// Per-slide error boundary so a single bad slide doesn't kill the whole chapter view.
class SlideErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[SlideErrorBoundary]', this.props.slideType, error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 text-sm text-rose-900">
          <div className="font-bold mb-1">Slide failed to render</div>
          <div className="text-xs mb-2">type: <code>{this.props.slideType}</code></div>
          <pre className="text-xs whitespace-pre-wrap bg-white/60 p-2 rounded border border-rose-200 overflow-auto max-h-40">
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function SlideRendererInner({ slide, accent }) {
  switch (slide.type) {
    case 'hero':            return <SlideHero slide={slide} accent={accent} />;
    case 'photo_hero':      return <SlidePhotoHero slide={slide} accent={accent} />;
    case 'split_visual':    return <SlideSplitVisual slide={slide} accent={accent} />;
    case 'analogy_3up':     return <SlideAnalogy3up slide={slide} accent={accent} />;
    case 'big_typography':  return <SlideBigTypography slide={slide} accent={accent} />;
    case 'timeline_zigzag': return <SlideTimelineZigzag slide={slide} accent={accent} />;
    case 'narrative':       return <SlideNarrative slide={slide} accent={accent} />;
    case 'checklist':       return <SlideChecklist slide={slide} accent={accent} />;
    case 'factboard':       return <SlideFactBoard slide={slide} accent={accent} />;
    case 'icon_grid':       return <SlideIconGrid slide={slide} accent={accent} />;
    case 'strategy_steps':  return <SlideStrategySteps slide={slide} accent={accent} />;
    case 'example':         return <SlideExample slide={slide} accent={accent} />;
    case 'comparison':      return <SlideComparison slide={slide} accent={accent} />;
    case 'callout':         return <SlideCallout slide={slide} accent={accent} />;
    case 'quote_block':     return <SlideQuoteBlock slide={slide} accent={accent} />;
    case 'worked_example':  return <SlideWorkedExample slide={slide} accent={accent} />;
    case 'quiz':            return <SlideQuiz slide={slide} accent={accent} />;
    case 'common_mistakes': return <SlideCommonMistakes slide={slide} accent={accent} />;
    case 'figure':          return <SlideFigure slide={slide} accent={accent} />;
    default:
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
          Unknown slide type: <code>{slide.type}</code>
        </div>
      );
  }
}

function SlideRenderer({ slide, accent }) {
  return (
    <SlideErrorBoundary slideType={slide?.type || 'unknown'}>
      <SlideRendererInner slide={slide} accent={accent} />
    </SlideErrorBoundary>
  );
}

// =============================================================================
// CHAPTER VIEW — sidebar + slide viewer
// =============================================================================

function LessonSidebar({ chapter, currentLessonIdx, onSelect, accent }) {
  const a = ACCENTS[accent];
  return (
    <aside className="w-full lg:w-72 lg:flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-200 p-4 lg:sticky lg:top-24">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 px-2">Lessons</div>
        <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
          {chapter.lessons.map((lesson, idx) => {
            const isActive = idx === currentLessonIdx;
            return (
              <button
                key={lesson.lesson_id}
                onClick={() => onSelect(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-start gap-2 ${
                  isActive ? `${a.soft} ${a.softText} font-semibold` : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`text-xs font-bold mt-0.5 ${isActive ? a.text : 'text-gray-400'}`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 leading-snug">{lesson.title}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

// Where each chapter sends the student to actually practise after they finish reading.
const SKILL_PRACTICE_ROUTE = {
  reading: '/question-bank/reading/academic',
  listening: '/question-bank/listening',
  writing: '/question-bank/writing/task2',
  speaking: '/question-bank/speaking',
  vocabulary: '/vocabulary',
};

function ChapterView({ chapter, onBack, user }) {
  const accent = SKILL_META[chapter.skill]?.accent || 'emerald';
  const a = ACCENTS[accent];
  const SkillIcon = SKILL_META[chapter.skill]?.icon || BookOpen;
  const navigate = useNavigate();

  const [lessonIdx, setLessonIdx] = useState(0);
  const lesson = chapter.lessons[lessonIdx];
  const total = chapter.lessons.length;
  const isLastLesson = lessonIdx === total - 1;
  const practiceRoute = SKILL_PRACTICE_ROUTE[chapter.skill];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lessonIdx]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-white">
      {/* Decorative accent-tinted blur blobs — provides depth without distracting from content */}
      <div className="pointer-events-none fixed inset-0 -z-0">
        <div className={`absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full ${a.bg} opacity-60 blur-3xl`} />
        <div className={`absolute top-1/3 -left-40 w-[420px] h-[420px] rounded-full ${a.bg} opacity-50 blur-3xl`} />
        <div className={`absolute bottom-0 right-1/4 w-[380px] h-[380px] rounded-full ${a.bg} opacity-40 blur-3xl`} />
      </div>
      <AppShellNav currentPage="strategies" user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            All chapters
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <SkillIcon className="w-4 h-4" />
            <span className="font-medium">{SKILL_META[chapter.skill]?.name}</span>
            <span className="text-gray-300">·</span>
            <span>Lesson {lessonIdx + 1} of {total}</span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <LessonSidebar chapter={chapter} currentLessonIdx={lessonIdx} onSelect={setLessonIdx} accent={accent} />

          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2.5 py-1 rounded-full ${a.soft} ${a.softText} font-semibold text-xs uppercase tracking-wider`}>
                Lesson {lessonIdx + 1}
              </span>
              <span className="text-gray-500">{chapter.title}</span>
            </div>
            {/* Suppress outer H1 when the first slide already carries the same title —
                otherwise the lesson title renders twice (H1 here + slide title). */}
            {(() => {
              const first = (lesson.slides || [])[0];
              if (first && first.title && first.title === lesson.title) return null;
              return <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{lesson.title}</h1>;
            })()}

            {lesson.liz_intro && (
              <div className={`rounded-2xl ${a.bg} border ${a.border} p-5 flex gap-3`}>
                <Sparkles className={`w-5 h-5 ${a.text} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm ${a.softText} leading-relaxed`}>{lesson.liz_intro}</p>
              </div>
            )}

            {(lesson.slides || []).map((slide, i) => (
              <SlideRenderer key={i} slide={slide} accent={accent} />
            ))}

            {lesson.practice_link && (
              <a
                href={lesson.practice_link.href}
                className={`inline-flex items-center gap-2 ${a.solid} text-white font-semibold px-6 py-3 rounded-xl transition-colors`}
              >
                {lesson.practice_link.label}
                <ArrowRight className="w-4 h-4" />
              </a>
            )}

            {lesson.liz_outro && (
              <div className={`rounded-2xl ${a.bg} border ${a.border} p-5 flex gap-3`}>
                <Sparkles className={`w-5 h-5 ${a.text} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm ${a.softText} leading-relaxed`}>{lesson.liz_outro}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                onClick={() => setLessonIdx((v) => Math.max(0, v - 1))}
                disabled={lessonIdx === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="text-sm text-gray-500">{lessonIdx + 1} / {total}</div>
              {isLastLesson ? (
                <button
                  onClick={() => practiceRoute ? navigate(practiceRoute) : onBack()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${a.solid} text-white text-sm font-medium`}
                >
                  {practiceRoute ? 'Practice in Question Bank' : 'Finish'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setLessonIdx((v) => Math.min(total - 1, v + 1))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl ${a.solid} text-white text-sm font-medium`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CHAPTER INDEX — landing view
// =============================================================================

// Skill tab order — matches Question Bank surface for muscle memory.
const SKILL_TAB_ORDER = ['listening', 'reading', 'writing', 'speaking', 'vocabulary'];

function ChapterIndex({ chapters, activeSkill, onSkillChange, onOpen, onBack, user }) {
  // Build per-skill chapter map and counts.
  const bySkill = SKILL_TAB_ORDER.reduce((acc, s) => {
    acc[s] = chapters.filter((c) => c.skill === s);
    return acc;
  }, {});
  const visibleChapters = bySkill[activeSkill] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-white">
      <AppShellNav currentPage="strategies" user={user} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Complete A-to-Z Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Strategies Guide</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Step-by-step strategies for every IELTS question type. Faithfully ported chapters covering listening, reading, speaking, writing and vocabulary.
          </p>
        </div>

        {/* Skill tabs — QB-style centered iOS 26 segmented pill */}
        <div className="flex justify-center mb-8">
          <div
            role="tablist"
            aria-label="Filter strategies by skill"
            className="inline-flex gap-1 p-1.5 rounded-2xl bg-slate-100/80 border border-slate-200 shadow-sm backdrop-blur max-w-full overflow-x-auto"
          >
            {SKILL_TAB_ORDER.map((skill) => {
              const meta = SKILL_META[skill];
              if (!meta) return null;
              const Icon = meta.icon;
              const a = ACCENTS[meta.accent];
              const count = bySkill[skill]?.length || 0;
              const selected = skill === activeSkill;
              return (
                <button
                  key={skill}
                  role="tab"
                  aria-selected={selected}
                  data-testid={`strategies-skill-tab-${skill}`}
                  onClick={() => onSkillChange(skill)}
                  disabled={count === 0}
                  className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                    selected
                      ? 'bg-white text-gray-900 font-semibold border border-slate-200 shadow-[0_1px_3px_rgba(15,23,42,0.06)]'
                      : 'border border-transparent text-gray-500 hover:text-gray-700 font-medium'
                  } ${count === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Icon className={`w-4 h-4 ${selected ? a.text : ''}`} strokeWidth={selected ? 2.2 : 1.8} />
                  {meta.name}
                  {count > 0 && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        selected ? `${a.soft} ${a.softText}` : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No chapters available yet. Content extraction in progress.</p>
          </div>
        ) : visibleChapters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-600">
              No {SKILL_META[activeSkill]?.name.toLowerCase()} chapters yet — extraction in progress.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {visibleChapters.map((ch) => {
              const meta = SKILL_META[ch.skill] || SKILL_META.listening;
              const a = ACCENTS[meta.accent];
              const Icon = meta.icon;
              const ready = ch.extraction_status === 'complete';
              return (
                <button
                  key={ch.chapter_id}
                  onClick={() => ready && onOpen(ch.chapter_id)}
                  disabled={!ready}
                  className={`group text-left bg-white rounded-2xl border-2 ${a.border} p-6 transition-all ${
                    ready ? `hover:shadow-lg hover:-translate-y-0.5 cursor-pointer` : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${a.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold uppercase tracking-widest ${a.text} mb-1`}>
                        {meta.name}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-1">{ch.title}</h3>
                      {ch.subtitle && <p className="text-sm text-gray-600 leading-relaxed mb-3">{ch.subtitle}</p>}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{ch.lesson_count} lessons</span>
                        {!ready && (
                          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-medium">Coming soon</span>
                        )}
                      </div>
                    </div>
                    {ready && <ChevronRight className={`w-5 h-5 ${a.text} group-hover:translate-x-1 transition-transform`} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function StrategiesGuide({ user, onLogout }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterParam = searchParams.get('chapter');
  const skillParam = searchParams.get('skill');

  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active skill — URL ?skill= sync, default to first skill that has chapters once loaded.
  const activeSkill = SKILL_TAB_ORDER.includes(skillParam) ? skillParam : null;
  const resolvedSkill = activeSkill || (chapters.length
    ? (SKILL_TAB_ORDER.find((s) => chapters.some((c) => c.skill === s)) || 'listening')
    : 'listening');

  const handleSkillChange = (skill) => {
    const next = new URLSearchParams(searchParams);
    next.set('skill', skill);
    next.delete('chapter');
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/strategies/index`)
      .then((r) => setChapters(r.data?.chapters || []))
      .catch((e) => setError(e?.response?.data?.detail || 'Failed to load strategies'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!chapterParam) {
      setChapter(null);
      return;
    }
    setLoading(true);
    axios.get(`${API}/strategies/chapter/${chapterParam}`)
      .then((r) => setChapter(r.data))
      .catch((e) => setError(e?.response?.data?.detail || 'Failed to load chapter'))
      .finally(() => setLoading(false));
  }, [chapterParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading strategies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl border border-rose-200 p-8 max-w-md text-center">
          <p className="text-rose-700 font-semibold mb-2">Could not load strategies</p>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (chapter) {
    return (
      <ChapterView
        chapter={chapter}
        user={user}
        onBack={() => {
          // Preserve ?skill= so the user lands back on the tab they came from.
          const next = new URLSearchParams();
          if (resolvedSkill) next.set('skill', resolvedSkill);
          setSearchParams(next);
        }}
      />
    );
  }

  return (
    <ChapterIndex
      chapters={chapters}
      user={user}
      activeSkill={resolvedSkill}
      onSkillChange={handleSkillChange}
      onOpen={(id) => {
        const next = new URLSearchParams(searchParams);
        next.set('chapter', id);
        setSearchParams(next);
      }}
      onBack={() => navigate('/dashboard')}
    />
  );
}
