import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { resolveAudioUrl } from '../lib/audio';

export default function ListeningTestView({
  test,
  answers,
  handleAnswerChange,
  currentQuestion,
  setCurrentQuestion,
  listeningAudioRef,
  setListeningAudioPlaying,
  handleSubmit,
  submitting,
}) {
  return (
          /* LISTENING TEST - New Two-Column Layout like Reading */
          <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-220px)] lg:h-[calc(100vh-220px)] mb-20">
            {/* Left Column - Audio Player (Compact top bar style) */}
            <div className="lg:w-1/4 flex flex-col gap-4">
              {/* Audio Player Card */}
              <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎧</span>
                  <h3 className="font-bold text-lg">
                    Part {Math.floor(currentQuestion / 10) + 1}
                  </h3>
                </div>
                <audio
                  ref={listeningAudioRef}
                  src={resolveAudioUrl(test.sections?.[Math.floor(currentQuestion / 10)]?.audio_url)}
                  onEnded={() => setListeningAudioPlaying(false)}
                  onPlay={() => setListeningAudioPlaying(true)}
                  onPause={() => setListeningAudioPlaying(false)}
                  controls
                  className="w-full rounded"
                  style={{height: '40px'}}
                />
                <p className="text-xs text-white/80 mt-2">
                  {test.sections?.[Math.floor(currentQuestion / 10)]?.context}
                </p>
              </Card>

              {/* Parts Navigator - Compact like Reading */}
              <Card className="p-3">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">Parts</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((part) => {
                    const partQuestions = test.questions?.slice((part - 1) * 10, part * 10) || [];
                    const answeredCount = partQuestions.filter(q => answers[q.id]).length;
                    return (
                      <button
                        key={part}
                        onClick={() => setCurrentQuestion((part - 1) * 10)}
                        className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          Math.floor(currentQuestion / 10) + 1 === part
                            ? 'bg-sky-500 text-white'
                            : answeredCount === 10
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border'
                        }`}
                      >
                        <div>P{part}</div>
                        <div className="text-[10px] opacity-75">
                          {answeredCount}/10
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Question Numbers Grid - Compact with span-aware numbering */}
              <Card className="p-3 flex-1 overflow-y-auto">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">Questions</h3>
                <div className="grid grid-cols-5 gap-1">
                  {(() => {
                    const currentPart = Math.floor(currentQuestion / 10) + 1;
                    // Filter questions by section field instead of array index
                    const partQuestions = test.questions?.filter(q => q.section === currentPart) || [];
                    
                    // Calculate starting question number based on previous parts' spans
                    let startNum = 0;
                    for (let p = 1; p < currentPart; p++) {
                      const prevPartQuestions = test.questions?.filter(q => q.section === p) || [];
                      for (const pq of prevPartQuestions) {
                        const span = (pq.type === 'multiple_choice_multi' && pq.answer_count) ? pq.answer_count : 1;
                        startNum += span;
                      }
                    }
                    
                    let runningNum = startNum;
                    return partQuestions.map((q, idx) => {
                      const questionSpan = (q.type === 'multiple_choice_multi' && q.answer_count) ? q.answer_count : 1;
                      const questionNumber = runningNum;
                      runningNum += questionSpan;
                      
                      const isAnswered = !!answers[q.id];
                      
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            const el = document.getElementById(`q-${questionNumber}`);
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className={`${questionSpan > 1 ? 'col-span-2 w-full' : 'w-8'} h-8 rounded text-xs font-semibold transition-colors ${
                            isAnswered
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {questionSpan > 1 ? `${questionNumber + 1}-${questionNumber + questionSpan}` : questionNumber + 1}
                        </button>
                      );
                    });
                  })()}
                </div>
              </Card>
            </div>

            {/* Right Column - Questions (~75% width) */}
            <div className="lg:w-3/4 flex flex-col">
              <Card className="flex-1 overflow-hidden flex flex-col">
                {/* Questions Header */}
                {(() => {
                  // IELTS Listening has fixed question ranges per part
                  const currentPart = Math.floor(currentQuestion / 10) + 1;
                  
                  // Fixed IELTS question ranges - Part 1: 1-10, Part 2: 11-20, Part 3: 21-30, Part 4: 31-40
                  const partRanges = {
                    1: { start: 1, end: 10 },
                    2: { start: 11, end: 20 },
                    3: { start: 21, end: 30 },
                    4: { start: 31, end: 40 }
                  };
                  
                  const range = partRanges[currentPart] || { start: (currentPart - 1) * 10 + 1, end: currentPart * 10 };
                  
                  return (
                    <div className="p-4 border-b bg-gradient-to-r from-sky-50 to-blue-50">
                      <h2 className="text-lg font-bold text-gray-900">
                        Part {currentPart} - Questions {range.start}-{range.end}
                      </h2>
                    </div>
                  );
                })()}

                {/* Questions List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Task descriptions for Listening */}
                    {(() => {
                      const currentPart = Math.floor(currentQuestion / 10) + 1;
                      // Filter questions by section field instead of array index
                      const partQuestions = test.questions?.filter(q => q.section === currentPart) || [];
                      let currentType = null;
                      const listeningTaskDescriptions = {
                        'note_completion': {
                          title: 'Note Completion',
                          instruction: 'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.'
                        },
                        'form_completion': {
                          title: 'Form Completion',
                          instruction: 'Complete the form below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.'
                        },
                        'sentence_completion': {
                          title: 'Sentence Completion',
                          instruction: 'Complete the sentences below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.'
                        },
                        'map_labeling': {
                          title: 'Map/Plan Labeling',
                          instruction: 'Label the map/plan below. Write the correct letter A-H next to each question.'
                        },
                        'matching': {
                          title: 'Matching',
                          instruction: 'Choose the correct letter A-H from the list.'
                        },
                        'multiple_choice': {
                          title: 'Multiple Choice',
                          instruction: 'Choose the correct letter A, B, or C.'
                        },
                        'multiple_choice_multi': {
                          title: 'Multiple Choice (Multiple Answers)',
                          instruction: 'Choose the correct letters. You must select ALL correct answers.'
                        }
                      };
                      
                      // Calculate starting question number based on previous parts' spans
                      let runningQuestionNumber = 0;
                      for (let p = 1; p < currentPart; p++) {
                        const prevPartQuestions = test.questions?.filter(q => q.section === p) || [];
                        for (const pq of prevPartQuestions) {
                          const span = (pq.type === 'multiple_choice_multi' && pq.answer_count) ? pq.answer_count : 1;
                          runningQuestionNumber += span;
                        }
                      }
                      
                      return partQuestions.map((q, idx) => {
                        // Get span for this question (combined questions have span > 1)
                        const questionSpan = (q.type === 'multiple_choice_multi' && q.answer_count) ? q.answer_count : 1;
                        const questionNumber = runningQuestionNumber;
                        
                        // Increment running counter by span for next question
                        runningQuestionNumber += questionSpan;
                        
                        const showTaskHeader = q.type !== currentType;

                        currentType = q.type;
                        const taskInfo = listeningTaskDescriptions[q.type] || { title: q.type?.replace(/_/g, ' '), instruction: 'Listen and answer.' };
                        const isAnswered = !!answers[q.id];
                        
                        return (
                          <React.Fragment key={q.id}>
                            {/* Task Header */}
                            {showTaskHeader && (
                              <div className="mb-3 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                                <h4 className="font-bold text-cyan-900 text-sm mb-1">
                                  {taskInfo.title}
                                </h4>
                                <p className="text-xs text-cyan-700 leading-relaxed">
                                  {taskInfo.instruction}
                                </p>
                              </div>
                            )}
                            
                    <div 
                      id={`q-${questionNumber}`}
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
                      
                      {/* Map labeling special display */}
                          {q.type === 'map_labeling' && questionNumber === 15 && (
                            <div className="mt-3 mb-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <p className="text-center text-gray-900 font-bold mb-2">Farley House Map</p>
                              <img 
                                src="/static/images/migrated/nh3dkxxe_Screenshot_2025-11-22_at_15_34_39_d6e54b52.png" 
                                alt="Farley House Map"
                                className="w-full h-auto max-w-md mx-auto"
                              />
                            </div>
                          )}
                          
                          {/* Multiple Choice Options - Single Answer */}
                          {(q.type === 'multiple_choice' || q.type === 'multiple_choice_two') && q.options && q.options.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {q.options.map((opt, optIdx) => {
                                const optLetter = opt.charAt(0);
                                const isSelected = answers[q.id]?.toUpperCase() === optLetter;
                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleAnswerChange(q.id, optLetter)}
                                    className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                                      isSelected 
                                        ? 'border-sky-500 bg-sky-50 text-sky-900' 
                                        : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/50'
                                    }`}
                                  >
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-bold ${
                                      isSelected ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {optLetter}
                                    </span>
                                    {opt.substring(2).trim()}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Multiple Choice Multi - Multiple Answers (TWO options) */}
                          {q.type === 'multiple_choice_multi' && q.options && q.options.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs text-amber-600 mb-2 font-medium">
                                Select {q.answer_count || 2} answers
                              </p>
                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                  const optLetter = opt.charAt(0);
                                  const currentAnswers = answers[q.id] ? answers[q.id].split(',').map(a => a.trim().toUpperCase()) : [];
                                  const isSelected = currentAnswers.includes(optLetter);
                                  const maxAnswers = q.answer_count || 2;
                                  
                                  return (
                                    <button
                                      key={optIdx}
                                      onClick={() => {
                                        let newAnswers = [...currentAnswers];
                                        if (isSelected) {
                                          newAnswers = newAnswers.filter(a => a !== optLetter);
                                        } else if (newAnswers.length < maxAnswers) {
                                          newAnswers.push(optLetter);
                                        }
                                        handleAnswerChange(q.id, newAnswers.sort().join(', '));
                                      }}
                                      className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                                        isSelected 
                                          ? 'border-amber-500 bg-amber-50 text-amber-900' 
                                          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                                      }`}
                                    >
                                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs font-bold ${
                                        isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {optLetter}
                                      </span>
                                      {opt.substring(2).trim()}
                                    </button>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-gray-500 mt-2">
                                Selected: {answers[q.id] || 'None'} ({(answers[q.id]?.split(',').filter(a => a.trim()).length) || 0}/{q.answer_count || 2})
                              </p>
                            </div>
                          )}

                          {/* Matching statements display - Show for the first matching question in Part 3 */}
                          {q.type === 'matching' && showTaskHeader && (
                            <div className="mb-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                              <p className="font-semibold text-amber-900 mb-1 text-sm">Questions {questionNumber + 1}-{questionNumber + 6}</p>
                              <p className="text-xs text-gray-700 mb-3">
                                What is the students&apos; opinion about each of the following food trends?<br/>
                                Choose <strong>SIX</strong> answers from the box and write the correct letter, <strong>A-H</strong>, next to Questions {questionNumber + 1}-{questionNumber + 6}.
                              </p>
                              <div className="bg-white p-3 rounded-lg border border-gray-300">
                                <p className="font-bold text-center text-gray-800 mb-2">Opinions</p>
                                <div className="grid grid-cols-1 gap-1 text-sm text-gray-700">
                                  <div><strong>A</strong> This is only relevant to young people.</div>
                                  <div><strong>B</strong> This may have disappointing results.</div>
                                  <div><strong>C</strong> This already seems to be widespread.</div>
                                  <div><strong>D</strong> Retailers should do more to encourage this.</div>
                                  <div><strong>E</strong> More financial support is needed for this.</div>
                                  <div><strong>F</strong> Most people know little about this.</div>
                                  <div><strong>G</strong> There should be stricter regulations about this.</div>
                                  <div><strong>H</strong> This could be dangerous.</div>
                                </div>
                              </div>
                              <p className="font-bold text-gray-800 mt-3 text-sm">Food trends</p>
                            </div>
                          )}
                          {q.type === 'matching' && (
                            <>
                              <div className="flex items-center gap-2 mt-2">
                                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => (
                                  <button
                                    key={letter}
                                    onClick={() => handleAnswerChange(q.id, letter)}
                                    className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                                      answers[q.id]?.toUpperCase() === letter
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-sky-100'
                                    }`}
                                  >
                                    {letter}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}

                          {/* Map labeling answer buttons */}
                          {q.type === 'map_labeling' && (
                            <div className="flex items-center gap-2 mt-2">
                              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(letter => (
                                <button
                                  key={letter}
                                  onClick={() => handleAnswerChange(q.id, letter)}
                                  className={`w-8 h-8 rounded-lg font-bold text-sm transition-all ${
                                    answers[q.id]?.toUpperCase() === letter
                                      ? 'bg-sky-500 text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-sky-100'
                                  }`}
                                >
                                  {letter}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Text input for other question types */}
                          {!['multiple_choice', 'multiple_choice_two', 'matching', 'map_labeling'].includes(q.type) && (
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
                      onClick={() => setCurrentQuestion(Math.max(0, Math.floor(currentQuestion / 10) * 10 - 10))}
                      disabled={currentQuestion < 10}
                      className="text-xs"
                    >
                      <ChevronLeft className="w-3 h-3 mr-1" />
                      Prev
                    </Button>
                    
                    {currentQuestion < 30 ? (
                      <Button
                        size="sm"
                        onClick={() => setCurrentQuestion((Math.floor(currentQuestion / 10) + 1) * 10)}
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
  );
}
