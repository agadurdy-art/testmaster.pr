import React from "react";
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

/**
 * Authenticated home — composes every dashboard section.
 *
 * Data is inline fixture-style today; when the dashboard API lands
 * (/dashboard/summary), this page becomes the place to fetch + render it.
 */
export default function DashboardPage() {
  const { t, languageWireCode } = useI18n();
  const today = new Date();
  // Localized weekday + month via browser locale (honors user's i18n pick).
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

  const skillsSource = [
    { key: "Listening", band: 6.5, pctOfTarget: 65, trend: "up" },
    { key: "Reading", band: 7.0, pctOfTarget: 100, trend: "flat" },
    { key: "Writing", band: 5.5, pctOfTarget: 50, trend: "down", isWeakest: true },
    { key: "Speaking", band: 6.5, pctOfTarget: 60, trend: "up" },
  ];
  const skills = skillsSource.map((s) => ({
    ...s,
    name: t(`dashboardV2Skill${s.key}`),
  }));

  return (
    <DashboardLayout activeSection="dashboard" activeMobileTab="home">
      <EditorialMasthead
        dateLabel={dateLabel}
        daysToExamLabel={t("dashboardV2DaysToExam", { n: 45 })}
        greeting={t(greetingKey, { name: "Aga" })}
        subhead={t("dashboardV2Subhead")}
      />

      <LizMessage message={t("dashboardV2LizCoherenceMsg")} />

      <MetricsTriptych
        currentBand={"6.0"}
        currentBandTrend={{
          label: t("dashboardV2MetricsTrendUpMarch"),
          direction: "up",
        }}
        targetBand={"7.0"}
        targetProgressPct={86}
        targetProgressLabel={t("dashboardV2MetricsTargetProgress", { pct: 86 })}
        daysRemaining={45}
        examDateLabel={t("dashboardV2ExamDate")}
      />

      <StreakStrip
        eyebrow={t("dashboardV2StreakEyebrow")}
        title={t("dashboardV2StreakTitle")}
        subtitle={t("dashboardV2StreakSub")}
        days={[
          { label: "F", tooltip: "Fri Apr 12", state: "on" },
          { label: "S", tooltip: "Sat Apr 13", state: "on" },
          { label: "S", tooltip: "Sun Apr 14", state: "on" },
          { label: "M", tooltip: "Mon Apr 15", state: "on" },
          { label: "T", tooltip: "Tue Apr 16", state: "on" },
          { label: "W", tooltip: "Wed Apr 17", state: "on" },
          { label: "T", tooltip: "Today — Thu Apr 18", state: "today" },
          { label: "F", tooltip: "Fri Apr 19 (upcoming)", state: "off" },
        ]}
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
        />
        <SkillsTable
          eyebrow={t("dashboardV2SkillsEyebrow")}
          title={t("dashboardV2SkillsTitle")}
          skills={skills}
        />
      </section>

      <PracticeIndex
        tiles={[
          {
            status: "In progress",
            title: t("dashboardV2SkillWriting"),
            subtitle: "Task 2 essay · 40 min",
            progressLabel: "Draft 2 of 4",
            ctaLabel: "Continue",
            href: "/question-bank/writing/task2",
          },
          {
            status: "New",
            title: t("dashboardV2SkillSpeaking"),
            subtitle: "Part 2 cue card · 3–4 min",
            progressLabel: "Fresh prompt",
            ctaLabel: "Try now",
            href: "/question-bank/speaking",
          },
          {
            status: "Daily",
            title: t("dashboardV2SkillReading"),
            subtitle: "Academic passage · 20 min",
            progressLabel: "Passage 7 of 40",
            ctaLabel: "Continue",
            href: "/question-bank/reading/practice",
          },
          {
            status: "Section 3",
            title: t("dashboardV2SkillListening"),
            subtitle: "Lecture excerpt · 15 min",
            progressLabel: "Set 12 of 30",
            ctaLabel: "Try new",
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
        lastMock={t("dashboardV2MockLastValue")}
        nextRecommendedLabel={t("dashboardV2MockNextLabel")}
        nextRecommended={t("dashboardV2MockNextValue")}
        ctaLabel={t("dashboardV2MockCta")}
        scheduleLabel={t("dashboardV2MockSchedule")}
      />

      <section className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 md:gap-16 mb-14 md:mb-20">
        <RecentSessions
          eyebrow={t("dashboardV2RecentEyebrow")}
          title={t("dashboardV2RecentTitle")}
          viewAllLabel={t("dashboardV2ViewAll")}
          bandLabel={t("dashboardV2BandLabel")}
          sessions={[
            { title: "Writing Task 1 — Line graph", subtitle: "Yesterday · 38 min", band: 6.0 },
            { title: 'Speaking Part 2 — "A place you visited"', subtitle: "Apr 16 · 4 min", band: 6.5 },
            { title: "Reading — Academic Passage 6", subtitle: "Apr 15 · 22 min", band: 7.0 },
          ]}
        />
        <LizNote
          eyebrow={t("dashboardV2LizNoteEyebrow")}
          message={t("dashboardV2LizNoteMsg")}
          primaryCtaLabel={t("dashboardV2LizNoteYes")}
          secondaryCtaLabel={t("dashboardV2LizNoteNo")}
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
