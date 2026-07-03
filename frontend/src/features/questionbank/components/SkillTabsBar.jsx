import React from 'react';
import { BookOpen, Headphones, PenTool, Mic, Award } from 'lucide-react';
import { T } from '../constants';

export default function SkillTabsBar({ stats, activeTab, skillTab, setActiveTab, setSkillTab, setTypeFilter }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
      <div style={{
        display: 'inline-flex', gap: 4,
        padding: 6, borderRadius: 20,
        background: 'hsl(210 40% 97%)',
        border: '1px solid hsl(210 30% 92%)',
        boxShadow: '0 1px 2px hsl(210 30% 50% / 0.04)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        maxWidth: '100%', overflowX: 'auto',
      }}>
        {[
          { id: 'writing', label: 'Writing', icon: PenTool, count: stats?.by_skill?.writing, suffix: 'prompts' },
          { id: 'speaking', label: 'Speaking', icon: Mic, count: stats?.by_skill?.speaking, suffix: 'prompts' },
          { id: 'reading', label: 'Reading', icon: BookOpen, count: stats?.by_skill?.reading, suffix: 'prompts' },
          { id: 'listening', label: 'Listening', icon: Headphones, count: stats?.by_skill?.listening, suffix: 'prompts' },
          { id: 'fulltests', label: 'Full Tests', icon: Award, subtitle: 'Cambridge + AI' },
        ].map(tab => {
          const Icon = tab.icon;
          const isFullTests = tab.id === 'fulltests';
          const selected = isFullTests ? activeTab === 'tests' : (activeTab !== 'tests' && skillTab === tab.id);
          return (
            <button
              key={tab.id}
              data-testid={`d9-tab-${tab.id}`}
              onClick={() => {
                if (isFullTests) {
                  setActiveTab('tests');
                  return;
                }
                setActiveTab('overview');
                setSkillTab(tab.id);
                setTypeFilter('all');
              }}
              style={{
                padding: '10px 18px',
                borderRadius: 14,
                fontSize: 15, fontWeight: selected ? 600 : 500,
                color: selected ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                background: selected ? 'white' : 'transparent',
                border: selected ? '1px solid hsl(210 30% 90%)' : '1px solid transparent',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                whiteSpace: 'nowrap',
                boxShadow: selected ? '0 1px 3px hsl(210 30% 50% / 0.10), 0 0 0 1px hsl(210 30% 95%)' : 'none',
                transition: 'all 180ms ease',
              }}
            >
              <Icon style={{ width: 15, height: 15 }} strokeWidth={selected ? 2 : 1.8} /> {tab.label}
              {tab.subtitle && (
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: `hsl(${T.muted})`,
                  marginLeft: 2,
                }}>
                  {tab.subtitle}
                </span>
              )}
              {tab.count != null && tab.count > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '2px 8px', borderRadius: 999,
                  background: selected ? `hsl(${T.brand} / 0.12)` : `hsl(210 30% 92%)`,
                  color: selected ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                }}>
                  {tab.count} {tab.suffix}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
