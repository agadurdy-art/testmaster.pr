import React from "react";
import { useI18n } from "../../../lib/i18n";

/**
 * Floating theme switch — controls the parent DashboardPage theme state.
 * Persistence is the parent's responsibility (see useDashboardTheme).
 */
export default function ThemeSwitch({ theme, onChange }) {
  const { t } = useI18n();
  const options = [
    { key: "light", label: t("dashboardV2ThemeLight") },
    { key: "dark", label: t("dashboardV2ThemeDark") },
    { key: "night", label: t("dashboardV2ThemeNight") },
  ];
  return (
    <div className="fixed top-[84px] right-6 z-30 hidden md:flex gap-0 p-0.5 rounded-full glass-chip text-xs">
      {options.map((o) => {
        const on = theme === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className="px-3 py-1 rounded-full transition-colors"
            style={{
              background: on ? "hsl(var(--primary) / .12)" : "transparent",
              color: on ? "hsl(var(--primary-ink))" : undefined,
              borderColor: on ? "hsl(var(--primary) / .3)" : undefined,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
