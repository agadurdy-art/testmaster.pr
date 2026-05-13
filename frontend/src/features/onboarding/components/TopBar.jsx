import React from 'react';
import { useI18n } from '../../../lib/i18n';
import BrandLogo from '../../../components/BrandLogo';

export default function TopBar({ step, path }) {
  const { t } = useI18n();
  const progress = t('onbStepProgress', { step: String(step) });
  const stepName = t(`onbStepName${step}`);
  const brandVariant = path === 'general' ? 'general' : 'ielts';
  return (
    <header className="topbar">
      <div className="topbar-row">
        <BrandLogo size="sm" href="/" className="logo" variant={brandVariant} />
        <div className="step-label">
          {progress} · <span>{stepName}</span>
        </div>
      </div>
      <div className="progress-track">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${step * 20}%` }}
          />
        </div>
      </div>
    </header>
  );
}
