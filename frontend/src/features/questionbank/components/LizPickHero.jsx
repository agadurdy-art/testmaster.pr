import React from 'react';
import LizAvatar from '../../landing/components/LizAvatar';
import { T, FONT_DISPLAY } from '../constants';

export default function LizPickHero({ lizPickTopic, weakestSkill, setSkillTab, openSkillModal }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: 18, borderRadius: 24,
      background: `linear-gradient(135deg, hsl(${T.brand} / 0.10), hsl(${T.sky} / 0.10))`,
      border: `1px solid hsl(${T.brand} / 0.22)`,
      marginBottom: 22,
      flexWrap: 'wrap',
    }}>
      <div style={{
        width: 54, height: 54, flex: '0 0 54px',
        borderRadius: '50%',
        boxShadow: `0 4px 14px hsl(${T.brand} / 0.3)`,
        overflow: 'hidden',
      }}>
        <LizAvatar size={54} alt="Liz" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, color: `hsl(${T.brandDark})` }}>
          Liz's pick for you
        </div>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600, margin: '2px 0 4px' }}>
          {lizPickTopic.icon ? `${lizPickTopic.icon} ` : ''}{lizPickTopic.name}
        </h3>
        <p style={{ margin: 0, color: `hsl(${T.ink} / 0.75)`, fontSize: 14 }}>
          {weakestSkill.charAt(0).toUpperCase() + weakestSkill.slice(1)} ·{' '}
          <em style={{ color: `hsl(${T.muted})`, fontStyle: 'normal' }}>
            chosen because your last sessions skipped {weakestSkill} — let's fix that
          </em>
        </p>
      </div>
      <button
        onClick={() => { setSkillTab(weakestSkill); openSkillModal(weakestSkill); }}
        style={{
          padding: '10px 18px', borderRadius: 10,
          background: `hsl(${T.brand})`, color: 'white',
          fontWeight: 600, fontSize: 13, border: 0, cursor: 'pointer',
        }}
      >
        Start now →
      </button>
    </div>
  );
}
