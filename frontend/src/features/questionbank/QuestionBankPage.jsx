import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  BookOpen, Headphones, PenTool, Mic, BookMarked,
  Clock, TrendingUp, ChevronRight, Play,
  CheckCircle, X, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useGoBack } from '../../hooks/useGoBack';
import AppShellNav from '../../components/appshell/AppShellNav';
import { T, FONT_SANS, SECTION_TIMES, SECTION_QUESTIONS, SECTION_COLORS } from './constants';
import useQuestionBankDeepLinks from './hooks/useQuestionBankDeepLinks';
import QuestionBankHeader from './components/QuestionBankHeader';
import CompletionBreakdown from './components/CompletionBreakdown';
import LizPickHero from './components/LizPickHero';
import SkillTabsBar from './components/SkillTabsBar';
import OverviewFilterBar from './components/OverviewFilterBar';
import InlineWritingPanel from './components/InlineWritingPanel';
import InlineReadingPanel from './components/InlineReadingPanel';
import InlineListeningPanel from './components/InlineListeningPanel';
import InlineSpeakingPanel from './components/InlineSpeakingPanel';
import PromptGrid from './components/PromptGrid';
import PracticeTab from './components/PracticeTab';
import TestsTab from './components/TestsTab';
import WritingModal from './components/WritingModal';
import ReadingModal from './components/ReadingModal';
import ListeningModal from './components/ListeningModal';
import SpeakingModal from './components/SpeakingModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function QuestionBank({ user }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedBand, setSelectedBand] = useState(null);
  const [skills, setSkills] = useState([]);
  const [topics, setTopics] = useState([]);
  const [bandLevels, setBandLevels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWritingModal, setShowWritingModal] = useState(false);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [showListeningModal, setShowListeningModal] = useState(false);
  const [showSpeakingModal, setShowSpeakingModal] = useState(false);
  // Tracks whether the currently-open skill picker modal was auto-opened from
  // a deep-link (e.g. dashboard ?writing=1 / ?reading=1 / ...). When true,
  // closing the modal pops history instead of leaving the user stranded on
  // /question-bank.
  const modalDeepLink = useRef(false);
  // Generic "back" that respects browser history; falls back to dashboard if
  // the user landed here directly (no history entry to pop).
  const goBack = useGoBack();
  const makeCloseModal = (setShow) => () => {
    if (modalDeepLink.current) {
      modalDeepLink.current = false;
      setShow(false);
      goBack();
    } else {
      setShow(false);
    }
  };
  const closeWritingModal = makeCloseModal(setShowWritingModal);
  const closeReadingModal = makeCloseModal(setShowReadingModal);
  const closeListeningModal = makeCloseModal(setShowListeningModal);
  const closeSpeakingModal = makeCloseModal(setShowSpeakingModal);
  const [fullTests, setFullTests] = useState([]);
  const [cambridgeBooks, setCambridgeBooks] = useState([]);
  const [selectedCambridgeBook, setSelectedCambridgeBook] = useState(null);
  // Reading + Listening question-type pickers (Cathoven-style dropdown) —
  // the READING_QTYPES / LISTENING_QTYPES option lists live in ./constants.
  const [selectedReadingQType, setSelectedReadingQType] = useState('');
  const [selectedListeningQType, setSelectedListeningQType] = useState('');

  // Full Test Modal State
  const [selectedTest, setSelectedTest] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [startingTest, setStartingTest] = useState(false);

  // Cambridge Test Selection Modal State
  const [showCambridgeTestModal, setShowCambridgeTestModal] = useState(false);
  const [selectedCambridgeTest, setSelectedCambridgeTest] = useState(null);

  // Full Tests sub-category: null (selection screen), 'cambridge', 'ai'
  const [testCategory, setTestCategory] = useState(null);

  // Completion tracking
  const [completionStats, setCompletionStats] = useState(null);
  const [showCompletionDetail, setShowCompletionDetail] = useState(false);

  // D9 prompt search + Type filter + hide-done toggle
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [hideDone, setHideDone] = useState(false);
  // D9 active skill tab (writing/speaking/reading/listening)
  const [skillTab, setSkillTab] = useState('writing');
  // Advanced Mastery modules — used to deep-link writing prompt cards by topic
  // name to /advanced-mastery?lesson={module_number}&focus=writing
  const [advancedModules, setAdvancedModules] = useState([]);
  // D9 Topic dropdown — controlled by React state instead of DOM class toggle
  const [topicDropdownOpen, setTopicDropdownOpen] = useState(false);
  // Band/Topic filter visibility — collapsed by default; opens via Filters pill
  // (band-level filtering is a power-user feature, hidden until requested)
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deep-link effects (?tab= / ?fulltests= / ?writing=1… / ?openTest=) — run in
  // the same order they were declared in the original component.
  useQuestionBankDeepLinks({
    searchParams,
    setSearchParams,
    navigate,
    setActiveTab,
    setTestCategory,
    setShowWritingModal,
    setShowReadingModal,
    setShowListeningModal,
    setShowSpeakingModal,
    modalDeepLink,
    setSelectedCambridgeTest,
    setShowCambridgeTestModal,
  });

  // Reload topics when band changes (Topic Gating)
  useEffect(() => {
    loadTopicsForBand(selectedBand);
  }, [selectedBand]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      const [skillsRes, bandsRes, statsRes, testsRes, cambridgeRes] = await Promise.all([
        fetch(`${API_URL}/api/question-bank/skills`),
        fetch(`${API_URL}/api/question-bank/band-levels`),
        fetch(`${API_URL}/api/question-bank/stats`),
        fetch(`${API_URL}/api/full-test/sets`),
        fetch(`${API_URL}/api/cambridge/books`)
      ]);

      const [skillsData, bandsData, statsData, testsData, cambridgeData] = await Promise.all([
        skillsRes.json(),
        bandsRes.json(),
        statsRes.json(),
        testsRes.json(),
        cambridgeRes.ok ? cambridgeRes.json() : { books: [] }
      ]);

      setSkills(skillsData.skills || []);
      setBandLevels(bandsData.band_levels || []);
      setStats(statsData);
      // Merge academic and general tests
      const allTests = [
        ...(testsData.academic_sets || []).map(t => ({ ...t, test_type: 'academic' })),
        ...(testsData.general_sets || []).map(t => ({ ...t, test_type: 'general' }))
      ];
      setFullTests(allTests);
      setCambridgeBooks(cambridgeData.books || []);

      // Load completion stats if user is logged in
      if (user?.id) {
        try {
          const compRes = await fetch(`${API_URL}/api/user/${user.id}/completion-stats`);
          if (compRes.ok) {
            const compData = await compRes.json();
            setCompletionStats(compData);
          }
        } catch (err) {
          console.error('Error loading completion stats:', err);
        }
      }

      // Load all topics initially (from Lesson Registry)
      await loadTopicsForBand(null);

      // Load Advanced Mastery modules for prompt-card deep-linking (writing)
      try {
        const amRes = await fetch(`${API_URL}/api/advanced-mastery/modules`);
        if (amRes.ok) {
          const amData = await amRes.json();
          setAdvancedModules(Array.isArray(amData) ? amData : []);
        }
      } catch (amErr) {
        console.error('Error loading advanced modules:', amErr);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load question bank data');
    } finally {
      setLoading(false);
    }
  };

  // Load topics from Lesson Registry with band filtering
  const loadTopicsForBand = async (bandLevel) => {
    try {
      const url = bandLevel
        ? `${API_URL}/api/lesson-registry/topics?band_level=${bandLevel}`
        : `${API_URL}/api/lesson-registry/topics`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setTopics(data.topics || []);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  // Start Full Test
  const startFullTest = async (mode) => {
    if (!selectedTest) return;

    setStartingTest(true);
    try {
      const res = await fetch(`${API_URL}/api/full-test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: selectedTest.test_id,
          mode: mode
        })
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/full-test/take/${selectedTest.test_id}?session=${data.session.session_id}&mode=${mode}`);
      }
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test session');
    } finally {
      setStartingTest(false);
    }
  };

  // Open test modal
  const openTestModal = (test) => {
    setSelectedTest(test);
    setShowTestModal(true);
  };

  // Close test modal
  const closeTestModal = () => {
    setSelectedTest(null);
    setShowTestModal(false);
  };

  const skillColors = {
    reading: 'from-blue-500 to-blue-600',
    listening: 'from-purple-500 to-purple-600',
    writing: 'from-green-500 to-green-600',
    speaking: 'from-orange-500 to-orange-600',
  };

  const startPractice = (mode, skill) => {
    if (!skill) {
      toast.error('Please select a skill first');
      return;
    }

    // Navigate to practice page with params
    navigate(`/question-bank/practice?mode=${mode}&skill=${skill}${selectedTopic ? `&topic=${selectedTopic}` : ''}${selectedBand ? `&band=${selectedBand}` : ''}`);
  };

  if (loading) {
    return (
      <div className="appshell-page" style={{ fontFamily: FONT_SANS, color: `hsl(${T.ink})` }}>
        <AppShellNav currentPage="practice" user={user} />
        <div style={{ display: 'grid', placeItems: 'center', padding: '120px 24px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: `2px solid hsl(${T.border})`, borderBottomColor: `hsl(${T.brand})`,
            animation: 'spin 0.9s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const completionPct = completionStats?.total_full_available
    ? Math.round((completionStats.total_full_completed / completionStats.total_full_available) * 100)
    : 0;

  // D9: derive weakest skill from completion stats (lowest completion %).
  // completionStats.practice is { writing: count, ... } — use as a rough proxy
  // for "where the user has practised least". Falls back to 'writing'.
  const weakestSkill = (() => {
    const practice = completionStats?.practice || {};
    const candidates = ['writing', 'speaking', 'reading', 'listening'];
    let lowest = 'writing';
    let lowestCount = Infinity;
    for (const c of candidates) {
      const count = practice[c] ?? 0;
      if (count < lowestCount) {
        lowestCount = count;
        lowest = c;
      }
    }
    return lowest;
  })();

  // D9: pick a single Liz-recommended prompt from the topics list.
  // We don't have per-skill prompts wired here yet, so fall back to the
  // first available topic. This is purely cosmetic — clicking opens the
  // existing skill modal exactly like the skill cards already do.
  const lizPickTopic = topics[0] || null;
  const openSkillModal = (skillId) => {
    if (skillId === 'writing') setShowWritingModal(true);
    else if (skillId === 'reading') setShowReadingModal(true);
    else if (skillId === 'listening') setShowListeningModal(true);
    else if (skillId === 'speaking') setShowSpeakingModal(true);
  };

  // D9 Type filter options per skill tab. Only relevant chips are shown.
  const typeFiltersForSkill = (s) => {
    if (s === 'writing') return [
      { id: 'all', label: 'All' },
      { id: 'task1', label: 'Task 1' },
      { id: 'task2', label: 'Task 2' },
    ];
    if (s === 'speaking') return [
      { id: 'all', label: 'All' },
      { id: 'part1', label: 'Part 1' },
      { id: 'part2', label: 'Part 2' },
      { id: 'part3', label: 'Part 3' },
    ];
    return [{ id: 'all', label: 'All' }];
  };

  // D9 prompt grid — filters topics by search + selected topic + type filter.
  // Topic data shape comes from /api/lesson-registry/topics (id/name/icon/
  // description). Band filtering is already applied via loadTopicsForBand.
  // Type filter (task1/task2/part1/2/3) narrows by topic.type|task|part if
  // present in the payload, else by simple name/description keyword match.
  const typeKeywords = {
    task1: ['task 1', 'task1'],
    task2: ['task 2', 'task2', 'essay'],
    part1: ['part 1', 'part1'],
    part2: ['part 2', 'part2', 'cue card', 'long turn'],
    part3: ['part 3', 'part3', 'discussion'],
  };
  // Prompt grid is sourced from Advanced Mastery modules so each card is a
  // course title ("The Digital Frontier", "The Educational Paradigm", …)
  // and clicking it deep-links into that lesson's writing/reading/etc.
  // section via /advanced-mastery?lesson=N&focus={skillTab}. We map module
  // shape → the {id, name, description, module_number} the grid expects.
  const filteredPrompts = (advancedModules || [])
    .map((m) => ({
      id: `am-${m.module_number}`,
      name: m.title || '',
      description: m.subtitle || '',
      module_number: m.module_number,
      level: m.level,
    }))
    .filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const name = (t.name || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      if (typeFilter !== 'all') {
        const hay = `${t.name || ''} ${t.description || ''}`.toLowerCase();
        const kws = typeKeywords[typeFilter] || [typeFilter];
        if (!kws.some((k) => hay.includes(k))) return false;
      }
      return true;
    });

  return (
    <div className="appshell-page" style={{ fontFamily: FONT_SANS, color: `hsl(${T.ink})` }}>
      <AppShellNav currentPage="practice" user={user} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>

        {/* Back + Page Head (title row, stat chips, subtitle, search + Filters pill) */}
        <QuestionBankHeader
          goBack={goBack}
          stats={stats}
          completionStats={completionStats}
          showCompletionDetail={showCompletionDetail}
          setShowCompletionDetail={setShowCompletionDetail}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          selectedBand={selectedBand}
          selectedTopic={selectedTopic}
        />

        {/* Completion Breakdown Popup — preserved, restyled */}
        {showCompletionDetail && completionStats && (
          <CompletionBreakdown
            completionStats={completionStats}
            setShowCompletionDetail={setShowCompletionDetail}
          />
        )}

        {/* ===== D9 Liz's Pick hero (Practice only) ===== */}
        {activeTab !== 'tests' && lizPickTopic && (
          <LizPickHero
            lizPickTopic={lizPickTopic}
            weakestSkill={weakestSkill}
            setSkillTab={setSkillTab}
            openSkillModal={openSkillModal}
          />
        )}

        {/* ===== D9 Skill Tabs — centered iOS 26 segmented pill ===== */}
        <SkillTabsBar
          stats={stats}
          activeTab={activeTab}
          skillTab={skillTab}
          setActiveTab={setActiveTab}
          setSkillTab={setSkillTab}
          setTypeFilter={setTypeFilter}
        />

        {/* Overview Tab — Practice */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Filter Bar — D9 chip style (band + topic) — visible when toggled or active */}
            {(showFilters || selectedBand || selectedTopic) && (
              <OverviewFilterBar
                bandLevels={bandLevels}
                topics={topics}
                selectedBand={selectedBand}
                setSelectedBand={setSelectedBand}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
                topicDropdownOpen={topicDropdownOpen}
                setTopicDropdownOpen={setTopicDropdownOpen}
              />
            )}

            {/* Inline skill content — renders the same tiles/links the per-skill
                modal has (Academic + GT Task 1/2 for Writing, Part 1/2/3 for
                Speaking, band tiers + question types for Listening, Academic/
                General passages + question types for Reading). No floating
                overlay — content is shown directly below the tabs/filters. */}

            {/* WRITING inline */}
            {skillTab === 'writing' && (
              <InlineWritingPanel
                selectedTopic={selectedTopic}
                selectedBand={selectedBand}
                bandLevels={bandLevels}
                topics={topics}
              />
            )}

            {/* READING inline */}
            {skillTab === 'reading' && (
              <InlineReadingPanel
                selectedTopic={selectedTopic}
                selectedBand={selectedBand}
                bandLevels={bandLevels}
                topics={topics}
              />
            )}

            {/* LISTENING inline */}
            {skillTab === 'listening' && (
              <InlineListeningPanel
                selectedTopic={selectedTopic}
                selectedBand={selectedBand}
                bandLevels={bandLevels}
                topics={topics}
              />
            )}

            {/* SPEAKING inline */}
            {skillTab === 'speaking' && (
              <InlineSpeakingPanel
                selectedTopic={selectedTopic}
                selectedBand={selectedBand}
                bandLevels={bandLevels}
                topics={topics}
              />
            )}

            {/* ===== D9 Prompt grid (search/type/done filtered) ===== */}
            {filteredPrompts.length > 0 && (
              <PromptGrid
                filteredPrompts={filteredPrompts}
                skillTab={skillTab}
                typeFilter={typeFilter}
                hideDone={hideDone}
                completionStats={completionStats}
                openSkillModal={openSkillModal}
              />
            )}
          </div>
        )}

        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <PracticeTab
            skills={skills}
            topics={topics}
            bandLevels={bandLevels}
            selectedSkill={selectedSkill}
            setSelectedSkill={setSelectedSkill}
            selectedTopic={selectedTopic}
            setSelectedTopic={setSelectedTopic}
            selectedBand={selectedBand}
            setSelectedBand={setSelectedBand}
            startPractice={startPractice}
          />
        )}

        {/* Tests Tab — visible on Full Tests scene */}
        {activeTab === 'tests' && (
          <TestsTab
            testCategory={testCategory}
            setTestCategory={setTestCategory}
            stats={stats}
            fullTests={fullTests}
            openTestModal={openTestModal}
            setSelectedCambridgeTest={setSelectedCambridgeTest}
            setShowCambridgeTestModal={setShowCambridgeTestModal}
          />
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Analysis</h3>
              <p className="text-gray-500 mb-6">Track your performance and discover weak areas</p>
              <Badge className="bg-amber-100 text-amber-700">Coming Soon</Badge>
            </div>
          </div>
        )}
      </div>

      {/* Writing Task Selection Modal */}
      {showWritingModal && (
        <WritingModal
          selectedTopic={selectedTopic}
          selectedBand={selectedBand}
          bandLevels={bandLevels}
          topics={topics}
          setShowWritingModal={setShowWritingModal}
          closeWritingModal={closeWritingModal}
        />
      )}

      {/* Reading Task Selection Modal */}
      {showReadingModal && (
        <ReadingModal
          selectedTopic={selectedTopic}
          selectedBand={selectedBand}
          bandLevels={bandLevels}
          topics={topics}
          selectedReadingQType={selectedReadingQType}
          setSelectedReadingQType={setSelectedReadingQType}
          setShowReadingModal={setShowReadingModal}
          closeReadingModal={closeReadingModal}
        />
      )}

      {/* Listening Practice Modal */}
      {showListeningModal && (
        <ListeningModal
          selectedTopic={selectedTopic}
          selectedBand={selectedBand}
          bandLevels={bandLevels}
          topics={topics}
          selectedListeningQType={selectedListeningQType}
          setSelectedListeningQType={setSelectedListeningQType}
          setShowListeningModal={setShowListeningModal}
          closeListeningModal={closeListeningModal}
        />
      )}

      {/* Full Test Selection Modal */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className={`mb-2 ${selectedTest.test_type === 'academic' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {selectedTest.test_type === 'academic' ? 'Academic' : 'General Training'}
                  </Badge>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedTest.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{selectedTest.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={closeTestModal}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Test Structure */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Test Structure</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['listening', 'reading', 'writing', 'speaking'].map((section) => {
                    const colors = SECTION_COLORS[section];
                    const Icon = section === 'listening' ? Headphones :
                                 section === 'reading' ? BookOpen :
                                 section === 'writing' ? PenTool : Mic;
                    return (
                      <div key={section} className={`p-3 rounded-lg ${colors.light}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                          <span className="font-medium capitalize text-slate-900">{section}</span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {SECTION_TIMES[section]} • {SECTION_QUESTIONS[section]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Test Rules */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Test Rules</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    You must complete each section within the time limit
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Once a section is submitted, you cannot return to it
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Results will only be shown after completing all sections
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    Ensure you have a stable internet connection
                  </li>
                </ul>
              </div>

              {/* Mode Selection */}
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Choose How to Start</h3>

                {/* Full Test Option */}
                <button
                  onClick={() => startFullTest('full')}
                  disabled={startingTest}
                  className="w-full p-4 mb-3 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      {startingTest ? (
                        <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">Full Test (All Sections)</div>
                      <div className="text-sm text-slate-500">
                        Complete Listening → Reading → Writing → Speaking (~3 hours)
                      </div>
                    </div>
                  </div>
                </button>

                {/* Individual Section Selection */}
                <div className="border-2 border-slate-200 rounded-lg p-4">
                  <div className="font-medium text-slate-900 mb-3">Or Start a Single Section:</div>
                  <div className="grid grid-cols-2 gap-3">
                    {['listening', 'reading', 'writing', 'speaking'].map((section) => {
                      const Icon = section === 'listening' ? Headphones :
                                   section === 'reading' ? BookOpen :
                                   section === 'writing' ? PenTool : Mic;
                      const colors = {
                        listening: 'bg-blue-50 border-blue-200 hover:border-blue-500 text-blue-700',
                        reading: 'bg-green-50 border-green-200 hover:border-green-500 text-green-700',
                        writing: 'bg-purple-50 border-purple-200 hover:border-purple-500 text-purple-700',
                        speaking: 'bg-orange-50 border-orange-200 hover:border-orange-500 text-orange-700'
                      };
                      return (
                        <button
                          key={section}
                          onClick={() => startFullTest(section)}
                          disabled={startingTest}
                          className={`p-3 border-2 rounded-lg transition-all text-left disabled:opacity-50 ${colors[section]}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium capitalize">{section}</span>
                          </div>
                          <div className="text-xs opacity-80">
                            {SECTION_TIMES[section]} • {SECTION_QUESTIONS[section]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <Button variant="outline" onClick={closeTestModal}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Speaking Practice Modal */}
      {showSpeakingModal && (
        <SpeakingModal
          selectedTopic={selectedTopic}
          selectedBand={selectedBand}
          bandLevels={bandLevels}
          topics={topics}
          setShowSpeakingModal={setShowSpeakingModal}
          closeSpeakingModal={closeSpeakingModal}
        />
      )}

      {/* Cambridge Test Selection Modal */}
      {showCambridgeTestModal && selectedCambridgeTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => {
                setShowCambridgeTestModal(false);
                setSelectedCambridgeTest(null);
              }}
            >
              <X className="w-4 h-4" />
            </Button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookMarked className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedCambridgeTest.title}</h2>
              <p className="text-gray-500">How would you like to practice?</p>
            </div>

            <div className="space-y-4">
              {/* Full Test Mode */}
              <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-red-300 bg-gradient-to-r from-red-50 to-orange-50"
                onClick={() => {
                  setShowCambridgeTestModal(false);
                  navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}`);
                }}
                data-testid="select-full-test"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">Full Test Mode</h3>
                    <p className="text-sm text-gray-600 mb-3">Complete all 4 sections in order - just like the real exam</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <Headphones className="w-3 h-3 text-blue-500" /> Listening (40 min)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <BookOpen className="w-3 h-3 text-green-500" /> Reading (60 min)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <PenTool className="w-3 h-3 text-purple-500" /> Writing (60 min)
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-lg px-2 py-1">
                        <Mic className="w-3 h-3 text-orange-500" /> Speaking (14 min)
                      </div>
                    </div>
                    <Badge className="mt-3 bg-red-100 text-red-700">~2 hours 45 minutes</Badge>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </Card>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-400">or practice individual skills</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Skill Selection */}
              <div className="grid grid-cols-2 gap-3">
                {/* Listening */}
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=listening`);
                  }}
                  data-testid="select-listening-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Headphones className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Listening</h4>
                    <p className="text-xs text-gray-500">40 questions</p>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">40 min</Badge>
                  </div>
                </Card>

                {/* Reading */}
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=reading`);
                  }}
                  data-testid="select-reading-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Reading</h4>
                    <p className="text-xs text-gray-500">40 questions</p>
                    <Badge className="bg-green-100 text-green-700 text-xs">60 min</Badge>
                  </div>
                </Card>

                {/* Writing */}
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=writing`);
                  }}
                  data-testid="select-writing-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <PenTool className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Writing</h4>
                    <p className="text-xs text-gray-500">2 tasks</p>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">60 min</Badge>
                  </div>
                </Card>

                {/* Speaking */}
                <Card
                  className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-orange-300"
                  onClick={() => {
                    setShowCambridgeTestModal(false);
                    navigate(`/cambridge-test/${selectedCambridgeTest.book}/${selectedCambridgeTest.test}?skill=speaking`);
                  }}
                  data-testid="select-speaking-skill"
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Speaking</h4>
                    <p className="text-xs text-gray-500">3 parts</p>
                    <Badge className="bg-orange-100 text-orange-700 text-xs">14 min</Badge>
                  </div>
                </Card>
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                Tip: Skill practice mode lets you focus on one section at a time
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
