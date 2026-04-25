import React from "react";

/**
 * Editorial masthead — greeting + one-line editorial pitch.
 * Designed to feel like the top of a longform article, not a dashboard header.
 */
export default function EditorialMasthead({
  dateLabel,
  daysToExamLabel,
  greeting,
  subhead,
}) {
  return (
    <section className="mb-8 md:mb-12">
      <div className="label mb-3">
        {dateLabel}
        {daysToExamLabel && (
          <>
            <span className="divider-dot" />
            {daysToExamLabel}
          </>
        )}
      </div>
      <h1 className="display-xxl text-[28px] md:text-[36px] max-w-[20ch]">
        {greeting}
      </h1>
      {subhead && (
        <p className="mt-3 text-[14px] md:text-[15px] text-muted max-w-[52ch] leading-relaxed">
          {subhead}
        </p>
      )}
    </section>
  );
}
