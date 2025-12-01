import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Clock, ChevronLeft, ChevronRight, Send, Mic, Square, Play, Pause } from 'lucide-react';
import { getTests, submitTest, transcribeAudio, evaluateWriting, evaluateSpeaking } from '../lib/api';
import { formatTime } from '../lib/utils';
import { toast } from 'sonner';

export default function TestInterface({ user }) {
  const { testType } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeningAudioPlaying, setListeningAudioPlaying] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState({});
  const [speakingFeedback, setSpeakingFeedback] = useState({});
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const listeningAudioRef = useRef(null);
  const speakingQuestionAudioRef = useRef(null);
  const speakingQuestionTimeoutRef = useRef(null);

  useEffect(() => {
    loadTest();
  }, [testType]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && test && answers && Object.keys(answers).length > 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const loadTest = async () => {
    try {
      const tests = await getTests(testType);
      if (tests.length > 0) {
        const selectedTest = tests[0];
        setTest(selectedTest);
        setTimeLeft(selectedTest.duration * 60);
        
        const initialAnswers = {};
        if (selectedTest.questions) {
          selectedTest.questions.forEach(q => {
            initialAnswers[q.id] = '';
          });
        }
        setAnswers(initialAnswers);
      }
    } catch (error) {
      toast.error('Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const startRecording = async () => {
    try {
      if (typeof window === 'undefined' || !navigator) {
        toast.error('Recording is not available in this environment.');
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Your browser does not support microphone recording. Please use the latest Chrome, Edge, or Firefox.');
        return;
      }

      if (typeof window.MediaRecorder === 'undefined') {
        toast.error('Audio recording is not supported in this browser. Please use the latest Chrome, Edge, or Firefox for the Speaking test.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Transcribe audio
        try {
          const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
          const result = await transcribeAudio(file);
          const question = test.questions?.[currentQuestion] || test.parts?.[currentQuestion]?.questions?.[0];
          if (question) {
            handleAnswerChange(question.id || currentQuestion, result.text);
          }
          toast.success('Audio transcribed successfully!');
        } catch (error) {
          console.error('Transcription error:', error);
          toast.error('Failed to transcribe audio');
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      toast.info('Recording started...');
    } catch (error) {
      console.error('Microphone error:', error);
      toast.error('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audioBlob);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // (Removed pre-recorded speaking question audio; using ElevenLabs examiner widget instead)

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // For Writing, get AI evaluation first (per task) and store latest feedback
      if (testType === 'writing') {
        toast.info('Evaluating your writing with AI...');
        const feedbackSummary = {};
        for (const question of test.questions) {
          if (answers[question.id]) {
            try {
              const evaluation = await evaluateWriting({
                user_id: user.id,
                task_type: question.task,
                question: question.question,
                answer: answers[question.id]
              });
              feedbackSummary[question.task] = evaluation;
              toast.success(`${question.task.toUpperCase()} evaluated: Band ${evaluation.band_score}`);
            } catch (error) {
              console.error('Evaluation error:', error);
              toast.error('AI evaluation failed, but test submitted');
            }
          }
        }
        setWritingFeedback(feedbackSummary);
      }
      
      if (testType === 'speaking') {
        toast.info('Evaluating your speaking with AI...');
        const allQuestions = test.parts?.flatMap(part => part.questions || []) || [];
        const feedbackSummary = {};
        for (let i = 0; i < allQuestions.length; i++) {
          const answerKey = test.questions?.[i]?.id ?? i;
          if (answers[answerKey]) {
            try {
              const evaluation = await evaluateSpeaking({
                user_id: user.id,
                part: Math.floor(i / 3) + 1,
                question: allQuestions[i],
                user_response: answers[answerKey]
              });
              feedbackSummary[i + 1] = evaluation;
              toast.success(`Response ${i + 1} evaluated: Band ${evaluation.band_score}`);
            } catch (error) {
              console.error('Evaluation error:', error);
              toast.error('AI speaking evaluation failed for one of your answers.');
            }
          }
        }
        setSpeakingFeedback(feedbackSummary);
      }
      
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        question_id: parseInt(questionId),
        answer: answer
      }));

      const result = await submitTest({
        user_id: user.id,
        test_id: test.id,
        test_type: testType,
        answers: formattedAnswers,
        time_taken: (test.duration * 60) - timeLeft
      });

      toast.success('Test submitted successfully!');
      // For objective tests, go to results page; for writing/speaking, stay and show AI feedback
      if (testType !== 'writing' && testType !== 'speaking') {
        navigate(`/results/${result.id}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">No tests available for this module</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  // Handle different test structures
  let question = null;
  let totalQuestions = 0;
  
  if (testType === 'speaking' && test.parts) {
    const allQuestions = test.parts.flatMap(part => part.questions || []);
    const qMeta = test.questions?.[currentQuestion] || {};
    const questionId = qMeta.id ?? currentQuestion + 1;
    const questionPart = qMeta.part ?? null;
    question = { question: allQuestions[currentQuestion] || 'Speak about the topic', id: questionId, part: questionPart };
    totalQuestions = allQuestions.length;
  } else if (test.questions) {
    question = test.questions[currentQuestion];
    totalQuestions = test.questions.length;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{testType} Test</h1>
            <p className="text-sm text-gray-600">{test.title}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-orange-100 rounded-lg test-timer">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-lg font-semibold text-orange-600">
                {formatTime(timeLeft)}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600"
            >
              Exit
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Speaking mode selector */}
        {testType === 'speaking' && (
          <Card className="mb-6 p-4 bg-blue-50 border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-900 mb-1">Choose your speaking mode</h2>
            <p className="text-sm text-blue-900 mb-2">
              You can practise in two ways:
            </p>
            <ul className="list-disc list-inside text-sm text-blue-900 space-y-1">
              <li>
                <span className="font-semibold">Mode 1 – Built-in Speaking Test:</span> Use the questions below, record your answers, and get detailed examiner-style feedback on each response directly in IELTS Ace.
              </li>
              <li>
                <span className="font-semibold">Mode 2 – Live IELTS Examiner (ElevenLabs):</span> Use the round button in the bottom-right corner of the screen (the ElevenLabs widget) to start a live IELTS-style interview using the same topics.
              </li>
            </ul>
            <p className="text-xs text-blue-800 mt-2">
              Tip: You can first practise here in Mode 1, then click the bottom-right ElevenLabs examiner button for a realistic interview in Mode 2.
            </p>
          </Card>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Section Navigator for Listening */}
          {testType === 'listening' ? (
            <Card className="lg:col-span-1 p-4 h-fit sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Parts</h3>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((part) => (
                  <button
                    key={part}
                    onClick={() => setCurrentQuestion((part - 1) * 10)}
                    className={`w-full p-3 rounded-lg font-semibold transition-colors text-left ${
                      Math.floor(currentQuestion / 10) + 1 === part
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Part {part} (Q {(part - 1) * 10 + 1}-{part * 10})
                  </button>
                ))}
              </div>
            </Card>
          ) : (
            /* Question Navigator for other tests */
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
          )}

          {/* Question Content */}
          <Card className="lg:col-span-3 p-8">
            {testType === 'listening' ? (
              /* Show all questions in the current section for Listening */
              <div className="space-y-6">
                {/* Audio Player at Top */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-lg shadow-lg mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      🎧 {test.sections?.[Math.floor(currentQuestion / 10)]?.title || 'Audio Section'}
                    </h3>
                  </div>
                  <audio
                    ref={listeningAudioRef}
                    src={test.sections?.[Math.floor(currentQuestion / 10)]?.audio_url}
                    onEnded={() => setListeningAudioPlaying(false)}
                    onPlay={() => setListeningAudioPlaying(true)}
                    onPause={() => setListeningAudioPlaying(false)}
                    controls
                    className="w-full rounded"
                    style={{height: '40px'}}
                  />
                  <p className="text-sm text-white mt-3">
                    📍 <strong>Context:</strong> {test.sections?.[Math.floor(currentQuestion / 10)]?.context}
                  </p>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Part {Math.floor(currentQuestion / 10) + 1}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Questions {Math.floor(currentQuestion / 10) * 10 + 1} - {(Math.floor(currentQuestion / 10) + 1) * 10}
                  </p>
                  
                  {/* Show all 10 questions in this part */}
                  <div className="space-y-6">
                    {test.questions?.slice(
                      Math.floor(currentQuestion / 10) * 10,
                      (Math.floor(currentQuestion / 10) + 1) * 10
                    ).map((q, idx) => {
                      const questionNumber = Math.floor(currentQuestion / 10) * 10 + idx;
                      return (
                        <div key={q.id} className="border-l-4 border-sky-500 pl-4 py-2">
                          <p className="font-semibold text-gray-900 mb-2">
                            {questionNumber + 1}. {q.question}
                          </p>
                          
                          {/* Map labeling special display */}
                          {q.type === 'map_labeling' && questionNumber >= 15 && questionNumber <= 19 && (
                            <div className="mt-4">
                              {questionNumber === 15 && (
                                <div className="bg-gray-50 p-6 rounded-lg mb-6 border-2 border-gray-300">
                                  <p className="text-center text-gray-900 text-xl font-bold mb-4">
                                    Farley House Map
                                  </p>
                                  <p className="text-sm text-gray-600 text-center mb-4">
                                    Questions 16-20: Label the map below. Write the correct letter A-H next to Questions 16-20.
                                  </p>
                                  <div className="bg-white p-4 rounded-lg border-2 border-gray-400">
                                    <img 
                                      src="https://customer-assets.emergentagent.com/job_ieltsace/artifacts/nh3dkxxe_Screenshot%202025-11-22%20at%2015.34.39.png" 
                                      alt="Farley House Map with labeled locations A-H"
                                      className="w-full h-auto"
                                      style={{maxWidth: '800px', margin: '0 auto', display: 'block'}}
                                    />
                                  </div>
                                  <div className="mt-4 p-4 bg-blue-50 rounded">
                                    <p className="text-sm text-gray-700 font-semibold mb-2">Answer the questions below:</p>
                                    <div className="text-sm text-gray-700">
                                      <p><strong>16</strong> Farm shop .........................</p>
                                      <p><strong>17</strong> Disabled entry .........................</p>
                                      <p><strong>18</strong> Adventure playground .........................</p>
                                      <p><strong>19</strong> Kitchen gardens .........................</p>
                                      <p><strong>20</strong> The Temple of the Four Winds .........................</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <Input
                                value={answers[q.id] || ''}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value.toUpperCase())}
                                placeholder="Enter letter (A-H)"
                                className="w-24 text-center text-lg font-semibold"
                                maxLength={1}
                              />
                            </div>
                          )}
                          
                          {/* Multiple choice */}
                          {(q.type === 'multiple_choice' || q.type === 'multiple_choice_two') && q.options && (
                            <div className="space-y-2 mt-2">
                              {q.options.map((option, optIdx) => (
                                <button
                                  key={optIdx}
                                  onClick={() => handleAnswerChange(q.id, option.split(')')[0])}
                                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors text-sm ${
                                    answers[q.id] === option.split(')')[0]
                                      ? 'border-sky-500 bg-sky-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Matching questions 25-30 */}
                          {q.type === 'matching' && questionNumber >= 24 && questionNumber <= 29 && (
                            <div className="mt-2">
                              {questionNumber === 24 && (
                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                  <p className="font-semibold text-gray-900 mb-3">Questions 25-30: What is the students' opinion about each of the following food trends?</p>
                                  <p className="text-sm text-gray-700 mb-3">Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.</p>
                                  <div className="bg-white p-4 rounded border-2 border-gray-300">
                                    <p className="font-bold text-center mb-2">Opinions</p>
                                    <div className="space-y-1 text-sm">
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
                                </div>
                              )}
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <p className="font-medium">{questionNumber + 1}. {q.question}</p>
                                </div>
                                <Input
                                  value={answers[q.id] || ''}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value.toUpperCase())}
                                  placeholder="Letter (A-H)"
                                  className="w-24 text-center text-lg font-semibold"
                                  maxLength={1}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Text input for other types */}
                          {(q.type === 'note_completion' || q.type === 'sentence_completion' || q.type === 'form_completion') && (
                            <Input
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              placeholder="Type your answer..."
                              className="mt-2"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Navigation for Listening sections */}
                  <div className="flex justify-between pt-6 border-t mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(Math.max(0, Math.floor(currentQuestion / 10) * 10 - 10))}
                      disabled={currentQuestion < 10}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous Part
                    </Button>
                    
                    {currentQuestion < 30 ? (
                      <Button
                        onClick={() => setCurrentQuestion((Math.floor(currentQuestion / 10) + 1) * 10)}
                        className="primary-gradient text-white"
                      >
                        Next Part
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        data-testid="submit-test-btn"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                        <Send className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
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
                        src={test.sections[Math.floor(currentQuestion / 10)]?.audio_url}
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
                      {question.image_url ? (
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
                          <h3 className="text-sm font-semibold text-blue-900 mb-2">Speaking Feedback (Like an Examiner's Notes)</h3>
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
                    <h3 className="text-xl font-semibold text-green-900 mb-3">Your Writing Feedback (Like a Teacher's Report)</h3>
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
            )
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
