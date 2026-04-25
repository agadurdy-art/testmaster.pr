/**
 * Vocabulary Browse — navigation layer into the 20 Advanced IELTS Mastery themes.
 *
 * This page does NOT introduce new vocabulary content. Each theme links into the
 * existing Advanced Mastery lesson with ?lesson=N&focus=vocabulary so the
 * AdvancedMasteryCourse page auto-scrolls to the vocabulary activity.
 *
 * Theme metadata mirrors backend/seed_advanced_mastery_complete.py. If a theme is
 * renamed server-side, update the list here too (no live fetch — this is a static
 * navigation map).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoBack } from '../hooks/useGoBack';
import { ArrowLeft, BookOpen, Sparkles, ChevronRight } from 'lucide-react';

const THEMES = [
  { n: 1,  title: 'The Digital Frontier',                                  subtitle: 'Technology & Ethics' },
  { n: 2,  title: 'The Green Imperative',                                  subtitle: 'Environment & Urbanization' },
  { n: 3,  title: 'The Educational Paradigm',                              subtitle: 'Education & The Future' },
  { n: 4,  title: 'Globalisation and Cultural Identity',                   subtitle: 'Cultural Convergence vs. Preservation' },
  { n: 5,  title: 'Health and Public Policy',                              subtitle: 'Ethics & Responsibility' },
  { n: 6,  title: 'Crime, Justice, and the Penal System',                  subtitle: 'From Punitive Measures to Rehabilitation' },
  { n: 7,  title: 'Media and Information Integrity',                       subtitle: 'Navigating the Post-Truth Era' },
  { n: 8,  title: 'Government, Economy, and Wealth Disparity',             subtitle: 'Navigating the Global Wealth Gap' },
  { n: 9,  title: 'Urbanisation and Modern Society',                       subtitle: 'The Complexities of the Modern Megalopolis' },
  { n: 10, title: 'Science and Biomedical Ethics',                         subtitle: 'Balancing Innovation with Ethical Responsibility' },
  { n: 11, title: 'Public Transport and Sustainable Infrastructure',       subtitle: 'Mobility, Sustainability, and Public Transit' },
  { n: 12, title: 'Work, Employment, and the Evolving Labor Market',       subtitle: 'Precarious Employment, Automation, and the Gig Economy' },
  { n: 13, title: 'Social Issues: Demographics and Generational Equity',   subtitle: 'Socio-Economic Implications of an Aging Population' },
  { n: 14, title: 'Education and Pedagogical Philosophy',                  subtitle: 'From Rote Memorisation to Competency-Based Pedagogy' },
  { n: 15, title: 'Globalisation, Cultural Identity, and Homogenisation',  subtitle: 'Cultural Convergence versus Preservation of Heritage' },
  { n: 16, title: 'Ecological Integrity and Sustainable Mitigation',       subtitle: 'Environmental Stewardship in the Anthropocene' },
  { n: 17, title: 'Crime, Justice, and Social Reintegration',              subtitle: 'Addressing the Roots of Recidivism' },
  { n: 18, title: 'Public Health and Medical Resource Allocation',         subtitle: 'The Wellness Gap: Health Equity & State Responsibility' },
  { n: 19, title: 'The Media Landscape',                                   subtitle: 'Journalism, Social Media, and the Public Interest' },
  { n: 20, title: 'Tourism, Cultural Heritage, and Global Mobility',       subtitle: 'Tourism and Global Mobility: Preservation vs. Profit' },
];

export default function VocabularyBrowse() {
  const navigate = useNavigate();
  const goBack = useGoBack();

  const openTheme = (n) => {
    navigate(`/advanced-mastery?lesson=${n}&focus=vocabulary`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur border-b border-amber-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
          <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold">
            <BookOpen className="w-4 h-4" /> IELTS Vocabulary
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-amber-600 mt-1" />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            IELTS Vocabulary — by Theme
          </h1>
        </div>
        <p className="text-gray-700 max-w-3xl">
          Twenty IELTS-critical themes, each with a curated set of Band 8-level terms,
          collocations, idioms, and usage notes. Pick a theme to jump straight to its
          vocabulary activity inside the Advanced Mastery course.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Vocabulary lives inside Advanced Mastery — this page is your shortcut to it.
        </p>
      </div>

      {/* Theme grid */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {THEMES.map((t) => (
            <button
              key={t.n}
              onClick={() => openTheme(t.n)}
              className="group text-left bg-white border border-amber-100 hover:border-amber-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Theme {String(t.n).padStart(2, '0')}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
              </div>
              <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
                {t.title}
              </h3>
              <p className="text-sm text-gray-600 leading-snug">
                {t.subtitle}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-10 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <strong>Tip:</strong> Each theme takes you directly to the vocabulary activity.
          From there you can continue into grammar, reading, speaking, and writing for the
          same theme without leaving the lesson.
        </div>
      </div>
    </div>
  );
}
