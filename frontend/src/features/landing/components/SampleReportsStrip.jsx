import React from 'react';

const REPORTS = [
  {
    cls: 'b5',
    band: '5',
    decimal: '.0',
    tier: 'Working toward band 6',
    title: '"Technology in education"',
    meta: 'Task 2 · 248 words · 23 fixes',
    href: '/samples/writing/band-5-0-task2',
  },
  {
    cls: 'b65',
    band: '6',
    decimal: '.5',
    tier: 'Target for most applicants',
    title: '"Living in cities vs countryside"',
    meta: 'Task 2 · 281 words · 14 fixes',
    href: '/samples/writing/band-6-5-task2',
  },
  {
    cls: 'b8',
    band: '8',
    decimal: '.0',
    tier: 'High-band benchmark',
    title: '"Environmental responsibility"',
    meta: 'Task 2 · 312 words · 4 refinements',
    href: '/samples/writing/band-8-0-task2',
  },
  {
    cls: 'b6',
    band: '6',
    decimal: '.0',
    tier: 'Reading · Academic test',
    title: '"3 passages · 40 questions"',
    meta: 'T/F/NG · Fill · Match · 24/40 correct',
    href: '/samples/reading/band-6-0-academic.html',
  },
];

export default function SampleReportsStrip() {
  return (
    <section id="samples" style={{ paddingTop: 16 }}>
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Sample reports</div>
          <h2 className="section-title">See what a full evaluation looks like.</h2>
          <p className="section-sub">
            Three real student essays, three band levels. Every comment, every rewrite —
            exactly what students receive.
          </p>
        </div>
        <div className="reports">
          {REPORTS.map((r) => (
            <article key={r.cls} className={`report ${r.cls}`}>
              <div className="report-thumb">
                <div className="report-band">
                  {r.band}<span className="s">{r.decimal}</span>
                </div>
              </div>
              <div className="report-body">
                <div className="tier">{r.tier}</div>
                <div className="title">{r.title}</div>
                <div className="meta">{r.meta}</div>
                <a href={r.href} className="report-link">
                  View full sample report
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
