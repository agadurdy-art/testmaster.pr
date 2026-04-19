import React from "react";
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
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <DashboardLayout activeSection="dashboard" activeMobileTab="home">
      <EditorialMasthead
        dateLabel={dateLabel}
        daysToExamLabel="45 days to exam"
        greeting="Good morning, Aga."
        subhead="A quiet ten minutes today keeps your streak alive — and your writing moving in the right direction."
      />

      <LizMessage
        message={
          <>
            Yesterday you tackled Task 1. Today let's work on{" "}
            <em className="italic">coherence</em> — the quiet skill that lifts
            a 6 toward a 7.
          </>
        }
      />

      <MetricsTriptych
        currentBand={"6.0"}
        currentBandTrend={{ label: "Up from 5.5 in March", direction: "up" }}
        targetBand={"7.0"}
        targetProgressPct={86}
        targetProgressLabel="86% of the way there"
        daysRemaining={45}
        examDateLabel="Saturday, June 2"
      />

      <StreakStrip
        title="Seven days, unbroken."
        subtitle="One more keeps you at your best-ever run of eight."
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
              Today <span className="divider-dot" /> 10 minutes
            </>
          }
          title="Coherence drill"
          description="Connecting ideas in Task 2 body paragraphs — cohesive devices, topic sentences, and the quiet rhythm of a well-built argument."
          steps={[
            "Identify weak transitions in a sample essay.",
            "Rewrite three body paragraphs with Liz's feedback.",
            "A short reflection: what changed and why.",
          ]}
        />
        <SkillsTable
          skills={[
            { name: "Listening", band: 6.5, pctOfTarget: 65, trend: "up" },
            { name: "Reading", band: 7.0, pctOfTarget: 100, trend: "flat" },
            { name: "Writing", band: 5.5, pctOfTarget: 50, trend: "down", isWeakest: true },
            { name: "Speaking", band: 6.5, pctOfTarget: 60, trend: "up" },
          ]}
        />
      </section>

      <PracticeIndex
        tiles={[
          {
            status: "In progress",
            title: "Writing",
            subtitle: "Task 2 essay · 40 min",
            progressLabel: "Draft 2 of 4",
            ctaLabel: "Continue",
            href: "/question-bank/writing/task2",
          },
          {
            status: "New",
            title: "Speaking",
            subtitle: "Part 2 cue card · 3–4 min",
            progressLabel: "Fresh prompt",
            ctaLabel: "Try now",
            href: "/question-bank/speaking",
          },
          {
            status: "Daily",
            title: "Reading",
            subtitle: "Academic passage · 20 min",
            progressLabel: "Passage 7 of 40",
            ctaLabel: "Continue",
            href: "/question-bank/reading/practice",
          },
          {
            status: "Section 3",
            title: "Listening",
            subtitle: "Lecture excerpt · 15 min",
            progressLabel: "Set 12 of 30",
            ctaLabel: "Try new",
            href: "/question-bank/listening",
          },
        ]}
      />

      <MockTestFrame
        description="All four skills, exam conditions, officially-weighted scoring. Best once every two weeks — close enough to the real thing that Liz can calibrate your study plan."
        lastMock="Band 5.5, April 6"
        nextRecommended="this weekend"
      />

      <section className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 md:gap-16 mb-14 md:mb-20">
        <RecentSessions
          sessions={[
            { title: "Writing Task 1 — Line graph", subtitle: "Yesterday · 38 min", band: 6.0 },
            { title: 'Speaking Part 2 — "A place you visited"', subtitle: "Apr 16 · 4 min", band: 6.5 },
            { title: "Reading — Academic Passage 6", subtitle: "Apr 15 · 22 min", band: 7.0 },
          ]}
        />
        <LizNote message="Your Writing band dipped last week. Shall I build a seven-day recovery plan?" />
      </section>

      <QuickAccessTiles items={DEFAULT_QUICK_ACCESS} />

      <DashboardFooter />
    </DashboardLayout>
  );
}
