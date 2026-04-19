import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { getUserUsage } from '../lib/api';

/**
 * Compact monthly-usage meter. Renders nothing while loading, renders nothing
 * for unlimited tiers (Achiever / Master) — keeps the Dashboard quiet for users
 * whose meter would never move.
 *
 * Wired to GET /api/users/{userId}/usage (see services/usage_tracking.py).
 */
export default function UsageMeter({ userId, getText, textPrimary, textSecondary, bgCard }) {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getUserUsage(userId);
        if (!cancelled) setUsage(data);
      } catch (_) {
        // fail silently — meter is non-critical chrome
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!usage || !usage.counters) return null;

  const rows = [
    {
      key: 'evaluations',
      label: getText('Evaluations', 'Đánh giá', 'Değerlendirme'),
    },
    { key: 'mocks', label: getText('Mock tests', 'Bài thi thử', 'Deneme Sınavı') },
    {
      key: 'speaking_minutes',
      label: getText('Speaking minutes', 'Phút luyện nói', 'Konuşma Dakikası'),
    },
  ];

  const visibleRows = rows.filter((r) => {
    const c = usage.counters[r.key];
    return c && (!c.unlimited || c.used > 0);
  });

  if (visibleRows.length === 0) return null;

  // If every counter is unlimited we still don't render — this guards against
  // a future admin / master user seeing an empty card.
  const anyQuota = visibleRows.some((r) => !usage.counters[r.key].unlimited);
  if (!anyQuota) return null;

  return (
    <Card className={`p-4 ${bgCard} rounded-2xl mb-6`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold uppercase tracking-wide ${textSecondary}`}>
          {getText('This month', 'Tháng này', 'Bu ay')} · {usage.period}
        </p>
        <span className={`text-xs ${textSecondary}`}>{usage.plan}</span>
      </div>
      <div className="space-y-2">
        {visibleRows.map((row) => {
          const c = usage.counters[row.key];
          const pct = c.unlimited ? 0 : Math.min(100, Math.round((c.used / Math.max(c.quota, 1)) * 100));
          const nearCap = !c.unlimited && pct >= 80;
          return (
            <div key={row.key}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${textPrimary}`}>{row.label}</span>
                <span className={`text-xs ${textSecondary}`}>
                  {c.unlimited
                    ? `${c.used} · ${getText('unlimited', 'không giới hạn', 'sınırsız')}`
                    : `${c.used} / ${c.quota}`}
                </span>
              </div>
              {!c.unlimited && (
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${nearCap ? 'bg-orange-500' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
