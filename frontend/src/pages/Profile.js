import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, User, Mail, Calendar, Award, ArrowLeft, Crown, Target, Mic, FileText, BookOpen, Shield, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';
import { getUserProgress, getUser, getUserUsage } from '../lib/api';
import { getBandScoreColor } from '../lib/utils';
import { toast } from 'sonner';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';

// IELTS Ace plans only — Free / Weekly / Monthly / Exam Pack (+ Custom slider).
// `master` and `learner` are legacy V1 (General English) plans; if a user object
// still carries them, we render as "Legacy" so it's obviously not an IELTS tier.
const PLAN_LABELS = {
  free: 'Free',
  weekly: 'Weekly',
  monthly: 'Monthly',
  exam: 'Exam Pack',
  custom: 'Custom',
};

const PLAN_BADGE_STYLE = {
  free: 'bg-gray-100 text-gray-700 border-gray-300',
  weekly: 'bg-blue-50 text-blue-700 border-blue-200',
  monthly: 'bg-violet-50 text-violet-700 border-violet-200',
  exam: 'bg-amber-50 text-amber-800 border-amber-300',
  custom: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  legacy: 'bg-orange-50 text-orange-700 border-orange-200',
};

const LEGACY_PLAN_KEYS = new Set(['master', 'learner']);

const formatExpiry = (iso) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return null; }
};

