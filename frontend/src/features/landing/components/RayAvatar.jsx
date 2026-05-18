import React from 'react';
import { RAY_AVATAR_URL } from '../../../lib/brand';

/**
 * Ray avatar — round portrait for GE (General English) surfaces.
 * Mirrors LizAvatar's API exactly so callers can swap the two by name.
 *
 * Props:
 *   size  — number in px (width/height). Default 40.
 *   alt   — override the alt text. Default "Ray".
 *   ring  — if true, wraps the avatar in a soft ring halo.
 *   className — extra class to compose with.
 */
export default function RayAvatar({ size = 40, alt = 'Ray', ring = false, className = '' }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    background:
      'linear-gradient(135deg, hsl(260 70% 65%), hsl(35 95% 60%))',
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
  const wrapperClass = `liz-avatar ray-avatar ${ring ? 'liz-avatar--ring' : ''} ${className}`.trim();
  return (
    <span className={wrapperClass} style={style} aria-hidden={alt ? undefined : true}>
      <img src={RAY_AVATAR_URL} alt={alt} style={imgStyle} loading="lazy" />
    </span>
  );
}
