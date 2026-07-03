import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Search, AlertTriangle, TrendingUp, GraduationCap, Map as MapIcon, Eye,
  Award, BookOpen, Zap, Play,
  ArrowRight, List as ListIcon, Info,
} from 'lucide-react';
import {
  SKILL_LABELS, categorizeSkill, bandTier, resolvePassageNumber,
  computePassageStats, computeSkillCounts, priorityFromCounts, fastestGainEstimate,
} from './reading/lib';
import {
  BandDial, LizShimmerAvatar, PassageStatCard, TargetCard, InsightTile,
  TimeManagementCard, PriorityFixCard, QuickActionsCard,
} from './reading/components/cards';
import { Modal } from './reading/components/Modal';
import { LizDetailedAnalysis } from './reading/components/LizDetailedAnalysis';
import { QuestionList } from './reading/components/QuestionList';

// =============================================================================
// MAIN LAYOUT
// =============================================================================

const TILE_GRADIENTS = {
  rootCause:    'bg-gradient-to-br from-rose-500 to-pink-600',
  whyLost:      'bg-gradient-to-br from-orange-500 to-red-500',
  fastestGain:  'bg-gradient-to-br from-emerald-500 to-teal-600',
  lessons:      'bg-gradient-to-br from-indigo-500 to-purple-600',
  roadmap:      'bg-gradient-to-br from-violet-500 to-purple-600',
  modelAnswers: 'bg-gradient-to-br from-teal-500 to-cyan-600',
};

