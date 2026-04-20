import React from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';

export default function DualPathCards() {
  const { t } = useI18n();
  return (
    <section>
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">{t('landingV2PathsEyebrow')}</div>
          <h2 className="section-title">{t('landingV2PathsTitle')}</h2>
          <p className="section-sub">
            {t('landingV2PathsSub')}
          </p>
        </div>
        <div className="paths">
          <PathCard
            variant="a"
            hint={t('landingV2PathAHint')}
            badge="IELTS Ace"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 10L12 4 2 10l10 6 10-6z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            }
            title={t('landingV2PathATitle')}
            desc={t('landingV2PathADesc')}
            features={[
              t('landingV2PathAFeat1'),
              t('landingV2PathAFeat2'),
              t('landingV2PathAFeat3'),
              t('landingV2PathAFeat4'),
            ]}
            ctaLabel={t('landingV2PathACta')}
            ctaClass="btn btn-primary btn-lg"
            ctaHref="/signup?path=ielts"
            lizBubble={t('landingV2PathALiz')}
          />
          <PathCard
            variant="b"
            hint={t('landingV2PathBHint')}
            badge="General English"
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h7a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-7a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h8z" />
              </svg>
            }
            title={t('landingV2PathBTitle')}
            desc={t('landingV2PathBDesc')}
            features={[
              t('landingV2PathBFeat1'),
              t('landingV2PathBFeat2'),
              t('landingV2PathBFeat3'),
              t('landingV2PathBFeat4'),
            ]}
            ctaLabel={t('landingV2PathBCta')}
            ctaClass="btn btn-secondary btn-lg"
            ctaHref="/signup?path=general"
            lizBubble={t('landingV2PathBLiz')}
          />
        </div>
      </div>
    </section>
  );
}

function PathCard({ variant, hint, badge, icon, title, desc, features, ctaLabel, ctaClass, ctaHref, lizBubble }) {
  return (
    <div className={`path-card ${variant}`}>
      <div className="badge">
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <circle cx="5" cy="5" r="5" fill="currentColor" />
        </svg>
        {badge}
      </div>
      {hint && <div className="path-hint">{hint}</div>}
      <div className="path-icon">{icon}</div>
      <h3>{title}</h3>
      <p className="desc">{desc}</p>
      <ul className="feat-list">
        {features.map((f) => (
          <li key={f}><span className="fcheck">✓</span>{f}</li>
        ))}
      </ul>
      <a href={ctaHref} className={ctaClass}>
        {ctaLabel}
        <ArrowRightIcon size={14} />
      </a>
      <div className="liz-peek">
        <div className="liz-bubble">
          <span className="liz-avatar" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }}>L</span>
          {lizBubble}
        </div>
      </div>
    </div>
  );
}
