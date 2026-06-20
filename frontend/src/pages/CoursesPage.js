import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AppShellNav from '../components/appshell/AppShellNav';
import { getCourseProgress } from '../lib/progressTracker';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * /courses — D11 handoff port (polish pass).
 *
 * Adds: SceneBar (Liz pick / Browse all / Level quiz), per-card stats +
 * topic tags + progress bar (Mastery), dual CTA (See syllabus + state-aware
 * primary), "Not sure" strip in Browse mode, and Level Quiz route wiring.
 *
 * Liz pick is default. Browse hides Liz banner + Mastery ribbon and shows
 * the dashed "Not sure" strip. Level quiz navigates to the existing
 * /comprehensive-level-test route (registered in App.js around line 491).
 *
 * Course content (lessons, min/day, target band, topic chips) is hardcoded
 * here for now — there is no backend course-meta endpoint yet, and these
 * are the canonical numbers Aga uses in marketing copy. Mastery progress
 * is a placeholder 22% pending real `user.course_progress.mastery.percent`.
 */

// ──────────────────────────────────────────────────────────────────────────
// Visual tokens (lifted from D11 handoff). Kept in-file so the build doesn't
// need a new CSS module; matches FullTestFlow's inline-style approach.
// ──────────────────────────────────────────────────────────────────────────
const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  sky: '199 89% 60%',
  gold: '43 96% 56%',
  ink: '220 25% 12%',
  muted: '220 10% 45%',
  fainter: '220 10% 65%',
  bg: '210 20% 98%',
  surface: '0 0% 100%',
  border: '220 15% 90%',
  borderSoft: '220 15% 94%',
};

const SHADOW_SM = '0 1px 2px hsl(220 15% 20% / 0.04), 0 1px 3px hsl(220 15% 20% / 0.06)';
const SHADOW = '0 4px 16px hsl(220 15% 20% / 0.08)';

// The three product courses. Routes + band ranges + blurbs are stable
// IELTS Ace product data. lessons / topics / progress are loaded live from
// the backend lesson endpoints + progressTracker localStorage and merged
// in at render time (see CoursesPage).
const COURSES = [
  {
    id: 'beginner',
    kicker: 'Beginner',
    title: 'Foundations',
    bandRange: 'Band 4 → 6',
    blurb:
      'Foundational IELTS skills. Task types, scoring rubrics, time management, and the baseline vocabulary you need before any serious test prep.',
    href: '/beginner-course',
    cover: 'sky',
    target: 'Band 5.0 target',
    apiEndpoint: '/api/beginner-english/lessons',
  },
  {
    id: 'mastery',
    kicker: 'Mastery',
    title: 'Push to Band 7',
    bandRange: 'Band 6 → 7.5',
    blurb:
      "Deliberate practice on the four skills with Liz's feedback loop. Essay structure, speaking fluency, reading stamina, and listening precision.",
    href: '/mastery-course',
    cover: 'brand',
    target: 'Band 6.5–7.0 target',
    apiEndpoint: '/api/mastery-course/modules',
    recommended: true,
  },
  {
    id: 'advanced',
    kicker: 'Advanced',
    title: 'Band 7.5+ strategy',
    bandRange: 'Band 7.5 → 9',
    blurb:
      'High-band work: complex syntax, lexical range, cohesion, paraphrase control, and the nuanced reasoning the examiners reward at the top.',
    href: '/advanced-mastery',
    cover: 'gold',
    target: 'Band 7.5+ target',
    apiEndpoint: '/api/advanced-mastery/modules',
  },
];

// Pull a few topic-ish keywords from a course's lesson list. Looks at common
// title fields, dedupes, lowercases, and caps at 5. Falls back to an empty
// array if the API shape is unexpected.
function deriveTopicTags(items) {
  if (!Array.isArray(items)) return [];
  const out = [];
  const seen = new Set();
  for (const it of items) {
    const raw = it?.topic || it?.theme || it?.title || it?.name || it?.module_title || '';
    if (!raw || typeof raw !== 'string') continue;
    // Strip leading "Lesson N: " / "Module N — " prefixes
    const cleaned = raw.replace(/^(lesson|module|unit)\s*\d+\s*[:\-–—.]\s*/i, '').trim();
    if (!cleaned) continue;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    // Truncate to keep chips compact
    const short = cleaned.length > 28 ? cleaned.slice(0, 26).trim() + '…' : cleaned;
    out.push(short);
    if (out.length >= 5) break;
  }
  return out;
}

