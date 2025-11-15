import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Clock, ChevronLeft, ChevronRight, Send, Mic, Square } from 'lucide-react';
import { getTests, submitTest, transcribeAudio, getSpeakingQuestions } from '../lib/api';
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
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    loadTest();
  }, [testType]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && test) {
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
        
        // Initialize answers
        const initialAnswers = {};
        selectedTest.questions?.forEach(q => {
          initialAnswers[q.id] = '';
        });
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
        
        try {
          const result = await transcribeAudio(file);
          const question = test.questions[currentQuestion];
          handleAnswerChange(question.id, result.text);
          toast.success('Audio transcribed successfully!');
        } catch (error) {
          toast.error('Failed to transcribe audio');
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
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
      navigate(`/results/${result.id}`);
    } catch (error) {
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

  const question = test.questions?.[currentQuestion];

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
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <Card className="lg:col-span-1 p-4 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Questions</h3>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {test.questions?.map((q, idx) => (
                <button
                  key={q.id}
                  data-testid={`question-nav-${idx}`}
                  onClick={() => setCurrentQuestion(idx)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    idx === currentQuestion
                      ? 'bg-sky-500 text-white'
                      : answers[q.id]
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
            {question && (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Question {currentQuestion + 1} of {test.questions.length}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {question.question}
                  </h2>

                  {/* Reading passage */}
                  {testType === 'reading' && test.passages && (
                    <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-96 overflow-y-auto">
                      <h3 className="font-semibold text-lg mb-3">
                        {test.passages[question.passage - 1]?.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {test.passages[question.passage - 1]?.text}
                      </p>
                    </div>
                  )}

                  {/* Multiple Choice */}
                  {question.type === 'multiple_choice' && (
                    <div className="space-y-3">
                      {question.options?.map((option, idx) => (
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

                  {/* True/False */}
                  {question.type === 'true_false' && (
                    <div className="space-y-3">
                      {['True', 'False', 'Not Given'].map((option) => (
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

                  {/* Fill in Blank / Short Answer */}
                  {(question.type === 'fill_blank' || question.type === 'matching') && (
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
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Words: {(answers[question.id] || '').split(/\s+/).filter(Boolean).length} / {question.word_limit}
                      </p>
                    </div>
                  )}

                  {/* Speaking Question */}
                  {testType === 'speaking' && (
                    <div className="space-y-4">
                      <Textarea
                        data-testid="speaking-textarea"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Your response will appear here after recording..."
                        className="min-h-[200px] text-lg p-4"
                      />
                      <div className="flex gap-3">
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
                            className="bg-red-500 text-white"
                          >
                            <Square className="w-4 h-4 mr-2" />
                            Stop Recording
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                  
                  {currentQuestion < test.questions.length - 1 ? (
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
                      {submitting ? 'Submitting...' : 'Submit Test'}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
