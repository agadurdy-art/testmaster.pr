import React, { useState } from "react";
import "../dashboard.css";
import DashboardTopBar from "./DashboardTopBar";
import DashboardBottomNav from "./DashboardBottomNav";
import DashboardMobileDrawer from "./DashboardMobileDrawer";
import { useTheme, THEME_MODES } from "../../../contexts/ThemeContext";

/**
 * DashboardLayout wraps every authenticated dashboard view.
 * Applies the scoped stylesheet, theme class, sticky top bar, and fixed
 * mobile bottom nav. Children render inside the <main> content container.
 */
export default function DashboardLayout({
  children,
  activeSection = "dashboard",
  activeMobileTab = "home",
  user,
  onMobileTab,
  onLogout,
}) {
  // Bridge to the global ThemeContext so the dashboard scope respects whatever
  // mode the user picks (Light / Dark / Night-shift / Auto), and the choice is
  // shared with the rest of the app.
  const { themeMode, activeTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const themeClass =
    activeTheme === THEME_MODES.DARK
      ? "theme-dark"
      : activeTheme === THEME_MODES.NIGHT_SHIFT
      ? "theme-night"
      : "";

  return (
    <div className={`dashboard-scope ${themeClass}`}>
      <DashboardTopBar
        activeSection={activeSection}
        user={user}
        onOpenMenu={() => setMenuOpen(true)}
        theme={themeMode}
        onThemeChange={setTheme}
      />
      {/* Content width widened 1160→1320 (+xl padding): the narrow column left
          big empty gutters on laptop/desktop. Layout & colours unchanged. */}
      <main className="max-w-[1320px] mx-auto px-6 md:px-10 xl:px-14 pt-14 md:pt-20 pb-20 body-pad-bottom">
        {children}
      </main>
      <DashboardBottomNav active={activeMobileTab} onNavigate={onMobileTab} />
      <DashboardMobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={onLogout}
      />
    </div>
  );
}
