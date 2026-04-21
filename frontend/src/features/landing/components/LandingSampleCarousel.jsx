import React, { useEffect, useRef, useState } from 'react';

/**
 * Scroll-jack horizontal carousel used on the demo landing.
 *
 * 4 slides: 3 writing sample report teasers + 1 "Submit for free evaluation" CTA.
 * Desktop (lg+): outer section is 400vh tall, inner panel is sticky; vertical
 * scroll progress is mapped onto horizontal translate of the slide track.
 * Mobile (<lg): falls back to native horizontal scroll-snap; no scroll-jack,
 * no vertical padding trick — just swipe.
 */

const SLIDES = [
  {
    kind: 'sample',
    cls: 'b5',
    band: '5', decimal: '.0',
    tier: 'Working toward band 6',
    title: '"Technology in education"',
    meta: 'Task 2 · 248 words · 23 fixes',
    href: '/samples/writing/band-5-0-task2',
  },
  {
    kind: 'sample',
    cls: 'b65',
    band: '6', decimal: '.5',
    tier: 'Target for most applicants',
    title: '"Living in cities vs countryside"',
    meta: 'Task 2 · 281 words · 14 fixes',
    href: '/samples/writing/band-6-5-task2',
  },
  {
    kind: 'sample',
    cls: 'b8',
    band: '8', decimal: '.0',
    tier: 'High-band benchmark',
    title: '"Environmental responsibility"',
    meta: 'Task 2 · 312 words · 4 refinements',
    href: '/samples/writing/band-8-0-task2',
  },
  { kind: 'cta' },
];

export default function LandingSampleCarousel() {
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => setIsDesktop(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setProgress(0);
      return undefined;
    }
    let rafId = 0;
    const update = () => {
      rafId = 0;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = el.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(total > 0 ? scrolled / total : 0);
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDesktop]);

  const slideCount = SLIDES.length;
  const translate = isDesktop ? -(progress * (slideCount - 1) * 100) : 0;
  const activeIdx = Math.round(progress * (slideCount - 1));

  return (
    <section id="samples" className="carousel-wrap" ref={wrapRef}>
      <div className="carousel-sticky">
        <div className="container carousel-head">
          <div className="section-eyebrow">Sample reports</div>
          <h2 className="section-title">See real evaluations, then try your own.</h2>
          <p className="section-sub">
            Scroll through three student essays at different bands, then submit your own
            writing for an instant free evaluation.
          </p>
        </div>

        <div className="carousel-viewport">
          <div
            className="carousel-track"
            style={isDesktop ? { transform: `translate3d(${translate}vw, 0, 0)` } : undefined}
          >
            {SLIDES.map((s, i) => (
              <div className="carousel-slide" key={i} aria-hidden={isDesktop && i !== activeIdx}>
                {s.kind === 'sample' ? <SampleSlide s={s} /> : <CtaSlide />}
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-dots" role="tablist" aria-label="Sample navigation">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === activeIdx ? 'active' : ''}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SampleSlide({ s }) {
  return (
    <article className={`carousel-report ${s.cls}`}>
      <div className="report-thumb">
        <div className="report-band">
          {s.band}<span className="s">{s.decimal}</span>
        </div>
      </div>
      <div className="report-body">
        <div className="tier">{s.tier}</div>
        <div className="title">{s.title}</div>
        <div className="meta">{s.meta}</div>
        <a href={s.href} className="btn btn-primary">
          View full sample report
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </article>
  );
}

function CtaSlide() {
  return (
    <article className="carousel-cta">
      <div className="cta-inner">
        <div className="cta-eyebrow">
          <span className="dot" aria-hidden="true" /> Free · No signup to try
        </div>
        <h3 className="cta-title">Submit your own essay — get your band in seconds.</h3>
        <ul className="cta-perks">
          <li>✓ Instant band estimate across all 4 IELTS criteria</li>
          <li>✓ Teacher-style margin notes on every mistake</li>
          <li>✓ A rewritten "target-band" version of your essay</li>
        </ul>
        <div className="cta-actions">
          <a href="/writing-practice" className="btn btn-primary btn-xl">
            Submit for free evaluation
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a href="#pricing" className="btn btn-outline btn-xl">See pricing</a>
        </div>
      </div>
    </article>
  );
}
