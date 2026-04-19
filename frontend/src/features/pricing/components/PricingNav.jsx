import React from 'react';
import { useI18n } from '../../../lib/i18n';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function PricingNav() {
  const { t } = useI18n();

  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="/landing/v2" className="logo">
          testmaster<span className="pro">.pro</span>
        </a>
        <nav aria-label="Primary">
          <ul className="nav-links">
            <li><a href="/landing/v2#samples">{t('pricingV2NavSamples')}</a></li>
            <li><a href="/pricing" aria-current="page">{t('pricingV2NavPricing')}</a></li>
            <li><a href="/blog">{t('pricingV2NavBlog')}</a></li>
            <li><a href="/about">{t('pricingV2NavAbout')}</a></li>
          </ul>
        </nav>
        <div className="nav-right">
          <LanguageSwitcher compact />
          <a href="/login" className="btn btn-ghost desktop-only">{t('pricingV2NavLogin')}</a>
          <a href="/signup" className="btn btn-primary">{t('pricingV2NavStart')}</a>
          <button type="button" className="menu-btn" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
