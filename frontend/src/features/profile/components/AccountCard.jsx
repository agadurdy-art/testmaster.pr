// AccountCard — verbatim from pages/Profile.js lines 976-1049 (Faz1 wave 10).
// Closed-over values arrive as same-named props.
import React from 'react';
import { Copy, Check, LogOut } from 'lucide-react';
import { Card, Row } from './primitives';

// ─── Account ───────────────────────────────────────────────────────────────

export default function AccountCard({
  userId,
  copied,
  onCopy,
  quotaPeriod,
  onLogout,
  onSendPasswordReset,
  sendingReset,
  onRequestDelete,
}) {
  return (
    <Card title="Account" subtitle="Identity and session.">
      <Row label="User ID">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md hairline border hover:bg-black/[0.03]"
          style={{ borderColor: 'hsl(var(--rule))' }}
          title="Copy user ID"
        >
          <span className="truncate max-w-[160px]">{userId}</span>
          {copied ? (
            <Check className="w-3 h-3" style={{ color: 'hsl(155 70% 40%)' }} />
          ) : (
            <Copy className="w-3 h-3 opacity-60" />
          )}
        </button>
      </Row>
      {quotaPeriod && (
        <Row label="Quota period">
          <span className="text-xs" style={{ color: 'hsl(var(--fg))' }}>{quotaPeriod}</span>
        </Row>
      )}
      <Row label="Change password">
        <button
          type="button"
          onClick={onSendPasswordReset}
          disabled={sendingReset}
          className="text-xs font-semibold px-3 py-1.5 rounded-full hairline border hover:bg-black/[0.03] disabled:opacity-50"
          style={{ borderColor: 'hsl(var(--rule))' }}
        >
          {sendingReset ? 'Sending…' : 'Email me a reset link'}
        </button>
      </Row>
      <Row label="Delete account">
        <button
          type="button"
          onClick={onRequestDelete}
          className="text-xs underline decoration-dotted underline-offset-2"
          style={{ color: 'hsl(var(--muted-fg))' }}
        >
          Email support
        </button>
      </Row>
      <div className="pt-4 mt-4 border-t" style={{ borderColor: 'hsl(var(--rule))' }}>
        <button
          type="button"
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg hairline border"
          style={{
            borderColor: 'hsl(347 80% 86%)',
            color: 'hsl(347 76% 40%)',
            background: 'hsl(347 89% 98%)',
          }}
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </Card>
  );
}
