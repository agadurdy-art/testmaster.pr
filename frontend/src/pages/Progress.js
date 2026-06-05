import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, BookOpen, Headphones, Mic, PenTool, Target,
  Calendar, ChevronRight, CheckCircle, Award,
} from 'lucide-react';
import api from '../lib/api';
import AppShellNav from '../components/appshell/AppShellNav';

// D10 handoff visual tokens — port-only
const T = {
  brand: '160 84% 39%',
  brandDark: '160 84% 28%',
  sky: '199 89% 60%',
  gold: '43 96% 56%',
  rose: '350 70% 58%',
  ink: '220 25% 12%',
  muted: '220 10% 45%',
  fainter: '220 10% 65%',
  bg: '210 20% 98%',
  surface: '0 0% 100%',
  border: '220 15% 90%',
  borderSoft: '220 15% 94%',
};
const FONT_DISPLAY = '"Playfair Display", Georgia, serif';
const FONT_SANS = '"Inter", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

const SKILLS = [
  { id: 'reading', label: 'Reading', Icon: BookOpen },
  { id: 'writing', label: 'Writing', Icon: PenTool },
  { id: 'listening', label: 'Listening', Icon: Headphones },
  { id: 'speaking', label: 'Speaking', Icon: Mic },
];

// Emoji + short descriptor used in the Strengths card. Per D10 handoff —
// readable at a glance, evokes the skill without re-rendering Lucide glyphs.
const STRENGTH_DESCRIPTORS = {
  reading:   { emoji: '📖', text: 'Strong comprehension' },
  listening: { emoji: '🎧', text: 'Sharp ear for detail' },
  writing:   { emoji: '✍️', text: 'Clear structure' },
  speaking:  { emoji: '🎤', text: 'Confident delivery' },
};

// Map a band score (0..9) to a percentage of the 0..9 axis (radar/bar fill)
const bandPct = (band) => Math.max(0, Math.min(100, (band / 9) * 100));

// Convert a (label-index, value) on a 4-axis radar to (x,y).
// Order: 0=top (Writing), 1=right (Speaking), 2=bottom (Reading), 3=left (Listening)
const radarPoint = (idx, value, radius = 140) => {
  const r = (value / 9) * radius;
  const angle = (idx * 90 - 90) * (Math.PI / 180); // start at top
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
};

const PACE_OPTIONS = [
  { id: 'light', name: 'Light · 2 sessions/week', sub: 'Maintenance mode', sessions: 2 },
  { id: 'steady', name: 'Steady · 3 sessions/week', sub: 'On pace for your target band by exam', sessions: 3, lizPick: true },
  { id: 'intense', name: 'Intense · 5 sessions/week', sub: 'Exam in under 30 days', sessions: 5 },
];

