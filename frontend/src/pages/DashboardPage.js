import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useI18n } from "../lib/i18n";
import {
  DashboardLayout,
  DashboardFooter,
  EditorialMasthead,
  LizMessage,
  TodaysTask,
  RecentSessions,
  LizNote,
} from "../features/dashboard";
import { isSpeakingPremiumUser } from "../lib/planAccess";
import { Sparkles, Lock, BookOpen, Headphones, PenLine, Mic, ChevronDown, ChevronUp } from "lucide-react";
import { PlanCards } from "../features/pricing";
import "../features/pricing/pricing.css";

// Skill → background watermark icon for the Cambridge mock cards.
const SKILL_ICON = {
  Reading: BookOpen,
  Listening: Headphones,
  Writing: PenLine,
  Speaking: Mic,
};
import StudyTimeDrilldown from "../features/dashboard/components/StudyTimeDrilldown";

const DAY_MS = 24 * 60 * 60 * 1000;
const SKILL_KEYS = ["Listening", "Reading", "Writing", "Speaking"];

// Skill → accent token. Keeps each skill consistently coloured across the
// Smart Practice list, Cambridge 19 grid, and any per-skill chips.
const SKILL_TONE = {
  Listening: "var(--liz)",
  Reading: "var(--sky)",
  Writing: "var(--gold-ink)",
  Speaking: "var(--primary)",
};

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

      {/* 2. Hero — Liz coaching (prominent) + Steady Hand dial (compact) */}
      <section className="grid grid-cols-1 lg:grid-cols-[8fr_3fr] gap-6 md:gap-10 items-start mb-10 md:mb-14">
        <LizMessage
          message={lizMsg}
          onPrimary={goto(todayTask?.cta_href || "/question-bank/writing/task2")}
          onSecondary={goto("/liz")}
        />
        <StreakDial
          minutes={weekStudyMinutes}
          empty={!hasStreakDay && weekStudyMinutes === 0}
          onClick={() => setStudyDrilldownOpen(true)}
        />
      </section>

      <StudyTimeDrilldown
        userId={user?.id}
        open={studyDrilldownOpen}
        onClose={() => setStudyDrilldownOpen(false)}
      />

      {/* 3. Bands strip — wide Current Band (with skill rows inside) + small Target + small Days */}
      <section className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 mb-12 md:mb-16">
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
        <TargetBandSquare
          target={targetBand}
          gap={targetGap}
          onSet={goto("/profile")}
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
      </section>

      {/* 4. Daily Drill + Smart Practice (side-by-side) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
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
          onSpeakingPremium={() => navigate("/speaking-premium")}
        />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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

// ──────────────────────────────────────────────────────────────────────────
//  Inline section components
// ──────────────────────────────────────────────────────────────────────────

// Week-ring donut — port of Claude Design "Days Circle" handoff.
// Sun→Sat wedges, soft pastel fills, today gets a bright emerald gradient,
// glass center holds the headline (streak count) on a frosted disc.
const WEEK_DAYS = [
  { name: "Sunday",    abbr: "S", fill: "#FCE8DD" }, // peach
  { name: "Monday",    abbr: "M", fill: "#FBEFD8" }, // apricot
  { name: "Tuesday",   abbr: "T", fill: "#F4F1D9" }, // butter
  { name: "Wednesday", abbr: "W", fill: "#E2F0E3" }, // mint
  { name: "Thursday",  abbr: "T", fill: "#DFEBF1" }, // sky
  { name: "Friday",    abbr: "F", fill: "#E5E3F2" }, // periwinkle
  { name: "Saturday",  abbr: "S", fill: "#EFE4F1" }, // lilac
];

function StreakDial({ minutes = 0, empty, onClick }) {
  const safeMins = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(safeMins / 60);
  const mins = safeMins % 60;
  // Geometry mirrors the prototype: viewBox 0..100, outer r=46, inner r=36.
  const cx = 50;
  const cy = 50;
  const rOuter = 46;
  const rInner = 36;
  const rMid = (rOuter + rInner) / 2;
  const total = WEEK_DAYS.length;
  const slice = (Math.PI * 2) / total;
  // Start so Sunday's wedge is centred at 12 o'clock.
  const startOffset = -Math.PI / 2 - slice / 2;
  const now = new Date();
  const todayIdx = now.getDay(); // 0=Sun..6=Sat
  const todayName = WEEK_DAYS[todayIdx].name.toUpperCase();
  // ISO week number — same algorithm as the prototype.
  const weekNumber = (() => {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const dayNum = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dayNum + 3);
    const firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const diff = (d - firstThu) / 86400000;
    return 1 + Math.round((diff - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
  })();

  const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  const wedgePath = (i) => {
    const a0 = startOffset + i * slice;
    const a1 = a0 + slice;
    const [x0, y0] = pt(a0, rOuter + 1);
    const [x1, y1] = pt(a1, rOuter + 1);
    return `M ${cx} ${cy} L ${x0.toFixed(3)} ${y0.toFixed(3)} A ${rOuter + 1} ${rOuter + 1} 0 0 1 ${x1.toFixed(3)} ${y1.toFixed(3)} Z`;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={empty ? "Begin a streak" : `${hours}h ${mins}m studied this week — ${WEEK_DAYS[todayIdx].name}`}
      className="mx-auto md:mx-0 hover:-translate-y-0.5 transition-transform"
      style={{
        width: "100%",
        maxWidth: 240,
        background:
          "linear-gradient(180deg, hsl(var(--surface) / .55) 0%, hsl(var(--surface) / .25) 100%)",
        border: "none",
        borderRadius: 22,
        padding: "14px 14px 12px",
        display: "block",
        textAlign: "left",
      }}
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{
          display: "block",
          overflow: "visible",
          filter:
            "drop-shadow(0 18px 30px rgba(31,42,55,0.10)) drop-shadow(0 2px 6px rgba(31,42,55,0.06))",
        }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="streakRingGloss" cx="50%" cy="38%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.55" />
            <stop offset="55%" stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="streakTodayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1FC998" />
            <stop offset="100%" stopColor="#0E8C6D" />
          </linearGradient>
          <mask id="streakRingMask">
            <rect width="100" height="100" fill="black" />
            <circle cx={cx} cy={cy} r={rOuter} fill="white" />
            <circle cx={cx} cy={cy} r={rInner} fill="black" />
          </mask>
        </defs>

        {/* Wedges, clipped to the donut profile */}
        <g mask="url(#streakRingMask)">
          {WEEK_DAYS.map((d, i) => {
            const isToday = i === todayIdx;
            return (
              <path
                key={d.name}
                d={wedgePath(i)}
                fill={isToday ? "url(#streakTodayFill)" : d.fill}
                style={{
                  transition: "filter .25s ease, transform .25s ease",
                  transformOrigin: "50% 50%",
                  transform: isToday ? "scale(1.06)" : "none",
                  filter: isToday
                    ? "drop-shadow(0 6px 14px rgba(16,163,127,0.55)) drop-shadow(0 1px 2px rgba(16,163,127,0.35))"
                    : "none",
                }}
              />
            );
          })}
        </g>

        {/* Inner gloss highlight */}
        <g mask="url(#streakRingMask)" pointerEvents="none">
          <rect x="0" y="0" width="100" height="100" fill="url(#streakRingGloss)" />
        </g>

        {/* Hairline rims */}
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.35" />
        <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="rgba(31,42,55,0.10)" strokeWidth="0.16" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="0.3" />
        <circle cx={cx} cy={cy} r={rInner} fill="none" stroke="rgba(31,42,55,0.12)" strokeWidth="0.16" />

        {/* Single-letter wedge labels at midradius */}
        {WEEK_DAYS.map((d, i) => {
          const isToday = i === todayIdx;
          const a = startOffset + i * slice + slice / 2;
          const [lx, ly] = pt(a, rMid);
          return (
            <text
              key={`l-${d.name}`}
              x={lx.toFixed(3)}
              y={ly.toFixed(3)}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontSize: "3.6px",
                fill: isToday ? "#FFFFFF" : "#6B7484",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {d.abbr}
            </text>
          );
        })}
      </svg>

      {/* Glass center disc with the headline streak count */}
      <div
        className="absolute inset-0 grid place-items-center text-center pointer-events-none"
      >
        <div
          className="grid place-items-center"
          style={{
            width: "56%",
            height: "56%",
            borderRadius: "50%",
            background:
              "radial-gradient(120% 120% at 30% 20%, hsl(var(--surface) / .9), hsl(var(--surface) / .15) 60%), hsl(var(--surface) / .65)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            boxShadow:
              "inset 0 1px 0 hsl(var(--surface) / .9), inset 0 -1px 0 hsl(var(--fg) / .08), 0 18px 40px -18px hsl(var(--fg) / .25)",
            border: "1px solid hsl(var(--surface) / .7)",
          }}
        >
          <div style={{ padding: "0 6px" }}>
            <div
              style={{
                fontSize: 7,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "hsl(var(--muted-fg))",
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              Total Study
            </div>
            <div
              className="font-display tabular-nums"
              style={{
                fontWeight: 500,
                fontSize: "clamp(22px, 6.4vmin, 34px)",
                letterSpacing: "-0.03em",
                lineHeight: 0.95,
                color: "hsl(var(--fg))",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                gap: 2,
              }}
            >
              <span>{hours}</span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.32em",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "hsl(var(--muted-fg))",
                }}
              >
                h
              </span>
              <span style={{ marginLeft: 4 }}>{mins}</span>
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.32em",
                  fontWeight: 500,
                  letterSpacing: "0.04em",
                  color: "hsl(var(--muted-fg))",
                }}
              >
                m
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                fontSize: 7,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "hsl(var(--muted-fg))",
                fontWeight: 500,
              }}
            >
              {empty ? "Start today" : "This week"}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Caption chips — Week number on the left, today's name on the right */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 9px",
            borderRadius: 999,
            background: "hsl(var(--surface) / .75)",
            backdropFilter: "blur(14px) saturate(180%)",
            WebkitBackdropFilter: "blur(14px) saturate(180%)",
            border: "1px solid hsl(var(--rule))",
            boxShadow:
              "inset 0 1px 0 hsl(var(--surface) / .9), 0 4px 12px -6px hsl(var(--fg) / .25)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "hsl(var(--fg))",
            fontWeight: 500,
          }}
        >
          Week · <b style={{ fontWeight: 600 }}>W{weekNumber}</b>
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 9px",
            borderRadius: 999,
            background: "hsl(var(--surface) / .75)",
            backdropFilter: "blur(14px) saturate(180%)",
            WebkitBackdropFilter: "blur(14px) saturate(180%)",
            border: "1px solid hsl(var(--rule))",
            boxShadow:
              "inset 0 1px 0 hsl(var(--surface) / .9), 0 4px 12px -6px hsl(var(--fg) / .25)",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "hsl(var(--fg))",
            fontWeight: 500,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "hsl(var(--primary))",
              boxShadow: "0 0 0 3px hsl(var(--surface) / .8)",
            }}
          />
          {todayName}
        </span>
      </div>
    </button>
  );
}