// Cover gradient per cover key. Pulled from D11 handoff's cover-{level} rules.
const COVER_GRADIENT = {
  sky: `linear-gradient(135deg, hsl(${T.sky}) 0%, hsl(199 90% 45%) 100%)`,
  brand: `linear-gradient(135deg, hsl(${T.brand}) 0%, hsl(${T.brandDark}) 100%)`,
  gold: `linear-gradient(135deg, hsl(${T.gold}) 0%, hsl(35 90% 45%) 100%)`,
};

// Learning tools — only routes that already exist in App.js. Pronunciation
// drills from the handoff has no dedicated route, so it's swapped for
// Speaking topics which is the closest live surface.
const TOOLS = [
  { code: 'Vo', title: 'Vocabulary trainer', desc: 'IELTS-tier word lists.', href: '/vocabulary' },
  { code: 'Gr', title: 'Grammar reference', desc: 'The structures examiners reward.', href: '/grammar' },
  { code: 'Sp', title: 'Speaking topics', desc: 'Part 2 cue cards with Liz feedback.', href: '/question-bank/speaking' },
  { code: 'St', title: 'Strategies', desc: 'Tips per skill from Liz.', href: '/tips' },
];

export default function CoursesPage({ user, onLogout }) {
  const navigate = useNavigate();
  // 'liz' (default) | 'browse' | 'quiz'. Quiz routes to /comprehensive-level-test
  // (registered in App.js); we don't render an inline modal because that route
  // already exists and is the canonical level-test surface.
  const [scene, setScene] = useState('liz');
  // Live course payloads, keyed by course id. items = full lessons array from
  // the API. Used to derive lesson count and topic chips. progress comes from
  // progressTracker (localStorage).
  const [courseData, setCourseData] = useState({
    beginner: { items: null },
    mastery: { items: null },
    advanced: { items: null },
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      COURSES.map((c) =>
        fetch(`${API_URL}${c.apiEndpoint}`)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => [])
      )
    ).then((results) => {
      if (cancelled) return;
      const next = {};
      COURSES.forEach((c, i) => {
        const payload = results[i];
        // Endpoints return either a bare array or { lessons: [...] } / { modules: [...] }
        const items = Array.isArray(payload)
          ? payload
          : (payload?.lessons || payload?.modules || payload?.items || []);
        next[c.id] = { items };
      });
      setCourseData(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleScene = (next) => {
    if (next === 'quiz') {
      // Route exists in App.js (verified). Leaves CoursesPage entirely.
      navigate('/comprehensive-level-test');
      return;
    }
    setScene(next);
  };

  const showLizReco = scene === 'liz';
  const showNotSure = scene === 'browse';

  // Build per-card view models from the live data + localStorage progress.
  const viewCourses = COURSES.map((c) => {
    const items = courseData[c.id]?.items || [];
    const lessons = items.length;
    const topics = deriveTopicTags(items);
    const prog = lessons > 0 ? getCourseProgress(c.id, lessons) : { completed: 0, total: 0, percentage: 0 };
    const progress = prog.completed > 0 ? prog.percentage : null;
    const primaryCta = progress != null
      ? 'Continue'
      : (c.id === 'advanced' ? 'Preview' : 'Start course');
    return {
      ...c,
      lessons,
      topics,
      progress,
      completed: prog.completed,
      primaryCta,
    };
  });

  return (
    <div
      className="appshell-page"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        color: `hsl(${T.ink})`,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <AppShellNav currentPage="courses" user={user} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>
        <PageHead scene={scene} onChangeScene={handleScene} />
        {showLizReco && <LizGuidanceBanner />}
        {showNotSure && <NotSureStrip onStart={() => handleScene('quiz')} />}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
            marginBottom: 40,
          }}
        >
          {viewCourses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              showRecoRibbon={c.recommended && scene === 'liz'}
              onPrimary={() => navigate(c.href)}
              onSyllabus={() => navigate(`${c.href}#syllabus`)}
            />
          ))}
        </div>

        <ToolsSection onOpen={(href) => navigate(href)} />
      </div>
    </div>
  );
}

