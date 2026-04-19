import { useEffect } from 'react';

/**
 * iOS 26-style interaction layer, scoped to a container ref — pricing variant.
 *
 * - Float-on-click on plan cards, compare rows, and FAQ items.
 * - Ripple-on-press on any .btn.
 * - Respects prefers-reduced-motion.
 */

const FLOAT_SELECTOR = '.plan, .faq-item, .pay-method, .region-callout, .final-banner';

export default function useLiquidGlass(ref) {
  useEffect(() => {
    const root = ref?.current;
    if (!root) return undefined;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const floatables = root.querySelectorAll(FLOAT_SELECTOR);
    floatables.forEach((el) => el.classList.add('float-click'));

    const onClick = (e) => {
      if (prefersReduced) return;
      const card = e.target.closest(FLOAT_SELECTOR);
      if (!card || !root.contains(card)) return;
      if (e.target.closest('.btn, a, button, input')) return;
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
