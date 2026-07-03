import React from 'react';
import { BookMarked, Zap, X } from 'lucide-react';
import { T, FONT_DISPLAY } from '../constants';

export default function CompletionBreakdown({ completionStats, setShowCompletionDetail }) {
  return (
    <div style={{
      background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})`,
      borderRadius: 16, padding: 18, marginBottom: 22,
      boxShadow: `0 4px 16px hsl(220 15% 20% / 0.06)`,
    }} data-testid="completion-breakdown">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 600, margin: 0 }}>Completion Breakdown</h3>
        <button onClick={() => setShowCompletionDetail(false)} style={{ background: 'none', border: 0, color: `hsl(${T.muted})`, cursor: 'pointer', padding: 4 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
        {[
          { key: 'cambridge', label: 'Cambridge', icon: BookMarked, accent: T.sky },
          { key: 'ai_academic', label: 'AI Academic', icon: Zap, accent: T.brand },
          { key: 'ai_general', label: 'AI General', icon: Zap, accent: T.gold },
        ].map(({ key, label, icon: Icon, accent }) => {
          const c = completionStats[key];
          const pct = c?.total ? (c.completed / c.total) * 100 : 0;
          return (
            <div key={key} style={{
              padding: 12, borderRadius: 10,
              background: `hsl(${T.borderSoft})`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Icon style={{ width: 14, height: 14, color: `hsl(${accent})` }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: `hsl(${T.muted})` }}>{label}</span>
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600 }}>{c?.completed || 0}/{c?.total || 0}</div>
              <div style={{ marginTop: 6, width: '100%', background: `hsl(${T.border})`, borderRadius: 999, height: 4 }}>
                <div style={{ background: `hsl(${accent})`, height: 4, borderRadius: 999, width: `${pct}%`, transition: 'width 250ms' }} />
              </div>
            </div>
          );
        })}
      </div>
      {completionStats.practice && Object.keys(completionStats.practice).length > 0 && (
        <div style={{ borderTop: `1px solid hsl(${T.border})`, paddingTop: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: `hsl(${T.fainter})`, letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Practice Sessions
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {Object.entries(completionStats.practice).map(([skill, count]) => (
              <span key={skill} style={{
                background: `hsl(${T.borderSoft})`, padding: '4px 10px', borderRadius: 999,
                fontSize: 12, fontWeight: 500, color: `hsl(${T.muted})`,
              }}>
                {skill.charAt(0).toUpperCase() + skill.slice(1)}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
      {completionStats.total_full_completed === 0 && Object.keys(completionStats.practice || {}).length === 0 && (
        <p style={{ fontSize: 12, color: `hsl(${T.fainter})`, textAlign: 'center', margin: 0 }}>
          No tests completed yet. Start practicing to see your progress!
        </p>
      )}
    </div>
  );
}
