import React from 'react';
import { useI18n } from '../../../lib/i18n';

/**
 * Anonymous head-to-head comparison block. Sits between HowItWorks and
 * PricingTeaser to anchor the value-prop before the price reveal.
 *
 * Hard constraint (Aga, 2026-05-08): NEVER name competitors. The "without"
 * column describes generic alternatives ("free chatbots", "self-paced
 * courses", "private tutors") — never a brand. Memory: feedback memory
 * `feedback_no_solo_teacher_commitments`.
 */
const ROW_KEYS = [
  { id: 'feedback', without: 'h2hRow1Without', with: 'h2hRow1With' },
  { id: 'memory',   without: 'h2hRow2Without', with: 'h2hRow2With' },
  { id: 'mocks',    without: 'h2hRow3Without', with: 'h2hRow3With' },
  { id: 'speaking', without: 'h2hRow4Without', with: 'h2hRow4With' },
  { id: 'price',    without: 'h2hRow5Without', with: 'h2hRow5With' },
];

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function HeadToHead() {
  const { t } = useI18n();

  return (
    <section className="h2h-section">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">{t('h2hEyebrow')}</div>
          <h2 className="section-title">{t('h2hTitle')}</h2>
          <p className="section-sub">{t('h2hSub')}</p>
        </div>

        <div className="h2h-grid">
          <div className="h2h-col h2h-col-without" aria-labelledby="h2h-without-head">
            <div className="h2h-col-head" id="h2h-without-head">
              <div className="h2h-col-eyebrow">{t('h2hWithoutEyebrow')}</div>
              <div className="h2h-col-title">{t('h2hWithoutTitle')}</div>
            </div>
            <ul className="h2h-list">
              {ROW_KEYS.map((r) => (
                <li key={r.id}>
                  <span className="h2h-bullet h2h-bullet-x" aria-hidden="true">
                    <XIcon />
                  </span>
                  <span className="h2h-text">{t(r.without)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="h2h-divider" aria-hidden="true">
            <span className="h2h-divider-pill">vs</span>
          </div>

          <div className="h2h-col h2h-col-with" aria-labelledby="h2h-with-head">
            <div className="h2h-col-head" id="h2h-with-head">
              <div className="h2h-col-eyebrow">{t('h2hWithEyebrow')}</div>
              <div className="h2h-col-title">{t('h2hWithTitle')}</div>
            </div>
            <ul className="h2h-list">
              {ROW_KEYS.map((r) => (
                <li key={r.id}>
                  <span className="h2h-bullet h2h-bullet-check" aria-hidden="true">
                    <CheckIcon />
                  </span>
                  <span className="h2h-text">{t(r.with)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
