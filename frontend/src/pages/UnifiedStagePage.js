import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ChevronRight, Lock, CheckCircle, BookOpen, Star,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const ADMIN_EMAILS = ['aga.durdy@gmail.com', 'stemhousebenluc@gmail.com'];

// ───── Per-topic emoji derivation ─────
// Keyword → emoji map. First match wins. Falls back to a generic 📖.
const TOPIC_EMOJI_MAP = [
  [['look like', 'face', 'body', 'eyes', 'hair'], '👀'],
  [['family', 'grandparent', 'cousin', 'parent', 'mother', 'father', 'brother', 'sister'], '👨‍👩‍👧'],
  [['photo', 'picture', 'camera', 'selfie'], '📷'],
  [['where', 'from', 'country', 'city', 'place'], '🌍'],
  [['hello', 'greet', 'introduce', 'meet', 'say hi'], '👋'],
  [['people', 'friend', 'neighbour', 'neighbor'], '👥'],
  [['about me', 'myself', "i am", "i'm", 'me'], '🪞'],
  [['school', 'classroom', 'teacher'], '🎒'],
  [['food', 'eat', 'meal', 'breakfast', 'lunch', 'dinner', 'fruit'], '🍎'],
  [['animal', 'pet', 'cat', 'dog', 'farm'], '🐶'],
  [['weather', 'rain', 'sun', 'snow', 'cloud'], '☀️'],
  [['color', 'colour', 'paint'], '🎨'],
  [['number', 'count', 'math'], '🔢'],
  [['time', 'clock', 'hour'], '🕒'],
  [['day', 'week', 'month'], '📅'],
  [['home', 'house', 'room', 'kitchen', 'bedroom'], '🏠'],
  [['clothes', 'wear', 'shirt', 'dress'], '👕'],
  [['sport', 'play', 'football', 'basketball'], '⚽'],
  [['music', 'song', 'sing'], '🎵'],
  [['holiday', 'travel', 'trip', 'vacation'], '✈️'],
  [['birthday', 'party'], '🎂'],
  [['book', 'read', 'story'], '📚'],
  [['number', 'count'], '🔢'],
  [['hobby', 'free time', 'fun'], '🎨'],
  [['shop', 'buy', 'market'], '🛍️'],
];

function getTopicEmoji(title) {
  if (!title) return '📖';
  const lc = String(title).toLowerCase();
  for (const [keys, emoji] of TOPIC_EMOJI_MAP) {
    for (const k of keys) {
      if (lc.includes(k)) return emoji;
    }
  }
  return '📖';
}

function getLessonEmoji(title) {
  // Review lessons get a trophy regardless of topic
  if (title && /review/i.test(title)) return '🏆';
  return getTopicEmoji(title);
}

// Rotating gradient palette for chapter headers
const UNIT_GRADIENTS = [
  'linear-gradient(135deg, #FFB997 0%, #F67E7D 100%)',  // coral
  'linear-gradient(135deg, #C9A6FF 0%, #8B5CF6 100%)',  // violet
  'linear-gradient(135deg, #A8B4FF 0%, #6478FF 100%)',  // indigo
  'linear-gradient(135deg, #FFC371 0%, #FF8C42 100%)',  // amber
  'linear-gradient(135deg, #8FE3CF 0%, #2EBCA0 100%)',  // teal
  'linear-gradient(135deg, #FFA5C5 0%, #E04E89 100%)',  // pink
  'linear-gradient(135deg, #FFD56B 0%, #F39C2E 100%)',  // yellow
  'linear-gradient(135deg, #9DDBFF 0%, #4A9EFF 100%)',  // blue
  'linear-gradient(135deg, #FFB997 0%, #C2185B 100%)',  // rose
  'linear-gradient(135deg, #8FE3CF 0%, #4A9EFF 100%)',  // aqua
];

