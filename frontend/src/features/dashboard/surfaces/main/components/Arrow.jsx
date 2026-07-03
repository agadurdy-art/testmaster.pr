// Extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import React from "react";

export default function Arrow({ small = false }) {
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
