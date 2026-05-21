import React from 'react';
import { Link } from 'react-router-dom';
import LandingNav from '../features/landing/components/LandingNav';
import LandingFooter from '../features/landing/components/LandingFooter';
import Testimonials from '../features/landing/components/Testimonials';
import '../features/landing/landing.css';

/**
 * About page — long-form marketing narrative.
 *
 * Structure: hero → "the paradox" 4-card grid of broken pieces in IELTS
 * prep → "what was missing" narrative → first-person teacher origin →
 * "what changed" solution bullets → CTA. Lives entirely inside
 * .landing-scope so it inherits the marketing typography + tokens.
 *
 * The motion is intentionally low-key — slow gradient shimmer behind the
 * hero, soft float on the decorative shapes, IntersectionObserver fade-up
 * on each section as it enters the viewport. Honors prefers-reduced-motion.
 */
export default function AboutPage() {
  // Reveal-on-scroll for sections marked .reveal — pure CSS class toggle
  // via IntersectionObserver, no animation library.
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const reduce =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll('.about-reveal');
    if (reduce) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing-scope about-page">
      <style>{ABOUT_CSS}</style>
      <LandingNav />

      {/* HERO */}
      <section className="about-hero">
        <span className="about-blob about-blob-a" aria-hidden="true" />
        <span className="about-blob about-blob-b" aria-hidden="true" />
        <span className="about-blob about-blob-c" aria-hidden="true" />
        <div className="container about-hero-inner">
          <div className="eyebrow about-reveal">
            <span className="dot" /> Our story
          </div>
          <h1 className="about-hero-title about-reveal">
            Built by a teacher who got <em>tired</em> of telling students
            <br />
            the same thing every IELTS book leaves out.
          </h1>
          <p className="about-hero-sub about-reveal">
            IELTS Ace exists because every other piece of the prep market
            forgets the part that actually moves a band: real feedback, on
            <em> your</em> work, before you forget what you wrote.
          </p>
        </div>
      </section>

      {/* THE PARADOX */}
      <section className="about-section about-reveal">
        <div className="container">
          <div className="section-eyebrow">The paradox</div>
          <h2 className="section-title">
            Everything an IELTS student needs already exists.
            <br />
            None of it talks to each other.
          </h2>
          <p className="section-sub">
            Look at what's on the market. Books. Apps. Mock tests. YouTube
            channels. Classroom courses. Every piece is solid in isolation —
            and useless on its own. Here's what students actually run into.
          </p>

          <div className="about-grid">
            <Pain
              num="01"
              title="Lessons without feedback."
              body="Bookshelves of strategy guides and 12-hour video courses — and not a single human reads what you write or hears what you say. Self-study compounds your mistakes instead of fixing them."
            />
            <Pain
              num="02"
              title="Feedback, but at $80 an essay."
              body="The teachers who do mark papers properly are out of reach for the students who need them most. One essay a week is a luxury. Writers need ten."
            />
            <Pain
              num="03"
              title="Tests, but no teaching."
              body="Endless mock test platforms. They tell you the score, never the why. You learn that you got 14/40. You don't learn what to do differently next Monday."
            />
            <Pain
              num="04"
              title="Teaching, but not IELTS teaching."
              body="The internet says 'IELTS class' but serves general English with a tips-and-tricks topcoat. Watch a video, nod, move on. No production, no correction, no learning. Passive content can't lift a band."
            />
            <Pain
              num="05"
              title="Books that bore you out of the test."
              body="700-page Cambridge volumes. No clear target. No sense of how close you are. No coach saying 'this week, focus on cohesion.' Most students close the book before page 80."
            />
            <Pain
              num="06"
              title="Classrooms that forget your name."
              body="Group classes are expensive — and the teacher cannot possibly remember twenty essays, twenty speaking sessions, twenty grammar quirks. You leave with the same weakness you walked in with."
            />
          </div>
        </div>
      </section>

      {/* WHAT WAS MISSING */}
      <section className="about-narrative about-reveal">
        <div className="container narrow">
          <div className="section-eyebrow">What was missing</div>
          <h2 className="section-title">A coach. Not a course.</h2>
          <p>
            Tests don't lift bands. Reviews lift bands. Specific, criterion-by-criterion
            reviews — task response is a 6, here's why, here's the fix, do it again
            tomorrow. That kind of review used to require a person, an hour, and a
            paycheck. Most students never got it.
          </p>
          <p>
            What was missing wasn't more content. It was a coach who reads what you
            write, listens to how you speak, remembers your weak edges, and tells you
            <em> exactly </em>what to practice next — calibrated to the same Cambridge
            descriptors a real examiner uses. Cheap enough that a student in Hanoi or
            Lagos or Tashkent can use it daily, not once a month.
          </p>
        </div>
      </section>

      {/* TEACHER STORY */}
      <section className="about-story about-reveal">
        <div className="container narrow">
          <div className="section-eyebrow">Why this exists</div>
          <h2 className="section-title">A teacher who was a student first.</h2>
          <p>
            This platform was built by an English teacher with 10+ years marking
            student writing, running speaking practice, and watching the same
            broken stack break the same students: books that won't grade you,
            tests that won't teach you, classes most learners can't afford,
            tutors who can't keep up.
          </p>
          <p>
            After a decade of running the feedback loop by hand — read the essay,
            mark it against the descriptors, write the rewrite, hand it back —
            the answer became obvious: the teaching is solved, the testing is
            solved. What's not solved is the loop in between. The bit where
            someone looks at <em>your</em> essay and says <em>this</em> is your
            weak edge, fix <em> that</em>, write again.
          </p>
          <p>
            IELTS Ace is that loop. Every essay graded. Every speaking turn timed and
            transcribed. Every weak edge tracked across weeks. No judgment from a room
            full of strangers. Just a coach who actually remembers your last attempt.
          </p>
        </div>
      </section>

      {/* WHAT CHANGED */}
      <section className="about-section about-reveal">
        <div className="container">
          <div className="section-eyebrow">What changed</div>
          <h2 className="section-title">One platform. Every broken loop, closed.</h2>

          <div className="about-fix-grid">
            <Fix
              k="Lessons + feedback"
              v="Every reading, listening, writing, and speaking attempt comes with a per-criterion review. No exception."
            />
            <Fix
              k="Real grading, $0.20 a paper"
              v="An evaluator tuned on Cambridge band descriptors marks every essay in seconds. Cheaper than a print-out."
            />
            <Fix
              k="Tests that teach"
              v="Every mistake is annotated. Every wrong answer turns into a vocabulary card or a strategy drill, automatically."
            />
            <Fix
              k="Production over passive"
              v="You write. You speak. You produce — and the system replies. No watch-and-nod. Output is the only path to a band."
            />
            <Fix
              k="A coach with memory"
              v="Liz, our AI tutor, holds your weak edges across sessions: cohesion last week, lexical this week, with concrete drills for both."
            />
            <Fix
              k="Yours, on your schedule"
              v="No classroom embarrassment. No commute. Open the laptop at 11pm, write a Task 2, get it back before midnight."
            />
          </div>
        </div>
      </section>

      {/* PROOF — same component the landing uses, so any approved
          testimonial automatically appears here too. */}
      <div className="about-reveal">
        <Testimonials />
      </div>

      {/* CTA */}
      <section className="about-cta about-reveal">
        <div className="container">
          <div className="about-cta-card">
            <h3 className="serif">Same exam. Same descriptors. A fundamentally better loop.</h3>
            <p>
              Free tier, no credit card. Submit one essay, see what the loop feels like.
            </p>
            <div className="about-cta-row">
              <Link to="/signup" className="btn btn-primary btn-xl">
                Start free
              </Link>
              <Link to="/score-my-essay" className="btn btn-outline btn-xl">
                Try one essay first
              </Link>
            </div>
            <p className="about-cta-foot">
              Built by an English teacher with 10+ years marking student
              writing. Every feature mentored personally. A real person reads
              every email at{' '}
              <a href="mailto:support@testmaster.pro">support@testmaster.pro</a>.
            </p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

function Pain({ num, title, body }) {
  return (
    <article className="about-pain">
      <div className="about-pain-num">{num}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}

function Fix({ k, v }) {
  return (
    <article className="about-fix">
      <div className="about-fix-k">{k}</div>
      <p>{v}</p>
    </article>
  );
}

const ABOUT_CSS = `
.landing-scope.about-page { min-height: 100vh; }

/* HERO ---------------------------------------------------------- */
.landing-scope .about-hero {
  position: relative;
  overflow: hidden;
  padding: 72px 0 88px;
  background:
    radial-gradient(1200px 500px at 20% -10%, hsl(160 84% 92% / 0.55), transparent 60%),
    radial-gradient(900px 400px at 95% 10%, hsl(199 89% 92% / 0.5), transparent 60%),
    linear-gradient(180deg, hsl(var(--background)) 0%, hsl(0 0% 100%) 100%);
}
.landing-scope .about-hero-inner { position: relative; z-index: 2; }
.landing-scope .about-hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(34px, 4.6vw, 60px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  color: hsl(var(--foreground));
  margin: 14px 0 18px;
  max-width: 940px;
  text-wrap: balance;
}
.landing-scope .about-hero-title em {
  font-style: italic;
  color: hsl(var(--primary));
}
.landing-scope .about-hero-sub {
  font-size: 19px;
  line-height: 1.55;
  color: hsl(var(--muted-foreground));
  max-width: 720px;
  text-wrap: pretty;
}
.landing-scope .about-hero-sub em {
  font-style: italic;
  color: hsl(var(--foreground));
  font-weight: 500;
}

/* Floating decorative blobs */
.landing-scope .about-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  pointer-events: none;
  z-index: 1;
}
.landing-scope .about-blob-a {
  width: 320px; height: 320px;
  top: -80px; left: -60px;
  background: hsl(160 84% 75%);
  animation: aboutFloatA 14s ease-in-out infinite;
}
.landing-scope .about-blob-b {
  width: 260px; height: 260px;
  top: 40px; right: -40px;
  background: hsl(199 89% 80%);
  animation: aboutFloatB 18s ease-in-out infinite;
}
.landing-scope .about-blob-c {
  width: 200px; height: 200px;
  bottom: -60px; left: 40%;
  background: hsl(43 96% 80%);
  animation: aboutFloatA 22s ease-in-out infinite reverse;
}
@keyframes aboutFloatA {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -20px); }
}
@keyframes aboutFloatB {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-25px, 25px); }
}
@media (prefers-reduced-motion: reduce) {
  .landing-scope .about-blob { animation: none !important; }
}

/* SECTIONS ------------------------------------------------------ */
.landing-scope .about-section { padding: 88px 0; }
.landing-scope .about-section .section-title { margin-bottom: 18px; }
.landing-scope .about-section .section-sub { margin-bottom: 40px; }
.landing-scope .container.narrow { max-width: 760px; }

/* PAIN GRID ----------------------------------------------------- */
.landing-scope .about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-top: 32px;
}
.landing-scope .about-pain {
  position: relative;
  padding: 24px 22px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 18px;
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
.landing-scope .about-pain:hover {
  transform: translateY(-3px);
  border-color: hsl(var(--primary) / 0.35);
  box-shadow: 0 12px 30px -18px hsl(var(--primary) / 0.45);
}
.landing-scope .about-pain-num {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}
.landing-scope .about-pain h3 {
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  line-height: 1.25;
  color: hsl(var(--foreground));
  margin: 0 0 8px;
  text-wrap: balance;
}
.landing-scope .about-pain p {
  font-size: 14.5px;
  color: hsl(var(--muted-foreground));
  line-height: 1.55;
  margin: 0;
}
@media (max-width: 980px) { .landing-scope .about-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .landing-scope .about-grid { grid-template-columns: 1fr; } }

/* NARRATIVE ----------------------------------------------------- */
.landing-scope .about-narrative,
.landing-scope .about-story {
  padding: 80px 0;
  position: relative;
}
.landing-scope .about-narrative {
  background: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(var(--muted)) 100%);
}
.landing-scope .about-story {
  background: hsl(var(--card));
  border-top: 1px solid hsl(var(--border));
  border-bottom: 1px solid hsl(var(--border));
}
.landing-scope .about-narrative p,
.landing-scope .about-story p {
  font-size: 17.5px;
  line-height: 1.7;
  color: hsl(var(--foreground));
  margin: 18px 0 0;
  text-wrap: pretty;
}
.landing-scope .about-narrative p em,
.landing-scope .about-story p em {
  font-style: italic;
  color: hsl(var(--primary));
}

/* FIX GRID ------------------------------------------------------ */
.landing-scope .about-fix-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 32px;
}
.landing-scope .about-fix {
  padding: 22px 20px;
  border-left: 3px solid hsl(var(--primary));
  background: hsl(var(--card));
  border-radius: 0 14px 14px 0;
  transition: transform .25s ease, border-color .25s ease;
}
.landing-scope .about-fix:hover { transform: translateX(4px); }
.landing-scope .about-fix-k {
  font-weight: 600;
  font-size: 15px;
  color: hsl(var(--foreground));
  margin-bottom: 6px;
}
.landing-scope .about-fix p {
  font-size: 14.5px;
  line-height: 1.55;
  color: hsl(var(--muted-foreground));
  margin: 0;
}
@media (max-width: 980px) { .landing-scope .about-fix-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .landing-scope .about-fix-grid { grid-template-columns: 1fr; } }

/* CTA ----------------------------------------------------------- */
.landing-scope .about-cta { padding: 80px 0 96px; }
.landing-scope .about-cta-card {
  position: relative;
  overflow: hidden;
  padding: 56px 40px;
  border-radius: 28px;
  text-align: center;
  background:
    radial-gradient(800px 200px at 50% -20%, hsl(160 84% 80% / 0.55), transparent 70%),
    linear-gradient(135deg, hsl(160 84% 96%) 0%, hsl(199 89% 96%) 100%);
  border: 1px solid hsl(var(--border));
}
.landing-scope .about-cta-card h3 {
  font-size: clamp(26px, 3.2vw, 36px);
  line-height: 1.15;
  font-weight: 700;
  color: hsl(var(--foreground));
  margin: 0 0 14px;
  text-wrap: balance;
}
.landing-scope .about-cta-card > p {
  font-size: 17px;
  color: hsl(var(--muted-foreground));
  margin: 0 0 28px;
}
.landing-scope .about-cta-row {
  display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;
}
.landing-scope .about-cta-foot {
  font-size: 13px !important;
  color: hsl(var(--muted-foreground));
  margin-top: 32px !important;
}
.landing-scope .about-cta-foot a { color: hsl(var(--primary)); }

/* REVEAL -------------------------------------------------------- */
.about-reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity .7s ease, transform .7s ease;
}
.about-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce) {
  .about-reveal { opacity: 1; transform: none; transition: none; }
}
`;
