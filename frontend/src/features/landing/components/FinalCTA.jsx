import React from 'react';
import { useI18n } from '../../../lib/i18n';
import ArrowRightIcon from './ArrowRightIcon';

export default function FinalCTA() {
  const { t } = useI18n();

  return (
    <section className="final">
      <div className="container final-inner">
        <h2>
          {t('landingV2FinalTitleA')} <span className="em">{t('landingV2FinalTitleEm')}</span>{' '}
          {t('landingV2FinalTitleB')}
        </h2>
        <p>{t('landingV2FinalSub')}</p>
        <a href="/samples/writing/band-6-5-task2" className="btn btn-primary btn-xl">
          {t('landingV2FinalCta')}
          <ArrowRightIcon size={16} />
        </a>
      </div>
    </section>
  );
}
