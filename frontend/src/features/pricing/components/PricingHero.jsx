import React from 'react';
import { useI18n } from '../../../lib/i18n';

export default function PricingHero({ days }) {
  const { t } = useI18n();
  const dayCount = typeof days === 'number' ? days : 30;
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="eyebrow">
          <span className="dot"></span>
          {t('pricingV2HeroEyebrowA')}
          <span className="sep">·</span>
          <span>{t('pricingV2HeroEyebrowB')}</span>
        </div>
        <h1 className="headline">
          {t('pricingV2HeroTitleA')} <span className="under">{t('pricingV2HeroTitleB')}</span>
        </h1>
        <p className="hero-sub">
          {t('pricingV2HeroSubA')} <span className="days">{t('pricingV2HeroSubDays', { days: dayCount })}</span>{t('pricingV2HeroSubB', { days: dayCount })}
        </p>
      </div>
    </section>
  );
}
