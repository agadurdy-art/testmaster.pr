// Shared presentational primitives for the Strategies Guide feature.
// Extracted verbatim from StrategiesGuide.jsx (lines 55-127) during the monolith split.
import React from 'react';
import { Lightbulb, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ACCENTS } from '../constants';

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

export { RichText, Eyebrow, AccentBar, CalloutBox };
