// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";
import { Sparkles, Lock } from "lucide-react";
import { isSpeakingPremiumUser } from "../../../../../lib/planAccess";
import { SKILL_TONE } from "../constants";
import Arrow from "./Arrow";

export default function SmartPracticeList({ skills, user, onPick, onSpeakingPremium }) {
  // Canonical IELTS test-day order. Matches the TopBar Practice dropdown
  // (Listening → Reading → Writing → Speaking) so the dashboard and the
  // global nav don't show two different orderings of the same skills —
  // user feedback 2026-05-23 ("confusing, ayni siralama degil").
  const order = ["Listening", "Reading", "Writing", "Speaking"];
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

          // Liz Examiner card is injected at the end of the list, under
          // Speaking — Liz Examiner is a live speaking tool so it sits next
          // to its sibling skill. Earlier it sat under Listening when the
          // list ran W-R-S-L; after the 2026-05-23 reorder to canonical
          // L-R-W-S we keep Liz Examiner as the final row. Premium tiers
          // (monthly + exam) get the live entry; free / weekly see a locked
          // appearance with a short conversion blurb.
          if (key !== "Speaking") return row;

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
