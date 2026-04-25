import { useEffect } from 'react';

/**
 * iOS 26-style interaction layer, scoped to a container ref.
 *
 * - Float-on-click: any card matching FLOAT_SELECTOR lifts 8px + 1.015 scale
 *   for 480ms when the user clicks anywhere on it (except on a button/link).
 * - Ripple-on-press: any .btn emits a radial-gradient ripple at the pointer
 *   origin, scaling out to ~14x over 700ms. Outline/ghost buttons get a dark
 *   ripple tinted with the primary color.
 *
 * Honors `prefers-reduced-motion` by skipping the ripple and float lift.
 */

const FLOAT_SELECTOR = '.path-card, .report, .t-card, .step, .price-teaser, .band-pill';

export default function useLiquidGlass(ref) {
  useEffect(() => {
    const root = ref?.current;
    if (!root) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Tag all floatable cards.
    const floatables = root.querySelectorAll(FLOAT_SELECTOR);
    floatables.forEach((el) => el.classList.add('float-click'));

    const onClick = (e) => {
      if (prefersReduced) return;
      const card = e.target.closest(FLOAT_SELECTOR);
      if (!card || !root.contains(card)) return;
      if (e.target.closest('.btn, a')) return;
      card.classList.add('is-floating');
      clearTimeout(card._floatT);
      card._floatT = setTimeout(() => card.classList.remove('is-floating'), 480);
    };

    const onPointerDown = (e) => {
      if (prefersReduced) return;
      const btn = e.target.closest('.btn');
      if (!btn || !root.contains(btn)) return;
      const rect = btn.getBoundingClientRect();
      const r = document.createElement('span');
      const isDark =
        btn.classList.contains('btn-outline') || btn.classList.contains('btn-ghost');
      r.className = 'ripple' + (isDark ? ' ripple-dark' : '');
      const size = Math.max(rect.width, rect.height);
      r.style.width = `${size}px`;
      r.style.height = `${size}px`;
      r.style.left = `${e.clientX - rect.left}px`;
      r.style.top = `${e.clientY - rect.top}px`;
      btn.appendChild(r);
      setTimeout(() => r.remove(), 700);

      btn.style.transform = 'translateY(1px) scale(0.985)';
      const release = () => {
        btn.style.transform = '';
        btn.removeEventListener('pointerup', release);
        btn.removeEventListener('pointerleave', release);
      };
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointerleave', release);
    };

    root.addEventListener('click', onClick);
    root.addEventListener('pointerdown', onPointerDown);

    return () => {
      root.removeEventListener('click', onClick);
      root.removeEventListener('pointerdown', onPointerDown);
      floatables.forEach((el) => {
        el.classList.remove('float-click', 'is-floating');
        clearTimeout(el._floatT);
      });
    };
  }, [ref]);
}