// ───── CSS (mirrors magical library aesthetic from GEDashboard) ─────
const STAGE_CSS = `
.gstg { font-family: 'Fredoka', 'Inter', system-ui, sans-serif; color: #2d1a3e; min-height: 100vh; position: relative; }
.gstg .display { font-family: 'Baloo 2', 'Fredoka', sans-serif; }
.gstg-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 700px 500px at 80% 0%, rgba(255, 220, 140, 0.55) 0%, transparent 65%),
    radial-gradient(ellipse 600px 400px at 10% 50%, rgba(190, 160, 255, 0.30) 0%, transparent 60%),
    radial-gradient(ellipse 500px 350px at 90% 90%, rgba(255, 180, 200, 0.30) 0%, transparent 60%),
    linear-gradient(180deg, #FFF7E1 0%, #FBE8D3 40%, #F4DAE8 100%);
}
.gstg-paper {
  position: fixed; inset: 0; pointer-events: none; z-index: 1; opacity: 0.3;
  background-image:
    repeating-radial-gradient(circle at 30% 20%, rgba(180,130,80,0.04) 0px, rgba(180,130,80,0.04) 1px, transparent 1px, transparent 4px);
  mix-blend-mode: multiply;
}
.gstg-dust {
  position: fixed; width: 6px; height: 6px; border-radius: 50%;
  pointer-events: none; z-index: 3;
  animation: gstgDust linear infinite;
}
@keyframes gstgDust {
  0% { transform: translateY(0) translateX(0) scale(0.5); opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 0.8; }
  100% { transform: translateY(-100vh) translateX(40px) scale(1.2); opacity: 0; }
}

/* Stage cover (hero book) */
.gstg-cover {
  border-radius: 32px;
  padding: 28px 32px;
  color: white;
  position: relative;
  overflow: hidden;
  border: 2px solid rgba(255,255,255,0.25);
  box-shadow:
    0 24px 60px -12px rgba(20, 70, 60, 0.4),
    inset 6px 0 16px rgba(255,255,255,0.18),
    inset -6px 0 22px rgba(0,0,0,0.18);
}
.gstg-cover::before {
  content: ''; position: absolute;
  left: 12px; top: 12%; bottom: 12%; width: 4px;
  background: linear-gradient(180deg, transparent, rgba(255,220,150,0.8), transparent);
  border-radius: 2px;
}
.gstg-cover-emblem {
  position: absolute;
  right: 24px; top: 50%;
  transform: translateY(-50%);
  font-size: 170px;
  line-height: 1;
  opacity: 0.18;
  filter: drop-shadow(0 8px 12px rgba(0,0,0,0.3));
  pointer-events: none;
  animation: gstgFloatCover 6s ease-in-out infinite;
}
@keyframes gstgFloatCover {
  0%, 100% { transform: translateY(-50%) rotate(-3deg); }
  50%      { transform: translateY(calc(-50% - 10px)) rotate(3deg); }
}
.gstg-back-pill {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.18);
  color: white; padding: 7px 14px;
  border-radius: 999px; font-weight: 600; font-size: 13px;
  border: 1px solid rgba(255,255,255,0.3);
  transition: all 0.2s;
}
.gstg-back-pill:hover { background: rgba(255,255,255,0.32); transform: translateX(-2px); }
.gstg-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.22);
  color: white; padding: 5px 13px;
  border-radius: 999px; font-weight: 700; font-size: 13px;
  border: 1px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(4px);
}
.gstg-chip-outline { background: transparent; border: 1.5px solid rgba(255,255,255,0.55); }

/* Chapter card */
.gstg-chapter {
  border-radius: 24px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(255,255,255,0.7);
  box-shadow: 0 14px 36px -10px rgba(80, 50, 100, 0.22);
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s;
  position: relative;
  opacity: 0;
  transform: translateY(24px);
  animation: gstgChapterIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes gstgChapterIn { to { opacity: 1; transform: translateY(0); } }
.gstg-chapter:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 48px -10px rgba(80, 50, 100, 0.30);
}
.gstg-chapter-head {
  padding: 22px 24px;
  color: white;
  position: relative;
  overflow: hidden;
}
.gstg-chapter-head::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(circle at 90% 50%, rgba(255,255,255,0.18) 0%, transparent 50%);
  pointer-events: none;
}
.gstg-chapter-emblem {
  position: absolute;
  right: 16px; top: 50%;
  transform: translateY(-50%);
  font-size: 82px;
  line-height: 1;
  opacity: 0.95;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
  animation: gstgEmblemFloat 5s ease-in-out infinite;
}
@keyframes gstgEmblemFloat {
  0%, 100% { transform: translateY(-50%) rotate(-4deg); }
  50%      { transform: translateY(calc(-50% - 8px)) rotate(4deg); }
}
.gstg-chapter-num {
  display: inline-block;
  background: rgba(255,255,255,0.22);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  padding: 3px 11px; border-radius: 999px;
  font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
  backdrop-filter: blur(4px);
}
.gstg-chapter-title {
  font-family: 'Baloo 2', sans-serif;
  font-size: 24px; font-weight: 800; line-height: 1.1; margin-top: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.25);
  position: relative; z-index: 1; max-width: 70%;
}
.gstg-chapter-sub {
  font-size: 13px; color: rgba(255,255,255,0.92);
  margin-top: 4px; max-width: 70%;
  position: relative; z-index: 1;
}

.gstg-chapter-prog {
  background: rgba(252, 248, 240, 0.6);
  padding: 10px 22px;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px;
  border-top: 1px solid rgba(255,255,255,0.5);
  border-bottom: 1px solid rgba(180, 130, 80, 0.12);
}
.gstg-chapter-prog-bar {
  flex: 1; margin: 0 14px;
  height: 6px;
  background: rgba(180, 130, 80, 0.18);
  border-radius: 999px;
  overflow: hidden;
}
.gstg-chapter-prog-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFE066, #FFA500);
  box-shadow: 0 0 8px rgba(255,200,80,0.6);
  border-radius: 999px;
  transition: width 1.1s ease-out;
}

.gstg-lesson {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 22px;
  cursor: pointer;
  border-bottom: 1px dashed rgba(180, 130, 80, 0.14);
  transition: all 0.25s ease;
  background: transparent;
  width: 100%;
  text-align: left;
}
.gstg-lesson:last-child { border-bottom: none; }
.gstg-lesson:hover:not(:disabled) {
  background: rgba(255, 240, 200, 0.4);
  padding-left: 30px;
}
.gstg-lesson:hover:not(:disabled) .gstg-lesson-arrow { transform: translateX(4px); color: #C2185B; }
.gstg-lesson:hover:not(:disabled) .gstg-lesson-icon { transform: scale(1.1) rotate(-4deg); }
.gstg-lesson:disabled { cursor: not-allowed; opacity: 0.45; }
.gstg-lesson-icon {
  width: 44px; height: 44px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.10), inset 0 -2px 4px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.gstg-lesson-icon.completed { background: linear-gradient(135deg, #6BE5A2 0%, #2EBCA0 100%) !important; color: white; }
.gstg-lesson-icon.review    { background: linear-gradient(135deg, #FFE066 0%, #FFA500 100%) !important; color: white; }
.gstg-lesson-info { flex: 1; min-width: 0; }
.gstg-lesson-title {
  font-family: 'Baloo 2', sans-serif;
  font-size: 16px; font-weight: 700;
  color: #2d1a3e; line-height: 1.2;
}
.gstg-lesson-meta {
  display: flex; gap: 12px; margin-top: 2px;
  font-size: 11px; color: #6b7280; font-weight: 500;
}
.gstg-lesson-meta-item { display: inline-flex; align-items: center; gap: 4px; }
.gstg-lesson-arrow {
  color: #94a3b8; transition: all 0.3s; font-size: 20px;
}

.gstg-lock-overlay {
  position: absolute; inset: 0;
  background: rgba(15, 15, 25, 0.55);
  backdrop-filter: blur(4px);
  border-radius: inherit;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; color: white; z-index: 5;
}
.gstg-lock-icon {
  width: 56px; height: 56px;
  background: white; color: #64748b;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
  box-shadow: 0 6px 14px rgba(0,0,0,0.3);
  border: 3px solid rgba(255,255,255,0.85);
}
.gstg-lock-text {
  font-size: 13px; font-weight: 700; letter-spacing: 0.04em;
  text-align: center; max-width: 75%;
}

.gstg-sparkle {
  position: absolute;
  font-size: 18px;
  animation: gstgTwinkle 2.6s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}
@keyframes gstgTwinkle {
  0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
  50%      { transform: scale(1) rotate(180deg); opacity: 1; }
}

.gstg-deco {
  position: absolute;
  filter: drop-shadow(0 6px 10px rgba(100, 60, 30, 0.18));
  pointer-events: none;
  z-index: 4;
}
@keyframes gstgFloat { 0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); } 50% { transform: translateY(-10px) rotate(calc(var(--rot, 0deg) + 3deg)); } }
@keyframes gstgSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes gstgFlick { 0% { transform: scale(1, 1) rotate(-1deg); filter: brightness(1); } 50% { transform: scale(1.04, 0.96) rotate(2deg); filter: brightness(1.15); } 100% { transform: scale(0.96, 1.04) rotate(-2deg); filter: brightness(0.95); } }
.gstg-float { animation: gstgFloat 5s ease-in-out infinite; }
.gstg-spin  { animation: gstgSpin 20s linear infinite; }
.gstg-flick { animation: gstgFlick 0.8s ease-in-out infinite alternate; transform-origin: bottom center; }

@media (prefers-reduced-motion: reduce) {
  .gstg-chapter, .gstg-cover-emblem, .gstg-chapter-emblem, .gstg-float, .gstg-spin, .gstg-flick, .gstg-sparkle, .gstg-dust {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
`;

