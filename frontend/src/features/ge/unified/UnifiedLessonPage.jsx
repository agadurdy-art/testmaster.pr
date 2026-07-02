import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGoBack } from '../../../hooks/useGoBack';
import { ArrowLeft, X, Clock, Star, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { toast } from 'sonner';
import { API_URL, getTheme } from './lib/constants';
import { LESSON_MOTION_CSS } from './lib/lessonMotionCss';
import { fetchRetry, saveLessonProgress, loadLessonProgress, clearLessonProgress } from './lib/progress';
import { ActivityErrorBoundary } from './components/ErrorBoundaries';
import LessonRoadmap from './components/LessonRoadmap';
import LessonPath from './components/LessonPath';
import RetrievalWarmup from './components/RetrievalWarmup';
import VocabularyModule from './components/VocabularyModule';
import VocabGamesPlayer from './components/VocabGamesPlayer';
import GrammarGamesPlayer from './components/GrammarGamesPlayer';
import MicroReading from './components/MicroReading';
import GrammarFocus from './components/GrammarFocus';
import ListeningActivity from './components/ListeningActivity';
import ProductionActivity from './components/ProductionActivity';
import ExitTicket from './components/ExitTicket';
import StageCertificate from './components/StageCertificate';
import LessonSummary from './components/LessonSummary';
import PlaceholderActivity from './components/PlaceholderActivity';

// ═══════ MAIN LESSON PAGE ═══════
export default function UnifiedLessonPage({ user }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [currentActivityType, setCurrentActivityType] = useState(null);
  const [currentActivityData, setCurrentActivityData] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [activityScores, setActivityScores] = useState({});
  const [lessonSummaryData, setLessonSummaryData] = useState({ words: [], grammarRules: [] });
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Stop all audio when activity changes or component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, [currentActivityType]);

  useEffect(() => { loadLesson(); }, [lessonId]);

  // Restore progress from localStorage on mount
  useEffect(() => {
    const saved = loadLessonProgress(lessonId);
    if (saved?.completedActivities?.length > 0) {
      setCompletedActivities(saved.completedActivities);
      setActivityScores(saved.activityScores || {});
      if (saved.currentActivityType) setCurrentActivityType(saved.currentActivityType);
      setShowRoadmap(saved.showRoadmap ?? true);
    }
  }, [lessonId]);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (completedActivities.length > 0 || Object.keys(activityScores).length > 0) {
      saveLessonProgress(lessonId, { completedActivities, activityScores, currentActivityType, showRoadmap });
    }
  }, [completedActivities, activityScores, currentActivityType, showRoadmap, lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      // Check lock status first
      if (user?.id) {
        const lockRes = await fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/lock-status?user_id=${user.id}&email=${encodeURIComponent(user.email || '')}`);
        const lockData = await lockRes.json();
        if (!lockData.unlocked) {
          setIsLocked(true);
          setLoading(false);
          return;
        }
      }
      const res = await fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}`);
      const data = await res.json();
      setLesson(data);
      // Only set first activity if no saved progress
      const saved = loadLessonProgress(lessonId);
      if (saved?.currentActivityType) {
        await loadActivityData(saved.currentActivityType);
      } else {
        const first = data.activity_flow?.[0];
        if (first) { setCurrentActivityType(first.type); await loadActivityData(first.type); }
      }
      // Pre-fetch vocab and grammar for summary card
      try {
        if (data.summary_data?.words?.length) {
          setLessonSummaryData({
            words: data.summary_data.words,
            grammarRules: data.summary_data.grammar_rules || []
          });
        } else {
          const [vocabRes, grammarRes] = await Promise.all([
            fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/activity/vocabulary`),
            fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/activity/grammar_focus`)
          ]);
          const vocabData = vocabRes.ok ? await vocabRes.json() : null;
          const grammarData = grammarRes.ok ? await grammarRes.json() : null;
          setLessonSummaryData({
            words: vocabData?.words || [],
            grammarRules: grammarData?.rules || []
          });
        }
      } catch { /* summary data is optional */ }
    } catch (error) { console.error('Error loading lesson:', error); } finally { setLoading(false); }
  };

  const loadActivityData = async (activityType) => {
    try {
      setActivityLoading(true);
      const res = await fetchRetry(`${API_URL}/api/unified/lessons/${lessonId}/activity/${activityType}`);
      const data = res.ok ? await res.json() : null;
      setCurrentActivityData(data);
      // Cache data for lesson summary
      if (data && activityType === 'vocabulary' && data.words?.length) {
        setLessonSummaryData(prev => ({ ...prev, words: data.words }));
      }
      if (data && activityType === 'grammar_focus' && data.rules?.length) {
        setLessonSummaryData(prev => ({ ...prev, grammarRules: data.rules }));
      }
    } catch { setCurrentActivityData(null); } finally { setActivityLoading(false); }
  };

  const handleActivityComplete = useCallback(async (score, crownsOrPassed) => {
    if (!completedActivities.includes(currentActivityType)) {
      setCompletedActivities(prev => [...prev, currentActivityType]);
    }
    if (typeof score === 'number') {
      setActivityScores(prev => ({ ...prev, [currentActivityType]: score }));
    }
    if (user?.id) {
      try {
        await fetchRetry(`${API_URL}/api/unified/progress/activity`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, lesson_id: lessonId, activity_type: currentActivityType, score, crowns: typeof crownsOrPassed === 'number' ? crownsOrPassed : null, time_spent_seconds: 0 })
        });
      } catch (e) { console.error('Error saving progress:', e); }
    }
    moveToNextActivity();
  }, [currentActivityType, completedActivities, user, lessonId]);

  const handleActivitySkip = useCallback(() => {
    if (!completedActivities.includes(currentActivityType)) setCompletedActivities(prev => [...prev, currentActivityType]);
    moveToNextActivity();
  }, [currentActivityType, completedActivities]);

  const moveToNextActivity = useCallback(() => {
    const activities = lesson?.activity_flow || [];
    const currentIndex = activities.findIndex(a => a.type === currentActivityType);
    const nextActivity = activities[currentIndex + 1];
    if (nextActivity) { setCurrentActivityType(nextActivity.type); loadActivityData(nextActivity.type); }
    else handleLessonComplete();
  }, [lesson, currentActivityType]);

  const handleLessonComplete = async () => {
    if (user?.id) {
      try {
        await fetchRetry(`${API_URL}/api/unified/progress/lesson`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id, lesson_id: lessonId })
        });
        toast.success('Lesson completed! Points awarded.');
      } catch (e) { console.error('Error completing lesson:', e); }
    }
    // Clear saved progress on lesson complete
    clearLessonProgress(lessonId);
    // Check if this is a Final Gate lesson
    const isFinalGate = lesson?.title?.toLowerCase().includes('final gate') || lessonId?.includes('unit_12_lesson_04');
    if (isFinalGate) {
      setShowCertificate(true);
      return;
    }
    navigate(`/unified/stage/${lesson?.stage_id}`);
  };

  const handleActivityClick = (activity) => { setCurrentActivityType(activity.type); loadActivityData(activity.type); };

  const renderActivity = () => {
    if (activityLoading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>;
    const activity = lesson?.activity_flow?.find(a => a.type === currentActivityType);

    switch (currentActivityType) {
      case 'retrieval_warmup':
        return currentActivityData ? <RetrievalWarmup activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'vocabulary':
        return currentActivityData ? <VocabularyModule activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_game_vocab':
      case 'vocab_games':
        return currentActivityData ? <VocabGamesPlayer activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_reading':
        return currentActivityData ? <MicroReading activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'grammar_focus':
        return currentActivityData ? <GrammarFocus activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'micro_game_grammar':
      case 'grammar_games':
        return currentActivityData ? <GrammarGamesPlayer activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'listening':
      case 'listening_task':
        return currentActivityData ? <ListeningActivity activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'production':
        return currentActivityData ? <ProductionActivity activity={currentActivityData} onComplete={handleActivityComplete} onSkip={handleActivitySkip} lessonContext={lessonSummaryData} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'exit_ticket':
        return currentActivityData ? <ExitTicket activity={currentActivityData} onComplete={(score) => handleActivityComplete(score)} onSkip={handleActivitySkip} /> :
          <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable />;
      case 'auto_review':
        return <LessonSummary
          lesson={lesson}
          activityScores={activityScores}
          summaryData={lessonSummaryData}
          completedActivities={completedActivities}
          onFinish={() => handleActivityComplete(100)}
        />;
      default:
        return <PlaceholderActivity type={currentActivityType} onComplete={handleActivityComplete} onSkip={handleActivitySkip} isSkippable={activity?.is_skippable} />;
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>;
  if (isLocked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" data-testid="lesson-locked-screen">
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Lesson Locked</h2>
        <p className="text-gray-600 mb-6">Complete the previous lesson first to unlock this one.</p>
        <Button onClick={goBack} className="rounded-full px-6" data-testid="go-back-btn">
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    </div>
  );
  if (!lesson) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Lesson not found</p></div>;

  const totalActivities = lesson.activity_flow?.length || 0;
  const progressPercent = Math.round((completedActivities.length / totalActivities) * 100);
  const theme = getTheme(lesson.stage_id);

  const handleRoadmapStart = () => {
    setShowRoadmap(false);
  };

  const handleRoadmapActivity = (activityType) => {
    setShowRoadmap(false);
    setCurrentActivityType(activityType);
    loadActivityData(activityType);
  };

  return (
    <div
      className="min-h-screen lesson-surface"
      style={{
        background: `radial-gradient(at 0% 0%, ${theme.accentLight}90 0, transparent 50%), radial-gradient(at 100% 0%, hsla(190,100%,92%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(37,100%,91%,1) 0, transparent 50%), #F8FAFC`
      }}
      data-testid="unified-lesson-page"
    >
      <style>{LESSON_MOTION_CSS}</style>
      {/* Header - iOS 26 Glass Style */}
      <div 
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.50)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)} data-testid="lesson-back-btn"><X className="w-5 h-5" /></Button>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">{lesson.title}</h1>
                <p className="text-xs text-gray-500">Lesson {lesson.number}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3.5 h-3.5" />{lesson.estimated_duration_minutes} min</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: theme.accentLight }}>
                <Star className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                <span className="text-xs font-semibold" style={{ color: theme.accent }}>{lesson.points_reward} pts</span>
              </div>
              {!showRoadmap && <div className="w-28"><Progress value={progressPercent} /></div>}
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap or Activity Content */}
      {showRoadmap ? (
        <LessonRoadmap
          lesson={lesson}
          completedActivities={completedActivities}
          onStartActivity={handleRoadmapActivity}
          onStartLesson={handleRoadmapStart}
          theme={theme}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <LessonPath activities={lesson.activity_flow || []} currentActivity={currentActivityType} completedActivities={completedActivities} onActivityClick={handleActivityClick} theme={theme} />
            </div>
            <div className="lg:col-span-3 lesson-content-area">
              <ActivityErrorBoundary activityType={currentActivityType} onSkip={handleActivitySkip}>
                {renderActivity()}
              </ActivityErrorBoundary>
            </div>
          </div>
        </div>
      )}

      {/* Stage Certificate Overlay */}
      {showCertificate && (
        <div className="fixed inset-0 z-50">
          <StageCertificate lesson={lesson} activityScores={activityScores} />
        </div>
      )}
    </div>
  );
}
