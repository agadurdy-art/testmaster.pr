import React, { useEffect, useState } from 'react';

/**
 * Global listener for `testmaster:quota-exceeded` events dispatched by the
 * api.js axios interceptor. Shows a blocking modal with an upgrade CTA when
 * a 402 quota_exceeded response comes back from the backend.
 *
 * Mount once near the app root (App.js).
 */
export default function QuotaExceededModal() {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    const onQuota = (ev) => setDetail(ev.detail || {});
    window.addEventListener('testmaster:quota-exceeded', onQuota);
    return () => window.removeEventListener('testmaster:quota-exceeded', onQuota);
  }, []);

  if (!detail) return null;

  const close = () => setDetail(null);
  const upgradeHref = detail.upgrade_url || '/pricing';
  const counterLabel =
    {
      evaluations: 'evaluations',
      mocks: 'mock tests',
      speaking_minutes: 'speaking minutes',
    }[detail.counter] || detail.counter;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          color: '#111',
          borderRadius: 16,
          maxWidth: 440,
          width: '100%',
          padding: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', marginBottom: 8 }}>
          Monthly limit reached
        </div>
        <h2 style={{ fontSize: 22, margin: '0 0 12px', lineHeight: 1.25 }}>
          You've used all your {counterLabel} this month
        </h2>
        <p style={{ color: '#4b5563', fontSize: 14, margin: '0 0 20px' }}>
          {`${detail.used ?? 0} of ${detail.quota ?? '—'} used for ${detail.period || 'this period'}.`}
          &nbsp;Upgrade to keep practicing without interruption.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={close}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              borderRadius: 10,
              border: '1px solid #e5e7eb',
              background: '#fff',
              color: '#111',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Not now
          </button>
          <a
            href={upgradeHref}
            onClick={close}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              borderRadius: 10,
              background: '#111',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            View plans
          </a>
        </div>
      </div>
    </div>
  );
}
