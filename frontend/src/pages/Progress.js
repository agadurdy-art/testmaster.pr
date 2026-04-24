import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Target,
  BookOpen,
  Headphones,
  Mic,
  PenTool,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import api from '../lib/api';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';

const INTENSITY = {
  light:   { label: 'Light',   slots: 2, desc: '2 sessions / week' },
  steady:  { label: 'Steady',  slots: 4, desc: '4 sessions / week' },
  intense: { label: 'Intense', slots: 6, desc: '6 sessions / week' },
};

const SKILL_META = {
  reading:   { label: 'Reading',   Icon: BookOpen,   color: '#3b82f6' },
  listening: { label: 'Listening', Icon: Headphones, color: '#8b5cf6' },
  writing:   { label: 'Writing',   Icon: PenTool,    color: '#f59e0b' },
  speaking:  { label: 'Speaking',  Icon: Mic,        color: '#10b981' },
};

function skillBandFromStats(stats, key) {
  const d = stats?.byType?.[key];
  if (!d) return 0;
  return Number(d.avg_score ?? d.avgBand ?? 0);
}

export default function Progress({ user }) {
  const navigate = useNavigate();
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;

  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';

  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({ totalTests: 0, avgBand: 0, byType: {} });
  const [targetBand, setTargetBand] = useState(() => {
    const saved = localStorage.getItem('targetBand');
    return saved ? parseFloat(saved) : user?.target_band || 7.0;
  });
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalIntensity, setGoalIntensity] = useState(() =>
    localStorage.getItem('lizWeeklyIntensity') || 'steady'
  );
  const [goalCompleted, setGoalCompleted] = useState(() => {
    const raw = localStorage.getItem('lizWeeklyCompleted');
    return raw ? parseInt(raw, 10) : 0;
  });

  useEffect(() => {
    if (user?.id) loadProgress();
  }, [user]);

  const loadProgress = async () => {
    setLoading(true);
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
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  // Persist target band
  const updateTarget = async (band) => {
    setTargetBand(band);
    localStorage.setItem('targetBand', String(band));
    try {
      await api.post(`/users/${user.id}/onboarding`, { target_band: band });
    } catch (_) { /* best effort */ }
  };

  const updateGoal = (intensity) => {
    setGoalIntensity(intensity);
    localStorage.setItem('lizWeeklyIntensity', intensity);
    setGoalOpen(false);
  };

  // ============ DERIVED DATA ============
  const skillKeys = ['reading', 'listening', 'writing', 'speaking'];
  const radarData = skillKeys.map((k) => ({
    skill: SKILL_META[k].label,
    actual: skillBandFromStats(stats, k),
    target: targetBand,
  }));

  const weakestSkill = useMemo(() => {
    const entries = skillKeys
      .map((k) => ({ key: k, band: skillBandFromStats(stats, k) }))
      .filter((e) => e.band > 0)
      .sort((a, b) => a.band - b.band);
    return entries[0] || null;
  }, [stats]);

  // 30-day trend
  const trendData = useMemo(() => {
    const now = Date.now();
    const windowStart = now - 30 * 24 * 60 * 60 * 1000;
    const items = attempts
      .filter((a) => a.completed_at && new Date(a.completed_at).getTime() >= windowStart)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))
      .map((a) => ({
        date: new Date(a.completed_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
        band: Number(a.band_score) || null,
      }));
    return items;
  }, [attempts]);

  const trendChange = useMemo(() => {
    if (trendData.length < 2) return 0;
    return Number((trendData[trendData.length - 1].band - trendData[0].band || 0).toFixed(1));
  }, [trendData]);

  // Client-derived insights
  const insights = useMemo(() => {
    const wins = [];
    const gaps = [];
    const next = [];
    if (!weakestSkill && stats.totalTests === 0) {
      next.push({ text: 'Take your baseline drill to set targets.', cta: { label: 'Start baseline', route: '/dashboard' } });
      return { wins, gaps, next };
    }
    // Wins: any skill >= target, or positive trendChange
    skillKeys.forEach((k) => {
      const b = skillBandFromStats(stats, k);
      if (b >= targetBand && b > 0) {
        wins.push({ text: `${SKILL_META[k].label} is at or above target (${b.toFixed(1)}).` });
      }
    });
    if (trendChange > 0.2) {
      wins.push({ text: `Overall band trending up (+${trendChange} in 30 days).` });
    }
    // Gaps
    if (weakestSkill) {
      gaps.push({ text: `${SKILL_META[weakestSkill.key].label} is your weakest skill (${weakestSkill.band.toFixed(1)}).` });
    }
    const gap = targetBand - stats.avgBand;
    if (gap > 1) {
      gaps.push({ text: `Overall gap to target is ${gap.toFixed(1)} — plan for a focused 6–8 week push.` });
    }
    // Next
    if (weakestSkill) {
      const route = weakestSkill.key === 'writing'
        ? '/question-bank' : weakestSkill.key === 'speaking'
        ? '/liz' : '/question-bank';
      next.push({
        text: `Do 2 ${SKILL_META[weakestSkill.key].label} drills this week.`,
        cta: { label: `Open ${SKILL_META[weakestSkill.key].label} practice`, route },
      });
    }
    if (stats.totalTests >= 5) {
      next.push({ text: 'Run a full mock test for calibration.', cta: { label: 'Full tests', route: '/question-bank' } });
    }
    return { wins, gaps, next };
  }, [stats, targetBand, weakestSkill, trendChange]);

  // ============ EMPTY / LOADING ============
  if (!user) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
        <Card className={`p-8 text-center ${bgCard}`}>
          <p className={`${textSecondary} mb-4`}>Please login to view your progress</p>
          <Button onClick={() => navigate('/')}>Go to Login</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center`}>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = stats.totalTests > 0;

  // ============ RENDER ============
  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      <header className={`border-b sticky top-0 z-40 shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-500" />
            <div>
              <h1 className={`text-xl font-bold ${textPrimary}`}>Progress</h1>
              <p className={`text-[11px] -mt-1 ${textSecondary}`}>by testmaster.pro</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ===== BIG BAND + RADAR ===== */}
        <div className="grid md:grid-cols-[380px_1fr] gap-5 mb-5">
          {/* Big band */}
          <Card className={`p-6 ${bgCard}`}>
            <div className={`text-xs font-semibold uppercase tracking-widest ${textSecondary}`}>Current band</div>
            <div className="flex items-end gap-3 mt-1">
              <div className={`text-6xl font-bold ${textPrimary}`} style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {hasData ? stats.avgBand.toFixed(1) : '—'}
              </div>
              {hasData && trendChange !== 0 && (
                <div className={`mb-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  trendChange > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  {trendChange > 0 ? '+' : ''}{trendChange} in 30d
                </div>
              )}
            </div>
            <div className={`text-sm ${textSecondary} mt-2`}>
              Target <b className={textPrimary}>{targetBand.toFixed(1)}</b>
              <button
                className="ml-2 text-emerald-600 hover:underline text-xs"
                onClick={() => {
                  const val = prompt('Set target band (4.0–9.0)', targetBand);
                  const f = parseFloat(val);
                  if (!isNaN(f) && f >= 4 && f <= 9) updateTarget(f);
                }}
              >
                edit
              </button>
            </div>
            <div className="mt-4 space-y-1.5">
              {skillKeys.map((k) => {
                const band = skillBandFromStats(stats, k);
                const Icon = SKILL_META[k].Icon;
                const isWeakest = weakestSkill?.key === k;
                return (
                  <div
                    key={k}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      isWeakest ? 'bg-rose-50 border border-rose-200' : ''
                    }`}
                  >
                    <Icon className="w-4 h-4" style={{ color: SKILL_META[k].color }} />
                    <span className={`flex-1 text-sm font-medium ${textPrimary}`}>{SKILL_META[k].label}</span>
                    <span className={`font-semibold ${isWeakest ? 'text-rose-700' : textPrimary}`}>
                      {band > 0 ? band.toFixed(1) : '—'}
                    </span>
                    {isWeakest && <span className="text-[10px] uppercase font-bold text-rose-600">weakest</span>}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Radar */}
          <Card className={`p-5 ${bgCard}`}>
            <div className={`text-xs font-semibold uppercase tracking-widest ${textSecondary}`}>Skill radar</div>
            <h3 className={`text-lg font-semibold ${textPrimary} mt-0.5`}>Actual vs target</h3>
            {hasData ? (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke={isDark ? '#374151' : '#e5e7eb'} />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: isDark ? '#d1d5db' : '#374151', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 9]} tick={{ fontSize: 10, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                  <Radar name="Target" dataKey="target" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeDasharray="4 4" />
                  <Radar name="You" dataKey="actual" stroke="#10b981" fill="#10b981" fillOpacity={0.35} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] grid place-items-center">
                <p className={`${textSecondary} text-sm`}>— — — —<br/>No tests yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* ===== 30-DAY TREND ===== */}
        <Card className={`p-5 mb-5 ${bgCard}`}>
          <div className={`text-xs font-semibold uppercase tracking-widest ${textSecondary}`}>Last 30 days</div>
          <h3 className={`text-lg font-semibold ${textPrimary} mt-0.5 mb-3`}>Band trend</h3>
          {trendData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ left: 0, right: 16, top: 8, bottom: 8 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <YAxis domain={[3, 9]} tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }} />
                <Tooltip />
                <ReferenceLine y={targetBand} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: `target ${targetBand}`, fontSize: 11, fill: '#64748b', position: 'insideTopRight' }} />
                <Line type="monotone" dataKey="band" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className={`${textSecondary} text-sm py-8 text-center`}>Not enough data for a 30-day trend yet.</p>
          )}
        </Card>

        {/* ===== LIZ WEEKLY GOAL ===== */}
        <Card className={`p-5 mb-5 ${bgCard} relative`}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-sky-500 grid place-items-center text-white font-serif font-bold shadow-md">L</div>
            <div className="flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Liz weekly goal</div>
              <h3 className={`text-lg font-semibold ${textPrimary} mt-0.5`}>
                {INTENSITY[goalIntensity].label} · {goalCompleted} / {INTENSITY[goalIntensity].slots} this week
              </h3>
              <p className={`text-sm ${textSecondary}`}>{INTENSITY[goalIntensity].desc}</p>
              <div className="flex gap-1.5 mt-3">
                {Array.from({ length: INTENSITY[goalIntensity].slots }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full ${
                      i < goalCompleted
                        ? 'bg-gradient-to-r from-emerald-500 to-sky-500'
                        : isDark ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button variant="outline" onClick={() => setGoalOpen(true)}>Liz Edit</Button>
          </div>
        </Card>

        {/* ===== INSIGHTS ===== */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className={`p-5 ${bgCard}`}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h4 className={`font-semibold ${textPrimary}`}>Wins</h4>
            </div>
            {insights.wins.length === 0 ? (
              <p className={`${textSecondary} text-sm`}>Keep going — wins will appear here.</p>
            ) : (
              <ul className="space-y-2">
                {insights.wins.map((w, i) => (
                  <li key={i} className={`text-sm ${textPrimary}`}>• {w.text}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card className={`p-5 ${bgCard}`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h4 className={`font-semibold ${textPrimary}`}>Gaps</h4>
            </div>
            {insights.gaps.length === 0 ? (
              <p className={`${textSecondary} text-sm`}>No major gaps flagged.</p>
            ) : (
              <ul className="space-y-2">
                {insights.gaps.map((g, i) => (
                  <li key={i} className={`text-sm ${textPrimary}`}>• {g.text}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card className={`p-5 ${bgCard}`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <h4 className={`font-semibold ${textPrimary}`}>Next steps</h4>
            </div>
            {insights.next.length === 0 ? (
              <p className={`${textSecondary} text-sm`}>You're on track — no action needed.</p>
            ) : (
              <ul className="space-y-3">
                {insights.next.map((n, i) => (
                  <li key={i}>
                    <p className={`text-sm ${textPrimary}`}>• {n.text}</p>
                    {n.cta && (
                      <button
                        onClick={() => navigate(n.cta.route)}
                        className="mt-1 ml-3 text-xs text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
                      >
                        {n.cta.label}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* ===== RECENT TESTS ===== */}
        {attempts.length > 0 && (
          <Card className={`p-5 ${bgCard}`}>
            <h3 className={`font-semibold ${textPrimary} mb-3`}>Recent tests</h3>
            <div className="space-y-2">
              {attempts.slice(0, 10).map((a) => {
                const meta = SKILL_META[a.test_type] || { label: a.test_type, Icon: Trophy, color: '#6b7280' };
                const Icon = meta.Icon;
                return (
                  <button
                    key={a.id || a.attempt_id}
                    onClick={() => navigate(`/results/${a.id || a.attempt_id}`)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  >
                    <div className="w-9 h-9 rounded-lg grid place-items-center" style={{ backgroundColor: meta.color + '20', color: meta.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium capitalize ${textPrimary}`}>{meta.label}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {a.completed_at ? new Date(a.completed_at).toLocaleString() : '—'}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-sm font-semibold ${
                      (a.band_score || 0) >= 7 ? 'bg-emerald-100 text-emerald-700' :
                      (a.band_score || 0) >= 6 ? 'bg-sky-100 text-sky-700' :
                      (a.band_score || 0) >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {a.band_score ? a.band_score.toFixed(1) : '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {!hasData && (
          <Card className={`p-10 text-center ${bgCard}`}>
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className={`font-semibold ${textPrimary} mb-1`}>No tests taken yet</h3>
            <p className={`${textSecondary} text-sm mb-4`}>Take a baseline drill — Liz uses it to build your plan.</p>
            <Button onClick={() => navigate('/dashboard')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Start baseline
            </Button>
          </Card>
        )}
      </div>

      {/* Goal modal */}
      {goalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setGoalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setGoalOpen(false)} className="absolute top-3 right-3 w-8 h-8 grid place-items-center rounded-full hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-500" />
            </button>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Liz weekly goal</div>
            <h3 className="text-xl font-semibold text-gray-900 mt-0.5 mb-3">How hard do you want to push?</h3>
            <div className="space-y-2">
              {Object.entries(INTENSITY).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => updateGoal(key)}
                  className={`w-full text-left p-4 rounded-xl border transition ${
                    goalIntensity === key
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{meta.label}</p>
                      <p className="text-sm text-gray-600">{meta.desc}</p>
                    </div>
                    {goalIntensity === key && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
