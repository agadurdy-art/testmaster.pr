import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Play, Pause, Volume2 } from 'lucide-react';
import { API_URL } from '../constants';

// Listening section: audio player, part tabs and every listening question
// renderer. Extracted verbatim from renderListeningSection in
// pages/CambridgeTestInterface.js; closed-over values became same-named props.
export default function ListeningSection({
  sectionData,
  currentPart,
  setCurrentPart,
  answers,
  setAnswers,
  handleAnswerChange,
  renderGapFill,
  audioRef,
  isPlaying,
  setIsPlaying,
  toggleAudio,
  audioProgress,
  audioDuration,
  audioCurrentTime,
  handleAudioTimeUpdate,
  handleAudioLoaded,
  formatTime,
}) {
    const parts = sectionData?.parts || [];
    const currentPartData = parts[currentPart];
    
    if (!currentPartData) return null;

    return (
      <div className="space-y-4">
        {/* Audio Player */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleAudio}
              className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Part {currentPartData.part_number}: {currentPartData.title}</span>
                <span className="text-xs text-gray-500">{formatTime(audioCurrentTime)} / {formatTime(audioDuration)}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
          <audio
            ref={audioRef}
            src={currentPartData.audio_file?.startsWith('http') ? currentPartData.audio_file : `${API_URL}${currentPartData.audio_file}`}
            onTimeUpdate={handleAudioTimeUpdate}
            onLoadedMetadata={handleAudioLoaded}
            onEnded={() => setIsPlaying(false)}
          />
        </Card>

        {/* Part Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {parts.map((part, idx) => (
            <Button
              key={idx}
              variant={currentPart === idx ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentPart(idx)}
              className={`flex-shrink-0 ${currentPart === idx ? 'bg-blue-600' : ''}`}
            >
              Part {part.part_number}
            </Button>
          ))}
        </div>

        {/* Questions Card */}
        <Card className="p-6">
          <div className="mb-4">
            <Badge className="bg-blue-100 text-blue-700 mb-2">Questions {currentPartData.question_range}</Badge>
            <h3 className="font-bold text-lg text-gray-900">{currentPartData.title}</h3>
            {currentPartData.instructions && (
              <p className="text-sm text-gray-600 mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                {currentPartData.instructions}
              </p>
            )}
          </div>
          
          {/* Map Image - moved inline to render before map_labelling questions */}

          {/* Visual Notes */}
          {currentPartData.visual && currentPartData.visual.type === 'notes' && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">{currentPartData.visual.title}</h4>
              {currentPartData.visual.sections?.map((section, sIdx) => (
                <div key={sIdx} className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2 text-sm uppercase tracking-wide">{section.heading}</h5>
                  {section.subsections?.map((sub, subIdx) => (
                    <div key={subIdx} className="ml-4 mb-3">
                      <span className="font-medium text-sm text-blue-700">{sub.name}</span>
                      <ul className="mt-1 space-y-2">
                        {sub.items?.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span className="flex-1">
                              {item.includes('___') ? (
                                renderGapFill(item)
                              ) : item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {section.items && !section.subsections && (
                    <ul className="ml-4 space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400">•</span>
                          <span className="flex-1">
                            {item.includes('___') ? renderGapFill(item) : item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Form and Table Visual (for forms with tables like Wayside Camera Club) */}
          {currentPartData.visual && currentPartData.visual.type === 'form_and_table' && (
            <div className="space-y-4 mb-4">
              {/* Form Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 border-b pb-2">{currentPartData.visual.form_title}</h4>
                <div className="space-y-2">
                  {currentPartData.visual.form_fields?.map((field, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2">
                      <span className="font-medium text-gray-700 min-w-[140px]">{field.label}</span>
                      <span className="text-gray-700 flex-1">
                        {field.value.includes('___') ? renderGapFill(field.value) : field.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Table Section */}
              <div className="bg-white rounded-lg border overflow-hidden">
                <h4 className="font-semibold text-gray-800 p-3 bg-slate-100 border-b">{currentPartData.visual.table_title}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {currentPartData.visual.table_headers?.map((header, hIdx) => (
                          <th key={hIdx} className="px-3 py-2 text-left font-medium text-gray-700 border-b">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentPartData.visual.table_rows?.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b hover:bg-gray-50">
                          {row.cells?.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 text-gray-700 align-top whitespace-pre-line">
                              {cell.includes('___') ? renderGapFill(cell) : cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Table Visual (for Part 1 Job tables, etc.) */}
          {currentPartData.table && (
            <div className="bg-white rounded-lg border mb-4 overflow-hidden">
              <h4 className="font-semibold text-gray-800 p-3 bg-slate-100 border-b">{currentPartData.table.title}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {currentPartData.table.headers?.map((header, hIdx) => (
                        <th key={hIdx} className="px-3 py-2 text-left font-medium text-gray-700 border-b">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPartData.table.rows?.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b hover:bg-gray-50">
                        {row.cells?.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-gray-700 align-top whitespace-pre-line">
                            {cell.includes('___') ? renderGapFill(cell) : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Render questions in original order */}
          {currentPartData.questions?.map((q, qIdx) => {
            // Multiple Selection Questions (e.g., Q21-22)
            if (q.type === 'multiple_selection') {
              // Persist the answer array under every question_id in the group
              // (same array reused) so per-question results can resolve a
              // user_answer for each member, not just the first. Backend
              // scoring is group-aware (Bug #150) — this fixes display side.
              const groupNumbers = q.items
                ? q.items.map(i => i.number)
                : String(q.number).includes('-')
                  ? (() => { const [s, e] = String(q.number).split('-').map(n => parseInt(n, 10)); return Array.from({ length: e - s + 1 }, (_, i) => s + i); })()
                  : [q.number];
              const questionKey = `listening_${groupNumbers[0]}`;
              const currentAnswers = Array.isArray(answers[questionKey]) ? answers[questionKey] : [];
              const maxSelections = q.select_count || q.answer_count || 2;

              return (
                <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">{q.instruction}</p>
                  <p className="font-medium mb-3 text-gray-900">{q.number}. {q.question_text || q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => {
                      const optValue = opt.charAt(0);
                      const isChecked = currentAnswers.includes(optValue);

                      return (
                        <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${isChecked ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
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
                                  return; // Max selections reached
                                }
                              } else {
                                newAnswers = currentAnswers.filter(v => v !== optValue);
                              }
                              // Mirror the array under every grouped question_id.
                              setAnswers(prev => {
                                const next = { ...prev };
                                groupNumbers.forEach(n => { next[`listening_${n}`] = newAnswers; });
                                return next;
                              });
                            }}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Select {maxSelections} options ({currentAnswers.length}/{maxSelections} selected)</p>
                </div>
              );
            }
            
            // Matching Questions (e.g., Q16-20)
            if (q.type === 'matching') {
              // Support both options_box and direct options array
              const optionsArray = q.options_box?.options || q.options || [];
              const optionsTitle = q.options_box?.title || q.options_title || 'Options';
              
              return (
                <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
                  <p className="text-xs text-blue-600 font-medium mb-2">{q.instruction}</p>
                  
                  {/* Options Box - show available choices */}
                  {optionsArray.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-sm mb-3 text-blue-800">{optionsTitle}</h5>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        {optionsArray.map((opt, oIdx) => (
                          <div key={oIdx} className="text-gray-700">{opt}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {q.items?.map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <span className="font-bold text-blue-600 w-8">{item.number}.</span>
                        <span className="flex-1 text-sm font-medium">{item.item}</span>
                        <select
                          value={answers[`listening_${item.number}`] || ''}
                          onChange={(e) => handleAnswerChange(item.number, e.target.value)}
                          className="w-20 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          {optionsArray.map((opt, oIdx) => {
                            const letter = opt.charAt(0);
                            return <option key={letter} value={letter}>{letter}</option>;
                          })}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            
            // Multiple Choice Questions (e.g., Q28-30)
            if (q.type === 'multiple_choice' && (q.question || q.question_text)) {
              return (
                <div key={qIdx} className="mb-6 p-4 bg-white border rounded-lg">
                  <p className="font-medium mb-3 text-gray-900">{q.number}. {q.question_text || q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border transition-colors">
                        <input
                          type="radio"
                          name={`listening_q${q.number}`}
                          value={opt.charAt(0)}
                          checked={answers[`listening_${q.number}`] === opt.charAt(0)}
                          onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            }

            // Map Labelling Questions (e.g., Q15-20)
            if (q.type === 'map_labelling') {
              // Show map image before the first map_labelling question
              const isFirstMapQ = qIdx === 0 || currentPartData.questions[qIdx - 1]?.type !== 'map_labelling';
              return (
                <React.Fragment key={qIdx}>
                  {isFirstMapQ && currentPartData.map_image && (
                    <div className="mb-4 bg-white rounded-lg border overflow-hidden">
                      <div className="bg-blue-50 px-4 py-2 border-b">
                        <h4 className="text-sm font-semibold text-blue-800">
                          {currentPartData.map_instruction || 'Label the map below'}
                        </h4>
                      </div>
                      <img 
                        src={currentPartData.map_image}
                        alt="Map for labelling"
                        className="w-full max-w-2xl mx-auto p-2"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="mb-4 p-3 bg-white border rounded-lg flex items-center gap-4">
                    <span className="font-bold text-blue-600 w-8">{q.number}.</span>
                    <span className="flex-1 text-sm">{q.question_text}</span>
                    <select
                      data-testid={`listening-q${q.number}-select`}
                      value={answers[`listening_${q.number}`] || ''}
                      onChange={(e) => handleAnswerChange(q.number, e.target.value)}
                      className="w-16 px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-</option>
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </React.Fragment>
              );
            }
            
            return null;
          })}
        </Card>
      </div>
    );
}
