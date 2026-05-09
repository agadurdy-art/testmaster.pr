import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  PenTool,
  Mic,
  BookOpen,
  Headphones,
  ArrowRight,
  Award,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useGoBack } from '../hooks/useGoBack';

/**
 * SampleReportsHub — broader, dashboard-level "Sample Reports" gallery.
 *
 * The landing page already has a strip of 4 samples (SampleReportsStrip),
 * but logged-in users want to browse the full library by skill once they
 * are deciding what to work on. This is that surface.
 *
 * Cards link to the same per-sample detail pages used from the landing
 * (/samples/writing/..., /samples/speaking/..., HTML for reading/listening).
 * Adding a new sample means appending one entry to SAMPLES — there is no
 * other plumbing to update.
 *
 * Design notes:
 *   - Tabs by skill (Writing / Speaking / Reading / Listening) so users
 *     scan within a skill rather than across.
 *   - Each card surfaces band + topic + a short "what's inside" line, so
 *     it is obvious what the report demonstrates before the click.
 *   - All four-criteria breakdown previews live inside the detail pages;
 *     this gallery stays high-density and skim-friendly.
 */

const TABS = [
  { id: 'writing', label: 'Writing Task 2', icon: PenTool, accent: 'text-orange-600 border-orange-500' },
  { id: 'speaking', label: 'Speaking Part 2', icon: Mic, accent: 'text-violet-600 border-violet-500' },
  { id: 'reading', label: 'Reading', icon: BookOpen, accent: 'text-amber-700 border-amber-500' },
  { id: 'listening', label: 'Listening', icon: Headphones, accent: 'text-purple-700 border-purple-500' },
];

const SAMPLES = {
  writing: [
    {
      band: '5.0',
      tier: 'Working toward band 6',
      title: 'Technology in education',
      meta: 'Task 2 · 248 words · 23 fixes',
      criteria: 'Task Response 5 · Coherence 5 · Lexical 5 · Grammar 5',
      highlight:
        'Where most candidates plateau — limited paraphrasing, repetitive structures, surface-level examples.',
      href: '/score-my-essay',
    },
    {
      band: '6.5',
      tier: 'Target for most applicants',
      title: 'Living in cities vs countryside',
      meta: 'Task 2 · 281 words · 14 fixes',
      criteria: 'Task Response 6.5 · Coherence 7 · Lexical 6 · Grammar 6.5',
      highlight:
        'Solid argument structure but lexical resource ceilings the score — exactly where coaching matters.',
      href: '/score-my-essay',
    },
    {
      band: '8.0',
      tier: 'High-band benchmark',
      title: 'Environmental responsibility',
      meta: 'Task 2 · 312 words · 4 refinements',
      criteria: 'Task Response 8 · Coherence 8 · Lexical 8 · Grammar 8.5',
      highlight:
        'Confident position, controlled cohesion, precise collocations. Refinements, not corrections.',
      href: '/score-my-essay',
    },
  ],
  speaking: [
    {
      band: '6.5',
      tier: 'Mid-band conversational fluency',
      title: 'Describe a place you visited recently',
      meta: 'Part 2 · 1m 58s · pacing + connectors',
      criteria: 'Fluency 6.5 · Lexical 6 · Grammar 6.5 · Pronunciation 7',
      highlight:
        'Natural pacing and good cue-card coverage; vocabulary stays neutral — band-7 collocations would lift it.',
      href: '/score-my-speaking',
    },
    {
      band: '7.0',
      tier: 'Examiner-comfortable',
      title: 'A skill you would like to learn',
      meta: 'Part 2 · 2m 06s · varied lexis',
      criteria: 'Fluency 7 · Lexical 7 · Grammar 7 · Pronunciation 7',
      highlight:
        'Concrete sensory detail, mid-turn self-correction, idiomatic phrases — what a band-7 long turn sounds like.',
      href: '/score-my-speaking',
    },
  ],
  reading: [
    {
      band: '6.0',
      tier: 'Reading · Academic',
      title: '3 passages · 40 questions',
      meta: 'T/F/NG · Fill · Match · 24/40 correct',
      criteria: 'Question-by-question rationale, vocabulary highlights, time-on-passage breakdown',
      highlight:
        'Walks through which question types cost the most marks and why — diagnostic-style annotated answer key.',
      href: '/samples/reading/band-6-0-academic.html',
      external: true,
    },
  ],
  listening: [
    {
      band: '5.5',
      tier: 'Listening · Diagnostic',
      title: 'Section 1 + 2 walkthrough',
      meta: '4 sections · spelling / map / MCQ / completion',
      criteria: 'Per-section breakdown with timestamps and audioscript anchors',
      highlight:
        'Common Section-1 spelling traps and Section-2 distractor patterns — annotated transcript.',
      href: '/samples/listening/band-5-5-diagnostic.html',
      external: true,
    },
    {
      band: '5.5',
      tier: 'Listening · Practice',
      title: 'Mixed-skill listening sample',
      meta: '4 sections · 40 questions',
      criteria: 'Item-level review · accent + register notes',
      highlight:
        'Shows where Australian/Indian accent shifts cost marks and how to brace for them.',
      href: '/samples/listening/band-5-5-listening.html',
      external: true,
    },
    {
      band: '5.5',
      tier: 'Cambridge 17 · Test 4',
      title: 'Authentic Cambridge listening',
      meta: '40 questions · annotated review',
      criteria: 'Cambridge-aligned scoring, distractor analysis',
      highlight:
        'Anchor sample for what real Cambridge calibration looks like at band 5.5.',
      href: '/samples/listening/cambridge-17-test-4-band-5-5.html',
      external: true,
    },
  ],
};

export default function SampleReportsHub() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [activeTab, setActiveTab] = useState('writing');

  const handleOpen = (sample) => {
    if (sample.external) {
      window.open(sample.href, '_blank', 'noopener');
    } else {
      navigate(sample.href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/30 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={goBack} className="text-gray-600">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Sample reports
            </h1>
            <p className="text-xs text-gray-500">
              Real evaluations across all four skills — the same depth your own work gets.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = SAMPLES[tab.id]?.length || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? `bg-white shadow-sm border-current ${tab.accent}`
                    : 'bg-white/60 text-gray-600 border-transparent hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(SAMPLES[activeTab] || []).map((sample, i) => (
            <SampleCard key={`${activeTab}-${i}`} sample={sample} onOpen={() => handleOpen(sample)} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 leading-relaxed">
          <p className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>
              These are real student attempts evaluated against Cambridge band descriptors. When you
              submit your own work, you receive the same per-criterion breakdown, annotated fixes, and
              Liz&rsquo;s coaching notes.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SampleCard({ sample, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
            <Award className="w-6 h-6 text-violet-700" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 leading-none">{sample.band}</div>
            <div className="text-[11px] uppercase tracking-wide text-gray-500 mt-1">Band</div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 mt-2" />
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wide font-semibold text-violet-600 mb-1">
          {sample.tier}
        </div>
        <div className="font-bold text-gray-900 leading-tight">{sample.title}</div>
        <div className="text-xs text-gray-500 mt-1">{sample.meta}</div>
      </div>

      <p className="text-xs leading-relaxed text-gray-700">{sample.highlight}</p>

      <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-500 leading-relaxed">
        {sample.criteria}
      </div>
    </button>
  );
}
