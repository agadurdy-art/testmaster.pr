// DashboardPage — the IELTS D1 dashboard home (routes /dashboard and /dashboard/v2).
// Orchestrator extracted from pages/DashboardPage.js (Faz1 refactor); body verbatim,
// inline section components moved to ./components/, module constants to ./constants.
// NOTE: /dashboard/v2 renders this with NO props — the { user, onLogout } signature
// must keep tolerating undefined.
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../lib/api";
import { useI18n } from "../../../../lib/i18n";
import {
  DashboardLayout,
  DashboardFooter,
  EditorialMasthead,
  LizMessage,
  TodaysTask,
  RecentSessions,
  LizNote,
} from "../../index";
import "../../../pricing/pricing.css";
import StudyTimeDrilldown from "../../components/StudyTimeDrilldown";
import { DAY_MS, SKILL_KEYS, SKILL_TONE } from "./constants";
import StreakDial from "./components/StreakDial";
import CurrentBandCard from "./components/CurrentBandCard";
import TargetBandSquare from "./components/TargetBandSquare";
import DaysSquare from "./components/DaysSquare";
import SmartPracticeList from "./components/SmartPracticeList";
import MockTestFrameWith4Grid from "./components/MockTestFrameWith4Grid";
import FullMockCard from "./components/FullMockCard";
import KnowledgeBaseCards from "./components/KnowledgeBaseCards";
import DashboardPlansBanner from "./components/DashboardPlansBanner";

