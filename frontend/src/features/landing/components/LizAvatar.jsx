import React from 'react';
import { LIZ_AVATAR_URL } from '../../../lib/brand';

/**
 * Liz avatar — round portrait with a gradient fallback background so we still
 * render nicely while the image is loading (or if it 404s).
 *
 * Props:
 *   size  — number in px (width/height). Default 40.
 *   alt   — override the alt text. Default "Liz".
 *   ring  — if true, wraps the avatar in a soft ring halo.
 *   className — extra class to compose with.
 */
export default function LizAvatar({ size = 40, alt = 'Liz', ring = false, className = '' }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, hsl(199 89% 60%), hsl(260 55% 62%))',
    display: 'inline-block',
    overflow: 'hidden',
    flexShrink: 0,
  };
  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };
  const wrapperClass = `liz-avatar ${ring ? 'liz-avatar--ring' : ''} ${className}`.trim();
  return (
    <span className={wrapperClass} style={style} aria-hidden={alt ? undefined : true}>
      <img src={LIZ_AVATAR_URL} alt={alt} style={imgStyle} loading="lazy" />
    </span>
  );
}
