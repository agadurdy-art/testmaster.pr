// ActivityCard — verbatim from pages/Profile.js lines 911-974 (Faz1 wave 10).
// Closed-over values arrive as same-named props.
import React from 'react';
import { Award, Trophy } from 'lucide-react';
import { SKILL_TONE } from '../lib';
import { Card, Skeleton, ReadTile } from './primitives';

// ─── Activity ──────────────────────────────────────────────────────────────

export default function ActivityCard({ progress, weakest }) {
  if (!progress) {
    return (
      <Card title="Activity" subtitle="Your testing history at a glance.">
        <Skeleton rows={3} />
      </Card>
    );
  }

  const total = progress.total_tests ?? 0;
  const avg = progress.average_band_score ?? 0;
  const byType = progress.by_type || {};

  return (
    <Card
      title="Activity"
      subtitle={total === 0 ? 'No tests yet — your first one sets the baseline.' : 'Your testing history at a glance.'}
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ReadTile
          label="Total tests"
          value={total}
          icon={<Trophy className="w-3.5 h-3.5" />}
        />
        <ReadTile
          label="Average band"
          value={total > 0 ? avg.toFixed(1) : '—'}
          icon={<Award className="w-3.5 h-3.5" />}
        />
      </div>
      {Object.keys(byType).length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(byType).map(([type, data]) => {
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            const tone = SKILL_TONE[label] || 'var(--primary, 262 70% 50%)';
            return (
              <div
                key={type}
                className="rounded-lg p-2.5 hairline border flex items-center justify-between"
                style={{ borderColor: 'hsl(var(--rule))' }}
              >
                <div>
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: `hsl(${tone})` }}>
                    {label}
                  </div>
                  <div className="text-base font-display" style={{ color: 'hsl(var(--fg))' }}>
                    {data.count} {data.count === 1 ? 'attempt' : 'attempts'}
                  </div>
                </div>
                {data.avg_score > 0 && (
                  <div className="text-sm font-semibold" style={{ color: `hsl(${tone})` }}>
                    {data.avg_score.toFixed(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
