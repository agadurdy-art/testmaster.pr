import React from 'react';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Highlighter, StickyNote, X, ListChecks } from 'lucide-react';

// Reading section: two-pane passage + questions layout, highlight/notes
// context menu and every reading question renderer. Extracted verbatim from
// renderReadingSection in pages/CambridgeTestInterface.js; closed-over
// values became same-named props.
export default function ReadingSection({
  sectionData,
  currentPart,
  setCurrentPart,
  answers,
  setAnswers,
  handleAnswerChange,
  renderGapFill,
  highlights,
  setHighlights,
  notes,
  setNotes,
  deleteHighlight,
  handleTextSelection,
  contextMenu,
  setContextMenu,
  addHighlight,
  addNoteToHighlight,
  getAnsweredCount,
  setShowReviewPanel,
}) {
    const passages = sectionData?.passages || [];
    const currentPassage = passages[currentPart];
    
    if (!currentPassage) return null;

    return (
      <div className="flex h-[calc(100vh-200px)] relative">
        {/* Left Pane - Passage with Highlighter */}
        <div 
          className="w-1/2 border-r border-slate-300 overflow-auto bg-white p-6"
          onContextMenu={handleTextSelection}
        >
          {/* Passage Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-100 text-green-700">Passage {currentPassage.passage_number}</Badge>
            <div className="flex gap-1">
              {passages.map((_, idx) => (
                <Button
                  key={idx}
                  variant={currentPart === idx ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPart(idx)}
                  className={currentPart === idx ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  P{idx + 1}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Highlights & Notes Panel */}
          {highlights.filter(h => h.section === 'reading').length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-amber-800 flex items-center gap-2">
                  <Highlighter className="w-4 h-4" /> Your Highlights
                </span>
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
              <div className="space-y-1 max-h-24 overflow-auto">
                {highlights.filter(h => h.section === 'reading').map(h => {
                  const relatedNote = notes.find(n => n.id === h.id);
                  return (
                    <div key={h.id} className="flex items-start gap-2 text-xs">
                      <span className={`px-1 rounded flex-1 ${h.color === 'blue' ? 'bg-blue-200' : 'bg-yellow-200'}`}>
                        &ldquo;{h.text.substring(0, 50)}...&rdquo;
                      </span>
                      {relatedNote && (
                        <span className="text-gray-500 italic max-w-[100px] truncate">
                          📝 {relatedNote.note}
                        </span>
                      )}
                      <button onClick={() => deleteHighlight(h.id)} className="text-red-500 hover:text-red-700">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold text-slate-800 mb-4">{currentPassage.title}</h3>
          {currentPassage.subtitle && (
            <p className="text-sm text-gray-500 italic mb-4">{currentPassage.subtitle}</p>
          )}
          
          {/* Passage Text - Selectable */}
          <div className="prose prose-sm max-w-none select-text">
            {(currentPassage.text || currentPassage.passage_text)?.split('\n\n').map((para, idx) => {
              // Check if paragraph starts with a section heading (A, B, C, etc.)
              const headingMatch = para.match(/^([A-Z])\n/);
              const isHeading = headingMatch !== null;
              const headingLetter = headingMatch ? headingMatch[1] : null;
              const paragraphText = isHeading ? para.substring(2) : para;
              
              // Check if any highlights exist in this paragraph
              const paraHighlights = highlights.filter(h => 
                h.section === 'reading' && para.includes(h.text)
              );
              
              let displayText = paragraphText;
              paraHighlights.forEach(h => {
                const color = h.color === 'blue' ? 'bg-blue-200' : 'bg-yellow-200';
                displayText = displayText.replace(
                  h.text,
                  `<mark class="${color} px-0.5 rounded">${h.text}</mark>`
                );
              });
              
              return (
                <div key={idx} className="mb-4">
                  {isHeading && (
                    <h3 className="font-bold text-lg text-green-700 mb-2">{headingLetter}</h3>
                  )}
                  <p 
                    className="text-gray-700 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{ __html: displayText }}
                  />
                </div>
              );
            })}
          </div>
          
          {/* Tip */}
          <div className="mt-4 p-2 bg-slate-100 rounded text-xs text-slate-500 flex items-center gap-2">
            <Highlighter className="w-4 h-4" />
            Tip: Select text and right-click to highlight or add notes
          </div>
        </div>

        {/* Right Pane - Questions */}
        <div className="w-1/2 overflow-auto bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-green-100 text-green-700">Questions {currentPassage.question_range}</Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowReviewPanel(true)}
              className="flex items-center gap-2"
            >
              <ListChecks className="w-4 h-4" />
              Review ({getAnsweredCount('reading')}/40)
            </Button>
          </div>

          {currentPassage.questions?.map((q, qIdx) => (
            <div key={qIdx} id={`question-${q.number}`} className="mb-6">
              {/* Note Completion */}
              {q.type === 'note_completion' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  {q.instruction && <p className="text-sm text-green-700 font-medium mb-3">{q.instruction}</p>}
                  {q.visual ? (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">{q.visual.title}</h5>
                      {q.visual.sections?.map((section, sIdx) => (
                        <div key={sIdx}>
                          <h6 className="font-medium text-gray-700 text-sm mb-2">{section.heading}</h6>
                          <ul className="space-y-2">
                            {section.items?.map((item, itemIdx) => (
                              <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                                <span className="text-gray-400">•</span>
                                <span className="flex-1">
                                  {item.includes('___') ? renderGapFill(item) : item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Single question format - text input */
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-600">{q.number}.</span>
                      <span className="text-sm">{q.question_text}</span>
                      <input
                        type="text"
                        value={answers[`reading_${q.number}`] || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        className="flex-1 max-w-[200px] px-3 py-2 border rounded-lg text-sm"
                        placeholder="Your answer"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* True/False/Not Given */}
              {q.type === 'true_false_not_given' && (
                <div className="space-y-3">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Handle grouped statements OR single question */}
                  {(q.statements || q.items) ? (
                    (q.statements || q.items).map((stmt, sIdx) => (
                      <div key={sIdx} className="p-4 bg-white border rounded-lg">
                        <p className="text-sm mb-3">{stmt.number}. {stmt.statement}</p>
                        <div className="flex gap-4">
                          {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`reading_q${stmt.number}`}
                                value={opt}
                                checked={answers[`reading_${stmt.number}`] === opt}
                                onChange={(e) => handleAnswerChange(stmt.number, e.target.value)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm font-medium">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Single question format */
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-sm mb-3">{q.number}. {q.statement}</p>
                      <div className="flex gap-4">
                        {['TRUE', 'FALSE', 'NOT GIVEN'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt}
                              checked={answers[`reading_${q.number}`] === opt}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Yes/No/Not Given */}
              {q.type === 'yes_no_not_given' && (
                <div className="space-y-3">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Handle grouped statements OR single question */}
                  {(q.statements || q.items) ? (
                    (q.statements || q.items).map((stmt, sIdx) => (
                      <div key={sIdx} className="p-4 bg-white border rounded-lg">
                        <p className="text-sm mb-3">{stmt.number}. {stmt.statement}</p>
                        <div className="flex gap-4">
                          {['YES', 'NO', 'NOT GIVEN'].map(opt => (
                            <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`reading_q${stmt.number}`}
                                value={opt}
                                checked={answers[`reading_${stmt.number}`] === opt}
                                onChange={(e) => handleAnswerChange(stmt.number, e.target.value)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm font-medium">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Single question format */
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-sm mb-3">{q.number}. {q.statement}</p>
                      <div className="flex gap-4">
                        {['YES', 'NO', 'NOT GIVEN'].map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt}
                              checked={answers[`reading_${q.number}`] === opt}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Section Matching */}
              {q.type === 'section_matching' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-center gap-3">
                      <span className="font-bold text-green-600 w-8">{item.number}.</span>
                      <span className="text-sm flex-1">{item.item}</span>
                      <select
                        value={answers[`reading_${item.number}`] || ''}
                        onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm"
                      >
                        <option value="">-</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Information */}
              {q.type === 'matching_information' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-start gap-3">
                      <span className="font-bold text-green-600 w-8 flex-shrink-0">{item.number}.</span>
                      <span className="text-sm flex-1">{item.text || item.question_text}</span>
                      <select
                        value={answers[`reading_${item.number}`] || ''}
                        onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm flex-shrink-0"
                      >
                        <option value="">-</option>
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Matching Features (Researcher/Person Matching) */}
              {q.type === 'matching_features' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {/* Options title and list if provided */}
                  {(q.options_title || q.researchers) && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-sm mb-2 text-green-800">{q.options_title || 'List of Researchers'}</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="text-gray-700">{opt}</div>
                        ))}
                        {q.researchers?.map((r, rIdx) => (
                          <div key={rIdx} className="text-gray-700">
                            <span className="font-bold">{r.letter}</span> - {r.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {q.items?.map((item, iIdx) => (
                    <div key={iIdx} className="p-3 bg-white border rounded-lg flex items-start gap-3">
                      <span className="font-bold text-green-600 w-8 flex-shrink-0">{item.number}.</span>
                      <span className="text-sm flex-1">{item.statement || item.text}</span>
                      <select
                        value={answers[`reading_${item.number}`] || ''}
                        onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-sm flex-shrink-0"
                      >
                        <option value="">-</option>
                        {/* Support both researchers array and options array */}
                        {q.researchers?.map(r => (
                          <option key={r.letter} value={r.letter}>{r.letter}</option>
                        ))}
                        {!q.researchers && q.options?.map((opt, oIdx) => {
                          const letter = opt.charAt(0);
                          return <option key={letter} value={letter}>{letter}</option>;
                        })}
                        {!q.researchers && !q.options && ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Sentence Completion */}
              {q.type === 'sentence_completion' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.title && <h5 className="font-semibold text-gray-800">{q.title}</h5>}
                  {(q.sentences || q.items)?.map((sent, sIdx) => {
                    const sentText = sent.text || sent.sentence || '';
                    // Replace simple _____ with numbered format ___N___
                    const normalizedText = sentText.replace(/_____+/g, `___${sent.number}___`);
                    
                    return (
                      <div key={sIdx} className="p-3 bg-white border rounded-lg flex items-start gap-2">
                        <span className="font-bold text-green-600 shrink-0">{sent.number}.</span>
                        <span className="text-sm flex-1">
                          {normalizedText.includes('___') ? (
                            normalizedText.split(/___(\d+)___/).map((part, pIdx) => {
                              if (/^\d+$/.test(part)) {
                                return (
                                  <input
                                    key={pIdx}
                                    type="text"
                                    value={answers[`reading_${part}`] || ''}
                                    onChange={(e) => handleAnswerChange(part, e.target.value)}
                                    className="w-32 mx-1 px-3 py-1 border-2 border-green-300 rounded-lg focus:border-green-600 focus:ring-2 focus:ring-green-200 outline-none bg-white text-center font-medium"
                                    placeholder={part}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck="false"
                                  />
                                );
                              }
                              return <span key={pIdx}>{part}</span>;
                            })
                          ) : (
                            <>
                              {sentText}
                              <input
                                type="text"
                                value={answers[`reading_${sent.number}`] || ''}
                                onChange={(e) => handleAnswerChange(sent.number, e.target.value)}
                                className="w-32 ml-2 px-2 py-1 border-b-2 border-green-300 focus:border-green-600 outline-none"
                                placeholder="answer"
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck="false"
                              />
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table Completion */}
              {q.type === 'table_completion' && (
                <div className="space-y-3">
                  <p className="text-sm text-green-700 font-medium">{q.instruction}</p>
                  {q.title && <h5 className="font-semibold text-gray-800 text-center">{q.title}</h5>}
                  {q.table && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-green-50">
                            {q.table.headers?.map((header, hIdx) => (
                              <th key={hIdx} className="border border-green-200 px-3 py-2 text-left font-semibold text-green-800">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {q.table.rows?.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="border border-green-200 px-3 py-2 font-medium text-gray-700">
                                {row.label}
                              </td>
                              {row.cells?.map((cell, cIdx) => (
                                <td key={cIdx} className="border border-green-200 px-3 py-2 text-gray-700">
                                  {cell.includes('___') ? (
                                    <span>
                                      {cell.split(/___(\d+)___/).map((part, pIdx) => {
                                        if (/^\d+$/.test(part)) {
                                          return (
                                            <input
                                              key={pIdx}
                                              type="text"
                                              value={answers[`reading_${part}`] || ''}
                                              onChange={(e) => handleAnswerChange(part, e.target.value)}
                                              className="mx-1 px-2 py-1 border-b-2 border-green-400 bg-green-50 text-center w-24 focus:outline-none focus:border-green-600"
                                              placeholder={part}
                                            />
                                          );
                                        }
                                        return <span key={pIdx}>{part}</span>;
                                      })}
                                    </span>
                                  ) : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Completion */}
              {q.type === 'summary_completion' && (
                <div className="space-y-3">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Word box - supports both formats */}
                  {(q.options || q.word_box) && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-sm mb-2 text-green-800">Word List</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx}>{opt}</div>
                        ))}
                        {q.word_box?.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="text-gray-700">
                            <span className="font-bold">{opt.letter}</span> - {opt.word}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Title if present */}
                  {q.title && (
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <h5 className="font-bold text-center text-gray-900">{q.title}</h5>
                    </div>
                  )}
                  {/* Summary text - supports both formats */}
                  {(q.summary || q.summary_text) ? (
                    <div className="p-4 bg-white border rounded-lg">
                      {(q.summary?.title || q.title) && <h5 className="font-semibold mb-2">{q.summary?.title || q.title}</h5>}
                      <p className="text-sm leading-relaxed">
                        {(() => {
                          let text = q.summary?.text || q.summary_text;
                          // Normalize "31 _____" format to "___31___" format
                          text = text.replace(/(\d+)\s+_____/g, '___$1___');
                          // Also normalize "___6___" style (already correct) - no-op
                          return text.split(/___(\d+)___/).map((part, pIdx) => {
                          if (/^\d+$/.test(part)) {
                            const wordOptions = q.word_box?.options || q.options || [];
                            // If no word options, use text input (ONE WORD ONLY from passage)
                            if (wordOptions.length === 0) {
                              return (
                                <input
                                  key={pIdx}
                                  type="text"
                                  placeholder={part}
                                  value={answers[`reading_${part}`] || ''}
                                  onChange={(e) => handleAnswerChange(part, e.target.value)}
                                  className="mx-1 px-2 py-1 border-b-2 border-green-400 bg-green-50 text-center w-24 focus:outline-none focus:border-green-600"
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck="false"
                                />
                              );
                            }
                            // If word options provided, use dropdown
                            return (
                              <select
                                key={pIdx}
                                value={answers[`reading_${part}`] || ''}
                                onChange={(e) => handleAnswerChange(part, e.target.value)}
                                className="mx-1 px-2 py-1 border rounded text-sm"
                              >
                                <option value="">({part})</option>
                                {Array.isArray(wordOptions) && wordOptions[0]?.letter
                                  ? wordOptions.map(opt => (
                                      <option key={opt.letter} value={opt.letter}>{opt.letter}</option>
                                    ))
                                  : wordOptions.map((opt, idx) => (
                                      <option key={idx} value={opt}>{opt}</option>
                                    ))
                                }
                              </select>
                            );
                          }
                          return <span key={pIdx}>{part}</span>;
                        });
                        })()}
                      </p>
                    </div>
                  ) : (
                    /* Single question format - just text input */
                    <div className="p-4 bg-white border rounded-lg flex items-center gap-3">
                      <span className="font-bold text-green-600">{q.number}.</span>
                      <span className="text-sm flex-1">{q.question_text}</span>
                      <input
                        type="text"
                        value={answers[`reading_${q.number}`] || ''}
                        onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                        className="w-32 px-3 py-2 border rounded-lg text-sm"
                        placeholder="Your answer"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Choice - Reading */}
              {q.type === 'multiple_choice' && (
                <div className="space-y-4">
                  {q.instruction && <p className="text-sm text-green-700 font-medium">{q.instruction}</p>}
                  {/* Handle grouped questions OR single question */}
                  {(q.questions || q.items) ? (
                    (q.questions || q.items).map((mcq, mIdx) => (
                      <div key={mIdx} className="p-4 bg-white border rounded-lg">
                        <p className="text-sm font-medium mb-3">{mcq.number}. {mcq.question || mcq.question_text}</p>
                        <div className="space-y-2">
                          {mcq.options?.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                              <input
                                type="radio"
                                name={`reading_q${mcq.number}`}
                                value={opt.charAt(0)}
                                checked={answers[`reading_${mcq.number}`] === opt.charAt(0)}
                                onChange={(e) => handleAnswerChange(mcq.number, e.target.value)}
                                className="w-4 h-4 text-green-600"
                              />
                              <span className="text-sm">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Single question format */
                    <div className="p-4 bg-white border rounded-lg">
                      <p className="text-sm font-medium mb-3">{q.number}. {q.question || q.question_text}</p>
                      <div className="space-y-2">
                        {q.options?.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt.charAt(0)}
                              checked={answers[`reading_${q.number}`] === opt.charAt(0)}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Selection - Reading */}
              {q.type === 'multiple_selection' && (
                <div className="p-4 bg-white border rounded-lg">
                  <p className="text-xs text-green-600 font-medium mb-1">{q.instruction}</p>
                  <p className="text-sm font-medium mb-3"><span className="text-green-700 font-bold">{q.number}.</span> {q.question_text || q.question}</p>
                  {/* Show which question numbers to fill */}
                  {q.items && (
                    <p className="text-xs text-gray-500 mb-2">
                      Questions {q.items.map(i => i.number).join(' and ')}: Select {q.select_count || 2} answers
                    </p>
                  )}
                  <div className="space-y-2">
                    {(() => {
                      // Persist the same answer array under every question_id in
                      // the group so per-question results (Your answer: ...) can
                      // resolve, not just the first item. Backend scoring is
                      // group-aware (Bug #150) — this fixes the display side.
                      const groupNumbers = q.items
                        ? q.items.map(i => i.number)
                        : String(q.number).includes('-')
                          ? (() => { const [s, e] = String(q.number).split('-').map(n => parseInt(n, 10)); return Array.from({ length: e - s + 1 }, (_, i) => s + i); })()
                          : [q.number];
                      const answerKey = `reading_${groupNumbers[0]}`;
                      const currentAnswers = Array.isArray(answers[answerKey]) ? answers[answerKey] : [];
                      const maxSelections = q.select_count || 2;

                      return q.options?.map((opt, oIdx) => {
                        const optValue = opt.charAt(0);
                        const isChecked = currentAnswers.includes(optValue);

                        return (
                          <label key={oIdx} className={`flex items-center gap-3 p-2 rounded cursor-pointer ${isChecked ? 'bg-green-50 border border-green-300' : 'hover:bg-gray-50'}`}>
                            <input
                              type="checkbox"
                              value={optValue}
                              checked={isChecked}
                              onChange={(e) => {
                                let newAnswers;
                                if (e.target.checked) {
                                  if (currentAnswers.length < maxSelections) {
                                    newAnswers = [...currentAnswers, optValue];
                                  } else {
                                    return; // Max reached
                                  }
                                } else {
                                  newAnswers = currentAnswers.filter(v => v !== optValue);
                                }
                                setAnswers(prev => {
                                  const next = { ...prev };
                                  groupNumbers.forEach(n => { next[`reading_${n}`] = newAnswers; });
                                  return next;
                                });
                              }}
                              className="w-4 h-4 text-green-600 rounded"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        );
                      });
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select {q.select_count || 2} options ({(Array.isArray(answers[q.items ? `reading_${q.items[0].number}` : `reading_${q.number}`]) ? answers[q.items ? `reading_${q.items[0].number}` : `reading_${q.number}`] : []).length}/{q.select_count || 2} selected)
                  </p>
                </div>
              )}

              {/* Generic Question Types - fallback for individual questions without items array */}
              {['true_false_notgiven', 'yes_no_notgiven'].includes(q.type) && !q.items && !q.statements && (
                <div className="p-4 bg-white border rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-green-600 w-8">{q.number}.</span>
                    <div className="flex-1">
                      <p className="text-sm mb-3">{q.question_text || q.statement || q.item}</p>
                      <div className="flex gap-4">
                        {(q.type === 'true_false_notgiven' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN']).map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`reading_q${q.number}`}
                              value={opt}
                              checked={answers[`reading_${q.number}`] === opt}
                              onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="text-sm font-medium">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Context Menu for Highlighting */}
        {contextMenu.show && (
          <div 
            className="fixed bg-white shadow-xl rounded-lg border p-2 z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <div className="flex flex-col gap-1">
              <button 
                onClick={() => addHighlight('yellow')}
                className="flex items-center gap-2 px-3 py-2 hover:bg-yellow-100 rounded text-sm"
              >
                <Highlighter className="w-4 h-4 text-yellow-600" />
                Highlight Yellow
              </button>
              <button 
                onClick={() => addHighlight('blue')}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-100 rounded text-sm"
              >
                <Highlighter className="w-4 h-4 text-blue-600" />
                Highlight Blue
              </button>
              <button 
                onClick={addNoteToHighlight}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm"
              >
                <StickyNote className="w-4 h-4 text-gray-600" />
                Add Note
              </button>
              <button 
                onClick={() => setContextMenu({ show: false, x: 0, y: 0, text: '', range: null })}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-sm text-gray-500"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
}
