import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Breadcrumb + title + meta + band tabs header block for sample report pages.
 *
 * Props:
 *   crumbs: [{ label, href? }] — last item is the current page
 *   title: JSX (allow inline spans for the band color accent)
 *   description: string
 *   meta: [{ label, value, live?: boolean }]
 *   activeBand: "5.0" | "6.5" | "8.0"
 *   tabs: [{ band, label, href }]
 *   pitch: string shown next to the tabs
 */
export default function SampleReportHero({
  crumbs,
  title,
  description,
  meta,
  activeBand,
  tabs,
  pitch,
  className,
}) {
  return (
    <section
      className={cn("mx-auto max-w-7xl px-5 sm:px-8 pt-8 pb-6", className)}
    >
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="text-[13px] text-slate-500 flex flex-wrap items-center gap-1.5"
      >
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <ChevronRight className="w-3 h-3 shrink-0" aria-hidden />
              )}
              {last || !c.href ? (
                <span className="text-slate-900 font-medium">{c.label}</span>
              ) : (
                <a href={c.href} className="hover:text-slate-900">
                  {c.label}
                </a>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Title + meta */}
      <div className="mt-4 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div className="max-w-3xl">
          <h1
            className="font-bold text-[36px] sm:text-[44px] leading-[1.05] tracking-tight text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-3 text-[16px] text-slate-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {meta && meta.length > 0 && (
          <dl className="grid grid-cols-3 gap-x-6 gap-y-1 text-[13px] min-w-[280px]">
            {meta.map((m, i) => (
              <React.Fragment key={i}>
                <dt className="text-slate-500">{m.label}</dt>
                <dd className="col-span-2 font-medium flex items-center gap-1.5">
                  {m.live && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"
                      style={{ animation: "pulseDot 1.8s ease-in-out infinite" }}
                      aria-hidden
                    />
                  )}
                  {m.value}
                </dd>
              </React.Fragment>
            ))}
          </dl>
        )}
      </div>

      {/* Sample band tabs */}
      {tabs && tabs.length > 0 && (
        <div
          className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3"
          role="tablist"
          aria-label="Choose a sample band"
        >
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 self-start">
            {tabs.map((t) => {
              const active = t.band === activeBand;
              return (
                <a
                  key={t.band}
                  href={t.href}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2",
                    active
                      ? "bg-white text-emerald-800 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_2px_8px_rgba(15,23,42,0.05)]"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Band {t.band}
                  <span
                    className={cn(
                      "text-[11px] font-normal",
                      active ? "text-emerald-700/80" : "text-slate-400"
                    )}
                  >
                    {t.label}
                  </span>
                </a>
              );
            })}
          </div>
          {pitch && (
            <div className="text-[13px] text-slate-500 sm:ml-3">{pitch}</div>
          )}
        </div>
      )}

      {/* Local keyframes (pulse-dot) for the meta live indicator. */}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