export default function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullUser, setFullUser] = useState(user);
  const [usage, setUsage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [staleSession, setStaleSession] = useState(false);
  
  // Theme support
  const { activeTheme } = useTheme();
  const isDark = activeTheme === THEME_MODES.DARK;
  const isNightShift = activeTheme === THEME_MODES.NIGHT_SHIFT;
  
  // Theme-aware classes
  const bgMain = isDark ? 'bg-gray-900' : isNightShift ? 'bg-amber-50' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50';
  const bgCard = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-gray-200';
  const bgHeader = isDark ? 'bg-gray-800 border-gray-700' : isNightShift ? 'bg-amber-100 border-amber-200' : 'bg-white border-gray-200';
  const textPrimary = isDark ? 'text-gray-100' : isNightShift ? 'text-amber-900' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : isNightShift ? 'text-amber-700' : 'text-gray-600';

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadAll = async () => {
    setLoading(true);
    const [progressRes, userRes, usageRes] = await Promise.allSettled([
      getUserProgress(user.id),
      getUser(user.id),
      getUserUsage(user.id),
    ]);
    if (progressRes.status === 'fulfilled') setProgress(progressRes.value);
    if (userRes.status === 'fulfilled') {
      setFullUser(userRes.value);
      setStaleSession(false);
      // Refresh localStorage so plan/quota stay in sync across tabs
      try { localStorage.setItem('user', JSON.stringify(userRes.value)); } catch {}
    } else if (userRes.status === 'rejected' && userRes.reason?.response?.status === 404) {
      setStaleSession(true);
    }
    if (usageRes.status === 'fulfilled') setUsage(usageRes.value);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
    toast.success('Profile refreshed');
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(fullUser?.id || user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const isAdmin = (fullUser?.email || user.email || '').toLowerCase().includes('aga.durdy');
  const rawPlan = (fullUser?.plan || 'free').toLowerCase();
  const isLegacyPlan = LEGACY_PLAN_KEYS.has(rawPlan);
  const planKey = isLegacyPlan ? 'legacy' : rawPlan;
  const planLabel = isLegacyPlan
    ? `Legacy (${rawPlan})`
    : (PLAN_LABELS[rawPlan] || rawPlan);
  const planBadge = PLAN_BADGE_STYLE[planKey] || PLAN_BADGE_STYLE.free;
  const expires = formatExpiry(fullUser?.plan_expires_at);
  const learningMode = fullUser?.learning_mode === 'general_english'
    ? 'General English'
    : fullUser?.learning_mode === 'ielts'
    ? 'IELTS Ace'
    : null;

  return (
    <div className={`min-h-screen ${bgMain} transition-colors duration-300`}>
      <header className={`${bgHeader} border-b sticky top-0 z-50 shadow-sm transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>IELTS Ace</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher iconOnly />
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className={isDark ? 'border-gray-600' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {staleSession && (
          <div className="mb-4 rounded-xl border border-orange-300 bg-orange-50 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900">Stale session detected</p>
              <p className="text-xs text-orange-800 mt-1">
                Your browser is logged in as user <code className="font-mono bg-white/60 px-1 rounded">{user.id}</code> but that account doesn't exist on this server. Plan/quota numbers below are from cached localStorage and may be wrong. Log out and log back in to fix.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={onLogout}
                className="mt-2 text-orange-700 border-orange-300 hover:bg-orange-100"
              >
                Log out now
              </Button>
            </div>
          </div>
        )}
        <Card className="p-8">
          <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h2 className="text-3xl font-bold text-gray-900" data-lang-sample>{user.name}</h2>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${planBadge}`}>
                    <Crown className="w-3 h-3" /> {planLabel} plan
                  </span>
                  {expires && (
                    <span className="text-xs text-gray-500">expires {expires}</span>
                  )}
                  {learningMode && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      <BookOpen className="w-3 h-3" /> {learningMode}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className={isDark ? 'border-gray-600' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subscription / quota */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription & quota</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <QuotaCard
                    icon={<FileText className="w-5 h-5 text-violet-600" />}
                    label="Evaluations"
                    sub="Writing + Speaking eval"
                    counter={usage?.counters?.evaluations}
                    accent="violet"
                  />
                  <QuotaCard
                    icon={<Trophy className="w-5 h-5 text-amber-600" />}
                    label="Mock tests"
                    sub="Full IELTS mocks"
                    counter={usage?.counters?.mocks}
                    accent="amber"
                  />
                  <QuotaCard
                    icon={<Mic className="w-5 h-5 text-rose-600" />}
                    label="Speaking minutes"
                    sub="Liz Live minutes"
                    counter={usage?.counters?.speaking_minutes}
                    accent="rose"
                  />
                </div>
                {(fullUser?.examCredits ?? 0) > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <strong>{fullUser.examCredits}</strong> exam credits remaining
                  </div>
                )}
                {(fullUser?.liz_live_seconds_remaining ?? 0) > 0 && (
                  <div className="mt-1 text-sm text-gray-600">
                    Liz Live: <strong>{Math.floor(fullUser.liz_live_seconds_remaining / 60)}m {fullUser.liz_live_seconds_remaining % 60}s</strong> remaining
                  </div>
                )}
              </div>

              {/* Learning profile */}
              <div className="pt-6 border-t">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning profile</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoTile label="Target band" value={fullUser?.target_band ?? '—'} icon={<Target className="w-4 h-4 text-emerald-600" />} />
                  <InfoTile label="Current band" value={fullUser?.current_band ?? '—'} icon={<Award className="w-4 h-4 text-blue-600" />} />
                  <InfoTile label="Exam date" value={fullUser?.exam_date || '—'} icon={<Calendar className="w-4 h-4 text-rose-600" />} />
                  <InfoTile
                    label="Onboarding"
                    value={fullUser?.onboarding_complete ? 'Complete' : 'Incomplete'}
                    valueClass={fullUser?.onboarding_complete ? 'text-emerald-600' : 'text-amber-600'}
                  />
                </div>
                {!fullUser?.onboarding_complete && (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" onClick={() => navigate('/onboarding')}>
                      Complete onboarding
                    </Button>
                  </div>
                )}
              </div>

              {/* Tests progress */}
              {progress && (
                <div className="pt-6 border-t">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tests progress</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Total Tests</p>
                        <Trophy className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-4xl font-bold text-blue-600">{progress.total_tests}</p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Average Band Score</p>
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <p className={`text-4xl font-bold ${getBandScoreColor(progress.average_band_score)}`}>
                        {progress.average_band_score}
                      </p>
                    </div>
                  </div>

                  {Object.keys(progress.by_type || {}).length > 0 && (
                    <div className="mt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(progress.by_type).map(([type, data]) => (
                          <div key={type} className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600 capitalize mb-1">{type}</p>
                            <p className="text-2xl font-bold text-gray-900">{data.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Account / debug */}
              <div className="pt-6 border-t">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Account</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Member since {fullUser?.created_at ? new Date(fullUser.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                    <span>User ID:</span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{fullUser?.id || user.id}</span>
                    <button onClick={copyUserId} className="text-gray-400 hover:text-gray-700" title="Copy">
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  {usage?.period && (
                    <div className="text-xs text-gray-500">Quota period: {usage.period}</div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="text-red-600 border-red-200 w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── Helper sub-components ───────────────────────────────────────────────────

function QuotaCard({ icon, label, sub, counter, accent }) {
  const accentBg = {
    violet: 'bg-violet-50 border-violet-100',
    amber: 'bg-amber-50 border-amber-100',
    rose: 'bg-rose-50 border-rose-100',
  }[accent] || 'bg-gray-50 border-gray-100';

  if (!counter) {
    return (
      <div className={`${accentBg} border rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold text-gray-400">—</p>
        <p className="text-xs text-gray-500 mt-1">{sub}</p>
      </div>
    );
  }

  const { used = 0, quota, remaining, unlimited } = counter;
  const display = unlimited ? '∞' : (remaining ?? 0);
  const total = unlimited ? '∞' : (quota ?? 0);
  const pct = unlimited || !quota ? 0 : Math.min(100, (used / quota) * 100);

  return (
    <div className={`${accentBg} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {icon}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{display}</span>
        <span className="text-sm text-gray-500">/ {total}</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {unlimited ? 'Unlimited' : `${used} used`} · {sub}
      </p>
      {!unlimited && quota > 0 && (
        <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function InfoTile({ label, value, icon, valueClass = 'text-gray-900' }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-lg font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
