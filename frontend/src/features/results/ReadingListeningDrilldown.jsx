import React from 'react';
import { Card } from '../../components/ui/card';
import {
  CheckCircle,
  XCircle,
  BarChart3,
  Lightbulb,
  FileText,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import { useI18n } from '../../lib/i18n';

// iOS 26 design tokens — same vocabulary as D9 Question Bank +
// CambridgeTestResults / FullTestResults pages.
const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  muted: '220 10% 45%',
  border: '210 30% 92%',
  surface: '210 40% 98%',
};

/**
 * Self-contained Reading / Listening drilldown card extracted from
 * Results.js (lines 465-664). Used by:
 *   - pages/Results.js                (QB / mastery flow)
 *   - pages/CambridgeTestResults.js   (full Cambridge test, both skills)
 *   - pages/FullTestResults.js        (generic Full Test)
 *
 * Inputs:
 *   testType  — "reading" | "listening". Drives passage- vs part-grouping
 *               and whether the listening transcript reveal renders.
 *   feedback  — { question_results: [...], correct, total, percentage,
 *               transcript? }. Server totals are authoritative — the
 *               summary footer reads from feedback.correct/total/percentage,
 *               NOT from a client-side filter on question_results, because
 *               multi-MCQ ("select TWO") groups have a binary is_correct
 *               flag per item but score as a single set-equality unit on
 *               the server, so client-counting produces a different total.
 */
