import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import {
  BookOpen, Brain, ChevronLeft, ChevronRight, Mic, PenTool, Volume2,
  Target, Sparkles, CheckCircle, Lightbulb, Award, Lock, Home
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// List of module IDs that are available for free preview
const FREE_PREVIEW_MODULES = ['module_1', 'module_2', 'module_3'];

export default function LessonPreview() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('vocabulary');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if this module is available for free preview
    if (!FREE_PREVIEW_MODULES.includes(moduleId)) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }
    
    setIsAuthorized(true);
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    try {
      const res = await fetch(`${API_URL}/api/advanced-mastery/modules`);
      if (res.ok) {
        const modules = await res.json();
        const foundModule = modules.find(m => m.id === moduleId);
        if (foundModule) {
          setModule(foundModule);
        }
      }
    } catch (e) {
      console.error('Failed to fetch module:', e);
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-violet-50/30 to-gray-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center bg-white border-0 shadow-xl rounded-2xl">
          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {t('landingSignUpToUnlock')}
          </h2>
          <p className="text-gray-600 mb-6">
            This lesson is only available for registered users. Sign up to access all 20+ comprehensive IELTS modules.
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white"
            >
              {t('getStarted')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" /> {t('home')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-gray-600 mb-4">Lesson not found</p>
          <Button onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" /> {t('home')}
          </Button>
        </Card>
      </div>
    );
  }

  const renderSectionTabs = () => {
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Brain, label: 'Grammar' },
      { id: 'reading', icon: Target, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' }
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

  const renderVocabulary = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-600" /> {t('landingLessonVocab')}
      </h3>
      
      {module.learning_goals && (
        <div className="mb-6 p-4 bg-amber-50 rounded-xl">
          <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Learning Goals
          </h4>
          <ul className="space-y-1">
            {module.learning_goals.map((goal, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-4">
        {module.vocabulary?.advanced_terms?.map((term, idx) => (
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

      {module.vocabulary?.synonym_groups && module.vocabulary.synonym_groups.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Synonym Groups for Paraphrasing
          </h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {module.vocabulary.synonym_groups.map((group, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-700 mb-1">{group.base}:</p>
                <p className="text-sm text-gray-600">{group.synonyms.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {module.examiner_tips && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Examiner Tips for Band 7+
          </h4>
          <ul className="space-y-2">
            {module.examiner_tips.map((tip, i) => (
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

  const renderGrammar = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" /> {module.grammar?.title}
      </h3>
      
      <div className="space-y-6">
        <div className="p-4 bg-purple-50 rounded-xl">
          <p className="text-gray-700">{module.grammar?.explanation}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-400">
            <h4 className="font-semibold text-red-800 mb-2">❌ Band 6.5 Example</h4>
            <p className="text-gray-700 italic">"{module.grammar?.band_65_example}"</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">✅ Band 8.0 Example</h4>
            <p className="text-gray-700 italic">"{module.grammar?.band_80_example}"</p>
          </div>
        </div>

        {module.grammar?.why_it_works && (
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-semibold text-amber-800 mb-2">💡 Why This Works</h4>
            <p className="text-gray-700">{module.grammar.why_it_works}</p>
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

  const renderReading = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" /> {module.reading?.title}
        </h3>
      </div>
      
      <div className="mb-4 text-sm text-gray-500">
        Word Count: ~{module.reading?.word_count}
      </div>

      <div className="p-5 bg-gray-50 rounded-xl mb-6">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {module.reading?.text || ''}
        </p>
      </div>

      <div className="p-4 bg-blue-50 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-2">📚 Practice Questions ({module.reading?.questions?.length || 0})</h4>
        <p className="text-sm text-gray-600">Sign up to access interactive quizzes with True/False/Not Given, Summary Completion, and more question types.</p>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
        </Button>
        <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  const renderSpeaking = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-emerald-600" /> Speaking Practice
      </h3>

      <div className="space-y-6">
        {module.speaking?.part2 && (
          <div className="p-4 bg-emerald-50 rounded-xl">
            <h4 className="font-semibold text-emerald-800 mb-2">Part 2: Cue Card</h4>
            <p className="text-gray-700 mb-3">{module.speaking.part2.cue_card}</p>
            <details className="text-sm">
              <summary className="text-emerald-600 cursor-pointer font-medium">View Model Answer</summary>
              <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                "{module.speaking.part2.model_answer}"
              </p>
            </details>
          </div>
        )}

        {module.speaking?.part3 && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Part 3: Abstract Discussion</h4>
            <p className="text-gray-700 mb-3">{module.speaking.part3.question}</p>
            <details className="text-sm">
              <summary className="text-blue-600 cursor-pointer font-medium">View Band 8 Sample</summary>
              <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                "{module.speaking.part3.band8_sample}"
              </p>
            </details>
          </div>
        )}

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-amber-800 text-sm">
            <strong>🎙️ AI Speaking Evaluation</strong> — Sign up to record your responses and get instant AI feedback on fluency, vocabulary, grammar, and pronunciation.
          </p>
        </div>
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

  const renderWriting = () => (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-orange-600" /> Writing {module.writing?.task_type}
      </h3>

      <div className="space-y-6">
        <div className="p-4 bg-orange-50 rounded-xl">
          <h4 className="font-semibold text-orange-800 mb-2">Task Prompt</h4>
          <p className="text-gray-700">{module.writing?.prompt}</p>
        </div>

        <details className="p-4 bg-gray-50 rounded-xl">
          <summary className="font-semibold text-gray-800 cursor-pointer">View Band 7.5+ Model Excerpt</summary>
          <p className="mt-3 text-gray-600 italic leading-relaxed">"{module.writing?.band75_excerpt}"</p>
          
          {module.writing?.examiner_analysis && (
            <div className="mt-4 p-3 bg-white rounded-lg space-y-2">
              <h5 className="font-medium text-gray-800">Examiner Analysis:</h5>
              {Object.entries(module.writing.examiner_analysis).map(([key, value]) => (
                <p key={key} className="text-sm text-gray-600">
                  <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}
                </p>
              ))}
            </div>
          )}
        </details>

        <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
          <p className="text-violet-800 text-sm">
            <strong>✍️ AI Writing Evaluation</strong> — Sign up to submit your essays and receive detailed feedback on Task Achievement, Coherence, Vocabulary, and Grammar.
          </p>
        </div>

        {module.analogy && (
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
            <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
              💡 Band Level Analogy
            </h4>
            <p className="text-gray-700 text-sm">{module.analogy}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('speaking')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Speaking
        </Button>
        <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-violet-600 to-purple-700">
          {t('landingUnlockAll')} <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-100 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {module.module_number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{module.title}</h1>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {t('landingFreePreview')}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{module.subtitle}</p>
          </div>
        </div>

        {/* Preview Notice */}
        <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-violet-800 text-sm font-medium">
                You're previewing this lesson for free!
              </p>
              <p className="text-violet-600 text-xs">
                Sign up to unlock AI evaluations, quizzes, and all 20+ modules.
              </p>
            </div>
            <Button 
              size="sm"
              onClick={() => navigate('/')} 
              className="bg-violet-600 hover:bg-violet-700 text-white whitespace-nowrap"
            >
              {t('getStarted')}
            </Button>
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
      </div>
    </div>
  );
}
