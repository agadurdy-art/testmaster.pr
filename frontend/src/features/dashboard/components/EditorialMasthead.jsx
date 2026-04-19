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
    <section className="mb-14 md:mb-20">
      <div className="label mb-5">
        {dateLabel}
        {daysToExamLabel && (
          <>
            <span className="divider-dot" />
            {daysToExamLabel}
          </>
        )}
      </div>
      <h1 className="display-xxl text-[48px] md:text-[72px] max-w-[16ch]">
        {greeting}
      </h1>
      {subhead && (
        <p className="mt-6 text-[17px] md:text-[18px] text-muted max-w-[46ch] leading-relaxed">
          {subhead}
        </p>
      )}
    </section>
  );
}
