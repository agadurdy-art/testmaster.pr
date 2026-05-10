import React, { useEffect, useState } from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';
import LizAvatar from './LizAvatar';

/**
 * Landing Hero — DEMO variant.
 * 4-tab skill switcher (Writing / Speaking / Reading / Listening).
 * Writing → existing sample report. Speaking → live practice drill.
 * Reading / Listening currently placeholder ("soon") until sample pages ship.
 *
 * Includes a Liz chip under the sub with cycling coach messages (4 lines,
 * 4s interval) and a compact "see what a full report looks like" row of
 * sample chips inside the Writing tab.
 */

// All four skills now point at the same kind of surface: a "full report"
// page. Writing/Speaking are React routes, Reading/Listening are static HTML
// in /public/samples. The in-page report has its own "Score my essay" / live
// trial CTAs, so the switcher consistently funnels visitors to the report
// first (parity with Reading/Listening that the user explicitly asked for).
const TABS = [
  { key: 'writing',   label: 'Writing',   href: '/samples/writing/band-6-5-task2',           cta: 'See the full report', available: true },
  { key: 'speaking',  label: 'Speaking',  href: '/samples/speaking/band-6-5-part2',          cta: 'See the full report', available: true },
  { key: 'reading',   label: 'Reading',   href: '/samples/reading/band-6-0-academic.html',   cta: 'See the full report', available: true },
  { key: 'listening', label: 'Listening', href: '/samples/listening/band-5-5-listening.html', cta: 'See the full report', available: true },
];

const LIZ_LINES = [
  'Hi, I\u2019m Liz — your AI IELTS coach.',
  'Submit writing and I\u2019ll give you a band estimate.',
  'We can practice speaking Part 2 right now.',
  'I\u2019ll teach you in short lessons, then practice.',
];

export default function LandingHeroDemo() {
  const { t } = useI18n();
  const [active, setActive] = useState('writing');
  const [lizLine, setLizLine] = useState(0);
  const current = TABS.find((x) => x.key === active);

  // Cycle Liz's tagline every 4s. Pauses on reduced motion preference.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const id = setInterval(() => setLizLine((i) => (i + 1) % LIZ_LINES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero">
      <div className="container hero-grid">
        <div>
          <div className="eyebrow">
            <span className="dot" aria-hidden="true" />
            Welcome <span className="sep">·</span>
            <span>IELTS path</span> <span className="sep">·</span>
            <span>Powered by Liz</span>
          </div>
          <h1 className="headline">
            {t('landingV2HeroTitleA')} <span className="under">{t('landingV2HeroTitleTime')}</span> —{' '}
            <span className="ital">{t('landingV2HeroTitleB')}</span>
          </h1>
          <p className="sub">
            Meet <b>Liz</b>, your AI IELTS coach. Learn with structured courses, then prove it with
            instant band estimates and margin notes in your language.
          </p>

          <div className="liz-chip" aria-live="polite">
            <LizAvatar size={36} ring />
            <span className="liz-chip-text" key={lizLine}>{LIZ_LINES[lizLine]}</span>
          </div>

          <div className="cta-row">
            <a
              href={current.available ? current.href : '#samples'}
              className={`btn btn-primary btn-xl ${current.available ? '' : 'btn-disabled'}`}
              aria-disabled={!current.available}
            >
              {current.cta}
              <ArrowRightIcon size={16} />
            </a>
            <a href="#liz" className="btn btn-outline btn-xl">
              Meet Liz
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
          <div className="micro">
            <span className="chk">✓</span>
            {t('landingV2HeroMicro')}
          </div>
        </div>

        <div className="demo-wrap">
          <div className="skill-tabs" role="tablist" aria-label="Preview a skill">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={active === tab.key}
                className={`skill-tab ${active === tab.key ? 'active' : ''} ${tab.available ? '' : 'is-soon'}`}
                onClick={() => setActive(tab.key)}
              >
                {tab.label}
                {!tab.available && <span className="tab-soon">soon</span>}
              </button>
            ))}
          </div>

          {active === 'writing' && (
            <WritingDemo />
          )}
          {active === 'speaking' && (
            <SpeakingDemo />
          )}
          {active === 'reading' && <ReadingDemo />}
          {active === 'listening' && <ListeningDemo />}
        </div>
      </div>
    </section>
  );
}