// ───── Chapter (Unit) card ─────
function ChapterCard({ unit, lessons, userProgress, onLessonClick, isUnitUnlocked, isAdmin, prevUnitName, index }) {
  const completedLessons = lessons.filter(
    (l) => userProgress?.lesson_progress?.[l.lesson_id]?.completed,
  ).length;
  const completionPercent = lessons.length > 0
    ? Math.round((completedLessons / lessons.length) * 100)
    : 0;

  const emblem = getTopicEmoji(unit.title);
  const gradient = UNIT_GRADIENTS[index % UNIT_GRADIENTS.length];
  const tilt = ['-0.4deg', '0.4deg', '-0.3deg', '0.3deg'][index % 4];

  return (
    <article
      className="gstg-chapter"
      style={{ animationDelay: `${0.10 + index * 0.10}s`, transform: `rotate(${tilt})` }}
      data-testid={`unit-card-${unit.number}`}
    >
      <div className="gstg-chapter-head" style={{ background: gradient }}>
        <span className="gstg-chapter-emblem" aria-hidden="true">{emblem}</span>
        <span className="gstg-chapter-num">Chapter {unit.number || unit.unit_number}</span>
        <div className="gstg-chapter-title">{unit.title}</div>
        {unit.description && (
          <div className="gstg-chapter-sub">{unit.description}</div>
        )}
        {!isUnitUnlocked && (
          <span className="gstg-sparkle" style={{ top: '16%', right: '12%', color: 'rgba(255,255,255,0.6)' }}>✨</span>
        )}
      </div>

      <div className="gstg-chapter-prog">
        <span className="font-semibold text-slate-700">{completedLessons} / {lessons.length} lessons</span>
        <div className="gstg-chapter-prog-bar">
          <div className="gstg-chapter-prog-fill" style={{ width: `${completionPercent}%` }} />
        </div>
        <span className="font-bold text-amber-700">{completionPercent}%</span>
      </div>

      <div>
        {lessons.map((lesson, lessonIdx) => {
          const isFirstInUnit = lessonIdx === 0;
          const prevLessonCompleted = lessonIdx > 0
            ? userProgress?.lesson_progress?.[lessons[lessonIdx - 1].lesson_id]?.completed
            : true;
          const isLessonUnlocked =
            isAdmin || (isUnitUnlocked && (isFirstInUnit || prevLessonCompleted));
          const isCompleted = userProgress?.lesson_progress?.[lesson.lesson_id]?.completed;
          const lessonProgress = userProgress?.lesson_progress?.[lesson.lesson_id];
          const isReview = /review/i.test(lesson.title || '');
          const lessonEmoji = getLessonEmoji(lesson.title);
          const lessonGradient = UNIT_GRADIENTS[(index + lessonIdx + 1) % UNIT_GRADIENTS.length];
          const iconClass = isCompleted ? 'gstg-lesson-icon completed' : isReview ? 'gstg-lesson-icon review' : 'gstg-lesson-icon';
          const iconBg = isCompleted || isReview ? undefined : lessonGradient;
          const iconColor = isCompleted || isReview ? 'white' : 'white';

          return (
            <button
              key={lesson.lesson_id}
              type="button"
              className="gstg-lesson"
              disabled={!isLessonUnlocked}
              onClick={() => {
                if (isLessonUnlocked) onLessonClick(lesson);
                else toast.error('Complete the previous lesson first!');
              }}
              data-testid={`lesson-${lesson.lesson_id}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={iconClass} style={{ background: iconBg, color: iconColor }}>
                  {isCompleted ? '✓' : lessonEmoji}
                </span>
                <div className="gstg-lesson-info">
                  <div className="gstg-lesson-title">
                    {lesson.number}. {lesson.title}
                  </div>
                  <div className="gstg-lesson-meta">
                    <span className="gstg-lesson-meta-item">⏱ {lesson.estimated_duration_minutes} min</span>
                    <span className="gstg-lesson-meta-item">⚡ {lesson.points_reward} pts</span>
                    {lessonProgress?.crowns > 0 && (
                      <span className="gstg-lesson-meta-item text-amber-600">
                        {Array(lessonProgress.crowns).fill(0).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current inline" />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="gstg-lesson-arrow">›</span>
            </button>
          );
        })}
      </div>

      {!isUnitUnlocked && (
        <div className="gstg-lock-overlay">
          <div className="gstg-lock-icon">🔒</div>
          <div className="gstg-lock-text">
            Finish <strong>{prevUnitName || 'the previous chapter'}</strong> first
          </div>
        </div>
      )}
    </article>
  );
}

function checkUnitUnlocked(unit, units, userProgress, isAdmin) {
  if (isAdmin) return true;
  const unitIndex = units.findIndex((u) => u.unit_id === unit.unit_id);
  if (unitIndex === 0) return true;
  const prevUnit = units[unitIndex - 1];
  const prevLessons = prevUnit.lessons || [];
  if (prevLessons.length === 0) return true;
  return prevLessons.every((l) => userProgress?.lesson_progress?.[l.lesson_id]?.completed);
}

// Map stage_id → cover gradient + big emblem (matches GEDashboard book covers)
const STAGE_COVER_THEME = {
  stage_1_foundations:    { gradient: 'linear-gradient(135deg, #FFB997 0%, #F67E7D 60%, #C2185B 100%)', emblem: '🌱' },
  stage_2_starters:       { gradient: 'linear-gradient(135deg, #FFD56B 0%, #F39C2E 60%, #B8651A 100%)', emblem: '🐣' },
  stage_3_movers:         { gradient: 'linear-gradient(135deg, #8FE3CF 0%, #2EBCA0 60%, #1E8A77 100%)', emblem: '🦋' },
  stage_4_flyers:         { gradient: 'linear-gradient(135deg, #A8B4FF 0%, #6478FF 60%, #3A4ED9 100%)', emblem: '🦅' },
  stage_5_b1:             { gradient: 'linear-gradient(135deg, #FFA5C5 0%, #E04E89 60%, #A8275A 100%)', emblem: '🎓' },
  stage_6_b2:             { gradient: 'linear-gradient(135deg, #C9A6FF 0%, #8B5CF6 60%, #6028D9 100%)', emblem: '🧠' },
  stage_7_ielts_foundation:{ gradient: 'linear-gradient(135deg, #FFC371 0%, #FF8C42 60%, #C5571A 100%)', emblem: '🎯' },
  stage_8_ielts_mastery:  { gradient: 'linear-gradient(135deg, #9DDBFF 0%, #4A9EFF 60%, #1F6EDA 100%)', emblem: '👑' },
};

export default function UnifiedStagePage({ user }) {
  const navigate = useNavigate();
  const { stageId } = useParams();
  const [stage, setStage] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const stageRes = await fetch(`${API_URL}/api/unified/stages/${stageId}`);
        const stageData = await stageRes.json();
        if (stageData.units) {
          await Promise.all(
            stageData.units.map(async (unit) => {
              const unitRes = await fetch(`${API_URL}/api/unified/units/${unit.unit_id}`);
              const unitData = await unitRes.json();
              unit.lessons = unitData.lessons || [];
            }),
          );
        }
        if (!alive) return;
        setStage(stageData);

        if (user?.id) {
          const progressRes = await fetch(`${API_URL}/api/unified/progress/${user.id}`);
          const progressData = await progressRes.json();
          if (alive) setUserProgress(progressData);
        }
      } catch (err) {
        console.error('Error loading stage data:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [stageId, user]);

  const handleLessonClick = (lesson) => {
    navigate(`/unified/lesson/${lesson.lesson_id}`);
  };

  const isAdmin = ADMIN_EMAILS.includes((user?.email || '').toLowerCase());
  const units = stage?.units || [];
  const cover = STAGE_COVER_THEME[stage?.stage_id] || {
    gradient: stage?.color
      ? `linear-gradient(135deg, ${stage.color} 0%, ${stage.color}88 100%)`
      : 'linear-gradient(135deg, #8FE3CF, #2EBCA0)',
    emblem: '📚',
  };

  const unlockedCount = useMemo(
    () => units.filter((u) => checkUnitUnlocked(u, units, userProgress, isAdmin)).length,
    [units, userProgress, isAdmin],
  );

  if (loading) {
    return (
      <div className="gstg" style={{ background: '#FFF7E1' }}>
        <div className="gstg-bg" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
      </div>
    );
  }

  if (!stage) {
    return (
      <div className="gstg">
        <style>{STAGE_CSS}</style>
        <div className="gstg-bg" />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Stage not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gstg">
      <style>{STAGE_CSS}</style>
      <div className="gstg-bg" />
      <div className="gstg-paper" />
      {/* Magical dust */}
      <div className="gstg-dust" style={{ left: '12%', bottom: 0, background: 'radial-gradient(circle, #FFE066 30%, transparent 70%)', animationDuration: '16s' }} />
      <div className="gstg-dust" style={{ left: '32%', bottom: 0, background: 'radial-gradient(circle, #C9A6FF 30%, transparent 70%)', animationDuration: '19s', animationDelay: '-5s' }} />
      <div className="gstg-dust" style={{ left: '55%', bottom: 0, background: 'radial-gradient(circle, #FFB997 30%, transparent 70%)', animationDuration: '17s', animationDelay: '-10s' }} />
      <div className="gstg-dust" style={{ left: '78%', bottom: 0, background: 'radial-gradient(circle, #8FE3CF 30%, transparent 70%)', animationDuration: '20s', animationDelay: '-3s' }} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-5">

        {/* Stage cover (hero book) */}
        <div className="gstg-cover" style={{ background: cover.gradient }}>
          <span className="gstg-cover-emblem" aria-hidden="true">{cover.emblem}</span>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="gstg-back-pill"
            data-testid="stage-back-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex flex-wrap items-center gap-2 mt-4 mb-2">
            <span className="gstg-chip">📖 Stage {stage.number}</span>
            {stage.cefr_level && <span className="gstg-chip gstg-chip-outline">{stage.cefr_level}</span>}
            {stage.target_audience && (
              <span className="gstg-chip gstg-chip-outline">{stage.target_audience}</span>
            )}
          </div>
          <h1
            className="display text-4xl md:text-5xl font-bold mt-1 mb-1"
            style={{ textShadow: '0 3px 6px rgba(0,0,0,0.3)', maxWidth: '70%' }}
          >
            {stage.name}
          </h1>
          {stage.description && (
            <p className="text-white/95 text-base md:text-lg max-w-2xl mt-1">
              {stage.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm font-medium opacity-95">
            <span className="inline-flex items-center gap-1.5">📚 <strong>{stage.total_units || units.length} chapters</strong></span>
            <span className="inline-flex items-center gap-1.5">📜 <strong>{stage.total_lessons || (stage.total_units * (stage.lessons_per_unit || 4)) || 0} lessons</strong></span>
          </div>
          <span className="gstg-sparkle" style={{ top: '18%', left: '70%', color: '#FFD700' }}>✨</span>
          <span className="gstg-sparkle" style={{ top: '70%', left: '80%', color: '#FFE066', animationDelay: '0.6s' }}>⭐</span>
        </div>

        {/* Chapters header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="display text-xl font-bold text-slate-800">Chapters in this book</h2>
            <p className="text-sm text-slate-600">
              {unlockedCount} unlocked · {Math.max(0, units.length - unlockedCount)} unlocking as you progress
            </p>
          </div>
          <div className="text-xs text-slate-600 hidden md:flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>Unlocked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Coming soon
            </span>
          </div>
        </div>

        {/* Chapter grid */}
        {units.length === 0 ? (
          <div
            className="p-12 text-center rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.5)' }}
          >
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Coming Soon</h3>
            <p className="text-slate-600">Content for this stage is being prepared. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {units.map((unit, idx) => {
              const isUnitUnlocked = checkUnitUnlocked(unit, units, userProgress, isAdmin);
              const prevUnit = idx > 0 ? units[idx - 1] : null;
              return (
                <ChapterCard
                  key={unit.unit_id}
                  unit={unit}
                  lessons={unit.lessons || []}
                  userProgress={userProgress}
                  onLessonClick={handleLessonClick}
                  isUnitUnlocked={isUnitUnlocked}
                  isAdmin={isAdmin}
                  prevUnitName={prevUnit ? `Chapter ${prevUnit.unit_number || prevUnit.number} · ${prevUnit.title}` : ''}
                  index={idx}
                />
              );
            })}
          </div>
        )}

        {/* Side decorations */}
        <span className="gstg-deco gstg-float" style={{ top: '35%', left: -28, fontSize: 44, '--rot': '-5deg' }}>🦉</span>
        <span className="gstg-deco gstg-flick" style={{ top: '60%', right: -22, fontSize: 38 }}>🕯️</span>
        <span className="gstg-deco gstg-spin" style={{ bottom: '15%', left: -20, fontSize: 36 }}>🔮</span>
      </main>
    </div>
  );
}
