/**
 * BrandLogo
 * ---------
 * Single source of truth for the IELTS Ace brand lockup. Renders the JPEG
 * mark from /brand/ielts-ace-logo.jpg, the "IELTS Ace" wordmark, and a
 * tiny elite-styled "by testmaster.pro" sub line beneath.
 *
 * Drop into any nav/header in place of an ad-hoc logo. Layout is inline-flex
 * so it works inside flex headers without extra wrapper styling.
 *
 * Props:
 *   - size: "sm" (28px mark, default) | "md" (36px mark) — only the mark
 *     scales; the wordmark sizes are tuned per-variant below.
 *   - href: link target (default "/dashboard"). Pass null to render as a span.
 *   - subVariant: "muted" (default, slate-500) | "gold" (amber tone) for
 *     darker backgrounds.
 *   - className: extra classes for the outer anchor/span.
 */
import React from 'react';

const SIZE_TOKENS = {
  sm: { mark: 28, wordmark: 17, sub: 8 },
  md: { mark: 36, wordmark: 20, sub: 9 },
};

export default function BrandLogo({
  size = 'sm',
  href = '/dashboard',
  subVariant = 'muted',
  className = '',
}) {
  const tokens = SIZE_TOKENS[size] || SIZE_TOKENS.sm;
  // iOS-26-ish liquid-glass sub: faint vertical gradient text + low opacity
  // so it reads like a reflection rather than a label. Slightly darker for
  // gold variant on darker backgrounds.
  const subGradient =
    subVariant === 'gold'
      ? 'linear-gradient(180deg, rgba(184,122,24,0.85) 0%, rgba(184,122,24,0.45) 100%)'
      : 'linear-gradient(180deg, rgba(71,85,105,0.70) 0%, rgba(71,85,105,0.30) 100%)';

  const inner = (
    <>
      <img
        src="/brand/ielts-ace-logo.jpg"
        alt=""
        aria-hidden="true"
        style={{
          width: tokens.mark,
          height: tokens.mark,
          borderRadius: 8,
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
      <span
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          lineHeight: 1.05,
        }}
      >
        <span
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 600,
            fontSize: tokens.wordmark,
            letterSpacing: '-0.01em',
            color: 'inherit',
          }}
        >
          IELTS Ace
        </span>
        <span
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 400,
            fontStyle: 'italic',
            fontSize: tokens.sub,
            letterSpacing: '0.01em',
            textTransform: 'lowercase',
            marginTop: 1,
            // iOS 26 liquid-glass reflection effect: clipped gradient text.
            backgroundImage: subGradient,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          }}
        >
          by testmaster.pro
        </span>
      </span>
    </>
  );

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    textDecoration: 'none',
    color: 'inherit',
  };

  if (href === null) {
    return (
      <span className={className} style={baseStyle} data-testid="brand-logo">
        {inner}
      </span>
    );
  }
  return (
    <a
      href={href}
      className={className}
      style={baseStyle}
      aria-label="IELTS Ace home"
      data-testid="brand-logo"
    >
      {inner}
    </a>
  );
}
