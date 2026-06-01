import React from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';

export default function HowItWorks() {
  const { t } = useI18n();

  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">{t('landingV2HowEyebrow')}</div>
          <h2 className="section-title">{t('landingV2HowTitle')}</h2>
          <p className="section-sub">
            {t('landingV2HowSub')}
          </p>
        </div>
        <div className="how-grid">
          <div className="step">
            <span className="num">01</span>
            <div className="ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
              </svg>
            </div>
            <h4>{t('landingV2HowStep1Title')}</h4>
            <p>{t('landingV2HowStep1Body')}</p>
          </div>
          <div className="step">
            <span className="num">02</span>
            <div className="ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
              </svg>
            </div>
            <h4>{t('landingV2HowStep2Title')}</h4>
            <p>{t('landingV2HowStep2Body')}</p>
          </div>
          <div className="step liz-step">
            <span className="num">03</span>
            <div className="ico">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h4>{t('landingV2HowStep3Title')}</h4>
            <p>{t('landingV2HowStep3Body')}</p>
            <div className="liz-tag"><span className="liz-avatar">L</span>{t('landingV2HowLizTag')}</div>
          </div>
        </div>
        <div className="how-cta-row">
          <a href="/signup?path=ielts" className="btn btn-primary btn-xl">
            {t('landingV2HowCta')}
            <ArrowRightIcon size={16} />
          </a>
          <span className="how-cta-note">{t('landingV2HowCtaNote')}</span>
        </div>
      </div>
    </section>
  );
}
