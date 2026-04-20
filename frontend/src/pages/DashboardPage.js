import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
 * Reads state from the `user` doc (current_band, target_band, exam_date,
 * streak, recent_sessions, skill_bands). Anything missing renders as an
 * empty-state / placeholder rather than a mock number — dashboards shown to
 * real students must not invent data.
 */
export default function DashboardPage({ user, onLogout }) {
  const { t, languageWireCode } = useI18n();
  const navigate = useNavigate();

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
    user?.firstName ||
    user?.first_name ||
    (user?.name ? user.name.split(" ")[0] : null) ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "";

  // ---- Exam countdown ----
  const examDate = user?.exam_date ? new Date(user.exam_date) : null;
  const daysRemaining =
    examDate && !Number.isNaN(examDate.getTime())
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

  // ---- Metrics (no fake fallback) ----
  const currentBand =
    user?.current_band != null ? String(user.current_band) : "—";
  const targetBand =
    user?.target_band != null ? String(user.target_band) : "—";
  const targetProgressPct =
    user?.current_band != null && user?.target_band
      ? Math.max(
          0,
          Math.min(100, Math.round((user.current_band / user.target_band) * 100))
        )
      : null;
  const targetProgressLabel =
    targetProgressPct == null
      ? t("dashboardV2SetTargetBand")
      : t("dashboardV2MetricsTargetProgress", { pct: targetProgressPct });

  // ---- Skills table: empty until backend supplies per-skill bands ----
  const skills = useMemo(() => {
    const source = user?.skill_bands;
    if (!source || typeof source !== "object") {
      return SKILL_KEYS.map((key) => ({
        key,
        name: t(`dashboardV2Skill${key}`),
        band: null,
        pctOfTarget: 0,
        trend: "flat",
      }));
    }
    return SKILL_KEYS.map((key) => {
      const entry = source[key.toLowerCase()] || {};
      return {
        key,
        name: t(`dashboardV2Skill${key}`),
        band: entry.band ?? null,
        pctOfTarget: entry.pctOfTarget ?? 0,
        trend: entry.trend ?? "flat",
        isWeakest: !!entry.isWeakest,
      };
    });
  }, [user?.skill_bands, t]);

  // ---- Streak: render the last 7 days + today relative to *now*.
  // States come from user.streak (array of ISO dates). Missing → all "off".
  const streakDates = useMemo(() => {
    const daysBack = 7; // show 7 prior days + today = 8 dots
    const fmtLetter = (d) =>
      d.toLocaleDateString("en-US", { weekday: "narrow" });
    const fmtTip = (d) =>
      d.toLocaleDateString(languageWireCode || "en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

    const completedSet = new Set(
      Array.isArray(user?.streak)
        ? user.streak.map((iso) => new Date(iso).toDateString())
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
        state: isToday ? (completed ? "today" : "today") : completed ? "on" : "off",
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.streak, languageWireCode]);

  const hasCompletedStreakDay = streakDates.some((d) => d.state === "on");

  // ---- Recent sessions (empty until backend supplies) ----
  const recentSessions = Array.isArray(user?.recent_sessions)
    ? user.recent_sessions
    : [];

  // ---- Button handlers ----
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
        message={t("dashboardV2LizCoherenceMsg")}
        onPrimary={goto("/question-bank/writing/task2")}
        onSecondary={goto("/liz")}
      />

      <MetricsTriptych
        currentBand={currentBand}
        // Only show the "Up from…" trend once we actually have history.
        currentBandTrend={
          user?.current_band_trend
            ? {
                label: user.current_band_trend.label,
                direction: user.current_band_trend.direction || "up",
              }
            : null
        }
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
              {t("dashboardV2MinutesLabel", { n: 10 })}
            </>
          }
          title={t("dashboardV2TodaysTaskTitle")}
          description={t("dashboardV2TodaysTaskDesc")}
          steps={[
            t("dashboardV2TodaysTaskStep1"),
            t("dashboardV2TodaysTaskStep2"),
            t("dashboardV2TodaysTaskStep3"),
          ]}
          ctaLabel={t("dashboardV2BeginDrill")}
          onStart={goto("/question-bank/writing/task2")}
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
        tiles={[
          {
            status: t("dashboardV2SkillWriting"),
            title: t("dashboardV2SkillWriting"),
            subtitle: "Task 2 · 40 min",
            ctaLabel: t("dashboardV2BeginDrill"),
            href: "/question-bank/writing/task2",
          },
          {
            status: t("dashboardV2SkillSpeaking"),
            title: t("dashboardV2SkillSpeaking"),
            subtitle: "Part 2 · 3–4 min",
            ctaLabel: t("dashboardV2BeginDrill"),
            href: "/question-bank/speaking",
          },
          {
            status: t("dashboardV2SkillReading"),
            title: t("dashboardV2SkillReading"),
            subtitle: "Academic · 20 min",
            ctaLabel: t("dashboardV2BeginDrill"),
            href: "/question-bank/reading",
          },
          {
            status: t("dashboardV2SkillListening"),
            title: t("dashboardV2SkillListening"),
            subtitle: "Section · 15 min",
            ctaLabel: t("dashboardV2BeginDrill"),
            href: "/question-bank/listening",
          },
        ]}
      />

      <MockTestFrame
        eyebrow={t("dashboardV2MockEyebrow")}
        title={t("dashboardV2MockTitle")}
        description={t("dashboardV2MockDesc")}
        durationLabel={t("dashboardV2MockDuration")}
        lastMockLabel={t("dashboardV2MockLastLabel")}
        lastMock={user?.last_mock_label || "—"}
        nextRecommendedLabel={t("dashboardV2MockNextLabel")}
        nextRecommended={user?.next_mock_label || t("dashboardV2MockNextValue")}
        ctaLabel={t("dashboardV2MockCta")}
        scheduleLabel={t("dashboardV2MockSchedule")}
        onStart={goto("/practice-test")}
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
          message={t("dashboardV2LizNoteMsg")}
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
