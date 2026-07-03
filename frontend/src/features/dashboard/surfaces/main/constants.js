// Module-level constants extracted verbatim from pages/DashboardPage.js (Faz1 refactor).
import { BookOpen, Headphones, PenLine, Mic } from "lucide-react";

// Skill → background watermark icon for the Cambridge mock cards.
const SKILL_ICON = {
  Reading: BookOpen,
  Listening: Headphones,
  Writing: PenLine,
  Speaking: Mic,
};

const DAY_MS = 24 * 60 * 60 * 1000;
const SKILL_KEYS = ["Listening", "Reading", "Writing", "Speaking"];

// Skill → accent token. Keeps each skill consistently coloured across the
// Smart Practice list, Cambridge 19 grid, and any per-skill chips.
const SKILL_TONE = {
  Listening: "var(--liz)",
  Reading: "var(--sky)",
  Writing: "var(--gold-ink)",
  Speaking: "var(--primary)",
};

export { SKILL_ICON, DAY_MS, SKILL_KEYS, SKILL_TONE };
