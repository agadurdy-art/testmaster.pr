import React, { useState } from "react";
import "../dashboard.css";
import DashboardTopBar from "./DashboardTopBar";
import DashboardSideNav from "./DashboardSideNav";
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
      {/* Persistent left rail (desktop ≥ lg). Below lg the bottom nav + mobile
          drawer take over and this is hidden. */}
      <DashboardSideNav user={user} />

      {/* Everything else shifts right of the 264px rail on lg. */}
      <div className="lg:pl-[264px]">
        <DashboardTopBar
          activeSection={activeSection}
          user={user}
          onOpenMenu={() => setMenuOpen(true)}
          theme={themeMode}
          onThemeChange={setTheme}
        />
        {/* Content widened (the old 1160 column left big empty gutters). With the
            rail present, cap a touch wider and keep it centred in the remaining
            space. Layout & colours unchanged. */}
        <main className="max-w-[1280px] mx-auto px-6 md:px-10 pt-14 md:pt-20 pb-20 body-pad-bottom">
          {children}
        </main>
      </div>

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
