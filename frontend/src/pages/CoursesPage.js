import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { GraduationCap, Trophy, Zap, ArrowLeft, ArrowRight } from 'lucide-react';

// The three curated IELTS Ace courses. The backend still exposes strategy-like
// modules on /api/courses, but the product-level "Courses" offering is just
// these three, each with its own dedicated page (Beginner / Mastery / Advanced).
// Linking out to those routes keeps the hub page honest and stops the old API
// response from leaking strategy content into the courses view.
const COURSES = [
  {
    id: 'beginner',
    title: 'Beginner Course',
    tagline: 'Band 4 → 6',
    blurb:
      'Foundational IELTS skills. Task types, scoring rubrics, time management, and the baseline vocabulary you need before any serious test prep.',
    href: '/beginner-course',
    Icon: GraduationCap,
    tint: 'emerald',
  },
  {
    id: 'mastery',
    title: 'Mastery Course',
    tagline: 'Band 6 → 7.5',
    blurb:
      'Deliberate practice on the four skills with Liz’s feedback loop. Essay structure, speaking fluency, reading stamina, and listening precision.',
    href: '/mastery-course',
    Icon: Trophy,
    tint: 'amber',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    tagline: 'Band 7.5 → 9',
    blurb:
      'High-band work: complex syntax, lexical range, cohesion, paraphrase control, and the nuanced reasoning the examiners reward at the top.',
    href: '/advanced-mastery',
    Icon: Zap,
    tint: 'violet',
  },
];

const TINT_STYLES = {
  emerald: {
    iconBg: 'bg-gradient-to-br from-emerald-400/90 to-emerald-600',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    ring: 'hover:ring-emerald-200',
  },
  amber: {
    iconBg: 'bg-gradient-to-br from-amber-400 to-amber-600',
    chip: 'bg-amber-50 text-amber-800 border-amber-100',
    ring: 'hover:ring-amber-200',
  },
  violet: {
    iconBg: 'bg-gradient-to-br from-violet-400 to-violet-600',
    chip: 'bg-violet-50 text-violet-700 border-violet-100',
    ring: 'hover:ring-violet-200',
  },
};

export default function CoursesPage({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-emerald-50/30">
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(16,185,129,0.55)]">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">IELTS Ace</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <span className="inline-block text-[11px] tracking-[0.22em] font-semibold uppercase text-slate-500">
            Courses
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mt-2">Three courses. One clear path.</h2>
          <p className="text-lg text-slate-600 mt-3 max-w-2xl mx-auto">
            Start where you are. Move to the next course when Liz says you&rsquo;re ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {COURSES.map(({ id, title, tagline, blurb, href, Icon, tint }) => {
            const styles = TINT_STYLES[tint];
            return (
              <Card
                key={id}
                className={`p-6 rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-sm shadow-[0_14px_32px_-18px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-18px_rgba(15,23,42,0.18)] ring-1 ring-transparent ${styles.ring}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center shadow-inner`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles.chip}`}>
                    {tagline}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-600 text-[14.5px] leading-relaxed mb-6">{blurb}</p>

                <Button
                  onClick={() => navigate(href)}
                  className="w-full primary-gradient text-white"
                >
                  Open course
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