function WritingDemo() {
  return (
    <div className="sample-preview">
      <div className="sample-preview-head">
        <div>
          <div className="sample-preview-eyebrow">Task 2 · Sample report</div>
          <div className="sample-preview-title">Do social media platforms improve communication?</div>
        </div>
        <div className="sample-preview-band">
          <div className="sample-preview-band-num">6.5</div>
          <div className="sample-preview-band-label">Estimated band</div>
        </div>
      </div>
      <div className="sample-preview-body">
        <div className="sample-preview-annotated">
          <p>
            Nowadays, many{' '}
            <span className="margin-tag" title="Grammar">¹</span>peoples thinks that social media has
            made communication easier than before.
          </p>
          <p>
            In my opinion, while platforms such as Facebook are{' '}
            <span className="margin-tag" title="Lexical">²</span>useful for keeping in touch, they
            often encourage shorter, more{' '}
            <span className="margin-tag" title="Cohesion">³</span>superficial exchanges…
          </p>
        </div>
        <div className="sample-preview-margin">
          <div className="sample-preview-note">
            <b>¹ Grammar · Fix</b>
            "peoples thinks" → <i>people think</i>. Plural noun + plural verb.
          </div>
          <div className="sample-preview-note">
            <b>² Lexical · Upgrade</b>
            "useful" is weak at Band 7. Try <i>indispensable</i> or <i>invaluable</i>.
          </div>
          <div className="sample-preview-note">
            <b>³ Cohesion</b>
            Good contrast with "while"; consider a clearer link back to the thesis.
          </div>
        </div>
      </div>
      <div className="sample-preview-footer">
        <div className="sample-preview-criteria">
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Task</span><span className="sample-preview-criterion-val">7.0</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Cohesion</span><span className="sample-preview-criterion-val">6.5</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Lexical</span><span className="sample-preview-criterion-val">6.0</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Grammar</span><span className="sample-preview-criterion-val">6.5</span></div>
        </div>
        <a href="/samples/writing/band-6-5-task2" className="sample-preview-cta">
          See the full report →
        </a>
      </div>
    </div>
  );
}

function SpeakingDemo() {
  return (
    <div className="sample-preview is-speaking">
      <div className="sample-preview-head">
        <div>
          <div className="sample-preview-eyebrow">Part 2 · Sample report</div>
          <div className="sample-preview-title">Describe a person who has influenced you.</div>
        </div>
        <div className="sample-preview-band">
          <div className="sample-preview-band-num">7.0</div>
          <div className="sample-preview-band-label">Estimated band</div>
        </div>
      </div>
      <div className="speaking-wave" aria-hidden="true">
        {Array.from({ length: 48 }).map((_, i) => (
          <span key={i} style={{ height: `${10 + (Math.sin(i * 0.7) + 1) * 22}px` }} />
        ))}
      </div>
      <div className="sample-preview-body">
        <div className="sample-preview-annotated">
          <p>
            The person I want to talk about is my{' '}
            <span className="phoneme" title="/ɑːnt/ → /æn/">aunt</span> Mai. She has been a{' '}
            <span className="margin-tag" title="Fluency">¹</span>huge influence on my life since I
            was young.
          </p>
          <p>
            She taught me to be <span className="phoneme" title="/θ/ → /t/">thoughtful</span>{' '}
            and to speak up when I{' '}
            <span className="margin-tag" title="Grammar">²</span>disagree with something.
          </p>
        </div>
        <div className="sample-preview-margin">
          <div className="sample-preview-note">
            <b>¹ Fluency · Good</b>
            Natural chunking; no hesitation on linkers. Keep pace through Part 2.
          </div>
          <div className="sample-preview-note">
            <b>² Grammar · Watch</b>
            "disagree with something" — natural, but aim for "disagree with a decision/idea" at Band 7+.
          </div>
          <div className="sample-preview-note">
            <b>Pronunciation · /θ/ → /t/</b>
            Common for Vietnamese speakers. Drill: <i>think, three, through</i>.
          </div>
        </div>
      </div>
      <div className="sample-preview-footer">
        <div className="sample-preview-criteria">
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Fluency</span><span className="sample-preview-criterion-val">7.5</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Lexical</span><span className="sample-preview-criterion-val">7.0</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Grammar</span><span className="sample-preview-criterion-val">6.5</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Pronunciation</span><span className="sample-preview-criterion-val">7.0</span></div>
        </div>
        <a href="/samples/speaking/band-6-5-part2" className="sample-preview-cta">
          See the full report →
        </a>
      </div>
    </div>
  );
}