function PageHead({ onChangeScene }) {
  return (
    <header
      style={{
        marginBottom: 22,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 280 }}>
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: `hsl(${T.brandDark})`,
            fontWeight: 600,
          }}
        >
          Courses
        </div>
        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 36,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            margin: '4px 0 0',
          }}
        >
          Three courses. One clear path.
        </h1>
        <p style={{ margin: '6px 0 0', color: `hsl(${T.muted})`, maxWidth: 600 }}>
          Start where you are. Move to the next course when Liz says you're ready.
        </p>
      </div>
      {/* Replaces the old demo "Scene" switcher — the only real action it carried
          (the level quiz) is now a plain header CTA; the page always shows Liz's
          recommendation + all courses. */}
      <button
        type="button"
        onClick={() => onChangeScene('quiz')}
        style={{
          flex: '0 0 auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 999,
          border: `1px solid hsl(${T.brand} / 0.35)`,
          background: `hsl(${T.brand} / 0.08)`,
          color: `hsl(${T.brandDark})`,
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Not sure where to start? Take the level quiz →
      </button>
    </header>
  );
}

// Liz banner — neutral guidance copy. We don't have a per-user baseline
// recommendation engine yet, so this stays evergreen instead of pretending
// to know the candidate's level.
function LizGuidanceBanner() {
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        borderRadius: 24,
        background: `linear-gradient(135deg, hsl(${T.brand} / 0.10), hsl(${T.sky} / 0.10))`,
        border: `1px solid hsl(${T.brand} / 0.22)`,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          flex: '0 0 54px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
          display: 'grid',
          placeItems: 'center',
          color: 'white',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 22,
          fontWeight: 700,
          boxShadow: `0 4px 14px hsl(${T.brand} / 0.3)`,
        }}
      >
        L
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: `hsl(${T.brandDark})`,
          }}
        >
          Liz · Course guide
        </div>
        <h3
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 19,
            fontWeight: 600,
            margin: '2px 0 4px',
          }}
        >
          Most students start with Mastery
        </h3>
        <p style={{ margin: 0, color: `hsl(${T.ink} / 0.8)`, fontSize: 14 }}>
          It's the core IELTS course built for 4.5–6.5 learners pushing into Band 7.{' '}
          <em style={{ color: `hsl(${T.muted})`, fontStyle: 'normal' }}>
            Start with Foundations if you're just beginning, or Advanced if you're already at Band 6.5+.
          </em>
        </p>
      </div>
    </section>
  );
}

