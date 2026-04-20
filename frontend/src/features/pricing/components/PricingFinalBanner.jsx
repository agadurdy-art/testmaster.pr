import React from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';

export default function PricingFinalBanner() {
  const { t } = useI18n();
  return (
    <section style={{ paddingTop: 16 }}>
      <div className="container">
        <div className="final-banner">
          <div className="fb-text">
            <h3>
              {t('pricingV2FinalTitlePre')}{' '}
              <span className="em">{t('pricingV2FinalTitleEm')}</span>
            </h3>
            <p>
              {t('pricingV2FinalBody')}
            </p>
          </div>
          <a href="/samples/writing/band-6-5-task2" className="btn btn-primary btn-xl">
            {t('pricingV2FinalCta')}
            <ArrowRightIcon />
          </a>
        </div>
      </div>
    </section>
  );
}
