import React from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';

export default function PricingTeaser() {
  const { t } = useI18n();

  return (
    <section id="pricing" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="price-teaser">
          <div>
            <div className="headline-sm">
              {t('landingV2PriceStartsAt')} <span className="amt">$2.99</span>{t('landingV2PriceTrailing')}
            </div>
            <div className="sub-sm">
              {t('landingV2PriceSub')}
            </div>
            <span className="compare-chip">{t('landingV2PriceCompare')}</span>
          </div>
          <a href="/pricing" className="btn btn-outline btn-lg">
            {t('landingV2PriceCta')}
            <ArrowRightIcon size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
