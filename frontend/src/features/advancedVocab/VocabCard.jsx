import React, { useState } from 'react';
import { Volume2, ChevronDown, ChevronUp, Circle, CircleDashed, CheckCircle2 } from 'lucide-react';
import { ACCENT_STYLES } from './clusters';

/**
 * VocabCard — one record (a noun, an idiom, a pronunciation entry, …) shown
 * with progressive reveal.
 *
 * Visual grammar (post-2026-05-09 punch-up):
 *   The first pass leaned too pastel — washed-out tints with grey text — and
 *   the page felt empty. We now use a stronger headword (text-base bold), a
 *   pill-style subtitle chip in the cluster accent, a brighter mastery dot,
 *   and a hover-tint that previews the cluster colour. The card still
 *   collapses to a single row but it now actually *invites* a tap.
 *
 * Mastery cycle: new → learning → known → new. The dot in the corner is
 * tappable so the student can self-rate without leaving the card.
 */
export default function VocabCard({ item, accent, mastery, onMasteryChange, onSpeak }) {
  const [open, setOpen] = useState(false);
  const styles = ACCENT_STYLES[accent] || ACCENT_STYLES.sky;

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
        : 'text-gray-400';
  const masteryLabel =
    mastery === 'known' ? 'Known' : mastery === 'learning' ? 'Learning' : 'Tap to track';

  return (
    <div
      className={`group bg-white rounded-xl border border-gray-200 border-l-[6px] ${styles.border} shadow-sm hover:shadow-md hover:${styles.hoverTint} transition overflow-hidden`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-3.5 py-3 flex items-start gap-3"
      >
        {/* Mastery dot */}
        <button
          type="button"
          onClick={cycleMastery}
          aria-label={`Mastery: ${masteryLabel}`}
          title={masteryLabel}
          className="flex-shrink-0 mt-0.5 hover:scale-110 transition"
        >
          <MasteryIcon className={`w-5 h-5 ${masteryColor}`} strokeWidth={2.25} />
        </button>

        {/* Headword + subtitle */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-[15px] leading-tight">
              {item.headword}
            </span>
            {item.subtitle && (
              <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${styles.chipSoft}`}>
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
              className={`p-1.5 rounded-md text-gray-400 hover:${styles.text} hover:bg-white`}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          )}
          {open ? (
            <ChevronUp className={`w-4 h-4 ${styles.text}`} />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          )}
        </div>
      </button>

      {open && (
        <div className={`px-3.5 pb-3 pt-1 space-y-2 border-t ${styles.divider}`}>
          {item.meaning && (
            <p className="text-[13px] leading-relaxed text-gray-800">{item.meaning}</p>
          )}
          {item.example && (
            <div className={`rounded-lg ${styles.exampleBg} px-3 py-2`}>
              <p className={`text-xs italic leading-relaxed ${styles.exampleText}`}>
                &ldquo;{item.example}&rdquo;
              </p>
            </div>
          )}
          {item.extras?.length > 0 && (
            <div className="space-y-1 pt-0.5">
              {item.extras.map((extra, i) => (
                <div key={i} className="flex items-baseline gap-2">
                  <span className={`text-[10px] uppercase tracking-wide font-bold ${styles.text}`}>
                    {extra.label}
                  </span>
                  <span className="text-[12px] text-gray-700 leading-relaxed">{extra.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
