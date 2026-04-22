import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useI18n } from "../lib/i18n";
import {
  DashboardLayout,
  DashboardFooter,
  EditorialMasthead,
  LizMessage,
  MetricsTriptych,
  StreakStrip,
  TodaysTask,
  SkillsTable,
  PracticeIndex,
  MockTestFrame,
  RecentSessions,
  LizNote,
  QuickAccessTiles,
  DEFAULT_QUICK_ACCESS,
} from "../features/dashboard";

const DAY_MS = 24 * 60 * 60 * 1000;
const SKILL_KEYS = ["Listening", "Reading", "Writing", "Speaking"];

/**
 * Authenticated home.
 *
 * On mount we fetch /api/dashboard/summary for the signed-in user and render
 * every section from that payload (skill bands, streak, recent sessions,
 * Today's Task, Liz nudge, Mock pick — all derived from real test_attempts).
 * If the request fails we fall back to an honest empty-state so the UI never
 * invents numbers.
 */
export default function DashboardPage({ user, onLogout }) {
  const { t, languageWireCode } = useI18n();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);

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
  const examDateLabel =
    examDate && !Number.isNaN(examDate.getTime())
      ? examDate.toLocaleDateString(languageWireCode || "en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })
      : t("dashboardV2SetExamDate");

  // ---- Metrics ----
  const currentBand =
    summary?.current_band != null ? String(summary.current_band) : "—";
  const targetBand =
    summary?.target_band != null ? String(summary.target_band) : "—";
  const targetProgressPct =
    summary?.current_band != null && summary?.target_band
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round((summary.current_band / summary.target_band) * 100)
          )
        )
      : null;
  const targetProgressLabel =
    targetProgressPct == null
      ? t("dashboardV2SetTargetBand")
      : t("dashboardV2MetricsTargetProgress", { pct: targetProgressPct });

  // ---- Skills table ----
  const skills = useMemo(() => {
    const source = summary?.skill_bands;
    return SKILL_KEYS.map((key) => {
      const entry = (source && source[key.toLowerCase()]) || {};
      return {
        key,
        name: t(`dashboardV2Skill${key}`),
        band: entry.band ?? null,
        pctOfTarget: entry.pctOfTarget ?? 0,
        trend: entry.trend ?? "flat",
        isWeakest: !!entry.isWeakest,
      };
    });
  }, [summary?.skill_bands, t]);

  // ---- Streak: last 7 days + today, ON when in summary.streak ISO list ----
  const streakDates = useMemo(() => {
    const daysBack = 7;
    const fmtLetter = (d) =>
      d.toLocaleDateString("en-US", { weekday: "narrow" });
    const fmtTip = (d) =>
      d.toLocaleDateString(languageWireCode || "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

    const completedSet = new Set(
      Array.isArray(summary?.streak)
        ? summary.streak.map((iso) => new Date(iso).toDateString())
        : []
    );

    const out = [];
    for (let i = daysBack; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const isToday = i === 0;
      const completed = completedSet.has(d.toDateString());
      out.push({
        label: fmtLetter(d),
        tooltip: isToday ? `Today — ${fmtTip(d)}` : fmtTip(d),
        state: isToday ? "today" : completed ? "on" : "off",
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary?.streak, languageWireCode]);

  const hasCompletedStreakDay = streakDates.some((d) => d.state === "on");

  const recentSessions = Array.isArray(summary?.recent_sessions)
    ? summary.recent_sessions
    : [];

  // Today's task + Liz message + mock rec — all come from the summary if
  // present, else fall back to the editorial copy held in i18n.
  const todayTask = summary?.today_task || null;
  const lizMsg = summary?.liz_message || t("dashboardV2LizCoherenceMsg");
  const mockRec = summary?.mock_recommendation || null;

  const goto = (path) => () => navigate(path);

  return (
    <DashboardLayout
      activeSection="dashboard"
      activeMobileTab="home"
      user={user}
      onLogout={onLogout}
    >
      <EditorialMasthead
        dateLabel={dateLabel}
        daysToExamLabel={daysToExamLabel}
        greeting={t(greetingKey, { name: firstName || "there" })}
        subhead={t("dashboardV2Subhead")}
      />

      <LizMessage
        message={lizMsg}
        onPrimary={goto(todayTask?.cta_href || "/question-bank/writing/task2")}
        onSecondary={goto("/liz")}
      />

      <MetricsTriptych
        currentBand={currentBand}
        currentBandTrend={null /* only render once we have real trend history */}
        targetBand={targetBand}
        targetProgressPct={targetProgressPct ?? 0}
        targetProgressLabel={targetProgressLabel}
        daysRemaining={daysRemaining ?? "—"}
        examDateLabel={examDateLabel}
      />

      <StreakStrip
        eyebrow={t("dashboardV2StreakEyebrow")}
        title={
          hasCompletedStreakDay
            ? t("dashboardV2StreakTitle")
            : t("dashboardV2StreakEmptySub")
        }
        subtitle={hasCompletedStreakDay ? t("dashboardV2StreakSub") : ""}
        days={streakDates}
      />

      <section className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-10 md:gap-16 mb-14 md:mb-20">
        <TodaysTask
          eyebrow={
            <>
              {t("dashboardV2TodayEyebrow")} <span className="divider-dot" />{" "}
              {t("dashboardV2MinutesLabel", {
                n: todayTask?.duration_minutes ?? 10,
              })}
            </>
          }
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
        <SkillsTable
          eyebrow={t("dashboardV2SkillsEyebrow")}
          title={t("dashboardV2SkillsTitle")}
          skills={skills}
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
      </section>

      <PracticeIndex
        tiles={SKILL_KEYS.map((key) => {
          const pathKey = key.toLowerCase();
          const skill = (summary?.skill_bands || {})[pathKey] || {};
          return {
            status:
              skill.band != null
                ? `${t(`dashboardV2Skill${key}`)} · ${skill.band.toFixed(1)}`
                : t(`dashboardV2Skill${key}`),
            title: t(`dashboardV2Skill${key}`),
            subtitle:
              skill.attempts > 0
                ? `${skill.attempts} recent ${
                    skill.attempts === 1 ? "attempt" : "attempts"
                  }`
                : "Fresh prompt",
            ctaLabel: t("dashboardV2BeginDrill"),
            href: `/question-bank/${pathKey}`,
          };
        })}
      />

      <MockTestFrame
        eyebrow={t("dashboardV2MockEyebrow")}
        title={t("dashboardV2MockTitle")}
        description={t("dashboardV2MockDesc")}
        durationLabel={t("dashboardV2MockDuration")}
        lastMockLabel={t("dashboardV2MockLastLabel")}
        lastMock={summary?.user?.last_mock_label || "—"}
        nextRecommendedLabel={t("dashboardV2MockNextLabel")}
        nextRecommended={mockRec?.label || t("dashboardV2MockNextValue")}
        ctaLabel={t("dashboardV2MockCta")}
        scheduleLabel={t("dashboardV2MockSchedule")}
        onStart={goto(mockRec?.href || "/full-test")}
        onSchedule={goto("/profile")}
      />

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

      <QuickAccessTiles
        eyebrow={t("dashboardV2ElsewhereEyebrow")}
        items={[
          { ...DEFAULT_QUICK_ACCESS[0], label: t("dashboardV2QaBeginnerCourse") },
          { ...DEFAULT_QUICK_ACCESS[1], label: t("dashboardV2QaMasteryCourse") },
          { ...DEFAULT_QUICK_ACCESS[2], label: t("dashboardV2QaAdvanced") },
          { ...DEFAULT_QUICK_ACCESS[3], label: t("dashboardV2QaLearningTools") },
          { ...DEFAULT_QUICK_ACCESS[4], label: t("dashboardV2QaQuestionBank") },
          { ...DEFAULT_QUICK_ACCESS[5], label: t("dashboardV2QaVocabulary") },
          { ...DEFAULT_QUICK_ACCESS[6], label: t("dashboardV2QaGrammar") },
          { ...DEFAULT_QUICK_ACCESS[7], label: t("dashboardV2QaSpeakingTopics") },
        ]}
      />

      <DashboardFooter />
    </DashboardLayout>
  );
}
