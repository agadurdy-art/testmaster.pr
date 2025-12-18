import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Clock, ChevronLeft, ChevronRight, Send, Mic, Square, Play, Pause } from 'lucide-react';
import { getTests, submitTest, transcribeAudio, evaluateWriting, evaluateSpeaking, startSpeakingSession } from '../lib/api';
import { formatTime } from '../lib/utils';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';

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

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const listeningAudioRef = useRef(null);
  const speakingQuestionAudioRef = useRef(null);
  const speakingQuestionTimeoutRef = useRef(null);

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
      setAvailableTests(tests);
      if (tests.length > 0) {
        let selectedTest = tests[0];

        if (testType === 'reading') {
          // Prefer a test titled with 'Test 1' if available; otherwise use first
          const test1 = tests.find(t => t.title && t.title.toLowerCase().includes('test 1'));
          if (test1) {
            selectedTest = test1;
          }
        }

        if (testType === 'listening') {
          // Prefer Test 2 if available (by title), otherwise fall back to first
          const test2 = tests.find(t => t.title && t.title.includes('Test 2'));
          if (test2) {
            selectedTest = test2;
          }
        }

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
        msg = t('paywallSpeakingNoCredits');
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
  // Pre-recorded British audio for speaking questions (single combined file with timestamps)
  const speakingAudioUrlTest1 = 'https://customer-assets.emergentagent.com/job_ielts-buddy-11/artifacts/madyib68_ElevenLabs_2025-11-30T13_18_42_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3';
  const speakingAudioUrlTest2 = 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/psaeevf4_ElevenLabs_2025-12-02T14_47_58_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3';

  // Additional per-question ElevenLabs audio files for Speaking Practice Test 1 and 2
  const speakingAudioTest1PerQuestion = {
    // Test 1 Part 1 – International food (Q1–4)
    1: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/jai2ksg9_ElevenLabs_2025-12-02T15_28_04_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    2: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/b1n0vr85_ElevenLabs_2025-12-02T15_28_32_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    3: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/3cg9faj4_test%201%20Q3.mp3',
    4: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/idnsfuch_test%201%20Q4.mp3',
    5: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/e5tz00s4_Test%201%20Q5.mp3',
    // Test 1 Part 3 – school rules / law discussion (Q6–10)
    6: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/kv15nw42_Test%201%20Q6.mp3',
    7: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/g22m93zq_Test%201%20Q7.mp3',
    8: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/jx5j5icm_test%201%20q8.mp3',
    9: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/zzmd5x0b_test%201%20Q9.mp3',
    10: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/4n4t1ua0_test%201%20Q10.mp3',
    // Test 1 Part 3 – legal profession (Q11)
    11: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/vcetv83l_ElevenLabs_2025-12-02T15_31_49_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
  };

  const speakingAudioTest2PerQuestion = {
    1: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/ahzvigmt_ElevenLabs_2025-12-02T15_07_35_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    2: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/l0bu9hot_ElevenLabs_2025-12-02T15_08_00_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    3: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/w6rxtg7d_ElevenLabs_2025-12-02T15_08_18_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    4: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/3l2c03zk_ElevenLabs_2025-12-02T15_08_35_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    // Q5 uses the combined Test 2 audio with timings (Part 2 cue card)
    6: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/do18iez3_ElevenLabs_2025-12-02T15_09_12_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    7: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/8md1sht7_ElevenLabs_2025-12-02T15_09_28_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    8: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/y2fq4ufb_ElevenLabs_2025-12-02T15_09_44_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    9: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/u3sbwqu2_ElevenLabs_2025-12-02T15_10_09_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    10: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/ssdocb39_ElevenLabs_2025-12-02T15_10_27_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
    11: 'https://customer-assets.emergentagent.com/job_testmaster-18/artifacts/k7h279r5_ElevenLabs_2025-12-02T15_10_41_Daniel_pre_sp100_s50_sb75_se0_b_m2.mp3',
  };

  // Timings for pre-recorded British audio for Speaking Practice Test 1 (Q1–Q11)
  const speakingQuestionTimingsTest1 = {
    1: { start: 11, end: 16 },  // Q1: Can you find food from many different countries... (+ Why/Why not?)
    2: { start: 17, end: 22 },  // Q2: How often do you eat typical food from other countries? (+ Why/Why not?)
    3: { start: 23, end: 27 },  // Q3: Have you ever tried making food from another country? [Why/Why not?]
    4: { start: 29, end: 33 },  // Q4: What food from your country would you recommend...
    5: { start: 36, end: 54 },  // Q5: Part 2 cue card (describe a law...)
    6: { start: 71, end: 75 },  // Q6: What kinds of rules are common in a school?
    7: { start: 76, end: 78 },  // Q7: How important is it to have rules in a school?
    8: { start: 79, end: 83 },  // Q8: What do you recommend should happen if children break school rules?
    9: { start: 90, end: 92 },  // Q9: Can you suggest why many students decide to study law at university?
    10: { start: 93, end: 96 }, // Q10: What are the key personal qualities needed to be a successful lawyer?
    11: { start: 97, end: 99 }  // Q11: Do you agree that working in the legal profession is very stressful?
  };

  // Timings for pre-recorded British audio for Speaking Practice Test 2 (approximate per ElevenLabs file, Q1–Q11)
  const speakingQuestionTimingsTest2 = {
    1: { start: 14, end: 17 },   // Q1: Have you travelled a lot by plane? To where? Why not?
    2: { start: 18, end: 21 },   // Q2: Why do you think some people enjoy travelling by plane?
    3: { start: 22, end: 25 },   // Q3: Would you like to live near an airport? Why? Why not?
    4: { start: 26, end: 32 },   // Q4: In the future, do you think that you will travel by plane more often? Why/Why not?
    5: { start: 33, end: 54 },   // Q5: Full Part 2 cue card (describe a person...)
    6: { start: 113, end: 119 }, // Q6: What types of school prizes do children in your country receive? (+ advantages)
    7: { start: 113, end: 119 }, // Q7: What do you think are the advantages of rewarding schoolchildren for good work? (same clip)
    8: { start: 125, end: 131 }, // Q8: Do you agree that it's more important for children to receive rewards from their parents than from teachers?
    9: { start: 134, end: 146 }, // Q9: Do you think that some sportspeople (e.g., top footballers) are paid too much money? (+ same prize money)
    10: { start: 134, end: 146 },// Q10: Should everyone on a team get the same prize money when they win? (same clip)
    11: { start: 147, end: 152 } // Q11: Do you agree with the view that, in sport, taking part is more important than winning?
  };

  const playSpeakingQuestionAudio = (questionIndex, questionText) => {
    const qNumber = questionIndex + 1;
    const isTest2 = test?.title && test.title.includes('Test 2');

    // Prefer dedicated per-question audio when available
    if (speakingQuestionAudioRef.current) {
      const directSrc = isTest2
        ? speakingAudioTest2PerQuestion[qNumber]
        : speakingAudioTest1PerQuestion[qNumber];
      if (directSrc) {
        try {
          const audio = speakingQuestionAudioRef.current;
          audio.src = directSrc;
          if (speakingQuestionTimeoutRef.current) {
            clearTimeout(speakingQuestionTimeoutRef.current);
          }
          audio.currentTime = 0;
          audio.play();
          return;
        } catch (err) {
          console.error('Speaking question audio error (per-question):', err);
        }
      }
    }

    const timing = isTest2 ? speakingQuestionTimingsTest2[qNumber] : speakingQuestionTimingsTest1[qNumber];

    // If we have a timing, use pre-recorded audio for a natural British voice
    if (timing && speakingQuestionAudioRef.current) {
      try {
        const audio = speakingQuestionAudioRef.current;
        // Use the appropriate audio file based on selected speaking test
        audio.src = isTest2 ? speakingAudioUrlTest2 : speakingAudioUrlTest1;
        if (speakingQuestionTimeoutRef.current) {
          clearTimeout(speakingQuestionTimeoutRef.current);
        }
        audio.currentTime = timing.start;
        audio.play();
        const duration = (timing.end - timing.start) * 1000;
        speakingQuestionTimeoutRef.current = setTimeout(() => {
          audio.pause();
        }, duration);
        return;
      } catch (err) {
        console.error('Speaking question audio error:', err);
        toast.error('Could not play question audio');
      }
    }

    // Fallback: use browser text-to-speech for questions without pre-recorded audio
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        toast.error('Question audio is not supported in this browser.');
        return;
      }
      if (!questionText) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(questionText);
      utterance.lang = 'en-GB';
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speaking question TTS error:', err);
      toast.error('Could not play question audio');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pb-32">
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

      {/* NOTE: Payments not live yet – mark extra tests as coming soon but do not block.
          Once SePay/MoMo is integrated, Test 2+ can be hard-gated based on user subscription/credits.
       */}
      {/* Listening test selector when multiple tests are available */}
      {testType === 'listening' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Listening Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    (testOption.questions || []).forEach((q) => {
                      initial[q.id] = '';
                    });
                    setAnswers(initial);
                  }}
                >
                  {testOption.title || 'Listening Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reading test selector when multiple tests are available */}
      {testType === 'reading' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Reading Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    (testOption.questions || []).forEach((q) => {
                      initial[q.id] = '';
                    });
                    setAnswers(initial);
                    setCurrentQuestion(0);
                  }}
                >
                  {testOption.title || 'Reading Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Speaking test selector when multiple tests are available */}
      {testType === 'speaking' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Speaking Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    const allQuestions = testOption.parts?.flatMap(part => part.questions || []) || [];
                    const meta = testOption.questions || [];
                    allQuestions.forEach((_, idx) => {
                      const metaId = meta[idx]?.id ?? idx + 1;
                      initial[metaId] = '';
                    });
                    setAnswers(initial);
                    setCurrentQuestion(0);
                  }}
                >
                  {testOption.title || 'Speaking Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}
      {/* Writing test selector when multiple tests are available */}
      {testType === 'writing' && availableTests && availableTests.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="mb-2 text-xs font-medium text-gray-700 uppercase tracking-wide">
            Select Writing Test
          </div>
          <div className="mb-4 flex items-center space-x-2 text-sm overflow-x-auto pb-1">
            {availableTests.map((testOption) => {
              const isPremium = testOption.title && /Test\s*(\d+)/i.test(testOption.title) &&
                parseInt(testOption.title.match(/Test\s*(\d+)/i)[1], 10) >= 2;
              const premiumLocked = isPremium && !(user?.plan === 'pro' || (user?.examCredits ?? 0) > 0);
              return (
                <Button
                  key={testOption.id}
                  variant={testOption.id === test?.id ? 'default' : 'outline'}
                  size="sm"
                  disabled={premiumLocked}
                  onClick={() => {
                    if (premiumLocked) {
                      toast.error(t('paywallNeedProOrCredits'));
                      return;
                    }
                    setTest(testOption);
                    setTimeLeft(testOption.duration * 60);
                    const initial = {};
                    (testOption.questions || []).forEach((q) => {
                      initial[q.id] = '';
                    });
                    setAnswers(initial);
                    setCurrentQuestion(0);
                  }}
                >
                  {testOption.title || 'Writing Test'}{premiumLocked ? ' 🔒' : ''}
                </Button>
              );
            })}
          </div>
        </div>
      )}



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
                    <p className="text-yellow-200 text-xs font-semibold">
                      Get credits to continue practicing
                    </p>
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
          <div className="flex flex-col lg:flex-row gap-4 min-h-[calc(100vh-220px)] lg:h-[calc(100vh-220px)] mb-20">
            {/* Left Column - Passage (~75% width) */}
            <div className="lg:w-3/4 flex flex-col">
              <Card className="flex-1 overflow-hidden flex flex-col">
                {/* Passage Header */}
                <div className="p-4 border-b bg-gradient-to-r from-sky-50 to-blue-50">
                  <h2 className="text-lg font-bold text-gray-900">
                    {test.passages?.[currentPassage - 1]?.title || `Passage ${currentPassage}`}
                  </h2>
                </div>
                {/* Passage Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                    {test.passages?.[currentPassage - 1]?.text || 'No passage content available.'}
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column - Questions (~25% width) */}
            <div className="lg:w-1/4 flex flex-col min-w-[300px]">
              <Card className="flex-1 overflow-hidden flex flex-col">
                {/* Passage Tabs */}
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((passageNum) => {
                      const passageQuestions = test.questions?.filter(q => q.passage === passageNum) || [];
                      const answeredCount = passageQuestions.filter(q => answers[q.id]).length;
                      return (
                        <button
                          key={passageNum}
                          onClick={() => setCurrentPassage(passageNum)}
                          className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            currentPassage === passageNum
                              ? 'bg-sky-500 text-white'
                              : answeredCount === passageQuestions.length && passageQuestions.length > 0
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border'
                          }`}
                        >
                          <div>P{passageNum}</div>
                          <div className="text-[10px] opacity-75">
                            {answeredCount}/{passageQuestions.length}
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
                        }
                      };
                      
                      return passageQuestions.map((q, idx) => {
                        const showTaskHeader = q.type !== currentType;
                        currentType = q.type;
                        const taskInfo = taskDescriptions[q.type] || { title: q.type?.replace(/_/g, ' '), instruction: 'Answer the following questions.' };
                        const isAnswered = !!answers[q.id];
                        
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
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mr-2">
                              {q.id}
                            </span>
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

                          {q.type === 'multiple_choice' && q.options && (
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
                          )}

                          {(q.type === 'sentence_completion' || q.type === 'form_completion' || 
                            q.type === 'note_completion' || q.type === 'matching_information' || 
                            q.type === 'matching_headings' || q.type === 'summary_completion') && (
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
        ) : testType === 'listening' ? (
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
                  src={test.sections?.[Math.floor(currentQuestion / 10)]?.audio_url}
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

              {/* Question Numbers Grid - Compact */}
              <Card className="p-3 flex-1 overflow-y-auto">
                <h3 className="font-semibold text-gray-700 text-sm mb-2">Questions</h3>
                <div className="grid grid-cols-5 gap-1">
                  {test.questions?.slice(
                    Math.floor(currentQuestion / 10) * 10,
                    (Math.floor(currentQuestion / 10) + 1) * 10
                  ).map((q, idx) => {
                    const questionNumber = Math.floor(currentQuestion / 10) * 10 + idx;
                    const isAnswered = !!answers[q.id];
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          const el = document.getElementById(`q-${questionNumber}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                          isAnswered
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {questionNumber + 1}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right Column - Questions (~75% width) */}
            <div className="lg:w-3/4 flex flex-col">
              <Card className="flex-1 overflow-hidden flex flex-col">
                {/* Questions Header */}
                <div className="p-4 border-b bg-gradient-to-r from-sky-50 to-blue-50">
                  <h2 className="text-lg font-bold text-gray-900">
                    Part {Math.floor(currentQuestion / 10) + 1} - Questions {Math.floor(currentQuestion / 10) * 10 + 1}-{(Math.floor(currentQuestion / 10) + 1) * 10}
                  </h2>
                </div>

                {/* Questions List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Task descriptions for Listening */}
                    {(() => {
                      const partQuestions = test.questions?.slice(
                        Math.floor(currentQuestion / 10) * 10,
                        (Math.floor(currentQuestion / 10) + 1) * 10
                      ) || [];
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
                        }
                      };
                      
                      return partQuestions.map((q, idx) => {
                        const questionNumber = Math.floor(currentQuestion / 10) * 10 + idx;
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
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sky-100 text-sky-700 text-xs font-bold mr-2">
                          {questionNumber + 1}
                        </span>
                        {q.question}
                      </p>
                      
                      {/* Map labeling special display */}
                          {q.type === 'map_labeling' && questionNumber === 15 && (
                            <div className="mt-3 mb-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                              <p className="text-center text-gray-900 font-bold mb-2">Farley House Map</p>
                              <img 
                                src="https://customer-assets.emergentagent.com/job_ieltsace/artifacts/nh3dkxxe_Screenshot%202025-11-22%20at%2015.34.39.png" 
                                alt="Farley House Map"
                                className="w-full h-auto max-w-md mx-auto"
                              />
                            </div>
                          )}
                          
                          {/* Matching statements display */}
                          {q.type === 'matching' && questionNumber === 30 && (
                            <div className="mt-3 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
                              <p className="font-semibold mb-2">Choose from statements A-H:</p>
                              <div className="grid grid-cols-1 gap-1 text-gray-600">
                                <div><strong>A</strong> Easy to find out how</div>
                                <div><strong>B</strong> Should be improved</div>
                                <div><strong>C</strong> May not work with all products</div>
                                <div><strong>D</strong> Retailers should encourage</div>
                                <div><strong>E</strong> More financial support needed</div>
                                <div><strong>F</strong> Most people know little</div>
                                <div><strong>G</strong> Stricter regulations needed</div>
                                <div><strong>H</strong> Could be dangerous</div>
                              </div>
                            </div>
                          )}

                          {/* Answer Input */}
                          {(q.type === 'map_labeling' || q.type === 'matching') ? (
                            <Input
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value.toUpperCase())}
                              placeholder="Letter (A-H)"
                              className="w-24 text-center text-sm font-semibold"
                              maxLength={1}
                            />
                          ) : (
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
        ) : (
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
            )}
          </Card>
        </div>
        )}
      </div>
    </div>
  );
}
