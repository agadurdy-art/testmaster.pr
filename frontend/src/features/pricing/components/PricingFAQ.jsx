import React, { useState } from 'react';
import { useI18n } from '../../../lib/i18n';

// Split a translated string on **markdown bold** markers and wrap odd indexes
// in <b>. Keeps copy translatable without shipping rich JSX per locale.
function withBold(str) {
  if (!str) return null;
  const parts = String(str).split(/\*\*(.*?)\*\*/g);
  return parts.map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : p));
}

const TEACHER_EMAIL = 'teachers@testmaster.pro';

export default function PricingFAQ() {
  const [openIdx, setOpenIdx] = useState(-1);
  const { t } = useI18n();

  const items = [
    {
      q: t('pricingV2FaqQ1'),
      a: <>{withBold(t('pricingV2FaqA1'))}</>,
    },
    {
      q: t('pricingV2FaqQ2'),
      a: <>{withBold(t('pricingV2FaqA2'))}</>,
    },
    {
      q: t('pricingV2FaqQ3'),
      a: (
        <>
          {withBold(t('pricingV2FaqA3Pre'))}
          <span className="mono" style={{ color: 'hsl(var(--primary))' }}>
            {TEACHER_EMAIL}
          </span>
          {withBold(t('pricingV2FaqA3Post'))}
        </>
      ),
    },
    {
      q: t('pricingV2FaqQ4'),
      a: <>{withBold(t('pricingV2FaqA4'))}</>,
    },
  ];

  return (
    <section>
      <div className="container">
        <div className="section-head center">
          <div className="section-eyebrow">{t('pricingV2FaqEyebrow')}</div>
          <h2 className="section-title">{t('pricingV2FaqTitle')}</h2>
          <p className="section-sub">
            {t('pricingV2FaqSub')}
          </p>
        </div>
        <div className="faq">
          {items.map((item, idx) => {
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