// "Not sure where to start?" — Browse-mode strip. Dashed brand border per
// D11 handoff. CTA boots the level quiz (= /comprehensive-level-test).
function NotSureStrip({ onStart }) {
  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 18px',
        borderRadius: 16,
        border: `1.5px dashed hsl(${T.brand} / 0.4)`,
        background: `hsl(${T.surface})`,
        marginBottom: 28,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          flex: '0 0 40px',
          borderRadius: 10,
          background: `hsl(${T.gold} / 0.18)`,
          display: 'grid',
          placeItems: 'center',
          color: 'hsl(35 70% 30%)',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        ?
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 2px' }}>
          Not sure where to start?
        </h4>
        <p style={{ fontSize: 13, color: `hsl(${T.muted})`, margin: 0 }}>
          Answer 3 quick questions — Liz will point you to the right course.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        style={{
          marginLeft: 'auto',
          padding: '10px 16px',
          borderRadius: 10,
          background: `hsl(${T.brand})`,
          color: 'white',
          fontWeight: 600,
          fontSize: 14,
          border: 0,
          cursor: 'pointer',
          boxShadow: `0 2px 0 hsl(${T.brandDark})`,
          whiteSpace: 'nowrap',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `hsl(${T.brandDark})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = `hsl(${T.brand})`;
        }}
      >
        Find my level · 2 min
      </button>
    </section>
  );
}

// Tiny inline icons for the stats row. Kept inline (not lucide) to match
// the 12px stroke-1.6 vocabulary of the handoff exactly.
function StatIconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="2" y="3" width="10" height="9" rx="1.5" />
      <path d="M2 6h10M5 1v3M9 1v3" />
    </svg>
  );
}
function StatIconClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M7 4v3l2 1.5" />
    </svg>
  );
}
function StatIconStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 1l2 4 4 .5-3 3 .7 4L7 10.5 3.3 12.5 4 8.5 1 5.5l4-.5z" />
    </svg>
  );
}

function CourseCard({ course, showRecoRibbon, onPrimary, onSyllabus }) {
  return (
    <article
      data-reco={showRecoRibbon ? '' : undefined}
      style={{
        position: 'relative',
        background: `hsl(${T.surface})`,
        border: `1px solid hsl(${showRecoRibbon ? T.brand : T.border})`,
        borderRadius: 24,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 200ms',
        boxShadow: showRecoRibbon ? `0 12px 32px hsl(${T.brand} / 0.14)` : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = SHADOW;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = showRecoRibbon
          ? `0 12px 32px hsl(${T.brand} / 0.14)`
          : 'none';
      }}
    >
      {showRecoRibbon && (
        <div
          style={{
            padding: '6px 14px',
            background: `hsl(${T.brand})`,
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Liz recommends for most candidates
        </div>
      )}

      <div
        style={{
          height: 140,
          position: 'relative',
          overflow: 'hidden',
          background: COVER_GRADIENT[course.cover] || COVER_GRADIENT.brand,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            backgroundImage:
              'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px, 40px 40px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 38,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 20px hsl(220 30% 10% / 0.2)',
          }}
        >
          {course.bandRange}
        </div>
      </div>

      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: `hsl(${T.muted})`,
            fontWeight: 600,
          }}
        >
          {course.kicker}
        </div>
        <h3
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 22,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {course.title}
        </h3>
        <p style={{ fontSize: 14, color: `hsl(${T.ink} / 0.75)`, margin: 0 }}>{course.blurb}</p>

        {/* Stats: dashed top/bottom borders, icon + label rows. */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 12,
            color: `hsl(${T.muted})`,
            padding: '10px 0',
            borderTop: `1px dashed hsl(${T.border})`,
            borderBottom: `1px dashed hsl(${T.border})`,
            margin: '4px 0',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatIconCalendar />
            {course.lessons > 0 ? `${course.lessons} lessons` : '— lessons'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatIconClock />
            {course.completed > 0 ? `${course.completed}/${course.lessons} done` : 'Not started'}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatIconStar />
            {course.target}
          </span>
        </div>

        {/* Topic tags. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(course.topics || []).map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 999,
                background: `hsl(${T.borderSoft})`,
                color: `hsl(${T.muted})`,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Progress bar — only when course.progress is set (Mastery placeholder 22%). */}
        {course.progress != null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: `hsl(${T.border})`,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${course.progress}%`,
                  background: `hsl(${T.brand})`,
                  borderRadius: 3,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                color: `hsl(${T.muted})`,
                fontFamily: '"JetBrains Mono", ui-monospace, monospace',
                fontWeight: 600,
              }}
            >
              {course.progress}%
            </span>
          </div>
        )}

        {/* Foot: ghost "See syllabus" + state-aware primary CTA. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={onSyllabus}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              background: 'transparent',
              color: `hsl(${T.brandDark})`,
              fontWeight: 600,
              fontSize: 14,
              border: `1px dashed hsl(${T.brand} / 0.4)`,
              cursor: 'pointer',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `hsl(${T.brand} / 0.08)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            See syllabus
          </button>
          <button
            type="button"
            onClick={onPrimary}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 10,
              background: `hsl(${T.brand})`,
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              border: 0,
              cursor: 'pointer',
              boxShadow: `0 2px 0 hsl(${T.brandDark})`,
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `hsl(${T.brandDark})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `hsl(${T.brand})`;
            }}
          >
            {course.primaryCta}
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

function ToolsSection({ onOpen }) {
  return (
    <section style={{ marginTop: 8 }}>
      <h3
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 22,
          fontWeight: 600,
          margin: '0 0 4px',
        }}
      >
        Learning tools
      </h3>
      <p style={{ color: `hsl(${T.muted})`, margin: '0 0 18px', fontSize: 14 }}>
        Spot drills, references, and tools to use alongside any course.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
        }}
      >
        {TOOLS.map((t) => (
          <button
            key={t.href}
            type="button"
            onClick={() => onOpen(t.href)}
            style={{
              padding: 16,
              borderRadius: 16,
              border: `1px solid hsl(${T.border})`,
              background: `hsl(${T.surface})`,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `hsl(${T.brand} / 0.4)`;
              e.currentTarget.style.background = `hsl(${T.brand} / 0.03)`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `hsl(${T.border})`;
              e.currentTarget.style.background = `hsl(${T.surface})`;
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `hsl(${T.brand} / 0.1)`,
                display: 'grid',
                placeItems: 'center',
                color: `hsl(${T.brandDark})`,
                fontWeight: 700,
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 18,
              }}
            >
              {t.code}
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, margin: '2px 0 2px' }}>{t.title}</h4>
            <p style={{ fontSize: 12, color: `hsl(${T.muted})`, margin: 0 }}>{t.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

// Note: AppShell component (legacy back-button header) was removed — the
// page now uses AppShellNav exclusively, matching the rest of the D8-D11
// handoff family.
// eslint-disable-next-line no-unused-vars
const _ArrowLeftKept = ArrowLeft;
