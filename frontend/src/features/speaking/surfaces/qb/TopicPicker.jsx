import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  Clock, Mic, CheckCircle, ChevronRight, Volume2, Loader2,
  GraduationCap, Cpu, Leaf, Briefcase, Globe, Heart, Atom, TrendingUp,
  Newspaper, Home, Sparkles, Utensils, Plane, ShoppingBag, Users,
  Smile, MessageCircle, AlertCircle, BookOpen
} from 'lucide-react';
import { LOADING_TIPS } from './hooks/useQbTopics';

// Visual identity per topic family. Keeps the picker scannable: the icon and
// soft gradient signal the topic at a glance instead of every card looking
// identical. Class strings are written in full (not interpolated) so Tailwind
// JIT can see them at build time — interpolating colours like
// `hover:border-${accent}-400` produces classes that exist in source but get
// purged from the bundle.
const TOPIC_THEME = {
  education:     { icon: GraduationCap, card: 'bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-emerald-400',   iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',   divider: 'border-emerald-200/60',  chev: 'text-emerald-500' },
  technology:    { icon: Cpu,           card: 'bg-gradient-to-br from-sky-50 to-blue-50 hover:border-sky-400',           iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',       divider: 'border-sky-200/60',      chev: 'text-sky-500' },
  environment:   { icon: Leaf,          card: 'bg-gradient-to-br from-green-50 to-lime-50 hover:border-green-400',       iconBg: 'bg-gradient-to-br from-green-500 to-lime-600',     divider: 'border-green-200/60',    chev: 'text-green-500' },
  work:          { icon: Briefcase,     card: 'bg-gradient-to-br from-amber-50 to-orange-50 hover:border-amber-400',     iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',   divider: 'border-amber-200/60',    chev: 'text-amber-500' },
  culture:       { icon: Globe,         card: 'bg-gradient-to-br from-rose-50 to-pink-50 hover:border-rose-400',         iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600',      divider: 'border-rose-200/60',     chev: 'text-rose-500' },
  health:        { icon: Heart,         card: 'bg-gradient-to-br from-red-50 to-rose-50 hover:border-red-400',           iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',       divider: 'border-red-200/60',      chev: 'text-red-500' },
  science:       { icon: Atom,          card: 'bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-400',   iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',  divider: 'border-violet-200/60',   chev: 'text-violet-500' },
  business:      { icon: TrendingUp,    card: 'bg-gradient-to-br from-indigo-50 to-blue-50 hover:border-indigo-400',     iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600',    divider: 'border-indigo-200/60',   chev: 'text-indigo-500' },
  media:         { icon: Newspaper,     card: 'bg-gradient-to-br from-fuchsia-50 to-pink-50 hover:border-fuchsia-400',   iconBg: 'bg-gradient-to-br from-fuchsia-500 to-pink-600',   divider: 'border-fuchsia-200/60',  chev: 'text-fuchsia-500' },
  home:          { icon: Home,          card: 'bg-gradient-to-br from-orange-50 to-amber-50 hover:border-orange-400',    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-600',   divider: 'border-orange-200/60',   chev: 'text-orange-500' },
  hobbies:       { icon: Sparkles,      card: 'bg-gradient-to-br from-yellow-50 to-amber-50 hover:border-yellow-400',    iconBg: 'bg-gradient-to-br from-yellow-500 to-amber-600',   divider: 'border-yellow-200/60',   chev: 'text-yellow-600' },
  food:          { icon: Utensils,      card: 'bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-400',      iconBg: 'bg-gradient-to-br from-orange-500 to-red-600',     divider: 'border-orange-200/60',   chev: 'text-orange-500' },
  travel:        { icon: Plane,         card: 'bg-gradient-to-br from-cyan-50 to-sky-50 hover:border-cyan-400',          iconBg: 'bg-gradient-to-br from-cyan-500 to-sky-600',       divider: 'border-cyan-200/60',     chev: 'text-cyan-500' },
  shopping:      { icon: ShoppingBag,   card: 'bg-gradient-to-br from-pink-50 to-rose-50 hover:border-pink-400',         iconBg: 'bg-gradient-to-br from-pink-500 to-rose-600',      divider: 'border-pink-200/60',     chev: 'text-pink-500' },
  community:     { icon: Users,         card: 'bg-gradient-to-br from-teal-50 to-emerald-50 hover:border-teal-400',      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600',   divider: 'border-teal-200/60',     chev: 'text-teal-500' },
  lifestyle:     { icon: Smile,         card: 'bg-gradient-to-br from-lime-50 to-green-50 hover:border-lime-400',        iconBg: 'bg-gradient-to-br from-lime-500 to-green-600',     divider: 'border-lime-200/60',     chev: 'text-lime-600' },
  communication: { icon: MessageCircle, card: 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400',       iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',    divider: 'border-blue-200/60',     chev: 'text-blue-500' },
  social_issues: { icon: AlertCircle,   card: 'bg-gradient-to-br from-stone-50 to-slate-50 hover:border-slate-400',      iconBg: 'bg-gradient-to-br from-slate-500 to-stone-600',    divider: 'border-slate-200/60',    chev: 'text-slate-500' },
};
const FALLBACK_THEME = {
  icon: BookOpen,
  card: 'bg-gradient-to-br from-slate-50 to-gray-50 hover:border-slate-400',
  iconBg: 'bg-gradient-to-br from-slate-500 to-gray-600',
  divider: 'border-slate-200/60',
  chev: 'text-slate-500',
};
const themeFor = (topic) => TOPIC_THEME[topic] || FALLBACK_THEME;

/**
 * Full-page loading state shown before the topic list arrives. Rotating tip
 * index is owned by useQbTopics so it persists across load cycles (exactly
 * like the original page-level state did).
 */
export function QbLoadingScreen({ tipIndex }) {
  const tip = LOADING_TIPS[tipIndex];
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-emerald-50/30 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Animated mic — three concentric pulses give a sense of "Liz is
            listening / preparing" so the wait reads as activity, not a freeze. */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
            <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping" />
            <span className="absolute inset-2 rounded-full bg-emerald-400/40 animate-ping" style={{ animationDelay: '0.3s' }} />
            <span className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Mic className="w-6 h-6 text-white" />
            </span>
          </div>
          <p className="text-sm font-medium text-emerald-700">Liz is preparing your speaking topics…</p>
        </div>

        {/* Rotating IELTS tip — keeps the wait useful */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 mb-8 transition-opacity duration-500" key={tipIndex}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold mb-1">
                Tip · {tipIndex + 1} / {LOADING_TIPS.length}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tip.body}</p>
            </div>
          </div>
        </div>

        {/* Skeleton topic cards — the page reads as "almost ready" instead
            of empty. Two columns mirror the real grid below. */}
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border-2 border-slate-100 bg-white p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3 mt-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Topic list surface: intro strip, Academic/GT + band filters, and the
 * themed topic grid with hover/focus prefetch.
 */
export default function TopicPicker({
  modules,
  loading,
  filterTrack,
  filterBand,
  onTrackChange,
  onBandChange,
  onSelect,
  onPrefetch,
}) {
  return (
    <div className="space-y-6">
      {/* Intro strip — explains what this page is so the picker doesn't
          feel like a bare list. Mirrors the tone of the Part 1/2/3 cards
          further down once a module is chosen. */}
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-violet-50/40 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900">Choose a speaking topic</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Each set gives you Part 1 (interview), Part 2 (cue card) and Part 3 (discussion). You'll pick which part to practise on the next screen.
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar — segmented Academic/GT toggle + band chips. Replaces
          the unstyled <select> dropdowns that didn't match the rest of
          the app's chrome. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex p-1 bg-slate-100 rounded-lg self-start">
          {[{ v: 'academic', l: 'Academic' }, { v: 'general', l: 'General Training' }].map(opt => (
            <button
              key={opt.v}
              type="button"
              onClick={() => onTrackChange(opt.v)}
              className={`px-3.5 py-1.5 text-sm rounded-md transition-all ${
                filterTrack === opt.v
                  ? 'bg-white shadow-sm font-semibold text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-500 mr-1 uppercase tracking-wide">Band</span>
          {[
            { v: '', l: 'All' },
            { v: '4.0-5.0', l: '4–5' },
            { v: '5.5-6.5', l: '5.5–6.5' },
            { v: '7.0-9.0', l: '7–9' },
          ].map(opt => (
            <button
              key={opt.v || 'all'}
              type="button"
              onClick={() => onBandChange(opt.v)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                filterBand === opt.v
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Topic grid. On md+ we show two columns so the page doesn't feel
          like an endless 1-column list when there are 18+ topics. */}
      {modules.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {modules.map(m => {
            const theme = themeFor(m.topic);
            const Icon = theme.icon;
            const ready = m.audio_cached === m.total_questions && m.total_questions > 0;
            const partial = m.audio_cached > 0 && m.audio_cached < m.total_questions;
            return (
              <Card
                key={m.set_id}
                onClick={() => onSelect(m.set_id)}
                onMouseEnter={() => onPrefetch(m.set_id)}
                onFocus={() => onPrefetch(m.set_id)}
                className={`p-5 cursor-pointer transition-all border-2 hover:shadow-md hover:-translate-y-0.5 ${theme.card}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${theme.iconBg} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-gray-900 leading-tight">{m.title}</h3>
                      {/* Status badge: Ready (cached) / Caching (partial) / AI voice (none).
                          "Loading..." was alarming — these labels say what's
                          actually happening. */}
                      {ready ? (
                        <Badge className="bg-green-100 text-green-700 border border-green-200 shrink-0">
                          <CheckCircle className="w-3 h-3 mr-1" /> Ready
                        </Badge>
                      ) : partial ? (
                        <Badge className="bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Caching
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          <Volume2 className="w-3 h-3 mr-1" /> AI voice
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 capitalize">
                      {String(m.topic || '').replace(/_/g, ' ')} · Band {m.band_range}
                    </p>
                    <div className={`flex items-center justify-between mt-3 pt-3 border-t ${theme.divider}`}>
                      <span className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        ~12 min · 3 parts
                      </span>
                      <ChevronRight className={`w-4 h-4 ${theme.chev}`} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        !loading && (
          <Card className="p-10 text-center border-dashed">
            <Mic className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No topics in this band yet</p>
            <p className="text-xs text-slate-500 mt-1">Try a different band filter or switch tracks.</p>
            {filterBand && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => onBandChange('')}>
                Show all bands
              </Button>
            )}
          </Card>
        )
      )}
    </div>
  );
}
