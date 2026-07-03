import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
// XCircle / Home were imported-but-unused on the original page — kept for fidelity.
// eslint-disable-next-line no-unused-vars
import { ArrowLeft, XCircle, Home } from 'lucide-react';
import { toast } from 'sonner';
import { ReadingListeningDrilldown, ReadingResultsLayout, ListeningResultsLayout } from '../../../results';
import '../../../speaking/speaking.css';
import { API_URL, _getUserId, calculateSectionScore } from './constants';
import { useFluencyInsights } from './hooks/useFluencyInsights';
import { useSpeakingExtras } from './hooks/useSpeakingExtras';
import LoadingSkeleton from './components/LoadingSkeleton';
import SpeakingSkillResults from './components/SpeakingSkillResults';
import ResultsHero from './components/ResultsHero';
import BandBreakdown from './components/BandBreakdown';
import ResultsTabs from './components/ResultsTabs';
import IntegrityWarnings from './components/IntegrityWarnings';
import InsightsTileGrid from './components/InsightsTileGrid';
import InsightDrawer from './components/InsightDrawer';
import WritingSection from './components/WritingSection';
import SpeakingSection from './components/SpeakingSection';
import SpeakingP2Panels from './components/SpeakingP2Panels';
import NextStepCTA from './components/NextStepCTA';
import ActionButtons from './components/ActionButtons';

// Orchestrator for the Cambridge test results surface (Faz2 refactor).
// Section cards / hero / insight drawer / footer rows were extracted verbatim
// into ./components; pure scoring helpers into ./constants; the fluency
// analysis + speaking P2 fetchers into ./hooks; the Next Step decision engine
// into ./computeNextStepPlan. All state, handlers and effect ORDER are
// unchanged from pages/CambridgeTestResults.js — the mount evaluate effect
// still registers before the fluency effect (useFluencyInsights is called
// below it for exactly that reason).