function CurrentBandCard({ band, skills, targetBand, onSkillClick }) {
  const has = typeof band === "number";
  return (
    <div
      className="card p-6 md:p-8"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary) / .08) 0%, hsl(var(--surface) / .85) 55%)",
        borderColor: "hsl(var(--primary) / .25)",
      }}
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="label mb-2" style={{ color: "hsl(var(--primary-ink))" }}>
            Current band
          </div>
          <div className="display-xxl text-[64px] md:text-[80px] tabular-nums leading-none">
            {has ? band.toFixed(1) : "—"}
          </div>
        </div>
        {!has && (
          <div className="text-sm text-muted max-w-[18ch] text-right">
            Take your first test to start tracking.
          </div>
        )}
      </div>
      <hr className="my-5" style={{ borderColor: "hsl(var(--rule))" }} />
      <div className="eyebrow mb-3">Where you stand</div>
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-b hairline"
        style={{ borderColor: "hsl(var(--rule))" }}
      >
        {skills.map((s, i) => (
          <SkillCellInline
            key={s.key}
            skill={s}
            targetBand={targetBand}
            onClick={onSkillClick}
            isLast={i === skills.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function SkillCellInline({ skill, targetBand, onClick, isLast }) {
  const { name, band, isWeakest, pctOfTarget } = skill;
  const has = typeof band === "number";
  const tone = SKILL_TONE[skill.key] || "var(--primary)";
  const fill = isWeakest ? "var(--destruct)" : tone;
  const pct = has
    ? Math.max(0, Math.min(100, pctOfTarget || (targetBand ? Math.round((band / targetBand) * 100) : 0)))
    : 0;
  return (
    <button
      type="button"
      onClick={() => onClick?.(skill)}
      className="text-left py-4 px-3 transition-colors flex flex-col gap-2"
      style={{
        borderRight: isLast ? "none" : "1px solid hsl(var(--rule))",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--fg) / 0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          style={{
            width: 4,
            height: 14,
            borderRadius: 4,
            background: `hsl(${tone})`,
            flexShrink: 0,
          }}
        />
        <span className="label" style={{ color: `hsl(${tone})` }}>
          {name}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[28px] tabular-nums leading-none">
          {has ? band.toFixed(1) : "—"}
        </span>
        {isWeakest && (
          <span
            className="text-[9px] tracking-[0.16em] uppercase font-medium"
            style={{ color: "hsl(var(--destruct))" }}
          >
            Focus
          </span>
        )}
      </div>
      <div
        className="progress"
        style={{ background: "hsl(var(--rule))", height: 3, borderRadius: 999 }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: `hsl(${fill})`,
            transition: "width 600ms ease",
          }}
        />
      </div>
    </button>
  );
}

function TargetBandSquare({ target, gap, onSet }) {
  const has = typeof target === "number";
  return (
    <div
      className="card p-5 md:p-6 flex flex-col justify-between"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--gold) / .12) 0%, hsl(var(--surface) / .85) 60%)",
        borderColor: "hsl(var(--gold) / .35)",
      }}
    >
      <div className="label" style={{ color: "hsl(var(--gold-ink))" }}>
        Target band
      </div>
      <div className="display-xxl text-[48px] md:text-[56px] tabular-nums leading-none mt-2">
        {has ? target.toFixed(1) : "—"}
      </div>
      <div className="text-sm text-muted mt-3">
        {!has ? (
          <button
            type="button"
            onClick={onSet}
            className="underline underline-offset-4"
            style={{ textDecorationColor: "hsl(var(--rule))" }}
          >
            Set a target band
          </button>
        ) : gap == null ? (
          "Take a test to see the gap"
        ) : gap === 0 ? (
          <span style={{ color: "hsl(var(--primary-ink))" }}>At target</span>
        ) : (
          <span>
            <span className="tabular-nums font-medium" style={{ color: "hsl(var(--gold-ink))" }}>
              −{gap.toFixed(1)}
            </span>{" "}
            band{gap === 1 ? "" : "s"} to go
          </span>
        )}
      </div>
    </div>
  );
}