export default function DashboardPage({ user, onLogout }) {
  const { t, languageWireCode } = useI18n();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [summaryError, setSummaryError] = useState(null);
  const [studyDrilldownOpen, setStudyDrilldownOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    api
      .get("/dashboard/summary", { params: { user_id: user.id } })
      .then((resp) => {
        if (!cancelled) setSummary(resp.data);
      })
      .catch((err) => {
        if (!cancelled) setSummaryError(err);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const today = new Date();
  const dateLabel = today.toLocaleDateString(languageWireCode || "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = today.getHours();
  const greetingKey =
    hour < 12
      ? "dashboardV2GreetingMorning"
      : hour < 18
      ? "dashboardV2GreetingAfternoon"
      : "dashboardV2GreetingEvening";

  const firstName =
    summary?.user?.first_name ||
    user?.firstName ||
    user?.first_name ||
    (user?.name ? user.name.split(" ")[0] : null) ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "";

  // ---- Exam countdown ----
  const examDateRaw = summary?.user?.exam_date || user?.exam_date;
  const examDate = examDateRaw ? new Date(examDateRaw) : null;
  const daysRemaining =
    summary?.user?.days_remaining != null
      ? summary.user.days_remaining
      : examDate && !Number.isNaN(examDate.getTime())
      ? Math.max(0, Math.ceil((examDate - today) / DAY_MS))
      : null;
  const daysToExamLabel =
    daysRemaining == null
      ? t("dashboardV2DaysToExamUnknown")
      : t("dashboardV2DaysToExam", { n: daysRemaining });

  // ---- Mock exam day (locally scheduled, persisted in localStorage) ----
  const [mockExamDate, setMockExamDate] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("mockExamDate") || null;
  });
  const mockDateObj = mockExamDate ? new Date(mockExamDate) : null;
  const mockDaysRemaining =
    mockDateObj && !Number.isNaN(mockDateObj.getTime())
      ? Math.max(0, Math.ceil((mockDateObj - today) / DAY_MS))
      : null;
  const handleSetMockDate = (iso) => {
    if (!iso) {
      localStorage.removeItem("mockExamDate");
      setMockExamDate(null);
    } else {
      localStorage.setItem("mockExamDate", iso);
      setMockExamDate(iso);
    }
  };

  // ---- Bands ----
  const currentBand =
    summary?.current_band != null ? Number(summary.current_band) : null;
  const targetBand =
    summary?.target_band != null ? Number(summary.target_band) : null;
  const targetGap =
    currentBand != null && targetBand != null
      ? Math.max(0, +(targetBand - currentBand).toFixed(1))
      : null;

  // ---- Streak count ----
  const streakCount = useMemo(() => {
    if (!Array.isArray(summary?.streak)) return 0;
    const set = new Set(summary.streak.map((iso) => new Date(iso).toDateString()));
    let n = 0;
    const cursor = new Date(today);
    while (set.has(cursor.toDateString())) {
      n += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return n;
  }, [summary?.streak]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Streak day-strip (last 7 days + today) ----
  const streakDates = useMemo(() => {
    const lc = languageWireCode || "en-US";
    const completedSet = new Set(
      Array.isArray(summary?.streak)
        ? summary.streak.map((iso) => new Date(iso).toDateString())
        : []
    );
    const out = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isToday = i === 0;
      const completed = completedSet.has(d.toDateString());
      out.push({
        label: d.toLocaleDateString("en-US", { weekday: "narrow" }),
        tooltip: isToday
          ? `Today — ${d.toLocaleDateString(lc, { weekday: "short", month: "short", day: "numeric" })}`
          : d.toLocaleDateString(lc, { weekday: "short", month: "short", day: "numeric" }),
        state: isToday ? "today" : completed ? "on" : "off",
      });
    }
    return out;
  }, [summary?.streak, languageWireCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasStreakDay = streakDates.some((d) => d.state === "on");

  // ---- Per-skill stats ----
  const skills = useMemo(() => {
    const source = summary?.skill_bands || {};
    return SKILL_KEYS.map((key) => {
      const entry = source[key.toLowerCase()] || {};
      return {
        key,
        name: t(`dashboardV2Skill${key}`),
        band: entry.band ?? null,
        attempts: entry.attempts ?? 0,
        pctOfTarget: entry.pctOfTarget ?? 0,
        trend: entry.trend ?? "flat",
        isWeakest: !!entry.isWeakest,
      };
    });
  }, [summary?.skill_bands, t]);

  const recentSessions = Array.isArray(summary?.recent_sessions)
    ? summary.recent_sessions
    : [];

  // ---- Weekly study time (for the dial centre) ----
  // Prefer an explicit summary field, otherwise sum recent-session durations
  // that fall inside the current ISO week.
  const weekStudyMinutes = useMemo(() => {
    if (typeof summary?.total_study_minutes_week === "number") {
      return Math.max(0, Math.round(summary.total_study_minutes_week));
    }
    const start = new Date(today);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday 00:00
    start.setHours(0, 0, 0, 0);
    let mins = 0;
    for (const s of recentSessions) {
      const ts = s?.completed_at || s?.created_at || s?.date;
      const when = ts ? new Date(ts) : null;
      if (!when || Number.isNaN(when.getTime()) || when < start) continue;
      const m =
        s?.duration_minutes ??
        (typeof s?.duration_seconds === "number"
          ? Math.round(s.duration_seconds / 60)
          : null);
      if (typeof m === "number") mins += m;
    }
    return mins;
  }, [summary?.total_study_minutes_week, recentSessions]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayTask = summary?.today_task || null;
  const lizMsg = summary?.liz_message || t("dashboardV2LizCoherenceMsg");

  const goto = (path) => () => navigate(path);

  return (
    <DashboardLayout
      activeSection="dashboard"
      activeMobileTab="home"
      user={user}
      onLogout={onLogout}
    >
      {/* 1. Editorial masthead */}
      <EditorialMasthead
        dateLabel={dateLabel}
        daysToExamLabel={daysToExamLabel}
        greeting={t(greetingKey, { name: firstName || "there" })}
        subhead={t("dashboardV2Subhead")}
      />

      {/* 2-3. Hero (Liz coaching + Current Band) with an at-a-glance right rail
              — study dial · exam countdown · target band. The rail fills the
              space the page used to leave empty; full-width sections continue
              below it. On mobile the rail stacks under the hero. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 lg:items-start mb-12 md:mb-16">
        <div className="min-w-0 space-y-6 md:space-y-8">
          <LizMessage
            message={lizMsg}
            onPrimary={goto(todayTask?.cta_href || "/question-bank/writing/task2")}
            onSecondary={goto("/liz")}
          />
          <CurrentBandCard
            band={currentBand}
            skills={skills}
            targetBand={targetBand}
            onSkillClick={(s) => {
              const path = {
                Listening: "/question-bank/listening",
                Reading: "/question-bank/reading",
                Writing: "/question-bank/writing",
                Speaking: "/question-bank/speaking",
              }[s.key];
              if (path) navigate(path);
            }}
          />
        </div>

        <aside className="space-y-4 mt-6 lg:mt-0 lg:sticky lg:top-24">
          <StreakDial
            minutes={weekStudyMinutes}
            empty={!hasStreakDay && weekStudyMinutes === 0}
            onClick={() => setStudyDrilldownOpen(true)}
          />
          <DaysSquare
            daysRemaining={daysRemaining}
            examDate={examDate}
            today={today}
            languageWireCode={languageWireCode}
            streakCount={streakCount}
            onSet={goto("/profile")}
            mockDate={mockDateObj}
            mockDaysRemaining={mockDaysRemaining}
          />
          <TargetBandSquare
            target={targetBand}
            gap={targetGap}
            onSet={goto("/profile")}
          />
        </aside>
      </div>

      <StudyTimeDrilldown
        userId={user?.id}
        open={studyDrilldownOpen}
        onClose={() => setStudyDrilldownOpen(false)}
      />

      {/* 4. Daily Drill + Smart Practice (side-by-side) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
        <TodaysTask
          eyebrow={(() => {
            // Personalised pill: "Your weakest skill · Listening" so the user
            // immediately sees that Today's Task is tailored to them, not a
            // generic recommendation. Aga 2026-05-23: "burdaki Bugun yazisi
            // dikkat cekmedigi icin bunun ne oldugunu user anlamiyor."
            const skill = todayTask?.skill;
            const skillKey = skill
              ? skill.charAt(0).toUpperCase() + skill.slice(1)
              : null;
            const tone = SKILL_TONE[skillKey] || "var(--primary)";
            return (
              <span className="inline-flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    background: `hsl(${tone} / 0.12)`,
                    color: `hsl(${tone})`,
                  }}
                >
                  <span aria-hidden="true">●</span>
                  {skill
                    ? `${t("dashboardV2TodaysPersonalisedFor")} ${skillKey}`
                    : t("dashboardV2TodayEyebrow")}
                </span>
                <span className="text-xs text-muted">
                  {t("dashboardV2MinutesLabel", {
                    n: todayTask?.duration_minutes ?? 10,
                  })}
                </span>
              </span>
            );
          })()}
          title={todayTask?.title || t("dashboardV2TodaysTaskTitle")}
          description={
            todayTask?.description || t("dashboardV2TodaysTaskDesc")
          }
          steps={
            Array.isArray(todayTask?.steps) && todayTask.steps.length > 0
              ? todayTask.steps
              : [
                  t("dashboardV2TodaysTaskStep1"),
                  t("dashboardV2TodaysTaskStep2"),
                  t("dashboardV2TodaysTaskStep3"),
                ]
          }
          ctaLabel={t("dashboardV2BeginDrill")}
          onStart={goto(todayTask?.cta_href || "/question-bank/writing/task2")}
        />
        <SmartPracticeList
          skills={skills}
          user={user}
          onPick={(key) => {
            const path = {
              Writing: "/question-bank?writing=1",
              Reading: "/question-bank?reading=1",
              Speaking: "/question-bank?speaking=1",
              Listening: "/question-bank?listening=1",
            }[key];
            if (path) navigate(path);
          }}
          onSpeakingPremium={() => navigate("/full-mock")}
        />
      </section>

      {/* 5b. Quick Assessment CTA — 15-min adaptive band check.
              Zero-cost backend, lighter commitment than the full mock,
              positioned between Smart Practice and Mock Test Center
              (Aga 2026-05-23 v2 onboarding spec). */}
      <section className="mb-8 md:mb-12">
        <button
          type="button"
          onClick={() => navigate('/quick-assessment')}
          className="w-full text-left rounded-2xl p-5 md:p-6 transition-colors flex items-center gap-4 md:gap-6"
          style={{
            background: 'linear-gradient(135deg, hsl(262 95% 97%) 0%, hsl(217 100% 97%) 100%)',
            border: '1px solid hsl(262 85% 90%)',
          }}
          data-testid="dashboard-quick-assessment-cta"
        >
          <div
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'hsl(262 70% 50%)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(262 70% 40%)' }}>
              15-minute check · adaptive
            </div>
            <div className="font-display text-lg md:text-xl mt-0.5" style={{ color: 'hsl(var(--fg))' }}>
              Estimate your IELTS band — fast.
            </div>
            <div className="text-xs md:text-sm mt-1" style={{ color: 'hsl(var(--muted-fg))' }}>
              Reading + Listening + Writing + Speaking. Cambridge-calibrated scoring. Re-take any time to track progress.
            </div>
          </div>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--muted-fg))" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* 6. Mock Test Center — gold frame + 4-grid inside, Cambridge & AI cards below */}
      <section className="mb-12 md:mb-16">
        <MockTestFrameWith4Grid
          navigate={navigate}
          lastMockLabel={summary?.user?.last_mock_label}
          eyebrow={t("dashboardV2MockEyebrow")}
          title={t("dashboardV2MockTitle")}
          description={t("dashboardV2MockDesc")}
          durationLabel={t("dashboardV2MockDuration")}
          ctaLabel={t("dashboardV2MockCta")}
          mockExamDate={mockExamDate}
          onSetMockDate={handleSetMockDate}
          languageWireCode={languageWireCode}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FullMockCard
            tone="gold"
            eyebrow="Official"
            title="Cambridge full mocks"
            description="Real past papers — full timing, real listening audio."
            onClick={() => navigate("/question-bank?fulltests=cambridge")}
          />
          <FullMockCard
            tone="sky"
            eyebrow="AI-generated"
            title="Fresh mocks, made for you"
            description="New prompts every week — calibrated to your weak skill."
            onClick={() => navigate("/question-bank?fulltests=ai")}
          />
          <FullMockCard
            tone="liz"
            eyebrow="Speaking · Liz ✦"
            title="Speaking mock with Liz"
            description="One continuous 12–14 min exam — Parts 1–3 live, holistic band at the end."
            onClick={() => navigate("/full-mock")}
          />
        </div>
      </section>

      {/* 7. Knowledge Base — Learning Tools + Courses side-by-side */}
      <KnowledgeBaseCards navigate={navigate} />

      {/* 8. Recent + Liz note (demoted) */}
      <section className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 md:gap-16 mb-14 md:mb-20">
        <RecentSessions
          eyebrow={t("dashboardV2RecentEyebrow")}
          title={t("dashboardV2RecentTitle")}
          viewAllLabel={t("dashboardV2ViewAll")}
          viewAllHref="/progress"
          bandLabel={t("dashboardV2BandLabel")}
          sessions={recentSessions}
          emptyMessage={t("dashboardV2EmptySessionsMsg")}
        />
        <LizNote
          eyebrow={t("dashboardV2LizNoteEyebrow")}
          message={lizMsg}
          primaryCtaLabel={t("dashboardV2LizNoteYes")}
          secondaryCtaLabel={t("dashboardV2LizNoteNo")}
          onAccept={goto("/liz")}
          onDismiss={() => {}}
        />
      </section>

      {/* 9. Plans banner — slim collapsed strip; expands to the live PlanCards
          grid from /pricing so users can compare/upgrade without leaving the
          dashboard. Reuses the same component the Pricing page renders, so
          quotas and CTAs stay in sync automatically. */}
      <DashboardPlansBanner user={user} />

      <DashboardFooter />
    </DashboardLayout>
  );
}
