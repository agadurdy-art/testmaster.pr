import React from "react";

/**
 * "Jump back in" — editorial index of 4 practice tiles. Hairline top/bottom
 * borders + vertical dividers on desktop; stacked with horizontal dividers
 * on mobile.
 *
 * tiles: [{ status, title, subtitle, progressLabel, ctaLabel, href }]
 */
export default function PracticeIndex({
  tiles = [],
  eyebrow = "Practice",
  title = "Jump back in.",
  bankHref = "#",
}) {
  return (
    <section className="mb-14 md:mb-20">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="label mb-3">{eyebrow}</div>
          <h2 className="display-l text-[30px] md:text-[36px]">{title}</h2>
        </div>
        <a
          href={bankHref}
          className="text-sm text-muted hover:text-fg underline underline-offset-4"
          style={{ textDecorationColor: "hsl(var(--rule))" }}
        >
          Question bank
        </a>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x border-t border-b hairline"
        style={{ borderColor: "hsl(var(--rule))" }}
      >
        {tiles.map((tile) => (
          <PracticeTile key={tile.title} tile={tile} />
        ))}
      </div>
    </section>
  );
}

function PracticeTile({ tile }) {
  const { status, title, subtitle, progressLabel, ctaLabel, href } = tile;
  return (
    <a
      href={href || "#"}
      className="block text-left p-7 transition-colors"
      onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--fg) / 0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div className="label mb-4 text-[10px]">{status}</div>
      <h3 className="font-display text-[24px]">{title}</h3>
      <p className="text-sm text-muted mt-2">{subtitle}</p>
      <div className="mt-8 text-sm">
        <span className="text-muted">{progressLabel}</span>
        <span className="ml-3" style={{ color: "hsl(var(--primary-ink))" }}>
          {ctaLabel} →
        </span>
      </div>
    </a>
  );
}
