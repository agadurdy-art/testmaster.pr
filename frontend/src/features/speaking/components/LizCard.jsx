import React from 'react';
import LizAvatar from '../../landing/components/LizAvatar';

/**
 * Reusable violet Liz card. Three variants:
 *   variant="suggestion" — small, on Part Selector
 *   variant="coach"      — large, on Results
 */
export default function LizCard({ variant = 'suggestion', children, actions }) {
  if (variant === 'suggestion') {
    return (
      <div
        className="sp-liz-card"
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          maxWidth: 360,
        }}
      >
        <LizAvatar size={36} className="sp-liz-avatar" />

        <div style={{ fontSize: 13.5, lineHeight: 1.4, color: 'var(--sp-liz-700)' }}>
          <span className="sp-liz-meta">Liz · suggestion</span>
          <br />
          <span style={{ fontSize: 14, color: 'hsl(262 40% 28%)' }}>{children}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="sp-liz-card"
      style={{
        marginTop: 32,
        padding: 28,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
      }}
    >
      <LizAvatar size={48} className="sp-liz-avatar" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="sp-liz-meta">Liz · your AI IELTS coach</span>
          <span style={{ fontSize: 11, color: 'var(--sp-muted-fg)' }}>· 2 seconds ago</span>
        </div>
        <p
          className="sp-font-display"
          style={{
            fontSize: 22,
            lineHeight: 1.35,
            marginTop: 8,
            color: 'hsl(262 50% 25%)',
          }}
        >
          {children}
        </p>
        {actions && (
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
