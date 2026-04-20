import React, { useEffect, useState } from 'react';
import { useI18n } from '../../../lib/i18n';
import LanguageSwitcher from '../../../components/LanguageSwitcher';

export default function PricingNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

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
          <button
            type="button"
            className="menu-btn"
            aria-label={t('navMenu')}
            aria-expanded={open}
            aria-controls="pricing-mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div
          className="mobile-drawer"
          id="pricing-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={t('navMenu')}
        >
          <div className="mobile-drawer-backdrop" onClick={close} />
          <div className="mobile-drawer-panel">
            <div className="mobile-drawer-head">
              <span className="logo">
                testmaster<span className="pro">.pro</span>
              </span>
              <button
                type="button"
                className="mobile-drawer-close"
                aria-label={t('navClose')}
                onClick={close}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <ul className="mobile-drawer-links">
              <li><a href="/landing/v2#samples" onClick={close}>{t('pricingV2NavSamples')}</a></li>
              <li><a href="/pricing" onClick={close}>{t('pricingV2NavPricing')}</a></li>
              <li><a href="/blog" onClick={close}>{t('pricingV2NavBlog')}</a></li>
              <li><a href="/about" onClick={close}>{t('pricingV2NavAbout')}</a></li>
            </ul>
            <div className="mobile-drawer-cta">
              <a href="/login" className="btn btn-ghost" onClick={close}>{t('pricingV2NavLogin')}</a>
              <a href="/signup" className="btn btn-primary" onClick={close}>{t('pricingV2NavStart')}</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
