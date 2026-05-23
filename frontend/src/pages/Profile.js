import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mail,
  Calendar,
  Award,
  ArrowLeft,
  Crown,
  Target,
  Mic,
  FileText,
  Trophy,
  Shield,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  LogOut,
  Save,
  Pencil,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

import { DashboardLayout } from '../features/dashboard';
import { getUserProgress, getUser, getUserUsage } from '../lib/api';
import { isAdminUser } from '../lib/planAccess';
import { isIeltsMode } from '../lib/learningMode';
import { useTheme, THEME_MODES } from '../contexts/ThemeContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

/**
 * Profile (2026-05-23 rewrite).
 *
 * Aga: "bu eski, ve bilgi neredeyse hicbiri islevsel degil. bunu saglam
 * design eding". The previous page rendered a generic Material-style card
 * with several empty/dead values (Target band "—", "Complete onboarding"
 * button that bounced into a flow the user had already finished, a
 * Refresh button with no user-facing reason, "25 exam credits remaining"
 * sitting underneath an "Unlimited" plan, etc.).
 *
 * This rewrite:
 *   • Wraps the page in DashboardLayout so it feels like a continuation of
 *     the dashboard, not a different surface with its own chrome.
 *   • Identity card uses editorial typography (display headline + initials
 *     avatar) and the dashboard's hsl(var(--…)) tokens.
 *   • Subscription card is honest about unlimited tiers — no "25 exam
 *     credits remaining" line under an ∞ quota.
 *   • Study profile is editable inline (POST /api/users/{id}/onboarding
 *     accepts the same payload as the onboarding flow).
 *   • Preferences card surfaces language + learning-mode toggle in one
 *     place (theme switch stays in the global top bar).
 *   • Activity card uses the existing /users/{id}/progress endpoint so
 *     numbers reflect real attempts, not made-up demo state.
 *   • Account card has copy-user-id + logout. Email/password/account
 *     deletion CTAs are explicitly stubbed with "coming soon" copy
 *     because we don't have backend endpoints for them yet — better to
 *     show a non-functional path with a date label than pretend it works.
 */

const PLAN_LABELS = {
  free: 'Free',
  weekly: 'Weekly',
  monthly: 'Monthly',
  exam: 'Exam Pack',
  exam_pack: 'Exam Pack',
  custom: 'Custom',
};

// Legacy V1 plan IDs → V2 tier so the badge always reads as a current tier.
const LEGACY_PLAN_ALIAS = {
  explorer: 'free',
  learner: 'weekly',
  achiever: 'monthly',
  master: 'monthly',
  pro: 'monthly',
};

const PLAN_TONE = {
  free: { bg: 'hsl(220 14% 96%)', fg: 'hsl(220 12% 30%)', border: 'hsl(220 13% 88%)' },
  weekly: { bg: 'hsl(217 100% 96%)', fg: 'hsl(217 76% 38%)', border: 'hsl(217 85% 88%)' },
  monthly: { bg: 'hsl(262 95% 96%)', fg: 'hsl(262 70% 40%)', border: 'hsl(262 85% 88%)' },
  exam: { bg: 'hsl(38 95% 94%)', fg: 'hsl(28 72% 38%)', border: 'hsl(38 80% 84%)' },
  custom: { bg: 'hsl(187 90% 94%)', fg: 'hsl(187 70% 30%)', border: 'hsl(187 75% 84%)' },
};

