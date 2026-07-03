// ProgressPage — the Progress page (route /progress).
// Orchestrator extracted from pages/Progress.js (Faz1 refactor); body verbatim,
// scene components moved to ./components/, module constants + helpers to ./constants.
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import AppShellNav from '../../components/appshell/AppShellNav';
import { T, FONT_DISPLAY, FONT_SANS, SKILLS, PACE_OPTIONS } from './constants';
import EmptyScene from './components/EmptyScene';
import FilledScene from './components/FilledScene';
import PaceModal from './components/PaceModal';

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