export default function Progress({ user }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({
    totalTests: 0,
    avgBand: 0,
    byType: {},
  });
  const [filter, setFilter] = useState('all');
  // Prefer the target band captured during onboarding (user.target_band) over
  // the legacy localStorage key. Pre-onboarding users or accounts created
  // before this field existed still fall back to the old storage → 7.0 default.
  const [targetBand, setTargetBand] = useState(() => {
    if (typeof user?.target_band === 'number') return user.target_band;
    const saved = localStorage.getItem('targetBand');
    return saved ? parseFloat(saved) : 7.0;
  });
  const [showTargetModal, setShowTargetModal] = useState(false);

  // D10 SceneBar — three states: 'filled' (default dashboard), 'empty' (new user),
  // 'edit' (this week's pace modal). Auto-set to 'empty' on first paint when
  // the user has no attempts yet AND has not manually clicked a chip.
  const [scene, setScene] = useState('filled');
  const [sceneTouched, setSceneTouched] = useState(false);

  // Trend window pill — 7d / 30d / All
  const [trendWindow, setTrendWindow] = useState('30d');

  // Weekly pace selection (persisted in localStorage)
  const [weeklyPace, setWeeklyPace] = useState(() => {
    try {
      const saved = localStorage.getItem('weekly_pace');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed.id;
      }
    } catch (_e) { /* ignore */ }
    return 'steady';
  });
  const [pacePending, setPacePending] = useState(weeklyPace);

  useEffect(() => {
    if (user?.id) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      const response = await api.get(`/progress/${user.id}`);
      const data = response.data || response;
      const testAttempts = data.recent_attempts || [];
      setAttempts(testAttempts);
      setStats({
        totalTests: data.total_tests || 0,
        avgBand: data.average_band_score || 0,
        byType: data.by_type || {},
      });
    } catch (error) {
      console.error('Failed to load progress', error);
    } finally {
      setLoading(false);
    }
  };

  const skillBand = (id) => {
    const data = stats.byType?.[id];
    if (!data) return 0;
    return data.avg_score || data.avgBand || 0;
  };

  const skillCount = (id) => stats.byType?.[id]?.count || 0;

  // Identify weakest skill (with at least one attempt)
  const weakestSkill = useMemo(() => {
    const scored = SKILLS
      .map((s) => ({ ...s, band: skillBand(s.id), count: skillCount(s.id) }))
      .filter((s) => s.band > 0);
    if (!scored.length) return null;
    return scored.sort((a, b) => a.band - b.band)[0];
  }, [stats.byType]);

  // Weekly comparison (last 7d vs prior 7d)
  const weekly = useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const inRange = (a, lo, hi) => {
      const t = new Date(a.completed_at).getTime();
      return t >= lo && t < hi;
    };
    const thisWeek = attempts.filter((a) => (a.band_score || 0) > 2 && inRange(a, now - week, now + 1));
    const lastWeek = attempts.filter((a) => (a.band_score || 0) > 2 && inRange(a, now - 2 * week, now - week));
    const avg = (arr) => arr.length
      ? arr.reduce((acc, a) => acc + (a.band_score || 0), 0) / arr.length
      : 0;
    return {
      thisCount: thisWeek.length,
      lastCount: lastWeek.length,
      thisAvg: avg(thisWeek),
      lastAvg: avg(lastWeek),
      delta: avg(thisWeek) - avg(lastWeek),
    };
  }, [attempts]);

  // Writing task split — prefer backend `by_task` if present, else derive
  // averages client-side from each attempt's feedback.task1/task2.band_score.
  const writingByTask = useMemo(() => {
    const fromStats = stats.byType?.writing?.by_task;
    if (fromStats && (fromStats.task_1 || fromStats.task1 || fromStats.task_2 || fromStats.task2)) {
      const get = (k1, k2) => fromStats[k1] || fromStats[k2] || null;
      const t1 = get('task_1', 'task1');
      const t2 = get('task_2', 'task2');
      const norm = (x) => x ? { avg_score: x.avg_score ?? x.avgBand ?? x.band ?? 0, count: x.count ?? 0 } : null;
      return { t1: norm(t1), t2: norm(t2) };
    }
    const writingAttempts = attempts.filter((a) => a.test_type === 'writing');
    const t1Bands = []; const t2Bands = [];
    for (const a of writingAttempts) {
      const fb = a.feedback || {};
      const b1 = fb.task1?.band_score ?? fb.task_1?.band_score;
      const b2 = fb.task2?.band_score ?? fb.task_2?.band_score;
      if (typeof b1 === 'number') t1Bands.push(b1);
      if (typeof b2 === 'number') t2Bands.push(b2);
    }
    if (!t1Bands.length && !t2Bands.length) return null;
    const avg = (arr) => arr.length ? arr.reduce((s, b) => s + b, 0) / arr.length : 0;
    return {
      t1: t1Bands.length ? { avg_score: avg(t1Bands), count: t1Bands.length } : null,
      t2: t2Bands.length ? { avg_score: avg(t2Bands), count: t2Bands.length } : null,
    };
  }, [attempts, stats.byType]);

  // Trend points (chronological), windowed by trendWindow pill
  const trendPoints = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const cutoff = trendWindow === '7d'
      ? now - 7 * day
      : trendWindow === '30d'
        ? now - 30 * day
        : 0; // 'all'
    const inWindow = attempts
      .filter((a) => (a.band_score || 0) > 2 && new Date(a.completed_at).getTime() >= cutoff)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));
    return inWindow.map((a) => ({
      date: new Date(a.completed_at),
      band: a.band_score,
    }));
  }, [attempts, trendWindow]);

  // Recent attempts (last 7 days) — used in the narrative subline + Liz insights
  const recent7 = useMemo(() => {
    const now = Date.now();
    const cutoff = now - 7 * 24 * 60 * 60 * 1000;
    return attempts.filter((a) => new Date(a.completed_at).getTime() >= cutoff);
  }, [attempts]);

  // Bands the learner has actually reached — used to render Milestone entries
  const bandsReached = useMemo(() => {
    const set = new Set();
    for (const a of attempts) {
      const b = Math.floor(a.band_score || 0);
      if (b >= 5) set.add(b);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [attempts]);

  // First attempt date (for Milestones)
  const firstAttempt = useMemo(() => {
    if (!attempts.length) return null;
    return [...attempts].sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))[0];
  }, [attempts]);

  const handleSetTarget = (band) => {
    setTargetBand(band);
    localStorage.setItem('targetBand', band.toString());
    setShowTargetModal(false);
    if (user?.id) {
      api
        .post(`/users/${encodeURIComponent(user.id)}/onboarding`, { targetBand: band })
        .catch((err) => {
          console.warn('[progress] target band sync failed', err);
        });
    }
  };

  const handleSavePace = () => {
    setWeeklyPace(pacePending);
    try {
      const opt = PACE_OPTIONS.find((p) => p.id === pacePending) || PACE_OPTIONS[1];
      localStorage.setItem('weekly_pace', JSON.stringify({ id: opt.id, sessions: opt.sessions, savedAt: Date.now() }));
    } catch (_e) { /* ignore quota */ }
    setScene('filled');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatShortDate = (d) => {
    if (!d) return '—';
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredAttempts = filter === 'all'
    ? attempts
    : attempts.filter((a) => a.test_type === filter);

  // Auto-pick scene='empty' on first paint for new users; chip click overrides.
  useEffect(() => {
    if (loading) return;
    if (sceneTouched) return;
    if (stats.totalTests === 0 || attempts.length === 0) {
      setScene('empty');
    } else {
      setScene('filled');
    }
  }, [loading, stats.totalTests, attempts.length, sceneTouched]);

  const handleSceneChip = (s) => {
    setSceneTouched(true);
    if (s === 'edit') {
      setPacePending(weeklyPace);
    }
    setScene(s);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: `hsl(${T.bg})`, fontFamily: FONT_SANS, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ background: `hsl(${T.surface})`, padding: 28, borderRadius: 16, border: `1px solid hsl(${T.border})`, textAlign: 'center' }}>
          <p style={{ color: `hsl(${T.muted})`, marginBottom: 16 }}>Please login to view your progress</p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '10px 16px', borderRadius: 10,
              background: `hsl(${T.brand})`, color: 'white', fontWeight: 600,
              border: 0, cursor: 'pointer', boxShadow: `0 2px 0 hsl(${T.brandDark})`,
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="appshell-page" style={{ fontFamily: FONT_SANS, color: `hsl(${T.ink})` }}>
        <AppShellNav currentPage="progress" user={user} />
        <div style={{ display: 'grid', placeItems: 'center', padding: '120px 24px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: `2px solid hsl(${T.border})`, borderBottomColor: `hsl(${T.brand})`,
            animation: 'spin 0.9s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const gap = targetBand - stats.avgBand;
  const gapText = stats.avgBand > 0
    ? (gap > 0 ? `${gap.toFixed(1)} band gap` : 'Target reached')
    : null;

  return (
    <div className="appshell-page" style={{ fontFamily: FONT_SANS, color: `hsl(${T.ink})` }}>
      <AppShellNav currentPage="progress" user={user} />

      {scene === 'empty' ? (
        <EmptyScene
          scene={scene}
          onChip={handleSceneChip}
          onStart={() => navigate('/question-bank?writing=1')}
          onLater={() => handleSceneChip('filled')}
        />
      ) : (
        <FilledScene
          /* state */
          scene={scene}
          onChip={handleSceneChip}
          stats={stats}
          attempts={attempts}
          targetBand={targetBand}
          weakestSkill={weakestSkill}
          weekly={weekly}
          recent7={recent7}
          bandsReached={bandsReached}
          firstAttempt={firstAttempt}
          writingByTask={writingByTask}
          trendPoints={trendPoints}
          trendWindow={trendWindow}
          setTrendWindow={setTrendWindow}
          weeklyPace={weeklyPace}
          gap={gap}
          gapText={gapText}
          /* nav + actions */
          navigate={navigate}
          onEditPace={() => handleSceneChip('edit')}
          onEditTarget={() => setShowTargetModal(true)}
          /* history */
          filter={filter}
          setFilter={setFilter}
          filteredAttempts={filteredAttempts}
          formatDate={formatDate}
          formatShortDate={formatShortDate}
        />
      )}

      {/* Edit-pace modal — overlays current scene */}
      {scene === 'edit' && (
        <PaceModal
          targetBand={targetBand}
          pacePending={pacePending}
          setPacePending={setPacePending}
          onSave={handleSavePace}
          onCancel={() => handleSceneChip('filled')}
        />
      )}

      {/* Target Band Modal — kept from prior implementation, opens via Edit-target button */}
      {showTargetModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: `hsl(${T.ink} / 0.4)`, backdropFilter: 'blur(4px)',
          display: 'grid', placeItems: 'center', padding: 20,
        }}>
          <div style={{
            maxWidth: 440, width: '100%',
            background: `hsl(${T.surface})`, borderRadius: 24, padding: 28,
            boxShadow: `0 12px 40px hsl(220 15% 20% / 0.12)`,
          }}>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
              Set your target band
            </h3>
            <p style={{ color: `hsl(${T.muted})`, fontSize: 13, margin: '0 0 18px' }}>
              Liz uses this to set drill difficulty and study pace.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
              {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5].map((band) => {
                const sel = targetBand === band;
                return (
                  <button
                    key={band}
                    onClick={() => handleSetTarget(band)}
                    style={{
                      padding: 12, borderRadius: 12,
                      background: sel ? `hsl(${T.brand})` : `hsl(${T.borderSoft})`,
                      color: sel ? 'white' : `hsl(${T.ink})`,
                      fontWeight: 700, border: 0, cursor: 'pointer',
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    {band.toFixed(1)}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowTargetModal(false)}
              style={{
                width: '100%', padding: '10px 16px', borderRadius: 10,
                background: 'transparent', color: `hsl(${T.muted})`, fontWeight: 500,
                border: `1px solid hsl(${T.border})`, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------- scene shells -------- */

function SceneBar({ scene, onChip }) {
  const chips = [
    { id: 'filled', label: 'Active learner' },
    { id: 'empty', label: 'New user' },
    { id: 'edit', label: 'Edit goal' },
  ];
  return (
    <div style={{
      flex: '0 0 auto',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: 6, borderRadius: 999,
      background: `hsl(${T.ink} / 0.85)`, backdropFilter: 'blur(8px)',
      boxShadow: `0 12px 40px hsl(220 15% 20% / 0.18)`,
      color: 'white', fontSize: 12,
    }}>
      <span style={{ padding: '0 10px', opacity: 0.6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Scene
      </span>
      {chips.map((c) => {
        const active = scene === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onChip(c.id)}
            data-active={active ? 'true' : 'false'}
            data-testid={`progress-scene-${c.id}`}
            style={{
              padding: '7px 12px', borderRadius: 999,
              color: 'white', opacity: active ? 1 : 0.7,
              fontWeight: 500, border: 0, cursor: 'pointer',
              background: active ? `hsl(${T.brand})` : 'transparent',
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyScene({ scene, onChip, onStart, onLater }) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>
      <PageHead
        kicker="Progress"
        title="Nothing to show — yet."
        subtitle="Progress starts with a baseline. 10 minutes with Liz, and this page fills up with your band, trend, weak spots, and a plan tuned to your exam date."
        scene={scene}
        onChip={onChip}
      />

      <div style={{
        padding: '60px 28px', textAlign: 'center',
        borderRadius: 24, background: `hsl(${T.surface})`,
        border: `1px dashed hsl(${T.border})`,
      }}>
        <div style={{
          margin: '0 auto 14px', width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
          display: 'grid', placeItems: 'center', color: 'white',
          fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 700,
          boxShadow: `0 6px 20px hsl(${T.brand} / 0.3)`,
        }}>L</div>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600, margin: '0 0 8px' }}>
          Let me size you up first.
        </h2>
        <p style={{ color: `hsl(${T.muted})`, maxWidth: 440, margin: '0 auto 20px' }}>
          I'll give you one writing prompt and ask three speaking questions. That's all I need to estimate your current band and plan the rest.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onStart}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: `hsl(${T.brand})`, color: 'white', fontWeight: 600,
              border: 0, cursor: 'pointer', boxShadow: `0 2px 0 hsl(${T.brandDark})`,
            }}
          >
            Start baseline · 10 min
          </button>
          <button
            onClick={onLater}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'transparent', color: `hsl(${T.muted})`, fontWeight: 500,
              border: 0, cursor: 'pointer',
            }}
          >
            I'll do it later
          </button>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          margin: '28px auto 0', maxWidth: 720,
        }}>
          {SKILLS.map(({ id, label }) => (
            <div key={id} style={{
              padding: 14, borderRadius: 16,
              background: `hsl(${T.bg})`, border: `1px dashed hsl(${T.border})`,
              textAlign: 'center', color: `hsl(${T.fainter})`, fontSize: 13,
            }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: `hsl(${T.fainter})`, marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 12, color: `hsl(${T.fainter})` }}>
                Take a test to see your trend
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilledScene(props) {
  const {
    scene, onChip,
    stats, attempts, targetBand, weakestSkill, weekly, recent7, bandsReached, firstAttempt,
    writingByTask, trendPoints, trendWindow, setTrendWindow, weeklyPace, gap, gapText,
    navigate, onEditPace, onEditTarget,
    filter, setFilter, filteredAttempts, formatDate, formatShortDate,
  } = props;

  const targetReached = stats.avgBand > 0 && gap <= 0;
  const headline = targetReached
    ? `You're at Band ${targetBand.toFixed(1)}`
    : `You're closing the gap on Band ${targetBand.toFixed(1)}`;

  const subline = recent7.length > 0
    ? `Last 7 days: ${recent7.length} attempt${recent7.length !== 1 ? 's' : ''}${weakestSkill ? ` · ${weakestSkill.label.toLowerCase()} is your current weak spot` : ''}.`
    : (stats.totalTests > 0
        ? `${stats.totalTests} test${stats.totalTests !== 1 ? 's' : ''} taken so far${weakestSkill ? ` · ${weakestSkill.label.toLowerCase()} is your current weak spot` : ''}.`
        : 'Track your IELTS journey and improvement.');

  const paceOpt = PACE_OPTIONS.find((p) => p.id === weeklyPace) || PACE_OPTIONS[1];

  // Recommended skill (next-best target after weakest)
  const recommendedSkill = useMemo(() => {
    const scored = SKILLS
      .map((s) => ({ ...s, band: stats.byType?.[s.id]?.avg_score || stats.byType?.[s.id]?.avgBand || 0, count: stats.byType?.[s.id]?.count || 0 }))
      .filter((s) => weakestSkill ? s.id !== weakestSkill.id : true);
    if (!scored.length) return null;
    const noPractice = scored.find((s) => s.count === 0);
    if (noPractice) return noPractice;
    return scored.sort((a, b) => a.band - b.band)[0];
  }, [stats.byType, weakestSkill]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 48px' }}>

      <BackLink onClick={() => navigate('/dashboard')} />

      <PageHead
        kicker="Progress"
        title={headline}
        subtitle={subline}
        scene={scene}
        onChip={onChip}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)',
        gap: 20,
      }} className="d10-layout">
        <style>{`@media (max-width: 1040px) { .d10-layout { grid-template-columns: 1fr !important; } .d10-band-hero { grid-template-columns: 1fr !important; } }`}</style>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Band hero panel */}
          <Panel>
            <div className="d10-band-hero" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr',
              gap: 24,
              alignItems: 'center',
            }}>
              <div>
                <Kicker>Estimated overall band</Kicker>
                <div style={{
                  fontFamily: FONT_DISPLAY, fontSize: 64, fontWeight: 600,
                  lineHeight: 1, letterSpacing: '-0.02em',
                  color: `hsl(${T.brandDark})`, margin: '4px 0',
                }}>
                  {stats.avgBand > 0 ? stats.avgBand.toFixed(1) : '—'}
                </div>
                {weekly.lastCount > 0 && weekly.delta !== 0 && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 999,
                    background: weekly.delta > 0 ? `hsl(${T.brand} / 0.12)` : `hsl(${T.rose} / 0.12)`,
                    color: weekly.delta > 0 ? `hsl(${T.brandDark})` : `hsl(${T.rose})`,
                    fontWeight: 600, fontSize: 13,
                  }}>
                    <TrendingUp style={{ width: 12, height: 12, transform: weekly.delta < 0 ? 'rotate(180deg)' : 'none' }} />
                    {weekly.delta > 0 ? '+' : ''}{weekly.delta.toFixed(1)} vs last week
                  </div>
                )}
                <div style={{ marginTop: 14, fontSize: 13, color: `hsl(${T.muted})`, maxWidth: 260 }}>
                  Target: Band {targetBand.toFixed(1)}{gapText ? ` · ${gapText}` : ''}
                  <button
                    onClick={onEditTarget}
                    style={{
                      marginLeft: 8, padding: '2px 8px', borderRadius: 999,
                      background: `hsl(${T.borderSoft})`, color: `hsl(${T.muted})`,
                      fontSize: 11, fontWeight: 600, border: 0, cursor: 'pointer',
                    }}
                  >Edit</button>
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: `hsl(${T.fainter})` }}>
                  {recent7.length > 0
                    ? `Based on ${recent7.length} recent attempt${recent7.length !== 1 ? 's' : ''}`
                    : 'Take a test to see your trend'}
                </div>
              </div>

              {/* Radar SVG */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <RadarChart
                  skills={SKILLS}
                  actual={SKILLS.map((s) => stats.byType?.[s.id]?.avg_score || stats.byType?.[s.id]?.avgBand || 0)}
                  target={targetBand}
                />
                <div style={{
                  display: 'flex', gap: 20, marginTop: 8,
                  fontSize: 12, color: `hsl(${T.muted})`,
                }}>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: `hsl(${T.brand})`, marginRight: 6, verticalAlign: 'middle' }} />
                    Current
                  </span>
                  <span>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: `hsl(${T.gold})`, opacity: 0.6, marginRight: 6, verticalAlign: 'middle' }} />
                    Target
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Trend chart panel */}
          <Panel>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <Kicker>Band trend</Kicker>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 0' }}>
                  {trendWindow === '7d' ? 'Last 7 days' : trendWindow === '30d' ? 'Last 30 days' : 'All time'}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['7d', '30d', 'all'].map((w) => {
                  const active = trendWindow === w;
                  return (
                    <button
                      key={w}
                      onClick={() => setTrendWindow(w)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        background: active ? `hsl(${T.brand} / 0.08)` : 'transparent',
                        color: active ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                        border: 0, cursor: 'pointer',
                      }}
                    >
                      {w === '7d' ? '7d' : w === '30d' ? '30d' : 'All'}
                    </button>
                  );
                })}
              </div>
            </div>

            {trendPoints.length >= 2 ? (
              <TrendChart points={trendPoints} target={targetBand} />
            ) : (
              <div style={{
                padding: '40px 16px', textAlign: 'center',
                borderRadius: 12, background: `hsl(${T.bg})`,
                border: `1px dashed hsl(${T.border})`,
                color: `hsl(${T.fainter})`, fontSize: 13,
              }}>
                Take a test to see your trend.
              </div>
            )}
          </Panel>

          {/* Skills breakdown panel */}
          <Panel>
            <Kicker>By skill</Kicker>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 12px' }}>
              Where to focus this week
            </h3>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12,
            }}>
              {SKILLS.map(({ id, label, Icon }) => {
                const band = stats.byType?.[id]?.avg_score || stats.byType?.[id]?.avgBand || 0;
                const count = stats.byType?.[id]?.count || 0;
                const isWeakest = weakestSkill?.id === id;
                const targetMarkLeft = `${bandPct(targetBand)}%`;
                const fill = `${bandPct(band)}%`;
                const desc = STRENGTH_DESCRIPTORS[id];
                return (
                  <div
                    key={id}
                    data-testid={`strength-${id}`}
                    style={{
                      padding: 14, borderRadius: 16,
                      border: `1px solid ${isWeakest ? `hsl(${T.rose} / 0.5)` : `hsl(${T.border})`}`,
                      background: isWeakest ? `hsl(${T.rose} / 0.03)` : `hsl(${T.surface})`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon style={{ width: 14, height: 14, color: `hsl(${T.muted})` }} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>
                        {isWeakest && (
                          <span style={{
                            padding: '2px 8px', borderRadius: 999,
                            background: `hsl(${T.rose} / 0.15)`, color: `hsl(${T.rose})`,
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                          }}>Weakest</span>
                        )}
                      </div>
                      <span style={{
                        fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, lineHeight: 1,
                        color: band > 0 ? `hsl(${T.brandDark})` : `hsl(${T.fainter})`,
                      }}>
                        {band > 0 ? band.toFixed(1) : '—'}
                      </span>
                    </div>
                    <div style={{
                      height: 8, borderRadius: 4, background: `hsl(${T.border})`,
                      position: 'relative', overflow: 'visible',
                    }}>
                      <div style={{
                        height: '100%', width: fill,
                        background: `linear-gradient(90deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
                        borderRadius: 4, transition: 'width 400ms',
                      }} />
                      <span style={{
                        position: 'absolute', top: -2, bottom: -2, left: targetMarkLeft,
                        width: 2, background: `hsl(${T.gold})`, borderRadius: 1,
                      }} />
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      marginTop: 6, fontSize: 11, color: `hsl(${T.muted})`,
                      fontFamily: FONT_MONO,
                    }}>
                      <span>Target {targetBand.toFixed(1)}{band > 0 && targetBand > band ? ` (${(targetBand - band).toFixed(1)} to go)` : ''}</span>
                      <span>{count} test{count !== 1 ? 's' : ''}</span>
                    </div>
                    {desc && band > 0 && (
                      <div style={{ marginTop: 8, fontSize: 12, color: `hsl(${T.muted})` }}>
                        {desc.emoji} {desc.text}
                      </div>
                    )}
                    {id === 'writing' && writingByTask && (writingByTask.t1 || writingByTask.t2) && (
                      <div style={{
                        marginTop: 10, paddingTop: 10,
                        borderTop: `1px dashed hsl(${T.border})`,
                        display: 'flex', flexDirection: 'column', gap: 6,
                      }} data-testid="writing-by-task">
                        {[
                          { key: 't1', label: 'Task 1', d: writingByTask.t1 },
                          { key: 't2', label: 'Task 2', d: writingByTask.t2 },
                        ].map(({ key, label: tLabel, d }) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                              color: `hsl(${T.muted})`, width: 44, flexShrink: 0,
                            }}>
                              {tLabel}
                            </span>
                            <div style={{
                              flex: 1, height: 6, borderRadius: 3,
                              background: `hsl(${T.border})`, position: 'relative', overflow: 'hidden',
                            }}>
                              {d?.avg_score > 0 && (
                                <div style={{
                                  height: '100%', width: `${bandPct(d.avg_score)}%`,
                                  background: key === 't1'
                                    ? `hsl(${T.sky})`
                                    : `linear-gradient(90deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
                                  borderRadius: 3,
                                }} />
                              )}
                            </div>
                            <span style={{
                              fontSize: 11, fontFamily: FONT_MONO,
                              color: d?.avg_score > 0 ? `hsl(${T.brandDark})` : `hsl(${T.fainter})`,
                              width: 28, textAlign: 'right', flexShrink: 0,
                            }}>
                              {d?.avg_score > 0 ? d.avg_score.toFixed(1) : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* This Week with Liz */}
          <Panel>
            <div style={{
              background: `linear-gradient(135deg, hsl(${T.brand} / 0.08), hsl(${T.sky} / 0.08))`,
              border: `1px solid hsl(${T.brand} / 0.22)`,
              borderRadius: 16, padding: 18,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: `linear-gradient(135deg, hsl(${T.brand}) 0%, hsl(${T.sky}) 100%)`,
                  display: 'grid', placeItems: 'center', color: 'white',
                  fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 15,
                  flex: '0 0 34px',
                }}>L</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: `hsl(${T.brandDark})`, fontWeight: 600 }}>
                    This week with Liz
                  </div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 600 }}>
                    {paceOpt.sessions} session{paceOpt.sessions !== 1 ? 's' : ''} · {paceOpt.id} pace
                  </div>
                </div>
                <button
                  onClick={onEditPace}
                  style={{
                    marginLeft: 'auto', padding: '5px 10px', borderRadius: 8,
                    color: `hsl(${T.brandDark})`, fontSize: 12, fontWeight: 600,
                    background: 'transparent', border: 0, cursor: 'pointer',
                  }}
                >Edit</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '10px 0 8px' }}>
                {Array.from({ length: paceOpt.sessions }).map((_, i) => {
                  const done = i < Math.min(weekly.thisCount, paceOpt.sessions);
                  return (
                    <span
                      key={i}
                      style={{
                        flex: 1, height: 10, borderRadius: 5,
                        background: done ? `hsl(${T.brand})` : `hsl(${T.surface})`,
                        border: `1px solid ${done ? `hsl(${T.brand})` : `hsl(${T.brand} / 0.25)`}`,
                      }}
                    />
                  );
                })}
              </div>
              <div style={{ fontSize: 13, color: `hsl(${T.ink} / 0.8)` }}>
                <b>{Math.min(weekly.thisCount, paceOpt.sessions)} of {paceOpt.sessions} done</b>
                {weekly.thisCount >= paceOpt.sessions
                  ? ' — pace hit for this week.'
                  : ' — keep going to stay on pace.'}{' '}
                <em style={{ fontStyle: 'normal', color: `hsl(${T.muted})` }}>
                  I scheduled {paceOpt.sessions} sessions this week — {paceOpt.id} pace.
                </em>
              </div>
            </div>
          </Panel>

          {/* Liz's Read insights */}
          <Panel>
            <Kicker>Liz's read</Kicker>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 12px' }}>
              What's working, what's not
            </h3>
            {recent7.length < 3 && stats.totalTests < 3 ? (
              <div style={{
                padding: '20px 16px', textAlign: 'center',
                borderRadius: 12, background: `hsl(${T.bg})`,
                border: `1px dashed hsl(${T.border})`,
                color: `hsl(${T.fainter})`, fontSize: 13,
              }}>
                Take 3 tests and I'll have something to say.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {weakestSkill && (
                  <Insight kind="gap" title={`Your weakest skill is ${weakestSkill.label}`}>
                    Let's drill it. A targeted session this week will move the needle the fastest.
                  </Insight>
                )}
                <Insight kind="win" title={`${recent7.length} attempt${recent7.length !== 1 ? 's' : ''} in the last 7 days`}>
                  {recent7.length >= 3
                    ? "You're keeping the rhythm — that's where the trend comes from."
                    : 'Bump it to 3+ to see a clean trend line.'}
                </Insight>
                {recommendedSkill && (
                  <Insight kind="next" title={`Try ${recommendedSkill.label} this week`}>
                    {recommendedSkill.count === 0
                      ? "You haven't logged a test here yet — let's establish a baseline."
                      : 'A second pass will firm up the read on this skill.'}
                  </Insight>
                )}
              </div>
            )}
          </Panel>

          {/* Milestones */}
          <Panel>
            <Kicker>Milestones</Kicker>
            <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600, margin: '4px 0 0' }}>
              Road to your exam
            </h3>
            <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
              <Milestone done={!!firstAttempt} label="First attempt" date={firstAttempt ? formatShortDate(firstAttempt.completed_at) : '—'} />
              {bandsReached.map((b) => (
                <Milestone key={b} done label={`Band ${b} unlocked`} date="—" />
              ))}
              <Milestone next={!firstAttempt ? false : true} label="Full mock test" date="Schedule it" />
              <Milestone label="Exam day" date="Set your exam date" />
            </ul>
          </Panel>
        </div>

      </div>

      {/* Test History */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, margin: 0 }}>
            Test history
          </h3>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['all', 'reading', 'listening', 'writing', 'speaking'].map((type) => {
              const active = filter === type;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    padding: '6px 12px', borderRadius: 999,
                    background: active ? `hsl(${T.brand} / 0.10)` : `hsl(${T.surface})`,
                    border: `1px solid ${active ? `hsl(${T.brand} / 0.5)` : `hsl(${T.border})`}`,
                    color: active ? `hsl(${T.brandDark})` : `hsl(${T.muted})`,
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick start row — preserves the deep-link testids */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => navigate('/test/reading')}
            data-testid="quick-start-reading"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 12, borderRadius: 12,
              background: `hsl(${T.surface})`, border: `1px solid hsl(${T.brand} / 0.25)`,
              textAlign: 'left', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 34, height: 34, flex: '0 0 34px', borderRadius: 10,
              background: `hsl(${T.brand} / 0.12)`,
              display: 'grid', placeItems: 'center', color: `hsl(${T.brandDark})`,
            }}>
              <BookOpen style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Random reading test</div>
              <div style={{ fontSize: 12, color: `hsl(${T.muted})` }}>Start a fresh passage now</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: `hsl(${T.muted})` }} />
          </button>
          <button
            onClick={() => navigate('/advanced-mastery')}
            data-testid="quick-start-advanced"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: 12, borderRadius: 12,
              background: `hsl(${T.surface})`, border: `1px solid hsl(${T.gold} / 0.35)`,
              textAlign: 'left', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 34, height: 34, flex: '0 0 34px', borderRadius: 10,
              background: `hsl(${T.gold} / 0.18)`,
              display: 'grid', placeItems: 'center', color: `hsl(35 80% 36%)`,
            }}>
              <Award style={{ width: 16, height: 16 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Advanced Mastery</div>
              <div style={{ fontSize: 12, color: `hsl(${T.muted})` }}>Band 7+ drills curated by Liz</div>
            </div>
            <ChevronRight style={{ width: 16, height: 16, color: `hsl(${T.muted})` }} />
          </button>
        </div>

        {filteredAttempts.length === 0 ? (
          <div style={{
            padding: 40, borderRadius: 16,
            background: `hsl(${T.surface})`, border: `1px dashed hsl(${T.border})`,
            textAlign: 'center', color: `hsl(${T.muted})`,
          }}>
            No {filter === 'all' ? '' : filter} tests in this view yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredAttempts.map((attempt, idx) => (
              <AttemptRow
                key={attempt.id || idx}
                attempt={attempt}
                formatDate={formatDate}
                onClick={() => navigate(`/results/${attempt.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PaceModal({ targetBand, pacePending, setPacePending, onSave, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: `hsl(${T.ink} / 0.4)`, backdropFilter: 'blur(4px)',
      display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div style={{
        maxWidth: 440, width: '100%',
        background: `hsl(${T.surface})`, borderRadius: 24, padding: 28,
        boxShadow: `0 12px 40px hsl(220 15% 20% / 0.12)`,
      }}>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600, margin: '0 0 6px' }}>
          This week's pace
        </h3>
        <p style={{ color: `hsl(${T.muted})`, fontSize: 13, margin: '0 0 18px' }}>
          Liz will adjust feedback intensity and drill difficulty based on what you pick.
        </p>
        {PACE_OPTIONS.map((opt) => {
          const sel = pacePending === opt.id;
          const sub = opt.id === 'steady'
            ? `On pace for Band ${targetBand.toFixed(1)} by exam`
            : opt.sub;
          return (
            <label
              key={opt.id}
              onClick={() => setPacePending(opt.id)}
              data-selected={sel ? 'true' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px',
                border: `1.5px solid ${sel ? `hsl(${T.brand})` : `hsl(${T.border})`}`,
                background: sel ? `hsl(${T.brand} / 0.06)` : 'transparent',
                borderRadius: 16, marginBottom: 8, cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                border: `2px solid ${sel ? `hsl(${T.brand})` : `hsl(${T.border})`}`,
                flex: '0 0 18px',
                background: sel ? `radial-gradient(circle, hsl(${T.brand}) 40%, transparent 42%)` : 'transparent',
              }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.name}</div>
                <div style={{ fontSize: 12, color: `hsl(${T.muted})` }}>{sub}</div>
              </div>
              {opt.lizPick && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, padding: '3px 8px', borderRadius: 999,
                  background: `hsl(${T.brand} / 0.12)`, color: `hsl(${T.brandDark})`,
                  fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
                }}>
                  Liz picks
                </span>
              )}
            </label>
          );
        })}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 16px', borderRadius: 10,
              background: 'transparent', color: `hsl(${T.muted})`, fontWeight: 500,
              border: 0, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{
              padding: '10px 16px', borderRadius: 10,
              background: `hsl(${T.brand})`, color: 'white', fontWeight: 600,
              border: 0, cursor: 'pointer', boxShadow: `0 2px 0 hsl(${T.brandDark})`,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------- helper components -------- */

function BackLink({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 0', marginBottom: 14,
        background: 'none', border: 0, cursor: 'pointer',
        color: `hsl(${T.muted})`, fontSize: 13, fontWeight: 500,
      }}
    >
      <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Dashboard
    </button>
  );
}

function PageHead({ kicker, title, subtitle, scene, onChip }) {
  return (
    <header style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: `hsl(${T.brandDark})`, fontWeight: 600 }}>
          {kicker}
        </div>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 36, fontWeight: 600, letterSpacing: '-0.01em', margin: '4px 0 0' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', color: `hsl(${T.muted})`, maxWidth: 560 }}>
            {subtitle}
          </p>
        )}
      </div>
      {scene && onChip && <SceneBar scene={scene} onChip={onChip} />}
    </header>
  );
}

function Panel({ children }) {
  return (
    <section style={{
      background: `hsl(${T.surface})`, border: `1px solid hsl(${T.border})`,
      borderRadius: 24, padding: 22,
      boxShadow: `0 1px 2px hsl(220 15% 20% / 0.04), 0 1px 3px hsl(220 15% 20% / 0.06)`,
    }}>
      {children}
    </section>
  );
}

function Kicker({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: `hsl(${T.muted})`, fontWeight: 600 }}>
      {children}
    </div>
  );
}

function Insight({ kind, title, children }) {
  const palette = kind === 'win'
    ? { bg: `hsl(${T.brand} / 0.14)`, fg: `hsl(${T.brandDark})`, glyph: '✓' }
    : kind === 'gap'
      ? { bg: `hsl(${T.gold} / 0.18)`, fg: `hsl(35 70% 30%)`, glyph: '!' }
      : { bg: `hsl(${T.sky} / 0.18)`, fg: `hsl(199 90% 30%)`, glyph: '→' };
  return (
    <div style={{
      display: 'flex', gap: 12, padding: 14, borderRadius: 16,
      background: `hsl(${T.bg})`, border: `1px solid hsl(${T.border})`,
    }}>
      <div style={{
        flex: '0 0 34px', width: 34, height: 34, borderRadius: 10,
        display: 'grid', placeItems: 'center', fontSize: 16,
        background: palette.bg, color: palette.fg,
      }}>
        {palette.glyph}
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600 }}>{title}</h4>
        <p style={{ margin: 0, fontSize: 13, color: `hsl(${T.ink} / 0.8)` }}>{children}</p>
      </div>
    </div>
  );
}

function Milestone({ done, next, label, date }) {
  const dotBg = done
    ? `hsl(${T.brand})`
    : next
      ? `hsl(${T.gold} / 0.2)`
      : `hsl(${T.surface})`;
  const dotBorder = done
    ? `hsl(${T.brand})`
    : next
      ? `hsl(${T.gold})`
      : `hsl(${T.border})`;
  const shadow = next ? `0 0 0 3px hsl(${T.gold} / 0.15)` : 'none';
  return (
    <li style={{
      display: 'flex', gap: 10, padding: '10px 0',
      borderTop: `1px dashed hsl(${T.border})`, fontSize: 13,
    }}>
      <span style={{
        flex: '0 0 18px', width: 18, height: 18, borderRadius: '50%',
        background: dotBg, border: `2px solid ${dotBorder}`,
        boxShadow: shadow, marginTop: 2,
      }} />
      <div>
        <b style={{ fontWeight: 600 }}>{label}</b>
        <div style={{ color: `hsl(${T.muted})`, fontSize: 12 }}>{date}</div>
      </div>
    </li>
  );
}

function RadarChart({ skills, actual, target }) {
  // Polygon points for actual + target
  const actualPts = skills
    .map((_, idx) => {
      const v = actual[idx] || 0;
      const { x, y } = radarPoint(idx, v);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const targetPts = skills
    .map((_, idx) => {
      const { x, y } = radarPoint(idx, target);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const labelPos = [
    { x: 0, y: -160, anchor: 'middle' },   // top
    { x: 165, y: 4, anchor: 'middle' },    // right
    { x: 0, y: 172, anchor: 'middle' },    // bottom
    { x: -165, y: 4, anchor: 'middle' },   // left
  ];

  return (
    <svg viewBox="-180 -180 360 360" style={{ width: 280, height: 280 }} aria-label="Band skill radar">
      {/* concentric grids — 9, 7, 5, 3 */}
      {[9, 7, 5, 3].map((b) => (
        <circle
          key={b}
          cx={0}
          cy={0}
          r={(b / 9) * 140}
          fill={`hsl(${T.bg})`}
          fillOpacity={0.5}
          stroke={`hsl(${T.border})`}
          strokeWidth={1}
        />
      ))}
      {/* axes */}
      <line x1={0} y1={0} x2={0} y2={-140} stroke={`hsl(${T.border})`} strokeWidth={1} />
      <line x1={0} y1={0} x2={140} y2={0} stroke={`hsl(${T.border})`} strokeWidth={1} />
      <line x1={0} y1={0} x2={0} y2={140} stroke={`hsl(${T.border})`} strokeWidth={1} />
      <line x1={0} y1={0} x2={-140} y2={0} stroke={`hsl(${T.border})`} strokeWidth={1} />

      {/* target polygon */}
      <polygon
        points={targetPts}
        fill={`hsl(${T.gold} / 0.18)`}
        stroke={`hsl(${T.gold})`}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* actual polygon */}
      <polygon
        points={actualPts}
        fill={`hsl(${T.brand} / 0.25)`}
        stroke={`hsl(${T.brand})`}
        strokeWidth={2}
      />

      {/* labels */}
      {skills.map((s, idx) => (
        <g key={s.id}>
          <text
            x={labelPos[idx].x}
            y={labelPos[idx].y}
            textAnchor={labelPos[idx].anchor}
            style={{ fontSize: 13, fontWeight: 600, fill: `hsl(${T.ink})` }}
          >
            {s.label}
          </text>
          <text
            x={labelPos[idx].x}
            y={labelPos[idx].y + (idx === 2 ? 16 : -16)}
            textAnchor={labelPos[idx].anchor}
            style={{ fontSize: 11, fill: `hsl(${T.muted})`, fontWeight: 500 }}
          >
            {actual[idx] > 0 ? `${actual[idx].toFixed(1)} → ${target.toFixed(1)}` : `— → ${target.toFixed(1)}`}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TrendChart({ points, target }) {
  const W = 560;
  const H = 120;
  const padX = 16;
  const padY = 16;
  // y axis: 4.0 → 9.0 mapped to H-padY → padY
  const minBand = 4.0;
  const maxBand = 9.0;
  const yFor = (band) => H - padY - ((band - minBand) / (maxBand - minBand)) * (H - 2 * padY);
  const xFor = (i) => padX + (i / Math.max(1, points.length - 1)) * (W - 2 * padX);

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)},${yFor(p.band).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${xFor(points.length - 1).toFixed(1)},${(H - padY).toFixed(1)} L ${xFor(0).toFixed(1)},${(H - padY).toFixed(1)} Z`;

  const targetY = yFor(target);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 120, width: '100%', marginTop: 4 }}>
        {/* grid lines at bands 5, 6, 7, 8 */}
        {[5, 6, 7, 8].map((b) => (
          <line
            key={b}
            x1={0} y1={yFor(b)} x2={W} y2={yFor(b)}
            stroke={`hsl(${T.borderSoft})`} strokeWidth={1} strokeDasharray="2 4"
          />
        ))}
        {/* target line */}
        <line x1={0} y1={targetY} x2={W} y2={targetY}
          stroke={`hsl(${T.gold})`} strokeWidth={1.5} strokeDasharray="4 4" />
        {/* area + line */}
        <path d={areaPath} fill={`hsl(${T.brand} / 0.12)`} />
        <path d={linePath} stroke={`hsl(${T.brand})`} strokeWidth={2.5} fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={xFor(i)} cy={yFor(p.band)} r={4}
            fill={`hsl(${T.brand})`}
            stroke={`hsl(${T.surface})`} strokeWidth={2}
          />
        ))}
        {/* y labels */}
        <text x={4} y={yFor(target) - 4} style={{ fontSize: 10, fontFamily: FONT_MONO, fontWeight: 600, fill: `hsl(43 60% 40%)` }}>
          {target.toFixed(1)} target
        </text>
      </svg>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: `hsl(${T.muted})`,
        fontFamily: FONT_MONO, marginTop: 4,
      }}>
        <span>{points[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{points[points.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · today</span>
      </div>
    </div>
  );
}

function AttemptRow({ attempt, formatDate, onClick }) {
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
