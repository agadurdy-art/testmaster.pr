// IdentityCard — verbatim from pages/Profile.js lines 420-513 (Faz1 wave 10).
// Closed-over values arrive as same-named props.
import React from 'react';
import { Mail, Crown, Shield } from 'lucide-react';
import { initialsOf } from '../lib';

// ─── Identity card ─────────────────────────────────────────────────────────

export default function IdentityCard({
  userName,
  userEmail,
  isAdmin,
  memberSince,
  planLabel,
  planTone,
  planExpires,
}) {
  return (
    <section
      className="rounded-2xl p-6 md:p-8 hairline border"
      style={{
        borderColor: 'hsl(var(--rule))',
        background: 'hsl(var(--surface) / 0.7)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
      }}
    >
      <div className="flex items-start gap-5 md:gap-7 flex-wrap">
        <div
          className="flex items-center justify-center font-display rounded-full text-white"
          style={{
            width: 88,
            height: 88,
            background: 'linear-gradient(135deg, hsl(262 70% 50%) 0%, hsl(217 80% 50%) 100%)',
            fontSize: 32,
            letterSpacing: '0.02em',
          }}
          aria-hidden="true"
        >
          {initialsOf(userName, userEmail)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="font-display text-[28px] md:text-[32px] leading-none"
              style={{ color: 'hsl(var(--fg))' }}
              data-lang-sample
            >
              {userName}
            </h2>
            {isAdmin && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full"
                style={{
                  background: 'hsl(262 90% 96%)',
                  color: 'hsl(262 70% 40%)',
                  border: '1px solid hsl(262 80% 88%)',
                }}
              >
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          <div
            className="mt-2 flex items-center gap-2 text-sm"
            style={{ color: 'hsl(var(--muted-fg))' }}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{userEmail}</span>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{
                background: planTone.bg,
                color: planTone.fg,
                border: `1px solid ${planTone.border}`,
              }}
            >
              <Crown className="w-3 h-3" /> {planLabel} plan
            </span>
            {planExpires && (
              <span className="text-xs text-muted">
                Renews / expires <strong>{planExpires}</strong>
              </span>
            )}
            {memberSince && (
              <span className="text-xs text-muted ml-auto">
                Member since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
