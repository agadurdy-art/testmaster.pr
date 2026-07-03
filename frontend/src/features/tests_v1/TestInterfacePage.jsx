import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Clock, Mic, BookMarked } from 'lucide-react';
import { getTests, submitTest, transcribeAudio, evaluateWriting, evaluateSpeaking, startSpeakingSession } from '../../lib/api';
import { formatTime } from '../../lib/utils';
import { toast } from 'sonner';
import { useI18n } from '../../lib/i18n';
import NotebookPanel from '../../components/NotebookPanel';
import TestSelectors from './components/TestSelectors';
import ReadingTestView from './components/ReadingTestView';
import ListeningTestView from './components/ListeningTestView';
import DefaultTestView from './components/DefaultTestView';
import useSpeakingQuestionAudio from './hooks/useSpeakingQuestionAudio';

export default function TestInterface({ user }) {
  const { testType } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentPassage, setCurrentPassage] = useState(1); // For reading test passage navigation
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

// ElevenLabs examiner widget controller (only for logged-in users on speaking test page)
function ElevenLabsExaminer() {
  React.useEffect(() => {
    const widget = document.getElementById('ielts-ace-examiner');
    if (!widget) return;
    widget.style.display = 'block';

    return () => {
      widget.style.display = 'none';
    };
  }, []);

  return null;
}

  const [loading, setLoading] = useState(true);
  const [availableTests, setAvailableTests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listeningAudioPlaying, setListeningAudioPlaying] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState({});
  const [speakingFeedback, setSpeakingFeedback] = useState({});
  const [speakingSessionStarted, setSpeakingSessionStarted] = useState(false);
  const [speakingCredits, setSpeakingCredits] = useState(user?.examCredits ?? 0);
  
  // Phase 2: Notebook state for reading/listening tests
  const [showNotebook, setShowNotebook] = useState(false);
  
  // NEW: Layout controls for reading test
  const [passageRatio, setPassageRatio] = useState(75);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const layoutPresets = [
    { label: '50-50', value: 50 },
    { label: '60-40', value: 60 },
    { label: '70-30', value: 70 },
    { label: '75-25', value: 75 },
  ];

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const listeningAudioRef = useRef(null);
  const { speakingQuestionAudioRef, playSpeakingQuestionAudio } = useSpeakingQuestionAudio(test);

  // Premium access / free trial helper functions
  const canAccessPremium = (user?.plan === 'pro') || ((user?.examCredits ?? 0) > 0);
  const hasFreeTrial = (user?.ai_interview_free_seconds_used ?? 0) < 180;
  
  const isPremiumTest = (title) => {
    if (!title) return false;
    const match = title.match(/Test\s*(\d+)/i);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num >= 2;
  };
  
  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);
  
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
      
      // Sort tests by test number extracted from title (Test 1 before Test 2, etc.)
      const sortedTests = [...tests].sort((a, b) => {
        const getTestNumber = (title) => {
          if (!title) return 999;
          const match = title.match(/Test\s*(\d+)/i);
          return match ? parseInt(match[1], 10) : 999;
        };
        return getTestNumber(a.title) - getTestNumber(b.title);
      });
      
      setAvailableTests(sortedTests);
      
      if (sortedTests.length > 0) {
        // Always select the first test (Test 1) after sorting
        const selectedTest = sortedTests[0];

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

  const handleStartSpeakingSession = async () => {
    // Check credits first - redirect to pricing if no credits
    if (!hasFreeTrial && speakingCredits <= 0) {
      toast.info('You need credits to use AI Speaking examiner. Redirecting to pricing...');
      navigate('/pricing?from=speaking');
      return;
    }
    
    try {
      const data = await startSpeakingSession(user.email);
      setSpeakingSessionStarted(true);
      setSpeakingCredits(data.remainingCredits);
      const updatedUser = {
        ...user,
        examCredits: data.remainingCredits,
        plan: data.plan,
        ai_interview_free_seconds_used:
          data.freeTrialSecondsUsed ?? user.ai_interview_free_seconds_used ?? 0,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (data.freeTrial) {
        toast.success(t('speakingFreeTrialStarted'));
      } else {
        toast.success(`${t('speakingSessionStarted')} ${data.remainingCredits}`);
      }
    } catch (err) {
      console.error('Start speaking session error:', err);
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail;
      let msg = detail || 'Could not start speaking session. Please try again.';
      if (status === 402) {
        // No credits - redirect to pricing
        toast.error(t('paywallSpeakingNoCredits'));
        navigate('/pricing?from=speaking');
        return;
      }
      toast.error(msg);
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
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // Store feedback in local variables to pass to backend (state updates are async)
      let writingFeedbackToSubmit = null;
      let speakingFeedbackToSubmit = null;
      
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
        writingFeedbackToSubmit = feedbackSummary; // Use local variable for immediate submission
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
        speakingFeedbackToSubmit = feedbackSummary; // Use local variable for immediate submission
      }
      
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        // Combined "Choose TWO" question IDs ("20-21") must keep their string
        // form; parseInt strips the dash and the backend can't match the
        // answer_key entry, dropping 4 questions from the result page.
        question_id: (questionId.includes('-') || questionId.includes(','))
          ? questionId
          : parseInt(questionId),
        answer: answer
      }));

      // Build submission payload with feedback for writing/speaking
      const submissionPayload = {
        user_id: user.id,
        test_id: test.id,
        test_type: testType,
        answers: formattedAnswers,
        time_taken: (test.duration * 60) - timeLeft,
        language: language
      };
      
      // Include writing feedback if available (use local variable, not state)
      if (testType === 'writing' && writingFeedbackToSubmit && Object.keys(writingFeedbackToSubmit).length > 0) {
        submissionPayload.writing_feedback = writingFeedbackToSubmit;
        console.log('Writing feedback to submit:', writingFeedbackToSubmit);
      }
      
      // Include speaking feedback if available (use local variable, not state)
      if (testType === 'speaking' && speakingFeedbackToSubmit && Object.keys(speakingFeedbackToSubmit).length > 0) {
        submissionPayload.speaking_feedback = speakingFeedbackToSubmit;
        console.log('Speaking feedback to submit:', speakingFeedbackToSubmit);
      }

      const result = await submitTest(submissionPayload);

      toast.success('Test submitted successfully!');
      // Navigate to results page for all test types
      navigate(`/results/${result.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{testType} Test</h1>
            <p className="text-sm text-gray-600">{test.title}</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Notebook button for reading/listening tests */}
            {(testType === 'reading' || testType === 'listening') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotebook(!showNotebook)}
                className={`${showNotebook ? 'bg-amber-100 border-amber-300' : ''}`}
              >
                <BookMarked className="w-4 h-4 mr-1" />
                Notes
              </Button>
            )}
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

      {/* Notebook Panel for reading/listening tests */}
      {(testType === 'reading' || testType === 'listening') && (
        <NotebookPanel
          user={user}
          testId={test?.id}
          testType={testType}
          isOpen={showNotebook}
          onClose={() => setShowNotebook(false)}
        />
      )}

      <TestSelectors
        testType={testType}
        availableTests={availableTests}
        test={test}
        user={user}
        t={t}
        setTest={setTest}
        setTimeLeft={setTimeLeft}
        setAnswers={setAnswers}
        setCurrentQuestion={setCurrentQuestion}
      />



      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Speaking mode selector */}
        {testType === 'speaking' && (
          <>
            {/* AI Examiner Hero Card - Prominent & Always Visible */}
            <Card className={`mb-6 p-6 border-2 transition-all duration-300 ${
              speakingSessionStarted 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 shadow-lg shadow-green-200' 
                : 'bg-gradient-to-r from-violet-600 to-purple-700 border-violet-400 shadow-lg shadow-violet-200'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    speakingSessionStarted ? 'bg-white/20' : 'bg-white/20'
                  }`}>
                    {speakingSessionStarted ? (
                      <div className="relative">
                        <Mic className="w-8 h-8 text-white animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                      </div>
                    ) : (
                      <Mic className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      {speakingSessionStarted ? '🎙️ AI Examiner Active' : '🎯 Live AI Speaking Examiner'}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {speakingSessionStarted 
                        ? 'Your AI examiner is ready! Click the chat bubble to start speaking.'
                        : 'Practice with a real-time AI examiner that gives instant feedback'}
                    </p>
                    {hasFreeTrial && !speakingSessionStarted && (
                      <p className="text-yellow-200 text-xs font-semibold mt-1">
                        ✨ 3 minutes FREE trial available!
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  {!speakingSessionStarted ? (
                    <Button
                      size="lg"
                      disabled={!hasFreeTrial && speakingCredits <= 0}
                      onClick={handleStartSpeakingSession}
                      className="bg-white text-violet-700 hover:bg-gray-100 font-bold shadow-lg px-6 py-3 text-base"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start AI Interview
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-semibold">Session Active</span>
                    </div>
                  )}
                  <p className="text-white/70 text-xs">
                    Credits: <span className="font-bold text-white">{speakingCredits}</span> remaining
                  </p>
                  {!hasFreeTrial && speakingCredits <= 0 && (
                    <Button
                      size="sm"
                      onClick={() => navigate('/pricing?from=speaking')}
                      className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold shadow-lg"
                    >
                      Get Credits to Practice
                    </Button>
                  )}
                </div>
              </div>
            </Card>
            {/* ElevenLabs examiner widget */}
            {speakingSessionStarted && (
              <div className="fixed bottom-6 right-6 z-40">
                <ElevenLabsExaminer />
              </div>
            )}
          </>
        )}

        {/* READING TEST - New Two-Column Layout */}
        {testType === 'reading' ? (
          <ReadingTestView
            test={test}
            user={user}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            currentPassage={currentPassage}
            setCurrentPassage={setCurrentPassage}
            passageRatio={passageRatio}
            setPassageRatio={setPassageRatio}
            layoutPresets={layoutPresets}
            flaggedQuestions={flaggedQuestions}
            handleSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : testType === 'listening' ? (
          <ListeningTestView
            test={test}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            listeningAudioRef={listeningAudioRef}
            setListeningAudioPlaying={setListeningAudioPlaying}
            handleSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <DefaultTestView
            testType={testType}
            test={test}
            question={question}
            totalQuestions={totalQuestions}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            answers={answers}
            handleAnswerChange={handleAnswerChange}
            listeningAudioPlaying={listeningAudioPlaying}
            setListeningAudioPlaying={setListeningAudioPlaying}
            listeningAudioRef={listeningAudioRef}
            recording={recording}
            startRecording={startRecording}
            stopRecording={stopRecording}
            audioBlob={audioBlob}
            playAudio={playAudio}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            audioRef={audioRef}
            speakingQuestionAudioRef={speakingQuestionAudioRef}
            playSpeakingQuestionAudio={playSpeakingQuestionAudio}
            speakingFeedback={speakingFeedback}
            writingFeedback={writingFeedback}
            handleSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}