export default function CambridgeTestResults() {
  const { bookId, testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState(null);
  // eslint-disable-next-line no-unused-vars -- unused on the original page too; kept for fidelity
  const [writingViewTab, setWritingViewTab] = useState('feedback');

  // AI Feedback state
  const [skillBreakdown, setSkillBreakdown] = useState([]);
  const [teacherFeedback, setTeacherFeedback] = useState(null);
  const [recommendedLessons, setRecommendedLessons] = useState([]);
  const [questionResults, setQuestionResults] = useState({ listening: [], reading: [] });
  const [fastestGain, setFastestGain] = useState([]);
  const [integrityWarnings, setIntegrityWarnings] = useState([]);
  const [showBandTooltip, setShowBandTooltip] = useState(null);
  // Holistic insight cards (Root Cause, Why You Lost Marks, Fastest Gain,
  // Personal Feedback, Recommended Lessons, Study Roadmap) collapse to a
  // tile grid; clicking a tile opens the full card content in a slide-in
  // drawer. Keeps the Overview tab scannable instead of overwhelming.
  const [openInsight, setOpenInsight] = useState(null);
  const [reasonSummary, setReasonSummary] = useState({});
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);

  // Get data from navigation state
  const { answers = {}, testData = {}, mode = 'full', skill = null, speakingEvaluations = {}, sectionDurations = {} } = location.state || {};

  // True IELTS overall = mean of the AVAILABLE section bands, rounded to 0.5.
  // The backend /evaluate/full-test only scores Listening + Reading; Writing and
  // Speaking are evaluated separately on this page, so trusting `results.overall`
  // (L+R only) understated the band. Recompute reactively as W/S come in.
  const computedOverall = useMemo(() => {
    const bands = [];
    if (results?.listening?.band) bands.push(results.listening.band);
    if (results?.reading?.band) bands.push(results.reading.band);
    if (results?.writing?.evaluated && results?.writing?.score) bands.push(results.writing.score);
    const spk = Object.values(speakingEvaluations || {});
    if (spk.length) {
      const avg = spk.reduce((s, e) => s + (e?.overall_band || 0), 0) / spk.length;
      if (avg > 0) bands.push(avg);
    }
    if (!bands.length) return results?.overall ?? null;
    return Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2;
  }, [results, speakingEvaluations]);

  useEffect(() => {
    if (!location.state) {
      toast.error('No test data found');
      navigate('/question-bank');
      return;
    }
    // Skill-mode speaking only renders the D7 SpeakingResultsState — no
    // listening/reading scoring needed. Skip the full-test pipeline.
    if (mode === 'skill' && skill === 'speaking') {
      setLoading(false);
      return;
    }
    evaluateFullTest();
  }, []);

  const evaluateFullTest = async () => {
    setLoading(true);

    try {
      // Call the comprehensive evaluation endpoint
      // When `mode === 'skill'` we send the skill filter so the backend
      // short-circuits the other section entirely (no useless scoring,
      // no spurious "all unanswered" integrity warning for the section
      // the user never attempted).
      const requestBody = {
        book_id: bookId,
        test_id: testId,
        answers: answers,
        user_plan: 'free',
        user_id: _getUserId(),
      };
      if (mode === 'skill' && (skill === 'reading' || skill === 'listening')) {
        requestBody.skill = skill;
      }
      const res = await fetch(`${API_URL}/api/cambridge/evaluate/full-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      if (data.success) {
        // Set scores
        setResults({
          listening: {
            correct: data.scores.listening.correct,
            total: data.scores.listening.total,
            band: data.scores.listening.band,
            percentage: data.scores.listening.percentage,
            duration_minutes: sectionDurations?.listening,
            transcript: data.scores.listening.transcripts || {},
          },
          reading: {
            correct: data.scores.reading.correct,
            total: data.scores.reading.total,
            band: data.scores.reading.band,
            percentage: data.scores.reading.percentage,
            duration_minutes: sectionDurations?.reading,
          },
          writing: { score: null, evaluated: false, tasks: [] },
          speaking: { score: null, evaluated: false, parts: [] },
          overall: data.scores.overall.band
        });

        // Set AI feedback data
        setSkillBreakdown(data.skill_breakdown || []);
        setTeacherFeedback(data.teacher_feedback || null);
        setRecommendedLessons(data.recommended_lessons || []);
        setQuestionResults(data.question_results || { listening: [], reading: [] });
        setFastestGain(data.fastest_gain || []);
        setIntegrityWarnings(data.integrity_warnings || []);
        setReasonSummary(data.reason_summary || {});
        setRootCauseAnalysis(data.root_cause_analysis || []);
        setStudyPlan(data.study_plan || null);

      } else {
        toast.error('Could not evaluate test');
      }

    } catch (error) {
      console.error('Error evaluating test:', error);
      toast.error('Could not load results');

      // Fallback to basic calculation
      try {
        const _email = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null')?.email || null; } catch { return null; } })();
        const ansRes = await fetch(`${API_URL}/api/cambridge/answers/${bookId}/${testId}${_email ? `?email=${encodeURIComponent(_email)}` : ''}`);
        const ansData = await ansRes.json();

        if (ansData.success) {
          const listeningResult = calculateSectionScore('listening', answers, ansData.answers?.listening);
          const readingResult = calculateSectionScore('reading', answers, ansData.answers?.reading);

          const scores = [listeningResult.band, readingResult.band].filter(s => s);
          const overall = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 2) / 2 : null;

          setResults({
            listening: listeningResult,
            reading: readingResult,
            writing: { score: null, evaluated: false, tasks: [] },
            speaking: { score: null, evaluated: false, parts: [] },
            overall
          });
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  // Speaking P2 state — fluency analysis effect + drill/model-answer fetchers.
  // useFluencyInsights is deliberately called AFTER the mount effect above so
  // its useEffect registers second, exactly like the original file.
  const fluencyInsights = useFluencyInsights(speakingEvaluations);
  const { speakingDrills, loadingDrills, fetchDrills, modelAnswers, loadingModels, fetchModelAnswer } =
    useSpeakingExtras({ speakingEvaluations, bookId, testId });

  const evaluateWriting = async () => {
    setEvaluating(true);
    toast.info('Evaluating writing responses...');

    try {
      const tasks = [];

      const task1Response = answers['writing_task1'] || '';
      if (task1Response.trim()) {
        const res1 = await fetch(`${API_URL}/api/cambridge/evaluate/writing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: bookId,
            test_id: testId,
            task_number: 1,
            response: task1Response,
            user_id: _getUserId(),
          })
        });
        const data1 = await res1.json();
        if (data1.success) {
          tasks.push({
            taskNumber: 1,
            wordCount: data1.word_count,
            minimumWords: data1.minimum_words,
            overallBand: data1.overall_band,
            criteria: data1.criteria,
            feedback: data1.feedback,
            referenceSamples: data1.reference_samples,
            userResponse: task1Response
          });
        }
      }

      const task2Response = answers['writing_task2'] || '';
      if (task2Response.trim()) {
        const res2 = await fetch(`${API_URL}/api/cambridge/evaluate/writing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: bookId,
            test_id: testId,
            task_number: 2,
            response: task2Response,
            user_id: _getUserId(),
          })
        });
        const data2 = await res2.json();
        if (data2.success) {
          tasks.push({
            taskNumber: 2,
            wordCount: data2.word_count,
            minimumWords: data2.minimum_words,
            overallBand: data2.overall_band,
            criteria: data2.criteria,
            feedback: data2.feedback,
            referenceSamples: data2.reference_samples,
            userResponse: task2Response
          });
        }
      }

      let overallWritingBand = null;
      if (tasks.length > 0) {
        if (tasks.length === 2) {
          overallWritingBand = Math.round(((tasks[0].overallBand + tasks[1].overallBand * 2) / 3) * 2) / 2;
        } else {
          overallWritingBand = tasks[0].overallBand;
        }
      }

      setResults(prev => ({
        ...prev,
        writing: {
          score: overallWritingBand,
          evaluated: true,
          tasks: tasks
        }
      }));

      toast.success('Writing evaluation complete!');

    } catch (error) {
      console.error('Writing evaluation error:', error);
      toast.error('Could not evaluate writing');
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  // Calculate strengths and weaknesses from skill breakdown
  const strengths = skillBreakdown.filter(s => s.total > 0 && (s.correct / s.total) >= 0.7);
  const weaknesses = skillBreakdown.filter(s => s.total > 0 && (s.correct / s.total) < 0.5);

  // Reading/Listening-only mode hides Writing + Speaking sections entirely.
  // The user only attempted R/L, so the Writing/Speaking pending cards are
  // pure noise. Full Test (mode === 'full') still shows everything.
  const rlOnly = mode === 'skill' && (skill === 'reading' || skill === 'listening');

  // SceneBar tab state.
  // - Full mode: 5 tabs (overview default + reading/listening/writing/speaking).
  //   Tab persisted in URL `?tab=` so refresh + bookmark survives.
  // - Skill-only mode (rlOnly): no SceneBar; the page renders that one
  //   skill's detail directly. activeTab is forced to the skill name so
  //   the per-skill render branches still match.
  const fullMode = mode !== 'skill';
  const requestedTab = searchParams.get('tab');
  const validTabs = ['overview', 'reading', 'listening', 'writing', 'speaking'];
  const activeTab = rlOnly
    ? skill
    : (fullMode && validTabs.includes(requestedTab))
      ? requestedTab
      : (fullMode ? 'overview' : skill);
  const setActiveTab = (t) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', t);
    setSearchParams(next, { replace: true });
  };

  // Skill-mode speaking only — render the D7 SpeakingResultsState alone,
  // no listening/reading/writing cards, no full-test header.
  if (mode === 'skill' && skill === 'speaking') {
    return (
      <SpeakingSkillResults
        speakingEvaluations={speakingEvaluations}
        testData={testData}
        bookId={bookId}
        testId={testId}
        navigate={navigate}
      />
    );
  }

  // Listening-only render — same sample-mockup parity treatment as Reading.
  // ListeningResultsLayout owns the page (band dial + Liz card + part cards
  // P1-P4 + insight tiles + audioscript modal), skipping the purple wrapper.
  if (activeTab === 'listening' && questionResults.listening?.length > 0) {
    return (
      <ListeningResultsLayout
        standalone
        feedback={{
          question_results: questionResults.listening,
          correct: results?.listening?.correct ?? 0,
          total: results?.listening?.total ?? 0,
          percentage: results?.listening?.percentage ?? 0,
          transcript: results?.listening?.transcript,
          teacher_feedback: teacherFeedback,
        }}
        band={results?.listening?.band ?? results?.overall_band}
        user={(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })()}
        testMeta={{
          title: results?.test_book ? `Cambridge ${results.test_book}` : `Cambridge`,
          subtitle: `Test ${testId}`,
          durationMin: results?.listening?.duration_minutes,
          allowedMin: 30,
          targetBand: results?.target_band || 7.0,
        }}
        insights={{
          rootCauseAnalysis,
          fastestGain,
          reasonSummary,
          recommendedLessons,
        }}
        onRetry={() => navigate(`/cambridge-test/${bookId}/${testId}?skill=listening`)}
        onPracticePriority={(p) => {
          const typeMap = { note: 'note_completion', mc: 'multiple_choice', match: 'matching', multi: 'multi_select', short: 'short_answer' };
          const qtype = typeMap[p?.key];
          navigate(qtype ? `/question-bank/listening/practice?type=${qtype}` : '/question-bank/listening');
        }}
        onBack={() => navigate(rlOnly ? '/dashboard' : `/cambridge-test/${bookId}/${testId}/results`)}
      />
    );
  }

  // Reading-only render — sample-mockup parity. When the user is on the
  // Reading tab (skill mode or full-mode tab) we skip the giant purple
  // wrapper, hero, and SceneBar entirely so the analytics surface owns
  // the page (matches /Desktop/design-handoffs/ReadingResults_Editable.html).
  if (activeTab === 'reading' && questionResults.reading?.length > 0) {
    const readingPassages = (testData?.sections?.reading?.passages || []).map((p, i) => ({
      id: p.passage_number ?? p.id ?? i + 1,
      title: p.title || `Passage ${i + 1}`,
      text: p.passage_text || p.text || '',
      start_q: p.start_question_number ?? p.start_q,
      end_q: p.end_question_number ?? p.end_q,
    }));
    return (
      <ReadingResultsLayout
        standalone
        feedback={{
          question_results: questionResults.reading,
          correct: results?.reading?.correct ?? 0,
          total: results?.reading?.total ?? 0,
          percentage: results?.reading?.percentage ?? 0,
          teacher_feedback: teacherFeedback,
          passages: readingPassages,
        }}
        band={results?.reading?.band ?? results?.overall_band}
        user={(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })()}
        testMeta={{
          title: results?.test_book ? `Cambridge ${results.test_book}` : `Cambridge`,
          subtitle: `Test ${testId}`,
          durationMin: results?.reading?.duration_minutes,
          allowedMin: 60,
          targetBand: results?.target_band || 7.0,
        }}
        insights={{
          rootCauseAnalysis,
          fastestGain,
          reasonSummary,
          recommendedLessons,
        }}
        onRetry={() => navigate(`/cambridge-test/${bookId}/${testId}?skill=reading`)}
        onPracticePriority={(p) => {
          const typeMap = { tfng: 'true_false_ng', fill: 'sentence_completion', mc: 'multiple_choice', match: 'matching_information', heading: 'matching_headings' };
          const qtype = typeMap[p?.key];
          navigate(qtype ? `/question-bank/reading/practice?type=${qtype}` : '/question-bank/reading/academic');
        }}
        onBack={() => navigate(rlOnly ? '/dashboard' : `/cambridge-test/${bookId}/${testId}/results`)}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #8b5cf6 50%, #a855f7 75%, #c084fc 100%)',
      animation: 'gradientShift 20s ease infinite',
    }}>
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #8b5cf6 50%, #a855f7 75%, #c084fc 100%); }
          25% { background: linear-gradient(135deg, #764ba2 0%, #8b5cf6 25%, #a855f7 50%, #c084fc 75%, #e879f9 100%); }
          50% { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #c084fc 50%, #e879f9 75%, #fbbf24 100%); }
          75% { background: linear-gradient(135deg, #a855f7 0%, #c084fc 25%, #e879f9 50%, #fbbf24 75%, #667eea 100%); }
        }
      `}</style>
      <div className="relative">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={() => navigate('/question-bank')}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Question Bank
          </button>

        {/* Hero Section - Glassmorphism Design */}
        <ResultsHero
          computedOverall={computedOverall}
          results={results}
          testData={testData}
          bookId={bookId}
          testId={testId}
          fullMode={fullMode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          showBandTooltip={showBandTooltip}
          setShowBandTooltip={setShowBandTooltip}
        />


        {/* Band Calculation Tooltip */}
        {showBandTooltip && (
          <BandBreakdown
            results={results}
            speakingEvaluations={speakingEvaluations}
            computedOverall={computedOverall}
          />
        )}

        {/* Navigation Tabs */}
        {fullMode && (
          <ResultsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        )}

        {/* Holistic / cross-skill analysis cards.
            - Full mode: shown only on Overview tab.
            - Skill-only mode (rlOnly): all this analysis IS about that one
              skill (backend skill-gating filters scoring), so show it
              directly on the skill page since there is no SceneBar/Overview. */}
        {/* Integrity Warnings */}
        {(activeTab === 'overview' || rlOnly) && integrityWarnings.length > 0 && (
          <IntegrityWarnings integrityWarnings={integrityWarnings} />
        )}

        {/* Holistic insights — tile grid (collapsed) + drawer (full content).
            Aga: "su ozellikler cards icinde dursa, basinca drawer seklinde
            acilsa. simdi bu kadar seyi okumak zor ve bogucu" — show only
            tile summaries on Overview, full body opens in a slide-in
            drawer when a tile is clicked. Tile is hidden when its data is
            empty so the grid never renders empty placeholders. */}
        {(activeTab === 'overview' || (rlOnly && skill !== 'reading')) && (
          <InsightsTileGrid
            questionResults={questionResults}
            rootCauseAnalysis={rootCauseAnalysis}
            reasonSummary={reasonSummary}
            fastestGain={fastestGain}
            teacherFeedback={teacherFeedback}
            recommendedLessons={recommendedLessons}
            studyPlan={studyPlan}
            setOpenInsight={setOpenInsight}
          />
        )}

        {/* Insight Drawer — slide-in panel that holds the full content of
            whichever holistic card the user opened. Each card body renders
            only when openInsight matches its id, so they appear inside the
            drawer instead of stacking on the page. */}
        {openInsight && (
          <InsightDrawer
            openInsight={openInsight}
            setOpenInsight={setOpenInsight}
            rootCauseAnalysis={rootCauseAnalysis}
            reasonSummary={reasonSummary}
            questionResults={questionResults}
            fastestGain={fastestGain}
            teacherFeedback={teacherFeedback}
            strengths={strengths}
            weaknesses={weaknesses}
            skillBreakdown={skillBreakdown}
            recommendedLessons={recommendedLessons}
            studyPlan={studyPlan}
            computedOverall={computedOverall}
            navigate={navigate}
            bookId={bookId}
            testId={testId}
            testData={testData}
          />
        )}
        {/* End insight drawer */}

        {/* Listening / Reading drilldowns — D7 polished view, ported from
            features/results/ReadingListeningDrilldown so this page renders
            the same passage/part grouping, evidence cards, transcript reveal
            and reason chips as Results.js. The old inline mapping (with its
            collapsed-header expand toggle and the divergent skill breakdown
            panel) was deleted — the sticky group headers inside the shared
            component already handle navigation through long lists. */}
        {activeTab === 'listening' && questionResults.listening?.length > 0 && (
          <ReadingListeningDrilldown
            testType="listening"
            feedback={{
              question_results: questionResults.listening,
              correct: results?.listening?.correct ?? 0,
              total: results?.listening?.total ?? 0,
              percentage: results?.listening?.percentage ?? 0,
              transcript: results?.listening?.transcript,
            }}
          />
        )}
        {activeTab === 'reading' && questionResults.reading?.length > 0 && (
          <ReadingResultsLayout
            feedback={{
              question_results: questionResults.reading,
              correct: results?.reading?.correct ?? 0,
              total: results?.reading?.total ?? 0,
              percentage: results?.reading?.percentage ?? 0,
              teacher_feedback: teacherFeedback,
            }}
            band={results?.reading?.band ?? results?.overall_band}
            user={(() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })()}
            testMeta={{
              title: results?.test_book ? `Cambridge ${results.test_book}` : `Cambridge`,
              subtitle: `Test ${testId}`,
              durationMin: results?.reading?.duration_minutes,
              allowedMin: 60,
              targetBand: results?.target_band || 7.0,
            }}
            insights={{
              rootCauseAnalysis,
              fastestGain,
              reasonSummary,
              recommendedLessons,
            }}
            onRetry={() => navigate(`/cambridge-test/${bookId}/${testId}?skill=reading`)}
            onPracticePriority={(p) => {
          const typeMap = { tfng: 'true_false_ng', fill: 'sentence_completion', mc: 'multiple_choice', match: 'matching_information', heading: 'matching_headings' };
          const qtype = typeMap[p?.key];
          navigate(qtype ? `/question-bank/reading/practice?type=${qtype}` : '/question-bank/reading/academic');
        }}
            backHref="/dashboard"
          />
        )}
        {/* Writing Evaluation Section */}
        {activeTab === 'writing' && (
          <WritingSection
            results={results}
            evaluating={evaluating}
            evaluateWriting={evaluateWriting}
          />
        )}

        {/* Speaking Section — D7 ResultsState header + drawer with legacy
             per-response detail. Pending state shown when no evaluations yet. */}
        {activeTab === 'speaking' && (
          <SpeakingSection
            speakingEvaluations={speakingEvaluations}
            navigate={navigate}
          />
        )}

        {/* ============ SPEAKING P2 FEATURES ============ */}
        {activeTab === 'speaking' && Object.keys(speakingEvaluations).length > 0 && (
          <SpeakingP2Panels
            speakingEvaluations={speakingEvaluations}
            testData={testData}
            fluencyInsights={fluencyInsights}
            speakingDrills={speakingDrills}
            loadingDrills={loadingDrills}
            fetchDrills={fetchDrills}
            modelAnswers={modelAnswers}
            loadingModels={loadingModels}
            fetchModelAnswer={fetchModelAnswer}
          />
        )}

        {/* ============ ONE NEXT STEP CTA ============ */}
        {(activeTab === 'overview' || rlOnly) && results && (
          <NextStepCTA
            results={results}
            questionResults={questionResults}
            speakingEvaluations={speakingEvaluations}
            fluencyInsights={fluencyInsights}
            computedOverall={computedOverall}
            bookId={bookId}
            testId={testId}
            testData={testData}
            navigate={navigate}
          />
        )}

        {/* Action Buttons */}
        <ActionButtons
          questionResults={questionResults}
          navigate={navigate}
          bookId={bookId}
          testId={testId}
          testData={testData}
        />
        </div>
      </div>
    </div>
  );
}
