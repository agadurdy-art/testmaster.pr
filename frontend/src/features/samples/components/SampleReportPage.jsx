import React from "react";
import { cn } from "../../../lib/utils";
import PublicNav from "./PublicNav";
import SampleBanner from "./SampleBanner";
import SampleReportHero from "./SampleReportHero";
import AnnotatedEssayPanel from "./AnnotatedEssayPanel";
import PublicScoreCard from "./PublicScoreCard";
import SampleFAQ, { DEFAULT_SAMPLE_FAQ } from "./SampleFAQ";
import OgPreviewCard from "./OgPreviewCard";
import PublicFooter from "./PublicFooter";
import MobileStickyCTA from "./MobileStickyCTA";

/**
 * Sample Report page shell — composes every section from the Claude Design
 * handoff. Generic over the three planned variants (Band 5.0 / 6.5 / 8.0):
 * pass a different `result`, `essay`, and `hero` config for each page.
 */
export default function SampleReportPage({
  hero,
  essay,
  result,
  lizMessage,
  faqItems = DEFAULT_SAMPLE_FAQ,
  og,
  footerSlug,
  className,
}) {
  return (
    <div className={cn("min-h-screen bg-slate-50 pb-24 md:pb-0", className)}>
      <PublicNav />
      <SampleBanner />

      <SampleReportHero
        crumbs={hero.crumbs}
        title={hero.title}
        description={hero.description}
        meta={hero.meta}
        activeBand={hero.activeBand}
        tabs={hero.tabs}
        pitch={hero.pitch}
      />

      {/* Two-panel evaluator */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6">
          <AnnotatedEssayPanel
            essayText={essay.text}
            annotations={result.inline_annotations}
            taskBadge={essay.taskBadge}
            topicLabel={essay.topicLabel}
            timeTarget={essay.timeTarget}
            prompt={essay.prompt}
            wordCount={result.word_count}
            wordCountTarget={result.word_count_target}
            readTimeMinutes={essay.readTimeMinutes}
          />
          <PublicScoreCard
            result={result}
            targetBand={7.0}
            lizMessage={lizMessage}
          />
        </div>
      </section>

      {/* ConversionBlock removed — the global "Try free" CTA in PublicNav +
          MobileStickyCTA already covers conversion. A discount-code email
          capture may replace this later; see backlog memory. */}

      <SampleFAQ items={faqItems} />

      {og && (
        <OgPreviewCard
          url={og.url}
          ogImagePath={og.imagePath}
          result={result}
          taskTag={og.taskTag}
          quote={og.quote}
        />
      )}

      <PublicFooter currentSampleSlug={footerSlug} />

      <MobileStickyCTA />
    </div>
  );
}