function DaysSquare({
  daysRemaining,
  examDate,
  today,
  languageWireCode,
  streakCount,
  onSet,
  mockDate,
  mockDaysRemaining,
}) {
  // Three states:
  // (a) Exam date set & in future → show countdown
  // (b) No exam date → show today's date as a calendar tile
  // (c) Exam date passed → show today + nudge
  const lc = languageWireCode || "en-US";
  const monthShort = today.toLocaleDateString(lc, { month: "short" }).toUpperCase();
  const weekday = today.toLocaleDateString(lc, { weekday: "long" });
  const dayNum = today.getDate();
  const mockLabel =
    mockDate && !Number.isNaN(mockDate.getTime()) && mockDaysRemaining != null
      ? `Mock · ${mockDate.toLocaleDateString(lc, {
          month: "short",
          day: "numeric",
        })} · in ${mockDaysRemaining} ${mockDaysRemaining === 1 ? "day" : "days"}`
      : null;

  if (daysRemaining != null && daysRemaining > 0) {
    const examMonth = examDate
      ? examDate.toLocaleDateString(lc, { month: "short", day: "numeric" })
      : null;
    return (
      <div
        className="card p-5 md:p-6 flex flex-col justify-between"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--sky) / .12) 0%, hsl(var(--surface) / .85) 60%)",
          borderColor: "hsl(var(--sky) / .35)",
        }}
      >
        <div className="label" style={{ color: "hsl(var(--sky))" }}>
          Days remaining
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <div className="display-xxl text-[48px] md:text-[56px] tabular-nums leading-none">
            {daysRemaining}
          </div>
          <div className="text-sm text-muted">days</div>
        </div>
        <div className="text-sm text-muted mt-3">
          {examMonth ? `Exam · ${examMonth}` : "until exam day"}
        </div>
        {mockLabel && (
          <div
            className="text-xs mt-2 pt-2"
            style={{
              color: "hsl(var(--gold-ink))",
              borderTop: "1px solid hsl(var(--rule))",
            }}
          >
            {mockLabel}
          </div>
        )}
      </div>
    );
  }

  // No exam date → calendar tile
  return (
    <div
      className="card p-5 md:p-6 flex flex-col justify-between"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--liz) / .10) 0%, hsl(var(--surface) / .85) 60%)",
        borderColor: "hsl(var(--liz) / .25)",
      }}
    >
      <div className="label" style={{ color: "hsl(var(--liz-ink))" }}>
        Today
      </div>
      <div className="mt-2">
        <div className="text-[10px] tracking-[0.22em] uppercase text-muted mb-1">
          {monthShort}
        </div>
        <div className="display-xxl text-[48px] md:text-[56px] tabular-nums leading-none">
          {dayNum}
        </div>
        <div className="text-xs text-muted mt-1">{weekday}</div>
      </div>
      <button
        type="button"
        onClick={onSet}
        className="text-sm text-muted underline underline-offset-4 self-start mt-3"
        style={{ textDecorationColor: "hsl(var(--rule))" }}
      >
        {streakCount > 0
          ? `${streakCount}-day streak · set exam date`
          : "Set exam date"}
      </button>
      {mockLabel && (
        <div
          className="text-xs mt-2 pt-2"
          style={{
            color: "hsl(var(--gold-ink))",
            borderTop: "1px solid hsl(var(--rule))",
          }}
        >
          {mockLabel}
        </div>
      )}
    </div>
  );
}

