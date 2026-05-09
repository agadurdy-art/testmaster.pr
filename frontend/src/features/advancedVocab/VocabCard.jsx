import React, { useState } from 'react';
import { Volume2, ChevronDown, ChevronUp, Circle, CircleDashed, CheckCircle2 } from 'lucide-react';
import { ACCENT_STYLES } from './clusters';

/**
 * VocabCard — one record (a noun, an idiom, a pronunciation entry, …) shown
 * with progressive reveal.
 *
 * Why progressive reveal: the original layout fired meaning + example for
 * 30+ items at once. With the front face showing only the headword and
 * subtitle, the eye has fewer simultaneous targets and the student is asked
 * to perform a tiny act of recall before the meaning is unmasked. That
 * single beat between "see word" and "see meaning" is what turns passive
 * scrolling into active study.
 *
 * Mastery cycle: new → learning → known → new. The dot in the corner is
 * tappable so the student can self-rate without leaving the card.
 */
export default function VocabCard({ item, accent, mastery, onMasteryChange, onSpeak }) {
  const [open, setOpen] = useState(false);
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.amber;

  const cycleMastery = (e) => {
    e.stopPropagation();
    const next =
      mastery === 'known' ? 'new' : mastery === 'learning' ? 'known' : 'learning';
    onMasteryChange?.(item.key, next);
  };

  const speak = (e) => {
    e.stopPropagation();
    onSpeak?.(item.headword);
  };

  const MasteryIcon =
    mastery === 'known' ? CheckCircle2 : mastery === 'learning' ? CircleDashed : Circle;
  const masteryColor =
    mastery === 'known'
      ? 'text-emerald-500'
      : mastery === 'learning'
        ? 'text-amber-500'
        : 'text-gray-300';
  const masteryLabel =
    mastery === 'known' ? 'Known' : mastery === 'learning' ? 'Learning' : 'Tap to track';

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${styles.border} shadow-sm hover:shadow transition overflow-hidden`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-3 flex items-start gap-3"
      >
        {/* Mastery dot */}
        <button
          type="button"
          onClick={cycleMastery}
          aria-label={`Mastery: ${masteryLabel}`}
          title={masteryLabel}
          className="flex-shrink-0 mt-0.5 hover:scale-110 transition"
        >
          <MasteryIcon className={`w-4 h-4 ${masteryColor}`} />
        </button>

        {/* Headword + subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm leading-tight">
              {item.headword}
            </span>
            {item.subtitle && (
              <span className={`text-[10px] uppercase tracking-wide font-semibold ${styles.text}`}>
                {item.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Pronounce + chevron */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {item.pronounceable && (
            <button
              type="button"
              onClick={speak}
              aria-label={`Pronounce ${item.headword}`}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-50"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-gray-100">
          {item.meaning && (
            <p className="text-xs leading-relaxed text-gray-700">{item.meaning}</p>
          )}
          {item.example && (
            <div className={`rounded-md ${styles.chipSoft} px-2.5 py-1.5`}>
              <p className="text-[11px] italic leading-relaxed">&ldquo;{item.example}&rdquo;</p>
            </div>
          )}
          {item.extras?.length > 0 && (
            <div className="space-y-1">
              {item.extras.map((extra, i) => (
                <div key={i} className="flex items-baseline gap-2">
                  <span className={`text-[10px] uppercase tracking-wide font-semibold ${styles.text}`}>
                    {extra.label}
                  </span>
                  <span className="text-[11px] text-gray-700 leading-relaxed">{extra.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