const SKILL_TONE = {
  Writing: 'var(--writing, 25 95% 53%)',
  Reading: 'var(--reading, 217 91% 60%)',
  Listening: 'var(--listening, 262 83% 58%)',
  Speaking: 'var(--speaking, 142 71% 45%)',
};

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatISODate(input) {
  if (!input) return '';
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function initialsOf(name, email) {
  const seed = (name || email || '').trim();
  if (!seed) return '?';
  const parts = seed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return seed[0].toUpperCase();
}

export default function Profile({ user, onLogout }) {
  const navigate = useNavigate();
  const [fullUser, setFullUser] = useState(user);
  const [progress, setProgress] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staleSession, setStaleSession] = useState(false);
  const [copied, setCopied] = useState(false);

  const [editingStudy, setEditingStudy] = useState(false);
  const [studyDraft, setStudyDraft] = useState({
    targetBand: '',
    currentBand: '',
    examDate: '',
  });
  const [savingStudy, setSavingStudy] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  async function loadAll() {
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
      try { localStorage.setItem('user', JSON.stringify(userRes.value)); } catch {}
    } else if (userRes.status === 'rejected' && userRes.reason?.response?.status === 404) {
      setStaleSession(true);
    }
    if (usageRes.status === 'fulfilled') setUsage(usageRes.value);
    setLoading(false);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
    toast.success('Profile refreshed');
  }

  function startStudyEdit() {
    setStudyDraft({
      targetBand: fullUser?.target_band ?? '',
      currentBand: fullUser?.current_band ?? '',
      examDate: formatISODate(fullUser?.exam_date),
    });
    setEditingStudy(true);
  }

  async function saveStudyProfile() {
    setSavingStudy(true);
    try {
      const base = process.env.REACT_APP_BACKEND_URL || '';
      const res = await fetch(`${base}/api/users/${encodeURIComponent(user.id)}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetBand: studyDraft.targetBand === '' ? null : Number(studyDraft.targetBand),
          currentBand: studyDraft.currentBand === '' ? null : Number(studyDraft.currentBand),
          examDate: studyDraft.examDate || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setFullUser(updated);
      try { localStorage.setItem('user', JSON.stringify(updated)); } catch {}
      setEditingStudy(false);
      toast.success('Study profile saved');
    } catch (e) {
      toast.error('Could not save — check your connection and try again');
    } finally {
      setSavingStudy(false);
    }
  }

  async function copyUserId() {
    try {
      await navigator.clipboard.writeText(fullUser?.id || user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function sendPasswordReset() {
    const email = fullUser?.email || user.email;
    if (!email) {
      toast.error('No email on file for this account.');
      return;
    }
    setSendingReset(true);
    try {
      const base = process.env.REACT_APP_BACKEND_URL || '';
      const res = await fetch(`${base}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success(`Reset link sent to ${email}. Check your inbox.`);
    } catch (e) {
      toast.error('Could not send reset link — try again in a moment.');
    } finally {
      setSendingReset(false);
    }
  }

  async function confirmDeleteAccount() {
    // No backend endpoint yet — open a prefilled support email with the
    // user's ID so deletion goes through the manual queue. Real delete
    // endpoint is a separate task.
    const email = fullUser?.email || user.email || '';
    const id = fullUser?.id || user.id || '';
    const subject = encodeURIComponent('Account deletion request');
    const body = encodeURIComponent(
      `Hi support team,\n\nPlease delete the account associated with ${email} (user id: ${id}).\n\nThanks.`
    );
    window.location.href = `mailto:support@testmaster.pro?subject=${subject}&body=${body}`;
  }

  const isAdmin = isAdminUser(fullUser || user);
  const isGE = !isIeltsMode(fullUser || user);

  const rawPlan = (fullUser?.plan || 'free').toLowerCase();
  const planKey = LEGACY_PLAN_ALIAS[rawPlan] || rawPlan;
  const planLabel = PLAN_LABELS[planKey] || planKey;
  const planTone = PLAN_TONE[planKey] || PLAN_TONE.free;
  const expires = formatDate(fullUser?.plan_expires_at);

  const memberSince = formatDate(fullUser?.created_at);
  const userName = fullUser?.name || user.name || 'Student';
  const userEmail = fullUser?.email || user.email || '';

  const writingCounter = usage?.counters?.evaluations;
  const mockCounter = usage?.counters?.mocks;
  const speakingCounter = usage?.counters?.speaking_seconds;

  const weakestSkillBand = useMemo(() => {
    if (!progress?.by_type) return null;
    const entries = Object.entries(progress.by_type).filter(([, d]) => d?.avg_score > 0);
    if (entries.length === 0) return null;
    const [name, data] = entries.reduce((a, b) => (a[1].avg_score < b[1].avg_score ? a : b));
    return { name: name.charAt(0).toUpperCase() + name.slice(1), band: data.avg_score };
  }, [progress]);

  const dashboardPath = isGE ? '/ge/dashboard' : '/dashboard';

  return (
    <DashboardLayout
      user={fullUser || user}
      activeSection="dashboard"
      onLogout={onLogout}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Top breadcrumb back-link */}
        <button
          type="button"
          onClick={() => navigate(dashboardPath)}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:opacity-80 mb-6 mt-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        {/* Page header */}
        <section className="mb-10">
          <div className="label mb-2">Account</div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="display-l text-[36px] md:text-[44px]">Your profile.</h1>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg hairline border hover:bg-black/[0.03] disabled:opacity-50"
              style={{ borderColor: 'hsl(var(--rule))' }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh data
            </button>
          </div>
          <p className="text-muted text-sm mt-2 max-w-[58ch]">
            Account, subscription, and study preferences. Everything in one place.
          </p>
        </section>

        {staleSession && (
          <div
            className="mb-6 rounded-xl border p-4 flex items-start gap-3"
            style={{ borderColor: '#fdba74', background: '#fff7ed' }}
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#c2410c' }} />
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#7c2d12' }}>
                Stale session detected
              </p>
              <p className="text-xs mt-1" style={{ color: '#9a3412' }}>
                Browser thinks you're user <code className="font-mono px-1 rounded bg-white/60">{user.id}</code>{' '}
                but that account doesn't exist on this server. Log out and back in to fix.
              </p>
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 text-xs font-medium px-3 py-1.5 rounded-md border"
                style={{ borderColor: '#fdba74', color: '#7c2d12' }}
              >
                Log out now
              </button>
            </div>
          </div>
        )}

        {/* ─── Identity card ──────────────────────────────────────────── */}
        <IdentityCard
          userName={userName}
          userEmail={userEmail}
          isAdmin={isAdmin}
          memberSince={memberSince}
          planLabel={planLabel}
          planTone={planTone}
          planExpires={expires}
        />

        {/* ─── Two-column grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 mt-8">
          {/* LEFT — Subscription + Study profile */}
          <div className="space-y-6 md:space-y-8 min-w-0">
            <SubscriptionCard
              planLabel={planLabel}
              planTone={planTone}
              planExpires={expires}
              writingCounter={writingCounter}
              mockCounter={mockCounter}
              speakingCounter={speakingCounter}
              examCredits={fullUser?.examCredits}
              lizLiveSeconds={fullUser?.liz_live_seconds_remaining}
              isGE={isGE}
              onChangePlan={() => navigate('/pricing')}
              loading={loading}
            />

            {!isGE && (
              <StudyProfileCard
                fullUser={fullUser}
                editing={editingStudy}
                draft={studyDraft}
                setDraft={setStudyDraft}
                onEdit={startStudyEdit}
                onCancel={() => setEditingStudy(false)}
                onSave={saveStudyProfile}
                saving={savingStudy}
                weakest={weakestSkillBand}
              />
            )}
          </div>

          {/* RIGHT — Preferences + Activity + Account */}
          <div className="space-y-6 md:space-y-8 min-w-0">
            <PreferencesCard
              isGE={isGE}
              feedbackLanguage={fullUser?.feedback_language}
              onSwitchMode={() => navigate('/')}
            />

            {!isGE && (
              <ActivityCard progress={progress} weakest={weakestSkillBand} />
            )}

            <AccountCard
              userId={fullUser?.id || user.id}
              copied={copied}
              onCopy={copyUserId}
              quotaPeriod={usage?.period}
              onLogout={onLogout}
              onSendPasswordReset={sendPasswordReset}
              sendingReset={sendingReset}
              onRequestDelete={confirmDeleteAccount}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Identity card ─────────────────────────────────────────────────────────

function IdentityCard({
  userName,
  userEmail,
  isAdmin,
  memberSince,
  planLabel,
  planTone,
  planExpires,
}) {
  return (
    <section
      className="rounded-2xl p-6 md:p-8 hairline border"
      style={{
        borderColor: 'hsl(var(--rule))',
        background: 'hsl(var(--surface) / 0.7)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
      }}
    >
      <div className="flex items-start gap-5 md:gap-7 flex-wrap">
        <div
          className="flex items-center justify-center font-display rounded-full text-white"
          style={{
            width: 88,
            height: 88,
            background: 'linear-gradient(135deg, hsl(262 70% 50%) 0%, hsl(217 80% 50%) 100%)',
            fontSize: 32,
            letterSpacing: '0.02em',
          }}
          aria-hidden="true"
        >
          {initialsOf(userName, userEmail)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2
              className="font-display text-[28px] md:text-[32px] leading-none"
              style={{ color: 'hsl(var(--fg))' }}
              data-lang-sample
            >
              {userName}
            </h2>
            {isAdmin && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-full"
                style={{
                  background: 'hsl(262 90% 96%)',
                  color: 'hsl(262 70% 40%)',
                  border: '1px solid hsl(262 80% 88%)',
                }}
              >
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          <div
            className="mt-2 flex items-center gap-2 text-sm"
            style={{ color: 'hsl(var(--muted-fg))' }}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{userEmail}</span>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{
                background: planTone.bg,
                color: planTone.fg,
                border: `1px solid ${planTone.border}`,
              }}
            >
              <Crown className="w-3 h-3" /> {planLabel} plan
            </span>
            {planExpires && (
              <span className="text-xs text-muted">
                Renews / expires <strong>{planExpires}</strong>
              </span>
            )}
            {memberSince && (
              <span className="text-xs text-muted ml-auto">
                Member since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Subscription card ─────────────────────────────────────────────────────

function SubscriptionCard({
  planLabel,
  planTone,
  planExpires,
  writingCounter,
  mockCounter,
  speakingCounter,
  examCredits,
  lizLiveSeconds,
  isGE,
  onChangePlan,
  loading,
}) {
  return (
    <Card
      title="Subscription"
      subtitle={`${planLabel}${planExpires ? ` · renews ${planExpires}` : ''}`}
      action={
        <button
          type="button"
          onClick={onChangePlan}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full text-white"
          style={{ background: 'hsl(var(--fg))' }}
        >
          {planLabel === 'Free' ? 'Upgrade' : 'Change plan'}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      }
    >
      {loading ? (
        <Skeleton rows={2} />
      ) : (
        <>
          {!isGE && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <QuotaTile
                icon={<FileText className="w-4 h-4" />}
                label="Writing evaluations"
                counter={writingCounter}
                accent="violet"
              />
              <QuotaTile
                icon={<Trophy className="w-4 h-4" />}
                label="Mock tests"
                counter={mockCounter}
                accent="amber"
              />
              <QuotaTile
                icon={<Mic className="w-4 h-4" />}
                label="Speaking minutes"
                counter={
                  speakingCounter
                    ? {
                        ...speakingCounter,
                        used: Math.floor((speakingCounter.used || 0) / 60),
                        quota: speakingCounter.unlimited
                          ? null
                          : Math.floor((speakingCounter.quota || 0) / 60),
                        remaining: speakingCounter.unlimited
                          ? null
                          : Math.floor((speakingCounter.remaining || 0) / 60),
                      }
                    : null
                }
                accent="rose"
              />
              {Number(examCredits) > 0 && (
                <QuotaTile
                  icon={<Sparkles className="w-4 h-4" />}
                  label="Exam credits"
                  counter={{ used: 0, quota: examCredits, remaining: examCredits, unlimited: false }}
                  accent="emerald"
                />
              )}
              {Number(lizLiveSeconds) > 0 && (
                <QuotaTile
                  icon={<Mic className="w-4 h-4" />}
                  label="Liz Live"
                  counter={{
                    used: 0,
                    quota: Math.floor(lizLiveSeconds / 60),
                    remaining: Math.floor(lizLiveSeconds / 60),
                    unlimited: false,
                  }}
                  accent="violet"
                />
              )}
            </div>
          )}

          <div className="text-xs text-muted">
            Manage payment, invoices, or cancel via your PayPal account.{' '}
            <a
              href="https://www.paypal.com/myaccount/autopay/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline decoration-dotted underline-offset-2"
              style={{ color: 'hsl(var(--primary-ink, 262 70% 40%))' }}
            >
              Manage on PayPal →
            </a>
          </div>
        </>
      )}
    </Card>
  );
}

function QuotaTile({ icon, label, counter, accent = 'violet' }) {
  const accentMap = {
    violet: { bg: 'hsl(262 95% 97%)', fg: 'hsl(262 70% 40%)', border: 'hsl(262 85% 90%)' },
    amber: { bg: 'hsl(38 95% 96%)', fg: 'hsl(28 72% 38%)', border: 'hsl(38 80% 86%)' },
    rose: { bg: 'hsl(347 89% 96%)', fg: 'hsl(347 76% 40%)', border: 'hsl(347 80% 86%)' },
    emerald: { bg: 'hsl(155 84% 95%)', fg: 'hsl(155 70% 30%)', border: 'hsl(155 76% 84%)' },
  };
  const tone = accentMap[accent] || accentMap.violet;

  let display;
  let sub;
  if (!counter) {
    display = '—';
    sub = 'Not tracked on this plan';
  } else if (counter.unlimited) {
    display = '∞';
    sub = 'Unlimited';
  } else {
    const used = counter.used ?? 0;
    const quota = counter.quota ?? 0;
    const remaining = counter.remaining ?? Math.max(0, quota - used);
    display = `${remaining}`;
    sub = `${used} of ${quota} used`;
  }

  const pct =
    counter && !counter.unlimited && counter.quota
      ? Math.min(100, ((counter.used ?? 0) / counter.quota) * 100)
      : null;

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ background: tone.bg, borderColor: tone.border }}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider" style={{ color: tone.fg }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-display leading-none" style={{ color: 'hsl(var(--fg))' }}>{display}</span>
      </div>
      <div className="text-xs mt-1.5" style={{ color: tone.fg, opacity: 0.85 }}>{sub}</div>
      {pct !== null && (
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.6)' }}>
          <div className="h-full transition-all" style={{ width: `${pct}%`, background: tone.fg }} />
        </div>
      )}
    </div>
  );
}

// ─── Study profile (editable) ──────────────────────────────────────────────

function StudyProfileCard({
  fullUser,
  editing,
  draft,
  setDraft,
  onEdit,
  onCancel,
  onSave,
  saving,
  weakest,
}) {
  const examDateValue = formatISODate(fullUser?.exam_date);
  return (
    <Card
      title="Study profile"
      subtitle="Where you are, where you're going."
      action={
        !editing && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full hairline border"
            style={{ borderColor: 'hsl(var(--rule))' }}
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )
      }
    >
      {editing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Target band">
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={draft.targetBand}
                onChange={(e) => setDraft((d) => ({ ...d, targetBand: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border hairline text-sm"
                style={{ borderColor: 'hsl(var(--rule))', background: 'hsl(var(--bg))' }}
                placeholder="e.g. 7.5"
              />
            </Field>
            <Field label="Current band">
              <input
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={draft.currentBand}
                onChange={(e) => setDraft((d) => ({ ...d, currentBand: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border hairline text-sm"
                style={{ borderColor: 'hsl(var(--rule))', background: 'hsl(var(--bg))' }}
                placeholder="e.g. 6.5"
              />
            </Field>
            <Field label="Exam date">
              <input
                type="date"
                value={draft.examDate}
                onChange={(e) => setDraft((d) => ({ ...d, examDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border hairline text-sm"
                style={{ borderColor: 'hsl(var(--rule))', background: 'hsl(var(--bg))' }}
              />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white disabled:opacity-50"
              style={{ background: 'hsl(var(--fg))' }}
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="text-xs font-semibold px-4 py-2 rounded-full hairline border"
              style={{ borderColor: 'hsl(var(--rule))' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ReadTile
            label="Target band"
            value={fullUser?.target_band ?? '—'}
            icon={<Target className="w-3.5 h-3.5" />}
          />
          <ReadTile
            label="Current band"
            value={fullUser?.current_band ?? '—'}
            icon={<Award className="w-3.5 h-3.5" />}
          />
          <ReadTile
            label="Exam date"
            value={examDateValue ? formatDate(fullUser.exam_date) : '—'}
            icon={<Calendar className="w-3.5 h-3.5" />}
          />
          <ReadTile
            label="Weakest skill"
            value={weakest ? `${weakest.name} (${weakest.band.toFixed(1)})` : '—'}
            icon={<Sparkles className="w-3.5 h-3.5" />}
            tone={weakest ? SKILL_TONE[weakest.name] : null}
          />
        </div>
      )}
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--muted-fg))' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function ReadTile({ label, value, icon, tone }) {
  return (
    <div
      className="rounded-lg p-3 hairline border"
      style={{
        borderColor: 'hsl(var(--rule))',
        background: tone ? `hsl(${tone} / 0.06)` : 'hsl(var(--bg))',
      }}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-fg))' }}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-lg font-display leading-tight" style={{ color: tone ? `hsl(${tone})` : 'hsl(var(--fg))' }}>
        {value}
      </div>
    </div>
  );
}

// ─── Preferences ───────────────────────────────────────────────────────────

function PreferencesCard({ isGE, feedbackLanguage, onSwitchMode }) {
  const { themeMode, setTheme } = useTheme();
  const themeOptions = [
    { key: THEME_MODES.LIGHT, label: 'Light' },
    { key: THEME_MODES.DARK, label: 'Dark' },
    { key: THEME_MODES.NIGHT_SHIFT, label: 'Night' },
    { key: THEME_MODES.AUTO, label: 'Auto' },
  ];

  return (
    <Card title="Preferences" subtitle="Language, theme, and learning track.">
      <Row label="UI language">
        <LanguageSwitcher compact />
      </Row>
      <Row label="Feedback language">
        <div className="text-sm" style={{ color: 'hsl(var(--fg))' }}>
          {feedbackLanguage || 'English (default)'}
        </div>
      </Row>
      <Row label="Theme">
        <div
          role="radiogroup"
          className="inline-flex items-center gap-1 rounded-full p-1 border hairline"
          style={{ borderColor: 'hsl(var(--rule))' }}
        >
          {themeOptions.map((opt) => {
            const on = themeMode === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setTheme(opt.key)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full transition-colors"
                style={{
                  background: on ? 'hsl(var(--fg))' : 'transparent',
                  color: on ? 'hsl(var(--bg))' : 'hsl(var(--muted-fg))',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </Row>
      <Row label="Learning track">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isGE ? 'hsl(155 84% 95%)' : 'hsl(217 100% 96%)',
              color: isGE ? 'hsl(155 70% 30%)' : 'hsl(217 76% 38%)',
            }}
          >
            {isGE ? 'General English' : 'IELTS Ace'}
          </span>
          <button
            type="button"
            onClick={onSwitchMode}
            className="text-xs underline decoration-dotted underline-offset-2"
            style={{ color: 'hsl(var(--muted-fg))' }}
          >
            Switch
          </button>
        </div>
      </Row>
    </Card>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm" style={{ color: 'hsl(var(--muted-fg))' }}>{label}</span>
      <div className="flex-1 flex justify-end">{children}</div>
    </div>
  );
}

// ─── Activity ──────────────────────────────────────────────────────────────

function ActivityCard({ progress, weakest }) {
  if (!progress) {
    return (
      <Card title="Activity" subtitle="Your testing history at a glance.">
        <Skeleton rows={3} />
      </Card>
    );
  }

  const total = progress.total_tests ?? 0;
  const avg = progress.average_band_score ?? 0;
  const byType = progress.by_type || {};

  return (
    <Card
      title="Activity"
      subtitle={total === 0 ? 'No tests yet — your first one sets the baseline.' : 'Your testing history at a glance.'}
    >
      <div className="grid grid-cols-2 gap-3 mb-4">
        <ReadTile
          label="Total tests"
          value={total}
          icon={<Trophy className="w-3.5 h-3.5" />}
        />
        <ReadTile
          label="Average band"
          value={total > 0 ? avg.toFixed(1) : '—'}
          icon={<Award className="w-3.5 h-3.5" />}
        />
      </div>
      {Object.keys(byType).length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(byType).map(([type, data]) => {
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            const tone = SKILL_TONE[label] || 'var(--primary, 262 70% 50%)';
            return (
              <div
                key={type}
                className="rounded-lg p-2.5 hairline border flex items-center justify-between"
                style={{ borderColor: 'hsl(var(--rule))' }}
              >
                <div>
                  <div className="text-[11px] uppercase tracking-wider" style={{ color: `hsl(${tone})` }}>
                    {label}
                  </div>
                  <div className="text-base font-display" style={{ color: 'hsl(var(--fg))' }}>
                    {data.count} {data.count === 1 ? 'attempt' : 'attempts'}
                  </div>
                </div>
                {data.avg_score > 0 && (
                  <div className="text-sm font-semibold" style={{ color: `hsl(${tone})` }}>
                    {data.avg_score.toFixed(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── Account ───────────────────────────────────────────────────────────────

function AccountCard({
  userId,
  copied,
  onCopy,
  quotaPeriod,
  onLogout,
  onSendPasswordReset,
  sendingReset,
  onRequestDelete,
}) {
  return (
    <Card title="Account" subtitle="Identity and session.">
      <Row label="User ID">
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md hairline border hover:bg-black/[0.03]"
          style={{ borderColor: 'hsl(var(--rule))' }}
          title="Copy user ID"
        >
          <span className="truncate max-w-[160px]">{userId}</span>
          {copied ? (
            <Check className="w-3 h-3" style={{ color: 'hsl(155 70% 40%)' }} />
          ) : (
            <Copy className="w-3 h-3 opacity-60" />
          )}
        </button>
      </Row>
      {quotaPeriod && (
        <Row label="Quota period">
          <span className="text-xs" style={{ color: 'hsl(var(--fg))' }}>{quotaPeriod}</span>
        </Row>
      )}
      <Row label="Change password">
        <button
          type="button"
          onClick={onSendPasswordReset}
          disabled={sendingReset}
          className="text-xs font-semibold px-3 py-1.5 rounded-full hairline border hover:bg-black/[0.03] disabled:opacity-50"
          style={{ borderColor: 'hsl(var(--rule))' }}
        >
          {sendingReset ? 'Sending…' : 'Email me a reset link'}
        </button>
      </Row>
      <Row label="Delete account">
        <button
          type="button"
          onClick={onRequestDelete}
          className="text-xs underline decoration-dotted underline-offset-2"
          style={{ color: 'hsl(var(--muted-fg))' }}
        >
          Email support
        </button>
      </Row>
      <div className="pt-4 mt-4 border-t" style={{ borderColor: 'hsl(var(--rule))' }}>
        <button
          type="button"
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-lg hairline border"
          style={{
            borderColor: 'hsl(347 80% 86%)',
            color: 'hsl(347 76% 40%)',
            background: 'hsl(347 89% 98%)',
          }}
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </Card>
  );
}

// ─── Card primitive ────────────────────────────────────────────────────────

function Card({ title, subtitle, action, children }) {
  return (
    <section
      className="rounded-2xl p-6 hairline border"
      style={{
        borderColor: 'hsl(var(--rule))',
        background: 'hsl(var(--bg))',
      }}
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-[20px] leading-tight" style={{ color: 'hsl(var(--fg))' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-fg))' }}>{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Skeleton({ rows = 2 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-lg animate-pulse"
          style={{ background: 'hsl(var(--rule))' }}
        />
      ))}
    </div>
  );
}
