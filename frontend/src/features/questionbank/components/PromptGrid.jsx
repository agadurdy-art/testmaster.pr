import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { T, FONT_DISPLAY, skillIcons } from '../constants';

export default function PromptGrid({
  filteredPrompts,
  skillTab,
  typeFilter,
  hideDone,
  completionStats,
  openSkillModal,
}) {
  const navigate = useNavigate();
  return (
    <div>
      <div style={{
        fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: `hsl(${T.fainter})`, fontWeight: 600, marginBottom: 10,
      }}>
        Prompts · {skillTab.charAt(0).toUpperCase() + skillTab.slice(1)}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 14,
      }}>
        {filteredPrompts.slice(0, 20).map((prompt) => {
          const SkillIcon = skillIcons[skillTab] || BookOpen;
          const accent = {
            writing: T.brand, speaking: T.rose,
            reading: T.sky, listening: T.gold,
          }[skillTab] || T.brand;
          const done = !!(completionStats?.practice?.[skillTab] && completionStats.practice[skillTab] > 0);
          if (hideDone && done) return null;
          // Each prompt card IS an Advanced Mastery module (data
          // source above); deep-link straight into that lesson's
          // active-skill section.
          const handlePromptClick = () => {
            if (prompt.module_number) {
              navigate(`/advanced-mastery?lesson=${prompt.module_number}&focus=${skillTab}`);
              return;
            }
            openSkillModal(skillTab);
          };
          return (
            <button
              key={prompt.id}
              onClick={handlePromptClick}
              data-testid={`d9-prompt-${prompt.id}`}
              style={{
                background: `hsl(${T.surface})`,
                border: `1px solid hsl(${T.border})`,
                borderRadius: 16, padding: 18,
                display: 'flex', flexDirection: 'column', gap: 12,
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 180ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `hsl(${accent} / 0.5)`;
                e.currentTarget.style.boxShadow = '0 4px 16px hsl(220 15% 20% / 0.08)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `hsl(${T.border})`;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `hsl(${accent} / 0.12)`,
                  display: 'grid', placeItems: 'center',
                }}>
                  <SkillIcon style={{ width: 14, height: 14, color: `hsl(${accent})` }} />
                </div>
                <span style={{
                  padding: '3px 9px', borderRadius: 6,
                  background: `hsl(${accent} / 0.12)`, color: `hsl(${accent})`,
                  fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                }}>{skillTab}</span>
                {typeFilter !== 'all' && (
                  <span style={{
                    padding: '3px 9px', borderRadius: 6,
                    background: `hsl(${T.borderSoft})`, color: `hsl(${T.muted})`,
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                  }}>{typeFilter}</span>
                )}
                {done && (
                  <span style={{
                    marginLeft: 'auto',
                    padding: '3px 8px', borderRadius: 999,
                    background: `hsl(${T.brand} / 0.12)`, color: `hsl(${T.brandDark})`,
                    fontSize: 11, fontWeight: 600,
                  }}>✓ Done</span>
                )}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, lineHeight: 1.35, fontWeight: 500, color: `hsl(${T.ink})` }}>
                {prompt.icon ? `${prompt.icon} ` : ''}{prompt.name}
              </div>
              {prompt.description && (
                <div style={{ fontSize: 13, color: `hsl(${T.muted})`, lineHeight: 1.4 }}>
                  {prompt.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
