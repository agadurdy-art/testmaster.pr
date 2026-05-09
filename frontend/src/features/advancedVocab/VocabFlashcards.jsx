import React, { useEffect, useMemo, useState } from 'react';
import { X, RotateCcw, Volume2, ArrowRight } from 'lucide-react';
import { ACCENT_STYLES } from './clusters';

/**
 * VocabFlashcards — modal study mode for active recall.
 *
 * Why this lives next to the regular cards: scanning a list teaches you
 * recognition; flashcards force production. The student sees the headword,
 * tries to recall the meaning, then flips. The three-button rating at the
 * end (Again / Got it / Easy) writes back to the same mastery store the
 * inline cards use, so progress is shared between modes.
 *
 * Deck composition: items are taken from buildClusterSections so the deck
 * matches the cluster the student is currently looking at — they study what
 * they were just reading. "Again" sends a card to the back of the queue;
 * "Got it" / "Easy" remove it. When the queue empties, a summary screen
 * shows mastery deltas.
 */
export default function VocabFlashcards({
  cluster,
  sections,
  onMasteryChange,
  onSpeak,
  onClose,
}) {
  const styles = ACCENT_STYLES[cluster.accent] || ACCENT_STYLES.sky;

  // Flatten and shuffle once per session so the student gets a slightly
  // different order than they read the list in. useMemo keeps it stable
  // across re-renders within the modal.
  const initialDeck = useMemo(() => {
    const flat = [];
    sections.forEach((s) => {
      s.items.forEach((it) => flat.push({ ...it, sectionTitle: s.title, accent: cluster.accent }));
    });
    return shuffle(flat);
  }, [sections, cluster.accent]);

  const [queue, setQueue] = useState(initialDeck);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState({ again: 0, good: 0, easy: 0 });

  useEffect(() => {
    setFlipped(false);
  }, [queue.length === 0 ? null : queue[0]?.key]);

  const total = initialDeck.length;
  const remaining = queue.length;
  const current = queue[0];

  const rate = (verdict) => {
    if (!current) return;
    setReviewed((r) => ({ ...r, [verdict]: r[verdict] + 1 }));

    if (verdict === 'again') {
      // Item stays in deck — sent to back so the student sees it again
      // before the session ends. No mastery change.
      setQueue((q) => [...q.slice(1), q[0]]);
    } else if (verdict === 'good') {
      onMasteryChange?.(current.key, 'learning');
      setQueue((q) => q.slice(1));
    } else if (verdict === 'easy') {
      onMasteryChange?.(current.key, 'known');
      setQueue((q) => q.slice(1));
    }
  };

  const restart = () => {
    setQueue(initialDeck);
    setReviewed({ again: 0, good: 0, easy: 0 });
    setFlipped(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-3 bg-gradient-to-r ${styles.headerTint} border-b border-gray-100 flex items-center justify-between`}>
          <div>
            <div className={`text-[10px] uppercase tracking-wide font-bold ${styles.text}`}>
              Flashcards · {cluster.label}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {remaining > 0 ? `${total - remaining + 1} of ${total}` : `${total} reviewed`}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-white"
            aria-label="Close flashcards"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full ${styles.pill}`}
            style={{ width: `${total === 0 ? 0 : ((total - remaining) / total) * 100}%` }}
          />
        </div>

        {/* Body */}
        {current ? (
          <div className="p-5">
            <div className="text-[10px] uppercase tracking-wide font-semibold text-gray-400 mb-2">
              {current.sectionTitle}
            </div>

            {/* Card face */}
            <button
              type="button"
              onClick={() => setFlipped((v) => !v)}
              className={`w-full min-h-[180px] rounded-xl border-2 ${flipped ? 'border-gray-200 bg-gray-50' : 'border-dashed border-gray-300 bg-white'} p-5 text-left flex flex-col justify-center transition`}
            >
              {!flipped ? (
                <>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">{current.headword}</span>
                    {current.pronounceable && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSpeak?.(current.headword);
                        }}
                        className="p-1.5 rounded text-gray-400 hover:text-gray-700 hover:bg-white"
                        aria-label={`Pronounce ${current.headword}`}
                      >
                        <Volume2 className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  {current.subtitle && (
                    <span className={`text-[11px] uppercase tracking-wide font-semibold ${styles.text}`}>
                      {current.subtitle}
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mt-4">Tap card to reveal meaning</p>
                </>
              ) : (
                <>
                  <span className="text-base font-semibold text-gray-900 mb-2">{current.headword}</span>
                  {current.meaning && (
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">{current.meaning}</p>
                  )}
                  {current.example && (
                    <p className={`text-xs italic ${styles.text} leading-relaxed`}>
                      &ldquo;{current.example}&rdquo;
                    </p>
                  )}
                  {current.extras?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {current.extras.map((extra, i) => (
                        <p key={i} className="text-[11px] text-gray-600">
                          <span className={`uppercase tracking-wide font-semibold ${styles.text} mr-1`}>
                            {extra.label}:
                          </span>
                          {extra.value}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </button>

            {/* Rating */}
            {flipped ? (
              <div className="grid grid-cols-3 gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => rate('again')}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100"
                >
                  Again
                </button>
                <button
                  type="button"
                  onClick={() => rate('good')}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100"
                >
                  Got it
                </button>
                <button
                  type="button"
                  onClick={() => rate('easy')}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                >
                  Easy
                </button>
              </div>
            ) : (
              <div className="mt-4 text-center text-xs text-gray-500">
                Recall the meaning before flipping for stronger retention.
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="text-base font-bold text-gray-900 mb-1">Deck complete</div>
            <p className="text-xs text-gray-600 mb-4">
              {reviewed.easy} easy · {reviewed.good} got it · {reviewed.again} again
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={restart}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${styles.pill}`}
              >
                Back to cards <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
