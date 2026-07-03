// SubscriptionCard — verbatim from pages/Profile.js lines 515-623 (Faz1 wave 10).
// Closed-over values arrive as same-named props.
import React from 'react';
import { Mic, FileText, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { Card, Skeleton, QuotaTile } from './primitives';

// ─── Subscription card ─────────────────────────────────────────────────────

export default function SubscriptionCard({
  planLabel,
  planTone,
  planExpires,
  writingCounter,
  mockCounter,
  speakingCounter,
  examCredits,
  lizLiveSeconds,
  isGE,
  onChangePlan,
  loading,
}) {
  return (
    <Card
      title="Subscription"
      subtitle={`${planLabel}${planExpires ? ` · renews ${planExpires}` : ''}`}
      action={
        <button
          type="button"
          onClick={onChangePlan}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
          style={{ background: 'hsl(var(--fg))' }}
        >
          {planLabel === 'Free' ? 'Upgrade' : 'Change plan'}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {loading ? (
        <Skeleton rows={2} />
      ) : (
        <>
          {!isGE && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <QuotaTile
                icon={<FileText className="w-4 h-4" />}
                label="Writing evaluations"
                counter={writingCounter}
                accent="violet"
              />
              <QuotaTile
                icon={<Trophy className="w-4 h-4" />}
                label="Mock tests"
                counter={mockCounter}
                accent="amber"
              />
              <QuotaTile
                icon={<Mic className="w-4 h-4" />}
                label="Speaking minutes"
                counter={
                  speakingCounter
                    ? {
                        ...speakingCounter,
                        used: Math.floor((speakingCounter.used || 0) / 60),
                        quota: speakingCounter.unlimited
                          ? null
                          : Math.floor((speakingCounter.quota || 0) / 60),
                        remaining: speakingCounter.unlimited
                          ? null
                          : Math.floor((speakingCounter.remaining || 0) / 60),
                      }
                    : null
                }
                accent="rose"
              />
              {Number(examCredits) > 0 && (
                <QuotaTile
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Exam credits"
                  counter={{ used: 0, quota: examCredits, remaining: examCredits, unlimited: false }}
                  accent="emerald"
                />
              )}
              {Number(lizLiveSeconds) > 0 && (
                <QuotaTile
                  icon={<Mic className="w-4 h-4" />}
                  label="Liz Live"
                  counter={{
                    used: 0,
                    quota: Math.floor(lizLiveSeconds / 60),
                    remaining: Math.floor(lizLiveSeconds / 60),
                    unlimited: false,
                  }}
                  accent="violet"
                />
              )}
            </div>
          )}

          <div className="text-xs text-muted">
            Manage payment, invoices, or cancel via your PayPal account.{' '}
            <a
              href="https://www.paypal.com/myaccount/autopay/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-dotted underline-offset-2"
              style={{ color: 'hsl(var(--primary-ink, 262 70% 40%))' }}
            >
              Manage on PayPal →
            </a>
          </div>
        </>
      )}
    </Card>
  );
}