function ReadingDemo() {
  return (
    <div className="sample-preview">
      <div className="sample-preview-head">
        <div>
          <div className="sample-preview-eyebrow">Academic · Sample report</div>
          <div className="sample-preview-title">Reading Test — 3 passages, 40 questions</div>
        </div>
        <div className="sample-preview-band">
          <div className="sample-preview-band-num">6.0</div>
          <div className="sample-preview-band-label">Estimated band</div>
        </div>
      </div>
      <div className="sample-preview-body">
        <div className="sample-preview-annotated">
          <p>
            <b>Q5 · True / False / Not Given</b> —{' '}
            <span className="margin-tag" title="Strategy">¹</span>
            <i>"Snow leopards primarily hunt at night."</i>
          </p>
          <p>
            <span style={{ color: '#dc2626' }}>Your answer: <b>False</b></span>{' '}
            <span style={{ color: '#059669' }}>· Correct: <b>Not Given</b></span>
          </p>
          <p>
            <b>Q24 · Fill in the blank</b> —{' '}
            <span className="margin-tag" title="Synonym">²</span>"Cities use ____ data to redesign streets."
          </p>
          <p>
            <span style={{ color: '#dc2626' }}>Your answer: <b>traffic</b></span>{' '}
            <span style={{ color: '#059669' }}>· Correct: <b>movement</b></span>
          </p>
        </div>
        <div className="sample-preview-margin">
          <div className="sample-preview-note">
            <b>¹ T/F/NG · Trap</b>
            If the passage doesn't address it, it's <i>Not Given</i> — even if the claim feels false.
          </div>
          <div className="sample-preview-note">
            <b>² Fill-in · Exact word</b>
            Fill-ins almost always require the exact word from the passage. Don't paraphrase.
          </div>
          <div className="sample-preview-note">
            <b>Priority Fix</b>
            7 of your 16 mistakes come from T/F/NG — mastering this one skill is worth +1.0 band.
          </div>
        </div>
      </div>
      <div className="sample-preview-footer">
        <div className="sample-preview-criteria">
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Passage 1</span><span className="sample-preview-criterion-val">10/13</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Passage 2</span><span className="sample-preview-criterion-val">8/13</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Passage 3</span><span className="sample-preview-criterion-val">6/14</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Total</span><span className="sample-preview-criterion-val">24/40</span></div>
        </div>
        <a href="/samples/reading/band-6-0-academic.html" className="sample-preview-cta">
          See the full report →
        </a>
      </div>
    </div>
  );
}

function ListeningDemo() {
  return (
    <div className="sample-preview">
      <div className="sample-preview-head">
        <div>
          <div className="sample-preview-eyebrow">Diagnostic Mock Test 4 · Sample report</div>
          <div className="sample-preview-title">Listening Test — 4 parts, 40 questions</div>
        </div>
        <div className="sample-preview-band">
          <div className="sample-preview-band-num">5.5</div>
          <div className="sample-preview-band-label">Estimated band</div>
        </div>
      </div>
      <div className="sample-preview-body">
        <div className="sample-preview-annotated">
          <p>
            <b>Q7 · Note completion</b> —{' '}
            <span className="margin-tag" title="Synonym trap">¹</span>
            <i>"…allergic to ____"</i>
          </p>
          <p>
            <span style={{ color: '#dc2626' }}>Your answer: <b>dirt</b></span>{' '}
            <span style={{ color: '#059669' }}>· Correct: <b>dust</b></span>
          </p>
          <p>
            <b>Q14 · Multiple choice</b> —{' '}
            <span className="margin-tag" title="Distractor trap">²</span>
            <i>"What unexpected benefit did Dunwich Hotel notice?"</i>
          </p>
          <p>
            <span style={{ color: '#dc2626' }}>Your answer: <b>A · fall in complaints</b></span>{' '}
            <span style={{ color: '#059669' }}>· Correct: <b>C · rise in spending</b></span>
          </p>
        </div>
        <div className="sample-preview-margin">
          <div className="sample-preview-note">
            <b>¹ Note completion · Synonym trap</b>
            You heard the right idea but wrote a synonym. IELTS marks the EXACT word from the recording.
          </div>
          <div className="sample-preview-note">
            <b>² MCQ · Distractor trap</b>
            "Not only X but also Y" — the unexpected benefit is Y, not the obvious X.
          </div>
          <div className="sample-preview-note">
            <b>Priority Fix</b>
            Part 4 lecture cost 7 marks. Pause-and-write drills push you from 5.5 to 6.5.
          </div>
        </div>
      </div>
      <div className="sample-preview-footer">
        <div className="sample-preview-criteria">
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Part 1</span><span className="sample-preview-criterion-val">8/10</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Part 2</span><span className="sample-preview-criterion-val">6/10</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Part 3</span><span className="sample-preview-criterion-val">4/10</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Part 4</span><span className="sample-preview-criterion-val">3/10</span></div>
          <div className="sample-preview-criterion"><span className="sample-preview-criterion-name">Total</span><span className="sample-preview-criterion-val">21/40</span></div>
        </div>
        <a href="/samples/listening/band-5-5-listening.html" className="sample-preview-cta">
          See the full report →
        </a>
      </div>
    </div>
  );
}

function PlaceholderDemo({ label }) {
  return (
    <div className="demo">
      <div className="demo-chrome">
        <span className="tl r" /><span className="tl y" /><span className="tl g" />
        <span className="demo-url">testmaster.pro / evaluate / {label.toLowerCase()}</span>
      </div>
      <div className="demo-body demo-soon">
        <div className="soon-badge">Coming soon</div>
        <h3>{label} evaluator</h3>
        <p>
          Authentic {label.toLowerCase()} practice with instant band estimate and per-question
          explanations is on the way.
        </p>
        <a href="#samples" className="btn btn-outline">
          See current samples
        </a>
      </div>
    </div>
  );
}
