import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  BookOpen, Brain, ChevronLeft, ChevronRight, Mic, PenTool, Volume2,
  Target, Sparkles, CheckCircle, Lightbulb, Award, Lock, Home, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../lib/i18n';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Course configurations
const COURSE_CONFIG = {
  beginner: {
    name: 'Beginner Course',
    nameVi: 'Khóa học Cơ bản',
    nameTr: 'Başlangıç Kursu',
    bandRange: 'Band 4.0 - 5.0',
    color: 'from-emerald-500 to-teal-600',
    apiEndpoint: '/api/beginner-english/lessons',
    idField: 'id',
    maxFreePreview: 3
  },
  mastery: {
    name: 'Mastery Course',
    nameVi: 'Khóa học Trung cấp',
    nameTr: 'Ustalık Kursu',
    bandRange: 'Band 5.5 - 6.5',
    color: 'from-blue-500 to-indigo-600',
    apiEndpoint: '/api/mastery-course/modules',
    idField: 'module_number',
    maxFreePreview: 3
  },
  advanced: {
    name: 'Advanced Mastery',
    nameVi: 'Khóa học Nâng cao',
    nameTr: 'İleri Düzey Ustalık',
    bandRange: 'Band 6.5 - 9.0',
    color: 'from-amber-500 to-orange-600',
    apiEndpoint: '/api/advanced-mastery/modules',
    idField: 'id',
    maxFreePreview: 3
  }
};

// Helper function for trilingual text
const getText = (language, en, vi, tr) => {
  if (language === 'vi') return vi;
  if (language === 'tr') return tr;
  return en;
};

