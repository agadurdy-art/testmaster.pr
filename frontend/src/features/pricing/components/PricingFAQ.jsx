import React, { useState } from 'react';

const ITEMS = [
  {
    q: 'Can I switch plans later?',
    a: (
      <>
        Yes — switch or cancel any time from your dashboard. If you upgrade
        mid-cycle, we <b>pro-rate the difference</b> so you never pay twice for
        the same day. Downgrades take effect at the end of your current period.
      </>
    ),
  },
  {
    q: 'What happens after my exam pack ends?',
    a: (
      <>
        Your pack simply stops — <b>no auto-renewal, no surprise charge</b>.
        You'll keep read-only access to every report you generated, so you can
        review your feedback history even after the pack expires. Need more
        days? Buy another pack or switch to Weekly.
      </>
    ),
  },
  {
    q: 'Do you offer teacher discounts?',
    a: (
      <>
        We do. Teachers managing <b>5+ students</b> get a classroom dashboard,
        bulk evaluations, and 30% off Monthly. Email{' '}
        <span
          className="mono"
          style={{ color: 'hsl(var(--primary))' }}
        >
          teachers@testmaster.pro
        </span>{' '}
        with your school or center and we'll set you up within 24 hours.
      </>
    ),
  },
  {
    q: 'Is my essay data private?',
    a: (
      <>
        Your essays are <b>yours</b>. We never train on student submissions.
        Evaluation happens in a short-lived context and is deleted once your
        report is generated. You can export or wipe your full history from
        Settings → Data at any time.
      </>
    ),
  },
];

export default function PricingFAQ() {
  const [openIdx, setOpenIdx] = useState(-1);

  return (
    <section>
      <div className="container">
        <div className="section-head center">
          <div className="section-eyebrow">FAQ</div>
          <h2 className="section-title">Still wondering?</h2>
          <p className="section-sub">
            The four things most students ask before paying.
          </p>
        </div>
        <div className="faq">
          {ITEMS.map((item, idx) => {
            const open = openIdx === idx;
            return (
              <div key={idx} className={`faq-item${open ? ' open' : ''}`}>
                <button
                  type="button"
                  className="faq-q"
                  aria-expanded={open}
                  onClick={() => setOpenIdx(open ? -1 : idx)}
                >
                  {item.q}
                  <span className="faq-plus">+</span>
                </button>
                <div className="faq-a">{item.a}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
