import React from 'react';

// ============ READING SECTION (IELTS STYLE - SPLIT SCREEN) ============
export default function ReadingSection({
  testData,
  currentPassage,
  highlights,
  notes,
  setHighlights,
  setNotes,
  removeHighlight,
  renderTextWithHighlights,
  handleTextSelection,
  sectionAnswers,
  updateAnswer,
}) {
  const reading = testData?.sections?.reading;
  const passage = reading?.passages?.[currentPassage];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Pane - Passage */}
      <div
        className="w-1/2 border-r border-slate-300 overflow-auto bg-white p-6"
        onContextMenu={handleTextSelection}
      >
        <h2 className="text-xl font-bold text-slate-900 mb-2">Part {currentPassage + 1}</h2>
        <p className="text-slate-600 mb-4">Read the text below and answer the questions.</p>

        <h3 className="text-lg font-bold text-slate-800 mb-4">{passage?.title}</h3>

        {/* Highlights & Notes Panel */}
        {(highlights.filter(h => h.section === 'reading').length > 0 || notes.filter(n => n.section === 'reading').length > 0) && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-800">Your Highlights & Notes</span>
              <button
                onClick={() => {
                  setHighlights(prev => prev.filter(h => h.section !== 'reading'));
                  setNotes(prev => prev.filter(n => n.section !== 'reading'));
                }}
                className="text-xs text-amber-600 hover:text-amber-800"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-1 max-h-32 overflow-auto">
              {highlights.filter(h => h.section === 'reading').map(h => {
                const relatedNote = notes.find(n => n.id === h.id);
                return (
                  <div key={h.id} className="flex items-start gap-2 text-xs">
                    <span className={`px-1 rounded ${relatedNote ? 'bg-blue-200' : 'bg-yellow-200'}`}>
                      {h.text.substring(0, 30)}...
                    </span>
                    {relatedNote && (
                      <span className="text-slate-600 italic">&quot;{relatedNote.note}&quot;</span>
                    )}
                    <button
                      onClick={() => removeHighlight(h.id)}
                      className="text-red-500 hover:text-red-700 ml-auto"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed select-text">
          {passage?.text?.split('\n\n').map((para, idx) => {
            const highlightedPara = renderTextWithHighlights(para, 'reading');
            return (
              <p
                key={idx}
                className="mb-4"
                dangerouslySetInnerHTML={{
                  __html: /^[A-Z]\s/.test(highlightedPara)
                    ? `<strong class="text-slate-900">${highlightedPara.charAt(0)}</strong>${highlightedPara.slice(1)}`
                    : highlightedPara
                }}
              />
            );
          })}
        </div>

        {/* Tip for highlighting */}
        <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-500">
          💡 Tip: Select text and right-click to highlight or add notes
        </div>
      </div>

      {/* Right Pane - Questions */}
      <div className="w-1/2 overflow-auto bg-slate-50 p-6">
        <div className="space-y-6">
          {passage?.questions?.map((q, idx) => {
            const qNumMatch = q.id.match(/Q(\d+)/);
            const questionNum = qNumMatch ? qNumMatch[1] : idx + 1;

            return (
              <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-200">
                <div className="flex gap-3">
                  <span className="font-bold text-slate-900 min-w-[32px]">{questionNum}.</span>
                  <div className="flex-1">
                    <p className="text-slate-700 mb-3">{q.question}</p>

                    {q.type === 'true_false_ng' || q.type === 'yes_no_ng' ? (
                      <div className="space-y-2">
                        {(q.type === 'true_false_ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={sectionAnswers.reading[q.id] === opt}
                              onChange={(e) => updateAnswer('reading', q.id, e.target.value)}
                              className="w-4 h-4 text-blue-500"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : q.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => (
                          <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={q.id}
                              value={opt.charAt(0)}
                              checked={sectionAnswers.reading[q.id] === opt.charAt(0)}
                              onChange={(e) => updateAnswer('reading', q.id, e.target.value)}
                              className="w-4 h-4 text-blue-500"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={sectionAnswers.reading[q.id] || ''}
                        onChange={(e) => updateAnswer('reading', q.id, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-blue-300 rounded focus:border-blue-500 focus:outline-none"
                        placeholder="Type your answer..."
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