export default function LessonPreview() {
  const { courseType, lessonId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState('vocabulary');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [courseInfo, setCourseInfo] = useState(null);

  useEffect(() => {
    const config = COURSE_CONFIG[courseType];
    if (!config) {
      setIsAuthorized(false);
      setLoading(false);
      return;
    }
    
    setCourseInfo(config);
    fetchLesson(config);
  }, [courseType, lessonId]);

  const fetchLesson = async (config) => {
    try {
      const res = await fetch(`${API_URL}${config.apiEndpoint}`);
      if (res.ok) {
        const lessons = await res.json();
        
        // Find the lesson by ID or module_number
        let foundLesson = null;
        let lessonIndex = -1;
        
        for (let i = 0; i < lessons.length; i++) {
          const l = lessons[i];
          const lessonIdentifier = String(l.id || l.module_number || i + 1);
          if (lessonIdentifier === lessonId || String(l.module_number) === lessonId) {
            foundLesson = l;
            lessonIndex = i;
            break;
          }
        }
        
        // Check if this lesson is within the free preview limit
        if (foundLesson && lessonIndex < config.maxFreePreview) {
          setLesson(foundLesson);
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      }
    } catch (e) {
      console.error('Failed to fetch lesson:', e);
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

  if (!isAuthorized || !lesson) {
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
            {getText(language,
              'This lesson is only available for registered users. Sign up to access all comprehensive IELTS modules.',
              'Bài học này chỉ dành cho người dùng đã đăng ký. Đăng ký để truy cập tất cả các module IELTS toàn diện.',
              'Bu ders sadece kayıtlı kullanıcılar için mevcuttur. Tüm kapsamlı IELTS modüllerine erişmek için kaydolun.'
            )}
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

  const renderSectionTabs = () => {
    // Determine available sections based on lesson content
    const sections = [];
    
    if (lesson.vocabulary || lesson.advanced_terms) {
      sections.push({ id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' });
    }
    if (lesson.grammar) {
      sections.push({ id: 'grammar', icon: Brain, label: 'Grammar' });
    }
    if (lesson.reading || lesson.reading_passage) {
      sections.push({ id: 'reading', icon: Target, label: 'Reading' });
    }
    if (lesson.speaking || lesson.speaking_prompts) {
      sections.push({ id: 'speaking', icon: Mic, label: 'Speaking' });
    }
    if (lesson.writing || lesson.writing_task) {
      sections.push({ id: 'writing', icon: PenTool, label: 'Writing' });
    }

    // Default sections if none detected
    if (sections.length === 0) {
      sections.push(
        { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
        { id: 'grammar', icon: Brain, label: 'Grammar' },
        { id: 'reading', icon: Target, label: 'Reading' }
      );
    }

    return (
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {sections.map(s => (
          <Button
            key={s.id}
            variant={currentSection === s.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentSection(s.id)}
            className={currentSection === s.id ? `bg-gradient-to-r ${courseInfo.color} border-0` : ''}
          >
            <s.icon className="w-4 h-4 mr-2" />
            {s.label}
          </Button>
        ))}
      </div>
    );
  };

  const renderVocabulary = () => {
    const terms = lesson.vocabulary?.advanced_terms || lesson.vocabulary || [];
    const synonymGroups = lesson.vocabulary?.synonym_groups || [];
    
    // Handle learning_goals as either string or array
    const learningGoals = lesson.learning_goals 
      ? (Array.isArray(lesson.learning_goals) ? lesson.learning_goals : [lesson.learning_goals])
      : null;
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" /> {t('landingLessonVocab')}
        </h3>
        
        {learningGoals && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Learning Goals
            </h4>
            <ul className="space-y-1">
              {learningGoals.map((goal, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {Array.isArray(terms) && terms.map((term, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-amber-500">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">{term.term || term.word}</h4>
                  <p className="text-sm text-gray-500 italic">{term.usage || term.part_of_speech}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => speakText(term.term || term.word)}>
                  <Volume2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-gray-700 mb-2">{term.meaning || term.definition}</p>
              {term.example && (
                <div className="p-3 bg-white rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800 italic">"{term.example}"</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {synonymGroups.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Synonym Groups
            </h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {synonymGroups.map((group, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-700 mb-1">{group.base}:</p>
                  <p className="text-sm text-gray-600">{group.synonyms?.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {lesson.examiner_tips && Array.isArray(lesson.examiner_tips) && lesson.examiner_tips.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Examiner Tips
            </h4>
            <ul className="space-y-2">
              {lesson.examiner_tips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistake section for beginner lessons */}
        {lesson.common_mistake && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Common Mistake
            </h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <p className="text-xs text-red-600 font-medium mb-1">❌ Wrong</p>
                <p className="text-sm text-red-800">{lesson.common_mistake.wrong}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <p className="text-xs text-green-600 font-medium mb-1">✓ Correct</p>
                <p className="text-sm text-green-800">{lesson.common_mistake.correct}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setCurrentSection('grammar')} className={`bg-gradient-to-r ${courseInfo.color}`}>
            Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  const renderGrammar = () => {
    const grammar = lesson.grammar || {};
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" /> {grammar.title || t('landingLessonGrammar')}
        </h3>
        
        <div className="space-y-6">
          {grammar.explanation && (
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-gray-700">{grammar.explanation}</p>
            </div>
          )}

          {(grammar.band_65_example || grammar.band_80_example) && (
            <div className="grid md:grid-cols-2 gap-4">
              {grammar.band_65_example && (
                <div className="p-4 bg-red-50 rounded-xl border-l-4 border-red-400">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Band 6.5 Example</h4>
                  <p className="text-gray-700 italic">"{grammar.band_65_example}"</p>
                </div>
              )}
              {grammar.band_80_example && (
                <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Band 8.0 Example</h4>
                  <p className="text-gray-700 italic">"{grammar.band_80_example}"</p>
                </div>
              )}
            </div>
          )}

          {grammar.why_it_works && (
            <div className="p-4 bg-amber-50 rounded-xl">
              <h4 className="font-semibold text-amber-800 mb-2">💡 Why This Works</h4>
              <p className="text-gray-700">{grammar.why_it_works}</p>
            </div>
          )}

          {/* Show structure/formula if available */}
          {grammar.structure && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Structure</h4>
              <p className="text-gray-700 font-mono">{grammar.structure}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Vocabulary
          </Button>
          <Button onClick={() => setCurrentSection('reading')} className={`bg-gradient-to-r ${courseInfo.color}`}>
            Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  const renderReading = () => {
    const reading = lesson.reading || {};
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" /> {reading.title || 'Reading Practice'}
          </h3>
        </div>
        
        {reading.word_count && (
          <div className="mb-4 text-sm text-gray-500">
            {getText(language, 'Word Count', 'Số từ', 'Kelime Sayısı')}: ~{reading.word_count}
          </div>
        )}

        <div className="p-5 bg-gray-50 rounded-xl mb-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {reading.text || reading.passage || getText(language, 'Reading passage content will appear here.', 'Nội dung bài đọc sẽ xuất hiện ở đây.', 'Okuma parçası içeriği burada görünecek.')}
          </p>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-blue-800 mb-2">📚 {getText(language, 'Practice Questions', 'Câu hỏi luyện tập', 'Alıştırma Soruları')}</h4>
          <p className="text-sm text-gray-600">
            {getText(language,
              'Sign up to access interactive quizzes with True/False/Not Given, Summary Completion, and more question types.',
              'Đăng ký để truy cập các câu hỏi trắc nghiệm với True/False/Not Given, Summary Completion, và nhiều loại câu hỏi khác.',
              'Doğru/Yanlış/Belirtilmemiş, Özet Tamamlama ve daha fazla soru tipine sahip etkileşimli testlere erişmek için kaydolun.'
            )}
          </p>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {getText(language, 'Grammar', 'Ngữ pháp', 'Dilbilgisi')}
          </Button>
          <Button onClick={() => setCurrentSection('speaking')} className={`bg-gradient-to-r ${courseInfo.color}`}>
            {getText(language, 'Next: Speaking', 'Tiếp: Nói', 'Sonraki: Konuşma')} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  const renderSpeaking = () => {
    const speaking = lesson.speaking || {};
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mic className="w-5 h-5 text-emerald-600" /> Speaking Practice
        </h3>

        <div className="space-y-6">
          {speaking.part2 && (
            <div className="p-4 bg-emerald-50 rounded-xl">
              <h4 className="font-semibold text-emerald-800 mb-2">Part 2: Cue Card</h4>
              <p className="text-gray-700 mb-3">{speaking.part2.cue_card}</p>
              {speaking.part2.model_answer && (
                <details className="text-sm">
                  <summary className="text-emerald-600 cursor-pointer font-medium">View Model Answer</summary>
                  <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                    "{speaking.part2.model_answer}"
                  </p>
                </details>
              )}
            </div>
          )}

          {speaking.part3 && (
            <div className="p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-blue-800 mb-2">{getText(language, 'Part 3: Discussion', 'Phần 3: Thảo luận', 'Bölüm 3: Tartışma')}</h4>
              <p className="text-gray-700 mb-3">{speaking.part3.question}</p>
              {speaking.part3.band8_sample && (
                <details className="text-sm">
                  <summary className="text-blue-600 cursor-pointer font-medium">{getText(language, 'View Band 8 Sample', 'Xem mẫu Band 8', 'Band 8 Örneğini Görüntüle')}</summary>
                  <p className="mt-2 p-3 bg-white rounded-lg text-gray-600 italic">
                    "{speaking.part3.band8_sample}"
                  </p>
                </details>
              )}
            </div>
          )}

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>🎙️ {getText(language, 'AI Speaking Evaluation', 'Đánh giá nói AI', 'AI Konuşma Değerlendirmesi')}</strong> — {getText(language,
                'Sign up to record your responses and get instant AI feedback on fluency, vocabulary, grammar, and pronunciation.',
                'Đăng ký để ghi âm câu trả lời và nhận phản hồi AI về độ trôi chảy, từ vựng, ngữ pháp và phát âm.',
                'Yanıtlarınızı kaydetmek ve akıcılık, kelime, dilbilgisi ve telaffuz hakkında anında AI geri bildirimi almak için kaydolun.'
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('reading')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> {getText(language, 'Reading', 'Đọc', 'Okuma')}
          </Button>
          <Button onClick={() => setCurrentSection('writing')} className={`bg-gradient-to-r ${courseInfo.color}`}>
            {getText(language, 'Next: Writing', 'Tiếp: Viết', 'Sonraki: Yazma')} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  const renderWriting = () => {
    const writing = lesson.writing || {};
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-orange-600" /> {getText(language, 'Writing', 'Viết', 'Yazma')} {writing.task_type || getText(language, 'Practice', 'Luyện tập', 'Pratik')}
        </h3>

        <div className="space-y-6">
          {writing.prompt && (
            <div className="p-4 bg-orange-50 rounded-xl">
              <h4 className="font-semibold text-orange-800 mb-2">{getText(language, 'Task Prompt', 'Đề bài', 'Görev İstemi')}</h4>
              <p className="text-gray-700">{writing.prompt}</p>
            </div>
          )}

          {writing.band75_excerpt && (
            <details className="p-4 bg-gray-50 rounded-xl">
              <summary className="font-semibold text-gray-800 cursor-pointer">{getText(language, 'View Model Essay', 'Xem bài mẫu', 'Örnek Makaleyi Görüntüle')}</summary>
              <p className="mt-3 text-gray-600 italic leading-relaxed">"{writing.band75_excerpt}"</p>
              
              {writing.examiner_analysis && (
                <div className="mt-4 p-3 bg-white rounded-lg space-y-2">
                  <h5 className="font-medium text-gray-800">{getText(language, 'Examiner Analysis', 'Phân tích của giám khảo', 'Değerlendirici Analizi')}:</h5>
                  {Object.entries(writing.examiner_analysis).map(([key, value]) => (
                    <p key={key} className="text-sm text-gray-600">
                      <span className="font-medium capitalize">{key.replace('_', ' ')}:</span> {value}
                    </p>
                  ))}
                </div>
              )}
            </details>
          )}

          <div className="p-4 bg-violet-50 rounded-xl border border-violet-200">
            <p className="text-violet-800 text-sm">
              <strong>✍️ {getText(language, 'AI Writing Evaluation', 'Đánh giá viết AI', 'AI Yazma Değerlendirmesi')}</strong> — {getText(language,
                'Sign up to submit your essays and receive detailed feedback on Task Achievement, Coherence, Vocabulary, and Grammar.',
                'Đăng ký để nộp bài luận và nhận phản hồi chi tiết về Task Achievement, Coherence, Vocabulary và Grammar.',
                'Makalelerinizi göndermek ve Görev Başarısı, Tutarlılık, Kelime ve Dilbilgisi hakkında detaylı geri bildirim almak için kaydolun.'
              )}
            </p>
          </div>

          {lesson.analogy && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                💡 Band Level Analogy
              </h4>
              <p className="text-gray-700 text-sm">{lesson.analogy}</p>
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
  };

  const lessonTitle = lesson.title || lesson.topic || `Lesson ${lesson.module_number || lessonId}`;
  const lessonSubtitle = lesson.subtitle || lesson.description || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-amber-50/30 to-gray-100 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${courseInfo.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
            {lesson.module_number || lessonId}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{lessonTitle}</h1>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {t('landingFreePreview')}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{lessonSubtitle}</p>
          </div>
        </div>

        {/* Course Badge */}
        <div className="mb-4 flex items-center gap-2">
          <span className={`px-3 py-1 bg-gradient-to-r ${courseInfo.color} text-white text-xs font-bold rounded-full flex items-center gap-1`}>
            <GraduationCap className="w-3 h-3" />
            {getText(language, courseInfo.name, courseInfo.nameVi, courseInfo.nameTr)}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {courseInfo.bandRange}
          </span>
        </div>

        {/* Preview Notice */}
        <div className="mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-violet-800 text-sm font-medium">
                {getText(language, 
                  "You're previewing this lesson for free!", 
                  'Bạn đang xem trước bài học miễn phí!',
                  'Bu dersi ücretsiz önizliyorsunuz!'
                )}
              </p>
              <p className="text-violet-600 text-xs">
                {getText(language,
                  'Sign up to unlock AI evaluations, quizzes, and all modules.',
                  'Đăng ký để mở khóa đánh giá AI, bài quiz, và tất cả các module.',
                  'AI değerlendirmelerinin, testlerin ve tüm modüllerin kilidini açmak için kaydolun.'
                )}
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
