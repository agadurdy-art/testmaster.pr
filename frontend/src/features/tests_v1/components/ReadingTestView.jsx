import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import HighlightableText from '../../../components/HighlightableText';
import QuestionNavigation from '../../../components/test/QuestionNavigation';

export default function ReadingTestView({
  test,
  user,
  answers,
  handleAnswerChange,
  currentPassage,
  setCurrentPassage,
  passageRatio,
  setPassageRatio,
  layoutPresets,
  flaggedQuestions,
  handleSubmit,
  submitting,
}) {
  return (
          <div className="flex flex-col mb-20">
            {/* Layout Control Bar - Desktop only */}
            <div className="hidden lg:flex items-center justify-between px-4 py-2 mb-2 bg-white rounded-lg shadow-sm border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Layout:</span>
                {layoutPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setPassageRatio(preset.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                      passageRatio === preset.value
                        ? 'bg-sky-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400">
                Passage {passageRatio}% | Questions {100 - passageRatio}%
              </span>
            </div>

            {/* Question Navigation Bar - Full width, scrollable row */}
            {(() => {
              // Calculate total questions accounting for spans
              const actualTotalQuestions = test.questions?.reduce((total, q) => {
                // summary_completion_block has multiple blanks
                if (q.type === 'summary_completion_block' && q.blanks) {
                  return total + q.blanks.length;
                }
                const span = (q.type === 'multiple_choice_multi' && q.answer_count) ? q.answer_count : 1;
                return total + span;
              }, 0) || 40;
              
              return (
                <QuestionNavigation
                  totalQuestions={actualTotalQuestions}
                  currentQuestion={test.questions?.findIndex(q => q.passage === currentPassage) || 0}
                  answers={answers}
                  flaggedQuestions={flaggedQuestions}
                  onQuestionSelect={(index) => {
                    const question = test.questions?.[index];
                    if (question) {
                      setCurrentPassage(question.passage || 1);
                    }
                  }}
                  questionIds={test.questions?.map(q => q.id) || []}
                  compact={true}
                  className="mb-2"
                />
              );
            })()}

            {/* Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[calc(100vh-300px)] lg:h-[calc(100vh-300px)]">
              {/* Left Column - Passage */}
              <div className="flex flex-col" style={{ flex: `0 0 ${passageRatio}%` }}>
                <Card className="flex-1 overflow-hidden flex flex-col">
                  {/* Passage Header */}
                  <div className="p-4 border-b bg-gradient-to-r from-sky-50 to-blue-50">
                    <h2 className="text-lg font-bold text-gray-900">
                      {test.passages?.[currentPassage - 1]?.title || `Passage ${currentPassage}`}
                    </h2>
                  </div>
                {/* Passage Content - Scrollable with Highlighter */}
                <div className="flex-1 overflow-y-auto p-6">
                  {(() => {
                    // Check if current passage has matching_information or matching_headings questions
                    const passageQuestions = test.questions?.filter(q => q.passage === currentPassage) || [];
                    const needsParagraphLabels = passageQuestions.some(q => 
                      q.type === 'matching_information' || q.type === 'matching_headings'
                    );
                    
                    return (
                      <HighlightableText
                        text={test.passages?.[currentPassage - 1]?.text || 'No passage content available.'}
                        user={user}
                        testId={`${test?.id}-passage-${currentPassage}`}
                        testType="reading"
                        highlightsEnabled={true}
                        showParagraphLabels={needsParagraphLabels}
                      />
                    );
                  })()}
                </div>
              </Card>
            </div>

            {/* Right Column - Questions */}
            <div className="flex-1 flex flex-col min-w-[280px]">
              <Card className="flex-1 overflow-hidden flex flex-col">
                {/* Passage Tabs */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((passageNum) => {
                      const passageQuestions = test.questions?.filter(q => q.passage === passageNum) || [];
                      
                      // Calculate actual question count including block blanks
                      const actualQuestionCount = passageQuestions.reduce((total, q) => {
                        if (q.type === 'summary_completion_block' && q.blanks) {
                          return total + q.blanks.length;
                        }
                        if (q.type === 'multiple_choice_multi' && q.answer_count) {
                          return total + q.answer_count;
                        }
                        return total + 1;
                      }, 0);
                      
                      // Calculate answered count including block blanks
                      const answeredCount = passageQuestions.reduce((count, q) => {
                        if (q.type === 'summary_completion_block' && q.blanks) {
                          return count + q.blanks.filter(blankNum => answers[blankNum]).length;
                        }
                        if (q.type === 'multiple_choice_multi' && q.answer_count) {
                          const ans = answers[q.id];
                          return count + (Array.isArray(ans) ? Math.min(ans.length, q.answer_count) : (ans ? 1 : 0));
                        }
                        return count + (answers[q.id] ? 1 : 0);
                      }, 0);
                      
                      return (
                        <button
                          key={passageNum}
                          onClick={() => setCurrentPassage(passageNum)}
                          className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            currentPassage === passageNum
                              ? 'bg-sky-500 text-white'
                              : answeredCount === actualQuestionCount && actualQuestionCount > 0
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border'
                          }`}
                        >
                          <div>P{passageNum}</div>
                          <div className="text-[10px] opacity-75">
                            {answeredCount}/{actualQuestionCount}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Questions List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Group questions by type and show task descriptions */}
                    {(() => {
                      const passageQuestions = test.questions?.filter(q => q.passage === currentPassage) || [];
                      let currentType = null;
                      const taskDescriptions = {
                        'true_false_notgiven': {
                          title: 'TRUE / FALSE / NOT GIVEN',
                          instruction: 'Do the following statements agree with the information given in the passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.'
                        },
                        'yes_no_notgiven': {
                          title: 'YES / NO / NOT GIVEN',
                          instruction: 'Do the following statements agree with the claims of the writer? Write YES if the statement agrees with the claims, NO if the statement contradicts the claims, NOT GIVEN if it is impossible to say what the writer thinks.'
                        },
                        'multiple_choice': {
                          title: 'Multiple Choice',
                          instruction: 'Choose the correct letter, A, B, C or D.'
                        },
                        'sentence_completion': {
                          title: 'Sentence Completion',
                          instruction: 'Complete the sentences below. Choose NO MORE THAN THREE WORDS from the passage for each answer.'
                        },
                        'summary_completion': {
                          title: 'Summary Completion',
                          instruction: 'Complete the summary below. Choose NO MORE THAN TWO WORDS from the passage for each answer.'
                        },
                        'matching_headings': {
                          title: 'Matching Headings',
                          instruction: 'Choose the correct heading for each paragraph from the list of headings below.'
                        },
                        'matching_information': {
                          title: 'Matching Information',
                          instruction: 'Which paragraph contains the following information? You may use any letter more than once.'
                        },
                        'note_completion': {
                          title: 'Note Completion',
                          instruction: 'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.'
                        },
                        'form_completion': {
                          title: 'Form Completion',
                          instruction: 'Complete the form below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.'
                        },
                        'summary_completion_block': {
                          title: 'Summary Completion',
                          instruction: 'Complete the summary using the list of phrases, A–K, below. Write the correct letter, A–K, in boxes on your answer sheet.'
                        }
                      };
                      
                      // Calculate question numbers with span support for Reading
                      let runningQuestionNumber = 0;
                      // First pass to calculate starting number for this passage
                      const passagesBeforeCurrent = [1, 2, 3].filter(p => p < currentPassage);
                      for (const p of passagesBeforeCurrent) {
                        const pQuestions = test.questions?.filter(q => q.passage === p) || [];
                        for (const pq of pQuestions) {
                          let span = 1;
                          if (pq.type === 'multiple_choice_multi' && pq.answer_count) {
                            span = pq.answer_count;
                          } else if (pq.type === 'summary_completion_block' && pq.blanks) {
                            span = pq.blanks.length;
                          }
                          runningQuestionNumber += span;
                        }
                      }
                      
                      return passageQuestions.map((q, idx) => {
                        // Get span for this question
                        let questionSpan = 1;
                        if (q.type === 'multiple_choice_multi' && q.answer_count) {
                          questionSpan = q.answer_count;
                        } else if (q.type === 'summary_completion_block' && q.blanks) {
                          questionSpan = q.blanks.length;
                        }
                        const questionNumber = runningQuestionNumber;
                        
                        // Increment for next question
                        runningQuestionNumber += questionSpan;
                        
                        const showTaskHeader = q.type !== currentType;
                        currentType = q.type;
                        const taskInfo = taskDescriptions[q.type] || { title: q.type?.replace(/_/g, ' '), instruction: 'Answer the following questions.' };
                        const isAnswered = !!answers[q.id];
                        
                        // Special handling for summary_completion_block (Q27-32 style continuous paragraph)
                        if (q.type === 'summary_completion_block') {
                          return (
                            <React.Fragment key={q.id}>
                              {/* Task Header */}
                              {showTaskHeader && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <h4 className="font-bold text-blue-900 text-sm mb-1">
                                    Questions {q.blanks?.[0] || '27'}-{q.blanks?.[q.blanks?.length - 1] || '32'}
                                  </h4>
                                  <p className="text-xs text-blue-700 leading-relaxed">
                                    {taskInfo.instruction}
                                  </p>
                                </div>
                              )}
                              
                              {/* Summary Block with Title */}
                              <div className="p-4 bg-white rounded-lg border shadow-sm">
                                {q.title && (
                                  <h3 className="text-center font-bold text-gray-900 mb-4 text-lg">{q.title}</h3>
                                )}
                                
                                {/* Summary Text with Blanks */}
                                <div className="text-sm text-gray-800 leading-relaxed mb-4 space-y-3">
                                  {q.summary_text?.split('\n\n').map((paragraph, pIdx) => (
                                    <p key={pIdx}>
                                      {paragraph.split(/(\*\*\d+\*\*)/).map((part, partIdx) => {
                                        const match = part.match(/\*\*(\d+)\*\*/);
                                        if (match) {
                                          const blankNum = parseInt(match[1]);
                                          const blankAnswer = answers[blankNum] || '';
                                          return (
                                            <span key={partIdx} className="inline-flex items-center mx-1">
                                              <span className="font-bold text-sky-600">{blankNum}</span>
                                              <select
                                                value={blankAnswer}
                                                onChange={(e) => handleAnswerChange(blankNum, e.target.value)}
                                                className={`ml-1 px-2 py-0.5 border rounded text-xs ${
                                                  blankAnswer ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'
                                                }`}
                                              >
                                                <option value="">.......................</option>
                                                {q.options?.map((opt, optIdx) => (
                                                  <option key={optIdx} value={opt.split(')')[0].trim()}>
                                                    {opt}
                                                  </option>
                                                ))}
                                              </select>
                                            </span>
                                          );
                                        }
                                        return <span key={partIdx}>{part}</span>;
                                      })}
                                    </p>
                                  ))}
                                </div>
                                
                                {/* Word Bank */}
                                <div className="border-t pt-3 mt-3">
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    {q.options?.map((opt, optIdx) => (
                                      <div key={optIdx} className="text-gray-700">
                                        <span className="font-bold">{opt.split(')')[0]}</span>
                                        {opt.split(')')[1]}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }
                        
                        return (
                          <React.Fragment key={q.id}>
                            {/* Task Header */}
                            {showTaskHeader && (
                              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-bold text-blue-900 text-sm mb-1">
                                  {taskInfo.title}
                                </h4>
                                <p className="text-xs text-blue-700 leading-relaxed">
                                  {taskInfo.instruction}
                                </p>
                              </div>
                            )}
                            
                            {/* Question */}
                        <div 
                          key={q.id} 
                          className={`p-3 rounded-lg border-l-4 ${
                            isAnswered ? 'border-l-green-500 bg-green-50' : 'border-l-sky-500 bg-white'
                          } shadow-sm`}
                        >
                          <p className="text-sm font-medium text-gray-900 mb-2">
                            {/* Show combined question numbers for multi-answer questions */}
                            {questionSpan > 1 ? (
                              <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mr-2">
                                Q{questionNumber + 1}-{questionNumber + questionSpan}
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mr-2">
                                {questionNumber + 1}
                              </span>
                            )}
                            {q.question}
                          </p>
                          
                          {/* Answer Input Based on Question Type */}
                          {(q.type === 'true_false_notgiven' || q.type === 'yes_no_notgiven') && (
                            <div className="flex gap-1 mt-2">
                              {(q.type === 'true_false_notgiven' ? ['True', 'False', 'Not Given'] : ['Yes', 'No', 'Not Given']).map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleAnswerChange(q.id, option)}
                                  className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                                    answers[q.id] === option
                                      ? 'bg-sky-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {option === 'Not Given' ? 'NG' : option}
                                </button>
                              ))}
                            </div>
                          )}

                          {(q.type === 'multiple_choice' || q.type === 'multiple_choice_multi') && q.options && (
                            (() => {
                              // Check if this is a "Choose TWO" question or multiple_choice_multi type
                              const isMultiSelect = q.type === 'multiple_choice_multi' ||
                                                    q.question?.toLowerCase().includes('two') || 
                                                    q.question?.toLowerCase().includes('select two');
                              const maxSelections = q.answer_count || 2;
                              
                              if (isMultiSelect) {
                                // Multi-select: use checkboxes, store as array
                                const selectedAnswers = Array.isArray(answers[q.id]) 
                                  ? answers[q.id] 
                                  : (answers[q.id] ? (typeof answers[q.id] === 'string' ? answers[q.id].split(',').map(a => a.trim()) : [answers[q.id]]) : []);
                                
                                const handleMultiSelect = (optionLetter) => {
                                  let newAnswers;
                                  if (selectedAnswers.includes(optionLetter)) {
                                    // Remove if already selected
                                    newAnswers = selectedAnswers.filter(a => a !== optionLetter);
                                  } else if (selectedAnswers.length < maxSelections) {
                                    // Add if less than max selected
                                    newAnswers = [...selectedAnswers, optionLetter];
                                  } else {
                                    // Replace oldest if already max selected
                                    newAnswers = [...selectedAnswers.slice(1), optionLetter];
                                  }
                                  handleAnswerChange(q.id, newAnswers);
                                };
                                
                                return (
                                  <div className="mt-2">
                                    <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded mb-2 font-medium">
                                      ⚠️ Select exactly {maxSelections} options ({selectedAnswers.length}/{maxSelections} selected)
                                    </div>
                                    <div className="space-y-1">
                                      {q.options.map((option, optIdx) => {
                                        const optionLetter = option.split(')')[0];
                                        const isSelected = selectedAnswers.includes(optionLetter);
                                        return (
                                          <button
                                            key={optIdx}
                                            onClick={() => handleMultiSelect(optionLetter)}
                                            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center gap-2 ${
                                              isSelected
                                                ? 'bg-sky-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                          >
                                            <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                              isSelected ? 'border-white bg-white' : 'border-gray-400'
                                            }`}>
                                              {isSelected && <span className="text-sky-500 text-xs font-bold">✓</span>}
                                            </span>
                                            {option}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Single select: use radio-style buttons
                              return (
                                <div className="space-y-1 mt-2">
                                  {q.options.map((option, optIdx) => (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleAnswerChange(q.id, option.split(')')[0])}
                                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                        answers[q.id] === option.split(')')[0]
                                          ? 'bg-sky-500 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              );
                            })()
                          )}

                          {/* Summary completion with word bank (options) */}
                          {q.type === 'summary_completion' && q.options && q.options.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-2">Choose from the word bank:</div>
                              <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 rounded border">
                                {q.options.map((option, optIdx) => {
                                  const optionLetter = option.split(')')[0].trim();
                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => handleAnswerChange(q.id, optionLetter)}
                                      className={`px-2 py-1 rounded text-xs transition-colors ${
                                        answers[q.id] === optionLetter
                                          ? 'bg-sky-500 text-white'
                                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Matching information/headings with options */}
                          {(q.type === 'matching_information' || q.type === 'matching_headings') && q.options && (
                            <div className="mt-2 space-y-1">
                              {q.options.map((option, optIdx) => {
                                const optionLetter = option.split(')')[0].trim();
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleAnswerChange(q.id, optionLetter)}
                                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                      answers[q.id] === optionLetter
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Text input for sentence/note/form completion without options */}
                          {(q.type === 'sentence_completion' || q.type === 'form_completion' || 
                            q.type === 'note_completion' || 
                            (q.type === 'summary_completion' && (!q.options || q.options.length === 0)) ||
                            ((q.type === 'matching_information' || q.type === 'matching_headings') && (!q.options || q.options.length === 0))) && (
                            <Input
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Type your answer..."
                              className="mt-2 text-sm h-8"
                            />
                          )}
                        </div>
                          </React.Fragment>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="p-3 border-t bg-gray-50">
                  <div className="flex justify-between items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPassage(Math.max(1, currentPassage - 1))}
                      disabled={currentPassage === 1}
                      className="text-xs"
                    >
                      <ChevronLeft className="w-3 h-3 mr-1" />
                      Prev
                    </Button>
                    
                    {currentPassage < 3 ? (
                      <Button
                        size="sm"
                        onClick={() => setCurrentPassage(currentPassage + 1)}
                        className="primary-gradient text-white text-xs"
                      >
                        Next
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-green-600 text-white hover:bg-green-700 text-xs"
                      >
                        {submitting ? 'Submitting...' : 'Submit'}
                        <Send className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          </div>
  );
}
