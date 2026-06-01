import React, { useEffect, useState } from 'react';
import { useI18n } from '../../../lib/i18n';
import LanguageSwitcher from '../../../components/LanguageSwitcher';
import BrandLogo from '../../../components/BrandLogo';
import { readAuthUser, dashboardPathFor, initialsFor, firstNameFor } from '../../../lib/authNav';

export default function LandingNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  // Auth-aware: /about + the landing pages are reachable from the dashboard
  // chrome too, so logged-in visitors should see a "Dashboard" pivot instead
  // of Log in / Start free CTAs that imply they're somehow signed out.
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
    <>
      <header className="nav">
        <div className="container nav-inner">
          <BrandLogo size="sm" href={authUser ? dashHref : '/'} className="logo" />
          <nav aria-label="Primary">
            <ul className="nav-links">
              {/* Absolute hashes (/#samples, /#pricing) so the same nav works
                  on /about — bare "#samples" gets appended to the current
                  path (/about#samples) where no such id exists, leaving the
                  click silently dead. Aga 2026-05-23: "samples button calismiyor". */}
              <li><a href="/#samples">{t('landingV2NavSamples')}</a></li>
              <li><a href="/#pricing">{t('landingV2NavPricing')}</a></li>
              <li><a href="/about">{t('landingV2NavAbout')}</a></li>
            </ul>
          </nav>
          <div className="nav-right">
            {/* Desktop shows the language picker inline. On mobile (<900px)
                the select + CTA + hamburger triangle can push the Start
                button off-screen — see the drawer below for the mobile copy. */}
            <span className="desktop-only">
              <LanguageSwitcher compact />
            </span>
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
                <a href="/login?path=ielts" className="btn btn-ghost desktop-only">{t('landingV2NavLogin')}</a>
                <a href="/signup?path=ielts" className="btn btn-primary">{t('landingV2NavStart')}</a>
              </>
            )}
            <button
              type="button"
              className="menu-btn"
              aria-label={t('navMenu')}
              aria-expanded={open}
              aria-controls="landing-mobile-drawer"
              onClick={() => setOpen((v) => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      {/* Drawer MUST be rendered outside <header> because the header has
          `backdrop-filter: blur(...)` which creates a new containing block
          that traps `position: fixed` children to the header's 68px height.
          Rendering as a sibling puts it back on the viewport. */}
      {open && (
        <div
          className="mobile-drawer"
          id="landing-mobile-drawer"
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
              <li><a href="/#samples" onClick={close}>{t('landingV2NavSamples')}</a></li>
              <li><a href="/#pricing" onClick={close}>{t('landingV2NavPricing')}</a></li>
              <li><a href="/about" onClick={close}>{t('landingV2NavAbout')}</a></li>
            </ul>
            <div className="mobile-drawer-lang">
              <LanguageSwitcher />
            </div>
            <div className="mobile-drawer-cta">
              {authUser ? (
                <a href={dashHref} className="btn btn-primary" onClick={close}>
                  Dashboard →
                </a>
              ) : (
                <>
                  <a href="/login?path=ielts" className="btn btn-ghost" onClick={close}>{t('landingV2NavLogin')}</a>
                  <a href="/signup?path=ielts" className="btn btn-primary" onClick={close}>{t('landingV2NavStart')}</a>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
