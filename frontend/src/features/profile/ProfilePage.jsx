// ProfilePage — the shared profile page (route /profile). Orchestrator extracted from
// pages/Profile.js (Faz1 wave 10); body verbatim. Plan constants + date/initials helpers
// moved to ./lib, the six cards and their primitives to ./components/ with closed-over
// values passed as same-named props. The ONE product branch is preserved VERBATIM here:
// isGE = !isIeltsMode(fullUser || user) -> dashboardPath (lib/learningMode import stays).
import React, { useEffect, useMemo, useState } from 'react';
import { authHeader } from '../../lib/authToken';
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

import { DashboardLayout } from '../dashboard';
import { getUserProgress, getUser, getUserUsage } from '../../lib/api';
import { isAdminUser } from '../../lib/planAccess';
import { isIeltsMode } from '../../lib/learningMode';
import { useTheme, THEME_MODES } from '../../contexts/ThemeContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

import { PLAN_LABELS, LEGACY_PLAN_ALIAS, PLAN_TONE, formatDate, formatISODate } from './lib';
import IdentityCard from './components/IdentityCard';
import SubscriptionCard from './components/SubscriptionCard';
import StudyProfileCard from './components/StudyProfileCard';
import PreferencesCard from './components/PreferencesCard';
import ActivityCard from './components/ActivityCard';
import AccountCard from './components/AccountCard';

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
        headers: { 'Content-Type': 'application/json', ...authHeader() },
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
