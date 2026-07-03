import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Check, ChevronDown, Lightbulb, MapPin, Inbox,
} from 'lucide-react';
import {
  SKILL_LABELS, categorizeSkill, resolvePartNumber, PART_COLOR_KEYS, PART_TONES,
} from '../lib';

// =============================================================================
// QUESTION ROW + LIST
// =============================================================================

function buildEvidenceSnippet(transcriptText, evidence) {
  if (!transcriptText || !evidence) return null;
  const idx = transcriptText.indexOf(evidence);
  if (idx === -1) return { before: '', match: evidence, after: '', truncated: false };
  const beforeStart = Math.max(0, idx - 120);
  const afterEnd = Math.min(transcriptText.length, idx + evidence.length + 120);
  return {
    before: (beforeStart > 0 ? '… ' : '') + transcriptText.slice(beforeStart, idx),
    match: evidence,
    after: transcriptText.slice(idx + evidence.length, afterEnd) + (afterEnd < transcriptText.length ? ' …' : ''),
    truncated: true,
  };
}

function QuestionRow({ q, partNum, idx, expanded, onToggle, transcript }) {
  const isCorrect = !!q.is_correct;
  const skillKey = categorizeSkill(q.question_type);
  const skillName = SKILL_LABELS[skillKey]?.name || (q.question_type || 'Question').replace(/_/g, ' ');
  const userAns = q.user_answer ?? '—';
  const correctAns = q.correct_answer ?? '—';
  const evidenceText = q.evidence_text || q.transcript_excerpt || '';
  const strategy = q.skill_tip || q.explanation || '';
  const options = q.options;
  const colorKey = PART_COLOR_KEYS[(partNum - 1) % 4];
  const tone = PART_TONES[colorKey];
  const snippet = expanded ? buildEvidenceSnippet(transcript || '', evidenceText) : null;
  const qNumber = q.question_number ?? q.question_id ?? idx + 1;

  return (
    <div className={`border-2 rounded-2xl bg-white transition-all ${expanded ? 'border-emerald-500 shadow-sm' : 'border-gray-200'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {qNumber}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold text-gray-900">{skillName}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${tone.chip}`}>Part {partNum}</span>
            </div>
            {q.question_text ? (
              <div className="text-sm text-gray-600 truncate">{q.question_text}</div>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            {isCorrect ? (
              <div className="text-sm font-medium text-emerald-600 flex items-center gap-1 justify-end"><Check className="w-4 h-4" />Correct</div>
            ) : (
              <div className="text-sm font-medium text-red-600 flex items-center gap-1 justify-end"><X className="w-4 h-4" />Wrong</div>
            )}
            <div className="text-xs text-gray-500">
              {isCorrect ? `Your: ${String(userAns)}` : `Your: ${String(userAns)} | Correct: ${String(correctAns)}`}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {expanded && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Model Answer</h4>
              <div className="space-y-3">
                {options ? (
                  <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-700 leading-relaxed">
                    <strong>Options:</strong> {String(options)}
                  </div>
                ) : null}
                <div className={`p-3 rounded-lg ${isCorrect ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                  <div className={`text-sm font-medium flex items-center gap-2 ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                    {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    Your Answer: {String(userAns)}
                  </div>
                </div>
                {!isCorrect && (
                  <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                    <div className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4" />Correct Answer: {String(correctAns)}
                    </div>
                  </div>
                )}
              </div>
              {strategy ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Strategy</h5>
                  <p className="text-xs text-blue-700 leading-relaxed">{strategy}</p>
                </div>
              ) : null}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Locate in Audioscript — Part {partNum}
              </h4>
              <div className="p-4 bg-gray-50 rounded-lg text-sm leading-relaxed">
                {snippet ? (
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {snippet.before}
                    <span className="bg-emerald-100 px-1.5 py-0.5 rounded font-medium">{snippet.match}</span>
                    {snippet.after}
                  </p>
                ) : evidenceText ? (
                  <p className="text-gray-800 leading-relaxed">{evidenceText}</p>
                ) : (
                  <p className="text-gray-500 italic">Audioscript excerpt not available for this question.</p>
                )}
              </div>
              {evidenceText ? (
                <div className="mt-2 p-2 bg-emerald-100 rounded-lg">
                  <span className="text-xs text-emerald-800 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> Where the answer was said</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionList({ items, transcripts, totalCount, autoOpenFirst = true }) {
  const annotated = useMemo(
    () => items.map((q, i) => ({
      q,
      idx: i,
      partNum: resolvePartNumber(q, totalCount),
    })),
    [items, totalCount]
  );
  const [openId, setOpenId] = useState(() => (autoOpenFirst && annotated[0] ? annotated[0].q.question_id ?? 0 : null));
  useEffect(() => {
    if (!annotated.length) { setOpenId(null); return; }
    const stillThere = annotated.some(({ q }) => (q.question_id ?? null) === openId);
    if (!stillThere) setOpenId(autoOpenFirst ? annotated[0].q.question_id ?? null : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotated.length]);

  if (!annotated.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p>No questions match this filter.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40">
      <div
        className="space-y-3 p-3 overflow-y-auto questions-window-l"
        style={{ maxHeight: 560 }}
      >
        {annotated.map(({ q, idx, partNum }) => {
          const id = q.question_id ?? idx;
          const expanded = id === openId;
          const tx = transcripts ? (transcripts[partNum] || transcripts[`part${partNum}`] || transcripts.full) : '';
          return (
            <QuestionRow
              key={id}
              q={q}
              idx={idx}
              partNum={partNum}
              expanded={expanded}
              onToggle={() => setOpenId(expanded ? null : id)}
              transcript={tx || ''}
            />
          );
        })}
      </div>
    </div>
  );
}

export { QuestionList };
