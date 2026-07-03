import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { ChevronLeft, ChevronRight, Send, Mic, Square, Play, Pause } from 'lucide-react';
import { resolveAudioUrl } from '../lib/audio';

export default function DefaultTestView({
  testType,
  test,
  question,
  totalQuestions,
  currentQuestion,
  setCurrentQuestion,
  answers,
  handleAnswerChange,
  listeningAudioPlaying,
  setListeningAudioPlaying,
  listeningAudioRef,
  recording,
  startRecording,
  stopRecording,
  audioBlob,
  playAudio,
  isPlaying,
  setIsPlaying,
  audioRef,
  speakingQuestionAudioRef,
  playSpeakingQuestionAudio,
  speakingFeedback,
  writingFeedback,
  handleSubmit,
  submitting,
}) {
  return (
        <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Navigator for other tests */}
            <Card className="lg:col-span-1 p-4 h-fit sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                {Array.from({ length: totalQuestions }, (_, idx) => (
                  <button
                    key={idx}
                    data-testid={`question-nav-${idx}`}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      idx === currentQuestion
                        ? 'bg-sky-500 text-white'
                        : answers[question?.id || idx] || answers[idx]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </Card>

          {/* Question Content */}
          <Card className="lg:col-span-3 p-8">
            {
              /* Original single question view for other test types */
              question && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Question {currentQuestion + 1} of {totalQuestions}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {question.question}
                  </h2>

                  {/* Listening Test - Audio Player */}
                  {testType === 'listening' && test.sections && (
                    <div className="bg-blue-50 p-6 rounded-lg mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-blue-900">
                          {test.sections[Math.floor(currentQuestion / 10)]?.title || 'Audio Section'}
                        </h3>
                        <div className="flex gap-2">
                          {!listeningAudioPlaying ? (
                            <Button
                              onClick={() => {
                                if (listeningAudioRef.current) {
                                  listeningAudioRef.current.play();
                                  setListeningAudioPlaying(true);
                                }
                              }}
                              className="bg-blue-600 text-white"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Play Audio
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                if (listeningAudioRef.current) {
                                  listeningAudioRef.current.pause();
                                  setListeningAudioPlaying(false);
                                }
                              }}
                              className="bg-red-600 text-white"
                            >
                              <Pause className="w-4 h-4 mr-2" />
                              Pause Audio
                            </Button>
                          )}
                        </div>
                      </div>
                      <audio
                        ref={listeningAudioRef}
                        src={resolveAudioUrl(test.sections[Math.floor(currentQuestion / 10)]?.audio_url)}
                        onEnded={() => setListeningAudioPlaying(false)}
                        onPlay={() => setListeningAudioPlaying(true)}
                        onPause={() => setListeningAudioPlaying(false)}
                        controls
                        className="w-full"
                      />
                      <p className="text-sm text-blue-700 mt-3">
                        <strong>Context:</strong> {test.sections[Math.floor(currentQuestion / 10)]?.context}
                      </p>
                    </div>
                  )}

                  {/* Reading passage */}
                  {testType === 'reading' && test.passages && question.passage && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto">
                      <h3 className="font-semibold text-lg mb-3">
                        {test.passages[question.passage - 1]?.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {test.passages[question.passage - 1]?.text}
                      </p>
                    </div>
                  )}

                  {/* Writing Task 1 Graph/Image */}
                  {testType === 'writing' && question.task === 'task1' && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                      <p className="text-sm text-gray-700 mb-3 font-medium">Writing Task 1 Visual</p>
                      
                      {/* Side-by-side images for map comparisons */}
                      {question.visual_data?.type === 'side_by_side_images' && question.visual_data?.images ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.visual_data.images.map((img, idx) => (
                            <div key={idx} className="text-center">
                              <p className="text-sm font-medium text-gray-800 mb-2">{img.title}</p>
                              <img
                                src={img.url}
                                alt={img.title || `Image ${idx + 1}`}
                                className="w-full h-auto max-h-[350px] object-contain mx-auto border border-gray-200 rounded"
                              />
                            </div>
                          ))}
                        </div>
                      ) : question.visual_data?.image_url ? (
                        <img
                          src={question.visual_data.image_url}
                          alt="Writing Task 1 graph or chart"
                          className="w-full h-auto max-h-[400px] object-contain mx-auto border border-gray-200 rounded"
                        />
                      ) : question.image_url ? (
                        <img
                          src={question.image_url}
                          alt="Writing Task 1 graph or chart"
                          className="w-full h-auto max-h-[400px] object-contain mx-auto border border-gray-200 rounded"
                        />
                      ) : (
                        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                          <p className="text-gray-500 mb-2">[Chart/Graph/Diagram would be displayed here]</p>
                          <p className="text-sm text-gray-600">In the actual test, you would see the visual data here</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multiple Choice */}
                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option, idx) => (
                        <button
                          key={idx}
                          data-testid={`option-${idx}`}
                          onClick={() => handleAnswerChange(question.id, option.split(')')[0])}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                            answers[question.id] === option.split(')')[0]
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* True/False/Not Given */}
                  {(question.type === 'true_false_notgiven' || question.type === 'yes_no_notgiven') && (
                    <div className="space-y-3">
                      {(question.type === 'true_false_notgiven' ? ['True', 'False', 'Not Given'] : ['Yes', 'No', 'Not Given']).map((option) => (
                        <button
                          key={option}
                          data-testid={`tf-option-${option}`}
                          onClick={() => handleAnswerChange(question.id, option)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                            answers[question.id] === option
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Short Answer / Sentence Completion */}
                  {(question.type === 'sentence_completion' || question.type === 'form_completion' || 
                    question.type === 'note_completion' || question.type === 'matching_information' || 
                    question.type === 'matching_headings') && (
                    <Input
                      data-testid="text-answer-input"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Type your answer..."
                      className="text-lg p-4"
                    />
                  )}

                  {/* Writing Task */}
                  {testType === 'writing' && (
                    <div>
                      <Textarea
                        data-testid="writing-textarea"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Write your response here..."
                        className="min-h-[400px] text-lg p-4"
                        spellCheck={false}
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                      <div className="flex justify-between mt-2">
                        <p className="text-sm text-gray-600">
                          Words: {(answers[question.id] || '').split(/\s+/).filter(Boolean).length} / {question.word_limit}
                        </p>
                        <p className="text-sm text-gray-600">
                          Suggested time: {question.time_suggestion} minutes
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Speaking Question */}
                  {testType === 'speaking' && (
                    <div className="space-y-4">
                      {/* For Part 2 cue card: show only for the long-turn question (Q5) */}
                      {question.part === 2 && question.id === 5 && (
                        <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg bg-yellow-50">
                          <p className="font-semibold mb-2">Cue Card</p>
                          {test?.title && test.title.includes('Test 2') ? (
                            <>
                              <p className="mb-2">Describe a person from your country who has won a prize, award or medal.</p>
                              <p className="text-sm mb-1">You should say:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                <li>who this person is</li>
                                <li>which prize, award or medal they received</li>
                                <li>what they did to win this</li>
                                <li>and explain whether you think it was right that this person received this prize, award or medal.</li>
                              </ul>
                              <p className="text-xs text-gray-600 mt-2">
                                You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="mb-2">Describe a law that was introduced in your country and that you thought was a very good idea.</p>
                              <p className="text-sm mb-1">You should say:</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                <li>what the law was</li>
                                <li>who introduced it</li>
                                <li>when and why it was introduced</li>
                                <li>and explain why you thought this law was such a good idea.</li>
                              </ul>
                              <p className="text-xs text-gray-600 mt-2">
                                You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.
                              </p>
                            </>
                          )}
                        </div>
                      )}

                      <Textarea
                        data-testid="speaking-textarea"
                        value={answers[question.id] || answers[currentQuestion] || ''}
                        onChange={(e) => handleAnswerChange(question.id || currentQuestion, e.target.value)}
                        placeholder="Your transcribed response will appear here..."
                        className="min-h-[200px] text-lg p-4"
                        readOnly={recording}
                      />
                      <div className="flex gap-3 items-center flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => playSpeakingQuestionAudio(currentQuestion, question.question)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Question
                        </Button>

                        {/* Hidden audio element for pre-recorded speaking questions */}
                        <audio
                          ref={speakingQuestionAudioRef}
                          className="hidden"
                        />

                        {!recording ? (
                          <Button
                            data-testid="start-recording-btn"
                            onClick={startRecording}
                            className="primary-gradient text-white"
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            Start Recording
                          </Button>
                        ) : (
                          <Button
                            data-testid="stop-recording-btn"
                            onClick={stopRecording}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Stop Recording (Recording...)
                          </Button>
                        )}
                        {audioBlob && (
                          <Button
                            variant="outline"
                            onClick={playAudio}
                            disabled={isPlaying}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play Recording
                          </Button>
                        )}
                      </div>
                      <audio 
                        ref={audioRef} 
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />

                      {/* Speaking feedback summary for this question if available */}
                      {Object.keys(speakingFeedback).length > 0 && speakingFeedback[currentQuestion + 1] && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h3 className="text-sm font-semibold text-blue-900 mb-2">Speaking Feedback (Like an Examiner&apos;s Notes)</h3>
                          {(() => {
                            const fb = speakingFeedback[currentQuestion + 1];
                            const overallText =
                              typeof fb.overall_feedback === 'string'
                                ? fb.overall_feedback.replace(/```json|```/g, '').trim()
                                : '';

                            const criteria = [
                              { key: 'fluency_coherence', label: 'Fluency & Coherence' },
                              { key: 'lexical_resource', label: 'Lexical Resource' },
                              { key: 'grammatical_accuracy', label: 'Grammatical Range & Accuracy' },
                              { key: 'pronunciation', label: 'Pronunciation' }
                            ];

                            return (
                              <div className="space-y-2 text-sm text-gray-800">
                                <p className="font-semibold">
                                  Estimated band: {fb.band_score}
                                </p>
                                {overallText && (
                                  <p className="whitespace-pre-line text-gray-800">
                                    {overallText}
                                  </p>
                                )}

                                <div className="mt-2 space-y-2 border-t border-blue-200 pt-2">
                                  {criteria.map((crit) => {
                                    const critData = fb[crit.key];
                                    if (!critData) return null;
                                    const critText =
                                      typeof critData.feedback === 'string'
                                        ? critData.feedback.replace(/```json|```/g, '').trim()
                                        : '';

                                    return (
                                      <div key={crit.key} className="space-y-1">
                                        <p className="font-semibold text-blue-900">
                                          {crit.label}
                                          {critData.score && (
                                            <span className="ml-1 text-blue-800">(Band {critData.score})</span>
                                          )}
                                        </p>
                                        {critText && (
                                          <p className="text-gray-800 whitespace-pre-line">
                                            {critText}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Writing feedback summary (shown below tasks) */}
                {testType === 'writing' && Object.keys(writingFeedback).length > 0 && (
                  <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-900 mb-3">Your Writing Feedback (Like a Teacher&apos;s Report)</h3>
                    <p className="text-sm text-green-900 mb-4">
                      Below is friendly feedback on each task, with clear comments for each IELTS criterion and ideas to improve your skills.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-900">
                      {['task1', 'task2'].map((taskKey, idx) => {
                        const fb = writingFeedback[taskKey];
                        if (!fb) return null;

                        // Overall teacher-style summary
                        const overallText =
                          typeof fb.overall_feedback === 'string'
                            ? fb.overall_feedback.replace(/```json|```/g, '').trim()
                            : '';

                        const criteria = [
                          { key: 'task_achievement', label: 'Task Response' },
                          { key: 'coherence_cohesion', label: 'Coherence & Cohesion' },
                          { key: 'lexical_resource', label: 'Lexical Resource' },
                          { key: 'grammatical_accuracy', label: 'Grammatical Range & Accuracy' }
                        ];

                        return (
                          <div key={taskKey} className="space-y-3">
                            <p className="font-semibold text-base">
                              {idx === 0 ? 'Task 1 – Graph/Chart' : 'Task 2 – Essay'}
                              {fb.band_score && (
                                <span className="ml-2 text-green-800">(Estimated overall band: {fb.band_score})</span>
                              )}
                            </p>

                            {overallText && (
                              <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                {overallText}
                              </p>
                            )}

                            <div className="space-y-3 border-t border-green-200 pt-3">
                              {criteria.map((crit) => {
                                const critData = fb[crit.key];
                                if (!critData) return null;

                                const critText =
                                  typeof critData.feedback === 'string'
                                    ? critData.feedback.replace(/```json|```/g, '').trim()
                                    : '';

                                return (
                                  <div key={crit.key} className="space-y-1">
                                    <p className="font-semibold text-green-900">
                                      {crit.label}
                                      {critData.score && (
                                        <span className="ml-1 text-green-800">(Band {critData.score})</span>
                                      )}
                                    </p>
                                    {critText && (
                                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                                        {critText}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    data-testid="prev-question-btn"
                    variant="outline"
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentQuestion < totalQuestions - 1 ? (
                    <Button
                      data-testid="next-question-btn"
                      onClick={() => setCurrentQuestion(currentQuestion + 1)}
                      className="primary-gradient text-white"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      data-testid="submit-test-btn"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      {submitting ? 'Submitting & Evaluating...' : 'Submit Test'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
  );
}
