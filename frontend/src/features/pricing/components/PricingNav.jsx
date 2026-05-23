import React, { useEffect, useState } from 'react';
import { useI18n } from '../../../lib/i18n';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import BrandLogo from '../../../components/BrandLogo';
import { readAuthUser, dashboardPathFor, initialsFor, firstNameFor } from '../../../lib/authNav';

export default function PricingNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // Read auth state once per mount. /pricing is reachable both from the
  // dashboard TopBar (logged-in funnel) and from the marketing landing
  // (logged-out funnel); a single shell with a Log in / Start free pair
  // makes the logged-in visitor feel kicked back to the landing page.
  // Aga 2026-05-23: "biri login olduktan sonra landpage degil icerde
  // islerini halledebilmeli".
  const authUser = readAuthUser();
  const dashHref = dashboardPathFor(authUser);

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
        {/* Logo points back to the user's dashboard once they're signed in
            so the brand mark behaves like the dashboard TopBar logo, not a
            "leave to landing" trap. */}
        <BrandLogo size="sm" href={authUser ? dashHref : '/'} className="logo" />
        <nav aria-label="Primary">
          <ul className="nav-links">
            <li><a href="/#samples">{t('pricingV2NavSamples')}</a></li>
            <li><a href="/pricing" aria-current="page">{t('pricingV2NavPricing')}</a></li>
            <li><a href="/about">{t('pricingV2NavAbout')}</a></li>
          </ul>
        </nav>
        <div className="nav-right">
          <LanguageSwitcher compact />
          {authUser ? (
            <a
              href={dashHref}
              className="btn btn-ghost desktop-only inline-flex items-center gap-2"
              aria-label={`Back to dashboard (${firstNameFor(authUser) || 'profile'})`}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: 'rgba(124, 58, 237, 0.15)',
                  color: '#5b21b6',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {initialsFor(authUser)}
              </span>
              Dashboard
            </a>
          ) : (
            <>
              <a href="/login" className="btn btn-ghost desktop-only">{t('pricingV2NavLogin')}</a>
              <a href="/signup" className="btn btn-primary">{t('pricingV2NavStart')}</a>
            </>
          )}
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
              <BrandLogo size="sm" href={null} className="logo" />
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
              <li><a href="/#samples" onClick={close}>{t('pricingV2NavSamples')}</a></li>
              <li><a href="/pricing" onClick={close}>{t('pricingV2NavPricing')}</a></li>
              <li><a href="/about" onClick={close}>{t('pricingV2NavAbout')}</a></li>
            </ul>
            <div className="mobile-drawer-cta">
              {authUser ? (
                <a href={dashHref} className="btn btn-primary" onClick={close}>
                  Dashboard →
                </a>
              ) : (
                <>
                  <a href="/login" className="btn btn-ghost" onClick={close}>{t('pricingV2NavLogin')}</a>
                  <a href="/signup" className="btn btn-primary" onClick={close}>{t('pricingV2NavStart')}</a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
