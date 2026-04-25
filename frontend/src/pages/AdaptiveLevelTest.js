import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Textarea } from '../components/ui/textarea';
import { 
  Mic, Square, ChevronRight, Award, BookOpen, ArrowLeft, Target, 
  Sparkles, Clock, Brain, Zap, Trophy, TrendingUp, CheckCircle,
  AlertCircle, Rocket, GraduationCap, Star
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdaptiveLevelTest({ user }) {
  const navigate = useNavigate();
  
  // Stage management
  const [stage, setStage] = useState('intro'); // intro, assessment, reading, speaking, writing, evaluating, results
  const [experienceLevel, setExperienceLevel] = useState('');
  const [startingLevel, setStartingLevel] = useState('');
  const [readingQuestions, setReadingQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState({});
  const [writingResponse, setWritingResponse] = useState('');
  const [speakingResponses, setSpeakingResponses] = useState([]);
  const [currentSpeakingQ, setCurrentSpeakingQ] = useState(0);
  
  // Speaking recording
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Results
  const [results, setResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  
  // Timer
  const [testStartTime] = useState(Date.now());

  // Speaking questions (simple for now)
  const speakingQuestions = [
    { id: 1, question: "Tell me about yourself. What is your name? Where are you from? What do you do?" },
    { id: 2, question: "What do you like to do in your free time? Why do you enjoy these activities?" },
    { id: 3, question: "Describe a place you like to visit. Where is it and why do you like it?" }
  ];

  const startTest = async (level) => {
    setExperienceLevel(level);
    setStage('loading');
    
    try {
      const response = await fetch(`${API_URL}/api/adaptive-level-test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          experience_level: level
        })
      });
      
      if (!response.ok) throw new Error('Failed to start test');
      
      const data = await response.json();
      setStartingLevel(data.starting_level);
      setReadingQuestions(data.reading_questions);
      setStage('reading');
      toast.success('Test started! Answer the questions at your own pace.');
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to load test. Please try again.');
      setStage('intro');
    }
  };

  const handleReadingAnswer = (questionId, answer) => {
    setReadingAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextReadingQuestion = () => {
    if (!readingAnswers[readingQuestions[currentQuestionIndex].id]) {
      toast.error('Please select an answer before continuing');
      return;
    }
    
    if (currentQuestionIndex < readingQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to speaking
      setStage('speaking');
      setCurrentSpeakingQ(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      toast.info('Recording... Speak clearly into your microphone');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');

      const response = await fetch(`${API_URL}/api/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();
      setCurrentTranscript(data.text);
      toast.success('Audio transcribed!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Could not transcribe audio. Please try again.');
      setCurrentTranscript('');
    } finally {
      setTranscribing(false);
    }
  };

  const saveCurrentSpeaking = () => {
    if (!currentTranscript.trim()) {
      toast.error('Please record your response first');
      return;
    }

    const newResponse = {
      question: speakingQuestions[currentSpeakingQ].question,
      transcript: currentTranscript
    };

    setSpeakingResponses(prev => [...prev, newResponse]);
    setCurrentTranscript('');

    if (currentSpeakingQ < speakingQuestions.length - 1) {
      setCurrentSpeakingQ(currentSpeakingQ + 1);
      toast.success('Response saved! Moving to next question.');
    } else {
      // Move to writing
      setStage('writing');
      toast.success('Speaking section complete! Now write a short response.');
    }
  };

  const skipSpeaking = () => {
    if (currentSpeakingQ < speakingQuestions.length - 1) {
      setCurrentSpeakingQ(currentSpeakingQ + 1);
    } else {
      setStage('writing');
    }
  };

  const submitTest = async () => {
    if (!writingResponse.trim() || writingResponse.trim().split(/\s+/).length < 30) {
      toast.error('Please write at least 30 words before submitting');
      return;
    }

    setEvaluating(true);
    setStage('evaluating');

    try {
      const testDuration = Math.floor((Date.now() - testStartTime) / 1000);
      
      const response = await fetch(`${API_URL}/api/adaptive-level-test/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          initial_level: startingLevel,
          reading_answers: readingAnswers,
          writing_response: writingResponse,
          speaking_responses: speakingResponses,
          test_duration_seconds: testDuration
        })
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const data = await response.json();
      setResults(data);
      setStage('results');
      toast.success('Test evaluation complete!');
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate test. Please try again.');
      setEvaluating(false);
      setStage('writing');
    }
  };

  // ============ RENDER FUNCTIONS ============

  const renderIntro = () => (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mb-4">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🆕 New Adaptive Level Test
          </h1>
          <p className="text-lg text-gray-600">
            Discover your true English level (Band 2.0 - 9.0)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            What's New?
          </h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Full Band Range:</strong> From absolute beginner (Band 2.0) to advanced (Band 9.0)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Adaptive Testing:</strong> Questions adjust to your level automatically</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Detailed Feedback:</strong> See your specific errors with corrections</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Learning Path:</strong> Get personalized course recommendations</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 mb-8">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Test Duration: 15-25 minutes
          </h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <BookOpen className="w-6 h-6 mx-auto mb-1 text-purple-600" />
              <div className="font-semibold">Reading</div>
              <div className="text-xs text-gray-600">5-8 min</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <Mic className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <div className="font-semibold">Speaking</div>
              <div className="text-xs text-gray-600">5-8 min</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <Brain className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <div className="font-semibold">Writing</div>
              <div className="text-xs text-gray-600">5-8 min</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">
            Have you studied English before?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => startTest('beginner')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <div className="text-2xl">🌱</div>
              <div className="font-bold">No, I'm a beginner</div>
              <div className="text-xs opacity-90">Start from basics (A1)</div>
            </Button>
            
            <Button
              onClick={() => startTest('elementary')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
            >
              <div className="text-2xl">📚</div>
              <div className="font-bold">Yes, a little</div>
              <div className="text-xs opacity-90">Elementary level (A2)</div>
            </Button>
            
            <Button
              onClick={() => startTest('intermediate')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <div className="text-2xl">💪</div>
              <div className="font-bold">Yes, intermediate</div>
              <div className="text-xs opacity-90">Can hold conversations (B1)</div>
            </Button>
            
            <Button
              onClick={() => startTest('advanced')}
              className="h-auto py-4 flex flex-col items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <div className="text-2xl">🎓</div>
              <div className="font-bold">Yes, advanced</div>
              <div className="text-xs opacity-90">Fluent speaker (B2+)</div>
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-gray-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderReading = () => {
    if (!readingQuestions.length) return null;
    
    const currentQ = readingQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / readingQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Reading Section</h2>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {readingQuestions.length} · Level: {currentQ.level}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{Math.round(progress)}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            <Progress value={progress} className="mb-6" />
          </Card>

          <Card className="p-8">
            <div className="mb-6">
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <p className="text-gray-800 leading-relaxed">{currentQ.passage}</p>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-4">{currentQ.question}</h3>

              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const letter = option.split(')')[0];
                  const isSelected = readingAnswers[currentQ.id] === letter;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleReadingAnswer(currentQ.id, letter)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                onClick={nextReadingQuestion}
                disabled={!readingAnswers[currentQ.id]}
                className="primary-gradient text-white"
              >
                {currentQuestionIndex < readingQuestions.length - 1 ? 'Next Question' : 'Continue to Speaking'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderSpeaking = () => {
    const currentQ = speakingQuestions[currentSpeakingQ];
    const progress = ((currentSpeakingQ + 1) / speakingQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Speaking Section</h2>
                <p className="text-sm text-gray-600">
                  Question {currentSpeakingQ + 1} of {speakingQuestions.length}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{Math.round(progress)}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
            <Progress value={progress} className="mb-2" />
          </Card>

          <Card className="p-8">
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{currentQ.question}</h3>
              <p className="text-sm text-gray-600">Speak for 30-60 seconds. Be natural and clear.</p>
            </div>

            <div className="text-center mb-6">
              {!recording && !transcribing && !currentTranscript && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-6 text-lg"
                >
                  <Mic className="w-6 h-6 mr-2" />
                  Start Recording
                </Button>
              )}

              {recording && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-semibold text-red-600">Recording...</span>
                  </div>
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                </div>
              )}

              {transcribing && (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg font-semibold text-purple-600">Transcribing...</span>
                </div>
              )}
            </div>

            {currentTranscript && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Your Response:
                </h4>
                <p className="text-gray-800 italic">&ldquo;{currentTranscript}&rdquo;</p>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-6 border-t">
              <Button
                onClick={skipSpeaking}
                variant="ghost"
                className="text-gray-600"
              >
                Skip Question
              </Button>
              <div className="flex gap-3">
                {currentTranscript && (
                  <Button
                    onClick={() => {
                      setCurrentTranscript('');
                      toast.info('Cleared. You can record again.');
                    }}
                    variant="outline"
                  >
                    Record Again
                  </Button>
                )}
                <Button
                  onClick={saveCurrentSpeaking}
                  disabled={!currentTranscript}
                  className="primary-gradient text-white"
                >
                  {currentSpeakingQ < speakingQuestions.length - 1 ? 'Save & Next' : 'Continue to Writing'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderWriting = () => {
    const wordCount = writingResponse.trim().split(/\s+/).filter(w => w.length > 0).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Writing Section</h2>
            <p className="text-sm text-gray-600">Write a short response (minimum 30 words)</p>
          </Card>

          <Card className="p-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-6">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Topic:</h3>
              <p className="text-gray-800">
                Write about your typical day. What time do you wake up? What do you do during the day? 
                What activities do you enjoy? Try to write at least 50 words with correct grammar and punctuation.
              </p>
            </div>

            <div className="mb-4">
              <Textarea
                value={writingResponse}
                onChange={(e) => setWritingResponse(e.target.value)}
                placeholder="Start writing here..."
                className="min-h-[300px] text-base leading-relaxed"
              />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className={`font-semibold ${wordCount >= 30 ? 'text-green-600' : 'text-orange-600'}`}>
                  Word count: {wordCount} {wordCount < 30 ? '(minimum: 30)' : '✓'}
                </span>
                <span className="text-gray-500">
                  Recommended: 50-100 words
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                onClick={submitTest}
                disabled={wordCount < 30}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
              >
                Submit Test
                <Trophy className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const renderEvaluating = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluating Your Test...</h2>
        <p className="text-gray-600 mb-6">
          Our AI examiner is analyzing your responses in detail. This may take 30-60 seconds.
        </p>
        <div className="space-y-2 text-sm text-left bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
            <span>Checking reading comprehension...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <span>Analyzing speaking fluency & pronunciation...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <span>Evaluating writing grammar & vocabulary...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <span>Generating personalized learning path...</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderResults = () => {
    if (!results) return null;

    const { overall_band, cefr_level, detailed_analysis, learning_path, next_steps, estimated_time_to_next_band } = results;
    
    const bandColor = overall_band >= 7.0 ? 'green' : overall_band >= 5.5 ? 'blue' : overall_band >= 4.0 ? 'yellow' : 'orange';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <Card className="p-8 bg-gradient-to-r from-violet-600 to-purple-700 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your English Level Results</h1>
                <p className="text-violet-100">Comprehensive analysis with personalized recommendations</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center justify-center w-24 h-24 bg-white rounded-full`}>
                  <span className="text-4xl font-bold text-violet-600">{overall_band}</span>
                </div>
                <div className="mt-2 font-semibold">{cefr_level} Level</div>
              </div>
            </div>
          </Card>

          {/* Skill Breakdown */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-violet-600" />
              Skill Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { skill: 'Reading', band: results.reading_band, icon: BookOpen, color: 'blue' },
                { skill: 'Listening', band: results.listening_band, icon: Mic, color: 'green' },
                { skill: 'Writing', band: results.writing_band, icon: Brain, color: 'purple' },
                { skill: 'Speaking', band: results.speaking_band, icon: Zap, color: 'orange' }
              ].map(({ skill, band, icon: Icon, color }) => (
                <div key={skill} className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4 text-center`}>
                  <Icon className={`w-8 h-8 mx-auto mb-2 text-${color}-600`} />
                  <div className="font-semibold text-gray-900">{skill}</div>
                  <div className={`text-2xl font-bold text-${color}-600`}>
                    {band !== undefined ? band.toFixed(1) : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed Analysis - Reading */}
          {detailed_analysis.reading && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Reading Analysis
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-semibold">{detailed_analysis.reading.accuracy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Highest Level Reached:</span>
                  <span className="font-semibold">{detailed_analysis.reading.level_reached}</span>
                </div>
                
                {detailed_analysis.reading.errors && detailed_analysis.reading.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Questions to Review:</h4>
                    <div className="space-y-2">
                      {detailed_analysis.reading.errors.slice(0, 3).map((error, idx) => (
                        <div key={idx} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                          <div className="font-medium text-red-900">{error.question}</div>
                          <div className="text-red-700 mt-1">
                            Your answer: <span className="font-semibold">{error.your_answer}</span> | 
                            Correct: <span className="font-semibold">{error.correct_answer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Detailed Analysis - Writing */}
          {detailed_analysis.writing && detailed_analysis.writing.band_score && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Writing Analysis
              </h3>
              
              {detailed_analysis.writing.grammar && detailed_analysis.writing.grammar.error_examples && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Grammar Errors Found:</h4>
                  <div className="space-y-2">
                    {detailed_analysis.writing.grammar.error_examples.slice(0, 3).map((err, idx) => (
                      <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-red-600">❌ <span className="font-mono">{err.error}</span></div>
                            <div className="text-green-600">✅ <span className="font-mono">{err.correction}</span></div>
                            <div className="text-gray-600 text-xs mt-1">{err.rule}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {detailed_analysis.writing.strengths && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="font-semibold text-green-900 mb-1">✨ Strengths:</div>
                  <div className="text-sm text-green-800">
                    {Array.isArray(detailed_analysis.writing.strengths) 
                      ? detailed_analysis.writing.strengths.join(', ')
                      : detailed_analysis.writing.strengths}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Learning Path */}
          {learning_path && learning_path.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Your Personalized Learning Path
              </h3>
              <div className="space-y-4">
                {learning_path.map((phase, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                        {phase.phase}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{phase.title}</div>
                        <div className="text-xs text-gray-600">{phase.level}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {phase.courses && phase.courses.slice(0, 2).map((course, cidx) => (
                        <div key={cidx} className="flex items-start gap-2 text-sm bg-gray-50 p-3 rounded">
                          <Star className={`w-4 h-4 flex-shrink-0 mt-0.5 ${course.priority === 'HIGHEST' ? 'text-yellow-500' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <div className="font-semibold">{course.name}</div>
                            <div className="text-gray-600 text-xs">{course.content}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs font-bold ${course.price === 'FREE' ? 'text-green-600' : 'text-indigo-600'}`}>
                                {course.price}
                              </span>
                              <span className="text-xs text-gray-500">• {course.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Next Steps */}
          {next_steps && next_steps.length > 0 && (
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-pink-600" />
                Next Steps
              </h3>
              <div className="space-y-2">
                {next_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800">{step}</span>
                  </div>
                ))}
              </div>
              
              {estimated_time_to_next_band && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-900">
                    <Clock className="w-5 h-5" />
                    <div>
                      <div className="font-semibold">Time to Next Band Level:</div>
                      <div className="text-sm">{estimated_time_to_next_band}</div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pb-8">
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="primary-gradient text-white px-8"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              variant="outline"
            >
              Take Test Again
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {stage === 'intro' && renderIntro()}
      {stage === 'reading' && renderReading()}
      {stage === 'speaking' && renderSpeaking()}
      {stage === 'writing' && renderWriting()}
      {stage === 'evaluating' && renderEvaluating()}
      {stage === 'results' && renderResults()}
    </>
  );
}
