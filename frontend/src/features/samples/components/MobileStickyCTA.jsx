import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../../lib/utils";

/**
 * Mobile-only sticky CTA bar. Hidden on md+ because the page already has a
 * persistent Try-free button in the top nav. Add `pb-24` to the page body
 * on mobile so content doesn't sit under the fixed bar.
 */
export default function MobileStickyCTA({
  href = "#cta",
  label = "Score my essay — free",
  className,
}) {
  return (
    <div
      className={cn(
        "fixed left-3 right-3 bottom-3 z-30",
        "flex md:hidden print:hidden",
        className
      )}
    >
      <a
        href={href}
        className={cn(
          "flex-1 inline-flex items-center justify-center gap-2",
          "bg-emerald-600 hover:bg-emerald-700 text-white",
          "font-semibold text-[15px] px-5 py-3.5 rounded-xl",
          "shadow-[0_4px_14px_rgba(15,23,42,0.06),0_16px_40px_-12px_rgba(15,23,42,0.12)]"
        )}
      >
        {label}
        <ArrowRight className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}