function SmartPracticeList({ skills, user, onPick, onSpeakingPremium }) {
  const order = ["Writing", "Reading", "Speaking", "Listening"];
  const isPremium = isSpeakingPremiumUser(user);
  return (
    <div>
      <div className="mb-5">
        <div className="label mb-2">Smart practice</div>
        <h3 className="display-l text-[24px] md:text-[28px]">Pick a skill</h3>
      </div>
      <div
        className="divide-y border-t border-b hairline"
        style={{ borderColor: "hsl(var(--rule))" }}
      >
        {order.map((key) => {
          const s = skills.find((x) => x.key === key) || {};
          const tone = SKILL_TONE[key];
          const row = (
            <button
              key={key}
              type="button"
              onClick={() => onPick(key)}
              className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left transition-colors px-1"
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--fg) / 0.025)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 4,
                  height: 28,
                  borderRadius: 4,
                  background: `hsl(${tone})`,
                }}
              />
              <div>
                <div className="font-display text-[18px]">{key}</div>
                <div className="text-xs text-muted">
                  {s.attempts > 0
                    ? `${s.attempts} recent ${s.attempts === 1 ? "attempt" : "attempts"}${
                        typeof s.band === "number" ? ` · band ${s.band.toFixed(1)}` : ""
                      }`
                    : "Fresh prompt"}
                </div>
              </div>
              <Arrow small />
            </button>
          );

          // Liz Examiner card is injected directly under the Listening row
          // (was under Speaking). Aga 2026-05-10: "premium ismini examiner
          // olarak degistir ve listening'in altinda konumlansin." Premium
          // tiers (monthly + exam) get the live entry; free / weekly see a
          // locked appearance with a short conversion blurb.
          if (key !== "Listening") return row;

          return (
            <React.Fragment key={key}>
              {row}
              <button
                type="button"
                onClick={onSpeakingPremium}
                className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left transition-colors px-1"
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--fg) / 0.025)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 4,
                    height: 28,
                    borderRadius: 4,
                    background: "linear-gradient(180deg, #7c3aed, #ec4899)",
                  }}
                />
                <div>
                  <div className="font-display text-[18px] flex items-center gap-2">
                    Liz Examiner
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 text-violet-700 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                      {isPremium ? (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Liz Live
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Premium
                        </>
                      )}
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    {isPremium
                      ? "Live conversation with Liz · ElevenLabs voice tutor"
                      : "Real-time Liz examiner conversation — upgrade to unlock"}
                  </div>
                </div>
                <Arrow small />
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function MockTestFrameWith4Grid({
  navigate,
  lastMockLabel,
  eyebrow,
  title,
  description,
  durationLabel,
  ctaLabel,
  mockExamDate,
  onSetMockDate,
  languageWireCode,
}) {
  const mockDateInputRef = useRef(null);
  const mockDateObj = mockExamDate ? new Date(mockExamDate) : null;
  const mockLabel =
    mockDateObj && !Number.isNaN(mockDateObj.getTime())
      ? mockDateObj.toLocaleDateString(languageWireCode || "en-US", {
          month: "short",
          day: "numeric",
        })
      : null;
  const todayIso = new Date().toISOString().slice(0, 10);
  const cambridge = [
    { key: "Reading", route: "/test/reading" },
    { key: "Listening", route: "/test/listening" },
    { key: "Writing", route: "/test/writing" },
    { key: "Speaking", route: "/test/speaking" },
  ];
  return (
    <section className="mock-frame p-8 md:p-10">
      <div className="max-w-[58ch] mb-8">
        <div className="eyebrow mb-3" style={{ color: "hsl(var(--gold-ink))" }}>
          {eyebrow}
        </div>
        <h2 className="display-xl text-[32px] md:text-[40px]">{title}</h2>
        {description && <p className="mt-4 editorial-body">{description}</p>}
        <div className="mt-5 text-sm text-muted flex flex-wrap items-center">
          <span>{durationLabel}</span>
          {lastMockLabel && (
            <>
              <span className="divider-dot" />
              <span>
                Last mock · <span className="text-fg">{lastMockLabel}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-muted mb-3 tracking-wide uppercase">
        Cambridge 19 · Test 1 &amp; Test 2
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cambridge.map((c) => {
          const tone = SKILL_TONE[c.key];
          const Icon = SKILL_ICON[c.key];
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => navigate(c.route)}
              className="aspect-square p-4 text-left transition-transform hover:-translate-y-0.5 relative overflow-hidden"
              style={{
                background: `linear-gradient(160deg, hsl(${tone} / .10) 0%, hsl(var(--surface) / .9) 70%)`,
                border: `1px solid hsl(${tone} / .25)`,
                borderRadius: "1rem",
              }}
            >
              {Icon && (
                <Icon
                  aria-hidden="true"
                  className="absolute pointer-events-none"
                  style={{
                    color: `hsl(${tone})`,
                    opacity: 0.18,
                    top: "18%",
                    right: "-12%",
                    width: "62%",
                    height: "62%",
                    strokeWidth: 1.4,
                  }}
                />
              )}
              <div className="flex flex-col h-full justify-between relative">
                <div className="label" style={{ color: `hsl(${tone})` }}>
                  {c.key}
                </div>
                <div>
                  <div className="font-display text-[22px] leading-none">
                    Cambridge 19
                  </div>
                  <div className="text-xs text-muted mt-1">Test 1 · Test 2</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn btn-gold"
          onClick={() => navigate("/question-bank?fulltests=picker")}
        >
          {ctaLabel}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => {
            const el = mockDateInputRef.current;
            if (!el) return;
            // Modern browsers: showPicker() opens the native date picker.
            // Fallback to .click() for older Safari.
            if (typeof el.showPicker === "function") el.showPicker();
            else el.click();
          }}
          className="text-sm text-muted hover:text-fg underline underline-offset-4"
          style={{ textDecorationColor: "hsl(var(--rule))" }}
        >
          {mockLabel ? `Mock day · ${mockLabel}` : "Schedule mock day"}
        </button>
        {mockLabel && (
          <button
            type="button"
            onClick={() => onSetMockDate && onSetMockDate(null)}
            className="text-xs text-muted hover:text-fg"
            aria-label="Clear mock day"
          >
            Clear
          </button>
        )}
        <input
          ref={mockDateInputRef}
          type="date"
          min={todayIso}
          value={mockExamDate || ""}
          onChange={(e) => onSetMockDate && onSetMockDate(e.target.value || null)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
    </section>
  );
}

function FullMockCard({ tone = "gold", eyebrow, title, description, onClick }) {
  const toneToken = tone === "gold" ? "var(--gold)" : "var(--sky)";
  const inkToken = tone === "gold" ? "var(--gold-ink)" : "var(--sky)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="card text-left p-6 hover:-translate-y-0.5 transition-transform flex items-center justify-between gap-4"
      style={{
        background: `linear-gradient(135deg, hsl(${toneToken} / .14) 0%, hsl(var(--surface) / .9) 65%)`,
        borderColor: `hsl(${toneToken} / .35)`,
      }}
    >
      <div>
        <div className="eyebrow mb-2" style={{ color: `hsl(${inkToken})` }}>
          {eyebrow}
        </div>
        <div className="display-m text-[20px] mb-1">{title}</div>
        <div className="text-sm text-muted">{description}</div>
      </div>
      <Arrow />
    </button>
  );
}

function KnowledgeBaseCards({ navigate }) {
  const tools = [
    { name: "Strategies", route: "/tips", tone: "var(--liz)" },
    { name: "Vocabulary", route: "/vocabulary", tone: "var(--gold-ink)" },
    { name: "Grammar", route: "/grammar", tone: "var(--primary)" },
    { name: "Sample reports", route: "/sample-reports", tone: "var(--sky)" },
  ];
  const courses = [
    { name: "Beginner", band: "Band 2.0–4.5", route: "/beginner-course", tone: "var(--primary)" },
    { name: "Mastery", band: "Band 4.5–6.5", route: "/mastery-course", tone: "var(--sky)" },
    { name: "Advanced", band: "Band 6.5–9.0", route: "/advanced-mastery", tone: "var(--gold-ink)" },
  ];
  return (
    <section className="mb-12 md:mb-16">
      <div className="mb-5">
        <div className="eyebrow mb-2">Knowledge base</div>
        <div className="display-m">Learn the principles, then drill them</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="label mb-4">Learning tools</div>
          <div className="space-y-2">
            {tools.map((tool) => (
              <button
                key={tool.name}
                type="button"
                onClick={() => navigate(tool.route)}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-colors"
                style={{
                  border: "1px solid hsl(var(--rule))",
                  background: `linear-gradient(90deg, hsl(${tool.tone} / .06) 0%, transparent 60%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${tool.tone} / .12) 0%, hsl(${tool.tone} / .03) 80%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${tool.tone} / .06) 0%, transparent 60%)`;
                }}
              >
                <span className="display-m text-[18px]">{tool.name}</span>
                <Arrow small />
              </button>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <div className="label mb-4">Courses</div>
          <div className="space-y-2">
            {courses.map((course) => (
              <button
                key={course.name}
                type="button"
                onClick={() => navigate(course.route)}
                className="w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-colors"
                style={{
                  border: "1px solid hsl(var(--rule))",
                  background: `linear-gradient(90deg, hsl(${course.tone} / .06) 0%, transparent 60%)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${course.tone} / .12) 0%, hsl(${course.tone} / .03) 80%)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, hsl(${course.tone} / .06) 0%, transparent 60%)`;
                }}
              >
                <div>
                  <div className="display-m text-[18px]">{course.name}</div>
                  <div className="text-xs text-muted mt-0.5">{course.band}</div>
                </div>
                <Arrow small />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Arrow({ small = false }) {
  const size = small ? 16 : 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "hsl(var(--muted-fg))", flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// DashboardPlansBanner
//
// Slim collapsed strip that shows the user's current plan and lets them
// expand the live PlanCards grid in place — same component the /pricing
// page renders, wrapped in .pricing-scope so the design-system tokens
// stay isolated from the Dashboard theme. A "See full pricing" link
// jumps to /pricing for the complete page (FAQ, slider, compare table).
//
// Accordion is closed by default to keep the dashboard quiet for paid
// users; one click expands it for upgrade browsing without a full
// page navigation.
// ──────────────────────────────────────────────────────────────────────────
// Mirrors AppShellNav.planLabel + Profile.js — V1 GE plan IDs map to the
// closest V2 IELTS Ace tier so the badge stays V2-pure across the surface.
const LEGACY_PLAN_ALIAS_DASH = {
  explorer: "free",
  learner: "weekly",
  achiever: "monthly",
  master: "monthly",
  pro: "monthly",
};
const PLAN_LABEL_DASH = {
  free: "Free",
  weekly: "Weekly",
  monthly: "Monthly",
  exam: "Exam Pack",
  exam_pack: "Exam Pack",
  custom: "Custom",
};

function DashboardPlansBanner({ user }) {
  const [open, setOpen] = useState(false);
  const rawPlan = (user?.plan || "free").toLowerCase();
  const planKey = LEGACY_PLAN_ALIAS_DASH[rawPlan] || rawPlan;
  const planLabel = PLAN_LABEL_DASH[planKey] || planKey;

  return (
    <section className="mb-14 md:mb-20" aria-label="Plans">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
          aria-expanded={open}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] uppercase tracking-wide font-bold text-gray-500">
              Current plan
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-800 border border-indigo-200">
              {planLabel}
            </span>
            <span className="hidden sm:inline text-xs text-gray-500 truncate">
              · Compare plans or upgrade without leaving this page
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 flex-shrink-0">
            {open ? "Hide plans" : "View plans"}
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {open && (
          <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50/60 to-white">
            {/* pricing-scope keeps the design-system tokens local to the cards */}
            <div className="pricing-scope px-2 sm:px-4 py-4">
              <PlanCards user={user} />
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end">
              <a
                href="/pricing"
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1"
              >
                See full pricing page
                <Arrow small />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
