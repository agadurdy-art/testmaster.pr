import React from 'react';
import { useI18n } from '../../../lib/i18n';
import BrandLogo from '../../../components/BrandLogo';

export default function TopBar({ step }) {
  const { t } = useI18n();
  const progress = t('onbStepProgress', { step: String(step) });
  const stepName = t(`onbStepName${step}`);
  return (
    <header className="topbar">
      <div className="topbar-row">
        <BrandLogo size="sm" href="/" className="logo" />
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
