// Overlay/strip surfaces and review-message formatters for the Liz D8 tutor UI:
// suggest strip, talk-practice modal, scene bar (dev preview), attempt→markdown
// review formatters, study-plan drawer and static voice overlay.
// Extracted verbatim from LizD8.jsx (lines 1019-1457) during the monolith split.
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LizAvatarImg } from './markdown';

/* ---------- LIZ SUGGEST STRIP ---------- */

const STATIC_SUGGESTIONS = [
  { id: 'cue',   kind: 'default', icon: '🎤', title: 'Try a Part 2 cue card', meta: '4 min', action: 'cue' },
  { id: 'essay', kind: 'essay',   icon: '✍︎', title: 'Paste your essay',      meta: 'Task 1 / 2 review', action: 'essay' },
  { id: 'drill', kind: 'drill',   icon: '🔊', title: 'Run a /θ/ drill',        meta: '90 sec', action: 'drill' },
];

function LizSuggestStrip({ suggestions, onPick }) {
  const items = (suggestions && suggestions.length) ? suggestions : STATIC_SUGGESTIONS;
  return (
    <div className="liz-suggest-strip" role="toolbar" aria-label="Liz suggests">
      {items.map((s) => (
        <button
          key={s.id}
          type="button"
          className="liz-suggest-chip"
          data-kind={s.kind || 'default'}
          onClick={() => onPick(s)}
          data-testid={`liz-suggest-${s.id}`}
        >
          <span className="lsc-icon">{s.icon || '✦'}</span>
          <span className="lsc-body">
            <span className="lsc-title">{s.title}</span>
            {s.meta ? <span className="lsc-meta">· {s.meta}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- TALK PRACTISE MODAL ---------- */

function detectPronGap(lizStatus, user) {
  const notes = Array.isArray(lizStatus?.memory_notes) ? lizStatus.memory_notes : [];
  if (Array.isArray(user?.pron_gaps) && user.pron_gaps.length) return true;
  if (Array.isArray(lizStatus?.pron_gaps) && lizStatus.pron_gaps.length) return true;
  return notes.some((n) => {
    if (typeof n === 'string') return /pron|θ|sound|accent/i.test(n);
    return n?.type === 'pron_gap'
      || /pron|θ|sound|accent/i.test(`${n?.title || ''} ${n?.body || n?.text || ''}`);
  });
}

function TalkPracticeModal({ smartDefault, onPick, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const modes = [
    {
      id: 'convo',
      icon: 'C',
      title: 'Free conversation',
      desc: 'Open Part 1 / 3 chat — Liz follows where you take it.',
      part: 'part1',
    },
    {
      id: 'drill',
      icon: 'D',
      title: 'Pronunciation drill',
      desc: 'Targeted /θ/, /ð/, /r/ minimum pairs with live underline feedback.',
      part: 'part1',
      mode: 'pronunciation',
    },
    {
      id: 'cue',
      icon: 'P2',
      title: 'Part 2 cue card',
      desc: '1 min prep · 2 min response · then Part 3 follow-ups.',
      part: 'part2',
    },
  ];
  return (
    <div className="talk-modal-backdrop" onClick={onClose} data-testid="liz-talk-modal">
      <div className="talk-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="talk-modal-title">
        <div className="talk-modal-head">
          <h3 id="talk-modal-title">What to practise?</h3>
          <p>Liz adapts to whichever you pick. You can change it any time.</p>
        </div>
        <div className="talk-modes">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              className="talk-mode"
              data-kind={m.id}
              data-default={smartDefault === m.id}
              onClick={() => onPick(m)}
              data-testid={`liz-talk-mode-${m.id}`}
            >
              <span className="tm-icon">{m.icon}</span>
              <span className="tm-body">
                <span className="tm-title">
                  {m.title}
                  {smartDefault === m.id ? <span className="tm-badge">Liz suggests</span> : null}
                </span>
                <span className="tm-desc">{m.desc}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="talk-modal-foot">
          <button type="button" className="liz-btn liz-btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- SCENE BAR (dev preview helper) ---------- */

const SCENES = [
  { id: 'default',  label: 'Default' },
  { id: 'voice',    label: 'Voice active' },
  { id: 'speaking', label: 'Speaking review' },
  { id: 'writing',  label: 'Writing review' },
];

function SceneBar({ scene, onChange }) {
  return (
    <div className="liz-scene-bar" role="toolbar" aria-label="Preview scenes">
      <span>Scene</span>
      {SCENES.map((s) => (
        <button
          key={s.id}
          type="button"
          data-active={scene === s.id}
          onClick={() => onChange(s.id)}
        >{s.label}</button>
      ))}
    </div>
  );
}

/* ---------- REVIEW MESSAGE FORMATTERS (real attempts → Liz markdown) ---------- */

function attemptDateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function pickLatest(attempts, type) {
  if (!Array.isArray(attempts)) return null;
  return attempts
    .filter((a) => a && a.test_type === type)
    .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0))[0] || null;
}

// Truncate a feedback paragraph to roughly one sentence / ~180 chars
function snippet(text, max = 180) {
  if (!text || typeof text !== 'string') return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  const cut = cleaned.slice(0, max);
  const last = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (last > 60 ? cut.slice(0, last + 1) : cut) + '…';
}

function formatSpeakingReview(att) {
  if (!att) return '';
  const when = attemptDateLabel(att.completed_at);
  const band = att.band_score != null ? Number(att.band_score).toFixed(1) : null;
  const fb = att.feedback || {};
  // Try several shapes returned by speaking evaluator
  const partsBlock = fb.speaking_feedback || fb.parts || null;
  let topComment = '';
  if (partsBlock && typeof partsBlock === 'object') {
    const firstKey = Object.keys(partsBlock)[0];
    const partFb = firstKey ? partsBlock[firstKey] : null;
    topComment = snippet(partFb?.feedback || partFb?.overall || '');
  }
  if (!topComment) topComment = snippet(fb.overall_feedback || fb.summary || '');
  const tip = fb.top_issue || fb.priority_fix || (Array.isArray(fb.weaknesses) ? fb.weaknesses[0] : null);
  const reviewUrl = att.id ? `/result/${att.id}` : null;

  const out = [];
  out.push(`Here's your most recent **Speaking** session — ${when || 'just now'}.`);
  if (band) out.push(`**Estimated band: ${band}**`);
  if (topComment) out.push(topComment);
  if (tip) out.push(`> **Note:** ${snippet(typeof tip === 'string' ? tip : tip.text || tip.body || '', 220)}`);
  if (reviewUrl) out.push(`[Open the full review →](${reviewUrl})`);
  return out.filter(Boolean).join('\n\n');
}

function formatWritingReview(att) {
  if (!att) return '';
  const when = attemptDateLabel(att.completed_at);
  const band = att.band_score != null ? Number(att.band_score).toFixed(1) : null;
  const fb = att.feedback || {};
  const t1 = fb.task1 || fb.task_1 || null;
  const t2 = fb.task2 || fb.task_2 || null;
  const t1Band = t1?.band_score != null ? Number(t1.band_score).toFixed(1) : null;
  const t2Band = t2?.band_score != null ? Number(t2.band_score).toFixed(1) : null;
  const taskLabel = t2 ? 'Task 2' : (t1 ? 'Task 1' : 'Essay');
  const overall = snippet(t2?.overall_feedback || t1?.overall_feedback || fb.overall_feedback || '');
  const fix = t2?.top_issue || t1?.top_issue || fb.priority_fix
    || (Array.isArray(t2?.weaknesses) && t2.weaknesses[0])
    || (Array.isArray(t1?.weaknesses) && t1.weaknesses[0])
    || null;
  const reviewUrl = att.id ? `/result/${att.id}` : null;

  const out = [];
  out.push(`Here's your most recent **Writing** essay — ${taskLabel}, ${when || 'just now'}.`);
  if (band || t1Band || t2Band) {
    const parts = [band ? `**Estimated band: ${band}**` : null];
    if (t1Band) parts.push(`Task 1 · ${t1Band}`);
    if (t2Band) parts.push(`Task 2 · ${t2Band}`);
    out.push(parts.filter(Boolean).join(' · '));
  }
  if (overall) out.push(overall);
  if (fix) out.push(`> **Important:** ${snippet(typeof fix === 'string' ? fix : fix.text || fix.body || '', 220)}`);
  if (reviewUrl) out.push(`[Open the full review →](${reviewUrl})`);
  return out.filter(Boolean).join('\n\n');
}

const EMPTY_SPEAKING_REVIEW =
  "You haven't done any **speaking** practice yet.\n\n" +
  "When you finish your first attempt, I'll walk you through what worked and what to fix — right here in this conversation.\n\n" +
  '[Try a Part 2 cue card →](/test/speaking)';

const EMPTY_WRITING_REVIEW =
  "No **writing** essays yet.\n\n" +
  "Submit a Task 1 or Task 2 essay and I'll give you concrete, examiner-style feedback right here.\n\n" +
  '[Start a writing drill →](/test/writing)';

/* ---------- STUDY PLAN ---------- */

// Defensive fallback when backend hasn't populated lizStatus.week_plan yet.
// Builds a 7-day rolling skeleton from today, mapping skill rotations to the
// existing /question-bank deep-links so each task is clickable.
function deriveWeekPlan() {
  const skills = [
    { key: 'writing',   label: 'Writing — Task 2 essay',         href: '/question-bank?writing=1',   meta: '40 min' },
    { key: 'reading',   label: 'Reading — full passage drill',   href: '/question-bank?reading=1',   meta: '30 min' },
    { key: 'listening', label: 'Listening — Sections 1–4',        href: '/question-bank?listening=1', meta: '30 min' },
    { key: 'speaking',  label: 'Speaking — Part 1·2·3 set',      href: '/question-bank?speaking=1',  meta: '15 min' },
    { key: 'writing',   label: 'Writing — Task 1 graph drill',   href: '/question-bank?writing=1',   meta: '20 min' },
    { key: 'speaking',  label: 'Speaking — Part 2 cue card',     href: '/question-bank?speaking=1',  meta: '7 min'  },
    { key: 'reading',   label: 'Reading — vocabulary review',    href: '/question-bank?reading=1',   meta: '20 min' },
  ];
  const out = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const task = skills[i % skills.length];
    out.push({
      day: dayLabel,
      is_today: i === 0,
      tasks: [
        { id: `${i}-main`,  label: task.label, href: task.href, meta: task.meta },
        { id: `${i}-vocab`, label: '10 new vocabulary cards',   href: '/courses', meta: '10 min' },
      ],
    });
  }
  return out;
}

function StudyPlanDrawer({ lizStatus, user, onClose }) {
  const navigate = useNavigate();
  // Lock body scroll while drawer is open + ESC closes.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const planDays = lizStatus?.plan_days || null;
  const planDay  = lizStatus?.plan_day  || null;
  const examDate = user?.exam_date ? new Date(user.exam_date) : null;
  const daysToExam = examDate ? Math.max(0, Math.ceil((examDate - new Date()) / 86400000)) : null;
  const targetBand = user?.target_band || lizStatus?.target_band;
  const baseBand   = lizStatus?.current_band || lizStatus?.starting_band;
  const headline = (baseBand && targetBand)
    ? `From Band ${baseBand} → ${targetBand}`
    : targetBand
      ? `Target Band ${targetBand}`
      : 'Your study plan';
  const week = Array.isArray(lizStatus?.week_plan) && lizStatus.week_plan.length
    ? lizStatus.week_plan
    : deriveWeekPlan();
  const isFallback = !Array.isArray(lizStatus?.week_plan) || !lizStatus.week_plan.length;

  const handleTask = (t) => {
    if (t?.href) {
      navigate(t.href);
      onClose?.();
    }
  };

  const progressPct = planDay && planDays ? Math.min(100, Math.round((planDay / planDays) * 100)) : null;

  return (
    <div className="study-plan-overlay" role="dialog" aria-modal="true" aria-label="Study plan" data-testid="liz-study-plan-drawer">
      <div className="study-plan-backdrop" onClick={onClose} />
      <div className="study-plan-drawer">
        <header className="study-plan-head">
          <div>
            <div className="kicker">Study plan</div>
            <h2>{headline}</h2>
            <p className="study-plan-meta">
              {planDays ? `${planDays}-day plan` : 'Rolling week'}
              {planDay && planDays ? ` · Day ${planDay} of ${planDays}` : ''}
              {daysToExam != null ? ` · ${daysToExam} days to exam` : ''}
            </p>
          </div>
          <button
            type="button"
            className="study-plan-close"
            onClick={onClose}
            aria-label="Close study plan"
            data-testid="liz-close-study-plan"
          >×</button>
        </header>

        {progressPct != null ? (
          <div className="study-plan-progress" aria-label={`${progressPct}% through plan`}>
            <div className="study-plan-progress-bar" style={{ width: `${progressPct}%` }} />
          </div>
        ) : null}

        {isFallback ? (
          <div className="study-plan-hint">
            Liz hasn't generated a personalised plan yet — this is a starter rotation.
            Once you set your target band and exam date, your plan adapts automatically.
          </div>
        ) : null}

        <ol className="study-plan-week">
          {week.map((d, i) => {
            const dayLabel = d.day || d.date_label || `Day ${i + 1}`;
            const isToday = !!d.is_today;
            return (
              <li key={i} className="study-plan-day" data-today={isToday || undefined}>
                <div className="study-plan-day-head">
                  <span className="study-plan-day-label">{dayLabel}</span>
                  {isToday ? <span className="study-plan-today-pill">Today</span> : null}
                </div>
                <ul className="study-plan-tasks">
                  {(d.tasks || []).map((t, j) => {
                    const tLabel = typeof t === 'string' ? t : (t.label || t.title || '');
                    const tMeta  = typeof t === 'string' ? null : (t.meta || t.duration || null);
                    const tDone  = typeof t === 'object' && (t.done || t.completed);
                    const clickable = typeof t === 'object' && t.href;
                    return (
                      <li
                        key={t.id || j}
                        className="study-plan-task"
                        data-state={tDone ? 'done' : 'todo'}
                        data-clickable={clickable || undefined}
                        onClick={clickable ? () => handleTask(t) : undefined}
                        role={clickable ? 'button' : undefined}
                        tabIndex={clickable ? 0 : undefined}
                        onKeyDown={clickable ? (e) => { if (e.key === 'Enter') handleTask(t); } : undefined}
                      >
                        <span className="step-dot" />
                        <div>
                          <div className="step-label">{tLabel}</div>
                          {tMeta ? <div className="step-meta">{tMeta}</div> : null}
                        </div>
                        {clickable ? <span className="study-plan-task-arrow">→</span> : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// Map a candidate's average band to the recommended course tier. Mirrors the
// CoursesPage levels (beginner / mastery / advanced). Backend can override
// via lizStatus.recommended_course; this is the fallback derivation.
function deriveRecommendedCourse(lizStatus, user) {
  if (lizStatus?.recommended_course) return lizStatus.recommended_course;
  const band = Number(
    lizStatus?.current_band
    || lizStatus?.starting_band
    || user?.current_band
    || user?.starting_band
    || 0,
  );
  if (band >= 7) {
    return { level: 'advanced', short_label: 'Advanced',  href: '/advanced-mastery', sub: 'Liz · Band 7+ polish' };
  }
  if (band >= 5.5) {
    return { level: 'mastery',  short_label: 'Mastery',   href: '/mastery-course',   sub: 'Liz · Band 5.5–7 build' };
  }
  if (band > 0) {
    return { level: 'beginner', short_label: 'Beginner',  href: '/beginner-course',  sub: 'Liz · Band <5.5 base'  };
  }
  // Unknown → safe default landing
  return { level: 'mastery', short_label: 'Mastery', href: '/mastery-course', sub: 'Most students start here' };
}

function StaticVoiceOverlay({ onClose }) {
  return (
    <div className="voice-overlay" role="dialog" aria-modal="true">
      <div className="voice-orb" data-state="speaking">
        <LizAvatarImg alt="Liz" />
      </div>
      <div className="voice-bars" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <p className="voice-transcript">
        "Let's practise <em>/θ/</em>. Repeat after me: <b>think · three · nothing</b>"<span className="caret"></span>
      </p>
      <div className="voice-live-pron">
        You: "<span className="pron pron-good">think</span>" ·
        " <span className="pron pron-bad" title="closer to 'tree'">three</span>" ·
        " <span className="pron pron-ok">nothing</span>"
      </div>
      <div className="voice-controls">
        <button type="button" className="liz-btn liz-btn-ghost">Mute mic</button>
        <button type="button" className="liz-btn liz-btn-ghost">Pause</button>
        <button type="button" className="liz-btn liz-btn-primary" onClick={onClose}>End session</button>
      </div>
    </div>
  );
}

export {
  STATIC_SUGGESTIONS, LizSuggestStrip, detectPronGap, TalkPracticeModal,
  SCENES, SceneBar, attemptDateLabel, pickLatest, snippet,
  formatSpeakingReview, formatWritingReview,
  EMPTY_SPEAKING_REVIEW, EMPTY_WRITING_REVIEW,
  deriveWeekPlan, StudyPlanDrawer, deriveRecommendedCourse, StaticVoiceOverlay,
};
