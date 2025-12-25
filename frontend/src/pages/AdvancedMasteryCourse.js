import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { 
  BookOpen, ChevronLeft, ChevronRight, Home, Trophy, Star, Mic, 
  PenTool, HelpCircle, GraduationCap, Target, Sparkles, Volume2,
  Brain, Award, TrendingUp, CheckCircle, XCircle, Lightbulb, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import SideBySideReader from '../components/test/SideBySideReader';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdvancedMasteryCourse({ user }) {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentSection, setCurrentSection] = useState('vocabulary');
  const [view, setView] = useState('modules');
  const [loading, setLoading] = useState(true);
  
  // Speaking state
  const [isRecording, setIsRecording] = useState(false);
  const [speakingResponse, setSpeakingResponse] = useState('');
  const [speakingFeedback, setSpeakingFeedback] = useState(null);
  const [speakingLoading, setSpeakingLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Writing state
  const [writingResponse, setWritingResponse] = useState('');
  const [writingFeedback, setWritingFeedback] = useState(null);
  const [writingLoading, setWritingLoading] = useState(false);
  
  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => { loadModules(); }, []);

  const loadModules = async () => {
    try {
      const res = await fetch(`${API_URL}/api/advanced-mastery/modules`);
      if (res.ok) {
        const data = await res.json();
        setModules(data.sort((a, b) => a.module_number - b.module_number));
      }
    } catch (e) {
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const selectModule = async (module) => {
    try {
      const res = await fetch(`${API_URL}/api/advanced-mastery/modules/${module.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedModule(data);
        setView('module-detail');
        setCurrentSection('vocabulary');
        // Reset states
        setSpeakingResponse('');
        setSpeakingFeedback(null);
        setWritingResponse('');
        setWritingFeedback(null);
        setQuizAnswers({});
        setQuizResults(null);
        setQuizSubmitted(false);
      }
    } catch (e) {
      toast.error('Failed to load module');
    }
  };

  // TTS function
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // For now, we'll use text input - transcription can be added later
        toast.info('Recording saved! Please type your response below for evaluation.');
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Evaluation functions
  const evaluateSpeaking = async () => {
    if (!speakingResponse.trim()) {
      toast.error('Please provide your response');
      return;
    }
    setSpeakingLoading(true);
    try {
      const speaking = selectedModule.speaking;
      const question = speaking?.part3?.question || speaking?.part2?.cue_card || '';
      const modelAnswer = speaking?.part3?.band8_sample || speaking?.part2?.model_answer || '';
      
      const res = await fetch(`${API_URL}/api/advanced-mastery/evaluate-speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          model_answer: modelAnswer,
          user_response: speakingResponse,
          module_title: selectedModule.title,
          part: speaking?.part3 ? 'part3' : 'part2'
        })
      });
      if (res.ok) {
        const feedback = await res.json();
        setSpeakingFeedback(feedback);
        toast.success('Speaking evaluated!');
      }
    } catch (e) {
      toast.error('Evaluation failed');
    } finally {
      setSpeakingLoading(false);
    }
  };

  const evaluateWriting = async () => {
    if (!writingResponse.trim()) {
      toast.error('Please write your essay');
      return;
    }
    if (writingResponse.trim().split(/\s+/).length < 50) {
      toast.error('Essay too short. Write at least 250 words for Task 2.');
      return;
    }
    setWritingLoading(true);
    try {
      const writing = selectedModule.writing;
      const res = await fetch(`${API_URL}/api/advanced-mastery/evaluate-writing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: writing?.prompt || '',
          model_essay: writing?.band75_excerpt || '',
          user_response: writingResponse,
          module_title: selectedModule.title,
          examiner_analysis: writing?.examiner_analysis
        })
      });
      if (res.ok) {
        const feedback = await res.json();
        setWritingFeedback(feedback);
        toast.success('Essay evaluated!');
      }
    } catch (e) {
      toast.error('Evaluation failed');
    } finally {
      setWritingLoading(false);
    }
  };

  const handleQuizAnswer = (idx, answer) => {
    setQuizAnswers(prev => ({ ...prev, [idx]: answer }));
  };

  const submitQuiz = async () => {
    try {
      const res = await fetch(`${API_URL}/api/advanced-mastery/evaluate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: selectedModule.id,
          answers: quizAnswers
        })
      });
      if (res.ok) {
        const results = await res.json();
        setQuizResults(results);
        setQuizSubmitted(true);
        toast.success(`Quiz complete! Band: ${results.estimated_band}`);
      }
    } catch (e) {
      toast.error('Failed to submit quiz');
    }
  };

  // Render modules list
  const renderModulesList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced IELTS Mastery</h1>
            <p className="text-gray-500">Band 6.0-9.0 • Cambridge-Aligned</p>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-0 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Master Band 7-9 Skills</h2>
            <p className="text-gray-600 text-sm">
              This comprehensive curriculum is designed for learners at Band 6.0-6.5 targeting Band 7.0-9.0. 
              Master sophisticated vocabulary, complex grammar structures, and examiner-level execution across all IELTS themes.
            </p>
          </div>
        </div>
      </Card>

      {/* Modules Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((module) => (
          <Card 
            key={module.id}
            className="p-5 bg-white border-0 shadow-lg hover:shadow-xl cursor-pointer group transition-all duration-300 hover:-translate-y-1 rounded-2xl"
            onClick={() => selectModule(module)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                {module.module_number}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{module.title}</h3>
                <p className="text-xs text-gray-500 truncate">{module.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-600">
              <Zap className="w-3 h-3" />
              <span>Band 7-9 Focus</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // Render section tabs
  const renderSectionTabs = () => {
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Brain, label: 'Grammar' },
      { id: 'reading', icon: Target, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
    ];

    return (
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {sections.map(s => (
          <Button
            key={s.id}
            variant={currentSection === s.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentSection(s.id)}
            className={currentSection === s.id ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-0' : ''}
          >
            <s.icon className="w-4 h-4 mr-2" />
            {s.label}
          </Button>
        ))}
      </div>
    );
  };

  // Render vocabulary section
  const renderVocabulary = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-600" /> Advanced Vocabulary
      </h3>
      
      {/* Learning Goals */}
      {selectedModule.learning_goals && (
        <div className="mb-6 p-4 bg-amber-50 rounded-xl">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Learning Goals
          </h4>
          <ul className="space-y-1">
            {selectedModule.learning_goals.map((goal, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Vocabulary Terms */}
      <div className="space-y-4">
        {selectedModule.vocabulary?.advanced_terms?.map((term, idx) => (
          <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-amber-500">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900">{term.term}</h4>
                <p className="text-sm text-gray-500 italic">{term.usage}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => speakText(term.term)}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-gray-700 mb-2">{term.meaning}</p>
            <div className="p-3 bg-white rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800 italic">"{term.example}"</p>
            </div>
          </div>
        ))}
      </div>

      {/* Synonym Groups for Paraphrasing */}
      {selectedModule.vocabulary?.synonym_groups && selectedModule.vocabulary.synonym_groups.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Synonym Groups for Paraphrasing
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedModule.vocabulary.synonym_groups.map((group, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-700 mb-1">{group.base}:</p>
                <p className="text-sm text-gray-600">{group.synonyms.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examiner Tips */}
      {selectedModule.examiner_tips && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Examiner Tips for Band 7+
          </h4>
          <ul className="space-y-2">
            {selectedModule.examiner_tips.map((tip, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render grammar section
  const renderGrammar = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" /> {selectedModule.grammar?.title}
      </h3>
      
      <div className="space-y-6">
        {/* Explanation */}
        <div className="p-4 bg-purple-50 rounded-xl">
          <p className="text-gray-700">{selectedModule.grammar?.explanation}</p>
        </div>

        {/* Band Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-400">
            <h4 className="font-semibold text-red-800 mb-2">❌ Band 6.5 Example</h4>
            <p className="text-gray-700 italic">"{selectedModule.grammar?.band_65_example}"</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">✅ Band 8.0 Example</h4>
            <p className="text-gray-700 italic">"{selectedModule.grammar?.band_80_example}"</p>
          </div>
        </div>

        {/* Type 2 Conditional (for Environment module) */}
        {selectedModule.grammar?.band_80_example_type2 && (
          <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">✅ Band 8.0 - Type 2 Conditional</h4>
            <p className="text-gray-700 italic">"{selectedModule.grammar.band_80_example_type2}"</p>
          </div>
        )}

        {/* Type 3 Conditional (for Environment module) */}
        {selectedModule.grammar?.band_80_example_type3 && (
          <div className="p-4 bg-emerald-50 rounded-xl border-l-4 border-emerald-500">
            <h4 className="font-semibold text-emerald-800 mb-2">✅ Band 8.0 - Type 3 Conditional</h4>
            <p className="text-gray-700 italic">"{selectedModule.grammar.band_80_example_type3}"</p>
          </div>
        )}

        {/* Why it works explanation */}
        {selectedModule.grammar?.why_it_works && (
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Why This Works</h4>
            <p className="text-gray-700">{selectedModule.grammar.why_it_works}</p>
          </div>
        )}

        {/* Additional structures */}
        {selectedModule.grammar?.cleft_sentence && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Cleft Sentence</h4>
            <p className="text-gray-700 italic">"{selectedModule.grammar.cleft_sentence}"</p>
          </div>
        )}
        {selectedModule.grammar?.alternative_structure && (
          <div className="p-4 bg-indigo-50 rounded-xl">
            <h4 className="font-semibold text-indigo-800 mb-2">💡 Alternative Structure</h4>
            <p className="text-gray-700 italic">"{selectedModule.grammar.alternative_structure}"</p>
          </div>
        )}
        {selectedModule.grammar?.subjunctive_example && (
          <div className="p-4 bg-teal-50 rounded-xl">
            <h4 className="font-semibold text-teal-800 mb-2">📝 Subjunctive Example</h4>
            <p className="text-gray-700 italic">"{selectedModule.grammar.subjunctive_example}"</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Vocabulary
        </Button>
        <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render reading section
  const renderReading = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" /> {selectedModule.reading?.title}
        </h3>
        <span className="text-sm text-gray-500">
          ~{selectedModule.reading?.word_count} words
        </span>
      </div>

      {/* Reading passage with Side-by-Side */}
      <SideBySideReader
        passage={selectedModule.reading?.text || ''}
        passageTitle="Academic Reading Passage"
        defaultRatio={70}
      >
        {/* Practice Questions Preview */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">
              📚 Practice Questions ({selectedModule.reading?.questions?.length || 0})
            </h4>
            <p className="text-xs text-gray-600">
              Complete the quiz section to test your comprehension with advanced question types: True/False/Not Given, Summary Completion, Matching Information, and more.
            </p>
          </div>
          
          {/* Quick Preview of first few questions */}
          {selectedModule.reading?.questions?.slice(0, 3).map((q, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Question {idx + 1}</p>
              <p className="text-sm text-gray-700 font-medium">{q.question}</p>
            </div>
          ))}
          
          {selectedModule.reading?.questions?.length > 3 && (
            <p className="text-xs text-center text-gray-500">
              + {selectedModule.reading.questions.length - 3} more questions in Quiz section
            </p>
          )}
        </div>
      </SideBySideReader>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
        </Button>
        <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // Render speaking section
  const renderSpeaking = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-emerald-600" /> Speaking Practice
      </h3>

      <div className="space-y-6">
        {/* Part 2 Cue Card */}
        {selectedModule.speaking?.part2 && (
          <div className="p-4 bg-emerald-50 rounded-xl">
            <h4 className="font-semibold text-emerald-800 mb-2">Part 2: Cue Card</h4>
            <p className="text-gray-700 mb-3">{selectedModule.speaking.part2.cue_card}</p>
            <details className="text-sm">
              <summary className="text-emerald-600 cursor-pointer font-medium">View Model Answer</summary>
              <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                "{selectedModule.speaking.part2.model_answer}"
              </p>
            </details>
          </div>
        )}

        {/* Part 3 Discussion */}
        {selectedModule.speaking?.part3 && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Part 3: Abstract Discussion</h4>
            <p className="text-gray-700 mb-3">{selectedModule.speaking.part3.question}</p>
            <details className="text-sm">
              <summary className="text-blue-600 cursor-pointer font-medium">View Band 8 Sample</summary>
              <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                "{selectedModule.speaking.part3.band8_sample}"
              </p>
            </details>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex gap-3">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          >
            <Mic className="w-4 h-4 mr-2" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </div>

        {/* Response Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Response (type or speak)</label>
          <Textarea
            value={speakingResponse}
            onChange={(e) => setSpeakingResponse(e.target.value)}
            placeholder="Type your speaking response here for AI evaluation..."
            rows={5}
            className="w-full"
          />
        </div>

        <Button 
          onClick={evaluateSpeaking} 
          disabled={speakingLoading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
        >
          {speakingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
        </Button>

        {/* Feedback Display */}
        {speakingFeedback && (
          <div className={`p-5 rounded-xl ${speakingFeedback.band_score >= 7 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${speakingFeedback.band_score >= 7 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                Band {speakingFeedback.band_score}
              </div>
            </div>

            {/* Criteria Scores */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {speakingFeedback.fluency_coherence && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Fluency: {speakingFeedback.fluency_coherence.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.fluency_coherence.feedback}</p>
                </div>
              )}
              {speakingFeedback.lexical_resource && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-purple-600">Vocabulary: {speakingFeedback.lexical_resource.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.lexical_resource.feedback}</p>
                </div>
              )}
              {speakingFeedback.grammatical_range && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-green-600">Grammar: {speakingFeedback.grammatical_range.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.grammatical_range.feedback}</p>
                </div>
              )}
              {speakingFeedback.pronunciation && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-amber-600">Pronunciation: {speakingFeedback.pronunciation.score}</p>
                  <p className="text-xs text-gray-600">{speakingFeedback.pronunciation.feedback}</p>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3">{speakingFeedback.overall_feedback}</p>

            {speakingFeedback.suggested_improvements && (
              <div className="mt-3 p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-gray-800 mb-1">Suggestions:</p>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {speakingFeedback.suggested_improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {speakingFeedback.model_phrase_to_learn && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">📝 Phrase to Learn:</p>
                <p className="text-sm text-gray-700 italic">{speakingFeedback.model_phrase_to_learn}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('reading')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Reading
        </Button>
        <Button onClick={() => setCurrentSection('writing')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Writing <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render writing section
  const renderWriting = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-orange-600" /> Writing {selectedModule.writing?.task_type}
      </h3>

      <div className="space-y-6">
        {/* Task Prompt */}
        <div className="p-4 bg-orange-50 rounded-xl">
          <h4 className="font-semibold text-orange-800 mb-2">Task Prompt</h4>
          <p className="text-gray-700">{selectedModule.writing?.prompt}</p>
        </div>

        {/* Model Essay Excerpt */}
        <details className="p-4 bg-gray-50 rounded-xl">
          <summary className="font-semibold text-gray-800 cursor-pointer">View Band 7.5+ Model Excerpt</summary>
          <p className="mt-3 text-gray-600 italic leading-relaxed">"{selectedModule.writing?.band75_excerpt}"</p>
          
          {/* Examiner Analysis */}
          {selectedModule.writing?.examiner_analysis && (
            <div className="mt-4 p-3 bg-white rounded-lg space-y-2">
              <h5 className="font-medium text-gray-800">Examiner Analysis:</h5>
              {Object.entries(selectedModule.writing.examiner_analysis).map(([key, value]) => (
                <p key={key} className="text-sm text-gray-600">
                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}
                </p>
              ))}
            </div>
          )}
        </details>

        {/* Writing Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Essay (minimum 250 words)
          </label>
          <Textarea
            value={writingResponse}
            onChange={(e) => setWritingResponse(e.target.value)}
            placeholder="Write your essay here..."
            rows={12}
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Word count: {writingResponse.trim().split(/\s+/).filter(w => w).length}
          </p>
        </div>

        <Button 
          onClick={evaluateWriting} 
          disabled={writingLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600"
        >
          {writingLoading ? 'Evaluating...' : 'Get AI Evaluation'}
        </Button>

        {/* Feedback Display */}
        {writingFeedback && (
          <div className={`p-5 rounded-xl ${writingFeedback.band_score >= 7 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-4 py-2 rounded-xl font-bold text-lg ${writingFeedback.band_score >= 7 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                Band {writingFeedback.band_score}
              </div>
            </div>

            {/* Criteria Scores */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {writingFeedback.task_achievement && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-blue-600">Task Achievement: {writingFeedback.task_achievement.score}</p>
                  <p className="text-xs text-gray-600">{writingFeedback.task_achievement.feedback}</p>
                </div>
              )}
              {writingFeedback.coherence_cohesion && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-purple-600">Coherence: {writingFeedback.coherence_cohesion.score}</p>
                  <p className="text-xs text-gray-600">{writingFeedback.coherence_cohesion.feedback}</p>
                </div>
              )}
              {writingFeedback.lexical_resource && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-green-600">Vocabulary: {writingFeedback.lexical_resource.score}</p>
                  <p className="text-xs text-gray-600">{writingFeedback.lexical_resource.feedback}</p>
                </div>
              )}
              {writingFeedback.grammatical_range && (
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-amber-600">Grammar: {writingFeedback.grammatical_range.score}</p>
                  <p className="text-xs text-gray-600">{writingFeedback.grammatical_range.feedback}</p>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-3">{writingFeedback.overall_feedback}</p>

            {writingFeedback.strengths && (
              <div className="mt-3 p-3 bg-green-100 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">✅ Strengths:</p>
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {writingFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {writingFeedback.areas_to_improve && (
              <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                <p className="text-sm font-medium text-amber-800 mb-1">📈 Areas to Improve:</p>
                <ul className="text-sm text-gray-700 list-disc list-inside">
                  {writingFeedback.areas_to_improve.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {writingFeedback.grammar_upgrade_examples?.length > 0 && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800 mb-2">✨ Grammar Upgrades:</p>
                {writingFeedback.grammar_upgrade_examples.map((ex, i) => (
                  <div key={i} className="text-sm mb-2">
                    <p className="text-red-600 line-through">{ex.original}</p>
                    <p className="text-green-600">→ {ex.upgraded}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Module Analogy - for deeper understanding */}
        {selectedModule.analogy && (
          <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              💡 Band Level Analogy
            </h4>
            <p className="text-gray-700 text-sm">{selectedModule.analogy}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => setCurrentSection('quiz')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Quiz <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  // Render quiz section
  const renderQuiz = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-cyan-600" /> Reading Comprehension Quiz
      </h3>

      {!quizSubmitted ? (
        <>
          <div className="space-y-4 mb-6">
            {selectedModule.reading?.questions?.map((q, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium text-gray-900 mb-2">
                  {idx + 1}. {q.question}
                </p>
                <p className="text-xs text-gray-500 mb-2 capitalize">Type: {q.type?.replace('_', ' ')}</p>
                
                {q.options ? (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                        <input 
                          type="radio" 
                          name={`quiz_${idx}`} 
                          value={opt}
                          checked={quizAnswers[idx] === opt}
                          onChange={() => handleQuizAnswer(idx, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'true_false_ng' ? (
                  <div className="flex gap-3">
                    {['True', 'False', 'Not Given'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer">
                        <input 
                          type="radio" 
                          name={`quiz_${idx}`} 
                          value={opt}
                          checked={quizAnswers[idx] === opt}
                          onChange={() => handleQuizAnswer(idx, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <Input
                    placeholder="Your answer..."
                    value={quizAnswers[idx] || ''}
                    onChange={(e) => handleQuizAnswer(idx, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <Button onClick={submitQuiz} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600">
            Submit Quiz
          </Button>
        </>
      ) : (
        <div className="py-8">
          <div className="text-center">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${quizResults?.estimated_band >= 7 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <h4 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h4>
            <p className="text-4xl font-bold text-cyan-600 mb-2">{quizResults?.score?.toFixed(0)}%</p>
            <p className="text-lg text-gray-600 mb-4">Estimated Band: {quizResults?.estimated_band}</p>
          </div>
          
          {/* Skill Breakdown - Simple inline version for course quizzes */}
          {quizResults?.skill_breakdown && Object.keys(quizResults.skill_breakdown).length > 0 && (
            <div className="my-6 p-4 bg-gray-50 rounded-xl">
              <h5 className="font-semibold text-gray-800 mb-3">📊 Performance by Question Type</h5>
              <div className="space-y-2">
                {Object.entries(quizResults.skill_breakdown).map(([type, data]) => (
                  <div key={type} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-700 capitalize">{type.replace(/_/g, ' ')}</span>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded ${
                      (data.correct / data.total) >= 0.7 ? 'bg-green-100 text-green-700' :
                      (data.correct / data.total) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.correct}/{data.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Results breakdown */}
          <div className="text-left space-y-3 mb-6 mt-6">
            <h5 className="font-semibold text-gray-800 mb-3">📝 Detailed Results</h5>
            {quizResults?.results?.map((r, i) => (
              <div key={i} className={`p-3 rounded-lg ${r.is_correct ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-start gap-2">
                  {r.is_correct ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  <div>
                    <p className="font-medium text-gray-800">{r.question}</p>
                    <p className="text-sm text-gray-600">Your answer: {r.user_answer || '(empty)'}</p>
                    {!r.is_correct && <p className="text-sm text-green-600">Correct: {r.correct_answer}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); setQuizResults(null); }}>
              Try Again
            </Button>
            <Button onClick={() => { setView('modules'); setSelectedModule(null); }} className="bg-gradient-to-r from-amber-500 to-orange-600">
              <Home className="w-4 h-4 mr-2" /> Back to Modules
            </Button>
          </div>
        </div>
      )}

      {!quizSubmitted && (
        <div className="mt-6">
          <Button variant="outline" onClick={() => setCurrentSection('writing')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Writing
          </Button>
        </div>
      )}
    </Card>
  );

  // Render module detail view
  const renderModuleDetail = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => { setView('modules'); setSelectedModule(null); }} className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {selectedModule.module_number}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{selectedModule.title}</h1>
          <p className="text-gray-500 text-sm">{selectedModule.subtitle}</p>
        </div>
      </div>

      {/* Section Tabs */}
      {renderSectionTabs()}

      {/* Section Content */}
      {currentSection === 'vocabulary' && renderVocabulary()}
      {currentSection === 'grammar' && renderGrammar()}
      {currentSection === 'reading' && renderReading()}
      {currentSection === 'speaking' && renderSpeaking()}
      {currentSection === 'writing' && renderWriting()}
      {currentSection === 'quiz' && renderQuiz()}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Advanced Mastery Course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-100 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'modules' && renderModulesList()}
        {view === 'module-detail' && selectedModule && renderModuleDetail()}
      </div>
    </div>
  );
}