export default function ReadingResultsLayout({
  feedback,
  band,
  user,
  testMeta = {},
  insights = {},
  onBack,
  backHref = '/',
  onRetry,
  onPracticePriority,
  standalone = false,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [questionFilter, setQuestionFilter] = useState('all');
  const closeModal = () => setActiveModal(null);

  const questionResults = Array.isArray(feedback?.question_results) ? feedback.question_results : [];
  const correct = feedback?.correct ?? questionResults.filter((q) => q.is_correct).length;
  const total = feedback?.total ?? questionResults.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const passages = Array.isArray(feedback?.passages) ? feedback.passages : [];

  // Filter feeds the drilldown — wrap question_results in a derived feedback
  // so the existing component keeps working unchanged.
  const filteredResults = useMemo(() => {
    if (!questionFilter || questionFilter === 'all') return questionResults;
    return questionResults.filter((q) => {
      if (questionFilter === 'correct') return q.is_correct;
      if (questionFilter === 'incorrect') return !q.is_correct;
      if (questionFilter.startsWith('p')) {
        const n = Number(questionFilter.slice(1));
        const pNum = resolvePassageNumber(q, passages, questionResults.length);
        return pNum === n;
      }
      return categorizeSkill(q.question_type) === questionFilter;
    });
  }, [questionResults, questionFilter, passages]);

  const handleDownload = () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  };
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: 'IELTS Result', url }); return; } catch (_) {}
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try { await navigator.clipboard.writeText(url); } catch (_) {}
    }
  };

  const passageStats = useMemo(() => computePassageStats(questionResults, passages), [questionResults, passages]);
  const skillCounts = useMemo(() => computeSkillCounts(questionResults), [questionResults]);
  const priority = useMemo(() => priorityFromCounts(skillCounts), [skillCounts]);
  // Backend's `fastest_gain` is an array of skill rows
  // (`{label, skill_id, wrong_count, total, ...}`); the legacy estimate shape
  // is `{skillName, projectedBand, recoverable, newCorrect, totalQuestions}`.
  // Modal body unconditionally calls `.projectedBand.toFixed(1)`, so we must
  // ALWAYS resolve to the legacy shape (or null) — never leave the array
  // here, otherwise the page crashes during parent render even with the
  // modal closed.
  const fastestGain = useMemo(() => {
    const raw = insights.fastestGain;
    if (Array.isArray(raw) && raw.length > 0) {
      const top = raw[0];
      const wrong = Number(top?.wrong_count ?? top?.potential_gain ?? 0) || 0;
      const recoverable = Math.max(1, Math.round(wrong * 0.7));
      const correctNow = questionResults.filter((q) => q.is_correct).length;
      const lift = Math.min(2, Math.max(0.5, recoverable * 0.1));
      const projected = Math.min(9, Math.max(4, (Number(band) || 6) + lift));
      return {
        skillName: top?.label || top?.skill_id || 'this skill',
        recoverable,
        projectedBand: Math.round(projected * 2) / 2,
        newCorrect: correctNow + recoverable,
        totalQuestions: questionResults.length,
      };
    }
    if (raw && typeof raw === 'object' && raw.projectedBand != null) {
      return raw;
    }
    return fastestGainEstimate(questionResults, skillCounts, band);
  }, [insights.fastestGain, questionResults, skillCounts, band]);

  const displayName = user?.firstName || user?.first_name || user?.name || 'Student';
  const tier = bandTier(band);

  const wrongQuestions = useMemo(() => questionResults.filter((q) => !q.is_correct), [questionResults]);

  const reasonSummary = insights.reasonSummary || null;
  const recommendedLessons = insights.recommendedLessons || null;
  const rootCauseAnalysis = insights.rootCauseAnalysis || null;
  const teacherShort = feedback?.teacher_feedback?.short || insights.teacherShort || null;
  const teacherDetailed = feedback?.teacher_feedback?.detailed || insights.teacherDetailed || null;

  // ---------------------------------------------------------------------------
  const headerRow = (onBack || backHref || testMeta.title) ? (
    <div className="flex items-center justify-between flex-wrap gap-3">
      {(onBack || backHref) && (
        onBack ? (
          <button onClick={onBack} className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-medium">Back</span>
          </button>
        ) : (
          <a href={backHref} className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors group">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="font-medium">Back</span>
          </a>
        )
      )}
      {testMeta.title && (
        <div className="text-right">
          <h1 className="text-xl font-bold text-gray-900">Reading Analysis</h1>
          <p className="text-sm text-gray-500">{testMeta.title}{testMeta.subtitle ? ` • ${testMeta.subtitle}` : ''}</p>
        </div>
      )}
    </div>
  ) : null;

  const Wrapper = ({ children }) => standalone ? (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/20">
      {headerRow ? (
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">{headerRow}</div>
        </header>
      ) : null}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  ) : (
    <div className="space-y-6">
      {headerRow}
      {children}
    </div>
  );

  return (
    <Wrapper>

      {/* Greeting + Liz card */}
      <div className="rounded-3xl bg-white border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-sky-50 border border-emerald-100/60">
            <BandDial band={band} size={120} />
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 via-sky-700 to-violet-700 bg-clip-text text-transparent">
                {displayName}
              </h2>
              <div className="flex items-center gap-2 mt-1 mb-1">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Award className="w-3 h-3" />
                  Band {Number(band || 0).toFixed(1)} · {tier}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('bandBreakdown')}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 mt-0.5"
              >
                <Info className="w-3.5 h-3.5" />
                Band breakdown
              </button>
              <div className="text-sm text-gray-700">
                {correct}/{total} Correct ({pct}%)
              </div>
              {testMeta.durationMin != null && (
                <div className="text-xs text-amber-700 mt-0.5">
                  {testMeta.durationMin} minutes
                  {testMeta.allowedMin ? ` • ${testMeta.durationMin > testMeta.allowedMin ? `+${testMeta.durationMin - testMeta.allowedMin} over` : `${testMeta.allowedMin - testMeta.durationMin} min under time`}` : ''}
                </div>
              )}
            </div>
          </div>
          {teacherShort ? (
            <div className="flex items-center gap-4">
              <LizShimmerAvatar size={72} />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Liz · AI Tutor</h3>
                <p className="text-sm text-gray-700 italic mt-1">"{teacherShort}"</p>
                {teacherDetailed && (
                  <button
                    type="button"
                    onClick={() => setActiveModal('teacher')}
                    className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold shadow-sm hover:from-violet-700 hover:to-purple-700 transition-all"
                  >
                    View full analysis <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Passage cards row */}
      {passageStats.length > 0 && (
        <div className={`grid gap-4 ${passageStats.length >= 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {passageStats.map((s, i) => (
            <PassageStatCard key={s.n} stats={s} color={['emerald', 'amber', 'rose'][i % 3]} />
          ))}
          {passageStats.length >= 3 && <TargetCard targetBand={testMeta.targetBand || 7.0} />}
        </div>
      )}

      {/* Performance Insights section — 6 tiles (3-col) + Time Management sidebar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" /> Performance Insights
          </h3>
          <span className="text-xs text-gray-500">Click any card for detailed analysis</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InsightTile
                icon={Search}
                title="Root Cause Analysis"
                subtitle={rootCauseAnalysis?.length ? `${rootCauseAnalysis.length} patterns flagged` : 'Find your blind spots'}
                gradient={TILE_GRADIENTS.rootCause}
                statusTone={rootCauseAnalysis?.length >= 3 ? 'urgent' : rootCauseAnalysis?.length ? 'warn' : 'neutral'}
                onClick={() => setActiveModal('rootCause')}
              />
              <InsightTile
                icon={AlertTriangle}
                title="Why You Lost Marks"
                subtitle={`${wrongQuestions.length} mistakes — tap to retry`}
                gradient={TILE_GRADIENTS.whyLost}
                statusTone={wrongQuestions.length >= 10 ? 'urgent' : wrongQuestions.length ? 'warn' : 'ok'}
                onClick={() => setActiveModal('whyLost')}
              />
              <InsightTile
                icon={TrendingUp}
                title="Fastest Score Gain"
                subtitle={fastestGain ? `${fastestGain.skillName} mastery → +${(fastestGain.projectedBand - (Number(band) || 0)).toFixed(1)} band` : 'Path to higher band'}
                gradient={TILE_GRADIENTS.fastestGain}
                statusTone={fastestGain ? 'warn' : 'ok'}
                onClick={() => setActiveModal('fastestGain')}
              />
              <InsightTile
                icon={GraduationCap}
                title="Recommended Lessons"
                subtitle={recommendedLessons?.length ? `${recommendedLessons.length} lessons for weak areas` : 'Tailored to your gaps'}
                gradient={TILE_GRADIENTS.lessons}
                statusTone={recommendedLessons?.length ? 'warn' : 'neutral'}
                onClick={() => setActiveModal('lessons')}
              />
              <InsightTile
                icon={MapIcon}
                title="Study Roadmap"
                subtitle="3-week improvement plan"
                gradient={TILE_GRADIENTS.roadmap}
                statusTone="neutral"
                onClick={() => setActiveModal('roadmap')}
              />
              <InsightTile
                icon={Eye}
                title="Model Answers"
                subtitle="Compare your responses"
                gradient={TILE_GRADIENTS.modelAnswers}
                statusTone={wrongQuestions.length ? 'warn' : 'ok'}
                onClick={() => setActiveModal('modelAnswers')}
              />
            </div>
          </div>
          <div className="lg:col-span-1">
            <TimeManagementCard
              durationMin={testMeta.durationMin || 0}
              allowedMin={testMeta.allowedMin || 60}
              perSection={testMeta.perSection}
            />
          </div>
        </div>
      </div>

      {/* Question Analysis row — sidebar + drilldown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <PriorityFixCard priority={priority} onOpen={() => setActiveModal('priorityFix')} />
          <QuickActionsCard
            onRetry={onRetry}
            onPracticePriority={onPracticePriority ? () => onPracticePriority(priority) : null}
            priorityName={priority?.name}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-white border border-gray-200 p-5 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ListIcon className="w-5 h-5 text-emerald-600" />
                Question Analysis
                <span className="text-sm font-normal text-gray-500">
                  ({filteredResults.length} of {total})
                </span>
              </h3>
              <div className="flex items-center gap-3">
                <select
                  value={questionFilter}
                  onChange={(e) => setQuestionFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="all">All Questions</option>
                  <option value="correct">Correct Only</option>
                  <option value="incorrect">Incorrect Only</option>
                  <option value="tfng">T/F/NG + Y/N/NG</option>
                  <option value="mc">Multiple Choice</option>
                  <option value="fill">Fill in the Blanks</option>
                  <option value="match">Matching</option>
                  <option value="heading">Headings</option>
                  {passageStats.map((s) => (
                    <option key={s.n} value={`p${s.n}`}>Passage {s.n}</option>
                  ))}
                </select>
                {passages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveModal('passages')}
                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Show Passages
                  </button>
                )}
              </div>
            </div>
          </div>
          <QuestionList
            items={filteredResults}
            passages={passages}
            totalCount={total}
            autoOpenFirst
          />
        </div>
      </div>

      {/* ====================== MODALS ====================== */}

      <Modal open={activeModal === 'teacher'} onClose={closeModal} title={null}>
        <LizDetailedAnalysis
          teacherShort={teacherShort}
          teacherDetailed={teacherDetailed}
          skillCounts={skillCounts}
          priority={priority}
          targetBand={Number(testMeta?.targetBand) || 7}
          durationMin={Number(testMeta?.durationMin) || null}
          allowedMin={Number(testMeta?.allowedMin) || 60}
        />
      </Modal>

      <Modal open={activeModal === 'rootCause'} onClose={closeModal} title="Root Cause Analysis">
        {rootCauseAnalysis && rootCauseAnalysis.length ? (
          <div className="space-y-4">
            {rootCauseAnalysis.map((p, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-rose-200 bg-rose-50">
                <h4 className="font-bold text-rose-900 mb-1">{p.title || p.label}</h4>
                <p className="text-sm text-rose-800 mb-2">{p.description || p.detail}</p>
                {p.fix && <p className="text-xs text-rose-700"><strong>Rule of thumb:</strong> {p.fix}</p>}
              </div>
            ))}
          </div>
        ) : reasonSummary && Object.keys(reasonSummary).length ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">Mistake patterns detected across your wrong answers:</p>
            {Object.entries(reasonSummary).map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between p-3 rounded-xl border border-rose-200 bg-rose-50">
                <span className="text-sm font-medium text-rose-900">{String(reason).replace(/_/g, ' ').toLowerCase()}</span>
                <span className="text-sm font-bold text-rose-700">{count}× </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">No recurring patterns detected. Your mistakes are spread across different question types — keep practicing for consistency.</p>
        )}
      </Modal>

      <Modal open={activeModal === 'whyLost'} onClose={closeModal} title="Why You Lost Marks">
        <p className="text-gray-600 mb-4 text-sm">Breakdown of your {wrongQuestions.length} incorrect answers by skill type.</p>
        <div className="space-y-2">
          {Object.entries(skillCounts).filter(([, c]) => c.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong).map(([k, c]) => {
            const Icon = SKILL_LABELS[k]?.icon || BookOpen;
            return (
              <div key={k} className="p-3 rounded-xl border border-red-200 bg-red-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-red-900">{SKILL_LABELS[k]?.name || k}</span>
                </div>
                <span className="text-sm font-bold text-red-700">{c.wrong} wrong / {c.total} total</span>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal open={activeModal === 'fastestGain'} onClose={closeModal} title="Fastest Score Gain">
        {fastestGain ? (
          <div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 mb-4">
              <h4 className="font-bold text-emerald-900 mb-2">Master {fastestGain.skillName}</h4>
              <p className="text-sm text-emerald-800">
                Recovering ~{fastestGain.recoverable} of your wrong answers in this skill could lift your band to{' '}
                <strong>Band {fastestGain.projectedBand.toFixed(1)}</strong>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{correct}/{total}</div>
                <div className="text-xs text-gray-500">Now</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-2xl font-bold text-emerald-900">{fastestGain.newCorrect}/{fastestGain.totalQuestions}</div>
                <div className="text-xs text-emerald-700">Projected</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">All skills are balanced — no single quick win identified.</p>
        )}
      </Modal>

      <Modal open={activeModal === 'lessons'} onClose={closeModal} title="Recommended Lessons">
        {recommendedLessons && recommendedLessons.length ? (
          <div className="space-y-3">
            {recommendedLessons.map((l, i) => (
              <div key={i} className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-200 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-indigo-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-indigo-900">{l.title}</h4>
                    {l.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        l.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                        l.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{l.priority}</span>
                    )}
                  </div>
                  <p className="text-sm text-indigo-800 mt-1">{l.reason}</p>
                  {l.course_name && <p className="text-xs text-indigo-600 mt-1">From: {l.course_name}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : priority ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50">
              <h4 className="font-bold text-indigo-900 mb-1">{priority.name} Strategy</h4>
              <p className="text-sm text-indigo-800">Your weakest skill — start here for the fastest impact.</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No specific lessons recommended — try the next harder test.</p>
        )}
      </Modal>

      <Modal open={activeModal === 'roadmap'} onClose={closeModal} title="3-Week Study Roadmap">
        <div className="space-y-4">
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 1 — Diagnose & drill</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>Master the {priority?.name || 'weakest'} strategy</li>
              <li>3 short timed sets per day (15 min each)</li>
              <li>Review every wrong answer with the explanation</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 2 — Volume & speed</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>1 full passage per day under timed conditions</li>
              <li>Build vocabulary list from passages</li>
              <li>Practice paraphrase recognition daily</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border-2 border-violet-200 bg-violet-50">
            <h4 className="font-bold text-violet-900">Week 3 — Full tests</h4>
            <ul className="text-sm text-violet-800 mt-2 list-disc pl-5 space-y-1">
              <li>2 full mock tests with strict timing</li>
              <li>Target band: {((Number(band) || 0) + 0.5).toFixed(1)}+</li>
              <li>Review only wrong + low-confidence questions</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal open={activeModal === 'modelAnswers'} onClose={closeModal} title={`Model Answers — Your ${wrongQuestions.length} Mistakes`}>
        {wrongQuestions.length ? (
          <div className="space-y-3">
            {wrongQuestions.map((q, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {q.question_number || q.question_id || i + 1}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{q.question_type}</span>
                    {q.passage != null && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">P{q.passage}</span>
                    )}
                  </div>
                </div>
                {q.question_text && <div className="text-sm text-gray-700 mb-2">{q.question_text}</div>}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-red-50 rounded border border-red-100"><span className="text-red-700">Your: {String(q.user_answer ?? '—')}</span></div>
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-100"><span className="text-emerald-700">Correct: {String(q.correct_answer ?? '—')}</span></div>
                </div>
                {q.explanation && (
                  <p className="text-xs text-gray-600 mt-2 italic">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-emerald-700">No mistakes — perfect score!</p>
        )}
      </Modal>

      <Modal open={activeModal === 'bandBreakdown'} onClose={closeModal} title="Band Score Breakdown" maxWidth="max-w-md">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Your Score:</span>
            <span className="font-bold text-lg text-emerald-700">{Number(band || 0).toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Questions Correct:</span>
            <span className="font-medium">{correct}/{total} ({pct}%)</span>
          </div>
          {testMeta?.targetBand && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Target Band:</span>
              <span className="font-medium text-sky-700">{Number(testMeta.targetBand).toFixed(1)}</span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="text-xs text-gray-500 mb-2">Band {Number(band || 0).toFixed(1)} ({tier}):</div>
            <p className="text-sm text-gray-700">
              {(() => {
                const b = Number(band) || 0;
                if (b >= 8) return '"Very good command of English with only occasional unsystematic inaccuracies."';
                if (b >= 7) return '"Operational command of English. Generally accurate and detailed comprehension."';
                if (b >= 6) return '"Generally effective command of the language despite some inaccuracies, inappropriacies and misunderstandings."';
                if (b >= 5) return '"Modest command — partial comprehension with frequent inaccuracies."';
                return '"Limited command — basic comprehension only."';
              })()}
            </p>
          </div>
        </div>
      </Modal>

      <Modal open={activeModal === 'passages'} onClose={closeModal} title="Reading Passages" maxWidth="max-w-4xl">
        {passages.length ? (
          <div className="space-y-6">
            {passages.map((p, i) => (
              <div key={p.id ?? i} className="rounded-xl border border-gray-200 bg-white">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <h4 className="font-semibold text-gray-900">{p.title || `Passage ${i + 1}`}</h4>
                </div>
                <div className="px-4 py-3 text-sm text-gray-700 whitespace-pre-line leading-relaxed max-h-[420px] overflow-y-auto">
                  {p.text || '(No passage text available.)'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Passage text isn't available for this attempt.</p>
        )}
      </Modal>

      <Modal open={activeModal === 'priorityFix'} onClose={closeModal} title={`Master ${priority?.name || 'Strategy'}`}>
        {priority && (
          <div>
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-200 mb-5">
              <p className="text-sm text-rose-900">
                <strong>Your weak spot:</strong> {priority.wrong} of {priority.total} questions wrong on {priority.name}.
              </p>
            </div>
            <h4 className="font-bold text-gray-900 mb-3">Strategy tips</h4>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-2 mb-6">
              {priority.key === 'tfng' && (
                <>
                  <li><strong>TRUE</strong>: passage confirms the statement (often paraphrased)</li>
                  <li><strong>FALSE</strong>: passage contradicts the statement directly</li>
                  <li><strong>NOT GIVEN</strong>: passage doesn't address the claim — don't infer</li>
                </>
              )}
              {priority.key === 'fill' && (
                <>
                  <li>Fill-ins almost always require the <strong>exact word</strong> from the passage</li>
                  <li>Never paraphrase — synonyms count as wrong</li>
                  <li>Watch the word limit (usually NO MORE THAN TWO/THREE WORDS)</li>
                </>
              )}
              {priority.key === 'mc' && (
                <>
                  <li>Eliminate clearly wrong distractors first</li>
                  <li>Watch for absolute words (always, never, only) in distractors</li>
                  <li>The correct answer paraphrases the passage — wrong ones often quote it directly</li>
                </>
              )}
              {priority.key === 'match' && (
                <>
                  <li>Scan for keywords first, then verify by reading around the keyword</li>
                  <li>Some options can be used twice — others not at all</li>
                </>
              )}
              {priority.key === 'heading' && (
                <>
                  <li>Headings summarize the <strong>main idea</strong>, not a single detail</li>
                  <li>Skim the first and last sentence of each paragraph</li>
                </>
              )}
            </ul>
            {onPracticePriority && (
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Ready to practice?</h4>
                  <p className="text-sm text-gray-600">Targeted drill on this skill type.</p>
                </div>
                <button onClick={() => { closeModal(); onPracticePriority(priority); }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Play className="w-4 h-4" /> Practice Now
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Wrapper>
  );
}
