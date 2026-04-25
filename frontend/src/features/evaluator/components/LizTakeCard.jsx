import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "../../../lib/utils";
import CanonicalLizAvatar from "../../landing/components/LizAvatar";

/**
 * Violet "Liz take" summary card — the AI coach's short message and a
 * primary CTA. Liz is the IELTS Ace AI guide; her messages always sit on
 * soft violet backgrounds across the product.
 */
export default function LizTakeCard({
  message,
  primaryCta = { label: "Practice body 2", href: "#" },
  secondaryCta = { label: "See Band 7+ rewrite", href: "#" },
  onPrimary,
  onSecondary,
  className,
}) {
  return (
    <section
      className={cn(
        "rounded-2xl p-5 lg:p-6",
        "bg-gradient-to-br from-violet-50 via-violet-50 to-indigo-50",
        "border border-violet-200/70",
        "flex gap-4 items-start",
        className
      )}
      aria-label="Liz AI coach summary"
    >
      <CanonicalLizAvatar size={48} ring className="shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-violet-700 uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          Liz · your AI IELTS coach
        </div>
        <p
          className="mt-2 text-violet-950 leading-relaxed"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px" }}
        >
          &ldquo;{message}&rdquo;
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={onPrimary}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2",
              "bg-violet-700 text-white text-sm font-medium",
              "hover:bg-violet-800",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
              "transition-colors"
            )}
          >
            {primaryCta.label}
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onSecondary}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2",
              "bg-white text-violet-800 text-sm font-medium",
              "border border-violet-200",
              "hover:bg-violet-50",
              "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2",
              "transition-colors"
            )}
          >
            {secondaryCta.label}
          </button>
        </div>
      </div>
    </section>
  );
}

