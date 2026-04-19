import React from 'react';

const TESTIMONIALS = [
  {
    before: '5.5', after: '7.0', weeks: '8 weeks',
    quote: 'The Vietnamese translations made every comment click for me. I finally understood why my essays were stuck at 5.5 — not just that they were.',
    quoteEm: 'why',
    name: 'Minh N.', flag: '🇻🇳', loc: 'Hanoi, Vietnam',
  },
  {
    before: '6.0', after: '7.5', weeks: '10 weeks',
    quote: "I rewrote every essay using Liz's suggestions. By week six, I was catching my own mistakes before the AI did. That's when I knew it was working.",
    name: 'Elif K.', flag: '🇹🇷', loc: 'Istanbul, Turkey',
  },
  {
    before: '6.5', after: '8.0', weeks: '12 weeks',
    quote: 'Lexical Resource was my ceiling. The rewrite feature showed me exactly which phrases sounded "natural" — not just correct.',
    name: 'Priya R.', flag: '🇮🇳', loc: 'Bengaluru, India',
  },
];

function QuoteWithEm({ quote, em }) {
  if (!em) return quote;
  const idx = quote.indexOf(em);
  if (idx === -1) return quote;
  return (
    <>
      {quote.slice(0, idx)}
      <em>{em}</em>
      {quote.slice(idx + em.length)}
    </>
  );
}

export default function Testimonials() {
  return (
    <section className="proof">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Real students · real results</div>
          <h2 className="section-title">Band improvements from real students.</h2>
          <p className="section-sub">
            Average gain after eight weeks of practice, measured on official mock exams.
          </p>
        </div>
        <div className="testimonials">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="t-card">
              <div className="t-bands">
                <div className="band-bubble before">{t.before}</div>
                <div className="t-arrow" aria-hidden="true">→</div>
                <div className="band-bubble after">{t.after}</div>
                <div className="t-weeks">{t.weeks}</div>
              </div>
              <p className="t-quote"><QuoteWithEm quote={t.quote} em={t.quoteEm} /></p>
              <div className="t-person">
                <div className="avatar-ph" aria-hidden="true" />
                <div>
                  <div className="n">{t.name}</div>
                  <div className="loc"><span>{t.flag}</span>{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