export default function ReadingListeningDrilldown({ testType, feedback }) {
  const { t, language } = useI18n();
  const getText = (en, vi, tr) => {
    if (language === 'vi') return vi;
    if (language === 'tr') return tr;
    return en;
  };

  if (!feedback || !Array.isArray(feedback.question_results) || feedback.question_results.length === 0) {
    return null;
  }

  const groupKey = testType === 'reading' ? 'passage' : 'part';
  const groupLabel = testType === 'reading' ? 'Passage' : 'Part';
  const groups = feedback.question_results.reduce((acc, q) => {
    const key = q[groupKey] ?? null;
    if (!acc.has(key)) acc.set(key, []);
    acc.get(key).push(q);
    return acc;
  }, new Map());
  const showGroupHeaders = groups.size > 1 || (groups.size === 1 && [...groups.keys()][0] !== null);

  return (
    <Card
      className="px-5 py-4 mb-5 bg-white border-0 shadow-sm rounded-2xl"
      style={{ border: `1px solid hsl(${T.border})` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `hsl(${T.brand} / 0.10)` }}
          >
            <BarChart3 className="w-4 h-4" style={{ color: `hsl(${T.brandDark})` }} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{t('answerReview')}</h3>
            <p className="text-xs text-gray-500">
              {feedback.correct ?? 0} {t('correct').toLowerCase()} / {feedback.total ?? 0} {getText('total', 'tổng cộng', 'toplam')}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-2.5 h-2.5" /> {t('correct')}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
            <XCircle className="w-2.5 h-2.5" /> {t('incorrect')}
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {[...groups.entries()].map(([groupId, items]) => {
          const groupCorrect = items.filter((q) => q.is_correct).length;
          return (
            <div key={`group-${groupId ?? 'all'}`} className="space-y-2">
              {showGroupHeaders && groupId !== null && (
                <div
                  className="sticky top-0 z-10 -mx-1 px-2 py-1.5 backdrop-blur flex items-center justify-between rounded-md"
                  style={{ background: 'hsl(0 0% 100% / 0.95)', borderBottom: `1px solid hsl(${T.border})` }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                    {groupLabel} {groupId}
                  </h4>
                  <span className="text-[11px] text-gray-500">
                    {groupCorrect}/{items.length} {t('correct').toLowerCase()}
                  </span>
                </div>
              )}
              {items.map((q, idx) => {
                const ok = q.is_correct;
                const accent = ok ? 'emerald' : 'rose';
                return (
                  <div
                    key={`q-${groupId ?? 'all'}-${q.question_id ?? idx}`}
                    className="rounded-2xl bg-white p-3.5 transition-shadow hover:shadow-sm"
                    style={{ border: `1px solid hsl(${T.border})` }}
                  >
                    {/* Header row: number badge + type chip + status icon */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-semibold ${
                          ok ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {q.question_id}
                      </span>
                      <span
                        className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-md text-gray-600 font-medium"
                        style={{ background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})` }}
                      >
                        {q.question_type?.replace(/_/g, ' ') || 'Question'}
                      </span>
                      <span className="ml-auto">
                        {ok ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </span>
                    </div>

                    {q.question_text && (
                      <p className="text-sm text-gray-800 mb-2.5 leading-relaxed">{q.question_text}</p>
                    )}

                    {/* Answer comparison — paired chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
                      <div
                        className="rounded-lg px-2.5 py-1.5"
                        style={{ background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})` }}
                      >
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">{t('yourAnswer')}</p>
                        <p className={`text-sm font-semibold ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {Array.isArray(q.user_answer) ? q.user_answer.join(', ') : (q.user_answer || t('noAnswer'))}
                        </p>
                      </div>
                      <div
                        className="rounded-lg px-2.5 py-1.5"
                        style={{ background: `hsl(${T.brand} / 0.06)`, border: `1px solid hsl(${T.brand} / 0.18)` }}
                      >
                        <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: `hsl(${T.brandDark})` }}>{t('correctAnswer')}</p>
                        <p className="text-sm font-semibold" style={{ color: `hsl(${T.brandDark})` }}>
                          {Array.isArray(q.correct_answer) ? q.correct_answer.join(', ') : q.correct_answer}
                        </p>
                      </div>
                    </div>

                    {!ok && q.reason_label && (
                      <div className="mb-2">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full text-rose-700 font-medium"
                          style={{ background: 'hsl(350 80% 96%)', border: '1px solid hsl(350 70% 88%)' }}
                        >
                          {q.reason_label}
                        </span>
                      </div>
                    )}

                    {/* Info chips: passage evidence / explanation / skill tip */}
                    <div className="space-y-1.5">
                      {(q.passage_excerpt || q.evidence_text) && (
                        <div
                          className="rounded-lg px-2.5 py-2 flex items-start gap-2"
                          style={{ background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})` }}
                        >
                          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: `hsl(${T.muted})` }} />
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: `hsl(${T.muted})` }}>
                              {t('locateInPassage') || 'Located in Passage'}
                            </p>
                            <p className="text-xs text-gray-700 italic leading-relaxed">&ldquo;...{q.passage_excerpt || q.evidence_text}...&rdquo;</p>
                          </div>
                        </div>
                      )}

                      {q.explanation && (
                        <div
                          className="rounded-lg px-2.5 py-2 flex items-start gap-2"
                          style={{ background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})` }}
                        >
                          <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: `hsl(${T.muted})` }} />
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: `hsl(${T.muted})` }}>
                              {t('explanation') || 'Explanation'}
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">{q.explanation}</p>
                          </div>
                        </div>
                      )}

                      {q.skill_tip && (
                        <div
                          className="rounded-lg px-2.5 py-2 flex items-start gap-2"
                          style={{ background: `hsl(${T.brand} / 0.05)`, border: `1px solid hsl(${T.brand} / 0.18)` }}
                        >
                          <GraduationCap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: `hsl(${T.brandDark})` }} />
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: `hsl(${T.brandDark})` }}>
                              {t('skillTip') || 'Skill Tip'}
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">{q.skill_tip}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {testType === 'listening' && feedback.transcript && (
        <details className="mt-3 group">
          <summary
            className="cursor-pointer text-xs font-semibold flex items-center gap-1.5 select-none"
            style={{ color: `hsl(${T.brandDark})` }}
          >
            <FileText className="w-3.5 h-3.5" />
            {getText('Show full transcript', 'Hiển thị bản ghi đầy đủ', 'Tam dökümü göster')}
          </summary>
          <div
            className="mt-2 px-3 py-2 rounded-xl max-h-80 overflow-y-auto"
            style={{ background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})` }}
          >
            <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
              {feedback.transcript}
            </p>
          </div>
        </details>
      )}

      {/* Compact summary footer */}
      <div
        className="mt-3 pt-3 grid grid-cols-3 gap-2 text-center"
        style={{ borderTop: `1px solid hsl(${T.border})` }}
      >
        <div className="px-2 py-1.5 rounded-lg" style={{ background: 'hsl(150 60% 96%)' }}>
          <p className="text-lg font-bold text-emerald-600 leading-none">{feedback.correct ?? 0}</p>
          <p className="text-[10px] text-emerald-700 mt-1">{t('correct')}</p>
        </div>
        <div className="px-2 py-1.5 rounded-lg" style={{ background: 'hsl(350 80% 97%)' }}>
          <p className="text-lg font-bold text-rose-600 leading-none">{(feedback.total ?? 0) - (feedback.correct ?? 0)}</p>
          <p className="text-[10px] text-rose-700 mt-1">{t('incorrect')}</p>
        </div>
        <div className="px-2 py-1.5 rounded-lg" style={{ background: `hsl(${T.brand} / 0.08)` }}>
          <p className="text-lg font-bold leading-none" style={{ color: `hsl(${T.brandDark})` }}>
            {Math.round(
              feedback.percentage ??
                (feedback.total ? (feedback.correct / feedback.total) * 100 : 0)
            )}%
          </p>
          <p className="text-[10px] mt-1" style={{ color: `hsl(${T.brandDark})` }}>{t('accuracy')}</p>
        </div>
      </div>
    </Card>
  );
}
