// Extracted verbatim from pages/Progress.js (Faz1 refactor).
import React from 'react';
import {
  BookOpen, Headphones, Mic, PenTool, Target, Calendar, ChevronRight, CheckCircle,
} from 'lucide-react';
import { T, FONT_DISPLAY } from '../constants';

export default function AttemptRow({ attempt, formatDate, onClick }) {
  const skillIconFor = {
    reading: BookOpen, listening: Headphones, writing: PenTool, speaking: Mic,
  };
  const Icon = skillIconFor[attempt.test_type] || Target;
  const band = attempt.band_score || 0;
  const accent = band >= 7 ? T.brand : band >= 5 ? T.gold : T.rose;

  // Feedback preview from existing payload shape
  const feedback = attempt.feedback || {};
  let preview = '';
  if (attempt.test_type === 'writing') {
    const t1 = feedback.task1?.overall_feedback || '';
    const t2 = feedback.task2?.overall_feedback || '';
    preview = (t2 || t1).substring(0, 140);
    if (preview.length === 140) preview += '…';
  } else if (attempt.test_type === 'speaking' && feedback.speaking_feedback) {
    const first = Object.values(feedback.speaking_feedback)[0];
    preview = (first?.feedback || '').substring(0, 140);
    if (preview.length === 140) preview += '…';
  } else if (feedback.teacher_feedback?.short) {
    preview = feedback.teacher_feedback.short.substring(0, 140);
    if (preview.length === 140) preview += '…';
  }

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: 16, borderRadius: 16,
        background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})`,
        borderLeft: `4px solid hsl(${accent})`,
        textAlign: 'left', cursor: 'pointer',
        boxShadow: `0 1px 2px hsl(220 15% 20% / 0.04)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `hsl(${accent} / 0.14)`,
            display: 'grid', placeItems: 'center', color: `hsl(${accent})`,
          }}>
            <Icon style={{ width: 16, height: 16 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{attempt.test_type} test</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: `hsl(${T.muted})` }}>
              <Calendar style={{ width: 12, height: 12 }} />
              {formatDate(attempt.completed_at)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700,
              color: band > 0 ? `hsl(${accent})` : `hsl(${T.fainter})`,
              lineHeight: 1,
            }}>
              {band > 0 ? band.toFixed(1) : '—'}
            </div>
            <div style={{ fontSize: 11, color: `hsl(${T.muted})` }}>Band</div>
          </div>
          <ChevronRight style={{ width: 16, height: 16, color: `hsl(${T.fainter})` }} />
        </div>
      </div>
      {preview && (
        <div style={{ paddingTop: 10, borderTop: `1px dashed hsl(${T.border})` }}>
          <p style={{ margin: 0, fontSize: 13, color: `hsl(${T.ink} / 0.8)`, fontStyle: 'italic' }}>
            "{preview}"
          </p>
        </div>
      )}
      {/* Reading/Listening correct count */}
      {(attempt.test_type === 'reading' || attempt.test_type === 'listening') && feedback.correct !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: preview ? 0 : 10, borderTop: preview ? 'none' : `1px dashed hsl(${T.border})` }}>
          <CheckCircle style={{ width: 14, height: 14, color: `hsl(${T.brand})` }} />
          <span style={{ fontSize: 13, color: `hsl(${T.ink} / 0.8)` }}>
            {feedback.correct}/{feedback.total} correct ({Math.round(feedback.percentage || 0)}%)
          </span>
        </div>
      )}
    </button>
  );
}
