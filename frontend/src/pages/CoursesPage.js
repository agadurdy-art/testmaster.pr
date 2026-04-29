import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * /courses — D11 handoff port.
 *
 * Visual vocabulary: tokens, type scale, card shape, gradient covers, and
 * the Liz guidance banner all come from D11-courses.html. Copy, course
 * data, routes, and external links are preserved from the existing app
 * (handoff content was placeholder, not real data).
 *
 * What's intentionally omitted vs the prototype:
 *   - per-course stats row (lessons / min/day / target band) — no real data
 *   - topic tags — no real data
 *   - progress percent — no per-user enrollment tracking yet
 *   - "Not sure → level quiz" overlay — no quiz feature exists
 *   - personalised "Based on your baseline · Band 6.0" recommendation —
 *     replaced with neutral evergreen guidance
 *
 * Dashboard scope is unchanged: this page keeps its own minimal sticky
 * header (logo + Back to Dashboard) restyled to match the handoff, and
 * does not add a duplicate nav rail.
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

// The three product courses. Routes + band ranges + blurbs are the real
// IELTS Ace data — the handoff's invented copy is not used. `cover` matches
// the cool→warm progression in the prototype (sky → brand → gold).
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
    cta: 'Open course',
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
    cta: 'Open course',
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
    cta: 'Open course',
  },
];

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `hsl(${T.bg})`,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: `hsl(${T.ink})`,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <AppShell onBack={() => navigate('/dashboard')} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>
        <PageHead />
        <LizGuidanceBanner />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
            marginBottom: 40,
          }}
        >
          {COURSES.map((c) => (
            <CourseCard key={c.id} course={c} onOpen={() => navigate(c.href)} />
          ))}
        </div>

        <ToolsSection onOpen={(href) => navigate(href)} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Page-level shell. Sticky glass header, brand-mark gradient, "Back to
// Dashboard" on the right. Functional content matches the existing page;
// only the visual treatment is updated to handoff vocabulary.
// ──────────────────────────────────────────────────────────────────────────
function AppShell({ onBack }) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 28px',
        background: `hsl(${T.surface} / 0.88)`,
        backdropFilter: 'saturate(1.2) blur(10px)',
        WebkitBackdropFilter: 'saturate(1.2) blur(10px)',
        borderBottom: `1px solid hsl(${T.border})`,
      }}
    >
      <a
        href="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: `hsl(${T.ink})`,
          textDecoration: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `linear-gradient(135deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
            boxShadow: `inset 0 -2px 0 hsl(${T.brandDark} / 0.4)`,
          }}
        />
        IELTS Ace
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 11,
            color: `hsl(${T.muted})`,
            marginLeft: 2,
            letterSpacing: '0.04em',
            textTransform: 'lowercase',
          }}
        >
          by testmaster.pro
        </span>
      </a>

      <div style={{ flex: 1 }} />

      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 10,
          background: `hsl(${T.surface})`,
          border: `1px solid hsl(${T.border})`,
          fontSize: 13,
          fontWeight: 500,
          color: `hsl(${T.muted})`,
          cursor: 'pointer',
          boxShadow: SHADOW_SM,
          transition: 'color 150ms, border-color 150ms',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = `hsl(${T.ink})`;
          e.currentTarget.style.borderColor = `hsl(${T.fainter})`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = `hsl(${T.muted})`;
          e.currentTarget.style.borderColor = `hsl(${T.border})`;
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14 }} />
        Back to Dashboard
      </button>
    </header>
  );
}

function PageHead() {
  return (
    <header style={{ marginBottom: 22 }}>
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

function CourseCard({ course, onOpen }) {
  const reco = !!course.recommended;
  return (
    <article
      style={{
        position: 'relative',
        background: `hsl(${T.surface})`,
        border: `1px solid hsl(${reco ? T.brand : T.border})`,
        borderRadius: 24,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 200ms',
        boxShadow: reco ? `0 12px 32px hsl(${T.brand} / 0.14)` : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = SHADOW;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = reco ? `0 12px 32px hsl(${T.brand} / 0.14)` : 'none';
      }}
    >
      {reco && (
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
        <p style={{ fontSize: 14, color: `hsl(${T.ink} / 0.75)`, margin: 0, flex: 1 }}>
          {course.blurb}
        </p>

        <button
          type="button"
          onClick={onOpen}
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
          {course.cta}
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 10h12M11 5l5 5-5 5" />
          </svg>
        </button>
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
